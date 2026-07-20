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
const P6_4_FIXED_PATHS = Object.freeze([
  '.ai/governance/ui/source-enforcement.json',
  '.ai/governance/ui/source-coverage.json',
  '.ai/governance/ui/schemas/ui-source-enforcement.schema.json',
  '.ai/governance/ui/schemas/ui-source-coverage.schema.json',
  '.ai/governance/ui/schemas/ui-source-baseline.schema.json',
  '.ai/governance/ui/schemas/ui-source-fixtures.schema.json',
  '.ai/governance/ui/fixtures/source-cases.json',
  '.ai/governance/ui/scripts/scan-ui-source.mjs',
  'scripts/governance/ui-source-enforcement-validate.mjs',
  'wiki/canonical/design/ui-source-enforcement.md',
  'package.json',
  '.ai/governance/ui/scripts/validate-ui-policy.mjs',
  'scripts/governance/gate.mjs',
  'wiki/indexes/design-index.md',
  'scripts/governance/cold-start-validate.mjs',
  'scripts/governance/project-ui-routing-validate.mjs',
])
const P6_SCANNER_MODULE_PATHS = Object.freeze([
  '.ai/governance/ui/source-scanner/authority.mjs',
  '.ai/governance/ui/source-scanner/baseline.mjs',
  '.ai/governance/ui/source-scanner/cli.mjs',
  '.ai/governance/ui/source-scanner/contracts.mjs',
  '.ai/governance/ui/source-scanner/detector-registry.mjs',
  '.ai/governance/ui/source-scanner/detectors/accessibility.mjs',
  '.ai/governance/ui/source-scanner/detectors/component-ownership.mjs',
  '.ai/governance/ui/source-scanner/detectors/layout-scroll.mjs',
  '.ai/governance/ui/source-scanner/detectors/material-zindex.mjs',
  '.ai/governance/ui/source-scanner/detectors/motion-lifecycle.mjs',
  '.ai/governance/ui/source-scanner/detectors/non-source.mjs',
  '.ai/governance/ui/source-scanner/detectors/primevue-customization.mjs',
  '.ai/governance/ui/source-scanner/detectors/responsive-ownership.mjs',
  '.ai/governance/ui/source-scanner/detectors/token-literals.mjs',
  '.ai/governance/ui/source-scanner/diagnostics.mjs',
  '.ai/governance/ui/source-scanner/exceptions.mjs',
  '.ai/governance/ui/source-scanner/git-source.mjs',
  '.ai/governance/ui/source-scanner/orchestrator.mjs',
  '.ai/governance/ui/source-scanner/owners.mjs',
  '.ai/governance/ui/source-scanner/parse-style.mjs',
  '.ai/governance/ui/source-scanner/parse-typescript.mjs',
  '.ai/governance/ui/source-scanner/parse-vue.mjs',
  '.ai/governance/ui/source-scanner/render.mjs',
  '.ai/governance/ui/source-scanner/schema-validation.mjs',
  '.ai/governance/ui/source-scanner/scope.mjs',
  '.ai/governance/ui/source-scanner/self-test.mjs',
  '.ai/governance/ui/source-scanner/source-model.mjs',
])
const P6_BASELINE_PATH = '.ai/governance/ui/source-baseline.json'
const P6_BASELINE_COMMIT = 'f8acb7fbbfef0c681affb74e08336ec8bc72bca0'
const P6_DELIVERY_PATH_SET_SHA256 =
  '893341ef9ab1d140695c2e93f26dc6de09501dbdc08cca1072419e73eaa010fe'
const P6_FINAL_LOCAL_COMMIT_PATH = 'scripts/lint-staged-safe.mjs'
const P6_FINAL_LOCAL_COMMIT_PATH_SET_SHA256 =
  'd521709a4ecbb0d40ce510ea22f756a23452e5d1ae4765f01396cbca863006d1'
const P6_FINAL_HISTORICAL_PATH_SET_SHA256 =
  '86f7220972b2eb76434ef9afa7e95e3406fb049da03a8f0c9dc6458a7e38377f'
const P6_PRIMARY_COMMIT = 'dfbb4c951f35de1bccfae2a7923c0329f4a49b81'
const P6_CORRECTION_COMMIT = 'd0e018cf6bfd918bd58dce20a345c27bfb12d5ab'
const P6_CORRECTION_COMMIT_SUBJECT = 'fix(governance): 修正 P6 远端终态身份与浅克隆验收'
const P6_CORRECTION_HEAD_EVENT_FIX_COMMIT = 'a139ec78f17386caa170557181e452c24d09af4b'
const P6_CORRECTION_HEAD_EVENT_FIX_SUBJECT = 'fix(governance): 兼容 P6 修正推送 head 事件'
const P6_CORRECTION_PATHS = Object.freeze([
  'scripts/governance/cold-start-validate.mjs',
  'scripts/governance/project-ui-routing-validate.mjs',
])
const P6_CORRECTION_PATH_SET_SHA256 =
  '653ea74eea3ed65e72a197e3b30c4ae37341432fa0cdc6d6d9efb436825bd83b'
const P6_ACTIONS_PATH_BOUNDARY_CORRECTION_BASE = 'a139ec78f17386caa170557181e452c24d09af4b'
const P6_ACTIONS_PATH_BOUNDARY_CORRECTION_SUBJECT = 'fix(governance): 修正 P6 Actions 完整历史验收'
const P6_ACTIONS_PATH_BOUNDARY_CORRECTION_PATHS = Object.freeze([
  '.github/workflows/deploy.yml',
  'scripts/governance/cold-start-validate.mjs',
  'scripts/governance/project-ui-routing-validate.mjs',
  'wiki/canonical/design/ui-source-enforcement.md',
])
const P6_ACTIONS_PATH_BOUNDARY_CORRECTION_PATH_SET_SHA256 =
  'e51f3737e6a51a84649265a835eb2dcfb8b69cf93382d7444576e9c7bc126bf8'
const P6_REPOSITORY = 'ichichuang/ccd'
const P6_MAIN_REF = 'refs/heads/main'
const P6_DELIVERY_ADDITIONAL_PATHS = Object.freeze([
  '.ai/governance/coverage/project-ui-semantic-coverage.json',
  '.ai/governance/policies/ui.json',
  '.ai/governance/ui/fixtures/schema-invalid/ui-policy.json',
  '.ai/governance/ui/fixtures/schema-valid/ui-policy.json',
  '.ai/governance/ui/schemas/ui-policy.schema.json',
  '.ai/manifests/skills-lock.json',
  '.ai/skills/project-ui/SKILL.md',
  '.ai/skills/project-ui/references/platform-invariants.md',
  '.ai/skills/project-ui/references/validation.md',
  '.ai/skills/project-ui/scripts/validate-semantic-quality.mjs',
  'wiki/canonical/design/machine-ui-policy.md',
  'wiki/canonical/design/project-ui-routing.md',
  'wiki/canonical/design/project-ui-skill.md',
  'wiki/canonical/design/ui-governance-migration-plan.md',
])
const P6_BASELINE_SHA256 = 'f7825a7c186d0228fd4a7944100fea8a600105054367d08a44d1eb90c169e42d'
const P6_POLICY_DIGEST = 'sha256:17cc7e2142be673d2cf64be7331a169a17772676914f7c8a7514389e19bd7e5f'
const P6_SCANNER_MANIFEST_DIGEST =
  'sha256:aff785e123968d9ce2ea2285dec42b486a783521c69be6082a4e3b6f8dc219e0'
const P6_FIXTURE_AGGREGATE_SHA256 =
  '20b1ecf6e9816c9227d749471e389e0fc49b65072d90970345c68dcfef8a1a4b'
const P6_RECOVERED_EXACT_HASHES = Object.freeze({
  '.ai/governance/ui/source-enforcement.json':
    'e8210357e8f3c0767c243349f5f9923ad41f22e5123dbda4b1f19c8d1ed64f9a',
  '.ai/governance/ui/source-coverage.json':
    'f05dd82325eb90556d8a04c26989a7bdca383b8d3c00940609674f1740a5a0e2',
  '.ai/governance/ui/schemas/ui-source-baseline.schema.json':
    'a482a97195dd295a9d2ce10204871c8d7584763b35439ff9884cd4a90f5560a1',
  '.ai/governance/ui/schemas/ui-source-coverage.schema.json':
    '087da3a91a773d0eb80e60f4a0d00468fbdd77575edc6238d54d470586f2534e',
  '.ai/governance/ui/schemas/ui-source-enforcement.schema.json':
    'eb25ca3dd2797c8a54ac67ce29d0ee99c620556839417871f24fde4f187c675e',
  '.ai/governance/ui/schemas/ui-source-fixtures.schema.json':
    '687754ef5c4fa8f85222452d121fa1e89e314f7f0f078361a99f5c308184d410',
  '.ai/governance/ui/fixtures/source-cases.json':
    '979a417c5e9b94c292f4f20d5d15d7a4096ab37ae15686831beeee1cad4bff49',
  '.ai/governance/ui/fixtures/rule-cases.json':
    'caba2a3ebf089e96f3ecd01f92da4ccfe0b2be3ce6841c53d44cf7077f1f4be4',
  '.ai/governance/ui/scripts/validate-ui-policy.mjs':
    '5d972599209300f242e08ddccf7879648d9377fdc307d1492841e969a1e557cd',
  'scripts/governance/gate.mjs': 'e3bdc8df8d7c09e9589dbe16e9a6a889d4fa8dfc705dfdfbb44793577cb39ea2',
  'wiki/indexes/design-index.md':
    '86fe1e52aa5bc7d0848e79aee6ce56c3e1e8c98ab5883fc7fa8e76202cad3be7',
  'package.json': 'd780408277cc00ce04ef418e1269f3273592d5740ff5edf4b4a7c7e9c20e8dff',
})
const P6_LEGACY_SKILL_IDS = Object.freeze([
  'architecture-browser-master',
  'ccd-animate-lite',
  'ccd-gsap-motion',
  'ccd-material-system',
  'ccd-motion-system',
  'ccd-page-archetypes',
  'ccd-product-language',
  'ccd-ui-review-gate',
  'desktop-tauri-guard',
  'github-ops',
  'task-orchestrator',
  'unocss',
  'vite',
  'vue',
  'vueuse-functions',
])
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
const P6_TERMINAL_MARKER_EXPECTATIONS = new Map([
  ['SOURCE_SCANNER_IMPLEMENTED', 'yes'],
  ['SOURCE_ENFORCEMENT_ACTIVE', 'yes'],
  ['PAGE_CONTRACT_CREATED', 'no'],
  ['LEGACY_SKILLS_RETIRED', 'no'],
  ['LEGACY_RULES_RETIRED', 'no'],
])
const LIFECYCLE_MARKERS = [
  ...P3_P4_TERMINAL_MARKERS,
  ...new Set([
    ...P5_TERMINAL_MARKER_EXPECTATIONS.keys(),
    ...P6_TERMINAL_MARKER_EXPECTATIONS.keys(),
  ]),
]

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
const sortedUnique = values => [...new Set(values)].sort()
const read = (root, relPath) => fs.readFileSync(path.join(root, relPath))
const readText = (root, relPath) => read(root, relPath).toString('utf8')
const exists = (root, relPath) => fs.existsSync(path.join(root, relPath))
const clone = value => structuredClone(value)

const addCheck = (checks, id, details = {}) => checks.push({ id, status: 'pass', ...details })

const p6DeliveryPaths = p6Paths => {
  const paths = sortedUnique([...p6Paths, ...P6_DELIVERY_ADDITIONAL_PATHS])
  const pathSetSha256 = sha256(Buffer.from(`${paths.join('\n')}\n`, 'utf8'))
  if (
    p6Paths.length !== 206 ||
    paths.length !== 220 ||
    pathSetSha256 !== P6_DELIVERY_PATH_SET_SHA256
  )
    fail('P6_DELIVERY_PATH_AUTHORITY_DRIFT', 'Frozen P6 delivery path authority drifted', {
      p6Count: p6Paths.length,
      deliveryCount: paths.length,
      pathSetSha256,
    })
  return paths
}

const p6FinalLocalCommitPaths = p6Paths => {
  const deliveryPaths = p6DeliveryPaths(p6Paths)
  const paths = sortedUnique([...deliveryPaths, P6_FINAL_LOCAL_COMMIT_PATH])
  const pathSetSha256 = sha256(Buffer.from(`${paths.join('\n')}\n`, 'utf8'))
  const additional = paths.filter(relPath => !deliveryPaths.includes(relPath))
  if (
    paths.length !== 221 ||
    pathSetSha256 !== P6_FINAL_LOCAL_COMMIT_PATH_SET_SHA256 ||
    JSON.stringify(additional) !== JSON.stringify([P6_FINAL_LOCAL_COMMIT_PATH])
  )
    fail('P6_DELIVERY_PATH_AUTHORITY_DRIFT', 'P6.6 final local commit path authority drifted', {
      deliveryCount: deliveryPaths.length,
      finalCount: paths.length,
      additional,
      pathSetSha256,
    })
  return paths
}

const p6FinalHistoricalBoundaryPaths = p6Paths => {
  const historicalPaths = sortedUnique([...P5_TERMINAL_AUTHORIZED_PATHS, ...p6Paths])
  const paths = sortedUnique([...historicalPaths, P6_FINAL_LOCAL_COMMIT_PATH])
  const pathSetSha256 = sha256(Buffer.from(`${paths.join('\n')}\n`, 'utf8'))
  const additional = paths.filter(relPath => !historicalPaths.includes(relPath))
  if (
    p6Paths.length !== 206 ||
    historicalPaths.length !== 250 ||
    paths.length !== 251 ||
    pathSetSha256 !== P6_FINAL_HISTORICAL_PATH_SET_SHA256 ||
    JSON.stringify(additional) !== JSON.stringify([P6_FINAL_LOCAL_COMMIT_PATH])
  )
    fail('P6_PATH_CONTRACT_DRIFT', 'P6.6 final historical path authority drifted', {
      p6: p6Paths.length,
      historicalCount: historicalPaths.length,
      finalCount: paths.length,
      additional,
      pathSetSha256,
    })
  return paths
}

