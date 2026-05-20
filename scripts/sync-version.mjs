#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

console.warn('[version-sync] Legacy wrapper: delegating to pnpm project:sync.')
const result = spawnSync('pnpm', ['project:sync'], {
  cwd: root,
  stdio: 'inherit',
  shell: process.platform === 'win32',
})

process.exit(result.status ?? 1)
