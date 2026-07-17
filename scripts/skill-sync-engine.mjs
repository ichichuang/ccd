import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import {
  SkillLockError,
  generateSkillsLock,
  normalizeTrackedContent,
  skillSourcePath,
  stringifySkillsLock,
} from './skill-lock-utils.mjs'

export const SYNC_REPORT_VERSION = 1
export const SYNC_IMPLEMENTATIONS = Object.freeze([
  'codex-user-skills-v1',
  'project-ui-codex-user-v1',
  'project-ui-claude-project-v1',
])
export const SKILLS_LOCK_PATH = '.ai/manifests/skills-lock.json'

const compareStrings = (left, right) => (left === right ? 0 : left < right ? -1 : 1)
const sha256 = value => crypto.createHash('sha256').update(value).digest('hex')
const unique = values => [...new Set(values)]
const createdDirectoriesByPlan = new WeakMap()

export class SkillSyncError extends Error {
  constructor(code, message, details = {}) {
    super(message)
    this.name = 'SkillSyncError'
    this.code = code
    this.details = details
  }
}
const fail = (code, message, details = {}) => {
  throw new SkillSyncError(code, message, details)
}
export const canonicalSyncJson = value => JSON.stringify(value, null, 2) + '\n'

const atomicWrite = (file, content) => {
  const temporary = file + '.tmp-' + process.pid
  fs.writeFileSync(temporary, content, 'utf8')
  fs.renameSync(temporary, file)
}
const errorAsSync = error => {
  if (error instanceof SkillSyncError) return error
  if (error instanceof SkillLockError)
    return new SkillSyncError(error.code, error.message, error.details)
  return new SkillSyncError(
    'UNEXPECTED_SYNC_FAILURE',
    error instanceof Error ? error.message : String(error)
  )
}
const pathExists = value => fs.lstatSync(value, { throwIfNoEntry: false })
const relativeTarget = target => target.client + '/' + target.skillId
const planTargetKey = target => target.client + '\0' + target.skillId

const anchorFor = absolute => {
  const candidates = [process.cwd(), os.homedir(), os.tmpdir()]
    .map(candidate => path.resolve(candidate))
    .filter(candidate => absolute === candidate || absolute.startsWith(candidate + path.sep))
    .sort((left, right) => right.length - left.length)
  return candidates[0] ?? path.parse(absolute).root
}
const assertNoSymlinkComponents = absolute => {
  const resolved = path.resolve(absolute)
  const anchor = anchorFor(resolved)
  const relative = path.relative(anchor, resolved)
  let current = anchor
  for (const segment of relative.split(path.sep).filter(Boolean)) {
    current = path.join(current, segment)
    const stat = pathExists(current)
    if (stat?.isSymbolicLink())
      fail('TARGET_SYMLINK_ESCAPE', 'Target path contains a symlink: ' + resolved)
    if (!stat) break
  }
}
const assertContained = (root, candidate, code) => {
  const resolvedRoot = path.resolve(root)
  const resolvedCandidate = path.resolve(candidate)
  if (resolvedCandidate === resolvedRoot || !resolvedCandidate.startsWith(resolvedRoot + path.sep))
    fail(code, 'Path escapes declared root: ' + candidate)
  return resolvedCandidate
}
export const assertNoTraversalOverride = value => {
  if (value && String(value).replaceAll('\\', '/').split('/').includes('..'))
    fail('TARGET_TRAVERSAL', 'Target override contains traversal: ' + value)
}
const validateRelativeFile = value => {
  if (
    !value ||
    path.posix.isAbsolute(value) ||
    value.includes('\\') ||
    value.split('/').some(segment => segment === '.' || segment === '..')
  )
    fail('SOURCE_PATH_ESCAPE', 'Invalid locked file path: ' + value)
}

