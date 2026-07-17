#!/usr/bin/env node

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { spawnSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'

import {
  COLD_START_SCHEMA_VERSION,
  ColdStartContractError,
  EXPECTED_OUTPUTS,
  GENERATOR_OWNER,
  VALIDATION_OWNER,
  canonicalSerialize,
  compareOutputs,
  digestCanonicalSources,
  fingerprintOutputs,
  loadManifest,
  renderOutputs,
  sha256,
  validateManifest,
} from '../generate-ai-protocol-adapters.mjs'

const ROOT = process.cwd()
const GENERATOR_PATH = 'scripts/generate-ai-protocol-adapters.mjs'
const SYNC_PATH = 'scripts/ai-sync.mjs'
const CORE_PATHS = [
  '.gitignore',
  'AGENTS.md',
  'CLAUDE.md',
  '.ai/protocol/adapters/claude.md',
  '.ai/protocol/adapter-manifest.json',
  GENERATOR_PATH,
  SYNC_PATH,
]
const COLD_OUTPUT_PATHS = new Set(EXPECTED_OUTPUTS.map(output => output.path))
const PENDING_ADDITION_PATHS = new Set([
  'AGENTS.md',
  'CLAUDE.md',
  '.ai/protocol/adapters/claude.md',
])
const AUTHORIZED_PATHS = new Set([
  ...CORE_PATHS,
  '.ai/protocol/AI.entry.md',
  '.ai/protocol/adapters/README.md',
  '.ai/protocol/adapters/codex.md',
  'scripts/governance/cold-start-validate.mjs',
  'scripts/codex-preflight.mjs',
  'scripts/validate-workspace.mjs',
  'package.json',
])
const IMMUTABLE_PATHS = [
  'pnpm-lock.yaml',
  '.ai/manifests/skill-routing.json',
  '.ai/manifests/skills-lock.json',
]
const GENERATED_AUXILIARY_PATHS = [
  '.ai/manifests/rule-index.json',
  '.ai/manifests/unocss-semantic-shortcuts.json',
  '.vscode/unocss-semantic-shortcuts.html-data.json',
  '.vscode/unocss-semantic-shortcuts.code-snippets',
]
const PRESERVED_LOCAL_ROOTS = ['.ai/runtime', '.cursor', '.claude']
const P4_4_PATHS = new Set([
  'wiki/canonical/design/ai-cold-start.md',
  'wiki/indexes/design-index.md',
  'wiki/canonical/design/ui-governance-migration-plan.md',
  '.ai/governance/policies/ui.json',
  '.ai/governance/coverage/project-ui-semantic-coverage.json',
  '.ai/governance/ui/schemas/ui-policy.schema.json',
  '.ai/governance/ui/fixtures/schema-valid/ui-policy.json',
  '.ai/governance/ui/fixtures/schema-invalid/ui-policy.json',
  '.ai/governance/ui/scripts/validate-ui-policy.mjs',
  '.ai/skills/project-ui/SKILL.md',
  '.ai/skills/project-ui/references/platform-invariants.md',
  '.ai/skills/project-ui/references/validation.md',
  '.ai/skills/project-ui/scripts/validate-semantic-quality.mjs',
  'wiki/canonical/design/machine-ui-policy.md',
  'wiki/canonical/design/project-ui-skill.md',
])
const P4_TERMINAL_AUTHORIZED_PATHS = new Set([...AUTHORIZED_PATHS, ...P4_4_PATHS])
const P5_4_AUTHORIZED_PATHS = new Set([
  '.ai/governance/routing/fixtures/routing-cases.json',
  '.ai/governance/routing/fixtures/sync-cases.json',
  '.ai/governance/routing/routing-scopes.schema.json',
  '.ai/governance/routing/skill-routing.schema.json',
  '.ai/manifests/routing-scopes.json',
  '.ai/manifests/rule-index.json',
  '.ai/manifests/skill-routing.json',
  '.ai/manifests/skills-lock.json',
  '.ai/protocol/AGENTS.core.md',
  '.ai/protocol/AI.entry.md',
  '.ai/protocol/adapter-manifest.json',
  '.ai/protocol/adapters/README.md',
  '.ai/protocol/adapters/claude.md',
  '.ai/protocol/adapters/codex.md',
  '.ai/skills/codex/task-orchestrator/scripts/skill_router.mjs',
  '.ai/skills/codex/task-orchestrator/scripts/skill_router.py',
  'AGENTS.md',
  'CLAUDE.md',
  'package.json',
  'scripts/ai-doctor.mjs',
  'scripts/ai-sync-claude.mjs',
  'scripts/ai-sync-codex.mjs',
  'scripts/ai-sync-skills.mjs',
  'scripts/claude-preflight.mjs',
  'scripts/codex-preflight.mjs',
  'scripts/generate-ai-protocol-adapters.mjs',
  'scripts/generate-rule-index.mjs',
  'scripts/governance/adapters-validate.mjs',
  'scripts/governance/cold-start-validate.mjs',
  'scripts/governance/gate.mjs',
  'scripts/governance/project-ui-routing-validate.mjs',
  'scripts/skill-lock-utils.mjs',
  'scripts/skill-sync-engine.mjs',
  'scripts/validate-workspace.mjs',
])
const P5_5_AUTHORIZED_PATHS = new Set([
  ...P4_4_PATHS,
  '.ai/manifests/skills-lock.json',
  'wiki/canonical/design/project-ui-routing.md',
])
const P5_TERMINAL_AUTHORIZED_PATHS = new Set([...P5_4_AUTHORIZED_PATHS, ...P5_5_AUTHORIZED_PATHS])
const P5_CORE_ARTIFACT_PATHS = [
  '.ai/governance/routing/fixtures/routing-cases.json',
  '.ai/governance/routing/fixtures/sync-cases.json',
  '.ai/governance/routing/routing-scopes.schema.json',
  '.ai/governance/routing/skill-routing.schema.json',
  '.ai/manifests/routing-scopes.json',
  'scripts/ai-sync-claude.mjs',
  'scripts/ai-sync-skills.mjs',
  'scripts/claude-preflight.mjs',
  'scripts/governance/project-ui-routing-validate.mjs',
  'scripts/skill-sync-engine.mjs',
]
const P5_TERMINAL_DOCUMENT = 'wiki/canonical/design/project-ui-routing.md'
const P5_LIFECYCLE_DOCUMENTS = [
  '.ai/skills/project-ui/SKILL.md',
  '.ai/skills/project-ui/references/platform-invariants.md',
  '.ai/skills/project-ui/references/validation.md',
  'wiki/canonical/design/machine-ui-policy.md',
  'wiki/canonical/design/project-ui-skill.md',
]
const P3_P4_TERMINAL_MARKERS = [
  'P3_COMPLETE',
  'P4_STARTED',
  'P4_COMPLETE',
  'COLD_START_ATOMIC_REPLACEMENT_COMPLETE',
  'AGENTS_TRACKED',
  'CLAUDE_TRACKED',
  'CLAUDE_ADAPTER_TRACKED',
  'ADAPTER_MANIFEST_COLD_START_COMPLETE',
  'ADAPTER_GENERATION_DETERMINISTIC',
  'AI_SYNC_IDEMPOTENT',
  'FRESH_CLONE_ENTRYPOINTS_PASS',
]
const P5_TERMINAL_MARKER_EXPECTATIONS = new Map([
  ['P5_STARTED', 'yes'],
  ['P5_COMPLETE', 'yes'],
  ['PROJECT_UI_DISCOVERED', 'yes'],
  ['PROJECT_UI_ROUTED', 'yes'],
  ['PROJECT_UI_SYNCHRONIZED', 'yes'],
  ['PROJECT_UI_ADAPTER_ACTIVATED', 'yes'],
  ['PROJECT_UI_LOCKED', 'yes'],
  ['PROJECT_UI_CODEX_SYNC_CONTRACT_COMPLETE', 'yes'],
  ['PROJECT_UI_CLAUDE_SYNC_CONTRACT_COMPLETE', 'yes'],
  ['SKILL_ROUTING_MANIFEST_CURRENT', 'yes'],
  ['ROUTING_SCOPE_REGISTRY_COMPLETE', 'yes'],
  ['SKILLS_LOCK_CURRENT', 'yes'],
  ['RULE_INDEX_CURRENT', 'yes'],
  ['NODE_PYTHON_ROUTER_PARITY', 'yes'],
  ['GENERIC_UI_ROUTES_TO_PROJECT_UI', 'yes'],
  ['MOTION_ROUTING_CONDITIONAL', 'yes'],
  ['NON_UI_ROUTING_PRESERVED', 'yes'],
  ['ADAPTER_PROJECT_UI_MAPPING_COMPLETE', 'yes'],
  ['CODEX_ADAPTER_PROJECT_UI_ACTIVE', 'yes'],
  ['CLAUDE_ADAPTER_PROJECT_UI_ACTIVE', 'yes'],
  ['SOURCE_SCANNER_IMPLEMENTED', 'no'],
  ['PAGE_CONTRACT_CREATED', 'no'],
  ['LEGACY_SKILLS_RETIRED', 'no'],
  ['LEGACY_RULES_RETIRED', 'no'],
])
const LIFECYCLE_MARKERS = [...P3_P4_TERMINAL_MARKERS, ...P5_TERMINAL_MARKER_EXPECTATIONS.keys()]

class ValidationFailure extends Error {
  constructor(code, message, details = {}) {
    super(message)
    this.name = 'ValidationFailure'
    this.code = code
    this.details = details
  }
}

const fail = (code, message, details) => {
  throw new ValidationFailure(code, message, details)
}

const run = (command, args, { root = ROOT, env = process.env, allowFailure = false } = {}) => {
  const result = spawnSync(command, args, {
    cwd: root,
    env,
    encoding: 'utf8',
    stdio: 'pipe',
  })
  if (result.error)
    fail('COMMAND_FAILED', `${command} could not start`, { command, code: result.error.code })
  if (!allowFailure && result.status !== 0) {
    fail('COMMAND_FAILED', `${command} exited with status ${result.status}`, {
      command,
      status: result.status,
      stderr: result.stderr.trim(),
    })
  }
  return result
}

const git = (args, options = {}) => run('git', args, options)
const splitNull = value => value.split('\0').filter(Boolean)
const read = (root, relPath) => fs.readFileSync(path.join(root, relPath))
const readText = (root, relPath) => read(root, relPath).toString('utf8')
const exists = (root, relPath) => fs.existsSync(path.join(root, relPath))
const clone = value => structuredClone(value)

const addCheck = (checks, id, details = {}) => checks.push({ id, status: 'pass', ...details })

const stripHistoricalSections = content => {
  const retained = []
  let historicalDepth = null
  for (const line of content.split('\n')) {
    const heading = /^(#{1,6})\s+(.+)$/u.exec(line)
    if (heading) {
      const depth = heading[1].length
      if (historicalDepth !== null && depth <= historicalDepth) historicalDepth = null
      if (/\bhistor(?:y|ical)\b/iu.test(heading[2])) historicalDepth = depth
    }
    if (historicalDepth === null) retained.push(line)
  }
  return retained.join('\n')
}

const validateForbiddenContent = (relPath, content, { phaseClosed = false } = {}) => {
  if (!COLD_OUTPUT_PATHS.has(relPath)) return
  const current = stripHistoricalSections(content)
  if (/\/(?:private\/)?tmp\//u.test(current))
    fail('TEMP_PATH_LEAK', `Temporary path leaked into ${relPath}`)
  if (/(?:\/Users\/|\/home\/|file:\/\/\/|[A-Za-z]:\\)/u.test(current)) {
    fail('ABSOLUTE_PATH_LEAK', `Absolute local path leaked into ${relPath}`)
  }
  if (/\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z\b/u.test(current)) {
    fail('TIMESTAMP_LEAK', `Timestamp leaked into ${relPath}`)
  }
  if (
    /(?:\b(?:sk|ghp|github_pat|xox[baprs])_[A-Za-z0-9_-]{12,}\b|OPENAI_API_KEY\s*=\s*\S+)/u.test(
      current
    )
  ) {
    fail('SECRET_LIKE_VALUE', `Secret-like value leaked into ${relPath}`)
  }
  if (/\b(?:must|required to) run pnpm ai:sync before\b/iu.test(current)) {
    fail('REQUIRED_PRIOR_SYNC_CLAIM', `Prior sync is incorrectly required by ${relPath}`)
  }
  for (const marker of LIFECYCLE_MARKERS) {
    const match = new RegExp(`\\b${marker}=(yes|no)\\b`, 'u').exec(current)
    if (!match) continue
    if (phaseClosed && marker === 'P4_STARTED' && match[1] === 'no') {
      fail('STALE_LIFECYCLE_CLAIM', `Closed lifecycle contains ${marker}=no`)
    }
    fail(
      'FORBIDDEN_LIFECYCLE_CLAIM',
      `Lifecycle claim leaked into ${relPath}: ${marker}=${match[1]}`
    )
  }
}

const validateClaudePointerContent = content => {
  const requiredLinks = [
    '[AGENTS.md](./AGENTS.md)',
    '[.ai/protocol/AGENTS.core.md](./.ai/protocol/AGENTS.core.md)',
    '[.ai/protocol/adapters/claude.md](./.ai/protocol/adapters/claude.md)',
  ]
  if (requiredLinks.some(link => !content.includes(link))) {
    fail('BROKEN_POINTER', 'CLAUDE.md must point to all tracked repository entrypoints')
  }
}

const validatePointerResolution = (root, content) => {
  validateClaudePointerContent(content)
  for (const match of content.matchAll(/\]\(([^)]+)\)/gu)) {
    const target = match[1]
    if (/^(?:https?:|#)/u.test(target)) continue
    const normalized = path.posix.normalize(target.replace(/^\.\//u, ''))
    const absolute = path.resolve(root, normalized)
    if (
      !(absolute === path.resolve(root) || absolute.startsWith(`${path.resolve(root)}${path.sep}`))
    ) {
      fail('BROKEN_POINTER', `Pointer escapes repository: ${target}`)
    }
    if (!fs.existsSync(absolute)) fail('BROKEN_POINTER', `Pointer target is missing: ${target}`)
  }
}

const assertOutputBytes = (manifest, expected, actual) => {
  for (const declaration of manifest.coldStart.outputs) {
    const bytes = actual.get(declaration.id)
    if (!bytes) fail('MISSING_OUTPUT', `Generated output is missing: ${declaration.path}`)
    if (!bytes.equals(expected.get(declaration.id))) {
      fail('STALE_OUTPUT', `Generated output is stale: ${declaration.path}`)
    }
  }
}

const assertTrackedDeclaration = (declaration, tracked, ignored, { allowPending = false } = {}) => {
  if (ignored.has(declaration.path))
    fail('IGNORED_OUTPUT', `Cold-start output is ignored: ${declaration.path}`)
  if (tracked.has(declaration.path)) return
  if (allowPending && PENDING_ADDITION_PATHS.has(declaration.path)) return
  fail('UNTRACKED_OUTPUT', `Cold-start output is not tracked: ${declaration.path}`)
}

const assertDeterministicOutputs = (first, second) => {
  if (first.size !== second.size)
    fail('NONDETERMINISTIC_RENDERING', 'Repeated rendering changed output count')
  for (const [id, bytes] of first) {
    if (!second.get(id)?.equals(bytes))
      fail('NONDETERMINISTIC_RENDERING', `Repeated rendering changed ${id}`)
  }
}

const assertExpectedDigest = (expected, actual) => {
  for (const [id, bytes] of expected) {
    if (sha256(bytes) !== sha256(actual.get(id) ?? Buffer.alloc(0))) {
      fail('EXPECTED_CONTENT_MISMATCH', `Expected-content digest mismatch: ${id}`)
    }
  }
}

const assertDeclaredWrites = writes => {
  const expected = [...COLD_OUTPUT_PATHS].sort()
  const actual = [...writes].sort()
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    fail('UNDECLARED_GENERATED_WRITE', 'Generator wrote outside its declared six-output boundary')
  }
}

const assertSnapshotEqual = (before, after, code = 'SYNC_DRIFT') => {
  if (canonicalSerialize([...before.entries()]) !== canonicalSerialize([...after.entries()])) {
    fail(code, 'Snapshot drift detected')
  }
}

const describePath = (root, relPath) => {
  const absolute = path.join(root, relPath)
  if (!fs.existsSync(absolute)) return { type: 'missing', mode: null, digest: null }
  const stat = fs.lstatSync(absolute)
  const mode = stat.mode & 0o777
  if (stat.isSymbolicLink()) {
    return { type: 'symlink', mode, digest: sha256(Buffer.from(fs.readlinkSync(absolute), 'utf8')) }
  }
  if (stat.isDirectory()) return { type: 'directory', mode, digest: null }
  if (stat.isFile()) return { type: 'file', mode, digest: sha256(fs.readFileSync(absolute)) }
  return { type: 'other', mode, digest: null }
}

const listTree = (root, relRoot) => {
  if (!exists(root, relRoot)) return []
  const result = [relRoot]
  const visit = relDirectory => {
    const entries = fs
      .readdirSync(path.join(root, relDirectory), { withFileTypes: true })
      .sort((left, right) => left.name.localeCompare(right.name))
    for (const entry of entries) {
      const relEntry = path.posix.join(relDirectory, entry.name)
      result.push(relEntry)
      if (entry.isDirectory() && !entry.isSymbolicLink()) visit(relEntry)
    }
  }
  if (fs.lstatSync(path.join(root, relRoot)).isDirectory()) visit(relRoot)
  return result
}

const snapshotSelection = (root, exactPaths = [], recursiveRoots = []) => {
  const paths = new Set(exactPaths)
  for (const relRoot of recursiveRoots)
    for (const relPath of listTree(root, relRoot)) paths.add(relPath)
  return new Map([...paths].sort().map(relPath => [relPath, describePath(root, relPath)]))
}

const committedIgnoreSet = (root, relPaths) => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ccd-cold-ignore-'))
  try {
    fs.copyFileSync(path.join(root, '.gitignore'), path.join(tempRoot, '.gitignore'))
    run('git', ['init', '-q'], { root: tempRoot })
    const ignored = new Set()
    for (const relPath of relPaths) {
      const absolute = path.join(tempRoot, relPath)
      fs.mkdirSync(path.dirname(absolute), { recursive: true })
      fs.writeFileSync(absolute, 'candidate\n', 'utf8')
      const result = run(
        'git',
        ['-c', 'core.excludesFile=/dev/null', 'check-ignore', '--no-index', '--', relPath],
        { root: tempRoot, allowFailure: true }
      )
      if (result.status === 0) ignored.add(relPath)
      else if (result.status !== 1)
        fail('IGNORE_POLICY_CHECK_FAILED', `git check-ignore failed for ${relPath}`)
    }
    return ignored
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true })
  }
}

const localExcludeState = root => {
  const result = git(['check-ignore', '-v', '--no-index', '--', 'CLAUDE.md'], {
    root,
    allowFailure: true,
  })
  return {
    ignored: result.status === 0,
    localExclude: result.status === 0 && result.stdout.includes('.git/info/exclude'),
  }
}

const trackedSet = root => new Set(splitNull(git(['ls-files', '-z'], { root }).stdout))

const actualOutputMap = (root, manifest) =>
  new Map(
    manifest.coldStart.outputs
      .filter(declaration => exists(root, declaration.path))
      .map(declaration => [declaration.id, read(root, declaration.path)])
  )

const validateCandidateOutputs = (
  root,
  manifest,
  expected,
  {
    tracked = trackedSet(root),
    ignored = committedIgnoreSet(root, COLD_OUTPUT_PATHS),
    allowPending = false,
  } = {}
) => {
  const actual = actualOutputMap(root, manifest)
  assertOutputBytes(manifest, expected, actual)
  for (const declaration of manifest.coldStart.outputs) {
    assertTrackedDeclaration(declaration, tracked, ignored, { allowPending })
    validateForbiddenContent(declaration.path, actual.get(declaration.id).toString('utf8'))
  }
  validatePointerResolution(root, actual.get('ROOT_CLAUDE').toString('utf8'))
  return actual
}

const readHeadFile = (root, relPath) => git(['show', `HEAD:${relPath}`], { root }).stdout

const validateCoreContracts = (
  root,
  manifest,
  expected,
  { baselineRoot = root, enforceBaselineScope = true } = {}
) => {
  for (const relPath of CORE_PATHS)
    if (!exists(root, relPath)) fail('MISSING_CORE_PATH', `Core path is missing: ${relPath}`)

  const currentIgnore = readText(root, '.gitignore')
  if (enforceBaselineScope) {
    const headIgnore = readHeadFile(baselineRoot, '.gitignore')
    const withoutBroadRules = headIgnore.replace(
      '# Generated AI adapters\nAGENTS.md\nCLAUDE.md\n',
      '# Generated AI adapters\n'
    )
    if (currentIgnore !== headIgnore && currentIgnore !== withoutBroadRules) {
      fail('IGNORE_POLICY_SCOPE', '.gitignore changed outside the two broad adapter rules')
    }
  }
  const ignoreLines = currentIgnore.split('\n')
  if (ignoreLines.includes('AGENTS.md') || ignoreLines.includes('CLAUDE.md')) {
    fail('BROAD_IGNORE_RULE_REMAINS', 'Broad adapter ignore rules remain')
  }
  for (const retained of [
    '.claude/settings.local.json',
    '.claude/skills/',
    '.ai/runtime/repair_list.md',
  ]) {
    if (!ignoreLines.includes(retained))
      fail('REQUIRED_IGNORE_RULE_MISSING', `Required local ignore rule is missing: ${retained}`)
  }

  if (!read(root, 'AGENTS.md').equals(read(root, '.ai/protocol/AI.entry.md'))) {
    fail('AGENTS_ENTRY_MISMATCH', 'AGENTS.md must be byte-identical to .ai/protocol/AI.entry.md')
  }

  const manifestText = readText(root, '.ai/protocol/adapter-manifest.json')
  if (LIFECYCLE_MARKERS.some(marker => manifestText.includes(`${marker}=`))) {
    fail('MANIFEST_LIFECYCLE_STATE', 'Adapter manifest contains current lifecycle state')
  }

  const syncSource = readText(root, SYNC_PATH)
  for (const required of [
    'scripts/generate-ai-protocol-adapters.mjs',
    'scripts/generate-rule-index.mjs',
    'scripts/generate-unocss-ide-data.mjs',
    '.ai/runtime/repair_list.template.md',
  ]) {
    if (!syncSource.includes(required))
      fail('SYNC_CONTRACT_MISSING', `ai-sync is missing: ${required}`)
  }
  for (const forbidden of [
    'scripts/migrate-ledger.mjs',
    'scripts/ai-sync-codex.mjs',
    "legacyPaths = ['.cursor']",
  ]) {
    if (syncSource.includes(forbidden))
      fail('SYNC_FORBIDDEN_OPERATION', `ai-sync still contains: ${forbidden}`)
  }

  const packageJson = JSON.parse(readText(root, 'package.json'))
  if (
    packageJson.scripts?.['ai:cold-start:validate'] !==
    'node scripts/governance/cold-start-validate.mjs'
  ) {
    fail('PACKAGE_COMMAND_MISSING', 'ai:cold-start:validate package command is invalid')
  }
  if (enforceBaselineScope) {
    const headPackage = JSON.parse(readHeadFile(baselineRoot, 'package.json'))
    if (!headPackage.scripts?.['ai:cold-start:validate']) {
      const comparable = clone(packageJson)
      delete comparable.scripts['ai:cold-start:validate']
      if (canonicalSerialize(comparable) !== canonicalSerialize(headPackage)) {
        fail('PACKAGE_SCRIPT_SCOPE', 'package.json changed beyond ai:cold-start:validate')
      }
    }
  }

  if (
    manifest.coldStart.generatorOwner !== GENERATOR_OWNER ||
    manifest.coldStart.validationOwner !== VALIDATION_OWNER
  ) {
    fail('OWNER_CONTRACT_MISMATCH', 'Cold-start owners are invalid')
  }
  if (new Set(manifest.coldStart.outputs.map(output => output.owner)).size !== 1) {
    fail('MULTIPLE_GENERATION_OWNERS', 'Outputs have multiple generation owners')
  }
  if (expected.size !== 6) fail('OUTPUT_SET_MISMATCH', 'Expected render must contain six outputs')
}

const allIndexes = (source, needle) => {
  const indexes = []
  let offset = 0
  while (offset < source.length) {
    const index = source.indexOf(needle, offset)
    if (index === -1) break
    indexes.push(index)
    offset = index + needle.length
  }
  return indexes
}

const validateConsumerContracts = root => {
  const preflight = readText(root, 'scripts/codex-preflight.mjs')
  if (!preflight.includes("runNodeScript(coldStartScript, ['--implementation'])")) {
    fail(
      'PREFLIGHT_COLD_START_MISSING',
      'Codex preflight must run implementation-mode cold-start validation'
    )
  }
  if (preflight.includes("'.ai/runtime/repair_list.md'")) {
    fail(
      'PREFLIGHT_LOCAL_RUNTIME_PREREQUISITE',
      'Codex preflight must not require an unmaterialized local runtime file'
    )
  }
  if (!preflight.includes('[WARN] optional Codex home skills are not installed')) {
    fail('PREFLIGHT_OPTIONAL_SKILL_WARNING_MISSING', 'Codex home Skill absence must be a warning')
  }
  const passedExpression = /const passed =([\s\S]+?)console\.log/u.exec(preflight)?.[1] ?? ''
  if (passedExpression.includes('missingLocalCodexSkills')) {
    fail(
      'PREFLIGHT_OPTIONAL_SKILLS_FATAL',
      'Optional Codex home Skills still affect preflight success'
    )
  }

  const workspace = readText(root, 'scripts/validate-workspace.mjs')
  const coldIndexes = allIndexes(workspace, "step('AI cold-start validation'")
  const syncIndexes = allIndexes(workspace, "step('AI adapter sync'")
  const skillIndex = workspace.indexOf("step('Codex skill sync'")
  if (
    coldIndexes.length !== 2 ||
    syncIndexes.length !== 2 ||
    !(
      coldIndexes[0] < syncIndexes[0] &&
      syncIndexes[0] < skillIndex &&
      coldIndexes[1] < syncIndexes[1]
    )
  ) {
    fail(
      'WORKSPACE_COLD_START_ORDER',
      'Workspace cold-start gates are not before existing sync steps'
    )
  }
}

const changedPathState = (
  root,
  { allowedPaths = AUTHORIZED_PATHS, requireEmptyIndex = true, forbidP4_4 = false } = {}
) => {
  const staged = splitNull(git(['diff', '--cached', '--name-only', '-z'], { root }).stdout)
  if (requireEmptyIndex && staged.length > 0)
    fail('INDEX_NOT_EMPTY', 'Implementation validation requires an empty index', { staged })
  const changed = new Set(splitNull(git(['diff', '--name-only', '-z'], { root }).stdout))
  for (const relPath of staged) changed.add(relPath)
  for (const relPath of splitNull(
    git(['ls-files', '--others', '--exclude-standard', '-z'], { root }).stdout
  )) {
    changed.add(relPath)
  }
  const tracked = trackedSet(root)
  for (const relPath of PENDING_ADDITION_PATHS) {
    if (exists(root, relPath) && !tracked.has(relPath)) changed.add(relPath)
  }
  const lifecycle = [...changed].filter(relPath => P4_4_PATHS.has(relPath)).sort()
  if (forbidP4_4 && lifecycle.length > 0)
    fail('P4_4_SCOPE_VIOLATION', 'P4.4 paths changed during P4.3', { lifecycle })
  const unauthorized = [...changed].filter(relPath => !allowedPaths.has(relPath)).sort()
  if (unauthorized.length > 0)
    fail('UNAUTHORIZED_CHANGED_PATH', 'Candidate contains unauthorized paths', { unauthorized })
  return { changed: [...changed].sort(), staged }
}

const generatorCheckIsReadOnly = (root, manifest) => {
  const before = snapshotSelection(
    root,
    manifest.coldStart.outputs.map(output => output.path)
  )
  const result = run(process.execPath, [GENERATOR_PATH, '--check'], { root })
  const after = snapshotSelection(
    root,
    manifest.coldStart.outputs.map(output => output.path)
  )
  assertSnapshotEqual(before, after, 'CHECK_MODE_WROTE_OUTPUT')
  return result.status === 0
}

const copyCandidatePath = (sourceRoot, targetRoot, relPath) => {
  const source = path.join(sourceRoot, relPath)
  if (!fs.existsSync(source)) return
  const target = path.join(targetRoot, relPath)
  fs.mkdirSync(path.dirname(target), { recursive: true })
  const stat = fs.lstatSync(source)
  if (stat.isSymbolicLink()) fs.symlinkSync(fs.readlinkSync(source), target)
  else fs.copyFileSync(source, target, fs.constants.COPYFILE_EXCL)
}

const materializeFreshCandidate = root => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ccd-cold-candidate-'))
  const paths = trackedSet(root)
  for (const relPath of splitNull(
    git(['ls-files', '--others', '--exclude-standard', '-z'], { root }).stdout
  )) {
    if (AUTHORIZED_PATHS.has(relPath)) paths.add(relPath)
  }
  for (const relPath of PENDING_ADDITION_PATHS) paths.add(relPath)
  for (const relPath of [...paths].sort()) copyCandidatePath(root, tempRoot, relPath)
  return tempRoot
}

