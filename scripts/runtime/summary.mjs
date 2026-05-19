#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, relative } from 'node:path'
import { spawnSync } from 'node:child_process'
import process from 'node:process'

const root = process.cwd()
const run = (command, args) => spawnSync(command, args, { cwd: root, encoding: 'utf8', stdio: 'pipe' })
const output = result => [result.stdout, result.stderr].filter(Boolean).join('\n').trim()
const first = result => output(result).split('\n').find(Boolean) ?? 'unavailable'
const status = result => result.status === 0 ? 'ok' : 'unavailable'
const read = rel => existsSync(rel) ? readFileSync(rel) : Buffer.from('')
const hashFiles = files => {
  const hash = createHash('sha256')
  for (const file of files) {
    hash.update(file)
    hash.update('\0')
    hash.update(read(file))
    hash.update('\0')
  }
  return hash.digest('hex')
}

const node = run('node', ['-v'])
const pnpm = run('pnpm', ['-v'])
const turbo = run('pnpm', ['exec', 'turbo', '--version'])
const mise = run('bash', ['-lc', 'command -v mise >/dev/null 2>&1 && mise --version || true'])
const workspace = run('pnpm', ['root', '-w'])
const fingerprintFiles = ['package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml', 'turbo.json', 'mise.toml']
const fingerprint = hashFiles(fingerprintFiles)

const summary = {
  schemaVersion: 1,
  generatedBy: 'scripts/runtime/summary.mjs',
  workspaceRoot: workspace.status === 0 && first(workspace).endsWith('/node_modules') ? dirname(first(workspace)) : root,
  node: { status: status(node), version: first(node) },
  pnpm: { status: status(pnpm), version: first(pnpm) },
  turbo: { status: status(turbo), version: first(turbo) },
  mise: { status: output(mise) ? 'ok' : 'unavailable', version: first(mise) },
  fingerprint: {
    algorithm: 'sha256',
    value: fingerprint,
    inputs: fingerprintFiles.map(file => relative(root, file)),
  },
}

console.log('[runtime-summary] workspace root:', summary.workspaceRoot)
console.log('[runtime-summary] node:', summary.node.version)
console.log('[runtime-summary] pnpm:', summary.pnpm.version)
console.log('[runtime-summary] turbo:', summary.turbo.version)
console.log('[runtime-summary] mise:', summary.mise.version)
console.log('[runtime-summary] fingerprint:', summary.fingerprint.value)

if (status(node) !== 'ok' || status(pnpm) !== 'ok' || status(turbo) !== 'ok' || workspace.status !== 0) process.exit(1)
