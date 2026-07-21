#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import process from 'node:process'

const result = spawnSync(
  process.execPath,
  ['scripts/ai-sync-skills.mjs', '--client', 'codex', ...process.argv.slice(2)],
  { cwd: process.cwd(), stdio: 'inherit' }
)
process.exit(result.status ?? 1)