export function loadSkillsLock({ repoRoot = process.cwd(), mode = 'check' } = {}) {
  if (!['apply', 'check'].includes(mode)) fail('INVALID_SYNC_MODE', 'Invalid sync mode: ' + mode)
  const generated = generateSkillsLock(repoRoot)
  const expected = stringifySkillsLock(generated)
  const file = path.join(repoRoot, SKILLS_LOCK_PATH)
  const current = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null
  if (current !== expected) {
    if (mode === 'check') fail('SKILLS_LOCK_DRIFT', 'skills-lock.json is stale')
    atomicWrite(file, expected)
  }
  return validateSkillsLockForSync(generated)
}

export function validateSkillsLockForSync(lock) {
  if (lock?.version !== 3) fail('INVALID_SKILLS_LOCK_VERSION', 'Skill sync requires lock v3')
  for (const [skillId, entry] of Object.entries(lock.skills ?? {})) {
    for (const client of entry.syncTargets) {
      if (!['claude', 'codex'].includes(client))
        fail('UNKNOWN_SYNC_TARGET', 'Unknown sync target on ' + skillId + ': ' + client)
      const implementation = entry.syncImplementations?.[client]
      if (!implementation)
        fail(
          'MISSING_SYNC_IMPLEMENTATION',
          'Missing sync implementation for ' + client + ':' + skillId
        )
      if (!SYNC_IMPLEMENTATIONS.includes(implementation))
        fail('UNKNOWN_SYNC_IMPLEMENTATION', 'Unknown sync implementation: ' + implementation)
    }
  }
  return lock
}

export function resolveManagedTargets({
  repoRoot = process.cwd(),
  lock,
  clients,
  overrides = {},
} = {}) {
  if (!lock) fail('SKILLS_LOCK_REQUIRED', 'A validated Skills lock is required')
  const requested = unique(clients ?? []).sort(compareStrings)
  if (requested.length === 0) fail('UNKNOWN_SYNC_TARGET', 'At least one sync client is required')
  for (const client of requested)
    if (!['claude', 'codex'].includes(client))
      fail('UNKNOWN_SYNC_TARGET', 'Unknown sync client: ' + client)
  for (const value of Object.values(overrides)) assertNoTraversalOverride(value)
  let codexRoot = overrides.codexTargetRoot
    ? path.resolve(overrides.codexTargetRoot)
    : path.join(path.resolve(overrides.codexHome ?? os.homedir()), '.codex', 'skills')
  let claudeTarget = overrides.claudeTargetRoot
    ? path.resolve(overrides.claudeTargetRoot)
    : path.join(
        path.resolve(overrides.claudeProjectRoot ?? repoRoot),
        '.claude',
        'skills',
        'project-ui'
      )
  assertNoSymlinkComponents(codexRoot)
  assertNoSymlinkComponents(claudeTarget)
  const targets = []
  for (const [skillId, entry] of Object.entries(lock.skills).sort(([left], [right]) =>
    compareStrings(left, right)
  )) {
    for (const client of requested) {
      if (!entry.syncTargets.includes(client)) continue
      const implementationId = entry.syncImplementations?.[client]
      if (!implementationId)
        fail(
          'MISSING_SYNC_IMPLEMENTATION',
          'Missing sync implementation for ' + client + ':' + skillId
        )
      if (!SYNC_IMPLEMENTATIONS.includes(implementationId))
        fail('UNKNOWN_SYNC_IMPLEMENTATION', 'Unknown sync implementation: ' + implementationId)
      const targetRoot = client === 'codex' ? codexRoot : path.dirname(claudeTarget)
      const targetDir =
        client === 'codex'
          ? assertContained(targetRoot, path.join(targetRoot, skillId), 'TARGET_PATH_ESCAPE')
          : claudeTarget
      const sourceDir = skillSourcePath(repoRoot, entry)
      targets.push({ client, skillId, implementationId, sourceDir, targetRoot, targetDir })
    }
  }
  return targets.sort(
    (left, right) =>
      compareStrings(left.client, right.client) || compareStrings(left.skillId, right.skillId)
  )
}