const normalizeGitHubRepositoryIdentity = originUrl => {
  const reject = () =>
    fail('P6_DELIVERY_REPOSITORY_IDENTITY', 'P6 delivery origin URL is not an approved GitHub URL')
  if (typeof originUrl !== 'string' || originUrl.length === 0 || originUrl !== originUrl.trim())
    return reject()

  let owner
  let repository
  const scpStyle = /^git@github\.com:([^/]+)\/([^/]+)$/u.exec(originUrl)
  if (scpStyle) {
    owner = scpStyle[1]
    repository = scpStyle[2]
  } else {
    let parsed
    try {
      parsed = new URL(originUrl)
    } catch {
      return reject()
    }
    const approvedHttps =
      parsed.protocol === 'https:' &&
      parsed.hostname === 'github.com' &&
      parsed.username === '' &&
      parsed.password === '' &&
      parsed.port === ''
    const approvedSsh =
      parsed.protocol === 'ssh:' &&
      parsed.hostname === 'github.com' &&
      parsed.username === 'git' &&
      parsed.password === '' &&
      parsed.port === ''
    if ((!approvedHttps && !approvedSsh) || parsed.search !== '' || parsed.hash !== '')
      return reject()
    const segments = parsed.pathname.slice(1).split('/')
    if (segments.length !== 2 || segments.some(segment => segment.length === 0)) return reject()
    owner = segments[0]
    repository = segments[1]
  }

  if (repository.endsWith('.git')) repository = repository.slice(0, -4)
  const safeComponent = /^[A-Za-z0-9._-]+$/u
  if (!safeComponent.test(owner) || !safeComponent.test(repository)) return reject()
  return `${owner}/${repository}`.toLowerCase()
}

const assertP6RepositoryIdentity = state => {
  if (normalizeGitHubRepositoryIdentity(state.originUrl) !== P6_REPOSITORY)
    fail('P6_DELIVERY_REPOSITORY_IDENTITY', 'P6 delivery repository identity drifted')
  if (
    state.github?.actions === true &&
    (typeof state.github.repository !== 'string' ||
      state.github.repository.toLowerCase() !== P6_REPOSITORY)
  )
    fail('P6_DELIVERY_REPOSITORY_IDENTITY', 'GitHub repository context drifted')
}

const assertP6CorrectionPaths = (paths, code = 'P6_CORRECTION_PATH_SET_DRIFT') => {
  const normalized = sortedUnique(paths)
  const pathSetSha256 = sha256(Buffer.from(`${normalized.join('\n')}\n`, 'utf8'))
  if (
    normalized.length !== 2 ||
    pathSetSha256 !== P6_CORRECTION_PATH_SET_SHA256 ||
    JSON.stringify(normalized) !== JSON.stringify(P6_CORRECTION_PATHS)
  )
    fail(code, 'P6.7 correction must contain exactly the two validator paths', {
      paths: normalized,
      pathSetSha256,
    })
  return normalized
}

const assertP6ActionsPathBoundaryCorrectionPaths = (
  paths,
  code = 'P6_CORRECTION_PATH_SET_DRIFT'
) => {
  const normalized = sortedUnique(paths)
  const pathSetSha256 = sha256(Buffer.from(`${normalized.join('\n')}\n`, 'utf8'))
  if (
    normalized.length !== 4 ||
    pathSetSha256 !== P6_ACTIONS_PATH_BOUNDARY_CORRECTION_PATH_SET_SHA256 ||
    JSON.stringify(normalized) !== JSON.stringify(P6_ACTIONS_PATH_BOUNDARY_CORRECTION_PATHS)
  )
    fail(code, 'P6.7 Actions correction must contain exactly the four authorized paths', {
      paths: normalized,
      pathSetSha256,
    })
  return normalized
}

const assertP6ExpectedCorrectionPaths = (paths, expectedPaths, code) =>
  expectedPaths.length === P6_ACTIONS_PATH_BOUNDARY_CORRECTION_PATHS.length
    ? assertP6ActionsPathBoundaryCorrectionPaths(paths, code)
    : assertP6CorrectionPaths(paths, code)

const assertP6CorrectionGitDiffEvidence = (evidence, { before, head, expectedPaths }) => {
  if (!evidence || typeof evidence !== 'object' || Array.isArray(evidence))
    fail('P6_CORRECTION_COMMIT_PATH_DRIFT', 'Local Git correction diff evidence is missing')
  if (evidence.head !== head || JSON.stringify(evidence.parents) !== JSON.stringify([before]))
    fail('P6_CORRECTION_COMMIT_TOPOLOGY', 'Local Git correction parent topology drifted')
  if (evidence.parentCommitAvailable !== true || evidence.parentTreeAvailable !== true)
    fail(
      'P6_CORRECTION_PARENT_OBJECT_UNAVAILABLE',
      'P6.7 correction parent commit or tree is unavailable locally'
    )
  if (!Array.isArray(evidence.changes))
    fail('P6_CORRECTION_COMMIT_PATH_DRIFT', 'Local Git correction diff is malformed')
  const modifiedPaths = []
  for (const change of evidence.changes) {
    if (
      !change ||
      typeof change !== 'object' ||
      change.status !== 'M' ||
      !Array.isArray(change.paths) ||
      change.paths.length !== 1 ||
      typeof change.paths[0] !== 'string'
    )
      fail('P6_CORRECTION_COMMIT_PATH_DRIFT', 'P6.7 correction permits modified paths only', {
        changes: evidence.changes,
      })
    modifiedPaths.push(change.paths[0])
  }
  assertP6ExpectedCorrectionPaths(modifiedPaths, expectedPaths, 'P6_CORRECTION_COMMIT_PATH_DRIFT')
  return evidence
}

const readP6CorrectionGitDiff = ({ root, before, head, expectedPaths }) => {
  const actualHead = git(['rev-parse', 'HEAD'], { root }).stdout.trim()
  const parents = git(['cat-file', '-p', 'HEAD'], { root })
    .stdout.split('\n')
    .filter(line => line.startsWith('parent '))
    .map(line => line.slice('parent '.length))
  if (actualHead !== head || JSON.stringify(parents) !== JSON.stringify([before]))
    fail('P6_CORRECTION_COMMIT_TOPOLOGY', 'Local Git correction parent topology drifted')

  const parentCommitAvailable =
    git(['cat-file', '-e', `${before}^{commit}`], { root, allowFailure: true }).status === 0
  const parentTreeAvailable =
    parentCommitAvailable &&
    git(['cat-file', '-e', `${before}^{tree}`], { root, allowFailure: true }).status === 0
  if (!parentCommitAvailable || !parentTreeAvailable)
    fail(
      'P6_CORRECTION_PARENT_OBJECT_UNAVAILABLE',
      'P6.7 correction parent commit or tree is unavailable locally'
    )

  const tokens = splitNull(
    git(['diff-tree', '--no-commit-id', '--name-status', '-r', '-z', 'HEAD^', 'HEAD'], {
      root,
    }).stdout
  )
  const changes = []
  for (let index = 0; index < tokens.length; ) {
    const status = tokens[index]
    index += 1
    const pathCount = /^[RC]/u.test(status) ? 2 : 1
    const paths = tokens.slice(index, index + pathCount)
    if (paths.length !== pathCount)
      fail('P6_CORRECTION_COMMIT_PATH_DRIFT', 'Local Git correction diff is malformed')
    index += pathCount
    changes.push({ status, paths })
  }
  return assertP6CorrectionGitDiffEvidence(
    { head: actualHead, parents, parentCommitAvailable, parentTreeAvailable, changes },
    { before, head, expectedPaths }
  )
}

const p6PushHead = event => {
  const hasAfter = Object.hasOwn(event, 'after')
  const hasHead = Object.hasOwn(event, 'head')
  if (hasAfter && typeof event.after !== 'string')
    fail('P6_CORRECTION_EVENT_INVALID', 'GitHub push after field is malformed')
  if (hasHead && typeof event.head !== 'string')
    fail('P6_CORRECTION_EVENT_INVALID', 'GitHub push head field is malformed')
  const after = hasAfter ? event.after : null
  const head = hasHead ? event.head : null
  if (!after && !head) fail('P6_CORRECTION_EVENT_INVALID', 'GitHub push head identity is missing')
  if (after && head && after !== head)
    fail('P6_CORRECTION_EVENT_INVALID', 'GitHub push head identity is conflicting')
  return after ?? head
}

const validateP6CorrectionPushEvent = (state, { before, expectedPaths }) => {
  const context = state.github
  if (
    !context ||
    context.actions !== true ||
    context.eventName !== 'push' ||
    context.ref !== P6_MAIN_REF ||
    context.sha !== state.head ||
    context.eventError ||
    !context.event ||
    typeof context.event !== 'object' ||
    Array.isArray(context.event)
  )
    fail('P6_CORRECTION_EVENT_INVALID', 'GitHub push context is missing or malformed')

  const event = context.event
  const pushedHead = p6PushHead(event)
  if (
    typeof event.repository?.full_name !== 'string' ||
    event.repository.full_name.toLowerCase() !== P6_REPOSITORY ||
    event.ref !== P6_MAIN_REF ||
    event.before !== before ||
    pushedHead !== state.head ||
    event.created !== false ||
    event.deleted !== false
  )
    fail('P6_CORRECTION_EVENT_INVALID', 'GitHub push event authority drifted')
  if (event.forced !== false)
    fail('P6_CORRECTION_FORCED_PUSH', 'P6.7 correction must be a non-forced push')
  if (!Array.isArray(event.commits) || event.commits.length !== 1)
    fail('P6_CORRECTION_EVENT_INVALID', 'GitHub push event must contain one correction commit')

  const [commit] = event.commits
  if (!commit || typeof commit !== 'object' || Array.isArray(commit))
    fail('P6_CORRECTION_EVENT_INVALID', 'GitHub push commit entry is malformed')
  if (Object.hasOwn(commit, 'id') && commit.id !== state.head)
    fail('P6_CORRECTION_EVENT_INVALID', 'GitHub push commit identity drifted')
  if (event.head_commit !== null && event.head_commit !== undefined) {
    if (typeof event.head_commit !== 'object' || Array.isArray(event.head_commit))
      fail('P6_CORRECTION_EVENT_INVALID', 'GitHub push head commit entry is malformed')
    if (Object.hasOwn(event.head_commit, 'id') && event.head_commit.id !== state.head)
      fail('P6_CORRECTION_EVENT_INVALID', 'GitHub push head commit identity drifted')
  }
  assertP6CorrectionGitDiffEvidence(state.correctionDiff, {
    before,
    head: state.head,
    expectedPaths,
  })
  return { event: 'push', ref: P6_MAIN_REF, forced: false, pathCount: expectedPaths.length }
}

const validateP6RemoteCorrectionSnapshot = (p6Paths, state) => {
  assertP6RepositoryIdentity(state)
  const staged = sortedUnique(state.staged ?? [])
  const unstaged = sortedUnique(state.unstaged ?? [])
  const untracked = sortedUnique(state.untracked ?? [])
  const deleted = sortedUnique(state.deleted ?? [])
  const localPaths = sortedUnique([...staged, ...unstaged, ...untracked])
  const dirty = localPaths.length > 0
  if (deleted.length > 0)
    fail('P6_DELIVERY_DELETION', 'P6.7 correction forbids deleted paths', { deleted })

  if (dirty) {
    const baseIsPrimary = state.head === P6_PRIMARY_COMMIT && state.originMain === P6_PRIMARY_COMMIT
    const baseIsCorrection =
      state.head === P6_CORRECTION_COMMIT && state.originMain === P6_CORRECTION_COMMIT
    const baseIsActionsPathBoundary =
      state.head === P6_ACTIONS_PATH_BOUNDARY_CORRECTION_BASE &&
      state.originMain === P6_ACTIONS_PATH_BOUNDARY_CORRECTION_BASE
    const expectedPaths = baseIsActionsPathBoundary
      ? P6_ACTIONS_PATH_BOUNDARY_CORRECTION_PATHS
      : P6_CORRECTION_PATHS
    if (
      state.branch !== 'main' ||
      state.shallow !== false ||
      (!baseIsPrimary && !baseIsCorrection && !baseIsActionsPathBoundary) ||
      state.ahead !== 0 ||
      state.behind !== 0
    )
      fail('P6_CORRECTION_DIRTY_BASE_DRIFT', 'Dirty P6.7 correction must remain on remote P6')
    assertP6ExpectedCorrectionPaths(localPaths, expectedPaths, 'P6_CORRECTION_PATH_SET_DRIFT')
    if (staged.length === 0)
      return {
        mode: 'unstaged-remote-correction-workspace',
        pathCount: expectedPaths.length,
        pathSetSha256: baseIsActionsPathBoundary
          ? P6_ACTIONS_PATH_BOUNDARY_CORRECTION_PATH_SET_SHA256
          : P6_CORRECTION_PATH_SET_SHA256,
      }
    if (
      JSON.stringify(staged) !== JSON.stringify(expectedPaths) ||
      unstaged.length > 0 ||
      untracked.length > 0
    )
      fail('P6_CORRECTION_INDEX_DRIFT', 'P6.7 index must contain one complete correction only', {
        staged,
        unstaged,
        untracked,
      })
    return {
      mode: 'fully-staged-remote-correction-candidate',
      pathCount: expectedPaths.length,
      pathSetSha256: baseIsActionsPathBoundary
        ? P6_ACTIONS_PATH_BOUNDARY_CORRECTION_PATH_SET_SHA256
        : P6_CORRECTION_PATH_SET_SHA256,
    }
  }

  const onMain =
    state.branch === 'main' || (state.github?.actions === true && state.github.ref === P6_MAIN_REF)
  if (!onMain) fail('P6_CORRECTION_COMMIT_TOPOLOGY', 'P6.7 terminal state must be on main')
  const headParents = state.headParents ?? (state.headParent ? [state.headParent] : [])

  if (state.head === P6_PRIMARY_COMMIT) {
    if (
      state.shallow !== false ||
      state.originMain !== P6_PRIMARY_COMMIT ||
      state.ahead !== 0 ||
      state.behind !== 0 ||
      JSON.stringify(headParents) !== JSON.stringify([P6_BASELINE_COMMIT])
    )
      fail('P6_CORRECTION_COMMIT_TOPOLOGY', 'P6 primary remote terminal topology drifted')
    const committedPaths = sortedUnique(state.committedPaths ?? [])
    if (JSON.stringify(committedPaths) !== JSON.stringify(p6FinalLocalCommitPaths(p6Paths)))
      fail('P6_DELIVERY_COMMIT_PATH_DRIFT', 'P6 primary commit path authority drifted')
    return { mode: 'clean-pushed-primary-terminal', pathCount: 221 }
  }

  const correctionTopology = (() => {
    if (
      JSON.stringify(headParents) === JSON.stringify([P6_PRIMARY_COMMIT]) &&
      state.headSubject === P6_CORRECTION_COMMIT_SUBJECT
    )
      return { before: P6_PRIMARY_COMMIT, expectedPaths: P6_CORRECTION_PATHS }
    if (
      JSON.stringify(headParents) === JSON.stringify([P6_CORRECTION_COMMIT]) &&
      state.headSubject === P6_CORRECTION_HEAD_EVENT_FIX_SUBJECT
    )
      return { before: P6_CORRECTION_COMMIT, expectedPaths: P6_CORRECTION_PATHS }
    if (
      JSON.stringify(headParents) === JSON.stringify([P6_ACTIONS_PATH_BOUNDARY_CORRECTION_BASE]) &&
      state.headSubject === P6_ACTIONS_PATH_BOUNDARY_CORRECTION_SUBJECT
    )
      return {
        before: P6_ACTIONS_PATH_BOUNDARY_CORRECTION_BASE,
        expectedPaths: P6_ACTIONS_PATH_BOUNDARY_CORRECTION_PATHS,
      }
    fail('P6_CORRECTION_COMMIT_TOPOLOGY', 'P6.7 correction parent or subject drifted')
  })()
  const correctionParent = correctionTopology.before
  const expectedPaths = correctionTopology.expectedPaths
  const requiresFullHistory = expectedPaths === P6_ACTIONS_PATH_BOUNDARY_CORRECTION_PATHS

  if (
    state.shallow === false &&
    state.originMain === correctionParent &&
    state.ahead === 1 &&
    state.behind === 0
  ) {
    assertP6CorrectionGitDiffEvidence(state.correctionDiff, {
      before: correctionParent,
      head: state.head,
      expectedPaths,
    })
    return { mode: 'clean-local-remote-correction-commit', pathCount: expectedPaths.length }
  }

  if (state.originMain !== state.head || state.ahead !== 0 || state.behind !== 0)
    fail('P6_CORRECTION_COMMIT_TOPOLOGY', 'P6.7 pushed correction topology drifted')
  if (requiresFullHistory && state.shallow !== false)
    fail(
      'P6_CORRECTION_BASELINE_OBJECT_UNAVAILABLE',
      'Current P6.7 correction requires complete Git history for the canonical source baseline'
    )
  if (state.shallow === true) {
    validateP6CorrectionPushEvent(state, { before: correctionParent, expectedPaths })
    return {
      mode: 'clean-pushed-remote-correction-shallow-event',
      pathCount: expectedPaths.length,
    }
  }
  assertP6CorrectionGitDiffEvidence(state.correctionDiff, {
    before: correctionParent,
    head: state.head,
    expectedPaths,
  })
  if (state.github?.actions === true && state.github.eventName === 'push')
    validateP6CorrectionPushEvent(state, { before: correctionParent, expectedPaths })
  return {
    mode: 'clean-pushed-remote-correction-full-history',
    pathCount: expectedPaths.length,
  }
}