const listFiles = (root, relRoot = '.') => {
  const result = []
  const visit = relDirectory => {
    for (const entry of fs
      .readdirSync(path.join(root, relDirectory), { withFileTypes: true })
      .sort((left, right) => left.name.localeCompare(right.name))) {
      if (relDirectory === '.' && entry.name === '.git') continue
      const relEntry = relDirectory === '.' ? entry.name : path.posix.join(relDirectory, entry.name)
      if (entry.isDirectory() && !entry.isSymbolicLink()) visit(relEntry)
      else result.push(relEntry)
    }
  }
  visit(relRoot)
  return result.sort()
}

const copyCandidateTree = sourceRoot => {
  const targetRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ccd-cold-copy-'))
  for (const relPath of listFiles(sourceRoot)) copyCandidatePath(sourceRoot, targetRoot, relPath)
  return targetRoot
}

const assertDeclaredMutationBoundary = (before, after) => {
  const paths = new Set([...before.keys(), ...after.keys()])
  const changed = new Set()
  for (const relPath of paths) {
    if (canonicalSerialize(before.get(relPath)) !== canonicalSerialize(after.get(relPath))) {
      changed.add(relPath)
    }
  }
  assertDeclaredWrites(changed)
}

const validateDeclaredWriteBoundary = (
  sourceRoot,
  manifest,
  expected,
  { generatorPath = GENERATOR_PATH } = {}
) => {
  const candidate = copyCandidateTree(sourceRoot)
  try {
    for (const relPath of COLD_OUTPUT_PATHS)
      fs.rmSync(path.join(candidate, relPath), { force: true })
    const before = snapshotSelection(candidate, listFiles(candidate))
    run(process.execPath, [generatorPath], { root: candidate })
    const after = snapshotSelection(candidate, listFiles(candidate))
    assertDeclaredMutationBoundary(before, after)
    const comparison = compareOutputs(manifest, expected, { root: candidate })
    if (comparison.some(output => !output.matches))
      fail('FRESH_CANDIDATE_DRIFT', 'Fresh candidate outputs differ')
  } finally {
    fs.rmSync(candidate, { recursive: true, force: true })
  }
}

