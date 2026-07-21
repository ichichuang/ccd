#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import process from 'node:process'

const result = spawnSync(
  'pnpm',
  ['exec', 'lint-staged', '--no-stash', '--no-hide-partially-staged'],
  { cwd: process.cwd(), stdio: 'inherit' }
)

process.exit(result.status ?? 1)
