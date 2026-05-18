#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import process from 'node:process'

const checks = [
  {
    name: 'governance assets',
    command: ['pnpm', 'governance:validate'],
  },
  {
    name: 'AI architecture guard',
    command: ['pnpm', 'ai:guard', '--', '--format=json'],
  },
  {
    name: 'architecture boundaries',
    command: ['pnpm', 'arch:boundaries'],
  },
  {
    name: 'runtime leak detection',
    command: ['pnpm', 'arch:runtime'],
  },
  {
    name: 'API snapshot compatibility',
    command: ['pnpm', 'api:report'],
  },
  {
    name: 'supply-chain policy',
    command: ['pnpm', 'supply:check'],
  },
  {
    name: 'release topology',
    command: ['pnpm', 'release:governance'],
  },
  {
    name: 'GitHub workflow registry hygiene',
    command: ['node', 'scripts/governance/check-github-workflow-registry.mjs'],
  },
  {
    name: 'governance report generation',
    command: ['pnpm', 'arch:report'],
  },
]

const generatedArtifactPaths = ['docs/generated', '.ai/generated', '.ai/governance/api-snapshots']

function runCheck(check) {
  console.log(`\n[gate] ${check.name}`)
  const result = spawnSync(check.command[0], check.command.slice(1), {
    cwd: process.cwd(),
    encoding: 'utf8',
    stdio: 'inherit',
  })

  if (result.status === 0) return true
  console.error(`\n[gate:fail] ${check.name}`)
  if (check.failure) console.error(check.failure)
  return false
}

function gitSnapshot() {
  const result = spawnSync('git', ['status', '--porcelain', '--', ...generatedArtifactPaths], {
    cwd: process.cwd(),
    encoding: 'utf8',
    stdio: 'pipe',
  })
  if (result.status !== 0) return null
  return result.stdout.trim()
}

const generatedBefore = gitSnapshot()
let ok = true
for (const check of checks) {
  ok = runCheck(check) && ok
  if (!ok) break
}

if (ok) {
  console.log('\n[gate] governance artifact sync')
  const generatedAfter = gitSnapshot()
  if (generatedBefore !== generatedAfter) {
    console.error('\n[gate:fail] governance artifact sync')
    console.error(
      'Generated governance artifacts changed during the gate. Run pnpm governance:gate locally and commit updated docs/generated, .ai/generated, and .ai/governance/api-snapshots outputs.'
    )
    ok = false
  }
}

if (!ok) process.exit(1)
console.log('\n[gate:pass] unified governance gate passed')