const validateFreshCandidateAndWriteBoundary = root => {
  const candidate = materializeFreshCandidate(root)
  try {
    const { manifest } = loadManifest({ root: candidate })
    validateManifest(manifest, { root: candidate })
    const expected = renderOutputs(manifest, { root: candidate })
    const candidateTracked = trackedSet(root)
    for (const relPath of PENDING_ADDITION_PATHS) candidateTracked.add(relPath)
    validateCandidateOutputs(candidate, manifest, expected, {
      tracked: candidateTracked,
      ignored: committedIgnoreSet(candidate, COLD_OUTPUT_PATHS),
    })
    validateDeclaredWriteBoundary(candidate, manifest, expected)
  } finally {
    fs.rmSync(candidate, { recursive: true, force: true })
  }
}

const snapshotSyncState = (root, { trackedPaths, includeWholeTree = false } = {}) => {
  const exactPaths = new Set([
    ...(trackedPaths ?? trackedSet(root)),
    ...COLD_OUTPUT_PATHS,
    ...GENERATED_AUXILIARY_PATHS,
    ...IMMUTABLE_PATHS,
    '.ai/runtime/repair_list.md',
  ])
  if (includeWholeTree) for (const relPath of listFiles(root)) exactPaths.add(relPath)
  return snapshotSelection(root, [...exactPaths], PRESERVED_LOCAL_ROOTS)
}

