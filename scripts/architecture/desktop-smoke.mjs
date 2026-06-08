#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const repoRoot = fileURLToPath(new URL('../../', import.meta.url))
const mode = process.argv[2] ?? 'all'
const validModes = new Set(['all', 'dev', 'release'])
const TAURI_DEV_TIMEOUT_MS = 180_000
const TAURI_RELEASE_TIMEOUT_MS = 300_000

if (!validModes.has(mode)) {
  console.error(`[desktop-smoke] Unknown mode "${mode}". Expected one of: all, dev, release.`)
  process.exit(1)
}

function runCommand(label, command, args, timeout) {
  console.log(`[desktop-smoke] ${label}`)

  const result = spawnSync(command, args, {
    cwd: repoRoot,
    env: process.env,
    stdio: 'inherit',
    timeout,
  })

  if (result.error) {
    const suffix = result.error.code === 'ETIMEDOUT' ? ` timed out after ${timeout}ms` : ''
    console.error(`[desktop-smoke] ${label}${suffix}: ${result.error.message}`)
    process.exit(1)
  }

  if (typeof result.status === 'number' && result.status !== 0) {
    console.error(`[desktop-smoke] ${label} exited with status ${result.status}.`)
    process.exit(result.status)
  }

  if (result.signal) {
    console.error(`[desktop-smoke] ${label} terminated by signal ${result.signal}.`)
    process.exit(1)
  }
}

function runStep(label, args, timeout) {
  runCommand(label, 'pnpm', args, timeout)
}

function runPreflight() {
  runStep('sync desktop config', ['sync:desktop-config'])
  runStep('desktop security guard', ['desktop:security'])
}

function runDevSmoke() {
  runStep(
    'tauri dev cli smoke',
    [
      '--filter',
      '@ccd/desktop',
      'exec',
      'tauri',
      'dev',
      '--no-watch',
      '--no-dev-server',
      '--no-dev-server-wait',
      '--runner',
      'true',
      '--config',
      JSON.stringify({ build: { beforeDevCommand: '' } }),
    ],
    TAURI_DEV_TIMEOUT_MS
  )

  runCommand(
    'tauri dev cargo check',
    'cargo',
    [
      'check',
      '--manifest-path',
      'apps/desktop/src-tauri/Cargo.toml',
      '--locked',
      '--no-default-features',
    ],
    TAURI_DEV_TIMEOUT_MS
  )
}

function runReleaseSmoke() {
  runStep(
    'tauri release compile smoke',
    ['--filter', '@ccd/desktop', 'exec', 'tauri', 'build', '--no-bundle', '--ci'],
    TAURI_RELEASE_TIMEOUT_MS
  )
}

runPreflight()

if (mode === 'all' || mode === 'dev') {
  runDevSmoke()
}

if (mode === 'all' || mode === 'release') {
  runReleaseSmoke()
}