const validateP6DeliverySnapshot = (p6Paths, state, { finalLocalCommit = false } = {}) => {
  const expectedPaths = finalLocalCommit
    ? p6FinalLocalCommitPaths(p6Paths)
    : p6DeliveryPaths(p6Paths)
  const expectedCount = finalLocalCommit ? 221 : 220
  const expectedPathSetSha256 = finalLocalCommit
    ? P6_FINAL_LOCAL_COMMIT_PATH_SET_SHA256
    : P6_DELIVERY_PATH_SET_SHA256
  const staged = sortedUnique(state.staged ?? [])
  const unstaged = sortedUnique(state.unstaged ?? [])
  const untracked = sortedUnique(state.untracked ?? [])
  const deleted = sortedUnique(state.deleted ?? [])
  const localPaths = sortedUnique([...staged, ...unstaged, ...untracked])
  const dirty = localPaths.length > 0

  if (state.branch !== 'main')
    fail('P6_DELIVERY_REPOSITORY_IDENTITY', 'P6 delivery branch identity drifted')
  assertP6RepositoryIdentity(state)
  if (state.shallow !== false)
    fail('P6_DELIVERY_SHALLOW_REPOSITORY', 'P6 delivery requires a non-shallow repository')
  if (state.originMain !== P6_BASELINE_COMMIT)
    fail('P6_DELIVERY_ORIGIN_DRIFT', 'origin/main moved during P6 delivery')
  if (deleted.length > 0)
    fail('P6_DELIVERY_DELETION', 'P6 delivery forbids deleted paths', { deleted })

  if (dirty) {
    if (state.head !== P6_BASELINE_COMMIT || state.ahead !== 0 || state.behind !== 0)
      fail('P6_DELIVERY_DIRTY_BASE_DRIFT', 'Dirty P6 delivery must remain exactly on origin/main')
    if (JSON.stringify(localPaths) !== JSON.stringify(expectedPaths))
      fail(
        'P6_DELIVERY_PATH_SET_DRIFT',
        `Dirty P6 delivery path set is not the frozen ${expectedCount} paths`,
        {
          missing: expectedPaths.filter(relPath => !localPaths.includes(relPath)),
          unexpected: localPaths.filter(relPath => !expectedPaths.includes(relPath)),
        }
      )
    if (staged.length === 0)
      return {
        mode: 'unstaged-terminal-workspace',
        pathCount: expectedCount,
        pathSetSha256: expectedPathSetSha256,
      }
    if (
      JSON.stringify(staged) !== JSON.stringify(expectedPaths) ||
      unstaged.length > 0 ||
      untracked.length > 0
    )
      fail(
        'P6_DELIVERY_INDEX_DRIFT',
        `P6 index must contain the exact isolated ${expectedCount}-path candidate`,
        {
          staged,
          unstaged,
          untracked,
        }
      )
    return {
      mode: 'fully-staged-terminal-candidate',
      pathCount: expectedCount,
      pathSetSha256: expectedPathSetSha256,
    }
  }

  const committedPaths = sortedUnique(state.committedPaths ?? [])
  if (
    state.head === P6_BASELINE_COMMIT ||
    state.headParent !== P6_BASELINE_COMMIT ||
    state.ahead !== 1 ||
    state.behind !== 0
  )
    fail(
      'P6_DELIVERY_COMMIT_TOPOLOGY',
      'Committed P6 delivery must be exactly one local commit on the P5 baseline'
    )
  if (JSON.stringify(committedPaths) !== JSON.stringify(expectedPaths))
    fail(
      'P6_DELIVERY_COMMIT_PATH_DRIFT',
      `Committed P6 delivery does not contain the frozen ${expectedCount} paths`,
      {
        missing: expectedPaths.filter(relPath => !committedPaths.includes(relPath)),
        unexpected: committedPaths.filter(relPath => !expectedPaths.includes(relPath)),
      }
    )
  return {
    mode: 'clean-committed-terminal',
    pathCount: expectedCount,
    pathSetSha256: expectedPathSetSha256,
  }
}

const validateP6FinalLocalCommitSnapshot = (p6Paths, state) =>
  validateP6DeliverySnapshot(p6Paths, state, { finalLocalCommit: true })

const validateP6TerminalRepositorySnapshot = (p6Paths, state) =>
  state.head === P6_BASELINE_COMMIT || state.originMain === P6_BASELINE_COMMIT
    ? validateP6FinalLocalCommitSnapshot(p6Paths, state)
    : validateP6RemoteCorrectionSnapshot(p6Paths, state)

const inspectP6GitHubContext = () => {
  const eventPath = process.env.GITHUB_EVENT_PATH?.trim() ?? ''
  let event = null
  let eventError = null
  if (eventPath) {
    try {
      event = JSON.parse(fs.readFileSync(eventPath, 'utf8'))
    } catch (error) {
      eventError = error instanceof SyntaxError ? 'invalid-json' : 'unreadable-event'
    }
  }
  return {
    actions: process.env.GITHUB_ACTIONS === 'true',
    repository: process.env.GITHUB_REPOSITORY ?? '',
    ref: process.env.GITHUB_REF ?? '',
    sha: process.env.GITHUB_SHA ?? '',
    eventName: process.env.GITHUB_EVENT_NAME ?? '',
    eventPath,
    event,
    eventError,
  }
}

