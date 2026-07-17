#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'

import { EXPECTED_OUTPUTS } from './generate-ai-protocol-adapters.mjs'
import { generateSkillsLock, stringifySkillsLock } from './skill-lock-utils.mjs'

const modes = new Set(['full', 'ci', 'fast'])

const generatedAiArtifacts = [
  ...EXPECTED_OUTPUTS.map(output => output.path),
  '.ai/manifests/skills-lock.json',
]

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
  console.log('\n[validate] generated AI artifact freshness check')
  const adapterCheck = spawnSync(
    process.execPath,
    ['scripts/generate-ai-protocol-adapters.mjs', '--check'],
    {
      cwd: process.cwd(),
      encoding: 'utf8',
      stdio: 'pipe',
    }
  )
  const lockPath = path.join(process.cwd(), '.ai/manifests/skills-lock.json')
  const expectedLock = stringifySkillsLock(generateSkillsLock(process.cwd()))
  const actualLock = fs.readFileSync(lockPath, 'utf8')

  if (adapterCheck.status === 0 && actualLock === expectedLock) {
    console.log('[validate:pass] generated AI artifact freshness check')
    return
  }

  console.error('[validate:fail] generated AI artifact freshness check')
  if (adapterCheck.status !== 0) {
    console.error('Six generated adapter outputs are stale.')
    if (adapterCheck.stderr.trim()) console.error(adapterCheck.stderr.trim())
    if (adapterCheck.stdout.trim()) console.error(adapterCheck.stdout.trim())
  }
  if (actualLock !== expectedLock) console.error('.ai/manifests/skills-lock.json is stale.')
  throw new Error(
    `Generated AI artifacts are stale. Review ${generatedAiArtifacts.join(', ')} and rerun the gate.`
  )
}

function createCiIsolation() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ccd-workspace-validation-'))
  const temporaryRoot = path.resolve(os.tmpdir())
  const absoluteRoot = path.resolve(root)
  if (!absoluteRoot.startsWith(`${temporaryRoot}${path.sep}`)) {
    fs.rmSync(root, { recursive: true, force: true })
    throw new Error('CI_TEMP_ROOT_NOT_ISOLATED')
  }
  const skillsRoot = path.join(root, 'codex', 'skills')
  let cleaned = false
  const removeRoot = () => {
    if (cleaned) return
    cleaned = true
    fs.rmSync(root, { recursive: true, force: true })
  }
  const exitHandler = () => removeRoot()
  const signalHandlers = new Map()
  for (const [signal, code] of [
    ['SIGINT', 130],
    ['SIGTERM', 143],
    ['SIGHUP', 129],
  ]) {
    const handler = () => {
      removeRoot()
      process.exit(code)
    }
    signalHandlers.set(signal, handler)
    process.once(signal, handler)
  }
  process.once('exit', exitHandler)
  const cleanup = () => {
    process.off('exit', exitHandler)
    for (const [signal, handler] of signalHandlers) process.off(signal, handler)
    removeRoot()
  }
  return { root, skillsRoot, cleanup }
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

const createCiSteps = codexSkillsRoot => [
  step('runtime summary', 'pnpm', ['runtime:summary']),
  step('AI cold-start validation', 'pnpm', ['ai:cold-start:validate']),
  step('AI adapter sync', 'pnpm', ['ai:sync']),
  step('Codex skill sync', 'pnpm', ['ai:sync:codex', '--', '--target-root', codexSkillsRoot]),
  step('AI doctor', 'pnpm', ['ai:doctor']),
  step('Codex preflight', 'pnpm', ['codex:preflight', '--', '--target-root', codexSkillsRoot]),
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

function stepsForMode(mode, { codexSkillsRoot = null } = {}) {
  if (mode === 'fast') return fastSteps
  if (mode === 'ci') {
    if (!codexSkillsRoot) throw new Error('CI_CODEX_TARGET_REQUIRED')
    return createCiSteps(codexSkillsRoot)
  }
  return fullSteps
}

function main() {
  const mode = process.argv[2] ?? 'full'
  if (!modes.has(mode)) {
    console.error(`Usage: node scripts/validate-workspace.mjs <${[...modes].join('|')}>`)
    process.exit(1)
  }

  const isolation = mode === 'ci' ? createCiIsolation() : null
  try {
    console.log(`[validate] mode=${mode}`)
    for (const currentStep of stepsForMode(mode, {
      codexSkillsRoot: isolation?.skillsRoot,
    })) {
      runStep(currentStep)
      if (mode === 'ci' && currentStep.name === 'Codex skill sync') {
        assertGeneratedAiArtifactsSynced()
      }
    }

    console.log(`\n[validate:pass] ${mode} validation completed`)
  } finally {
    isolation?.cleanup()
  }
}

function runSelfTests() {
  const isolation = createCiIsolation()
  try {
    const steps = stepsForMode('ci', { codexSkillsRoot: isolation.skillsRoot })
    for (const name of ['Codex skill sync', 'Codex preflight']) {
      const currentStep = steps.find(candidate => candidate.name === name)
      const targetIndex = currentStep?.args.indexOf('--target-root') ?? -1
      if (targetIndex < 0 || currentStep.args[targetIndex + 1] !== isolation.skillsRoot)
        throw new Error(`SELF_TEST_ISOLATED_TARGET:${name}`)
    }
    assertGeneratedAiArtifactsSynced()
  } finally {
    isolation.cleanup()
  }
  if (fs.existsSync(isolation.root)) throw new Error('SELF_TEST_TEMP_ROOT_RESIDUE')
  console.log('VALIDATE_WORKSPACE_SELF_TEST_PASS')
}

if (process.argv[2] === '--self-test') runSelfTests()
else main()
