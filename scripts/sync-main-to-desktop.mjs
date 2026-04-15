#!/usr/bin/env node

/**
 * Sync main -> desktop branch (exclude demo assets/content)
 *
 * Goals:
 * 1) Merge latest main changes into desktop branch.
 * 2) Keep desktop branch free from demo pages/routes/locales.
 * 3) Auto-commit + push when changes exist.
 */

import { dirname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const MAIN_BRANCH = process.env.MAIN_BRANCH || 'main'
const DESKTOP_BRANCH = process.env.DESKTOP_BRANCH || 'feat/tauri-integration'
const SKIP_TYPECHECK = process.env.SKIP_TYPECHECK === '1'
const DRY_RUN = process.env.DRY_RUN === '1'
const GENERATED_CONTRACT_PATHS = [
  '.eslintrc-auto-import.json',
  'src/types/auto-imports.d.ts',
  'src/types/components.d.ts',
]
const GENERATED_OUTPUT_PATHS = ['playwright-report', 'test-results']
const DESKTOP_ONLY_PATHS = [
  '.github/workflows/build-desktop-windows.yml',
  '.ai/rules/integrations/08-cross-platform-tauri.mdc',
  'scripts/sync-desktop-config.mjs',
  'src-tauri',
  'src/assets/brand/source',
  'src/utils/tauriNativeUx.ts',
  'src/utils/env.ts',
]

const DESKTOP_LOCALE_EXAMPLE_ZH = `/**
 * zh-CN Example Locale Messages (桌面端占位：无示例内容)
 */
const zhCNExample = {
  router: {
    example: {},
  },
}

export { zhCNExample }
export default zhCNExample
`

const DESKTOP_LOCALE_EXAMPLE_EN = `/**
 * en-US Example Locale Messages (Desktop placeholder: no demo content)
 */
const enUSExample = {
  router: {
    example: {},
  },
}

export { enUSExample }
export default enUSExample
`

function run(cmd, args, options = {}) {
  const result = spawnSync(cmd, args, {
    cwd: ROOT,
    stdio: 'inherit',
    ...options,
  })

  if (result.status !== 0) {
    throw new Error(`[sync-main-to-desktop] Command failed: ${cmd} ${args.join(' ')}`)
  }
}

function runAllowFail(cmd, args, options = {}) {
  return spawnSync(cmd, args, {
    cwd: ROOT,
    stdio: 'inherit',
    ...options,
  })
}

function output(cmd, args) {
  const result = spawnSync(cmd, args, {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
  })
  if (result.status !== 0) {
    const stderr = result.stderr?.trim() || ''
    throw new Error(`[sync-main-to-desktop] Command failed: ${cmd} ${args.join(' ')} ${stderr}`)
  }
  return (result.stdout || '').trim()
}

function capture(cmd, args) {
  const result = spawnSync(cmd, args, {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
  })
  if (result.status !== 0) {
    const stderr = result.stderr?.trim() || ''
    throw new Error(`[sync-main-to-desktop] Command failed: ${cmd} ${args.join(' ')} ${stderr}`)
  }
  return result.stdout || ''
}

function hasMergeInProgress() {
  return existsSync(join(ROOT, '.git', 'MERGE_HEAD'))
}

function ensureCleanWorktree() {
  const status = output('git', ['status', '--porcelain'])
  if (status) {
    throw new Error(
      '[sync-main-to-desktop] Refuse to run with a dirty worktree. Commit, stash, or discard local changes first.'
    )
  }
}

function restoreOriginalBranch(originalBranch) {
  if (!originalBranch) return
  const currentBranch = output('git', ['branch', '--show-current'])
  if (currentBranch === originalBranch) return
  run('git', ['checkout', originalBranch])
}

function abortMergeIfNeeded() {
  if (!hasMergeInProgress()) return
  runAllowFail('git', ['merge', '--abort'])
}

function removePath(targetPath) {
  rmSync(join(ROOT, targetPath), { recursive: true, force: true })
}

function restorePathFromBase(baseSha, targetPath) {
  const restore = runAllowFail('git', [
    'restore',
    '--source',
    baseSha,
    '--staged',
    '--worktree',
    '--',
    targetPath,
  ])
  if (restore.status === 0) return
  runAllowFail('git', ['rm', '-r', '-f', '--ignore-unmatch', '--', targetPath])
}

function normalizeDesktopWorkspaceAfterCheckout() {
  for (const targetPath of GENERATED_CONTRACT_PATHS) {
    runAllowFail('git', ['restore', '--source', 'HEAD', '--staged', '--worktree', '--', targetPath])
  }

  for (const targetPath of GENERATED_OUTPUT_PATHS) {
    runAllowFail('git', ['rm', '-r', '-f', '--cached', '--ignore-unmatch', '--', targetPath])
    removePath(targetPath)
  }

  const status = output('git', ['status', '--porcelain'])
  if (status) {
    throw new Error(
      `[sync-main-to-desktop] Dirty worktree remains after desktop checkout:\n${status}`
    )
  }
}

function writeDesktopLocalePlaceholders() {
  const zhPath = join(ROOT, 'src/locales/lang/example/zh-CN.ts')
  const enPath = join(ROOT, 'src/locales/lang/example/en-US.ts')
  mkdirSync(dirname(zhPath), { recursive: true })
  writeFileSync(zhPath, DESKTOP_LOCALE_EXAMPLE_ZH, 'utf8')
  writeFileSync(enPath, DESKTOP_LOCALE_EXAMPLE_EN, 'utf8')
}

function mergeDesktopPackageJson(baseSha) {
  const mainPkg = JSON.parse(capture('git', ['show', `origin/${MAIN_BRANCH}:package.json`]))
  const desktopBasePkg = JSON.parse(capture('git', ['show', `${baseSha}:package.json`]))
  const mainScripts = mainPkg.scripts ?? {}
  const desktopScripts = desktopBasePkg.scripts ?? {}
  const mergedPrebuild = desktopScripts['sync:desktop-config']
    ? `${mainScripts.prebuild} && pnpm sync:desktop-config`
    : mainScripts.prebuild

  const mergedPkg = {
    ...mainPkg,
    name: desktopBasePkg.name,
    version: mainPkg.version,
    author: desktopBasePkg.author,
    description: desktopBasePkg.description,
    keywords: desktopBasePkg.keywords,
    scripts: {
      ...mainScripts,
      ...(desktopScripts['sync:desktop-config']
        ? { 'sync:desktop-config': desktopScripts['sync:desktop-config'] }
        : {}),
      ...(desktopScripts.predev ? { predev: desktopScripts.predev } : {}),
      ...(mergedPrebuild ? { prebuild: mergedPrebuild } : {}),
      ...(desktopScripts.tauri ? { tauri: desktopScripts.tauri } : {}),
      ...(desktopScripts['dev:desktop']
        ? { 'dev:desktop': desktopScripts['dev:desktop'] }
        : {}),
      ...(desktopScripts['build:desktop']
        ? { 'build:desktop': desktopScripts['build:desktop'] }
        : {}),
    },
    dependencies: {
      ...mainPkg.dependencies,
      ...desktopBasePkg.dependencies,
    },
    devDependencies: {
      ...mainPkg.devDependencies,
      ...desktopBasePkg.devDependencies,
    },
  }

  delete mergedPkg.devDependencies['@faker-js/faker']
  writeFileSync(join(ROOT, 'package.json'), `${JSON.stringify(mergedPkg, null, 2)}\n`, 'utf8')
}

function main() {
  const originalBranch = output('git', ['branch', '--show-current'])

  console.log(
    `[sync-main-to-desktop] Start: main=${MAIN_BRANCH}, desktop=${DESKTOP_BRANCH}, skipTypecheck=${SKIP_TYPECHECK}, dryRun=${DRY_RUN}`
  )

  try {
    ensureCleanWorktree()
    run('git', ['fetch', 'origin', MAIN_BRANCH, DESKTOP_BRANCH])
    run('git', ['checkout', '-B', DESKTOP_BRANCH, `origin/${DESKTOP_BRANCH}`])
    normalizeDesktopWorkspaceAfterCheckout()

    const baseSha = output('git', ['rev-parse', 'HEAD'])
    console.log(`[sync-main-to-desktop] Desktop base SHA: ${baseSha}`)

    const merge = runAllowFail('git', ['merge', '--no-ff', '--no-commit', `origin/${MAIN_BRANCH}`])
    if (merge.status !== 0) {
      if (!hasMergeInProgress()) {
        const status = output('git', ['status', '--short'])
        throw new Error(
          `[sync-main-to-desktop] Merge failed before conflict state:\n${status || '(no local diff)'}`
        )
      }
      console.log('[sync-main-to-desktop] Merge reported conflicts, applying auto-resolution policy...')
    }

    // 1) 全量剥离示例页面与示例路由模块（桌面端不保留）
    restorePathFromBase(baseSha, 'src/views/example')
    restorePathFromBase(baseSha, 'src/router/modules/example.ts')

    // 2) 桌面端示例 locale 内容置空（保留文件以兼容主分支 locale 聚合导入）
    writeDesktopLocalePlaceholders()
    run('git', ['add', 'src/locales/lang/example/zh-CN.ts', 'src/locales/lang/example/en-US.ts'])

    // 3) 若 main 引入示例目录但桌面端历史无该目录，确保不会残留新示例文件
    runAllowFail('git', ['rm', '-r', '-f', '--ignore-unmatch', '--', 'src/views/example'])
    runAllowFail('git', ['rm', '-f', '--ignore-unmatch', '--', 'src/router/modules/example.ts'])

    // 4) README 由桌面端分支独立维护，自动同步时保留桌面端版本
    restorePathFromBase(baseSha, 'README.md')

    // 5) 桌面端专属文件保持由桌面分支维护，避免被 main 误删
    for (const targetPath of DESKTOP_ONLY_PATHS) {
      restorePathFromBase(baseSha, targetPath)
    }

    // 6) package.json 采用“主分支基础 + 桌面端增量”的合并策略
    mergeDesktopPackageJson(baseSha)
    run('git', ['add', 'README.md', 'package.json'])

    const unresolved = output('git', ['diff', '--name-only', '--diff-filter=U'])
    if (unresolved) {
      throw new Error(`[sync-main-to-desktop] Unresolved conflicts remain:\n${unresolved}`)
    }

    run('git', ['add', '-A'])

    const hasChanges = runAllowFail('git', ['diff', '--cached', '--quiet']).status !== 0
    if (!hasChanges) {
      console.log('[sync-main-to-desktop] No changes after policy filtering. Skip commit/push.')
      abortMergeIfNeeded()
      return
    }

    if (DRY_RUN) {
      console.log('[sync-main-to-desktop] DRY_RUN enabled: skip type-check/commit/push.')
      abortMergeIfNeeded()
      return
    }

    if (!SKIP_TYPECHECK) {
      // Desktop branch intentionally diverges in dependencies/scripts; refresh lockfile before type-check.
      run('pnpm', ['install', '--no-frozen-lockfile'])
      run('pnpm', ['type-check'])
    }

    run('git', [
      'commit',
      '-m',
      `chore(sync): merge ${MAIN_BRANCH} into ${DESKTOP_BRANCH} (exclude demos)`,
    ])
    run('git', ['push', 'origin', DESKTOP_BRANCH])
    console.log('[sync-main-to-desktop] Sync completed and pushed.')
  } catch (error) {
    abortMergeIfNeeded()
    throw error
  } finally {
    restoreOriginalBranch(originalBranch)
  }
}

main()
