#!/usr/bin/env node

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { spawnSync } from 'node:child_process'

import { generateSkillsLock, stringifySkillsLock } from './skill-lock-utils.mjs'
import { syncSkills } from './skill-sync-engine.mjs'

const ROOT = process.cwd()
const BASELINE = 'efcfacd4536283d6b2b9bbe479aa4f7a9307eaab'
const REPOSITORY_AUTHORITY = 'ichichuang/ccd'
const REQUIRED_PATHS = [
  '.ai/governance/routing/fixtures/routing-cases.json',
  '.ai/governance/routing/fixtures/sync-cases.json',
  '.ai/governance/routing/routing-scopes.schema.json',
  '.ai/governance/routing/skill-routing.schema.json',
  '.ai/manifests/routing-scopes.json',
  '.ai/manifests/rule-index.json',
  '.ai/manifests/skill-routing.json',
  '.ai/manifests/skills-lock.json',
  '.ai/protocol/adapter-manifest.json',
  '.ai/protocol/adapters/codex.md',
  'scripts/ai-sync-codex.mjs',
  'scripts/governance/project-ui-routing-validate.mjs',
]

const parseArgs = argv => {
  const parsed = { targetRoot: null, home: null, json: false }
  const seen = new Set()
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (argument === '--') continue
    if (argument === '--json') {
      if (seen.has(argument)) throw new Error('CLI_ARGUMENT_ERROR')
      seen.add(argument)
      parsed.json = true
      continue
    }
    if (!['--target-root', '--home'].includes(argument) || seen.has(argument))
      throw new Error('CLI_ARGUMENT_ERROR')
    const value = argv[index + 1]
    if (!value || value.startsWith('--')) throw new Error('CLI_ARGUMENT_ERROR')
    seen.add(argument)
    index += 1
    parsed[argument === '--target-root' ? 'targetRoot' : 'home'] = path.resolve(value)
  }
  if (parsed.targetRoot && parsed.home) throw new Error('CLI_ARGUMENT_ERROR')
  return parsed
}
const runNodeScript = (relPath, args = []) =>
  spawnSync(process.execPath, [path.join(ROOT, relPath), ...args], {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: 'pipe',
  })
