#!/usr/bin/env node

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { spawnSync } from 'node:child_process'

import {
  PROJECT_UI_HASH_INVENTORY,
  generateSkillsLock,
  stringifySkillsLock,
} from './skill-lock-utils.mjs'
import { syncSkills } from './skill-sync-engine.mjs'

const ROOT = process.cwd()
const BASELINE = 'efcfacd4536283d6b2b9bbe479aa4f7a9307eaab'
const REPOSITORY_AUTHORITY = 'ichichuang/ccd'
const REQUIRED_PATHS = [
  '.ai/governance/routing/fixtures/routing-cases.json',
  '.ai/governance/routing/fixtures/sync-cases.json',
  '.ai/manifests/routing-scopes.json',
  '.ai/manifests/skill-routing.json',
  '.ai/manifests/skills-lock.json',
  '.ai/protocol/adapter-manifest.json',
  '.ai/protocol/adapters/claude.md',
  '.ai/skills/project-ui/SKILL.md',
  'CLAUDE.md',
  'scripts/ai-sync-claude.mjs',
  'scripts/governance/project-ui-routing-validate.mjs',
]

const parseArgs = argv => {
  const parsed = { targetRoot: null, projectRoot: null, json: false }
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
    if (!['--target-root', '--project-root'].includes(argument) || seen.has(argument))
      throw new Error('CLI_ARGUMENT_ERROR')
    const value = argv[index + 1]
    if (!value || value.startsWith('--')) throw new Error('CLI_ARGUMENT_ERROR')
    seen.add(argument)
    index += 1
    parsed[argument.slice(2).replace(/-([a-z])/gu, (_, character) => character.toUpperCase())] =
      path.resolve(value)
  }
  if (parsed.targetRoot && parsed.projectRoot) throw new Error('CLI_ARGUMENT_ERROR')
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
  const baselineAncestor = runGit(['merge-base', '--is-ancestor', BASELINE, 'HEAD'])
  const ok =
    passed(top) &&
    passed(origin) &&
    passed(baselineAncestor) &&
    path.resolve(top.stdout.trim()) === path.resolve(ROOT) &&
    normalizeOrigin(origin.stdout) === REPOSITORY_AUTHORITY
  return { id: 'REPOSITORY_IDENTITY', status: ok ? 'pass' : 'fail', details: {} }
}

const runPreflight = argv => {
  const args = parseArgs(argv)
  const projectRoot = args.projectRoot ?? ROOT
  const targetRoot = args.targetRoot ?? path.join(projectRoot, '.claude', 'skills', 'project-ui')
  const explicitTarget = Boolean(args.targetRoot || args.projectRoot)
  if (explicitTarget) assertIsolatedTarget(targetRoot)
  const checks = [repositoryIdentityCheck()]
  const warnings = []
  const missing = REQUIRED_PATHS.filter(relPath => !fs.existsSync(path.join(ROOT, relPath)))
  checks.push({
    id: 'REQUIRED_PATHS',
    status: missing.length ? 'fail' : 'pass',
    details: { missing },
  })
  const lock = generateSkillsLock(ROOT)
  const complete = sameInventory(
    lock.skills['project-ui']?.includedFiles.map(file => file.path) ?? []
  )
  checks.push({ id: 'PROJECT_UI_COMPLETENESS', status: complete ? 'pass' : 'fail', details: {} })
  const lockCurrent =
    fs.readFileSync(path.join(ROOT, '.ai/manifests/skills-lock.json'), 'utf8') ===
    stringifySkillsLock(lock)
  checks.push({ id: 'SKILLS_LOCK_V3', status: lockCurrent ? 'pass' : 'fail', details: {} })
  const validator = runNodeScript('scripts/governance/project-ui-routing-validate.mjs')
  checks.push({
    id: 'ROUTING_CONTRACT',
    status:
      hasCheck(validator, 'STRICT_SCHEMAS_AND_CORPORA') && hasCheck(validator, 'ROUTER_SUITES')
        ? 'pass'
        : 'fail',
    details: {},
  })
  checks.push(
    commandCheck(
      'CLAUDE_ADAPTER',
      runNodeScript('scripts/generate-ai-protocol-adapters.mjs', ['--check'])
    )
  )
  checks.push(commandCheck('DEDICATED_VALIDATOR', validator))
  const sync = syncSkills({
    repoRoot: ROOT,
    clients: ['claude'],
    overrides: { claudeTargetRoot: targetRoot },
    mode: 'check',
  })
  if (sync.status === 'current')
    checks.push({ id: 'CLAUDE_SYNC_CHECK', status: 'pass', details: { status: sync.status } })
  else if (!explicitTarget && sync.status === 'drift') {
    checks.push({ id: 'CLAUDE_SYNC_CHECK', status: 'pass', details: { status: 'warning' } })
    warnings.push({
      code: 'CLAUDE_TARGET_ABSENT_OR_STALE',
      message:
        'The repository-local Claude target is absent or stale; repository checks remain valid.',
    })
  } else
    checks.push({
      id: 'CLAUDE_SYNC_CHECK',
      status: 'fail',
      details: { status: sync.status, diagnostics: sync.diagnostics.map(item => item.code) },
    })
  const personalShadow = path.join(os.homedir(), '.claude', 'skills', 'project-ui')
  const shadowed =
    path.resolve(personalShadow) !== path.resolve(targetRoot) && fs.existsSync(personalShadow)
  checks.push({
    id: 'PERSONAL_SHADOW_OBSERVATION',
    status: 'pass',
    details: { status: shadowed ? 'observed-noncanonical' : 'absent' },
  })
  if (shadowed)
    warnings.push({
      code: 'PERSONAL_CLAUDE_SHADOWS_PROJECT',
      message: 'A personal noncanonical project-ui copy may shadow the project target.',
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
    schemaVersion: 'ccd-claude-preflight/v1',
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
    process.stdout.write(ok ? 'CLAUDE_PREFLIGHT_PASS\n' : 'CLAUDE_PREFLIGHT_FAIL\n')
  }
  return ok ? 0 : 1
}
const sameInventory = actual => JSON.stringify(actual) === JSON.stringify(PROJECT_UI_HASH_INVENTORY)

try {
  process.exitCode = runPreflight(process.argv.slice(2))
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : 'PREFLIGHT_RUNTIME_ERROR'}\n`)
  process.exitCode = 2
}