const expectedFiles = target => {
  const files = []
  const entry = target.entry
  for (const locked of entry.includedFiles) {
    validateRelativeFile(locked.path)
    const source = assertContained(
      target.sourceDir,
      path.join(target.sourceDir, locked.path),
      'SOURCE_PATH_ESCAPE'
    )
    const stat = pathExists(source)
    if (!stat || !stat.isFile() || stat.isSymbolicLink())
      fail('SOURCE_SYMLINK_ESCAPE', 'Invalid Skill source: ' + target.skillId + '/' + locked.path)
    const normalized = normalizeTrackedContent(fs.readFileSync(source), locked.path)
    if (
      normalized.kind !== locked.kind ||
      normalized.content.length !== locked.size ||
      sha256(normalized.content) !== locked.sha256
    )
      fail('SKILLS_LOCK_DRIFT', 'Locked source drift: ' + target.skillId + '/' + locked.path)
    files.push({ path: locked.path, mode: locked.mode, content: normalized.content })
  }
  return files
}
const readTree = root => {
  const stat = pathExists(root)
  if (!stat) return null
  if (stat.isSymbolicLink()) fail('TARGET_SYMLINK_ESCAPE', 'Managed target is a symlink: ' + root)
  if (!stat.isDirectory()) return [{ path: '', mode: 'invalid', content: fs.readFileSync(root) }]
  const files = []
  const visit = (current, relative) => {
    for (const entry of fs
      .readdirSync(current, { withFileTypes: true })
      .sort((left, right) => compareStrings(left.name, right.name))) {
      const nextRelative = relative ? path.posix.join(relative, entry.name) : entry.name
      const next = path.join(current, entry.name)
      if (entry.isSymbolicLink())
        fail('TARGET_SYMLINK_ESCAPE', 'Managed tree contains a symlink: ' + nextRelative)
      if (entry.isDirectory()) visit(next, nextRelative)
      else if (entry.isFile()) {
        const fileStat = fs.statSync(next)
        files.push({
          path: nextRelative,
          mode: fileStat.mode & 0o111 ? '100755' : '100644',
          content: fs.readFileSync(next),
        })
      } else fail('INVALID_TARGET_FILE_TYPE', 'Unsupported target entry: ' + nextRelative)
    }
  }
  visit(root, '')
  return files
}
const treeDigest = files => {
  if (files === null) return null
  const hash = crypto.createHash('sha256')
  for (const file of files) {
    hash.update(file.path)
    hash.update('\0')
    hash.update(file.mode)
    hash.update('\0')
    hash.update(file.content)
    hash.update('\0')
  }
  return hash.digest('hex')
}
const treesEqual = (left, right) => {
  if (left === null || right === null) return left === right
  if (left.length !== right.length) return false
  return left.every(
    (file, index) =>
      file.path === right[index].path &&
      file.mode === right[index].mode &&
      file.content.equals(right[index].content)
  )
}
const makeDiagnostic = (error, target = null) => ({
  severity: 'error',
  code: error.code,
  message: error.code,
  client: target?.client ?? null,
  skillId: target?.skillId ?? null,
  target: target ? relativeTarget(target) : null,
})
const transactionIdFor = targets =>
  sha256(Buffer.from(targets.map(planTargetKey).join('\0'), 'utf8')).slice(0, 16)

export function createSyncPlan({
  repoRoot = process.cwd(),
  lock,
  targets,
  mode = 'check',
  faultInjector = null,
} = {}) {
  if (!['apply', 'check'].includes(mode)) fail('INVALID_SYNC_MODE', 'Invalid sync mode: ' + mode)
  const transactionId = transactionIdFor(targets)
  const enriched = targets.map(target => ({ ...target, entry: lock.skills[target.skillId] }))
  const plan = {
    transactionId,
    mode,
    repoRoot: path.resolve(repoRoot),
    targets: enriched,
    candidates: new Map(),
    replacements: [],
    faultInjector,
  }
  createdDirectoriesByPlan.set(plan, [])
  return plan
}
const invokeFault = (plan, event, context) => {
  if (typeof plan.faultInjector === 'function') plan.faultInjector(event, context)
}
const writeCandidate = (candidate, files) => {
  fs.mkdirSync(candidate, { recursive: true, mode: 0o755 })
  for (const file of files) {
    const destination = path.join(candidate, file.path)
    assertContained(candidate, destination, 'TARGET_PATH_ESCAPE')
    fs.mkdirSync(path.dirname(destination), { recursive: true, mode: 0o755 })
    fs.writeFileSync(destination, file.content, { mode: file.mode === '100755' ? 0o755 : 0o644 })
    fs.chmodSync(destination, file.mode === '100755' ? 0o755 : 0o644)
  }
}