const inspectP6DeliveryRepositoryState = root => {
  const staged = splitNull(git(['diff', '--cached', '--name-only', '-z'], { root }).stdout)
  const unstaged = splitNull(git(['diff', '--name-only', '-z'], { root }).stdout)
  const untracked = splitNull(
    git(['ls-files', '--others', '--exclude-standard', '-z'], { root }).stdout
  )
  const deleted = sortedUnique([
    ...splitNull(git(['diff', '--name-only', '--diff-filter=D', '-z'], { root }).stdout),
    ...splitNull(
      git(['diff', '--cached', '--name-only', '--diff-filter=D', '-z'], { root }).stdout
    ),
  ])
  const head = git(['rev-parse', 'HEAD'], { root }).stdout.trim()
  const headParents = git(['cat-file', '-p', 'HEAD'], { root })
    .stdout.split('\n')
    .filter(line => line.startsWith('parent '))
    .map(line => line.slice('parent '.length))
  const dirty = staged.length + unstaged.length + untracked.length > 0
  const shallow = git(['rev-parse', '--is-shallow-repository'], { root }).stdout.trim() === 'true'
  const headSubject = git(['log', '-1', '--format=%s', 'HEAD'], { root }).stdout.trim()
  const [behind, ahead] = git(['rev-list', '--left-right', '--count', 'origin/main...HEAD'], {
    root,
  })
    .stdout.trim()
    .split(/\s+/u)
    .map(Number)
  const correctionExpectation = (() => {
    if (
      JSON.stringify(headParents) === JSON.stringify([P6_PRIMARY_COMMIT]) &&
      headSubject === P6_CORRECTION_COMMIT_SUBJECT
    )
      return { before: P6_PRIMARY_COMMIT, expectedPaths: P6_CORRECTION_PATHS }
    if (
      JSON.stringify(headParents) === JSON.stringify([P6_CORRECTION_COMMIT]) &&
      headSubject === P6_CORRECTION_HEAD_EVENT_FIX_SUBJECT
    )
      return { before: P6_CORRECTION_COMMIT, expectedPaths: P6_CORRECTION_PATHS }
    if (
      JSON.stringify(headParents) === JSON.stringify([P6_ACTIONS_PATH_BOUNDARY_CORRECTION_BASE]) &&
      headSubject === P6_ACTIONS_PATH_BOUNDARY_CORRECTION_SUBJECT
    )
      return {
        before: P6_ACTIONS_PATH_BOUNDARY_CORRECTION_BASE,
        expectedPaths: P6_ACTIONS_PATH_BOUNDARY_CORRECTION_PATHS,
      }
    return null
  })()
  const correctionDiff =
    !dirty && correctionExpectation
      ? readP6CorrectionGitDiff({ root, head, ...correctionExpectation })
      : null
  return {
    branch: git(['branch', '--show-current'], { root }).stdout.trim(),
    originUrl: git(['remote', 'get-url', 'origin'], { root }).stdout.trim(),
    shallow,
    originMain: git(['rev-parse', 'origin/main'], { root }).stdout.trim(),
    head,
    headParent: headParents.length === 1 ? headParents[0] : null,
    headParents,
    headSubject,
    ahead,
    behind,
    github: inspectP6GitHubContext(),
    staged,
    unstaged,
    untracked,
    deleted,
    correctionDiff,
    committedPaths:
      dirty || shallow
        ? []
        : splitNull(
            git(['diff-tree', '--no-commit-id', '--name-only', '-r', '-z', 'HEAD^', 'HEAD'], {
              root,
            }).stdout
          ),
  }
}

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
  {
    allowedPaths = AUTHORIZED_PATHS,
    requireEmptyIndex = true,
    forbidP4_4 = false,
    indexErrorCode = 'INDEX_NOT_EMPTY',
    unauthorizedErrorCode = 'UNAUTHORIZED_CHANGED_PATH',
  } = {}
) => {
  const staged = splitNull(git(['diff', '--cached', '--name-only', '-z'], { root }).stdout)
  if (requireEmptyIndex && staged.length > 0)
    fail(indexErrorCode, 'Implementation validation requires an empty index', { staged })
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
    fail(unauthorizedErrorCode, 'Candidate contains unauthorized paths', { unauthorized })
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
        applicationSourceEnforcementState: 'BASELINE_ONLY',
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
          sourceScannerImplemented: false,
          applicationSourceEnforcementState: 'BASELINE_ONLY',
          pageContractCreated: false,
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

  const materializeP6Artifacts = (fixtureRoot, mutation = null) => {
    const fixturePaths = [
      ...Array.from(
        { length: 82 },
        (_, index) =>
          `.ai/governance/ui/fixtures/source-valid/P6-VALID-${String(index + 1).padStart(3, '0')}.ts`
      ),
      ...Array.from(
        { length: 80 },
        (_, index) =>
          `.ai/governance/ui/fixtures/source-invalid/P6-INVALID-${String(index + 1).padStart(3, '0')}.ts`
      ),
    ]
    const sourceModules = [
      '.ai/governance/ui/scripts/scan-ui-source.mjs',
      ...P6_SCANNER_MODULE_PATHS,
    ]
    for (const relPath of [...P6_4_FIXED_PATHS, ...P6_SCANNER_MODULE_PATHS, ...fixturePaths]) {
      const absolute = path.join(fixtureRoot, relPath)
      fs.mkdirSync(path.dirname(absolute), { recursive: true })
      if (!fs.existsSync(absolute)) fs.writeFileSync(absolute, 'fixture\n', 'utf8')
    }
    fs.writeFileSync(
      path.join(fixtureRoot, '.ai/governance/ui/source-enforcement.json'),
      `${JSON.stringify({ sourceModules }, null, 2)}\n`,
      'utf8'
    )
    fs.writeFileSync(
      path.join(fixtureRoot, '.ai/governance/ui/fixtures/source-cases.json'),
      `${JSON.stringify(
        {
          cases: fixturePaths.map((fixturePath, index) => ({
            id: `P6-FIXTURE-${String(index + 1).padStart(3, '0')}`,
            fixturePath,
          })),
        },
        null,
        2
      )}\n`,
      'utf8'
    )
    fs.writeFileSync(
      path.join(fixtureRoot, 'wiki/canonical/design/ui-source-enforcement.md'),
      'P6_4_PRETERMINAL=yes\nSOURCE_SCANNER_IMPLEMENTED=no\nSOURCE_ENFORCEMENT_ACTIVE=no\nCANONICAL_SOURCE_BASELINE_PRESENT=no\nP6_5_STARTED=no\n',
      'utf8'
    )
    if (mutation === 'partial')
      fs.rmSync(path.join(fixtureRoot, '.ai/governance/ui/source-coverage.json'))
    if (mutation === 'unexpected-module') {
      const absolute = path.join(
        fixtureRoot,
        '.ai/governance/ui/source-scanner/unexpected-module.mjs'
      )
      fs.mkdirSync(path.dirname(absolute), { recursive: true })
      fs.writeFileSync(absolute, 'fixture\n', 'utf8')
    }
    if (mutation === 'missing-fixture') fs.rmSync(path.join(fixtureRoot, fixturePaths[0]))
    if (mutation === 'extra-fixture')
      fs.writeFileSync(
        path.join(fixtureRoot, '.ai/governance/ui/fixtures/source-valid/EXTRA.ts'),
        'fixture\n',
        'utf8'
      )
    if (mutation === 'alternative-path') {
      const absolute = path.join(fixtureRoot, '.ai/governance/ui/source_scanner/rogue.mjs')
      fs.mkdirSync(path.dirname(absolute), { recursive: true })
      fs.writeFileSync(absolute, 'fixture\n', 'utf8')
    }
    if (mutation === 'premature-baseline')
      fs.writeFileSync(
        path.join(fixtureRoot, '.ai/governance/ui/source-baseline.json'),
        '{}\n',
        'utf8'
      )
    if (mutation === 'premature-terminal') {
      const policyPath = path.join(fixtureRoot, '.ai/governance/policies/ui.json')
      const policy = JSON.parse(fs.readFileSync(policyPath, 'utf8'))
      policy.sourceScannerImplemented = true
      fs.writeFileSync(policyPath, `${JSON.stringify(policy, null, 2)}\n`, 'utf8')
    }
  }

  const copyCurrentFile = (fixtureRoot, relPath) => {
    const destination = path.join(fixtureRoot, relPath)
    fs.mkdirSync(path.dirname(destination), { recursive: true })
    fs.copyFileSync(path.join(ROOT, relPath), destination)
  }

  const materializeP6TerminalArtifacts = (fixtureRoot, mutation = null) => {
    const sourceCases = JSON.parse(
      fs.readFileSync(path.join(ROOT, '.ai/governance/ui/fixtures/source-cases.json'), 'utf8')
    )
    const fixturePaths = sourceCases.cases.map(item => item.fixturePath)
    for (const relPath of [
      ...P6_4_FIXED_PATHS,
      ...P6_SCANNER_MODULE_PATHS,
      ...fixturePaths,
      P6_BASELINE_PATH,
      '.ai/governance/policies/ui.json',
      '.ai/governance/ui/fixtures/schema-valid/ui-policy.json',
      '.ai/governance/ui/fixtures/schema-invalid/ui-policy.json',
      '.ai/governance/ui/fixtures/rule-cases.json',
      '.ai/governance/ui/schemas/ui-policy.schema.json',
      '.ai/governance/coverage/project-ui-semantic-coverage.json',
      '.ai/governance/ui/exceptions.json',
      '.ai/manifests/skills-lock.json',
      ...lifecycleDocuments,
    ])
      copyCurrentFile(fixtureRoot, relPath)
    const lock = JSON.parse(
      fs.readFileSync(path.join(fixtureRoot, '.ai/manifests/skills-lock.json'), 'utf8')
    )
    for (const id of P6_LEGACY_SKILL_IDS) {
      const source = lock.skills[id].source.slice('repo:'.length)
      fs.mkdirSync(path.join(fixtureRoot, source), { recursive: true })
    }
    fs.mkdirSync(path.join(fixtureRoot, '.ai/rules/core'), { recursive: true })
    fs.writeFileSync(path.join(fixtureRoot, '.ai/rules/core/fixture.mdc'), 'fixture\n', 'utf8')

    if (mutation === 'missing-baseline') fs.rmSync(path.join(fixtureRoot, P6_BASELINE_PATH))
    if (mutation === 'stale-baseline')
      fs.appendFileSync(path.join(fixtureRoot, P6_BASELINE_PATH), ' ')
    if (mutation === 'partial-marker') {
      const documentPath = path.join(fixtureRoot, lifecycleDocuments[0])
      const document = fs.readFileSync(documentPath, 'utf8')
      fs.writeFileSync(
        documentPath,
        document.replace('SOURCE_ENFORCEMENT_ACTIVE=yes', 'SOURCE_ENFORCEMENT_ACTIVE=no'),
        'utf8'
      )
    }
    if (mutation === 'page-contract') {
      const relPath = '.ai/governance/ui/page-contract.json'
      fs.writeFileSync(path.join(fixtureRoot, relPath), '{}\n', 'utf8')
    }
    if (mutation === 'real-exception') {
      const exceptionPath = path.join(fixtureRoot, '.ai/governance/ui/exceptions.json')
      fs.writeFileSync(
        exceptionPath,
        `${JSON.stringify({ schemaVersion: 'ccd-ui-exceptions/v1', exceptions: [{}] }, null, 2)}\n`,
        'utf8'
      )
    }
    if (mutation === 'alternative-baseline') {
      fs.renameSync(
        path.join(fixtureRoot, '.ai/governance/ui/source-baseline.json'),
        path.join(fixtureRoot, '.ai/governance/ui/source-baseline-copy.json')
      )
    }
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

  for (const [id, mutation, expectedCode] of [
    ['phase-valid-p6-pre-terminal', null, 'PASS'],
    ['phase-partial-p6-artifacts', 'partial', 'P6_ARTIFACT_PARTIAL'],
    ['phase-unexpected-p6-module', 'unexpected-module', 'P6_UNEXPECTED_SCANNER_MODULE'],
    ['phase-missing-p6-fixture', 'missing-fixture', 'P6_FIXTURE_SET_DRIFT'],
    ['phase-extra-p6-fixture', 'extra-fixture', 'P6_FIXTURE_SET_DRIFT'],
    ['phase-alternative-p6-path', 'alternative-path', 'P6_ALTERNATIVE_SCANNER_PATH'],
    ['phase-premature-p6-baseline', 'premature-baseline', 'P6_BASELINE_IDENTITY_DRIFT'],
    ['phase-premature-p6-terminal', 'premature-terminal', 'P6_PREMATURE_TERMINAL'],
  ]) {
    const lifecycleFixture = writeLifecycleFixture('p5-terminal')
    try {
      materializeP6Artifacts(lifecycleFixture, mutation)
      const operation = () => {
        const lifecycle = inspectPhaseAwareLifecycle(lifecycleFixture)
        if (lifecycle.phase !== 'p6-pre-terminal')
          fail('SELF_TEST_PHASE', `${id} inferred ${lifecycle.phase}`)
      }
      if (expectedCode === 'PASS') expectPass(records, id, operation)
      else expectFailure(records, id, expectedCode, operation)
    } finally {
      fs.rmSync(lifecycleFixture, { recursive: true, force: true })
    }
  }

  for (const [id, mutation, expectedCode] of [
    ['phase-valid-p6-terminal', null, 'PASS'],
    ['phase-p6-terminal-missing-baseline', 'missing-baseline', 'P6_PREMATURE_TERMINAL'],
    ['phase-p6-terminal-stale-baseline', 'stale-baseline', 'P6_BASELINE_HASH_DRIFT'],
    ['phase-p6-terminal-partial-marker', 'partial-marker', 'P6_TERMINAL_PARTIAL'],
    ['phase-p6-terminal-page-contract', 'page-contract', 'PAGE_CONTRACT_FALSE_POSITIVE'],
    ['phase-p6-terminal-real-exception', 'real-exception', 'P6_REAL_EXCEPTION_PRESENT'],
    [
      'phase-p6-terminal-alternative-baseline',
      'alternative-baseline',
      'P6_ALTERNATIVE_SCANNER_PATH',
    ],
  ]) {
    const lifecycleFixture = writeLifecycleFixture('p5-terminal')
    try {
      materializeP6TerminalArtifacts(lifecycleFixture, mutation)
      const operation = () => {
        const lifecycle = inspectPhaseAwareLifecycle(lifecycleFixture)
        if (lifecycle.phase !== 'p6-terminal')
          fail('SELF_TEST_PHASE', `${id} inferred ${lifecycle.phase}`)
      }
      if (expectedCode === 'PASS') expectPass(records, id, operation)
      else expectFailure(records, id, expectedCode, operation)
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

  const p6DeliveryP6Paths = sortedUnique([
    ...P6_4_FIXED_PATHS,
    ...P6_SCANNER_MODULE_PATHS,
    ...JSON.parse(readText(ROOT, '.ai/governance/ui/fixtures/source-cases.json')).cases.map(
      item => item.fixturePath
    ),
    P6_BASELINE_PATH,
  ])
  const deliveryPaths = p6DeliveryPaths(p6DeliveryP6Paths)
  const deliveryAuthority = {
    branch: 'main',
    originUrl: 'git@github.com:ichichuang/ccd.git',
    shallow: false,
    originMain: P6_BASELINE_COMMIT,
    head: P6_BASELINE_COMMIT,
    headParent: null,
    ahead: 0,
    behind: 0,
    staged: [],
    unstaged: deliveryPaths.slice(0, 20),
    untracked: deliveryPaths.slice(20),
    deleted: [],
    committedPaths: [],
  }
  expectPass(records, 'p6-delivery-exact-unstaged-terminal-workspace', () =>
    validateP6DeliverySnapshot(p6DeliveryP6Paths, deliveryAuthority)
  )
  expectPass(records, 'p6-delivery-exact-fully-staged-terminal-candidate', () =>
    validateP6DeliverySnapshot(p6DeliveryP6Paths, {
      ...deliveryAuthority,
      staged: deliveryPaths,
      unstaged: [],
      untracked: [],
    })
  )
  expectFailure(records, 'p6-delivery-partial-staged-candidate', 'P6_DELIVERY_PATH_SET_DRIFT', () =>
    validateP6DeliverySnapshot(p6DeliveryP6Paths, {
      ...deliveryAuthority,
      staged: deliveryPaths.slice(0, 1),
      unstaged: [],
      untracked: [],
    })
  )
  expectFailure(
    records,
    'p6-delivery-mixed-staged-unstaged-candidate',
    'P6_DELIVERY_INDEX_DRIFT',
    () =>
      validateP6DeliverySnapshot(p6DeliveryP6Paths, {
        ...deliveryAuthority,
        staged: deliveryPaths.slice(0, 1),
        unstaged: deliveryPaths.slice(1, 20),
        untracked: deliveryPaths.slice(20),
      })
  )
  expectFailure(records, 'p6-delivery-extra-staged-path', 'P6_DELIVERY_PATH_SET_DRIFT', () =>
    validateP6DeliverySnapshot(p6DeliveryP6Paths, {
      ...deliveryAuthority,
      staged: [...deliveryPaths, 'unexpected-p6-delivery.txt'],
      unstaged: [],
      untracked: [],
    })
  )
  expectFailure(records, 'p6-delivery-remaining-untracked-path', 'P6_DELIVERY_PATH_SET_DRIFT', () =>
    validateP6DeliverySnapshot(p6DeliveryP6Paths, {
      ...deliveryAuthority,
      staged: deliveryPaths,
      unstaged: [],
      untracked: ['unexpected-p6-delivery.txt'],
    })
  )
  expectFailure(records, 'p6-delivery-staged-deletion', 'P6_DELIVERY_DELETION', () =>
    validateP6DeliverySnapshot(p6DeliveryP6Paths, {
      ...deliveryAuthority,
      staged: deliveryPaths,
      unstaged: [],
      untracked: [],
      deleted: [deliveryPaths[0]],
    })
  )
  const committedDelivery = {
    ...deliveryAuthority,
    head: '1111111111111111111111111111111111111111',
    headParent: P6_BASELINE_COMMIT,
    ahead: 1,
    staged: [],
    unstaged: [],
    untracked: [],
    committedPaths: deliveryPaths,
  }
  expectPass(records, 'p6-delivery-exact-clean-committed-state', () =>
    validateP6DeliverySnapshot(p6DeliveryP6Paths, committedDelivery)
  )
  expectFailure(records, 'p6-delivery-wrong-parent', 'P6_DELIVERY_COMMIT_TOPOLOGY', () =>
    validateP6DeliverySnapshot(p6DeliveryP6Paths, {
      ...committedDelivery,
      headParent: '2222222222222222222222222222222222222222',
    })
  )
  expectFailure(records, 'p6-delivery-two-local-commits', 'P6_DELIVERY_COMMIT_TOPOLOGY', () =>
    validateP6DeliverySnapshot(p6DeliveryP6Paths, { ...committedDelivery, ahead: 2 })
  )

  const finalLocalCommitAuthority = {
    ...deliveryAuthority,
    unstaged: [],
    untracked: [],
  }
  expectPass(records, 'p6-final-exact-unstaged-candidate', () => {
    const finalPaths = p6FinalLocalCommitPaths(p6DeliveryP6Paths)
    const boundary = phaseBoundaryConfig('p6-terminal', {
      p6Paths: p6DeliveryP6Paths,
      finalLocalCommit: true,
    })
    if (boundary.allowedPaths.size !== 252)
      fail(
        'SELF_TEST_BOUNDARY',
        'P6.7 final boundary must contain 251 historical paths plus the Pages workflow'
      )
    validateP6FinalLocalCommitSnapshot(p6DeliveryP6Paths, {
      ...finalLocalCommitAuthority,
      unstaged: finalPaths.slice(0, 21),
      untracked: finalPaths.slice(21),
    })
  })
  expectPass(records, 'p6-final-exact-fully-staged-candidate', () => {
    const finalPaths = p6FinalLocalCommitPaths(p6DeliveryP6Paths)
    validateP6FinalLocalCommitSnapshot(p6DeliveryP6Paths, {
      ...finalLocalCommitAuthority,
      staged: finalPaths,
    })
  })
  const finalCommittedPaths = p6FinalLocalCommitPaths(p6DeliveryP6Paths)
  const finalCommittedAuthority = {
    ...finalLocalCommitAuthority,
    head: '3333333333333333333333333333333333333333',
    headParent: P6_BASELINE_COMMIT,
    ahead: 1,
    committedPaths: finalCommittedPaths,
  }
  expectPass(records, 'p6-final-exact-clean-committed-state', () =>
    validateP6FinalLocalCommitSnapshot(p6DeliveryP6Paths, finalCommittedAuthority)
  )
  expectFailure(records, 'p6-final-hook-script-missing', 'P6_DELIVERY_PATH_SET_DRIFT', () =>
    validateP6FinalLocalCommitSnapshot(p6DeliveryP6Paths, {
      ...finalLocalCommitAuthority,
      staged: deliveryPaths,
    })
  )
  for (const [id, relPath] of [
    ['p6-final-extra-hook-config', 'scripts/lint-staged-extra.mjs'],
    ['p6-final-lint-staged-config-changed', 'lint-staged.config.mjs'],
    ['p6-final-pre-commit-hook-changed', '.husky/pre-commit'],
  ])
    expectFailure(records, id, 'P6_DELIVERY_PATH_SET_DRIFT', () =>
      validateP6FinalLocalCommitSnapshot(p6DeliveryP6Paths, {
        ...finalLocalCommitAuthority,
        staged: [...finalCommittedPaths, relPath],
      })
    )
  expectFailure(records, 'p6-final-partial-staging', 'P6_DELIVERY_PATH_SET_DRIFT', () =>
    validateP6FinalLocalCommitSnapshot(p6DeliveryP6Paths, {
      ...finalLocalCommitAuthority,
      staged: finalCommittedPaths.slice(0, 1),
    })
  )
  expectFailure(records, 'p6-final-mixed-staging', 'P6_DELIVERY_INDEX_DRIFT', () =>
    validateP6FinalLocalCommitSnapshot(p6DeliveryP6Paths, {
      ...finalLocalCommitAuthority,
      staged: finalCommittedPaths.slice(0, 1),
      unstaged: finalCommittedPaths.slice(1, 21),
      untracked: finalCommittedPaths.slice(21),
    })
  )
  expectFailure(records, 'p6-final-remaining-untracked', 'P6_DELIVERY_PATH_SET_DRIFT', () =>
    validateP6FinalLocalCommitSnapshot(p6DeliveryP6Paths, {
      ...finalLocalCommitAuthority,
      staged: finalCommittedPaths,
      untracked: ['unexpected-p6-final.txt'],
    })
  )
  expectFailure(records, 'p6-final-staged-deletion', 'P6_DELIVERY_DELETION', () =>
    validateP6FinalLocalCommitSnapshot(p6DeliveryP6Paths, {
      ...finalLocalCommitAuthority,
      staged: finalCommittedPaths,
      deleted: [finalCommittedPaths[0]],
    })
  )
  expectFailure(records, 'p6-final-wrong-parent', 'P6_DELIVERY_COMMIT_TOPOLOGY', () =>
    validateP6FinalLocalCommitSnapshot(p6DeliveryP6Paths, {
      ...finalCommittedAuthority,
      headParent: '4444444444444444444444444444444444444444',
    })
  )
  expectFailure(records, 'p6-final-two-local-commits', 'P6_DELIVERY_COMMIT_TOPOLOGY', () =>
    validateP6FinalLocalCommitSnapshot(p6DeliveryP6Paths, {
      ...finalCommittedAuthority,
      ahead: 2,
    })
  )

  const modifiedCorrectionDiff = (head, before, paths) => ({
    head,
    parents: [before],
    parentCommitAvailable: true,
    parentTreeAvailable: true,
    changes: paths.map(relPath => ({ status: 'M', paths: [relPath] })),
  })
  const primaryRemoteAuthority = {
    ...finalLocalCommitAuthority,
    head: P6_PRIMARY_COMMIT,
    headParent: P6_BASELINE_COMMIT,
    headParents: [P6_BASELINE_COMMIT],
    headSubject: 'feat(governance): 完成 P6 UI 源码扫描与严格基线棘轮',
    originMain: P6_PRIMARY_COMMIT,
    ahead: 0,
    behind: 0,
    committedPaths: finalCommittedPaths,
  }
  const correctionHead = '5555555555555555555555555555555555555555'
  const correctionLocalAuthority = {
    ...primaryRemoteAuthority,
    head: P6_PRIMARY_COMMIT,
    headParent: P6_BASELINE_COMMIT,
    headParents: [P6_BASELINE_COMMIT],
    committedPaths: [],
  }
  const correctionCommittedAuthority = {
    ...correctionLocalAuthority,
    head: correctionHead,
    headParent: P6_PRIMARY_COMMIT,
    headParents: [P6_PRIMARY_COMMIT],
    headSubject: P6_CORRECTION_COMMIT_SUBJECT,
    originMain: P6_PRIMARY_COMMIT,
    ahead: 1,
    committedPaths: P6_CORRECTION_PATHS,
    correctionDiff: modifiedCorrectionDiff(correctionHead, P6_PRIMARY_COMMIT, P6_CORRECTION_PATHS),
  }
  const pushCommit = {
    id: correctionHead,
    distinct: true,
  }
  const pushEvent = {
    repository: { full_name: P6_REPOSITORY },
    ref: P6_MAIN_REF,
    before: P6_PRIMARY_COMMIT,
    after: correctionHead,
    created: false,
    deleted: false,
    forced: false,
    size: 1,
    distinct_size: 1,
    commits: [clone(pushCommit)],
    head_commit: clone(pushCommit),
  }
  const pushHeadEvent = clone(pushEvent)
  pushHeadEvent.head = correctionHead
  delete pushHeadEvent.after
  const correctionGitHub = {
    actions: true,
    repository: P6_REPOSITORY,
    ref: P6_MAIN_REF,
    sha: correctionHead,
    eventName: 'push',
    eventPath: '/tmp/github-event.json',
    event: pushEvent,
    eventError: null,
  }
  const correctionHeadGitHub = {
    ...correctionGitHub,
    event: pushHeadEvent,
  }
  const correctionRemoteAuthority = {
    ...correctionCommittedAuthority,
    originMain: correctionHead,
    ahead: 0,
    behind: 0,
  }
  const correctionShallowAuthority = {
    ...correctionRemoteAuthority,
    branch: '',
    shallow: true,
    committedPaths: [],
    github: correctionGitHub,
  }
  const correctionRepairHead = '7777777777777777777777777777777777777777'
  const correctionRepairLocalAuthority = {
    ...correctionRemoteAuthority,
    head: P6_CORRECTION_COMMIT,
    headParent: P6_PRIMARY_COMMIT,
    headParents: [P6_PRIMARY_COMMIT],
    headSubject: P6_CORRECTION_COMMIT_SUBJECT,
    originMain: P6_CORRECTION_COMMIT,
    committedPaths: [],
  }
  const correctionRepairCommittedAuthority = {
    ...correctionRepairLocalAuthority,
    head: correctionRepairHead,
    headParent: P6_CORRECTION_COMMIT,
    headParents: [P6_CORRECTION_COMMIT],
    headSubject: P6_CORRECTION_HEAD_EVENT_FIX_SUBJECT,
    originMain: P6_CORRECTION_COMMIT,
    ahead: 1,
    committedPaths: P6_CORRECTION_PATHS,
    correctionDiff: modifiedCorrectionDiff(
      correctionRepairHead,
      P6_CORRECTION_COMMIT,
      P6_CORRECTION_PATHS
    ),
  }
  const repairPushCommit = {
    id: correctionRepairHead,
    distinct: true,
  }
  const repairPushHeadEvent = {
    repository: { full_name: P6_REPOSITORY },
    ref: P6_MAIN_REF,
    before: P6_CORRECTION_COMMIT,
    head: correctionRepairHead,
    created: false,
    deleted: false,
    forced: false,
    size: 1,
    distinct_size: 1,
    commits: [clone(repairPushCommit)],
    head_commit: clone(repairPushCommit),
  }
  const correctionRepairGitHub = {
    ...correctionGitHub,
    sha: correctionRepairHead,
    event: repairPushHeadEvent,
  }
  const correctionRepairRemoteAuthority = {
    ...correctionRepairCommittedAuthority,
    originMain: correctionRepairHead,
    ahead: 0,
    behind: 0,
  }
  const correctionRepairShallowAuthority = {
    ...correctionRepairRemoteAuthority,
    branch: '',
    shallow: true,
    committedPaths: [],
    github: correctionRepairGitHub,
  }
  const actionsPathBoundaryHead = '9999999999999999999999999999999999999999'
  const actionsPathBoundaryLocalAuthority = {
    ...primaryRemoteAuthority,
    head: P6_ACTIONS_PATH_BOUNDARY_CORRECTION_BASE,
    headParent: P6_CORRECTION_COMMIT,
    headParents: [P6_CORRECTION_COMMIT],
    headSubject: P6_CORRECTION_HEAD_EVENT_FIX_SUBJECT,
    originMain: P6_ACTIONS_PATH_BOUNDARY_CORRECTION_BASE,
    committedPaths: [],
  }
  const actionsPathBoundaryCommittedAuthority = {
    ...actionsPathBoundaryLocalAuthority,
    head: actionsPathBoundaryHead,
    headParent: P6_ACTIONS_PATH_BOUNDARY_CORRECTION_BASE,
    headParents: [P6_ACTIONS_PATH_BOUNDARY_CORRECTION_BASE],
    headSubject: P6_ACTIONS_PATH_BOUNDARY_CORRECTION_SUBJECT,
    ahead: 1,
    correctionDiff: modifiedCorrectionDiff(
      actionsPathBoundaryHead,
      P6_ACTIONS_PATH_BOUNDARY_CORRECTION_BASE,
      P6_ACTIONS_PATH_BOUNDARY_CORRECTION_PATHS
    ),
  }
  const actionsPathBoundaryPushCommit = { id: actionsPathBoundaryHead }
  const actionsPathBoundaryPushEvent = {
    repository: { full_name: P6_REPOSITORY },
    ref: P6_MAIN_REF,
    before: P6_ACTIONS_PATH_BOUNDARY_CORRECTION_BASE,
    after: actionsPathBoundaryHead,
    created: false,
    deleted: false,
    forced: false,
    commits: [clone(actionsPathBoundaryPushCommit)],
    head_commit: clone(actionsPathBoundaryPushCommit),
  }
  const actionsPathBoundaryGitHub = {
    actions: true,
    repository: P6_REPOSITORY,
    ref: P6_MAIN_REF,
    sha: actionsPathBoundaryHead,
    eventName: 'push',
    eventPath: '/tmp/github-event.json',
    event: actionsPathBoundaryPushEvent,
    eventError: null,
  }
  const actionsPathBoundaryRemoteAuthority = {
    ...actionsPathBoundaryCommittedAuthority,
    originMain: actionsPathBoundaryHead,
    ahead: 0,
    github: actionsPathBoundaryGitHub,
  }
  const actionsPathBoundaryPagesAuthority = {
    ...actionsPathBoundaryRemoteAuthority,
    branch: '',
    shallow: false,
  }

  expectPass(records, 'p6-correction-pushed-primary-full-history', () =>
    validateP6TerminalRepositorySnapshot(p6DeliveryP6Paths, primaryRemoteAuthority)
  )
  expectPass(records, 'p6-correction-https-origin-normalized', () =>
    validateP6TerminalRepositorySnapshot(p6DeliveryP6Paths, {
      ...primaryRemoteAuthority,
      originUrl: 'https://github.com/ichichuang/ccd.git',
    })
  )
  expectPass(records, 'p6-correction-ssh-url-origin-normalized', () =>
    validateP6TerminalRepositorySnapshot(p6DeliveryP6Paths, {
      ...primaryRemoteAuthority,
      originUrl: 'ssh://git@github.com/ichichuang/ccd.git',
    })
  )
  expectPass(records, 'p6-correction-exact-unstaged-candidate', () =>
    validateP6TerminalRepositorySnapshot(p6DeliveryP6Paths, {
      ...correctionLocalAuthority,
      unstaged: [...P6_CORRECTION_PATHS],
    })
  )
  expectPass(records, 'p6-correction-exact-fully-staged-candidate', () =>
    validateP6TerminalRepositorySnapshot(p6DeliveryP6Paths, {
      ...correctionLocalAuthority,
      staged: [...P6_CORRECTION_PATHS],
    })
  )
  expectPass(records, 'p6-correction-exact-local-commit', () =>
    validateP6TerminalRepositorySnapshot(p6DeliveryP6Paths, correctionCommittedAuthority)
  )
  expectPass(records, 'p6-correction-exact-pushed-full-history', () =>
    validateP6TerminalRepositorySnapshot(p6DeliveryP6Paths, correctionRemoteAuthority)
  )
  expectPass(records, 'p6-correction-exact-pushed-shallow-event', () =>
    validateP6TerminalRepositorySnapshot(p6DeliveryP6Paths, correctionShallowAuthority)
  )
  expectPass(records, 'p6-correction-exact-pushed-shallow-head-event', () =>
    validateP6TerminalRepositorySnapshot(p6DeliveryP6Paths, {
      ...correctionShallowAuthority,
      github: correctionHeadGitHub,
    })
  )
  expectPass(records, 'p6-correction-event-fix-exact-unstaged-candidate', () =>
    validateP6TerminalRepositorySnapshot(p6DeliveryP6Paths, {
      ...correctionRepairLocalAuthority,
      unstaged: [...P6_CORRECTION_PATHS],
    })
  )
  expectPass(records, 'p6-correction-event-fix-exact-local-commit', () =>
    validateP6TerminalRepositorySnapshot(p6DeliveryP6Paths, correctionRepairCommittedAuthority)
  )
  expectPass(records, 'p6-correction-event-fix-exact-pushed-full-history', () =>
    validateP6TerminalRepositorySnapshot(p6DeliveryP6Paths, correctionRepairRemoteAuthority)
  )
  expectPass(records, 'p6-correction-event-fix-exact-pushed-shallow-head-event', () =>
    validateP6TerminalRepositorySnapshot(p6DeliveryP6Paths, correctionRepairShallowAuthority)
  )
  expectFailure(records, 'p6-correction-wrong-repository', 'P6_DELIVERY_REPOSITORY_IDENTITY', () =>
    validateP6TerminalRepositorySnapshot(p6DeliveryP6Paths, {
      ...correctionLocalAuthority,
      originUrl: 'git@github.com:someone/else.git',
      unstaged: [...P6_CORRECTION_PATHS],
    })
  )
  for (const [id, originUrl] of [
    ['p6-correction-unsafe-http-origin', 'http://github.com/ichichuang/ccd.git'],
    ['p6-correction-credentialed-origin', 'https://token@github.com/ichichuang/ccd.git'],
  ])
    expectFailure(records, id, 'P6_DELIVERY_REPOSITORY_IDENTITY', () =>
      validateP6TerminalRepositorySnapshot(p6DeliveryP6Paths, {
        ...correctionLocalAuthority,
        originUrl,
        unstaged: [...P6_CORRECTION_PATHS],
      })
    )
  expectFailure(records, 'p6-correction-incomplete-staging', 'P6_CORRECTION_INDEX_DRIFT', () =>
    validateP6TerminalRepositorySnapshot(p6DeliveryP6Paths, {
      ...correctionLocalAuthority,
      staged: P6_CORRECTION_PATHS.slice(0, 1),
      unstaged: P6_CORRECTION_PATHS.slice(1),
    })
  )
  expectFailure(records, 'p6-correction-unexpected-path', 'P6_CORRECTION_PATH_SET_DRIFT', () =>
    validateP6TerminalRepositorySnapshot(p6DeliveryP6Paths, {
      ...correctionLocalAuthority,
      unstaged: [...P6_CORRECTION_PATHS, 'unexpected-p6-correction.txt'],
    })
  )
  expectFailure(records, 'p6-correction-wrong-parent', 'P6_CORRECTION_COMMIT_TOPOLOGY', () =>
    validateP6TerminalRepositorySnapshot(p6DeliveryP6Paths, {
      ...correctionRemoteAuthority,
      headParent: P6_BASELINE_COMMIT,
      headParents: [P6_BASELINE_COMMIT],
    })
  )
  expectFailure(records, 'p6-correction-subject-drift', 'P6_CORRECTION_COMMIT_TOPOLOGY', () =>
    validateP6TerminalRepositorySnapshot(p6DeliveryP6Paths, {
      ...correctionRemoteAuthority,
      headSubject: 'fix(governance): wrong subject',
    })
  )
  expectFailure(records, 'p6-correction-forced-push', 'P6_CORRECTION_FORCED_PUSH', () => {
    const github = clone(correctionGitHub)
    github.event.forced = true
    validateP6TerminalRepositorySnapshot(p6DeliveryP6Paths, {
      ...correctionShallowAuthority,
      github,
    })
  })
  expectFailure(records, 'p6-correction-malformed-event', 'P6_CORRECTION_EVENT_INVALID', () => {
    const github = clone(correctionGitHub)
    github.event.commits = {}
    validateP6TerminalRepositorySnapshot(p6DeliveryP6Paths, {
      ...correctionShallowAuthority,
      github,
    })
  })
  expectFailure(
    records,
    'p6-correction-wrong-event-repository',
    'P6_CORRECTION_EVENT_INVALID',
    () => {
      const github = clone(correctionGitHub)
      github.event.repository.full_name = 'someone/else'
      validateP6TerminalRepositorySnapshot(p6DeliveryP6Paths, {
        ...correctionShallowAuthority,
        github,
      })
    }
  )
  expectFailure(records, 'p6-correction-wrong-event-ref', 'P6_CORRECTION_EVENT_INVALID', () => {
    const github = clone(correctionGitHub)
    github.ref = 'refs/heads/not-main'
    github.event.ref = 'refs/heads/not-main'
    validateP6TerminalRepositorySnapshot(p6DeliveryP6Paths, {
      ...correctionShallowAuthority,
      branch: 'main',
      github,
    })
  })
  expectFailure(records, 'p6-correction-shallow-event-missing', 'P6_CORRECTION_EVENT_INVALID', () =>
    validateP6TerminalRepositorySnapshot(p6DeliveryP6Paths, {
      ...correctionShallowAuthority,
      github: { ...correctionGitHub, event: null },
    })
  )
  expectFailure(records, 'p6-correction-push-head-missing', 'P6_CORRECTION_EVENT_INVALID', () => {
    const github = clone(correctionGitHub)
    delete github.event.after
    validateP6TerminalRepositorySnapshot(p6DeliveryP6Paths, {
      ...correctionShallowAuthority,
      github,
    })
  })
  expectFailure(records, 'p6-correction-push-head-drift', 'P6_CORRECTION_EVENT_INVALID', () => {
    const github = clone(correctionHeadGitHub)
    github.event.head = '6666666666666666666666666666666666666666'
    validateP6TerminalRepositorySnapshot(p6DeliveryP6Paths, {
      ...correctionShallowAuthority,
      github,
    })
  })
  expectFailure(records, 'p6-correction-push-head-conflict', 'P6_CORRECTION_EVENT_INVALID', () => {
    const github = clone(correctionGitHub)
    github.event.head = '6666666666666666666666666666666666666666'
    validateP6TerminalRepositorySnapshot(p6DeliveryP6Paths, {
      ...correctionShallowAuthority,
      github,
    })
  })
  expectFailure(
    records,
    'p6-correction-event-fix-subject-drift',
    'P6_CORRECTION_COMMIT_TOPOLOGY',
    () =>
      validateP6TerminalRepositorySnapshot(p6DeliveryP6Paths, {
        ...correctionRepairRemoteAuthority,
        headSubject: 'fix(governance): wrong subject',
      })
  )
  expectFailure(
    records,
    'p6-correction-event-fix-wrong-before',
    'P6_CORRECTION_EVENT_INVALID',
    () => {
      const github = clone(correctionRepairGitHub)
      github.event.before = P6_PRIMARY_COMMIT
      validateP6TerminalRepositorySnapshot(p6DeliveryP6Paths, {
        ...correctionRepairShallowAuthority,
        github,
      })
    }
  )
  expectFailure(records, 'p6-correction-push-deletion', 'P6_CORRECTION_COMMIT_PATH_DRIFT', () => {
    const correctionDiff = clone(correctionShallowAuthority.correctionDiff)
    correctionDiff.changes[1].status = 'D'
    validateP6TerminalRepositorySnapshot(p6DeliveryP6Paths, {
      ...correctionShallowAuthority,
      correctionDiff,
    })
  })
  expectPass(records, 'p6-actions-path-official-payload-no-path-arrays', () =>
    validateP6TerminalRepositorySnapshot(p6DeliveryP6Paths, actionsPathBoundaryPagesAuthority)
  )
  expectPass(records, 'p6-actions-path-exact-four-file-unstaged-candidate', () =>
    validateP6TerminalRepositorySnapshot(p6DeliveryP6Paths, {
      ...actionsPathBoundaryLocalAuthority,
      unstaged: [...P6_ACTIONS_PATH_BOUNDARY_CORRECTION_PATHS],
    })
  )
  expectPass(records, 'p6-actions-path-exact-four-file-staged-candidate', () =>
    validateP6TerminalRepositorySnapshot(p6DeliveryP6Paths, {
      ...actionsPathBoundaryLocalAuthority,
      staged: [...P6_ACTIONS_PATH_BOUNDARY_CORRECTION_PATHS],
    })
  )
  expectPass(records, 'p6-actions-path-exact-local-correction-commit', () =>
    validateP6TerminalRepositorySnapshot(p6DeliveryP6Paths, actionsPathBoundaryCommittedAuthority)
  )
  expectPass(records, 'p6-actions-path-exact-remote-full-history-correction', () =>
    validateP6TerminalRepositorySnapshot(p6DeliveryP6Paths, actionsPathBoundaryRemoteAuthority)
  )
  expectPass(records, 'p6-actions-path-full-history-https-origin', () =>
    validateP6TerminalRepositorySnapshot(p6DeliveryP6Paths, {
      ...actionsPathBoundaryRemoteAuthority,
      shallow: false,
      originUrl: 'https://github.com/ichichuang/ccd.git',
    })
  )
  expectFailure(
    records,
    'p6-actions-path-pages-depth-two',
    'P6_CORRECTION_BASELINE_OBJECT_UNAVAILABLE',
    () =>
      validateP6TerminalRepositorySnapshot(p6DeliveryP6Paths, {
        ...actionsPathBoundaryPagesAuthority,
        shallow: true,
      })
  )
  expectPass(records, 'p6-actions-path-after-head', () =>
    validateP6TerminalRepositorySnapshot(p6DeliveryP6Paths, actionsPathBoundaryPagesAuthority)
  )
  expectPass(records, 'p6-actions-path-head-head', () => {
    const github = clone(actionsPathBoundaryGitHub)
    github.event.head = actionsPathBoundaryHead
    delete github.event.after
    return validateP6TerminalRepositorySnapshot(p6DeliveryP6Paths, {
      ...actionsPathBoundaryPagesAuthority,
      github,
    })
  })
  expectPass(records, 'p6-actions-path-both-heads', () => {
    const github = clone(actionsPathBoundaryGitHub)
    github.event.head = actionsPathBoundaryHead
    return validateP6TerminalRepositorySnapshot(p6DeliveryP6Paths, {
      ...actionsPathBoundaryPagesAuthority,
      github,
    })
  })
  expectPass(records, 'p6-actions-path-exact-four-modified-statuses', () =>
    validateP6TerminalRepositorySnapshot(p6DeliveryP6Paths, actionsPathBoundaryCommittedAuthority)
  )
  expectFailure(
    records,
    'p6-actions-path-both-heads-missing',
    'P6_CORRECTION_EVENT_INVALID',
    () => {
      const github = clone(actionsPathBoundaryGitHub)
      delete github.event.after
      validateP6TerminalRepositorySnapshot(p6DeliveryP6Paths, {
        ...actionsPathBoundaryPagesAuthority,
        github,
      })
    }
  )
  expectFailure(records, 'p6-actions-path-conflicting-heads', 'P6_CORRECTION_EVENT_INVALID', () => {
    const github = clone(actionsPathBoundaryGitHub)
    github.event.head = '8888888888888888888888888888888888888888'
    validateP6TerminalRepositorySnapshot(p6DeliveryP6Paths, {
      ...actionsPathBoundaryPagesAuthority,
      github,
    })
  })
  expectFailure(records, 'p6-actions-path-wrong-before', 'P6_CORRECTION_EVENT_INVALID', () => {
    const github = clone(actionsPathBoundaryGitHub)
    github.event.before = P6_CORRECTION_COMMIT
    validateP6TerminalRepositorySnapshot(p6DeliveryP6Paths, {
      ...actionsPathBoundaryPagesAuthority,
      github,
    })
  })
  expectFailure(records, 'p6-actions-path-wrong-parent', 'P6_CORRECTION_COMMIT_TOPOLOGY', () =>
    validateP6TerminalRepositorySnapshot(p6DeliveryP6Paths, {
      ...actionsPathBoundaryCommittedAuthority,
      headParent: P6_CORRECTION_COMMIT,
      headParents: [P6_CORRECTION_COMMIT],
    })
  )
  expectFailure(records, 'p6-actions-path-wrong-subject', 'P6_CORRECTION_COMMIT_TOPOLOGY', () =>
    validateP6TerminalRepositorySnapshot(p6DeliveryP6Paths, {
      ...actionsPathBoundaryCommittedAuthority,
      headSubject: 'fix(governance): wrong subject',
    })
  )
  expectFailure(
    records,
    'p6-actions-path-parent-object-unavailable',
    'P6_CORRECTION_PARENT_OBJECT_UNAVAILABLE',
    () => {
      const correctionDiff = clone(actionsPathBoundaryCommittedAuthority.correctionDiff)
      correctionDiff.parentCommitAvailable = false
      correctionDiff.parentTreeAvailable = false
      validateP6TerminalRepositorySnapshot(p6DeliveryP6Paths, {
        ...actionsPathBoundaryCommittedAuthority,
        correctionDiff,
      })
    }
  )
  expectFailure(
    records,
    'p6-actions-path-pages-depth-one',
    'P6_CORRECTION_PARENT_OBJECT_UNAVAILABLE',
    () => {
      const correctionDiff = clone(actionsPathBoundaryPagesAuthority.correctionDiff)
      correctionDiff.parentCommitAvailable = false
      correctionDiff.parentTreeAvailable = false
      validateP6TerminalRepositorySnapshot(p6DeliveryP6Paths, {
        ...actionsPathBoundaryPagesAuthority,
        correctionDiff,
      })
    }
  )
  expectFailure(records, 'p6-actions-path-forced-push', 'P6_CORRECTION_FORCED_PUSH', () => {
    const github = clone(actionsPathBoundaryGitHub)
    github.event.forced = true
    validateP6TerminalRepositorySnapshot(p6DeliveryP6Paths, {
      ...actionsPathBoundaryPagesAuthority,
      github,
    })
  })
  expectFailure(records, 'p6-actions-path-wrong-ref', 'P6_CORRECTION_EVENT_INVALID', () => {
    const github = clone(actionsPathBoundaryGitHub)
    github.ref = 'refs/heads/not-main'
    github.event.ref = 'refs/heads/not-main'
    validateP6TerminalRepositorySnapshot(p6DeliveryP6Paths, {
      ...actionsPathBoundaryPagesAuthority,
      branch: 'main',
      github,
    })
  })
  expectFailure(records, 'p6-actions-path-wrong-repository', 'P6_CORRECTION_EVENT_INVALID', () => {
    const github = clone(actionsPathBoundaryGitHub)
    github.event.repository.full_name = 'someone/else'
    validateP6TerminalRepositorySnapshot(p6DeliveryP6Paths, {
      ...actionsPathBoundaryPagesAuthority,
      github,
    })
  })
  expectFailure(
    records,
    'p6-actions-path-two-pushed-commits',
    'P6_CORRECTION_EVENT_INVALID',
    () => {
      const github = clone(actionsPathBoundaryGitHub)
      github.event.commits.push(clone(actionsPathBoundaryPushCommit))
      validateP6TerminalRepositorySnapshot(p6DeliveryP6Paths, {
        ...actionsPathBoundaryPagesAuthority,
        github,
      })
    }
  )
  for (const [id, mutate] of [
    ['p6-actions-path-extra-path', changes => changes.push({ status: 'M', paths: ['extra.txt'] })],
    [
      'p6-actions-path-missing-workflow',
      changes => changes.filter(change => change.paths[0] !== '.github/workflows/deploy.yml'),
    ],
    [
      'p6-actions-path-missing-wiki',
      changes =>
        changes.filter(
          change => change.paths[0] !== 'wiki/canonical/design/ui-source-enforcement.md'
        ),
    ],
    [
      'p6-actions-path-missing-cold-start-validator',
      changes =>
        changes.filter(change => change.paths[0] !== 'scripts/governance/cold-start-validate.mjs'),
    ],
    [
      'p6-actions-path-missing-routing-validator',
      changes =>
        changes.filter(
          change => change.paths[0] !== 'scripts/governance/project-ui-routing-validate.mjs'
        ),
    ],
    [
      'p6-actions-path-added-path',
      changes => [{ status: 'A', paths: changes[0].paths }, ...changes.slice(1)],
    ],
    [
      'p6-actions-path-deleted-path',
      changes => [{ status: 'D', paths: changes[0].paths }, ...changes.slice(1)],
    ],
    [
      'p6-actions-path-renamed-path',
      changes => [
        { status: 'R100', paths: [changes[0].paths[0], 'renamed.yml'] },
        ...changes.slice(1),
      ],
    ],
  ])
    expectFailure(records, id, 'P6_CORRECTION_COMMIT_PATH_DRIFT', () => {
      const correctionDiff = clone(actionsPathBoundaryCommittedAuthority.correctionDiff)
      correctionDiff.changes = mutate(correctionDiff.changes) ?? correctionDiff.changes
      validateP6TerminalRepositorySnapshot(p6DeliveryP6Paths, {
        ...actionsPathBoundaryCommittedAuthority,
        correctionDiff,
      })
    })
  expectFailure(records, 'p6-actions-path-partial-staging', 'P6_CORRECTION_INDEX_DRIFT', () =>
    validateP6TerminalRepositorySnapshot(p6DeliveryP6Paths, {
      ...actionsPathBoundaryLocalAuthority,
      staged: P6_ACTIONS_PATH_BOUNDARY_CORRECTION_PATHS.slice(0, 2),
      unstaged: P6_ACTIONS_PATH_BOUNDARY_CORRECTION_PATHS.slice(2),
    })
  )
  expectFailure(
    records,
    'p6-actions-path-second-local-commit',
    'P6_CORRECTION_COMMIT_TOPOLOGY',
    () =>
      validateP6TerminalRepositorySnapshot(p6DeliveryP6Paths, {
        ...actionsPathBoundaryCommittedAuthority,
        ahead: 2,
      })
  )

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

const validatePageContractAbsence = root => {
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
}

const readP6Json = (root, relPath) => {
  try {
    return JSON.parse(readText(root, relPath))
  } catch (error) {
    fail('P6_ARTIFACT_INVALID_JSON', `P6 artifact is not valid JSON: ${relPath}`, {
      relPath,
      cause: error instanceof Error ? error.message : String(error),
    })
  }
}

const p6FilesUnder = (root, relRoot) => (exists(root, relRoot) ? listFiles(root, relRoot) : [])

const p6Canonicalize = value => {
  if (Array.isArray(value)) return value.map(p6Canonicalize)
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map(key => [key, p6Canonicalize(value[key])])
    )
  return value
}

const p6CanonicalJson = value => `${JSON.stringify(p6Canonicalize(value))}\n`
const p6Digest = value => `sha256:${sha256(p6CanonicalJson(value))}`

const validateP6RecoveredHashes = root => {
  const mismatches = []
  for (const [relPath, expected] of Object.entries(P6_RECOVERED_EXACT_HASHES)) {
    if (!exists(root, relPath)) {
      mismatches.push({ relPath, expected, actual: 'missing' })
      continue
    }
    const actual = sha256(read(root, relPath))
    if (actual !== expected) mismatches.push({ relPath, expected, actual })
  }
  if (mismatches.length > 0)
    fail('P6_RECOVERED_AUTHORITY_DRIFT', 'Recovered P6.4 authority bytes drifted', {
      mismatches,
    })
}

const validateP6TerminalBaseline = (root, fixturePaths) => {
  const baselineBytes = read(root, P6_BASELINE_PATH)
  const baseline = readP6Json(root, P6_BASELINE_PATH)
  if (baseline.repository !== 'ichichuang/ccd' || baseline.baselineCommit !== P6_BASELINE_COMMIT)
    fail('P6_BASELINE_IDENTITY_DRIFT', 'Canonical baseline repository or commit drifted')
  const baselineSha256 = sha256(baselineBytes)
  if (baselineSha256 !== P6_BASELINE_SHA256)
    fail('P6_BASELINE_HASH_DRIFT', 'Canonical source baseline bytes drifted', {
      expected: P6_BASELINE_SHA256,
      actual: baselineSha256,
    })
  const expectedKeys = [
    'baselineCommit',
    'declaredFileCount',
    'declaredFindingCount',
    'declaredFingerprintCount',
    'declaredRuleCount',
    'detectorCoverageSummary',
    'entries',
    'fingerprintAlgorithm',
    'policyDigest',
    'repository',
    'ruleCoverageSummary',
    'scannerManifestDigest',
    'scannerModuleDigests',
    'scannerVersion',
    'schemaVersion',
  ].sort()
  if (JSON.stringify(Object.keys(baseline).sort()) !== JSON.stringify(expectedKeys))
    fail('P6_BASELINE_SCHEMA_INVALID', 'Canonical baseline top-level fields drifted')
  const expectedRuleSummary = {
    sourceEnforceable: 24,
    assisted: 22,
    schemaEnforced: 8,
    humanReviewOnly: 14,
    sourceCapable: 46,
    total: 68,
  }
  const expectedDetectorSummary = {
    declared: 14,
    sourceCapable: 12,
    schemaOnly: 1,
    humanOnly: 1,
    executed: 12,
  }
  if (
    baseline.schemaVersion !== 'ccd-ui-source-baseline/v1' ||
    baseline.repository !== 'ichichuang/ccd' ||
    baseline.baselineCommit !== P6_BASELINE_COMMIT ||
    baseline.scannerVersion !== '1.0.0' ||
    baseline.fingerprintAlgorithm !== 'sha256:ccd-ui-fingerprint/v1' ||
    baseline.declaredRuleCount !== 68 ||
    baseline.declaredFileCount !== 554 ||
    baseline.declaredFindingCount !== 393 ||
    baseline.declaredFingerprintCount !== 328 ||
    p6CanonicalJson(baseline.ruleCoverageSummary) !== p6CanonicalJson(expectedRuleSummary) ||
    p6CanonicalJson(baseline.detectorCoverageSummary) !==
      p6CanonicalJson(expectedDetectorSummary) ||
    !Array.isArray(baseline.entries) ||
    baseline.entries.length !== 328
  )
    fail('P6_BASELINE_SCHEMA_INVALID', 'Canonical baseline identity, summaries, or counts drifted')
  const entryKeys = [
    'count',
    'detectorId',
    'fingerprint',
    'locations',
    'normalizedEvidence',
    'ownerKey',
    'path',
    'ruleId',
  ].sort()
  const fingerprints = new Set()
  let findingCount = 0
  for (const entry of baseline.entries) {
    if (
      !entry ||
      JSON.stringify(Object.keys(entry).sort()) !== JSON.stringify(entryKeys) ||
      !/^sha256:[0-9a-f]{64}$/u.test(entry.fingerprint) ||
      !/^CCD-UI-\d{3}$/u.test(entry.ruleId) ||
      typeof entry.detectorId !== 'string' ||
      entry.detectorId.length === 0 ||
      typeof entry.path !== 'string' ||
      path.posix.isAbsolute(entry.path) ||
      entry.path.split('/').includes('..') ||
      typeof entry.ownerKey !== 'string' ||
      entry.ownerKey.length === 0 ||
      !Number.isInteger(entry.count) ||
      entry.count < 1 ||
      !Array.isArray(entry.locations) ||
      entry.locations.length === 0 ||
      entry.locations.some(
        location =>
          !location ||
          JSON.stringify(Object.keys(location).sort()) !==
            JSON.stringify(['column', 'endColumn', 'endLine', 'line']) ||
          [location.line, location.column, location.endLine, location.endColumn].some(
            value => !Number.isInteger(value) || value < 1
          )
      )
    )
      fail('P6_BASELINE_SCHEMA_INVALID', 'Canonical baseline entry schema drifted')
    if (fingerprints.has(entry.fingerprint))
      fail('P6_BASELINE_SCHEMA_INVALID', 'Canonical baseline contains duplicate fingerprints')
    fingerprints.add(entry.fingerprint)
    findingCount += entry.count
  }
  if (findingCount !== 393)
    fail('P6_BASELINE_SCHEMA_INVALID', 'Canonical baseline finding total drifted', {
      actual: findingCount,
    })

  const policy = readP6Json(root, '.ai/governance/policies/ui.json')
  const policyProjection = {
    schemaVersion: policy.schemaVersion,
    repository: policy.repository,
    counts: { ruleCount: policy.counts?.ruleCount },
    clusters: policy.clusters,
    rules: policy.rules,
    scopeRegistry: policy.scopeRegistry,
    ruleToSourceMappings: policy.ruleToSourceMappings,
    sourceRequirementMappings: policy.sourceRequirementMappings,
    exceptionPolicy: policy.exceptionPolicy,
  }
  const manifest = readP6Json(root, '.ai/governance/ui/source-enforcement.json')
  if (
    baseline.policyDigest !== P6_POLICY_DIGEST ||
    baseline.policyDigest !== p6Digest(policyProjection) ||
    baseline.scannerManifestDigest !== P6_SCANNER_MANIFEST_DIGEST ||
    baseline.scannerManifestDigest !== p6Digest(manifest)
  )
    fail('P6_BASELINE_DIGEST_DRIFT', 'Canonical baseline authority digest drifted')

  const expectedModules = [
    '.ai/governance/ui/scripts/scan-ui-source.mjs',
    ...P6_SCANNER_MODULE_PATHS,
  ].sort()
  if (
    JSON.stringify(Object.keys(baseline.scannerModuleDigests).sort()) !==
    JSON.stringify(expectedModules)
  )
    fail('P6_BASELINE_MODULE_DIGEST_DRIFT', 'Canonical baseline module set drifted')
  for (const relPath of expectedModules) {
    const actual = `sha256:${sha256(read(root, relPath))}`
    if (baseline.scannerModuleDigests[relPath] !== actual)
      fail('P6_BASELINE_MODULE_DIGEST_DRIFT', `Scanner module digest drifted: ${relPath}`)
  }

  const fixtureRows = [...fixturePaths]
    .sort()
    .map(relPath => `${relPath}=${sha256(read(root, relPath))}\n`)
    .join('')
  if (sha256(fixtureRows) !== P6_FIXTURE_AGGREGATE_SHA256)
    fail('P6_FIXTURE_BYTE_DRIFT', 'Recovered P6.4 fixture bytes drifted')

  const exceptions = readP6Json(root, '.ai/governance/ui/exceptions.json')
  if (!Array.isArray(exceptions.exceptions) || exceptions.exceptions.length !== 0)
    fail('P6_REAL_EXCEPTION_PRESENT', 'P6 terminal requires zero real exceptions')

  const lock = readP6Json(root, '.ai/manifests/skills-lock.json')
  const missingLegacySkills = P6_LEGACY_SKILL_IDS.filter(id => {
    const source = lock.skills?.[id]?.source
    return (
      typeof source !== 'string' || !source.startsWith('repo:') || !exists(root, source.slice(5))
    )
  })
  if (missingLegacySkills.length > 0 || p6FilesUnder(root, '.ai/rules').length === 0)
    fail('P6_LEGACY_ASSET_DRIFT', 'Legacy Skills and rules must remain present', {
      missingLegacySkills,
    })

  validateP6RecoveredHashes(root)
  return baseline
}

const validateP6ArtifactState = (root, documents) => {
  const baselineExists = exists(root, P6_BASELINE_PATH)

  const canonicalSchemas = new Set(
    P6_4_FIXED_PATHS.filter(relPath => relPath.includes('/schemas/'))
  )
  const scannerPaths = [...p6FilesUnder(root, '.ai'), ...p6FilesUnder(root, 'scripts')].filter(
    relPath => /source[-_]?scanner/iu.test(relPath)
  )
  const shortenedSchemas = p6FilesUnder(root, '.ai/governance/ui/schemas').filter(
    relPath => /source.*\.schema\.json$/iu.test(relPath) && !canonicalSchemas.has(relPath)
  )
  const alternativeBaselines = p6FilesUnder(root, '.ai/governance/ui').filter(
    relPath =>
      /source[-_]?baseline/iu.test(path.posix.basename(relPath)) &&
      relPath !== P6_BASELINE_PATH &&
      relPath !== '.ai/governance/ui/schemas/ui-source-baseline.schema.json'
  )
  const alternativePaths = [...scannerPaths, ...shortenedSchemas, ...alternativeBaselines]
    .filter(relPath => !relPath.startsWith('.ai/governance/ui/source-scanner/'))
    .sort()
  if (alternativePaths.length > 0)
    fail('P6_ALTERNATIVE_SCANNER_PATH', 'Alternative P6 scanner paths are forbidden', {
      paths: alternativePaths,
    })

  const evidencePaths = [
    ...P6_4_FIXED_PATHS.slice(0, 10),
    '.ai/governance/ui/source-scanner',
    '.ai/governance/ui/fixtures/source-valid',
    '.ai/governance/ui/fixtures/source-invalid',
  ].filter(relPath => exists(root, relPath))
  if (evidencePaths.length === 0)
    return { state: 'P5_TERMINAL', p6Paths: [], fixturePaths: [], modulePaths: [] }

  const missingFixed = P6_4_FIXED_PATHS.filter(relPath => !exists(root, relPath)).sort()
  if (missingFixed.length > 0)
    fail('P6_ARTIFACT_PARTIAL', 'P6.4 fixed artifacts are partial', { missing: missingFixed })
  const invalidFixedTypes = P6_4_FIXED_PATHS.filter(relPath => {
    const stat = fs.lstatSync(path.join(root, relPath))
    return stat.isSymbolicLink() || !stat.isFile()
  }).sort()
  if (invalidFixedTypes.length > 0)
    fail('P6_ARTIFACT_TYPE', 'P6.4 fixed artifacts must be regular files', {
      paths: invalidFixedTypes,
    })

  const enforcement = readP6Json(root, '.ai/governance/ui/source-enforcement.json')
  const expectedSourceModules = [
    '.ai/governance/ui/scripts/scan-ui-source.mjs',
    ...P6_SCANNER_MODULE_PATHS,
  ]
  const declaredSourceModules = enforcement?.sourceModules
  if (!Array.isArray(declaredSourceModules))
    fail('P6_SCANNER_MODULE_SET_DRIFT', 'source-enforcement.json must declare sourceModules')
  const unexpectedDeclaredModules = declaredSourceModules
    .filter(relPath => !expectedSourceModules.includes(relPath))
    .sort()
  if (unexpectedDeclaredModules.length > 0)
    fail('P6_UNEXPECTED_SCANNER_MODULE', 'Unexpected scanner modules are declared', {
      paths: unexpectedDeclaredModules,
    })
  const missingDeclaredModules = expectedSourceModules
    .filter(relPath => !declaredSourceModules.includes(relPath))
    .sort()
  if (missingDeclaredModules.length > 0)
    fail('P6_SCANNER_MODULE_MISSING', 'Required scanner modules are not declared', {
      paths: missingDeclaredModules,
    })
  if (JSON.stringify(declaredSourceModules) !== JSON.stringify(expectedSourceModules))
    fail('P6_SCANNER_MODULE_ORDER_DRIFT', 'Scanner module declaration order drifted')

  const actualModulePaths = p6FilesUnder(root, '.ai/governance/ui/source-scanner')
  const unexpectedModules = actualModulePaths
    .filter(relPath => !P6_SCANNER_MODULE_PATHS.includes(relPath))
    .sort()
  if (unexpectedModules.length > 0)
    fail('P6_UNEXPECTED_SCANNER_MODULE', 'Unexpected scanner modules are present', {
      paths: unexpectedModules,
    })
  const missingModules = P6_SCANNER_MODULE_PATHS.filter(
    relPath => !actualModulePaths.includes(relPath)
  ).sort()
  if (missingModules.length > 0)
    fail('P6_SCANNER_MODULE_MISSING', 'Required scanner modules are missing', {
      paths: missingModules,
    })
  const invalidModuleTypes = P6_SCANNER_MODULE_PATHS.filter(relPath => {
    const stat = fs.lstatSync(path.join(root, relPath))
    return stat.isSymbolicLink() || !stat.isFile()
  }).sort()
  if (invalidModuleTypes.length > 0)
    fail('P6_ARTIFACT_TYPE', 'Scanner modules must be regular files', {
      paths: invalidModuleTypes,
    })

  const fixtureManifest = readP6Json(root, '.ai/governance/ui/fixtures/source-cases.json')
  if (!Array.isArray(fixtureManifest?.cases) || fixtureManifest.cases.length !== 162)
    fail('P6_FIXTURE_SET_DRIFT', 'P6 fixture manifest must declare exactly 162 cases')
  const fixturePaths = fixtureManifest.cases.map(item => item?.fixturePath)
  if (fixturePaths.some(relPath => typeof relPath !== 'string'))
    fail('P6_FIXTURE_SET_DRIFT', 'Every P6 fixture must declare a string fixturePath')
  if (new Set(fixturePaths).size !== fixturePaths.length)
    fail('P6_FIXTURE_SET_DRIFT', 'P6 fixture paths must be unique')
  const validPrefix = '.ai/governance/ui/fixtures/source-valid/'
  const invalidPrefix = '.ai/governance/ui/fixtures/source-invalid/'
  if (
    fixturePaths.filter(relPath => relPath.startsWith(validPrefix)).length !== 82 ||
    fixturePaths.filter(relPath => relPath.startsWith(invalidPrefix)).length !== 80 ||
    fixturePaths.some(
      relPath => !relPath.startsWith(validPrefix) && !relPath.startsWith(invalidPrefix)
    )
  )
    fail('P6_FIXTURE_SET_DRIFT', 'P6 fixture paths must remain in the exact 82/80 families')
  const declaredFixturePaths = [...fixturePaths].sort()
  const actualFixturePaths = [
    ...p6FilesUnder(root, '.ai/governance/ui/fixtures/source-valid'),
    ...p6FilesUnder(root, '.ai/governance/ui/fixtures/source-invalid'),
  ].sort()
  if (JSON.stringify(actualFixturePaths) !== JSON.stringify(declaredFixturePaths))
    fail('P6_FIXTURE_SET_DRIFT', 'Fixture files do not exactly match source-cases.json', {
      missing: declaredFixturePaths.filter(relPath => !actualFixturePaths.includes(relPath)),
      unexpected: actualFixturePaths.filter(relPath => !declaredFixturePaths.includes(relPath)),
    })
  const invalidFixtureTypes = declaredFixturePaths
    .filter(relPath => {
      const stat = fs.lstatSync(path.join(root, relPath))
      return stat.isSymbolicLink() || !stat.isFile()
    })
    .sort()
  if (invalidFixtureTypes.length > 0)
    fail('P6_ARTIFACT_TYPE', 'P6 fixtures must be regular files', {
      paths: invalidFixtureTypes,
    })

  const terminalStatePaths = [
    '.ai/governance/policies/ui.json',
    '.ai/governance/ui/fixtures/schema-valid/ui-policy.json',
    '.ai/governance/coverage/project-ui-semantic-coverage.json',
  ]
  if (!baselineExists)
    for (const relPath of terminalStatePaths) {
      const value = readP6Json(root, relPath)
      if (
        value.sourceScannerImplemented !== false ||
        value.applicationSourceEnforcementState !== 'BASELINE_ONLY' ||
        value.pageContractCreated !== false
      )
        fail('P6_PREMATURE_TERMINAL', `${relPath} has premature P6 terminal state`, {
          relPath,
        })
    }
  if (!baselineExists)
    for (const document of documents)
      for (const [marker, expected] of [
        ['SOURCE_SCANNER_IMPLEMENTED', 'no'],
        ['PAGE_CONTRACT_CREATED', 'no'],
        ['LEGACY_SKILLS_RETIRED', 'no'],
        ['LEGACY_RULES_RETIRED', 'no'],
      ]) {
        const values = lifecycleMarkerValues(document.content, marker)
        if (values.length === 0 || values.some(value => value !== expected))
          fail('P6_PREMATURE_TERMINAL', `${document.relPath} has invalid ${marker}`, {
            relPath: document.relPath,
            marker,
            expected,
            actual: values,
          })
      }
  const p6WikiPath = 'wiki/canonical/design/ui-source-enforcement.md'
  const p6Wiki = readText(root, p6WikiPath)

  if (!baselineExists) {
    for (const marker of [
      'P6_4_PRETERMINAL=yes',
      'SOURCE_SCANNER_IMPLEMENTED=no',
      'SOURCE_ENFORCEMENT_ACTIVE=no',
      'CANONICAL_SOURCE_BASELINE_PRESENT=no',
      'P6_5_STARTED=no',
    ])
      if (!p6Wiki.includes(marker))
        fail('P6_PREMATURE_TERMINAL', `${p6WikiPath} is missing ${marker}`, {
          relPath: p6WikiPath,
          marker,
        })

    const p6Paths = [
      ...new Set([...P6_4_FIXED_PATHS, ...P6_SCANNER_MODULE_PATHS, ...fixturePaths]),
    ].sort()
    if (p6Paths.length !== 205)
      fail('P6_PATH_CONTRACT_DRIFT', 'P6.4 path authority must contain exactly 205 paths', {
        count: p6Paths.length,
      })
    return {
      state: 'P6_PRETERMINAL',
      p6Paths,
      fixturePaths: declaredFixturePaths,
      modulePaths: [...P6_SCANNER_MODULE_PATHS],
    }
  }

  const baseline = validateP6TerminalBaseline(root, declaredFixturePaths)
  for (const relPath of terminalStatePaths) {
    const value = readP6Json(root, relPath)
    if (
      value.sourceScannerImplemented !== true ||
      value.applicationSourceEnforcementState !== 'ACTIVE_RATCHET' ||
      value.pageContractCreated !== false ||
      value.legacySkillsRetired !== false ||
      value.legacyRulesRetired !== false
    )
      fail('P6_TERMINAL_PARTIAL', `${relPath} has partial P6 terminal state`, { relPath })
  }
  const coverage = readP6Json(root, '.ai/governance/coverage/project-ui-semantic-coverage.json')
  const sourceEnforcement = coverage.sourceEnforcement
  if (
    sourceEnforcement?.phase !== 'P6_TERMINAL' ||
    sourceEnforcement?.scannerImplementationPresent !== true ||
    sourceEnforcement?.canonicalBaselinePresent !== true ||
    sourceEnforcement?.strictNewFingerprintAndCountIncreaseRatchetActive !== true ||
    sourceEnforcement?.ruleCounts?.sourceEnforceable !== 24 ||
    sourceEnforcement?.ruleCounts?.assisted !== 22 ||
    sourceEnforcement?.ruleCounts?.schema !== 8 ||
    sourceEnforcement?.ruleCounts?.humanReviewOnly !== 14 ||
    sourceEnforcement?.scopeCount !== 20 ||
    sourceEnforcement?.governedP5FileCount !== 554 ||
    sourceEnforcement?.acceptedHistoricalFindingCount !== 393 ||
    sourceEnforcement?.acceptedHistoricalFindingsDerivedFromCanonicalBaseline !== true ||
    sourceEnforcement?.realExceptionCount !== 0 ||
    sourceEnforcement?.pageContractCreated !== false ||
    sourceEnforcement?.legacySkillsRetained !== true ||
    sourceEnforcement?.legacyRulesRetained !== true
  )
    fail('P6_TERMINAL_PARTIAL', 'Semantic coverage has partial P6 terminal authority')
  for (const document of documents)
    for (const [marker, expected] of P6_TERMINAL_MARKER_EXPECTATIONS) {
      const values = lifecycleMarkerValues(document.content, marker)
      if (values.length === 0 || values.some(value => value !== expected))
        fail('P6_TERMINAL_PARTIAL', `${document.relPath} has invalid ${marker}`, {
          relPath: document.relPath,
          marker,
          expected,
          actual: values,
        })
    }
  for (const marker of [
    'P6_5_BASELINE_RATCHET_ACTIVATION=yes',
    'SOURCE_SCANNER_IMPLEMENTED=yes',
    'SOURCE_ENFORCEMENT_ACTIVE=yes',
    'CANONICAL_SOURCE_BASELINE_PRESENT=yes',
    'STRICT_SOURCE_RATCHET_ACTIVE=yes',
    'PAGE_CONTRACT_CREATED=no',
    'LEGACY_SKILLS_RETIRED=no',
    'LEGACY_RULES_RETIRED=no',
    'P6 implementation and local commit are completed by P6.6',
    'P6.7 performs external push, CI, deployment, and remote-authority acceptance',
    'Remote acceptance is operational evidence and is not encoded as a repository lifecycle marker',
  ])
    if (!p6Wiki.includes(marker))
      fail('P6_TERMINAL_PARTIAL', `${p6WikiPath} is missing ${marker}`, {
        relPath: p6WikiPath,
        marker,
      })
  for (const marker of ['P6_6_PENDING=yes', 'P6_7_REMOTE_ACCEPTANCE_PENDING=yes'])
    if (p6Wiki.includes(marker))
      fail('P6_TERMINAL_PARTIAL', `${p6WikiPath} retains retired ${marker}`, {
        relPath: p6WikiPath,
        marker,
      })
  if (/\bP6_COMPLETE=yes\b/u.test(p6Wiki))
    fail('P6_PREMATURE_COMPLETION', `${p6WikiPath} must not claim P6 completion`)

  const p6Paths = [
    ...new Set([
      ...P6_4_FIXED_PATHS,
      ...P6_SCANNER_MODULE_PATHS,
      ...fixturePaths,
      P6_BASELINE_PATH,
    ]),
  ].sort()
  if (p6Paths.length !== 206)
    fail('P6_PATH_CONTRACT_DRIFT', 'P6 terminal path authority must contain exactly 206 paths', {
      count: p6Paths.length,
    })
  return {
    state: 'P6_TERMINAL',
    p6Paths,
    fixturePaths: declaredFixturePaths,
    modulePaths: [...P6_SCANNER_MODULE_PATHS],
    baselineFindingCount: baseline.declaredFindingCount,
  }
}

const validatePolicyLifecycleState = (root, terminal, { p6State = 'P5_TERMINAL' } = {}) => {
  const markerMismatches = []
  const p6Terminal = p6State === 'P6_TERMINAL'
  const expected = {
    sourceScannerImplemented: p6Terminal,
    applicationSourceEnforcementState: p6Terminal ? 'ACTIVE_RATCHET' : 'BASELINE_ONLY',
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

const validateTerminalMarkers = (documents, { p6State = 'P5_TERMINAL' } = {}) => {
  const expectations = new Map(P5_TERMINAL_MARKER_EXPECTATIONS)
  if (p6State === 'P6_TERMINAL') {
    for (const [marker, expected] of P6_TERMINAL_MARKER_EXPECTATIONS)
      expectations.set(marker, expected)
  }
  for (const document of documents) {
    for (const [marker, expected] of expectations) {
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
  validatePageContractAbsence(root)
  const p6 = validateP6ArtifactState(root, documents)

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
    validateTerminalMarkers(documents, { p6State: p6.state })
    validatePolicyLifecycleState(root, true, { p6State: p6.state })
    if (p6.state === 'P6_TERMINAL') {
      return {
        complete: true,
        phase: 'p6-terminal',
        lifecycleSources: documents.map(document => document.relPath),
        artifactCount: p6.p6Paths.length,
        p6Paths: p6.p6Paths,
      }
    }
    if (p6.state === 'P6_PRETERMINAL') {
      return {
        complete: true,
        phase: 'p6-pre-terminal',
        lifecycleSources: documents.map(document => document.relPath),
        artifactCount: p6.p6Paths.length,
        p6Paths: p6.p6Paths,
      }
    }
    return {
      complete: true,
      phase: 'p5-terminal',
      lifecycleSources: documents.map(document => document.relPath),
      artifactCount: P5_TERMINAL_AUTHORIZED_PATHS.size,
    }
  }

  validatePreTerminalMarkers(documents)
  validatePolicyLifecycleState(root, false, { p6State: p6.state })
  if (p6.state === 'P6_PRETERMINAL' || p6.state === 'P6_TERMINAL')
    fail('P6_REQUIRES_P5_TERMINAL', 'P6.4 artifacts require terminal P5 lifecycle state')
  const phase = presentP5Artifacts.length === 0 ? 'p4-baseline' : 'p5-pre-terminal'
  return {
    complete: true,
    phase,
    lifecycleSources: documents.map(document => document.relPath),
    artifactCount: phase === 'p4-baseline' ? P4_TERMINAL_AUTHORIZED_PATHS.size : 34,
  }
}

const phaseBoundaryConfig = (phase, { p6Paths = [], finalLocalCommit = false } = {}) => {
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
  if (phase === 'p6-pre-terminal') {
    const allowedPaths = new Set([...P5_TERMINAL_AUTHORIZED_PATHS, ...p6Paths])
    if (p6Paths.length !== 205 || allowedPaths.size !== 249)
      fail('P6_PATH_CONTRACT_DRIFT', 'P6 pre-terminal boundary must contain 249 paths', {
        p6: p6Paths.length,
        union: allowedPaths.size,
      })
    return {
      allowedPaths,
      requireEmptyIndex: true,
      forbidP4_4: false,
      indexErrorCode: 'P6_INDEX_NOT_EMPTY',
      unauthorizedErrorCode: 'P6_UNAUTHORIZED_CHANGED_PATH',
    }
  }
  if (phase === 'p6-terminal') {
    const allowedPaths = new Set(
      finalLocalCommit
        ? [...p6FinalHistoricalBoundaryPaths(p6Paths), '.github/workflows/deploy.yml']
        : [...P5_TERMINAL_AUTHORIZED_PATHS, ...p6Paths]
    )
    const expectedCount = finalLocalCommit ? 252 : 250
    if (p6Paths.length !== 206 || allowedPaths.size !== expectedCount)
      fail('P6_PATH_CONTRACT_DRIFT', `P6 terminal boundary must contain ${expectedCount} paths`, {
        p6: p6Paths.length,
        union: allowedPaths.size,
      })
    return {
      allowedPaths,
      requireEmptyIndex: false,
      forbidP4_4: false,
      indexErrorCode: 'P6_INDEX_NOT_EMPTY',
      unauthorizedErrorCode: 'P6_UNAUTHORIZED_CHANGED_PATH',
    }
  }
  fail('UNKNOWN_LIFECYCLE_PHASE', `Unknown lifecycle phase: ${phase}`)
}

const validatePhaseBoundary = (root, phase, options = {}) =>
  changedPathState(root, phaseBoundaryConfig(phase, options))

const phaseAwareStructuralValidation = ({ root = ROOT } = {}) => {
  const lifecycle = inspectPhaseAwareLifecycle(root)
  const p6Delivery =
    lifecycle.phase === 'p6-terminal'
      ? validateP6TerminalRepositorySnapshot(
          lifecycle.p6Paths,
          inspectP6DeliveryRepositoryState(root)
        )
      : null
  const boundaryConfig = phaseBoundaryConfig(lifecycle.phase, {
    p6Paths: lifecycle.p6Paths ?? [],
    finalLocalCommit: lifecycle.phase === 'p6-terminal',
  })
  const report = structuralValidation({
    root,
    mode: lifecycle.phase,
    ...boundaryConfig,
  })
  return { ...report, mode: 'default', lifecycle, p6Delivery }
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