const normalizeAllowedRepairMaterialization = (root, before, after) => {
  const repairPath = '.ai/runtime/repair_list.md'
  if (before.get(repairPath)?.type !== 'missing') return after
  if (after.get(repairPath)?.type !== 'file') return after
  if (!read(root, repairPath).equals(read(root, '.ai/runtime/repair_list.template.md'))) {
    fail('RUNTIME_REPAIR_TEMPLATE_MISMATCH', 'New repair list does not match its tracked template')
  }
  const normalized = new Map(after)
  normalized.set(repairPath, before.get(repairPath))
  return normalized
}

const runAiSyncTwice = (
  root,
  { trackedPaths, includeWholeTree = false, syncPath = SYNC_PATH } = {}
) => {
  const before = snapshotSyncState(root, { trackedPaths, includeWholeTree })

  run(process.execPath, [syncPath], { root })
  const first = snapshotSyncState(root, { trackedPaths, includeWholeTree })
  assertSnapshotEqual(
    before,
    normalizeAllowedRepairMaterialization(root, before, first),
    'SYNC_FIRST_RUN_DRIFT'
  )

  run(process.execPath, [syncPath], { root })
  const second = snapshotSyncState(root, { trackedPaths, includeWholeTree })
  assertSnapshotEqual(first, second, 'SYNC_DRIFT')

  return { firstRunStable: true, runtimePreserved: true, secondRunStable: true }
}

const structuralValidation = ({
  root = ROOT,
  mode = 'implementation',
  allowedPaths = AUTHORIZED_PATHS,
  requireEmptyIndex = true,
  forbidP4_4 = false,
} = {}) => {
  const checks = []
  const { manifest } = loadManifest({ root })
  validateManifest(manifest, { root })
  addCheck(checks, 'MANIFEST_CONTRACT')

  const expectedFirst = renderOutputs(manifest, { root })
  const expectedSecond = renderOutputs(manifest, { root })
  assertDeterministicOutputs(expectedFirst, expectedSecond)
  addCheck(checks, 'DETERMINISTIC_RENDERING')

  const sourceDigests = digestCanonicalSources(manifest, { root })
  const fingerprintsFirst = fingerprintOutputs(manifest, expectedFirst, sourceDigests, { root })
  const fingerprintsSecond = fingerprintOutputs(manifest, expectedSecond, sourceDigests, { root })
  assertSnapshotEqual(fingerprintsFirst, fingerprintsSecond, 'FINGERPRINT_DRIFT')
  for (const fingerprint of fingerprintsFirst.values()) {
    if (!/^[a-f0-9]{64}$/u.test(fingerprint))
      fail('INVALID_FINGERPRINT', 'Fingerprint is not SHA-256')
  }
  addCheck(checks, 'FINGERPRINTS')

  validateCoreContracts(root, manifest, expectedFirst)
  addCheck(checks, 'ATOMIC_CORE')

  validateConsumerContracts(root)
  addCheck(checks, 'CONSUMER_INTEGRATION')

  const ignored = committedIgnoreSet(root, COLD_OUTPUT_PATHS)
  if (ignored.size > 0)
    fail('COMMITTED_IGNORE_POLICY', 'Committed ignore policy excludes cold-start outputs')
  addCheck(checks, 'COMMITTED_IGNORE_POLICY')

  const tracked = trackedSet(root)
  validateCandidateOutputs(root, manifest, expectedFirst, { tracked, ignored, allowPending: true })
  addCheck(checks, 'CANDIDATE_OUTPUTS')

  generatorCheckIsReadOnly(root, manifest)
  addCheck(checks, 'GENERATOR_CHECK_MODE')

  validateFreshCandidateAndWriteBoundary(root)
  addCheck(checks, 'FRESH_CANDIDATE_ARCHIVE')
  addCheck(checks, 'DECLARED_WRITE_BOUNDARY')

  const scopeBefore = changedPathState(root, {
    allowedPaths,
    requireEmptyIndex,
    forbidP4_4,
  })
  addCheck(checks, 'AUTHORIZED_SCOPE', { paths: scopeBefore.changed })

  const sync = runAiSyncTwice(root, { trackedPaths: tracked })
  addCheck(checks, 'AI_SYNC_IDEMPOTENCY', sync)

  const scopeAfter = changedPathState(root, {
    allowedPaths,
    requireEmptyIndex,
    forbidP4_4,
  })
  addCheck(checks, 'POST_SYNC_AUTHORIZED_SCOPE', { paths: scopeAfter.changed })

  const comparison = compareOutputs(manifest, expectedFirst, { root })
  if (comparison.some(output => !output.matches))
    fail('POST_SYNC_OUTPUT_DRIFT', 'Outputs drifted after ai-sync')

  const excludeState = localExcludeState(root)
  addCheck(checks, 'LOCAL_EXCLUDE_NON_AUTHORITATIVE', excludeState)
  const outputs = manifest.coldStart.outputs.map(declaration => ({
    id: declaration.id,
    path: declaration.path,
    actualSha256: comparison.find(output => output.id === declaration.id).actualSha256,
    expectedSha256: comparison.find(output => output.id === declaration.id).expectedSha256,
    fingerprint: fingerprintsFirst.get(declaration.id),
    trackedState: tracked.has(declaration.path) ? 'tracked' : 'pending-add',
    committedIgnoreState: ignored.has(declaration.path) ? 'ignored' : 'not-ignored',
  }))

  return {
    schemaVersion: COLD_START_SCHEMA_VERSION,
    mode,
    ok: true,
    diagnostics: [],
    checks,
    outputs,
    ignorePolicy: {
      committedIgnoredPaths: [...ignored].sort(),
      localClaudeIgnored: excludeState.ignored,
      localClaudeExcluded: excludeState.localExclude,
    },
  }
}

const implementationValidation = ({ root = ROOT } = {}) =>
  structuralValidation({
    root,
    mode: 'implementation',
    allowedPaths: AUTHORIZED_PATHS,
    requireEmptyIndex: true,
    forbidP4_4: true,
  })

const expectFailure = (records, id, expectedCode, operation) => {
  let actualCode = 'NO_ERROR'
  try {
    operation()
  } catch (error) {
    actualCode = error.code ?? error.name
  }
  records.push({ id, expectedCode, actualCode, pass: actualCode === expectedCode })
}

