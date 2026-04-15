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
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
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
  'src/utils/env.ts',
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
  return runIn(ROOT, cmd, args, options)
}

function runIn(cwd, cmd, args, options = {}) {
  const result = spawnSync(cmd, args, {
    cwd,
    stdio: 'inherit',
    ...options,
  })

  if (result.status !== 0) {
    throw new Error(`[sync-main-to-desktop] Command failed: ${cmd} ${args.join(' ')}`)
  }
}

function runAllowFail(cmd, args, options = {}) {
  return runAllowFailIn(ROOT, cmd, args, options)
}

function runAllowFailIn(cwd, cmd, args, options = {}) {
  return spawnSync(cmd, args, {
    cwd,
    stdio: 'inherit',
    ...options,
  })
}

function outputIn(cwd, cmd, args) {
  const result = spawnSync(cmd, args, {
    cwd,
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
  })
  if (result.status !== 0) {
    const stderr = result.stderr?.trim() || ''
    throw new Error(`[sync-main-to-desktop] Command failed: ${cmd} ${args.join(' ')} ${stderr}`)
  }
  return (result.stdout || '').trim()
}

function captureIn(cwd, cmd, args) {
  const result = spawnSync(cmd, args, {
    cwd,
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
  })
  if (result.status !== 0) {
    const stderr = result.stderr?.trim() || ''
    throw new Error(`[sync-main-to-desktop] Command failed: ${cmd} ${args.join(' ')} ${stderr}`)
  }
  return result.stdout || ''
}

function hasMergeInProgressAt(cwd) {
  return existsSync(join(cwd, '.git', 'MERGE_HEAD'))
}

function ensureCleanWorktree(cwd = ROOT) {
  const status = outputIn(cwd, 'git', ['status', '--porcelain'])
  if (status) {
    throw new Error(
      '[sync-main-to-desktop] Refuse to run with a dirty worktree. Commit, stash, or discard local changes first.'
    )
  }
}

function abortMergeIfNeeded(cwd = ROOT) {
  if (!hasMergeInProgressAt(cwd)) return
  runAllowFailIn(cwd, 'git', ['merge', '--abort'])
}

function removePath(cwd, targetPath) {
  rmSync(join(cwd, targetPath), { recursive: true, force: true })
}

function restorePathFromBase(cwd, baseSha, targetPath) {
  const restore = runAllowFailIn(cwd, 'git', [
    'restore',
    '--source',
    baseSha,
    '--staged',
    '--worktree',
    '--',
    targetPath,
  ])
  if (restore.status === 0) return
  runAllowFailIn(cwd, 'git', ['rm', '-r', '-f', '--ignore-unmatch', '--', targetPath])
}

function normalizeDesktopWorkspaceAfterCheckout(cwd) {
  for (const targetPath of GENERATED_CONTRACT_PATHS) {
    runAllowFailIn(cwd, 'git', ['restore', '--source', 'HEAD', '--staged', '--worktree', '--', targetPath])
  }

  for (const targetPath of GENERATED_OUTPUT_PATHS) {
    runAllowFailIn(cwd, 'git', ['rm', '-r', '-f', '--cached', '--ignore-unmatch', '--', targetPath])
    removePath(cwd, targetPath)
  }

  const status = outputIn(cwd, 'git', ['status', '--porcelain'])
  if (status) {
    throw new Error(
      `[sync-main-to-desktop] Dirty worktree remains after desktop checkout:\n${status}`
    )
  }
}

function writeDesktopLocalePlaceholders(cwd) {
  const zhPath = join(cwd, 'src/locales/lang/example/zh-CN.ts')
  const enPath = join(cwd, 'src/locales/lang/example/en-US.ts')
  mkdirSync(dirname(zhPath), { recursive: true })
  writeFileSync(zhPath, DESKTOP_LOCALE_EXAMPLE_ZH, 'utf8')
  writeFileSync(enPath, DESKTOP_LOCALE_EXAMPLE_EN, 'utf8')
}

function mergeDesktopPackageJson(cwd, baseSha) {
  const mainPkg = JSON.parse(captureIn(cwd, 'git', ['show', `origin/${MAIN_BRANCH}:package.json`]))
  const desktopBasePkg = JSON.parse(captureIn(cwd, 'git', ['show', `${baseSha}:package.json`]))
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
  writeFileSync(join(cwd, 'package.json'), `${JSON.stringify(mergedPkg, null, 2)}\n`, 'utf8')
}

function createDesktopWorktree() {
  const worktreePath = mkdtempSync(join(tmpdir(), 'ccd-sync-main-to-desktop-'))
  run('git', ['worktree', 'add', '--detach', worktreePath, `origin/${DESKTOP_BRANCH}`])
  return worktreePath
}

function removeDesktopWorktree(worktreePath) {
  if (!worktreePath) return
  runAllowFail('git', ['worktree', 'remove', '--force', worktreePath])
  rmSync(worktreePath, { recursive: true, force: true })
}