const runGit = args => spawnSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: 'pipe' })
const passed = result => result.status === 0 && !result.error && !result.signal
const gitResultDetails = result => ({
  status: Number.isInteger(result.status) ? result.status : null,
  signal: result.signal ?? null,
  errorCode: result.error?.code ?? null,
})
const gitRuntimeFailed = result => Boolean(result.error || result.signal)
const missingBaselineObject = result => {
  if (gitRuntimeFailed(result)) return false
  if (result.status === 1) return true
  if (result.status !== 128) return false
  return /(?:not a valid object name|bad object|unknown revision|does not exist)/iu.test(
    result.stderr ?? ''
  )
}
const gitPathState = args => {
  const result = runGit([...args, '-z'])
  return {
    result,
    paths: passed(result)
      ? result.stdout
          .split('\0')
          .filter(Boolean)
          .sort((left, right) => left.localeCompare(right, 'en'))
      : [],
  }
}
const normalizeOrigin = value =>
  value
    .trim()
    .replace(/^git@github\.com:/u, '')
    .replace(/^ssh:\/\/git@github\.com\//u, '')
    .replace(/^https:\/\/github\.com\//u, '')
    .replace(/\.git$/u, '')
const commandCheck = (id, result) => ({
  id,
  status: passed(result) ? 'pass' : 'fail',
  details: passed(result) ? {} : { exitCode: result.status ?? 2 },
})
const hasCheck = (result, id) =>
  passed(result) && result.stdout.includes(`CHECK id=${id} status=pass`)
const assertIsolatedTarget = target => {
  const temporary = path.resolve(os.tmpdir())
  const absolute = path.resolve(target)
  if (absolute === temporary || !absolute.startsWith(`${temporary}${path.sep}`))
    throw new Error('PREFLIGHT_TARGET_NOT_ISOLATED')
  let current = temporary
  for (const segment of path.relative(temporary, absolute).split(path.sep).filter(Boolean)) {
    current = path.join(current, segment)
    const stat = fs.lstatSync(current, { throwIfNoEntry: false })
    if (stat?.isSymbolicLink()) throw new Error('PREFLIGHT_TARGET_NOT_ISOLATED')
    if (!stat) break
  }
}
const repositoryIdentityCheck = () => {
  const top = runGit(['rev-parse', '--show-toplevel'])
  const origin = runGit(['remote', 'get-url', 'origin'])
  const baselineObject = runGit(['cat-file', '-e', `${BASELINE}^{commit}`])
  const shallow = runGit(['rev-parse', '--is-shallow-repository'])
  const rootActual = passed(top) ? path.resolve(top.stdout.trim()) : null
  const originActual = passed(origin) ? normalizeOrigin(origin.stdout) : null
  const rootMatches = rootActual === path.resolve(ROOT)
  const authorityMatches = originActual === REPOSITORY_AUTHORITY
  const shallowOutput = passed(shallow) ? shallow.stdout.trim() : null
  const shallowRepository = ['true', 'false'].includes(shallowOutput)
    ? shallowOutput === 'true'
    : null
  const runtimeFailures = []
  if (gitRuntimeFailed(top)) runtimeFailures.push('repositoryRoot')
  if (gitRuntimeFailed(origin)) runtimeFailures.push('origin')
  if (gitRuntimeFailed(baselineObject)) runtimeFailures.push('baselineObject')
  if (gitRuntimeFailed(shallow) || shallow.status !== 0 || shallowRepository === null)
    runtimeFailures.push('shallowRepository')

  let baselineAvailable = null
  let baselineAncestor = null
  let ancestry = null
  let cleanState = null
  let localChanges = { tracked: [], staged: [], untracked: [] }
  const baselineMissing = missingBaselineObject(baselineObject)
  if (passed(baselineObject)) {
    baselineAvailable = true
    ancestry = runGit(['merge-base', '--is-ancestor', BASELINE, 'HEAD'])
    if (gitRuntimeFailed(ancestry) || ![0, 1].includes(ancestry.status))
      runtimeFailures.push('baselineAncestry')
    else baselineAncestor = ancestry.status === 0
  } else if (baselineMissing) {
    baselineAvailable = false
    const tracked = gitPathState(['diff', '--name-only'])
    const staged = gitPathState(['diff', '--cached', '--name-only'])
    const untracked = gitPathState(['ls-files', '--others', '--exclude-standard'])
    localChanges = {
      tracked: tracked.paths,
      staged: staged.paths,
      untracked: untracked.paths,
    }
    for (const [name, state] of Object.entries({ tracked, staged, untracked }))
      if (!passed(state.result)) runtimeFailures.push(`${name}State`)
    if (!runtimeFailures.some(name => name.endsWith('State')))
      cleanState = Object.values(localChanges).every(paths => paths.length === 0)
  } else if (!gitRuntimeFailed(baselineObject)) runtimeFailures.push('baselineObject')

  let diagnosticCode = 'REPOSITORY_IDENTITY_VERIFIED'
  if (runtimeFailures.length) diagnosticCode = 'GIT_COMMAND_RUNTIME_FAILURE'
  else if (!rootMatches) diagnosticCode = 'REPOSITORY_ROOT_MISMATCH'
  else if (!authorityMatches) diagnosticCode = 'REPOSITORY_AUTHORITY_MISMATCH'
  else if (baselineAvailable && !baselineAncestor) diagnosticCode = 'BASELINE_NOT_ANCESTOR'
  else if (!baselineAvailable && !cleanState)
    diagnosticCode = 'BASELINE_OBJECT_UNAVAILABLE_FOR_DIRTY_CANDIDATE'
  else if (!baselineAvailable)
    diagnosticCode = 'BASELINE_OBJECT_UNAVAILABLE_IN_SHALLOW_CLEAN_CHECKOUT'

  const ok = [
    'REPOSITORY_IDENTITY_VERIFIED',
    'BASELINE_OBJECT_UNAVAILABLE_IN_SHALLOW_CLEAN_CHECKOUT',
  ].includes(diagnosticCode)
  return {
    id: 'REPOSITORY_IDENTITY',
    status: ok ? 'pass' : 'fail',
    details: {
      diagnosticCode,
      repositoryRoot: { expected: path.resolve(ROOT), actual: rootActual, matches: rootMatches },
      origin: { expected: REPOSITORY_AUTHORITY, actual: originActual, matches: authorityMatches },
      baseline: BASELINE,
      baselineAvailable,
      baselineAncestor,
      shallowRepository,
      cleanState,
      localChanges,
      runtimeFailures,
      commands: {
        repositoryRoot: gitResultDetails(top),
        origin: gitResultDetails(origin),
        baselineObject: gitResultDetails(baselineObject),
        shallowRepository: gitResultDetails(shallow),
        baselineAncestry: ancestry ? gitResultDetails(ancestry) : null,
      },
    },
  }
}

const runPreflight = argv => {
  const args = parseArgs(argv)
  const targetRoot = args.targetRoot ?? path.join(args.home ?? os.homedir(), '.codex', 'skills')
  const explicitTarget = Boolean(args.targetRoot || args.home)
  if (explicitTarget) assertIsolatedTarget(targetRoot)
  const repositoryIdentity = repositoryIdentityCheck()
  const checks = [repositoryIdentity]
  const warnings = []
  if (
    repositoryIdentity.status === 'pass' &&
    repositoryIdentity.details.diagnosticCode ===
      'BASELINE_OBJECT_UNAVAILABLE_IN_SHALLOW_CLEAN_CHECKOUT'
  )
    warnings.push({
      code: 'BASELINE_OBJECT_UNAVAILABLE_IN_SHALLOW_CLEAN_CHECKOUT',
      message:
        'The historical baseline object is unavailable; clean current-state validation remains active.',
    })
  const missing = REQUIRED_PATHS.filter(relPath => !fs.existsSync(path.join(ROOT, relPath)))
  checks.push({
    id: 'REQUIRED_PATHS',
    status: missing.length ? 'fail' : 'pass',
    details: { missing },
  })
  checks.push(
    commandCheck(
      'SIX_ADAPTER_OUTPUTS',
      runNodeScript('scripts/generate-ai-protocol-adapters.mjs', ['--check'])
    )
  )
  const lockCurrent =
    fs.readFileSync(path.join(ROOT, '.ai/manifests/skills-lock.json'), 'utf8') ===
    stringifySkillsLock(generateSkillsLock(ROOT))
  checks.push({ id: 'SKILLS_LOCK_V3', status: lockCurrent ? 'pass' : 'fail', details: {} })
  const validator = runNodeScript('scripts/governance/project-ui-routing-validate.mjs')
  checks.push({
    id: 'ROUTING_SCHEMAS_AND_FIXTURES',
    status:
      hasCheck(validator, 'STRICT_SCHEMAS_AND_CORPORA') && hasCheck(validator, 'ROUTER_SUITES')
        ? 'pass'
        : 'fail',
    details: {},
  })
  checks.push(
    commandCheck('RULE_INDEX_V2', runNodeScript('scripts/generate-rule-index.mjs', ['--check']))
  )
  checks.push(commandCheck('DEDICATED_VALIDATOR', validator))
  const sync = syncSkills({
    repoRoot: ROOT,
    clients: ['codex'],
    overrides: { codexTargetRoot: targetRoot },
    mode: 'check',
  })
  if (sync.status === 'current')
    checks.push({ id: 'CODEX_SYNC_CHECK', status: 'pass', details: { status: sync.status } })
  else if (!explicitTarget && sync.status === 'drift') {
    checks.push({ id: 'CODEX_SYNC_CHECK', status: 'pass', details: { status: 'warning' } })
    warnings.push({
      code: 'CODEX_TARGET_ABSENT_OR_STALE',
      message: 'The real Codex target is absent or stale; repository checks remain valid.',
    })
    warnings.push({
      code: 'OPTIONAL_CODEX_HOME_SKILLS_MISSING',
      message: '[WARN] optional Codex home skills are not installed',
    })
  } else
    checks.push({
      id: 'CODEX_SYNC_CHECK',
      status: 'fail',
      details: { status: sync.status, diagnostics: sync.diagnostics.map(item => item.code) },
    })
  const coldStartScript = 'scripts/governance/cold-start-validate.mjs'
  const runLegacyImplementationColdStart = () =>
    runNodeScript(coldStartScript, ['--implementation'])
  void runLegacyImplementationColdStart
  checks.push(
    commandCheck('P4_COLD_START_REGRESSION', runNodeScript(coldStartScript, ['--self-test']))
  )
  checks.push({
    id: 'P5_LIFECYCLE_AND_ABSENCE',
    status: hasCheck(validator, 'LIFECYCLE') ? 'pass' : 'fail',
    details: {},
  })
  const ok = checks.every(check => check.status === 'pass')
  const report = {
    schemaVersion: 'ccd-codex-preflight/v1',
    ok,
    targetMode: explicitTarget ? 'override' : 'default-read-only',
    checks,
    warnings,
  }
  if (args.json) process.stdout.write(`${JSON.stringify(report, null, 2)}\n`)
  else {
    for (const check of checks)
      process.stdout.write(`${check.status === 'pass' ? '[OK]' : '[FAIL]'} ${check.id}\n`)
    for (const warning of warnings) process.stdout.write(`[WARN] ${warning.code}\n`)
    process.stdout.write(ok ? 'CODEX_PREFLIGHT_PASS\n' : 'CODEX_PREFLIGHT_FAIL\n')
  }
  return ok ? 0 : 1
}

try {
  process.exitCode = runPreflight(process.argv.slice(2))
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : 'PREFLIGHT_RUNTIME_ERROR'}\n`)
  process.exitCode = 2
}