const expectPass = (records, id, operation) => {
  let actualCode = 'PASS'
  try {
    operation()
  } catch (error) {
    actualCode = error.code ?? error.name
  }
  records.push({ id, expectedCode: 'PASS', actualCode, pass: actualCode === 'PASS' })
}

const runSelfTestsInFixture = root => {
  const records = []
  const { manifest } = loadManifest({ root })
  const expected = renderOutputs(manifest, { root })
  const baseActual = new Map(expected)
  const declarations = new Map(manifest.coldStart.outputs.map(output => [output.id, output]))

  expectFailure(records, 'missing-agents', 'MISSING_OUTPUT', () => {
    const actual = new Map(baseActual)
    actual.delete('ROOT_AGENTS')
    assertOutputBytes(manifest, expected, actual)
  })
  expectFailure(records, 'untracked-agents', 'UNTRACKED_OUTPUT', () => {
    assertTrackedDeclaration(declarations.get('ROOT_AGENTS'), new Set(), new Set())
  })
  expectFailure(records, 'ignored-agents', 'IGNORED_OUTPUT', () => {
    assertTrackedDeclaration(declarations.get('ROOT_AGENTS'), new Set(), new Set(['AGENTS.md']), {
      allowPending: true,
    })
  })
  expectFailure(records, 'stale-agents', 'STALE_OUTPUT', () => {
    const actual = new Map(baseActual)
    actual.set('ROOT_AGENTS', Buffer.from('stale\n'))
    assertOutputBytes(manifest, expected, actual)
  })
  expectFailure(records, 'missing-claude', 'MISSING_OUTPUT', () => {
    const actual = new Map(baseActual)
    actual.delete('ROOT_CLAUDE')
    assertOutputBytes(manifest, expected, actual)
  })
  expectFailure(records, 'broken-claude-pointer', 'BROKEN_POINTER', () =>
    validateClaudePointerContent('# broken\n')
  )
  expectFailure(records, 'missing-tracked-claude-adapter', 'UNTRACKED_OUTPUT', () => {
    const tracked = new Set(
      manifest.coldStart.outputs
        .filter(output => output.id !== 'CLAUDE_ADAPTER')
        .map(output => output.path)
    )
    validateCandidateOutputs(root, manifest, expected, { tracked, ignored: new Set() })
  })
  expectFailure(records, 'stale-claude-adapter', 'STALE_OUTPUT', () => {
    const actual = new Map(baseActual)
    actual.set('CLAUDE_ADAPTER', Buffer.from('stale\n'))
    assertOutputBytes(manifest, expected, actual)
  })
  expectFailure(records, 'manifest-output-omitted', 'OUTPUT_SET_MISMATCH', () => {
    const mutated = clone(manifest)
    mutated.coldStart.outputs.pop()
    validateManifest(mutated, { root, checkFileSystem: false })
  })
  expectFailure(records, 'duplicate-output-path', 'DUPLICATE_OUTPUT_PATH', () => {
    const mutated = clone(manifest)
    mutated.coldStart.outputs[1].path = mutated.coldStart.outputs[0].path
    validateManifest(mutated, { root, checkFileSystem: false })
  })
  expectFailure(records, 'unknown-output-kind', 'UNKNOWN_OUTPUT_KIND', () => {
    const mutated = clone(manifest)
    mutated.coldStart.outputs[0].kind = 'unknown-kind'
    validateManifest(mutated, { root, checkFileSystem: false })
  })
  expectFailure(records, 'root-agents-rejects-root-client-pointer', 'OUTPUT_KIND_MISMATCH', () => {
    const mutated = clone(manifest)
    mutated.coldStart.outputs.find(output => output.id === 'ROOT_AGENTS').kind =
      'root-client-pointer'
    validateManifest(mutated, { root, checkFileSystem: false })
  })
  expectFailure(
    records,
    'root-claude-rejects-root-compatibility-entrypoint',
    'OUTPUT_KIND_MISMATCH',
    () => {
      const mutated = clone(manifest)
      mutated.coldStart.outputs.find(output => output.id === 'ROOT_CLAUDE').kind =
        'root-compatibility-entrypoint'
      validateManifest(mutated, { root, checkFileSystem: false })
    }
  )
  expectFailure(
    records,
    'root-agents-requires-agents-aware',
    'ROOT_AGENTS_MISSING_AGENTS_AWARE',
    () => {
      const mutated = clone(manifest)
      mutated.coldStart.outputs.find(output => output.id === 'ROOT_AGENTS').targetClients = [
        'codex',
      ]
      validateManifest(mutated, { root, checkFileSystem: false })
    }
  )
  expectFailure(records, 'generic-client-entrypoint-role', 'UNKNOWN_DISCOVERY_ROLE', () => {
    const mutated = clone(manifest)
    mutated.coldStart.outputs.find(output => output.id === 'ROOT_AGENTS').discoveryRole =
      'client-entrypoint'
    validateManifest(mutated, { root, checkFileSystem: false })
  })
  expectFailure(records, 'generic-compatibility-entry-kind', 'UNKNOWN_OUTPUT_KIND', () => {
    const mutated = clone(manifest)
    mutated.coldStart.outputs.find(output => output.id === 'ROOT_AGENTS').kind =
      'compatibility-entry'
    validateManifest(mutated, { root, checkFileSystem: false })
  })
  expectFailure(records, 'incorrect-manifest-schema-id', 'MANIFEST_SCHEMA_VERSION_MISMATCH', () => {
    const mutated = clone(manifest)
    mutated.schemaVersion = '1.0.0'
    validateManifest(mutated, { root, checkFileSystem: false })
  })
  expectFailure(
    records,
    'incorrect-cold-start-schema-id',
    'COLD_START_SCHEMA_VERSION_MISMATCH',
    () => {
      const mutated = clone(manifest)
      mutated.coldStart.schemaVersion = '1.0.0'
      validateManifest(mutated, { root, checkFileSystem: false })
    }
  )
  expectFailure(records, 'version-json-canonical-source', 'CANONICAL_SOURCE_SET_MISMATCH', () => {
    const mutated = clone(manifest)
    const versionPath = '.ai/protocol/version.json'
    const hasVersionSource = mutated.coldStart.canonicalSources.some(source =>
      typeof source === 'string' ? source === versionPath : source.path === versionPath
    )
    if (!hasVersionSource) {
      mutated.coldStart.canonicalSources.push({
        path: versionPath,
        authority: 'canonical-protocol-authority',
      })
    }
    validateManifest(mutated, { root, checkFileSystem: false })
  })

  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'ccd-cold-self-test-'))
  try {
    for (const relPath of ['.ai/protocol/adapter-manifest.json']) {
      const absolute = path.join(fixture, relPath)
      fs.mkdirSync(path.dirname(absolute), { recursive: true })
      fs.copyFileSync(path.join(root, relPath), absolute)
    }
    fs.mkdirSync(path.join(fixture, '.ai/protocol/adapters'), { recursive: true })
    expectFailure(records, 'missing-canonical-source', 'MISSING_CANONICAL_SOURCE', () => {
      validateManifest(manifest, { root: fixture })
    })
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true })
  }

  expectFailure(records, 'real-dependency-cycle', 'DEPENDENCY_CYCLE', () => {
    const mutated = clone(manifest)
    mutated.coldStart.outputs
      .find(output => output.id === 'AI_ENTRY')
      .outputDependencies.push('ROOT_CLAUDE')
    validateManifest(mutated, { root, checkFileSystem: false })
  })
  expectFailure(records, 'digest-expected-content-mismatch', 'EXPECTED_CONTENT_MISMATCH', () => {
    const actual = new Map(baseActual)
    actual.set('AI_ENTRY', Buffer.from('digest mismatch\n'))
    assertExpectedDigest(expected, actual)
  })
  expectFailure(records, 'nondeterministic-rendering', 'NONDETERMINISTIC_RENDERING', () => {
    const second = new Map(baseActual)
    second.set('AI_ENTRY', Buffer.from('different\n'))
    assertDeterministicOutputs(expected, second)
  })
  expectFailure(records, 'absolute-local-path-leakage', 'ABSOLUTE_PATH_LEAK', () => {
    validateForbiddenContent('AGENTS.md', '/Users/example/ccd\n')
  })
  expectFailure(records, 'temporary-path-leakage', 'TEMP_PATH_LEAK', () => {
    validateForbiddenContent('AGENTS.md', '/tmp/ccd-candidate\n')
  })
  expectFailure(records, 'timestamp-leakage', 'TIMESTAMP_LEAK', () => {
    validateForbiddenContent('AGENTS.md', '2026-07-15T12:00:00Z\n')
  })
  expectFailure(records, 'secret-like-value-leakage', 'SECRET_LIKE_VALUE', () => {
    validateForbiddenContent('AGENTS.md', 'sk_example_12345678901234567890\n')
  })
  expectFailure(records, 'false-project-ui-routing-claim', 'FORBIDDEN_LIFECYCLE_CLAIM', () => {
    validateForbiddenContent('AGENTS.md', 'PROJECT_UI_ROUTED=yes\n')
  })
  expectFailure(
    records,
    'false-project-ui-synchronization-claim',
    'FORBIDDEN_LIFECYCLE_CLAIM',
    () => {
      validateForbiddenContent('AGENTS.md', 'PROJECT_UI_SYNCHRONIZED=yes\n')
    }
  )
  expectFailure(records, 'false-p5-started-claim', 'FORBIDDEN_LIFECYCLE_CLAIM', () => {
    validateForbiddenContent('AGENTS.md', 'P5_STARTED=yes\n')
  })
  expectFailure(records, 'stale-current-p4-not-started-claim', 'STALE_LIFECYCLE_CLAIM', () => {
    validateForbiddenContent('AGENTS.md', 'P4_STARTED=no\n', { phaseClosed: true })
  })
  const maliciousGenerator = path.join(root, 'scripts', 'cold-start-malicious-generator.mjs')
  fs.writeFileSync(
    maliciousGenerator,
    [
      "import fs from 'node:fs'",
      "import path from 'node:path'",
      `const outputs = ${JSON.stringify([...COLD_OUTPUT_PATHS])}`,
      'for (const relPath of outputs) {',
      '  fs.mkdirSync(path.dirname(relPath), { recursive: true })',
      "  fs.writeFileSync(relPath, 'generated\\n')",
      '}',
      "fs.writeFileSync('.gitignore', 'mutated\\n')",
      '',
    ].join('\n'),
    'utf8'
  )
  try {
    expectFailure(records, 'undeclared-generated-write', 'UNDECLARED_GENERATED_WRITE', () => {
      validateDeclaredWriteBoundary(root, manifest, expected, {
        generatorPath: maliciousGenerator,
      })
    })
  } finally {
    fs.rmSync(maliciousGenerator, { force: true })
  }

  const syncFixture = fs.mkdtempSync(path.join(os.tmpdir(), 'ccd-cold-sync-self-test-'))
  try {
    fs.writeFileSync(path.join(syncFixture, 'tracked.txt'), 'current\n', 'utf8')
    const maliciousSync = path.join(syncFixture, 'malicious-sync.mjs')
    fs.writeFileSync(
      maliciousSync,
      "import fs from 'node:fs'\nfs.writeFileSync('tracked.txt', 'drifted\\n')\n",
      'utf8'
    )
    expectFailure(records, 'sync-drift-current-tree', 'SYNC_FIRST_RUN_DRIFT', () => {
      runAiSyncTwice(syncFixture, {
        trackedPaths: new Set(['tracked.txt', 'malicious-sync.mjs']),
        includeWholeTree: true,
        syncPath: maliciousSync,
      })
    })
  } finally {
    fs.rmSync(syncFixture, { recursive: true, force: true })
  }

  expectPass(records, 'repository-relative-paths', () =>
    validateForbiddenContent('AGENTS.md', '.ai/protocol/AGENTS.core.md\n')
  )
  expectPass(records, 'version-numbers', () =>
    validateForbiddenContent('AGENTS.md', 'version 1.0.0\n')
  )
  expectPass(records, 'commit-shas', () =>
    validateForbiddenContent('AGENTS.md', 'ba434463811f15a52cc47d6457147fd7e0b67790\n')
  )
  expectPass(records, 'valid-markdown-links', () =>
    validateForbiddenContent('AGENTS.md', '[core](./.ai/protocol/AGENTS.core.md)\n')
  )
  expectPass(records, 'historical-p4-not-started', () => {
    validateForbiddenContent(
      'AGENTS.md',
      '# Historical baseline\nP4_STARTED=no\n# Current contract\nNo lifecycle ledger.\n',
      {
        phaseClosed: true,
      }
    )
  })
  expectPass(records, 'ignored-runtime-template-outside-outputs', () => {
    validateForbiddenContent('.ai/runtime/repair_list.template.md', 'P4_STARTED=no\n')
  })
  expectPass(records, 'claude-settings-local-outside-outputs', () => {
    validateForbiddenContent('.claude/settings.local.json', '/Users/example\n')
  })
  expectPass(records, 'claude-skills-outside-outputs', () => {
    validateForbiddenContent('.claude/skills/example.md', '/tmp/example\n')
  })

  const scopeFixture = fs.mkdtempSync(path.join(os.tmpdir(), 'ccd-cold-scope-self-test-'))
  try {
    run('git', ['init', '-q'], { root: scopeFixture })
    const lifecyclePath = 'wiki/canonical/design/ai-cold-start.md'
    fs.mkdirSync(path.join(scopeFixture, path.dirname(lifecyclePath)), { recursive: true })
    fs.writeFileSync(path.join(scopeFixture, lifecyclePath), 'candidate\n', 'utf8')
    run('git', ['add', '--', lifecyclePath], { root: scopeFixture })
    expectPass(records, 'terminal-authorizes-p4-4-scope', () => {
      changedPathState(scopeFixture, {
        allowedPaths: P4_TERMINAL_AUTHORIZED_PATHS,
        requireEmptyIndex: false,
      })
    })
    expectFailure(records, 'implementation-rejects-p4-4-scope', 'P4_4_SCOPE_VIOLATION', () => {
      changedPathState(scopeFixture, {
        allowedPaths: AUTHORIZED_PATHS,
        requireEmptyIndex: false,
        forbidP4_4: true,
      })
    })
  } finally {
    fs.rmSync(scopeFixture, { recursive: true, force: true })
  }

  const lifecycleDocuments = [
    '.ai/skills/project-ui/SKILL.md',
    '.ai/skills/project-ui/references/platform-invariants.md',
    '.ai/skills/project-ui/references/validation.md',
    'wiki/canonical/design/machine-ui-policy.md',
    'wiki/canonical/design/project-ui-skill.md',
  ]
  const p4TerminalMarkers = [
    'P3_COMPLETE=yes',
    'P4_STARTED=yes',
    'P4_COMPLETE=yes',
    'COLD_START_ATOMIC_REPLACEMENT_COMPLETE=yes',
    'AGENTS_TRACKED=yes',
    'CLAUDE_TRACKED=yes',
    'CLAUDE_ADAPTER_TRACKED=yes',
    'ADAPTER_MANIFEST_COLD_START_COMPLETE=yes',
    'ADAPTER_GENERATION_DETERMINISTIC=yes',
    'AI_SYNC_IDEMPOTENT=yes',
    'FRESH_CLONE_ENTRYPOINTS_PASS=yes',
  ]
  const preTerminalMarkers = [
    'P5_STARTED=no',
    'P5_COMPLETE=no',
    'PROJECT_UI_DISCOVERED=no',
    'PROJECT_UI_ROUTED=no',
    'PROJECT_UI_SYNCHRONIZED=no',
    'PROJECT_UI_ADAPTER_ACTIVATED=no',
    'SOURCE_SCANNER_IMPLEMENTED=no',
    'PAGE_CONTRACT_CREATED=no',
  ]
  const p5TerminalMarkers = [
    'P5_STARTED=yes',
    'P5_COMPLETE=yes',
    'PROJECT_UI_DISCOVERED=yes',
    'PROJECT_UI_ROUTED=yes',
    'PROJECT_UI_SYNCHRONIZED=yes',
    'PROJECT_UI_ADAPTER_ACTIVATED=yes',
    'PROJECT_UI_LOCKED=yes',
    'PROJECT_UI_CODEX_SYNC_CONTRACT_COMPLETE=yes',
    'PROJECT_UI_CLAUDE_SYNC_CONTRACT_COMPLETE=yes',
    'SKILL_ROUTING_MANIFEST_CURRENT=yes',
    'ROUTING_SCOPE_REGISTRY_COMPLETE=yes',
    'SKILLS_LOCK_CURRENT=yes',
    'RULE_INDEX_CURRENT=yes',
    'NODE_PYTHON_ROUTER_PARITY=yes',
    'GENERIC_UI_ROUTES_TO_PROJECT_UI=yes',
    'MOTION_ROUTING_CONDITIONAL=yes',
    'NON_UI_ROUTING_PRESERVED=yes',
    'ADAPTER_PROJECT_UI_MAPPING_COMPLETE=yes',
    'CODEX_ADAPTER_PROJECT_UI_ACTIVE=yes',
    'CLAUDE_ADAPTER_PROJECT_UI_ACTIVE=yes',
    'SOURCE_SCANNER_IMPLEMENTED=no',
    'PAGE_CONTRACT_CREATED=no',
    'LEGACY_SKILLS_RETIRED=no',
    'LEGACY_RULES_RETIRED=no',
  ]
  const p5CoreArtifacts = [
    '.ai/governance/routing/fixtures/routing-cases.json',
    '.ai/governance/routing/fixtures/sync-cases.json',
    '.ai/governance/routing/routing-scopes.schema.json',
    '.ai/governance/routing/skill-routing.schema.json',
    '.ai/manifests/routing-scopes.json',
    'scripts/ai-sync-claude.mjs',
    'scripts/ai-sync-skills.mjs',
    'scripts/claude-preflight.mjs',
    'scripts/governance/project-ui-routing-validate.mjs',
    'scripts/skill-sync-engine.mjs',
  ]
  const writeLifecycleFixture = phase => {
    const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ccd-cold-lifecycle-self-test-'))
    const markers = [
      ...p4TerminalMarkers,
      ...(phase === 'p5-terminal' ? p5TerminalMarkers : preTerminalMarkers),
    ]
    for (const relPath of lifecycleDocuments) {
      const absolute = path.join(fixtureRoot, relPath)
      fs.mkdirSync(path.dirname(absolute), { recursive: true })
      fs.writeFileSync(absolute, `# Current lifecycle\n${markers.join('\n')}\n`, 'utf8')
    }
    for (const relPath of P4_4_PATHS) {
      const absolute = path.join(fixtureRoot, relPath)
      if (fs.existsSync(absolute)) continue
      fs.mkdirSync(path.dirname(absolute), { recursive: true })
      fs.writeFileSync(absolute, 'fixture\n', 'utf8')
    }
    const policy = `${JSON.stringify(
      {
        sourceScannerImplemented: false,
        pageContractCreated: false,
        p4Started: true,
        p5Started: phase === 'p5-terminal',
      },
      null,
      2
    )}\n`
    for (const relPath of [
      '.ai/governance/policies/ui.json',
      '.ai/governance/ui/fixtures/schema-valid/ui-policy.json',
    ]) {
      fs.writeFileSync(path.join(fixtureRoot, relPath), policy, 'utf8')
    }
    fs.writeFileSync(
      path.join(fixtureRoot, '.ai/governance/coverage/project-ui-semantic-coverage.json'),
      `${JSON.stringify(
        {
          skillLockDiscovered: phase === 'p5-terminal',
          routed: phase === 'p5-terminal',
          synchronized: phase === 'p5-terminal',
          adapterActivated: phase === 'p5-terminal',
        },
        null,
        2
      )}\n`,
      'utf8'
    )
    if (phase !== 'p4-baseline') {
      for (const relPath of p5CoreArtifacts) {
        const absolute = path.join(fixtureRoot, relPath)
        fs.mkdirSync(path.dirname(absolute), { recursive: true })
        fs.writeFileSync(absolute, 'fixture\n', 'utf8')
      }
    }
    if (phase === 'p5-terminal') {
      const terminalDocument = path.join(fixtureRoot, 'wiki/canonical/design/project-ui-routing.md')
      fs.mkdirSync(path.dirname(terminalDocument), { recursive: true })
      fs.writeFileSync(terminalDocument, '# Project UI routing\n', 'utf8')
    }
    return fixtureRoot
  }

  for (const [id, phase] of [
    ['phase-p4-baseline', 'p4-baseline'],
    ['phase-valid-p5-pre-terminal', 'p5-pre-terminal'],
    ['phase-valid-p5-terminal', 'p5-terminal'],
  ]) {
    const lifecycleFixture = writeLifecycleFixture(phase)
    try {
      expectPass(records, id, () => {
        const lifecycle = inspectPhaseAwareLifecycle(lifecycleFixture)
        if (lifecycle.phase !== phase) fail('SELF_TEST_PHASE', `${id} inferred ${lifecycle.phase}`)
      })
    } finally {
      fs.rmSync(lifecycleFixture, { recursive: true, force: true })
    }
  }

  const partialTerminalFixture = writeLifecycleFixture('p5-pre-terminal')
  try {
    const partialDocument = path.join(partialTerminalFixture, lifecycleDocuments[0])
    fs.appendFileSync(partialDocument, 'P5_COMPLETE=yes\n', 'utf8')
    expectFailure(records, 'phase-partial-p5-terminal', 'P5_LIFECYCLE_PARTIAL', () =>
      inspectPhaseAwareLifecycle(partialTerminalFixture)
    )
  } finally {
    fs.rmSync(partialTerminalFixture, { recursive: true, force: true })
  }

  for (const [id, phase] of [
    ['scope-unauthorized-p5-pre-terminal', 'p5-pre-terminal'],
    ['scope-unauthorized-p5-terminal', 'p5-terminal'],
  ]) {
    const boundaryFixture = fs.mkdtempSync(path.join(os.tmpdir(), 'ccd-cold-boundary-self-test-'))
    try {
      run('git', ['init', '-q'], { root: boundaryFixture })
      fs.writeFileSync(path.join(boundaryFixture, 'unauthorized.txt'), 'fixture\n', 'utf8')
      expectFailure(records, id, 'UNAUTHORIZED_CHANGED_PATH', () =>
        validatePhaseBoundary(boundaryFixture, phase)
      )
    } finally {
      fs.rmSync(boundaryFixture, { recursive: true, force: true })
    }
  }

  return {
    schemaVersion: COLD_START_SCHEMA_VERSION,
    mode: 'self-test',
    ok: records.every(record => record.pass),
    diagnostics: records.filter(record => !record.pass).map(record => record.id),
    selfTests: records,
  }
}

