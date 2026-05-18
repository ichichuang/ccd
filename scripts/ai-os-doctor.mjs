#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'

const strictLocalRuntime =
  process.env.STRICT_LOCAL_RUNTIME === '1' || process.argv.includes('--strict-local-runtime')

const checks = [
  {
    label: 'governance validate',
    command: process.execPath,
    args: ['scripts/governance/validate.mjs'],
    always: true,
  },
  {
    label: 'drift check',
    command: process.execPath,
    args: ['scripts/drift-check.mjs'],
    always: true,
  },
  {
    label: 'AI OS node runtime status',
    command: '/Users/cc/.ai-os/bin/ai-node-runtime-status',
    args: [],
    localOnly: true,
  },
  {
    label: 'AI OS runtime freeze audit',
    command: '/Users/cc/.ai-os/bin/runtime-audit',
    args: ['--strict'],
    localOnly: true,
  },
]

let failed = false

const runCheck = check => {
  if (check.localOnly && !strictLocalRuntime) {
    console.log(`[SKIP] ${check.label}: set STRICT_LOCAL_RUNTIME=1 to enable machine-level checks`)
    return
  }

  if (!fs.existsSync(check.command) && check.command.startsWith('/')) {
    if (check.localOnly) {
      console.log(`[SKIP] ${check.label}: ${check.command} not found on this machine`)
      return
    }
    console.error(`[FAIL] ${check.label}: ${check.command} not found`)
    failed = true
    return
  }

  const env = { ...process.env }
  if (check.localOnly) {
    const shimPath = path.join(os.homedir(), '.local', 'share', 'mise', 'shims')
    const parts = (env.PATH ?? '').split(path.delimiter).filter(Boolean)
    env.PATH = [shimPath, ...parts.filter(item => item !== shimPath)].join(path.delimiter)
  }

  const result = spawnSync(check.command, check.args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    stdio: 'pipe',
    env,
  })

  const output = [result.stdout, result.stderr].filter(Boolean).join('\n').trim()
  if (result.status === 0) {
    console.log(`[OK] ${check.label}`)
    if (output) console.log(output.split('\n').slice(0, 24).join('\n'))
    return
  }

  failed = true
  console.error(`[FAIL] ${check.label}`)
  if (output) console.error(output.split('\n').slice(0, 40).join('\n'))
}

console.log('CCD AI OS Doctor')
console.log('================')
for (const check of checks) runCheck(check)
console.log('----------------')

if (failed) {
  console.error('AI OS doctor failed.')
  process.exit(1)
}

console.log('AI OS doctor passed.')
