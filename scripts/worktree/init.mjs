#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import process from 'node:process'

const steps = [
  ['pnpm', ['ai:sync']],
  ['pnpm', ['ai:sync:codex']],
  ['pnpm', ['governance:snapshot']],
  ['pnpm', ['codex:cache:fingerprint']],
  ['pnpm', ['governance:verify']],
]

let failed = false
for (const [command, args] of steps) {
  const label = `${command} ${args.join(' ')}`
  console.log(`[worktree:init] ${label}`)
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    stdio: 'inherit',
    env: process.env,
  })
  if (result.status !== 0) {
    console.error(`[worktree:init] failed: ${label}`)
    failed = true
    break
  }
}

if (failed) {
  console.error('[worktree:init] repair failed. Fix the failing step above; do not bypass hooks with --no-verify.')
  process.exit(1)
}

console.log('[worktree:init] ready')
