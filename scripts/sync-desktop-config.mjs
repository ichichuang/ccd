#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const cwd = process.cwd()
const desktopPathPrefixes = [
  'apps/desktop/src-tauri/',
  'apps/desktop/src/adapters/index.ts',
]
const requiredDesktopFiles = [
  'apps/desktop/src-tauri/capabilities/default.json',
  'apps/desktop/src-tauri/tauri.conf.json',
]

function runGit(args) {
  const result = spawnSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: 'pipe',
  })
  if (result.status !== 0) return []
  return result.stdout
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
}

function changedFiles() {
  return [
    ...runGit(['diff', '--name-only', '--diff-filter=ACMR']),
    ...runGit(['diff', '--name-only', '--cached', '--diff-filter=ACMR']),
  ]
}

function isDesktopScoped(relPath) {
  return desktopPathPrefixes.some(prefix =>
    prefix.endsWith('/') ? relPath.startsWith(prefix) : relPath === prefix
  )
}

const touchedDesktopFiles = [...new Set(changedFiles())].filter(isDesktopScoped)

if (touchedDesktopFiles.length === 0) {
  console.log('[desktop-config] skipped: no desktop bridge or apps/desktop/src-tauri changes detected.')
  process.exit(0)
}

const missing = requiredDesktopFiles.filter(relPath => !fs.existsSync(path.join(cwd, relPath)))
if (missing.length > 0) {
  console.error('[desktop-config] desktop-scoped changes detected, but required Tauri config is missing:')
  missing.forEach(relPath => console.error(`  - ${relPath}`))
  process.exit(1)
}

console.log('[desktop-config] checked desktop config surfaces:')
requiredDesktopFiles.forEach(relPath => console.log(`  - ${relPath}`))