const runSelfTests = ({ root = ROOT } = {}) => {
  const isolatedRoot = materializeFreshCandidate(root)
  try {
    return runSelfTestsInFixture(isolatedRoot)
  } finally {
    fs.rmSync(isolatedRoot, { recursive: true, force: true })
  }
}

const lifecycleMarkerValues = (content, marker) =>
  [...stripHistoricalSections(content).matchAll(new RegExp(`\\b${marker}=(yes|no)\\b`, 'gu'))].map(
    match => match[1]
  )

const validateP3P4TerminalState = documents => {
  for (const document of documents) {
    for (const marker of P3_P4_TERMINAL_MARKERS) {
      const actual = lifecycleMarkerValues(document.content, marker)
      if (actual.length === 0 || actual.some(value => value !== 'yes')) {
        fail('P3_P4_TERMINAL_STATE_REQUIRED', `${document.relPath} must contain ${marker}=yes`, {
          relPath: document.relPath,
          marker,
          expected: 'yes',
          actual,
        })
      }
    }
  }
}

const validateAbsentFutureArtifacts = root => {
  const pageContractPaths = [
    '.ai/governance/policies/page-contract.json',
    '.ai/governance/ui/page-contract.json',
    '.ai/governance/ui/schemas/page-contract.schema.json',
  ].filter(relPath => exists(root, relPath))
  if (pageContractPaths.length > 0) {
    fail('PAGE_CONTRACT_FALSE_POSITIVE', 'Page Contract artifacts must remain absent', {
      paths: pageContractPaths,
    })
  }
  const scannerPaths = ['.ai', 'scripts']
    .filter(relPath => exists(root, relPath))
    .flatMap(relPath => listFiles(root, relPath))
    .filter(relPath => /source[-_]?scanner/iu.test(relPath))
    .sort()
  if (scannerPaths.length > 0) {
    fail('SOURCE_SCANNER_FALSE_POSITIVE', 'Source scanner artifacts must remain absent', {
      paths: scannerPaths,
    })
  }
}