function main() {
  let worktreePath = ''

  console.log(
    `[sync-main-to-desktop] Start: main=${MAIN_BRANCH}, desktop=${DESKTOP_BRANCH}, skipTypecheck=${SKIP_TYPECHECK}, dryRun=${DRY_RUN}`
  )

  try {
    ensureCleanWorktree()
    run('git', ['fetch', 'origin', MAIN_BRANCH, DESKTOP_BRANCH])
    worktreePath = createDesktopWorktree()
    runIn(worktreePath, 'git', ['checkout', '-B', DESKTOP_BRANCH, `origin/${DESKTOP_BRANCH}`])
    normalizeDesktopWorkspaceAfterCheckout(worktreePath)

    const baseSha = outputIn(worktreePath, 'git', ['rev-parse', 'HEAD'])
    console.log(`[sync-main-to-desktop] Desktop base SHA: ${baseSha}`)

    const merge = runAllowFailIn(worktreePath, 'git', ['merge', '--no-ff', '--no-commit', `origin/${MAIN_BRANCH}`])
    if (merge.status !== 0) {
      if (!hasMergeInProgressAt(worktreePath)) {
        const status = outputIn(worktreePath, 'git', ['status', '--short'])
        throw new Error(
          `[sync-main-to-desktop] Merge failed before conflict state:\n${status || '(no local diff)'}`
        )
      }
      console.log('[sync-main-to-desktop] Merge reported conflicts, applying auto-resolution policy...')
    }

    // 1) 全量剥离示例页面与示例路由模块（桌面端不保留）
    restorePathFromBase(worktreePath, baseSha, 'src/views/example')
    restorePathFromBase(worktreePath, baseSha, 'src/router/modules/example.ts')

    // 2) 桌面端示例 locale 内容置空（保留文件以兼容主分支 locale 聚合导入）
    writeDesktopLocalePlaceholders(worktreePath)
    runIn(worktreePath, 'git', [
      'add',
      'src/locales/lang/example/zh-CN.ts',
      'src/locales/lang/example/en-US.ts',
    ])

    // 3) 若 main 引入示例目录但桌面端历史无该目录，确保不会残留新示例文件
    runAllowFailIn(worktreePath, 'git', ['rm', '-r', '-f', '--ignore-unmatch', '--', 'src/views/example'])
    runAllowFailIn(worktreePath, 'git', ['rm', '-f', '--ignore-unmatch', '--', 'src/router/modules/example.ts'])

    // 4) README 由桌面端分支独立维护，自动同步时保留桌面端版本
    restorePathFromBase(worktreePath, baseSha, 'README.md')

    // 5) 桌面端专属文件保持由桌面分支维护，避免被 main 误删
    for (const targetPath of DESKTOP_ONLY_PATHS) {
      restorePathFromBase(worktreePath, baseSha, targetPath)
    }

    // 6) package.json 采用“主分支基础 + 桌面端增量”的合并策略
    mergeDesktopPackageJson(worktreePath, baseSha)
    runIn(worktreePath, 'git', ['add', 'README.md', 'package.json'])

    const unresolved = outputIn(worktreePath, 'git', ['diff', '--name-only', '--diff-filter=U'])
    if (unresolved) {
      throw new Error(`[sync-main-to-desktop] Unresolved conflicts remain:\n${unresolved}`)
    }

    runIn(worktreePath, 'git', ['add', '-A'])

    const hasChanges = runAllowFailIn(worktreePath, 'git', ['diff', '--cached', '--quiet']).status !== 0
    if (!hasChanges) {
      console.log('[sync-main-to-desktop] No changes after policy filtering. Skip commit/push.')
      abortMergeIfNeeded(worktreePath)
      return
    }

    if (DRY_RUN) {
      console.log('[sync-main-to-desktop] DRY_RUN enabled: skip type-check/commit/push.')
      abortMergeIfNeeded(worktreePath)
      return
    }

    if (!SKIP_TYPECHECK) {
      // Desktop branch intentionally diverges in dependencies/scripts; refresh lockfile before type-check.
      runIn(worktreePath, 'pnpm', ['install', '--no-frozen-lockfile'])
      runIn(worktreePath, 'pnpm', ['type-check'])
    }

    runIn(worktreePath, 'git', [
      'commit',
      '-m',
      `chore(sync): merge ${MAIN_BRANCH} into ${DESKTOP_BRANCH} (exclude demos)`,
    ])
    runIn(worktreePath, 'git', ['push', 'origin', DESKTOP_BRANCH])
    console.log('[sync-main-to-desktop] Sync completed and pushed.')
  } catch (error) {
    abortMergeIfNeeded(worktreePath)
    throw error
  } finally {
    removeDesktopWorktree(worktreePath)
  }
}

main()
