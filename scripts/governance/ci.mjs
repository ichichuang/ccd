#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import process from 'node:process'

const steps = [
  ['pnpm', ['governance:verify']],
  ['pnpm', ['codex:transport:validate']],
  ['pnpm', ['codex:provider:inspect']],
  ['pnpm', ['codex:routing:inspect']],
  ['pnpm', ['ai:doctor']],
  ['pnpm', ['drift-check']],
  ['pnpm', ['adapters:validate']],
  ['pnpm', ['orchestration:validate']],
  ['pnpm', ['codex:preflight']],
]

for (const [command, args] of steps) {
  const label = `${command} ${args.join(' ')}`
  console.log(`[governance:ci] ${label}`)
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    stdio: 'inherit',
    env: process.env,
  })
  if (result.status !== 0) {
    console.error(`[governance:ci] failed: ${label}`)
    process.exit(result.status ?? 1)
  }
}

console.log('[governance:ci] passed')