const validatePolicyLifecycleState = (root, terminal) => {
  const markerMismatches = []
  const expected = {
    sourceScannerImplemented: false,
    pageContractCreated: false,
    p4Started: true,
    p5Started: terminal,
  }
  for (const relPath of [
    '.ai/governance/policies/ui.json',
    '.ai/governance/ui/fixtures/schema-valid/ui-policy.json',
  ]) {
    if (!exists(root, relPath)) continue
    const policy = JSON.parse(readText(root, relPath))
    for (const [marker, value] of Object.entries(expected)) {
      if (policy[marker] !== value)
        markerMismatches.push({ relPath, marker, expected: value, actual: policy[marker] })
    }
  }
  const coveragePath = '.ai/governance/coverage/project-ui-semantic-coverage.json'
  if (exists(root, coveragePath)) {
    const coverage = readText(root, coveragePath)
    for (const marker of ['skillLockDiscovered', 'routed', 'synchronized', 'adapterActivated']) {
      const actual = [
        ...coverage.matchAll(new RegExp(`"${marker}"\\s*:\\s*(true|false)`, 'gu')),
      ].map(match => match[1])
      if (actual.length === 0 || actual.some(value => value !== String(terminal))) {
        markerMismatches.push({
          relPath: coveragePath,
          marker,
          expected: terminal,
          actual,
        })
      }
    }
  }
  if (markerMismatches.length > 0) {
    fail('P5_LIFECYCLE_PARTIAL', 'Policy or coverage lifecycle state is partial or mixed', {
      markerMismatches,
    })
  }
}

const validatePreTerminalMarkers = documents => {
  for (const document of documents) {
    for (const marker of P5_TERMINAL_MARKER_EXPECTATIONS.keys()) {
      const actual = lifecycleMarkerValues(document.content, marker)
      if (actual.some(value => value !== 'no')) {
        fail('P5_LIFECYCLE_PARTIAL', `${document.relPath} has premature ${marker}=yes`, {
          relPath: document.relPath,
          marker,
          actual,
        })
      }
    }
  }
}

const validateTerminalMarkers = documents => {
  for (const document of documents) {
    for (const [marker, expected] of P5_TERMINAL_MARKER_EXPECTATIONS) {
      const actual = lifecycleMarkerValues(document.content, marker)
      if (actual.length === 0 || actual.some(value => value !== expected)) {
        fail('P5_LIFECYCLE_PARTIAL', `${document.relPath} must contain ${marker}=${expected}`, {
          relPath: document.relPath,
          marker,
          expected,
          actual,
        })
      }
    }
  }
}

const inspectPhaseAwareLifecycle = root => {
  if (
    P5_4_AUTHORIZED_PATHS.size !== 34 ||
    P5_5_AUTHORIZED_PATHS.size !== 17 ||
    P5_TERMINAL_AUTHORIZED_PATHS.size !== 50
  ) {
    fail('P5_PATH_CONTRACT_DRIFT', 'Frozen P5 changed-path counts drifted', {
      p5_4: P5_4_AUTHORIZED_PATHS.size,
      p5_5: P5_5_AUTHORIZED_PATHS.size,
      terminal: P5_TERMINAL_AUTHORIZED_PATHS.size,
    })
  }
  const missingP4Paths = [...P4_4_PATHS].filter(relPath => !exists(root, relPath)).sort()
  if (missingP4Paths.length > 0)
    fail('P4_BASELINE_INCOMPLETE', 'P4 terminal artifacts are incomplete', {
      missingPaths: missingP4Paths,
    })
  const documents = P5_LIFECYCLE_DOCUMENTS.map(relPath => {
    if (!exists(root, relPath))
      fail('P4_BASELINE_INCOMPLETE', `Lifecycle document is missing: ${relPath}`)
    return { relPath, content: readText(root, relPath) }
  })
  validateP3P4TerminalState(documents)
  validateAbsentFutureArtifacts(root)

  const presentP5Artifacts = P5_CORE_ARTIFACT_PATHS.filter(relPath => exists(root, relPath))
  if (
    presentP5Artifacts.length > 0 &&
    presentP5Artifacts.length !== P5_CORE_ARTIFACT_PATHS.length
  ) {
    fail('P5_ARTIFACT_PARTIAL', 'P5 core artifacts are partial', {
      present: presentP5Artifacts,
      missing: P5_CORE_ARTIFACT_PATHS.filter(relPath => !presentP5Artifacts.includes(relPath)),
    })
  }
  const hasTerminalMarker = documents.some(document =>
    [...P5_TERMINAL_MARKER_EXPECTATIONS]
      .filter(([, expected]) => expected === 'yes')
      .some(([marker]) => lifecycleMarkerValues(document.content, marker).includes('yes'))
  )
  const terminalDocumentPresent = exists(root, P5_TERMINAL_DOCUMENT)
  if (hasTerminalMarker || terminalDocumentPresent) {
    if (presentP5Artifacts.length !== P5_CORE_ARTIFACT_PATHS.length || !terminalDocumentPresent) {
      fail('P5_LIFECYCLE_PARTIAL', 'P5 terminal lifecycle and artifacts are partial', {
        terminalDocumentPresent,
        presentP5Artifacts,
      })
    }
    validateTerminalMarkers(documents)
    validatePolicyLifecycleState(root, true)
    return {
      complete: true,
      phase: 'p5-terminal',
      lifecycleSources: documents.map(document => document.relPath),
      artifactCount: P5_TERMINAL_AUTHORIZED_PATHS.size,
    }
  }

  validatePreTerminalMarkers(documents)
  validatePolicyLifecycleState(root, false)
  const phase = presentP5Artifacts.length === 0 ? 'p4-baseline' : 'p5-pre-terminal'
  return {
    complete: true,
    phase,
    lifecycleSources: documents.map(document => document.relPath),
    artifactCount: phase === 'p4-baseline' ? P4_TERMINAL_AUTHORIZED_PATHS.size : 34,
  }
}

