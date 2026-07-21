#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import process from 'node:process'

const result = spawnSync(process.execPath, ['scripts/validate-workspace.mjs', 'full'], {
  cwd: process.cwd(),
  stdio: 'inherit',
})

process.exit(result.status ?? 1)
