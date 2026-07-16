#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import process from 'node:process'

const modes = new Set(['full', 'ci', 'fast'])

const generatedAiArtifacts = ['AGENTS.md', 'CLAUDE.md', '.ai/manifests/skills-lock.json']

function step(name, command, args, options = {}) {
  return { name, command, args, ...options }
}

function run(command, args) {
  return spawnSync(command, args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })
}

function executableForStep(command, args) {
  if (command === 'pnpm') return ['bash', ['scripts/exec.sh', 'pnpm', ...args]]
  return [command, args]
}

function runStep({ name, command, args, allowFailure = false }) {
  const [resolvedCommand, resolvedArgs] = executableForStep(command, args)
  console.log(`\n[validate] ${name}`)
  console.log(`[validate] $ ${[resolvedCommand, ...resolvedArgs].join(' ')}`)

  const result = run(resolvedCommand, resolvedArgs)
  if (result.error) {
    console.error(`[validate:fail] ${name}: ${result.error.message}`)
    if (!allowFailure) process.exit(1)
    return false
  }

  if (typeof result.status === 'number' && result.status !== 0) {
    console.error(`[validate:fail] ${name}: exited with status ${result.status}`)
    if (!allowFailure) process.exit(result.status)
    return false
  }

  if (result.signal) {
    console.error(`[validate:fail] ${name}: terminated by signal ${result.signal}`)
    if (!allowFailure) process.exit(1)
    return false
  }

  console.log(`[validate:pass] ${name}`)
  return true
}

function assertGeneratedAiArtifactsSynced() {
  console.log('\n[validate] generated AI artifact drift check')
  const result = spawnSync('git', ['diff', '--quiet', '--', ...generatedAiArtifacts], {
    cwd: process.cwd(),
    encoding: 'utf8',
    stdio: 'pipe',
  })

  if (result.status === 0) {
    console.log('[validate:pass] generated AI artifact drift check')
    return
  }

  console.error('[validate:fail] generated AI artifact drift check')
  console.error(
    `Generated AI artifacts changed or are stale. Run pnpm ai:sync && pnpm ai:sync:codex, review ${generatedAiArtifacts.join(', ')}, and rerun the gate.`
  )
  const diff = spawnSync('git', ['diff', '--name-only', '--', ...generatedAiArtifacts], {
    cwd: process.cwd(),
    encoding: 'utf8',
    stdio: 'pipe',
  })
  if (diff.stdout.trim()) console.error(diff.stdout.trim())
  process.exit(1)
}

function cargoLockedCheck() {
  return step('desktop Rust validation', 'cargo', [
    'check',
    '--locked',
    '--manifest-path',
    'apps/desktop/src-tauri/Cargo.toml',
  ])
}

const fastSteps = [step('type-check', 'pnpm', ['type-check']), step('lint', 'pnpm', ['lint:check'])]

const ciSteps = [
  step('runtime summary', 'pnpm', ['runtime:summary']),
  step('AI cold-start validation', 'pnpm', ['ai:cold-start:validate']),
  step('AI adapter sync', 'pnpm', ['ai:sync']),
  step('Codex skill sync', 'pnpm', ['ai:sync:codex']),
  step('AI doctor', 'pnpm', ['ai:doctor']),
  step('Codex preflight', 'pnpm', ['codex:preflight']),
  step('dependency catalog check', 'pnpm', ['deps:catalog:check']),
  step('supply-chain check', 'pnpm', ['supply:check']),
  step('GitHub workflow registry check', 'pnpm', ['governance:github-workflows']),
  step('wiki command check', 'pnpm', ['wiki:commands']),
  step('wiki validation', 'pnpm', ['wiki:validate']),
  step('project doctor', 'pnpm', ['project:doctor']),
  step('runtime boundary check', 'pnpm', ['arch:runtime']),
  step('package boundary check', 'pnpm', ['arch:boundaries']),
  step('public API report', 'pnpm', ['api:report']),
  step('governance gate', 'pnpm', ['validate:governance']),
  step('prepare internal packages', 'pnpm', ['ci:prepare-internal']),
  step('type-check', 'pnpm', ['type-check']),
  step('unit tests', 'pnpm', ['test:run']),
  step('lint', 'pnpm', ['lint:check']),
  step('workspace production build', 'pnpm', ['exec', 'turbo', 'run', 'build']),
  step('package resolution smoke', 'pnpm', ['ci:smoke:packages']),
  step('web-demo build', 'pnpm', ['build:web-demo']),
  step('desktop security', 'pnpm', ['desktop:security']),
  step('desktop smoke', 'pnpm', ['desktop:smoke']),
  step('desktop build', 'pnpm', ['build:desktop']),
  step('browser bundle budget', 'pnpm', ['budget:bundles']),
  step('desktop bundle budget', 'pnpm', ['budget:desktop']),
  cargoLockedCheck(),
]

const fullSteps = [
  step('AI cold-start validation', 'pnpm', ['ai:cold-start:validate']),
  step('AI adapter sync', 'pnpm', ['ai:sync']),
  step('AI doctor open ledger', 'pnpm', ['ai:doctor', '--open']),
  step('Codex preflight', 'pnpm', ['codex:preflight']),
  step('dependency catalog check', 'pnpm', ['deps:catalog:check']),
  step('dependency scan evidence', 'pnpm', ['deps:scan']),
  step('supply-chain check', 'pnpm', ['supply:check']),
  step('GitHub workflow registry check', 'pnpm', ['governance:github-workflows']),
  step('wiki command check', 'pnpm', ['wiki:commands']),
  step('wiki validation', 'pnpm', ['wiki:validate']),
  step('runtime boundary check', 'pnpm', ['arch:runtime']),
  step('package boundary check', 'pnpm', ['arch:boundaries']),
  step('public API report', 'pnpm', ['api:report']),
  step('project doctor', 'pnpm', ['project:doctor']),
  step('prepare internal packages', 'pnpm', ['ci:prepare-internal']),
  step('fast local check', 'pnpm', ['check']),
  step('unit tests', 'pnpm', ['test:run']),
  step('web-demo build', 'pnpm', ['build:web-demo']),
  step('desktop security', 'pnpm', ['desktop:security']),
  step('desktop smoke', 'pnpm', ['desktop:smoke']),
  step('desktop build', 'pnpm', ['build:desktop']),
  step('CI build parity', 'pnpm', ['build:ci']),
  step('E2E QA', 'pnpm', ['e2e:qa']),
  step('browser bundle budget', 'pnpm', ['budget:bundles']),
  step('desktop bundle budget', 'pnpm', ['budget:desktop']),
  cargoLockedCheck(),
]

function stepsForMode(mode) {
  if (mode === 'fast') return fastSteps
  if (mode === 'ci') return ciSteps
  return fullSteps
}

function main() {
  const mode = process.argv[2] ?? 'full'
  if (!modes.has(mode)) {
    console.error(`Usage: node scripts/validate-workspace.mjs <${[...modes].join('|')}>`)
    process.exit(1)
  }

  console.log(`[validate] mode=${mode}`)
  for (const currentStep of stepsForMode(mode)) {
    runStep(currentStep)
    if (mode === 'ci' && currentStep.name === 'Codex skill sync') {
      assertGeneratedAiArtifactsSynced()
    }
  }

  console.log(`\n[validate:pass] ${mode} validation completed`)
}

main()
