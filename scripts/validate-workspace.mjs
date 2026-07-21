#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import process from 'node:process'

const mode = process.argv[2] ?? 'fast'
if (!['fast', 'full', 'ci'].includes(mode)) {
  console.error('Usage: node scripts/validate-workspace.mjs <fast|full|ci>')
  process.exit(1)
}

const checks = [
  ['project metadata', ['project:validate']],
  ['type check', ['type-check']],
  ['lint', ['lint:check']],
  ['architecture boundaries', ['arch:boundaries']],
  ['runtime boundaries', ['arch:runtime']],
]

if (mode !== 'fast') {
  checks.push(['web build', ['build:web-demo']], ['desktop build', ['build:desktop']])
}

for (const [label, args] of checks) {
  console.log(`\n[validate] ${label}`)
  const result = spawnSync('pnpm', args, { cwd: process.cwd(), stdio: 'inherit' })
  if (result.status !== 0) process.exit(result.status ?? 1)
}

console.log(`\nWorkspace validation passed (${mode})`)