export function stageCandidates(plan) {
  if (plan.mode === 'check')
    fail('CHECK_MODE_WRITE_FORBIDDEN', 'Check mode must not stage candidates')
  for (const target of plan.targets) {
    const missing = []
    let current = target.targetRoot
    while (!pathExists(current) && current !== path.dirname(current)) {
      missing.push(current)
      current = path.dirname(current)
    }
    fs.mkdirSync(target.targetRoot, { recursive: true, mode: 0o755 })
    createdDirectoriesByPlan.get(plan).push(...missing)
    const candidate = path.join(
      target.targetRoot,
      '.ccd-sync-' + path.basename(target.targetDir) + '.candidate-' + plan.transactionId
    )
    if (pathExists(candidate)) fs.rmSync(candidate, { recursive: true, force: true })
    const files = expectedFiles(target)
    writeCandidate(candidate, files)
    plan.candidates.set(planTargetKey(target), candidate)
    invokeFault(plan, 'after-candidate-write', { target, candidate })
  }
  return plan
}

export function validateCandidates(plan) {
  if (plan.mode === 'check') return plan
  for (const target of plan.targets) {
    const candidate = plan.candidates.get(planTargetKey(target))
    if (!candidate || !treesEqual(expectedFiles(target), readTree(candidate)))
      fail('CANDIDATE_VALIDATION_FAILED', 'Candidate validation failed: ' + relativeTarget(target))
  }
  return plan
}

const reportBase = plan => ({
  reportVersion: SYNC_REPORT_VERSION,
  mode: plan.mode,
  status: 'current',
  transactionId: plan.transactionId,
  clients: unique(plan.targets.map(target => target.client)).sort(compareStrings),
  managedSkills: plan.targets.map(target => ({
    client: target.client,
    skillId: target.skillId,
    implementationId: target.implementationId,
    target: relativeTarget(target),
  })),
  changes: [],
  preserved: [
    'unmanaged-siblings',
    ...(plan.targets.some(target => target.client === 'codex') ? ['codex-.system'] : []),
  ],
  rollbacks: [],
  diagnostics: [],
})
const plannedChanges = plan =>
  plan.targets.map(target => {
    const before = readTree(target.targetDir)
    const after = expectedFiles(target)
    return {
      target,
      before,
      after,
      change: {
        client: target.client,
        skillId: target.skillId,
        target: relativeTarget(target),
        status: before === null ? 'created' : treesEqual(before, after) ? 'unchanged' : 'updated',
        hashBefore: treeDigest(before),
        hashAfter: treeDigest(after),
      },
    }
  })