const phaseBoundaryConfig = phase => {
  if (phase === 'p4-baseline')
    return {
      allowedPaths: P4_TERMINAL_AUTHORIZED_PATHS,
      requireEmptyIndex: false,
      forbidP4_4: false,
    }
  if (phase === 'p5-pre-terminal')
    return {
      allowedPaths: P5_4_AUTHORIZED_PATHS,
      requireEmptyIndex: true,
      forbidP4_4: false,
    }
  if (phase === 'p5-terminal')
    return {
      allowedPaths: P5_TERMINAL_AUTHORIZED_PATHS,
      requireEmptyIndex: true,
      forbidP4_4: false,
    }
  fail('UNKNOWN_LIFECYCLE_PHASE', `Unknown lifecycle phase: ${phase}`)
}

const validatePhaseBoundary = (root, phase) => changedPathState(root, phaseBoundaryConfig(phase))

const phaseAwareStructuralValidation = ({ root = ROOT } = {}) => {
  const lifecycle = inspectPhaseAwareLifecycle(root)
  const report = structuralValidation({
    root,
    mode: lifecycle.phase,
    ...phaseBoundaryConfig(lifecycle.phase),
  })
  return { ...report, mode: 'default', lifecycle }
}

const validateMaterializedIndexCandidate = (candidate, { baselineRoot, tracked }) => {
  const checks = []
  const { manifest } = loadManifest({ root: candidate })
  validateManifest(manifest, { root: candidate })
  addCheck(checks, 'MANIFEST_CONTRACT')

  const expectedFirst = renderOutputs(manifest, { root: candidate })
  const expectedSecond = renderOutputs(manifest, { root: candidate })
  assertDeterministicOutputs(expectedFirst, expectedSecond)
  addCheck(checks, 'DETERMINISTIC_RENDERING')

  const sourceDigests = digestCanonicalSources(manifest, { root: candidate })
  const fingerprintsFirst = fingerprintOutputs(manifest, expectedFirst, sourceDigests, {
    root: candidate,
  })
  const fingerprintsSecond = fingerprintOutputs(manifest, expectedSecond, sourceDigests, {
    root: candidate,
  })
  assertSnapshotEqual(fingerprintsFirst, fingerprintsSecond, 'FINGERPRINT_DRIFT')
  addCheck(checks, 'FINGERPRINTS')

  validateCoreContracts(candidate, manifest, expectedFirst, { baselineRoot })
  addCheck(checks, 'ATOMIC_CORE')
  validateConsumerContracts(candidate)
  addCheck(checks, 'CONSUMER_INTEGRATION')

  const ignored = committedIgnoreSet(candidate, COLD_OUTPUT_PATHS)
  if (ignored.size > 0)
    fail('COMMITTED_IGNORE_POLICY', 'Committed ignore policy excludes cold-start outputs')
  validateCandidateOutputs(candidate, manifest, expectedFirst, { tracked, ignored })
  addCheck(checks, 'INDEX_CANDIDATE_OUTPUTS')

  generatorCheckIsReadOnly(candidate, manifest)
  addCheck(checks, 'GENERATOR_CHECK_MODE')
  validateDeclaredWriteBoundary(candidate, manifest, expectedFirst)
  addCheck(checks, 'DECLARED_WRITE_BOUNDARY')

  const sync = runAiSyncTwice(candidate, {
    trackedPaths: tracked,
    includeWholeTree: true,
  })
  addCheck(checks, 'AI_SYNC_IDEMPOTENCY', sync)
  const comparison = compareOutputs(manifest, expectedFirst, { root: candidate })
  if (comparison.some(output => !output.matches))
    fail('POST_SYNC_OUTPUT_DRIFT', 'Outputs drifted after staged-candidate ai-sync')

  const lifecycle = inspectPhaseAwareLifecycle(candidate)
  addCheck(checks, 'PHASE_AWARE_LIFECYCLE', { phase: lifecycle.phase })
  return checks
}

const stagedValidation = ({ root = ROOT } = {}) => {
  const unstaged = splitNull(git(['diff', '--name-only', '-z'], { root }).stdout)
  if (unstaged.length > 0)
    fail('UNSTAGED_DELTAS', 'Staged validation rejects unstaged deltas', { unstaged })
  const untracked = splitNull(
    git(['ls-files', '--others', '--exclude-standard', '-z'], { root }).stdout
  )
  if (untracked.length > 0)
    fail('UNRELATED_UNTRACKED_FILES', 'Staged validation rejects untracked files', { untracked })

  const staged = splitNull(git(['diff', '--cached', '--name-only', '-z'], { root }).stdout)
  const unauthorized = staged.filter(relPath => !P4_TERMINAL_AUTHORIZED_PATHS.has(relPath))
  if (unauthorized.length > 0)
    fail('UNAUTHORIZED_STAGED_PATH', 'Index contains unauthorized paths', { unauthorized })
  for (const relPath of CORE_PATHS) {
    if (!staged.includes(relPath))
      fail('MISSING_STAGED_CORE_PATH', `Core path is not staged: ${relPath}`)
  }
  const destructive = git(['diff', '--cached', '--name-status', '--diff-filter=DR'], {
    root,
  }).stdout.trim()
  if (destructive)
    fail('DESTRUCTIVE_INDEX_CHANGE', 'Staged candidate contains deletions or renames')

  const candidate = fs.mkdtempSync(path.join(os.tmpdir(), 'ccd-cold-index-'))
  try {
    git(['checkout-index', '--all', `--prefix=${candidate}${path.sep}`], { root })
    const tracked = trackedSet(root)
    const checks = validateMaterializedIndexCandidate(candidate, { baselineRoot: root, tracked })
    return {
      schemaVersion: COLD_START_SCHEMA_VERSION,
      mode: 'staged',
      ok: true,
      diagnostics: [],
      checks: [{ id: 'EXACT_INDEX_CANDIDATE', status: 'pass', paths: staged.sort() }, ...checks],
    }
  } finally {
    fs.rmSync(candidate, { recursive: true, force: true })
  }
}

const parseArgs = argv => {
  let mode = 'default'
  let jsonOutput = null
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (['--implementation', '--self-test', '--staged'].includes(argument)) {
      if (mode !== 'default') fail('INVALID_ARGUMENTS', 'Validation modes are mutually exclusive')
      mode = argument.slice(2)
    } else if (argument === '--json-output') {
      jsonOutput = argv[index + 1]
      index += 1
      if (!jsonOutput) fail('INVALID_ARGUMENTS', '--json-output requires a path')
    } else {
      fail('INVALID_ARGUMENTS', `Unknown argument: ${argument}`)
    }
  }
  return { mode, jsonOutput }
}

const writeJsonReport = (root, reportPath, report) => {
  const absolute = path.resolve(reportPath)
  const rootAbsolute = path.resolve(root)
  if (absolute === rootAbsolute || absolute.startsWith(`${rootAbsolute}${path.sep}`)) {
    fail('JSON_OUTPUT_INSIDE_REPOSITORY', '--json-output must be outside the repository')
  }
  fs.writeFileSync(absolute, canonicalSerialize(report), { encoding: 'utf8', flag: 'w' })
}

const printReport = report => {
  if (report.mode === 'self-test') {
    for (const record of report.selfTests) {
      console.log(
        `SELF_TEST id=${record.id} expected=${record.expectedCode} actual=${record.actualCode} pass=${record.pass ? 'yes' : 'no'}`
      )
    }
    console.log(report.ok ? 'COLD_START_SELF_TEST_PASS' : 'COLD_START_SELF_TEST_FAIL')
    return
  }
  for (const check of report.checks ?? [])
    console.log(`CHECK id=${check.id} status=${check.status}`)
  console.log(`COLD_START_${report.mode.toUpperCase().replaceAll('-', '_')}_PASS`)
}

export function runColdStartValidation(argv = process.argv.slice(2), { root = ROOT } = {}) {
  const { mode, jsonOutput } = parseArgs(argv)
  let report
  if (mode === 'self-test') report = runSelfTests({ root })
  else if (mode === 'staged') report = stagedValidation({ root })
  else if (mode === 'implementation') report = implementationValidation({ root })
  else report = phaseAwareStructuralValidation({ root })

  if (mode === 'default') {
    if (jsonOutput) writeJsonReport(root, jsonOutput, report)
    console.log(`COLD_START_PHASE=${report.lifecycle.phase}`)
    console.log('COLD_START_TERMINAL_PASS')
    return { report, exitCode: 0 }
  }

  if (jsonOutput) writeJsonReport(root, jsonOutput, report)
  printReport(report)
  return { report, exitCode: report.ok ? 0 : 1 }
}

const isDirectExecution =
  process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url

if (isDirectExecution) {
  try {
    const { exitCode } = runColdStartValidation()
    process.exitCode = exitCode
  } catch (error) {
    const code =
      error instanceof ValidationFailure || error instanceof ColdStartContractError
        ? error.code
        : 'UNEXPECTED_COLD_START_FAILURE'
    console.error(code)
    process.exitCode = 1
  }
}
