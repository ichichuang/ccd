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
import { fileURLToPath } from 'node:url'
import { mkdirSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const MAIN_BRANCH = process.env.MAIN_BRANCH || 'main'
const DESKTOP_BRANCH = process.env.DESKTOP_BRANCH || 'feat/tauri-integration'
const SKIP_TYPECHECK = process.env.SKIP_TYPECHECK === '1'
const DRY_RUN = process.env.DRY_RUN === '1'

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

function writeDesktopLocalePlaceholders() {
  const zhPath = join(ROOT, 'src/locales/lang/example/zh-CN.ts')
  const enPath = join(ROOT, 'src/locales/lang/example/en-US.ts')
  mkdirSync(dirname(zhPath), { recursive: true })
  writeFileSync(zhPath, DESKTOP_LOCALE_EXAMPLE_ZH, 'utf8')
  writeFileSync(enPath, DESKTOP_LOCALE_EXAMPLE_EN, 'utf8')
}

function main() {
  console.log(
    `[sync-main-to-desktop] Start: main=${MAIN_BRANCH}, desktop=${DESKTOP_BRANCH}, skipTypecheck=${SKIP_TYPECHECK}, dryRun=${DRY_RUN}`
  )

  run('git', ['fetch', 'origin', MAIN_BRANCH, DESKTOP_BRANCH])
  run('git', ['checkout', '-B', DESKTOP_BRANCH, `origin/${DESKTOP_BRANCH}`])

  const baseSha = output('git', ['rev-parse', 'HEAD'])
  console.log(`[sync-main-to-desktop] Desktop base SHA: ${baseSha}`)

  const merge = runAllowFail('git', ['merge', '--no-ff', '--no-commit', `origin/${MAIN_BRANCH}`])
  if (merge.status !== 0) {
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

  const unresolved = output('git', ['diff', '--name-only', '--diff-filter=U'])
  if (unresolved) {
    console.error('[sync-main-to-desktop] Unresolved conflicts remain:\n' + unresolved)
    runAllowFail('git', ['merge', '--abort'])
    process.exit(2)
  }

  run('git', ['add', '-A'])

  const hasChanges = runAllowFail('git', ['diff', '--cached', '--quiet']).status !== 0
  if (!hasChanges) {
    console.log('[sync-main-to-desktop] No changes after policy filtering. Skip commit/push.')
    return
  }

  if (DRY_RUN) {
    console.log('[sync-main-to-desktop] DRY_RUN enabled: skip type-check/commit/push.')
    return
  }

  if (!SKIP_TYPECHECK) {
    // Ensure dependencies match desktop branch after merge (desktop may have extra packages).
    run('pnpm', ['install', '--frozen-lockfile'])
    run('pnpm', ['type-check'])
  }

  run('git', [
    'commit',
    '-m',
    `chore(sync): merge ${MAIN_BRANCH} into ${DESKTOP_BRANCH} (exclude demos)`,
  ])
  run('git', ['push', 'origin', DESKTOP_BRANCH])
  console.log('[sync-main-to-desktop] Sync completed and pushed.')
}

main()