export function executeSyncPlan(plan) {
  const report = reportBase(plan)
  let planned
  try {
    planned = plannedChanges(plan)
    report.changes = planned.map(item => item.change)
    const changed = planned.filter(item => item.change.status !== 'unchanged')
    if (plan.mode === 'check') {
      report.status = changed.length > 0 ? 'drift' : 'current'
      if (changed.length > 0)
        report.diagnostics.push({
          severity: 'error',
          code: 'TARGET_DRIFT',
          message: 'Managed Skill targets differ from the lock.',
          client: null,
          skillId: null,
          target: null,
        })
      return report
    }
    if (changed.length === 0) {
      report.status = 'current'
      return report
    }
    for (const [index, item] of changed.entries()) {
      const target = item.target
      const candidate = plan.candidates.get(planTargetKey(target))
      const backup = path.join(
        target.targetRoot,
        '.ccd-sync-' + path.basename(target.targetDir) + '.backup-' + plan.transactionId
      )
      const original = pathExists(target.targetDir)
      invokeFault(plan, 'before-backup', { target, backup })
      if (original) {
        if (pathExists(backup)) fs.rmSync(backup, { recursive: true, force: true })
        fs.renameSync(target.targetDir, backup)
      }
      const replacement = {
        target,
        candidate,
        backup,
        hadOriginal: Boolean(original),
        installed: false,
      }
      plan.replacements.push(replacement)
      invokeFault(plan, 'after-backup', { target, backup })
      invokeFault(plan, 'before-replacement', { target, candidate })
      fs.renameSync(candidate, target.targetDir)
      replacement.installed = true
      invokeFault(plan, 'after-replacement', { target })
      const nextClient = changed[index + 1]?.target.client
      if (nextClient !== target.client) invokeFault(plan, 'after-client-replacement', { target })
    }
    report.status = 'updated'
    return report
  } catch (caught) {
    const error = errorAsSync(caught)
    let rollbackFailed = false
    for (const replacement of [...plan.replacements].reverse()) {
      try {
        if (replacement.installed && pathExists(replacement.target.targetDir))
          fs.rmSync(replacement.target.targetDir, { recursive: true, force: true })
        if (replacement.hadOriginal && pathExists(replacement.backup))
          fs.renameSync(replacement.backup, replacement.target.targetDir)
        report.rollbacks.push({
          client: replacement.target.client,
          skillId: replacement.target.skillId,
          target: relativeTarget(replacement.target),
          status: 'restored',
        })
      } catch (rollbackError) {
        rollbackFailed = true
        report.rollbacks.push({
          client: replacement.target.client,
          skillId: replacement.target.skillId,
          target: relativeTarget(replacement.target),
          status: 'failed',
        })
        report.diagnostics.push(
          makeDiagnostic(
            new SkillSyncError('ROLLBACK_FAILED', String(rollbackError)),
            replacement.target
          )
        )
      }
    }
    report.status = rollbackFailed
      ? 'rejected'
      : plan.replacements.length > 0
        ? 'rolled-back'
        : 'rejected'
    report.diagnostics.unshift(makeDiagnostic(error, plan.replacements.at(-1)?.target ?? null))
    if (!rollbackFailed && plan.replacements.length > 0) {
      report.diagnostics.push({
        severity: 'info',
        code: 'ROLLBACK_COMPLETE',
        message: 'All replaced Skill targets were restored.',
        client: null,
        skillId: null,
        target: null,
      })
    }
    return report
  }
}

export function cleanupSyncPlan(plan) {
  let injectedError = null
  try {
    invokeFault(plan, 'before-cleanup', { transactionId: plan.transactionId })
  } catch (error) {
    injectedError = errorAsSync(error)
  }
  for (const candidate of plan.candidates.values())
    if (pathExists(candidate)) fs.rmSync(candidate, { recursive: true, force: true })
  for (const replacement of plan.replacements)
    if (pathExists(replacement.backup))
      fs.rmSync(replacement.backup, { recursive: true, force: true })
  for (const root of unique([
    ...plan.targets.map(target => target.targetRoot),
    ...(createdDirectoriesByPlan.get(plan) ?? []),
  ]).sort((left, right) => right.length - left.length || compareStrings(right, left))) {
    const stat = pathExists(root)
    if (stat?.isDirectory() && fs.readdirSync(root).length === 0) fs.rmdirSync(root)
  }
  if (injectedError) throw injectedError
}

