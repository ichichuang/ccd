#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import process from 'node:process'

const result = spawnSync(process.execPath, ['scripts/generate-ai-protocol-adapters.mjs', ...process.argv.slice(2)], {
  cwd: process.cwd(),
  stdio: 'inherit',
})

process.exit(result.status ?? 1)