export function syncSkills({
  repoRoot = process.cwd(),
  clients,
  overrides = {},
  mode = 'check',
  faultInjector = null,
} = {}) {
  let lock
  let plan
  try {
    lock = loadSkillsLock({ repoRoot, mode })
    const targets = resolveManagedTargets({ repoRoot, lock, clients, overrides })
    plan = createSyncPlan({ repoRoot, lock, targets, mode, faultInjector })
    if (mode === 'apply') validateCandidates(stageCandidates(plan))
    const report = executeSyncPlan(plan)
    try {
      if (mode === 'apply') cleanupSyncPlan(plan)
    } catch (cleanupError) {
      report.status = 'rejected'
      report.diagnostics.push(makeDiagnostic(errorAsSync(cleanupError)))
    }
    return report
  } catch (caught) {
    const error = errorAsSync(caught)
    if (plan && mode === 'apply') {
      try {
        cleanupSyncPlan(plan)
      } catch {}
    }
    return {
      reportVersion: SYNC_REPORT_VERSION,
      mode,
      status: 'rejected',
      transactionId: plan?.transactionId ?? null,
      clients: unique(clients ?? []).sort(compareStrings),
      managedSkills:
        plan?.targets.map(target => ({
          client: target.client,
          skillId: target.skillId,
          implementationId: target.implementationId,
          target: relativeTarget(target),
        })) ?? [],
      changes: [],
      preserved: [],
      rollbacks: [],
      diagnostics: [makeDiagnostic(error)],
    }
  }
}

export function parseSyncArgs(argv, { client, home = os.homedir(), cwd = process.cwd() } = {}) {
  if (!['codex', 'claude'].includes(client))
    fail('UNKNOWN_SYNC_TARGET', 'Unknown sync client: ' + client)
  const parsed = { check: false, json: false, targetRoot: null, home: null, projectRoot: null }
  const seen = new Set()
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (argument === '--') continue
    if (argument === '--check' || argument === '--json') {
      if (seen.has(argument)) fail('CLI_ARGUMENT_ERROR', 'Repeated argument: ' + argument)
      seen.add(argument)
      parsed[argument === '--check' ? 'check' : 'json'] = true
      continue
    }
    const supported = client === 'codex' ? ['--target-root', '--home'] : ['--project-root']
    if (!supported.includes(argument))
      fail('CLI_ARGUMENT_ERROR', 'Unknown sync argument: ' + argument)
    if (seen.has(argument)) fail('CLI_ARGUMENT_ERROR', 'Repeated argument: ' + argument)
    const value = argv[index + 1]
    if (!value || value.startsWith('--'))
      fail('CLI_ARGUMENT_ERROR', 'Missing value for ' + argument)
    seen.add(argument)
    index += 1
    if (argument === '--target-root') parsed.targetRoot = value
    else if (argument === '--home') parsed.home = value
    else parsed.projectRoot = value
  }
  if (parsed.targetRoot && (parsed.home || parsed.projectRoot))
    fail('CLI_ARGUMENT_ERROR', 'Target override arguments are mutually exclusive')
  const overrides = {}
  if (client === 'codex') {
    assertNoTraversalOverride(parsed.targetRoot)
    assertNoTraversalOverride(parsed.home)
    overrides.codexTargetRoot = path.resolve(
      parsed.targetRoot ?? path.join(path.resolve(parsed.home ?? home), '.codex', 'skills')
    )
  } else {
    assertNoTraversalOverride(parsed.targetRoot)
    assertNoTraversalOverride(parsed.projectRoot)
    overrides.claudeTargetRoot = path.resolve(
      parsed.targetRoot ??
        path.join(path.resolve(parsed.projectRoot ?? cwd), '.claude', 'skills', 'project-ui')
    )
    if (
      overrides.claudeTargetRoot ===
      path.join(path.resolve(home), '.claude', 'skills', 'project-ui')
    )
      fail(
        'REAL_HOME_TARGET_FORBIDDEN',
        'Claude project sync must not target the personal HOME copy'
      )
  }
  return { ...parsed, mode: parsed.check ? 'check' : 'apply', overrides }
}

export function renderSyncReport(report, jsonMode) {
  if (jsonMode) return canonicalSyncJson(report)
  return [
    'mode=' + report.mode,
    'status=' + report.status,
    'clients=' + report.clients.join(','),
    'changes=' +
      report.changes
        .map(change => change.client + ':' + change.skillId + ':' + change.status)
        .join(','),
    'diagnostics=' + (report.diagnostics.map(item => item.code).join(',') || 'none'),
    '',
  ].join('\n')
}
