#!/usr/bin/env node

import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { spawnSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'

import {
  RoutingContractError,
  canonicalJson,
  normalizePath,
  routeTask,
  validateRoutingManifest,
  validateRoutingScopes,
} from '../../.ai/skills/codex/task-orchestrator/scripts/skill_router.mjs'
import {
  SkillLockError,
  PROJECT_UI_HASH_INVENTORY,
  generateSkillsLock,
  stringifySkillsLock,
  validateSkillRoutingTargets,
} from '../skill-lock-utils.mjs'
import {
  SkillSyncError,
  resolveManagedTargets,
  syncSkills,
  validateSkillsLockForSync,
} from '../skill-sync-engine.mjs'
import { RuleIndexError, buildRuleIndex, renderRuleIndex } from '../generate-rule-index.mjs'
import {
  compareOutputs,
  loadManifest as loadAdapterManifest,
  renderOutputs as renderAdapterOutputs,
} from '../generate-ai-protocol-adapters.mjs'

const ROOT = process.cwd()
export const VALIDATION_SCHEMA_VERSION = 'ccd-project-ui-routing-validation/v1'
const BASELINE = 'efcfacd4536283d6b2b9bbe479aa4f7a9307eaab'
const FILES = Object.freeze({
  manifest: '.ai/manifests/skill-routing.json',
  scopes: '.ai/manifests/routing-scopes.json',
  routingFixtures: '.ai/governance/routing/fixtures/routing-cases.json',
  syncFixtures: '.ai/governance/routing/fixtures/sync-cases.json',
  manifestSchema: '.ai/governance/routing/skill-routing.schema.json',
  scopesSchema: '.ai/governance/routing/routing-scopes.schema.json',
  lock: '.ai/manifests/skills-lock.json',
  ruleIndex: '.ai/manifests/rule-index.json',
  nodeRouter: '.ai/skills/codex/task-orchestrator/scripts/skill_router.mjs',
  pythonRouter: '.ai/skills/codex/task-orchestrator/scripts/skill_router.py',
})
const P4_BASELINE_PATHS = Object.freeze([])
const P5_4_PATHS = Object.freeze(
  [
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
  ].sort()
)
const P5_5_PATHS = Object.freeze(
  [
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
    '.ai/manifests/skills-lock.json',
    'wiki/canonical/design/project-ui-routing.md',
  ].sort()
)
const P5_TERMINAL_PATHS = Object.freeze([...new Set([...P5_4_PATHS, ...P5_5_PATHS])].sort())
const P5_5_ONLY_PATHS = Object.freeze(P5_5_PATHS.filter(relPath => !P5_4_PATHS.includes(relPath)))
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
const P6_CORRECTION_HEAD_EVENT_FIX_SUBJECT =
  'fix(governance): 兼容 P6 修正推送 head 事件'
const P6_CORRECTION_PATHS = Object.freeze([
  'scripts/governance/cold-start-validate.mjs',
  'scripts/governance/project-ui-routing-validate.mjs',
])
const P6_CORRECTION_PATH_SET_SHA256 =
  '653ea74eea3ed65e72a197e3b30c4ae37341432fa0cdc6d6d9efb436825bd83b'
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
const PATH_CONTRACTS = Object.freeze({
  'p4-baseline': Object.freeze({
    mandatoryPaths: P4_BASELINE_PATHS,
    allowedPaths: P4_BASELINE_PATHS,
  }),
  'p5-pre-terminal': Object.freeze({
    mandatoryPaths: P5_4_PATHS,
    allowedPaths: P5_4_PATHS,
  }),
  'p5-terminal': Object.freeze({
    mandatoryPaths: P5_TERMINAL_PATHS,
    allowedPaths: P5_TERMINAL_PATHS,
  }),
})
const PAGE_CONTRACT_PATHS = Object.freeze([
  '.ai/governance/policies/page-contract.json',
  '.ai/governance/ui/page-contract.json',
  '.ai/governance/ui/schemas/page-contract.schema.json',
])
const COMMON_PROTECTED_PATHS = Object.freeze([
  'wiki/generated/governance-report.md',
  '.ai/generated/governance-report.json',
  'scripts/ai-sync.mjs',
  '.ai/protocol/version.json',
  '.ai/rules',
  '.github',
  'apps',
  'packages',
  'pnpm-lock.yaml',
])
const LIFECYCLE_SOURCES = [
  '.ai/skills/project-ui/SKILL.md',
  '.ai/skills/project-ui/references/platform-invariants.md',
  '.ai/skills/project-ui/references/validation.md',
  'wiki/canonical/design/machine-ui-policy.md',
  'wiki/canonical/design/project-ui-skill.md',
]
const P4_MARKERS = [
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
const P5_TERMINAL = Object.freeze({
  P5_STARTED: 'yes',
  P5_COMPLETE: 'yes',
  PROJECT_UI_DISCOVERED: 'yes',
  PROJECT_UI_ROUTED: 'yes',
  PROJECT_UI_SYNCHRONIZED: 'yes',
  PROJECT_UI_ADAPTER_ACTIVATED: 'yes',
  PROJECT_UI_LOCKED: 'yes',
  PROJECT_UI_CODEX_SYNC_CONTRACT_COMPLETE: 'yes',
  PROJECT_UI_CLAUDE_SYNC_CONTRACT_COMPLETE: 'yes',
  SKILL_ROUTING_MANIFEST_CURRENT: 'yes',
  ROUTING_SCOPE_REGISTRY_COMPLETE: 'yes',
  SKILLS_LOCK_CURRENT: 'yes',
  RULE_INDEX_CURRENT: 'yes',
  NODE_PYTHON_ROUTER_PARITY: 'yes',
  GENERIC_UI_ROUTES_TO_PROJECT_UI: 'yes',
  MOTION_ROUTING_CONDITIONAL: 'yes',
  NON_UI_ROUTING_PRESERVED: 'yes',
  ADAPTER_PROJECT_UI_MAPPING_COMPLETE: 'yes',
  CODEX_ADAPTER_PROJECT_UI_ACTIVE: 'yes',
  CLAUDE_ADAPTER_PROJECT_UI_ACTIVE: 'yes',
  SOURCE_SCANNER_IMPLEMENTED: 'no',
  PAGE_CONTRACT_CREATED: 'no',
  LEGACY_SKILLS_RETIRED: 'no',
  LEGACY_RULES_RETIRED: 'no',
})
const P6_TERMINAL = Object.freeze({
  ...P5_TERMINAL,
  SOURCE_SCANNER_IMPLEMENTED: 'yes',
  SOURCE_ENFORCEMENT_ACTIVE: 'yes',
})
const P3_COUNTS = Object.freeze({
  ruleCount: 68,
  clusterCount: 14,
  candidateDispositionCount: 68,
  permanentRuleDispositionCount: 54,
  humanReviewOnlyDispositionCount: 14,
  futurePageContractDeferralCount: 4,
  historicalLineageCount: 16,
  activeP2RequirementCount: 345,
  scopeRegistryCount: 10,
  plannedArtifactPathCount: 12,
  passRuleCaseCount: 68,
  failRuleCaseCount: 68,
  exceptionCount: 0,
})

class ValidationError extends Error {
  constructor(code, message, details = {}) {
    super(message)
    this.name = 'ValidationError'
    this.code = code
    this.details = details
  }
}
const fail = (code, message, details = {}) => {
  throw new ValidationError(code, message, details)
}
const compareStrings = (left, right) => (left === right ? 0 : left < right ? -1 : 1)
const clone = value => structuredClone(value)
const readText = relPath => fs.readFileSync(path.join(ROOT, relPath), 'utf8')
const readJson = relPath => JSON.parse(readText(relPath))
const readJsonAt = (root, relPath) => {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, relPath), 'utf8'))
  } catch (error) {
    fail('P6_ARTIFACT_INVALID_JSON', `P6 artifact is not valid JSON: ${relPath}`, {
      relPath,
      cause: error instanceof Error ? error.message : String(error),
    })
  }
}
const sha256 = value => crypto.createHash('sha256').update(value).digest('hex')
const same = (left, right) => JSON.stringify(left) === JSON.stringify(right)
const sortedUnique = values => [...new Set(values)].sort(compareStrings)
const assertPathContracts = () => {
  const overlap = P5_4_PATHS.filter(relPath => P5_5_PATHS.includes(relPath))
  if (
    P5_4_PATHS.length !== 34 ||
    P5_5_PATHS.length !== 17 ||
    P5_TERMINAL_PATHS.length !== 50 ||
    !same(overlap, ['.ai/manifests/skills-lock.json']) ||
    PATH_CONTRACTS['p5-pre-terminal'].mandatoryPaths !==
      PATH_CONTRACTS['p5-pre-terminal'].allowedPaths
  )
    fail('PATH_CONTRACT_DRIFT', 'Frozen phase-specific path contracts drifted', {
      p5_4: P5_4_PATHS.length,
      p5_5: P5_5_PATHS.length,
      terminal: P5_TERMINAL_PATHS.length,
      overlap,
    })
}
const p6BoundaryPaths = (p6Paths, { terminal = false } = {}) => {
  const normalized = sortedUnique(p6Paths)
  const missingFixed = P6_4_FIXED_PATHS.filter(relPath => !normalized.includes(relPath))
  const missingModules = P6_SCANNER_MODULE_PATHS.filter(relPath => !normalized.includes(relPath))
  const union = sortedUnique([...P5_TERMINAL_PATHS, ...normalized])
  if (
    normalized.length !== (terminal ? 206 : 205) ||
    union.length !== (terminal ? 250 : 249) ||
    missingFixed.length > 0 ||
    missingModules.length > 0
  )
    fail(
      'P6_PATH_CONTRACT_DRIFT',
      `P6 ${terminal ? 'terminal' : 'pre-terminal'} path authority drifted`,
      {
        p6: normalized.length,
        union: union.length,
        missingFixed,
        missingModules,
      }
    )
  return union
}
const isP6NamedAlternative = relPath =>
  relPath !== P6_BASELINE_PATH &&
  relPath !== '.ai/governance/ui/schemas/ui-source-baseline.schema.json' &&
  (/source[-_]?scanner/iu.test(relPath) ||
    (relPath.startsWith('.ai/governance/ui/schemas/') &&
      /source.*\.schema\.json$/iu.test(relPath) &&
      !P6_4_FIXED_PATHS.includes(relPath)) ||
    (relPath.startsWith('.ai/governance/ui/') &&
      /source[-_]?baseline/iu.test(path.posix.basename(relPath))))
const isForbiddenAlternative = (relPath, { phase, p6Paths = [] } = {}) => {
  if (PAGE_CONTRACT_PATHS.includes(relPath)) return true
  if (!['p6-pre-terminal', 'p6-terminal'].includes(phase))
    return /source[-_]?scanner/iu.test(relPath)
  if (!isP6NamedAlternative(relPath)) return false
  return !p6Paths.includes(relPath)
}
const validatePathContract = ({ phase, actualPaths, p6Paths = [], finalLocalCommit = false }) => {
  assertPathContracts()
  const contract = ['p6-pre-terminal', 'p6-terminal'].includes(phase)
    ? Object.freeze({
        mandatoryPaths:
          phase === 'p6-terminal' && finalLocalCommit
            ? p6FinalHistoricalBoundaryPaths(p6Paths)
            : p6BoundaryPaths(p6Paths, { terminal: phase === 'p6-terminal' }),
        allowedPaths:
          phase === 'p6-terminal' && finalLocalCommit
            ? p6FinalHistoricalBoundaryPaths(p6Paths)
            : p6BoundaryPaths(p6Paths, { terminal: phase === 'p6-terminal' }),
      })
    : PATH_CONTRACTS[phase]
  if (!contract) fail('PATH_CONTRACT_PHASE', `Unsupported changed-path phase: ${phase}`)
  const actual = sortedUnique(actualPaths)
  const p6Alternatives = ['p6-pre-terminal', 'p6-terminal'].includes(phase)
    ? actual.filter(
        relPath =>
          isP6NamedAlternative(relPath) &&
          !relPath.startsWith('.ai/governance/ui/source-scanner/') &&
          !p6Paths.includes(relPath)
      )
    : []
  if (p6Alternatives.length)
    fail('P6_ALTERNATIVE_SCANNER_PATH', 'Alternative P6 scanner paths are present', {
      paths: p6Alternatives,
    })
  const unexpectedScannerModules = ['p6-pre-terminal', 'p6-terminal'].includes(phase)
    ? actual.filter(
        relPath =>
          relPath.startsWith('.ai/governance/ui/source-scanner/') && !p6Paths.includes(relPath)
      )
    : []
  if (unexpectedScannerModules.length)
    fail('P6_UNEXPECTED_SCANNER_MODULE', 'Unexpected scanner modules are present', {
      paths: unexpectedScannerModules,
    })
  const forbidden = actual.filter(relPath => isForbiddenAlternative(relPath, { phase, p6Paths }))
  if (forbidden.length)
    fail('FORBIDDEN_ALTERNATIVE_PRESENT', 'Forbidden alternative paths are present', {
      forbidden,
    })
  const missing = contract.mandatoryPaths.filter(relPath => !actual.includes(relPath))
  if (missing.length)
    fail(
      ['p6-pre-terminal', 'p6-terminal'].includes(phase)
        ? 'P6_PATH_MISSING'
        : 'MANDATORY_PATH_MISSING',
      `Mandatory ${phase} paths are missing`,
      { missing }
    )
  const unexpected = actual.filter(relPath => !contract.allowedPaths.includes(relPath))
  if (unexpected.length)
    fail(
      ['p6-pre-terminal', 'p6-terminal'].includes(phase)
        ? 'P6_UNAUTHORIZED_CHANGED_PATH'
        : 'UNAUTHORIZED_CHANGED_PATH',
      `Changed paths exceed the ${phase} contract`,
      { unexpected }
    )
  return {
    phase,
    actualCount: actual.length,
    mandatoryCount: contract.mandatoryPaths.length,
    allowedCount: contract.allowedPaths.length,
    allowedPaths: [...contract.allowedPaths],
  }
}
const exactKeys = (value, expected, code, label) => {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    fail(code, `${label} must be an object`)
  const actual = Object.keys(value).sort(compareStrings)
  const wanted = [...expected].sort(compareStrings)
  if (!same(actual, wanted)) fail(code, `${label} fields differ`, { actual, expected: wanted })
}
const run = (
  command,
  args,
  { cwd = ROOT, allowFailure = false, input = undefined, encoding = 'utf8' } = {}
) => {
  const result = spawnSync(command, args, { cwd, encoding, input, stdio: 'pipe' })
  if (result.error || (!allowFailure && result.status !== 0)) {
    fail('COMMAND_FAILED', `${command} ${args.join(' ')} failed`, {
      status: result.status,
      stderr: typeof result.stderr === 'string' ? result.stderr.trim() : '',
    })
  }
  return result
}
const gitPaths = (args, { cwd = ROOT } = {}) =>
  run('git', [...args, '-z'], { cwd })
    .stdout.split('\0')
    .filter(Boolean)
    .sort(compareStrings)
const repositoryChangeState = ({ root = ROOT } = {}) => {
  const staged = gitPaths(['diff', '--cached', '--name-only'], { cwd: root })
  const unstaged = gitPaths(['diff', '--name-only'], { cwd: root })
  const untracked = gitPaths(['ls-files', '--others', '--exclude-standard'], { cwd: root })
  const paths = sortedUnique([...staged, ...unstaged, ...untracked])
  return { dirty: paths.length > 0, paths, staged, unstaged, untracked }
}
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
    !same(additional, [P6_FINAL_LOCAL_COMMIT_PATH])
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
  const historicalPaths = p6BoundaryPaths(p6Paths, { terminal: true })
  const paths = sortedUnique([...historicalPaths, P6_FINAL_LOCAL_COMMIT_PATH])
  const pathSetSha256 = sha256(Buffer.from(`${paths.join('\n')}\n`, 'utf8'))
  const additional = paths.filter(relPath => !historicalPaths.includes(relPath))
  if (
    historicalPaths.length !== 250 ||
    paths.length !== 251 ||
    pathSetSha256 !== P6_FINAL_HISTORICAL_PATH_SET_SHA256 ||
    !same(additional, [P6_FINAL_LOCAL_COMMIT_PATH])
  )
    fail('P6_PATH_CONTRACT_DRIFT', 'P6.6 final historical path authority drifted', {
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
    !same(normalized, P6_CORRECTION_PATHS)
  )
    fail(code, 'P6.7 correction must contain exactly the two validator paths', {
      paths: normalized,
      pathSetSha256,
    })
  return normalized
}
const p6PushCommitPaths = commit => {
  if (!commit || typeof commit !== 'object' || Array.isArray(commit))
    fail('P6_CORRECTION_EVENT_INVALID', 'GitHub push commit entry is malformed')
  const groups = ['added', 'modified', 'removed'].map(key => {
    if (!Array.isArray(commit[key]) || commit[key].some(item => typeof item !== 'string'))
      fail('P6_CORRECTION_EVENT_INVALID', `GitHub push commit ${key} paths are malformed`)
    return commit[key]
  })
  const flattened = groups.flat()
  if (new Set(flattened).size !== flattened.length)
    fail('P6_CORRECTION_EVENT_INVALID', 'GitHub push commit paths contain duplicates')
  if (groups[2].length > 0)
    fail('P6_DELIVERY_DELETION', 'P6.7 correction push forbids deleted paths', {
      deleted: groups[2],
    })
  return assertP6CorrectionPaths(flattened)
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
  if (!after && !head)
    fail('P6_CORRECTION_EVENT_INVALID', 'GitHub push head identity is missing')
  if (after && head && after !== head)
    fail('P6_CORRECTION_EVENT_INVALID', 'GitHub push head identity is conflicting')
  return after ?? head
}
const validateP6CorrectionPushEvent = (state, { before = P6_PRIMARY_COMMIT } = {}) => {
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
    event.deleted !== false ||
    event.size !== 1 ||
    event.distinct_size !== 1
  )
    fail('P6_CORRECTION_EVENT_INVALID', 'GitHub push event authority drifted')
  if (event.forced !== false)
    fail('P6_CORRECTION_FORCED_PUSH', 'P6.7 correction must be a non-forced push')
  if (!Array.isArray(event.commits) || event.commits.length !== 1)
    fail('P6_CORRECTION_EVENT_INVALID', 'GitHub push event must contain one correction commit')

  const [commit] = event.commits
  if (commit.id !== state.head || commit.distinct !== true)
    fail('P6_CORRECTION_EVENT_INVALID', 'GitHub push commit identity drifted')
  p6PushCommitPaths(commit)
  if (!event.head_commit || event.head_commit.id !== state.head)
    fail('P6_CORRECTION_EVENT_INVALID', 'GitHub push head commit identity drifted')
  p6PushCommitPaths(event.head_commit)
  return { event: 'push', ref: P6_MAIN_REF, forced: false, pathCount: 2 }
}
const validateP6RemoteCorrectionSnapshot = (p6Paths, state) => {
  assertP6RepositoryIdentity(state)
  const staged = sortedUnique(state.staged ?? [])
  const unstaged = sortedUnique(state.unstaged ?? [])
  const untracked = sortedUnique(state.untracked ?? [])
  const deleted = sortedUnique(state.deleted ?? [])
  const localPaths = sortedUnique([...staged, ...unstaged, ...untracked])
  const dirty = localPaths.length > 0
  if (deleted.length)
    fail('P6_DELIVERY_DELETION', 'P6.7 correction forbids deleted paths', { deleted })

  if (dirty) {
    const baseIsPrimary =
      state.head === P6_PRIMARY_COMMIT && state.originMain === P6_PRIMARY_COMMIT
    const baseIsCorrection =
      state.head === P6_CORRECTION_COMMIT && state.originMain === P6_CORRECTION_COMMIT
    if (
      state.branch !== 'main' ||
      state.shallow !== false ||
      (!baseIsPrimary && !baseIsCorrection) ||
      state.ahead !== 0 ||
      state.behind !== 0
    )
      fail('P6_CORRECTION_DIRTY_BASE_DRIFT', 'Dirty P6.7 correction must remain on remote P6')
    assertP6CorrectionPaths(localPaths)
    if (!staged.length)
      return {
        mode: 'unstaged-remote-correction-workspace',
        pathCount: 2,
        pathSetSha256: P6_CORRECTION_PATH_SET_SHA256,
      }
    if (!same(staged, P6_CORRECTION_PATHS) || unstaged.length || untracked.length)
      fail('P6_CORRECTION_INDEX_DRIFT', 'P6.7 index must contain both validators only', {
        staged,
        unstaged,
        untracked,
      })
    return {
      mode: 'fully-staged-remote-correction-candidate',
      pathCount: 2,
      pathSetSha256: P6_CORRECTION_PATH_SET_SHA256,
    }
  }

  const onMain =
    state.branch === 'main' ||
    (state.github?.actions === true && state.github.ref === P6_MAIN_REF)
  if (!onMain) fail('P6_CORRECTION_COMMIT_TOPOLOGY', 'P6.7 terminal state must be on main')
  const headParents = state.headParents ?? (state.headParent ? [state.headParent] : [])

  if (state.head === P6_PRIMARY_COMMIT) {
    if (
      state.shallow !== false ||
      state.originMain !== P6_PRIMARY_COMMIT ||
      state.ahead !== 0 ||
      state.behind !== 0 ||
      !same(headParents, [P6_BASELINE_COMMIT])
    )
      fail('P6_CORRECTION_COMMIT_TOPOLOGY', 'P6 primary remote terminal topology drifted')
    const committedPaths = sortedUnique(state.committedPaths ?? [])
    if (!same(committedPaths, p6FinalLocalCommitPaths(p6Paths)))
      fail('P6_DELIVERY_COMMIT_PATH_DRIFT', 'P6 primary commit path authority drifted')
    return { mode: 'clean-pushed-primary-terminal', pathCount: 221 }
  }

  const correctionParent = (() => {
    if (same(headParents, [P6_PRIMARY_COMMIT]) && state.headSubject === P6_CORRECTION_COMMIT_SUBJECT)
      return P6_PRIMARY_COMMIT
    if (
      same(headParents, [P6_CORRECTION_COMMIT]) &&
      state.headSubject === P6_CORRECTION_HEAD_EVENT_FIX_SUBJECT
    )
      return P6_CORRECTION_COMMIT
    fail('P6_CORRECTION_COMMIT_TOPOLOGY', 'P6.7 correction parent or subject drifted')
  })()

  if (
    state.shallow === false &&
    state.originMain === correctionParent &&
    state.ahead === 1 &&
    state.behind === 0
  ) {
    assertP6CorrectionPaths(state.committedPaths ?? [], 'P6_CORRECTION_COMMIT_PATH_DRIFT')
    return { mode: 'clean-local-remote-correction-commit', pathCount: 2 }
  }

  if (state.originMain !== state.head || state.ahead !== 0 || state.behind !== 0)
    fail('P6_CORRECTION_COMMIT_TOPOLOGY', 'P6.7 pushed correction topology drifted')
  if (state.shallow === true) {
    validateP6CorrectionPushEvent(state, { before: correctionParent })
    return { mode: 'clean-pushed-remote-correction-shallow-event', pathCount: 2 }
  }
  assertP6CorrectionPaths(state.committedPaths ?? [], 'P6_CORRECTION_COMMIT_PATH_DRIFT')
  if (state.github?.actions === true && state.github.eventName === 'push')
    validateP6CorrectionPushEvent(state, { before: correctionParent })
  return { mode: 'clean-pushed-remote-correction-full-history', pathCount: 2 }
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
  if (deleted.length) fail('P6_DELIVERY_DELETION', 'P6 delivery forbids deleted paths', { deleted })

  if (dirty) {
    if (state.head !== P6_BASELINE_COMMIT || state.ahead !== 0 || state.behind !== 0)
      fail('P6_DELIVERY_DIRTY_BASE_DRIFT', 'Dirty P6 delivery must remain exactly on origin/main')
    if (!same(localPaths, expectedPaths))
      fail(
        'P6_DELIVERY_PATH_SET_DRIFT',
        `Dirty P6 delivery path set is not the frozen ${expectedCount} paths`,
        {
          missing: expectedPaths.filter(relPath => !localPaths.includes(relPath)),
          unexpected: localPaths.filter(relPath => !expectedPaths.includes(relPath)),
        }
      )
    if (!staged.length)
      return {
        mode: 'unstaged-terminal-workspace',
        pathCount: expectedCount,
        pathSetSha256: expectedPathSetSha256,
      }
    if (!same(staged, expectedPaths) || unstaged.length || untracked.length)
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
  if (!same(committedPaths, expectedPaths))
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
const inspectP6DeliveryRepositoryState = ({
  root = ROOT,
  localState = repositoryChangeState({ root }),
} = {}) => {
  const deleted = sortedUnique([
    ...gitPaths(['diff', '--name-only', '--diff-filter=D'], { cwd: root }),
    ...gitPaths(['diff', '--cached', '--name-only', '--diff-filter=D'], { cwd: root }),
  ])
  const head = run('git', ['rev-parse', 'HEAD'], { cwd: root }).stdout.trim()
  const headParents = run('git', ['cat-file', '-p', 'HEAD'], { cwd: root })
    .stdout.split('\n')
    .filter(line => line.startsWith('parent '))
    .map(line => line.slice('parent '.length))
  const [behind, ahead] = run(
    'git',
    ['rev-list', '--left-right', '--count', 'origin/main...HEAD'],
    {
      cwd: root,
    }
  )
    .stdout.trim()
    .split(/\s+/u)
    .map(Number)
  return {
    branch: run('git', ['branch', '--show-current'], { cwd: root }).stdout.trim(),
    originUrl: run('git', ['remote', 'get-url', 'origin'], { cwd: root }).stdout.trim(),
    shallow:
      run('git', ['rev-parse', '--is-shallow-repository'], { cwd: root }).stdout.trim() === 'true',
    originMain: run('git', ['rev-parse', 'origin/main'], { cwd: root }).stdout.trim(),
    head,
    headParent: headParents.length === 1 ? headParents[0] : null,
    headParents,
    headSubject: run('git', ['log', '-1', '--format=%s', 'HEAD'], { cwd: root }).stdout.trim(),
    ahead,
    behind,
    github: inspectP6GitHubContext(),
    staged: localState.staged,
    unstaged: localState.unstaged,
    untracked: localState.untracked,
    deleted,
    committedPaths:
      localState.dirty ||
      run('git', ['rev-parse', '--is-shallow-repository'], { cwd: root }).stdout.trim() === 'true'
      ? []
      : gitPaths(['diff-tree', '--no-commit-id', '--name-only', '-r', 'HEAD^', 'HEAD'], {
          cwd: root,
        }),
  }
}
const resolveHistoricalComparison = ({ root = ROOT, baseline = BASELINE } = {}) => {
  const commitish = `${baseline}^{commit}`
  const objectCheck = run('git', ['cat-file', '-e', commitish], {
    cwd: root,
    allowFailure: true,
  })
  const shallowCheck = run('git', ['rev-parse', '--is-shallow-repository'], {
    cwd: root,
    allowFailure: true,
  })
  if (shallowCheck.status !== 0)
    fail('BASELINE_OBJECT_RESOLUTION_FAILED', 'Unable to inspect repository history depth', {
      baseline,
      status: shallowCheck.status,
      stderr: shallowCheck.stderr.trim(),
    })
  const shallow = shallowCheck.stdout.trim() === 'true'
  const evidence = {
    baseline,
    command: `git cat-file -e ${commitish}`,
    status: objectCheck.status,
    stderr: objectCheck.stderr.trim(),
    shallow,
  }
  if (objectCheck.status === 0)
    return { ...evidence, available: true, code: 'BASELINE_OBJECT_AVAILABLE' }
  if (shallow)
    return {
      ...evidence,
      available: false,
      code: 'BASELINE_OBJECT_UNAVAILABLE_IN_SHALLOW_CHECKOUT',
    }
  fail(
    'BASELINE_OBJECT_RESOLUTION_FAILED',
    'Historical baseline object is unavailable in a non-shallow repository',
    evidence
  )
}
const repositorySnapshot = () => {
  const untracked = gitPaths(['ls-files', '--others', '--exclude-standard'])
  return sha256(
    Buffer.concat([
      run('git', ['status', '--short', '-z'], { encoding: null }).stdout,
      run('git', ['diff', '--binary'], { encoding: null }).stdout,
      run('git', ['diff', '--cached', '--binary'], { encoding: null }).stdout,
      Buffer.from(
        JSON.stringify(
          untracked.map(relPath => [relPath, sha256(fs.readFileSync(path.join(ROOT, relPath)))])
        )
      ),
    ])
  )
}
const filesystemSnapshot = absolute => {
  const stat = fs.lstatSync(absolute, { throwIfNoEntry: false })
  if (!stat) return { digest: null, type: 'missing' }
  const hash = crypto.createHash('sha256')
  const visit = (current, relative = '') => {
    const currentStat = fs.lstatSync(current)
    if (currentStat.isSymbolicLink()) {
      hash.update(`L\0${relative}\0${fs.readlinkSync(current)}\0`)
      return
    }
    if (currentStat.isFile()) {
      hash.update(`F\0${relative}\0${currentStat.mode & 0o777}\0`)
      hash.update(fs.readFileSync(current))
      hash.update('\0')
      return
    }
    hash.update(`D\0${relative}\0`)
    for (const entry of fs.readdirSync(current).sort(compareStrings))
      visit(path.join(current, entry), relative ? path.posix.join(relative, entry) : entry)
  }
  visit(absolute)
  return {
    digest: hash.digest('hex'),
    type: stat.isSymbolicLink()
      ? 'symlink'
      : stat.isDirectory()
        ? 'directory'
        : stat.isFile()
          ? 'file'
          : 'other',
  }
}
const captureInvariantSnapshots = () => ({
  repository: { digest: repositorySnapshot(), type: 'repository' },
  realCodexSkills: filesystemSnapshot(path.join(os.homedir(), '.codex', 'skills')),
  realClaudePersonal: filesystemSnapshot(
    path.join(os.homedir(), '.claude', 'skills', 'project-ui')
  ),
  realClaudeProject: filesystemSnapshot(path.join(ROOT, '.claude', 'skills', 'project-ui')),
})
const pairSnapshots = (before, after) =>
  Object.fromEntries(
    ['repository', 'realCodexSkills', 'realClaudePersonal', 'realClaudeProject'].map(key => [
      key,
      {
        beforeDigest: before[key].digest,
        afterDigest: after[key].digest,
        beforeType: before[key].type,
        afterType: after[key].type,
      },
    ])
  )
const createOwnedTemporaryRoot = () => {
  for (let attempt = 0; attempt < 16; attempt += 1) {
    const root = path.join(
      os.tmpdir(),
      `ccd-p5-validation-${crypto.randomBytes(8).toString('hex')}`
    )
    try {
      fs.mkdirSync(root, { mode: 0o700 })
      return root
    } catch (error) {
      if (error?.code !== 'EEXIST') throw error
    }
  }
  fail('TEMP_ROOT_CREATE_FAILED', 'Unable to allocate the owned validation temporary root')
}

const resolveSchemaRef = (schema, reference) => {
  if (!reference.startsWith('#/'))
    fail('JSON_SCHEMA_REF', `Unsupported schema reference: ${reference}`)
  return reference
    .slice(2)
    .split('/')
    .reduce((value, segment) => value[segment.replaceAll('~1', '/').replaceAll('~0', '~')], schema)
}
const validateSchemaValue = (rootSchema, definition, value, location = '$') => {
  if (definition.$ref)
    return validateSchemaValue(
      rootSchema,
      resolveSchemaRef(rootSchema, definition.$ref),
      value,
      location
    )
  if (Object.hasOwn(definition, 'const') && !same(value, definition.const))
    fail('JSON_SCHEMA_CONST', `${location} violates const`)
  if (definition.enum && !definition.enum.some(candidate => same(candidate, value)))
    fail('JSON_SCHEMA_ENUM', `${location} violates enum`)
  if (definition.type) {
    const accepted = Array.isArray(definition.type) ? definition.type : [definition.type]
    const actual =
      value === null
        ? 'null'
        : Array.isArray(value)
          ? 'array'
          : Number.isInteger(value)
            ? 'integer'
            : typeof value
    if (!accepted.includes(actual) && !(actual === 'integer' && accepted.includes('number')))
      fail('JSON_SCHEMA_TYPE', `${location} has type ${actual}`)
  }
  if (typeof value === 'string') {
    if (definition.minLength !== undefined && value.length < definition.minLength)
      fail('JSON_SCHEMA_MIN_LENGTH', `${location} is too short`)
    if (definition.pattern && !new RegExp(definition.pattern, 'u').test(value))
      fail('JSON_SCHEMA_PATTERN', `${location} violates pattern`)
  }
  if (typeof value === 'number') {
    if (definition.minimum !== undefined && value < definition.minimum)
      fail('JSON_SCHEMA_MINIMUM', `${location} is below minimum`)
    if (definition.maximum !== undefined && value > definition.maximum)
      fail('JSON_SCHEMA_MAXIMUM', `${location} exceeds maximum`)
  }
  if (Array.isArray(value)) {
    if (definition.minItems !== undefined && value.length < definition.minItems)
      fail('JSON_SCHEMA_MIN_ITEMS', `${location} has too few items`)
    if (
      definition.uniqueItems &&
      new Set(value.map(item => JSON.stringify(item))).size !== value.length
    )
      fail('JSON_SCHEMA_UNIQUE', `${location} has duplicate items`)
    if (definition.items)
      value.forEach((item, index) =>
        validateSchemaValue(rootSchema, definition.items, item, `${location}[${index}]`)
      )
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const required of definition.required ?? [])
      if (!Object.hasOwn(value, required))
        fail('JSON_SCHEMA_REQUIRED', `${location}.${required} is required`)
    const properties = definition.properties ?? {}
    if (definition.additionalProperties === false) {
      const extra = Object.keys(value).filter(key => !Object.hasOwn(properties, key))
      if (extra.length)
        fail('JSON_SCHEMA_ADDITIONAL_PROPERTY', `${location} has unsupported fields`, { extra })
    }
    for (const [key, child] of Object.entries(properties))
      if (Object.hasOwn(value, key))
        validateSchemaValue(rootSchema, child, value[key], `${location}.${key}`)
  }
}

const EXPECTED_RESULT_FIELDS = [
  'status',
  'primaryRoute',
  'supplementalRoutes',
  'matchedRoutes',
  'primarySkills',
  'supplementalSkills',
  'selectedSkills',
  'prechecks',
  'tokenStrategy',
  'matchReasons',
  'rejectedConflicts',
  'diagnostics',
]
const projectResult = result => ({
  status: result.status,
  primaryRoute: result.primaryRoute?.id ?? null,
  supplementalRoutes: result.supplementalRoutes.map(route => route.id),
  matchedRoutes: result.matchedRoutes.map(route => route.id),
  primarySkills: result.primarySkills,
  supplementalSkills: result.supplementalSkills,
  selectedSkills: result.selectedSkills,
  prechecks: result.prechecks,
  tokenStrategy: result.tokenStrategy,
  matchReasons: result.matchReasons,
  rejectedConflicts: result.rejectedConflicts,
  diagnostics: result.diagnostics,
})

const validateFixtureCorpora = (routingFixtures, syncFixtures) => {
  exactKeys(routingFixtures, ['version', 'cases'], 'ROUTING_FIXTURE_SCHEMA', 'routing fixtures')
  if (routingFixtures.version !== 1 || routingFixtures.cases.length !== 71)
    fail('ROUTING_FIXTURE_COUNT', 'Routing corpus must contain exactly 71 cases')
  const routingIds = new Set()
  for (const fixture of routingFixtures.cases) {
    if (routingIds.has(fixture.id))
      fail('DUPLICATE_FIXTURE_ID', `Duplicate routing fixture: ${fixture.id}`)
    routingIds.add(fixture.id)
    const mutation = fixture.classification === 'mutation'
    exactKeys(
      fixture,
      mutation
        ? ['id', 'classification', 'baseFixtureId', 'mutation', 'expected', 'parityRequired']
        : ['id', 'classification', 'task', 'paths', 'flags', 'expected', 'parityRequired'],
      'ROUTING_FIXTURE_SCHEMA',
      fixture.id
    )
    exactKeys(
      fixture.expected,
      EXPECTED_RESULT_FIELDS,
      'ROUTING_FIXTURE_SCHEMA',
      `${fixture.id}.expected`
    )
    if (fixture.parityRequired !== true)
      fail('ROUTING_FIXTURE_PARITY', `${fixture.id} must require parity`)
    if (!mutation) {
      if (!['positive', 'negative', 'false-positive'].includes(fixture.classification))
        fail('ROUTING_FIXTURE_SCHEMA', `${fixture.id} classification is invalid`)
      exactKeys(fixture.flags, ['allowDualMotion'], 'ROUTING_FIXTURE_SCHEMA', `${fixture.id}.flags`)
      for (const inputPath of fixture.paths) {
        exactKeys(inputPath, ['path', 'state'], 'ROUTING_FIXTURE_SCHEMA', `${fixture.id}.path`)
        if (!['tracked', 'untracked', 'missing'].includes(inputPath.state))
          fail('ROUTING_FIXTURE_SCHEMA', `${fixture.id} path state is invalid`)
      }
    } else {
      exactKeys(
        fixture.mutation,
        [
          'operation',
          'target',
          ...(Object.hasOwn(fixture.mutation, 'selectorId') ? ['selectorId'] : []),
          ...(Object.hasOwn(fixture.mutation, 'value') ? ['value'] : []),
        ],
        'ROUTING_FIXTURE_SCHEMA',
        `${fixture.id}.mutation`
      )
    }
  }
  exactKeys(syncFixtures, ['version', 'cases'], 'SYNC_FIXTURE_SCHEMA', 'sync fixtures')
  if (syncFixtures.version !== 1 || syncFixtures.cases.length !== 47)
    fail('SYNC_FIXTURE_COUNT', 'Sync corpus must contain exactly 47 cases')
  const syncIds = new Set()
  const optional = ['lockMutation', 'sourceMutation', 'fault']
  for (const fixture of syncFixtures.cases) {
    if (syncIds.has(fixture.id))
      fail('DUPLICATE_SYNC_FIXTURE_ID', `Duplicate sync fixture: ${fixture.id}`)
    syncIds.add(fixture.id)
    exactKeys(
      fixture,
      [
        'id',
        'classification',
        'clients',
        'mode',
        'overrides',
        'filesystem',
        ...optional.filter(key => Object.hasOwn(fixture, key)),
        'expected',
      ],
      'SYNC_FIXTURE_SCHEMA',
      fixture.id
    )
    if (
      !['positive', 'negative', 'fault'].includes(fixture.classification) ||
      !['apply', 'check'].includes(fixture.mode)
    )
      fail('SYNC_FIXTURE_SCHEMA', `${fixture.id} has an invalid classification or mode`)
    if (
      !Array.isArray(fixture.clients) ||
      fixture.clients.length === 0 ||
      new Set(fixture.clients).size !== fixture.clients.length ||
      fixture.clients.some(client => !['codex', 'claude'].includes(client))
    )
      fail('SYNC_FIXTURE_SCHEMA', `${fixture.id}.clients is invalid`)
    exactKeys(
      fixture.overrides,
      Object.keys(fixture.overrides),
      'SYNC_FIXTURE_SCHEMA',
      `${fixture.id}.overrides`
    )
    if (
      Object.keys(fixture.overrides).some(
        key => !['codexTargetRoot', 'claudeTargetRoot', 'projectRoot', 'home'].includes(key)
      )
    )
      fail('SYNC_FIXTURE_SCHEMA', `${fixture.id}.overrides contains an unsupported field`)
    for (const entry of fixture.filesystem) {
      if (entry.type === 'file') {
        exactKeys(
          entry,
          ['path', 'type', 'contentBase64', 'mode', 'managed'],
          'SYNC_FIXTURE_SCHEMA',
          `${fixture.id}.filesystem.file`
        )
        if (!['100644', '100755'].includes(entry.mode))
          fail('SYNC_FIXTURE_SCHEMA', `${fixture.id} file mode is invalid`)
        try {
          Buffer.from(entry.contentBase64, 'base64')
        } catch {
          fail('SYNC_FIXTURE_SCHEMA', `${fixture.id} file bytes are invalid`)
        }
      } else if (entry.type === 'directory') {
        exactKeys(
          entry,
          ['path', 'type', 'mode', 'managed'],
          'SYNC_FIXTURE_SCHEMA',
          `${fixture.id}.filesystem.directory`
        )
        if (entry.mode !== '040755')
          fail('SYNC_FIXTURE_SCHEMA', `${fixture.id} directory mode is invalid`)
      } else if (entry.type === 'symlink')
        exactKeys(
          entry,
          ['path', 'type', 'symlinkTarget', 'managed'],
          'SYNC_FIXTURE_SCHEMA',
          `${fixture.id}.filesystem.symlink`
        )
      else fail('SYNC_FIXTURE_SCHEMA', `${fixture.id} filesystem type is invalid`)
      if (
        typeof entry.path !== 'string' ||
        path.posix.isAbsolute(entry.path) ||
        entry.path.split('/').some(segment => segment === '.' || segment === '..') ||
        typeof entry.managed !== 'boolean'
      )
        fail('SYNC_FIXTURE_SCHEMA', `${fixture.id} filesystem path is invalid`)
    }
    if (fixture.fault) {
      exactKeys(
        fixture.fault,
        ['code', 'point', 'client'],
        'SYNC_FIXTURE_SCHEMA',
        `${fixture.id}.fault`
      )
      if (
        !['candidate-before-replacement', 'after-client-replacement'].includes(
          fixture.fault.point
        ) ||
        !fixture.clients.includes(fixture.fault.client)
      )
        fail('SYNC_FIXTURE_SCHEMA', `${fixture.id}.fault is invalid`)
    }
    if (fixture.lockMutation) {
      const expectedFields =
        fixture.lockMutation.operation === 'remove-sync-implementation'
          ? ['operation', 'client', 'skillId']
          : ['operation', 'skillId', 'value']
      exactKeys(
        fixture.lockMutation,
        expectedFields,
        'SYNC_FIXTURE_SCHEMA',
        `${fixture.id}.lockMutation`
      )
      if (
        ![
          'set-sync-target',
          'remove-sync-implementation',
          'set-source-path',
          'set-target-path',
          'set-expected-hash',
        ].includes(fixture.lockMutation.operation)
      )
        fail('SYNC_FIXTURE_SCHEMA', `${fixture.id}.lockMutation operation is invalid`)
    }
    if (fixture.sourceMutation) {
      const fieldByOperation = {
        'write-utf8': ['operation', 'path', 'content'],
        'write-bytes': ['operation', 'path', 'contentBase64'],
        chmod: ['operation', 'path', 'mode'],
        'add-symlink': ['operation', 'path', 'symlinkTarget'],
      }
      const expectedFields = fieldByOperation[fixture.sourceMutation.operation]
      if (!expectedFields)
        fail('SYNC_FIXTURE_SCHEMA', `${fixture.id}.sourceMutation operation is invalid`)
      exactKeys(
        fixture.sourceMutation,
        expectedFields,
        'SYNC_FIXTURE_SCHEMA',
        `${fixture.id}.sourceMutation`
      )
    }
    exactKeys(
      fixture.expected,
      [
        'exitCode',
        'status',
        'changedClients',
        'driftedClients',
        'preservedPaths',
        'diagnosticCodes',
        'rollback',
        'candidateRootsRemaining',
        'backupRootsRemaining',
        'secondRunStatus',
        'personalShadowStatus',
      ],
      'SYNC_FIXTURE_SCHEMA',
      `${fixture.id}.expected`
    )
    if (
      ![0, 1, 2].includes(fixture.expected.exitCode) ||
      !['current', 'updated', 'drift', 'rejected', 'rolled-back'].includes(
        fixture.expected.status
      ) ||
      !['not-applicable', 'not-needed', 'complete'].includes(fixture.expected.rollback) ||
      !['not-run', 'current'].includes(fixture.expected.secondRunStatus) ||
      !['not-observed', 'absent', 'observed-noncanonical'].includes(
        fixture.expected.personalShadowStatus
      )
    )
      fail('SYNC_FIXTURE_SCHEMA', `${fixture.id}.expected enum is invalid`)
  }
}

const applyRoutingMutation = (fixture, manifest, scopes, cases) => {
  const { operation, target, selectorId, value } = fixture.mutation
  let array
  let object
  let key
  if (target === 'skillRouting.routes') {
    array = manifest.routes
    if (operation === 'replace-field' && selectorId === '__all__' && value === 'reverse') {
      manifest.routes = [...manifest.routes].reverse()
      return
    }
  } else if (target.startsWith('skillRouting.routes.')) {
    array = manifest.routes
    object = array.find(item => item.id === selectorId)
    key = target.split('.').at(-1)
  } else if (target === 'routingScopes.scopes') array = scopes.scopes
  else if (target === 'routingScopes.scopes.effectiveGlobs') {
    object = scopes.scopes.find(item => item.id === selectorId)
    key = 'effectiveGlobs'
  } else if (target === 'routingCases.cases') array = cases
  else if (target === 'routingCases.cases.expected.selectedSkills') {
    object = cases.find(item => item.id === selectorId).expected
    key = 'selectedSkills'
  } else fail('UNKNOWN_ROUTING_MUTATION', `Unknown mutation target: ${target}`)
  if (operation === 'duplicate-record') {
    const record = array.find(item => item.id === selectorId)
    array.splice(array.indexOf(record) + 1, 0, clone(record))
  } else if (operation === 'delete-record')
    array.splice(
      array.findIndex(item => item.id === selectorId),
      1
    )
  else if (operation === 'insert-record') array.push(clone(value))
  else if (operation === 'append-array-item') object[key].push(clone(value))
  else if (operation === 'replace-field') {
    if (value === '__DELETE__') delete object[key]
    else object[key] = clone(value)
  } else fail('UNKNOWN_ROUTING_MUTATION', `Unknown mutation operation: ${operation}`)
}

const pythonRoute = (payload, payloadPath) => {
  const source = `
import importlib.util, json, pathlib, sys
with open(sys.argv[1], encoding="utf-8") as payload_file:
    payload=json.load(payload_file)
spec=importlib.util.spec_from_file_location("ccd_router", payload["router"])
module=importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
result=module.route_task(payload["task"], payload["paths"], payload["allowDualMotion"], manifest=payload["manifest"], scope_registry=payload["scopes"], fixture_cases=payload["cases"], skills_lock=payload["lock"], tracked=payload["tracked"], root=pathlib.Path(payload["root"]))
sys.stdout.write(json.dumps(result, ensure_ascii=False, indent=2)+"\\n")
`
  fs.writeFileSync(payloadPath, JSON.stringify(payload), 'utf8')
  try {
    const result = run('python3', ['-c', source, payloadPath])
    return { text: result.stdout, value: JSON.parse(result.stdout) }
  } finally {
    fs.rmSync(payloadPath, { force: true })
  }
}

const runRoutingSuites = ({ manifest, scopes, routingFixtures, lock, temporaryRoot }) => {
  const tracked = gitPaths(['ls-files'])
  const nodeCases = []
  const pythonCases = []
  const parityCases = []
  let pythonInvocation = 0
  const runPythonRoute = payload => {
    pythonInvocation += 1
    return pythonRoute(payload, path.join(temporaryRoot, `python-route-${pythonInvocation}.json`))
  }
  for (const fixture of routingFixtures.cases) {
    const mutatedManifest = clone(manifest)
    const mutatedScopes = clone(scopes)
    const mutatedCases = clone(routingFixtures.cases)
    let base = fixture
    if (fixture.classification === 'mutation') {
      applyRoutingMutation(fixture, mutatedManifest, mutatedScopes, mutatedCases)
      base = mutatedCases.find(candidate => candidate.id === fixture.baseFixtureId)
    }
    const options = {
      manifest: mutatedManifest,
      scopeRegistry: mutatedScopes,
      fixtureCases: mutatedCases,
      skillsLock: lock,
      tracked,
      root: ROOT,
      allowDualMotion: base.flags.allowDualMotion,
    }
    const nodeResult = routeTask(base.task, base.paths, options)
    const nodeProjection = projectResult(nodeResult)
    if (!same(nodeProjection, fixture.expected))
      fail('NODE_ROUTING_FIXTURE_FAILED', `${fixture.id} differs from expected`, {
        actual: nodeProjection,
        expected: fixture.expected,
      })
    const payload = {
      router: path.join(ROOT, FILES.pythonRouter),
      root: ROOT,
      task: base.task,
      paths: base.paths,
      allowDualMotion: base.flags.allowDualMotion,
      manifest: mutatedManifest,
      scopes: mutatedScopes,
      cases: mutatedCases,
      lock,
      tracked,
    }
    const python = runPythonRoute(payload)
    const pythonProjection = projectResult(python.value)
    if (!same(pythonProjection, fixture.expected))
      fail('PYTHON_ROUTING_FIXTURE_FAILED', `${fixture.id} differs from expected`, {
        actual: pythonProjection,
        expected: fixture.expected,
      })
    const nodeText = canonicalJson(nodeResult)
    if (nodeText !== python.text)
      fail('ROUTER_PARITY_DRIFT', `${fixture.id} Node/Python bytes differ`)
    nodeCases.push(fixture.id)
    pythonCases.push(fixture.id)
    parityCases.push({ id: fixture.id, sha256: sha256(nodeText) })
  }
  const unicodeInputs = [
    { task: 'STRASSE layout', paths: [], allowDualMotion: false },
    { task: '设计 界面', paths: [], allowDualMotion: false },
    { task: 'layout 😀', paths: [], allowDualMotion: false },
  ]
  for (const [index, input] of unicodeInputs.entries()) {
    const options = {
      manifest,
      scopeRegistry: scopes,
      fixtureCases: routingFixtures.cases,
      skillsLock: lock,
      tracked,
      root: ROOT,
      allowDualMotion: input.allowDualMotion,
    }
    const nodeResult = routeTask(input.task, input.paths, options)
    const python = runPythonRoute({
      router: path.join(ROOT, FILES.pythonRouter),
      root: ROOT,
      ...input,
      manifest,
      scopes,
      cases: routingFixtures.cases,
      lock,
      tracked,
    })
    if (canonicalJson(nodeResult) !== python.text)
      fail('ROUTER_UNICODE_PARITY_DRIFT', `Unicode parity case ${index + 1} differs`)
  }
  return {
    nodeSuite: { status: 'pass', cases: nodeCases.length, caseIds: nodeCases },
    pythonSuite: { status: 'pass', cases: pythonCases.length, caseIds: pythonCases },
    paritySuite: {
      status: 'pass',
      cases: parityCases.length,
      unicodeCases: unicodeInputs.length,
      records: parityCases,
    },
  }
}

const writeFile = (root, relPath, content, mode = 0o644) => {
  const absolute = path.join(root, relPath)
  fs.mkdirSync(path.dirname(absolute), { recursive: true })
  fs.writeFileSync(absolute, content, { mode })
  fs.chmodSync(absolute, mode)
}
const createSkillFixtureRepo = (temporaryRoot, mutation) => {
  const root = fs.mkdtempSync(path.join(temporaryRoot, 'source-'))
  run('git', ['init', '-q'], { cwd: root })
  fs.mkdirSync(path.join(root, '.ai/manifests'), { recursive: true })
  writeFile(root, '.ai/manifests/skill-routing.json', '{}\n')
  writeFile(root, '.ai/manifests/routing-scopes.json', '{}\n')
  const base = '.ai/skills/project-ui/'
  for (const relPath of PROJECT_UI_HASH_INVENTORY) {
    const content =
      relPath === 'SKILL.md'
        ? '---\nname: project-ui\n---\n'
        : relPath.endsWith('.mjs')
          ? 'export {}\n'
          : `${relPath}\n`
    writeFile(root, `${base}${relPath}`, content)
  }
  const fixtureBase = '.ai/skills/core/fixture-skill/'
  if (mutation) writeFile(root, `${fixtureBase}SKILL.md`, '---\nname: fixture-skill\n---\n')
  if (mutation?.operation === 'write-bytes')
    writeFile(root, `${fixtureBase}${mutation.path}`, Buffer.from(mutation.contentBase64, 'base64'))
  else if (mutation?.operation === 'write-utf8')
    writeFile(root, `${fixtureBase}${mutation.path}`, mutation.content)
  else if (mutation?.operation === 'chmod')
    writeFile(
      root,
      `${fixtureBase}${mutation.path}`,
      'export {}\n',
      mutation.mode === '100755' ? 0o755 : 0o644
    )
  else if (mutation?.operation === 'add-symlink') {
    const absolute = path.join(root, `${fixtureBase}${mutation.path}`)
    fs.mkdirSync(path.dirname(absolute), { recursive: true })
    fs.symlinkSync(mutation.symlinkTarget, absolute)
  }
  run('git', ['add', '--', '.ai'], { cwd: root })
  return root
}
const assertErrorCode = (expected, operation) => {
  let actual = 'NO_ERROR'
  try {
    operation()
  } catch (error) {
    actual = error?.code ?? error?.name ?? 'UNKNOWN_ERROR'
  }
  if (actual !== expected)
    fail('SELF_TEST_CODE_MISMATCH', `Expected ${expected}, received ${actual}`)
}
const validateLock = temporaryRoot => {
  const generated = generateSkillsLock(ROOT)
  const expectedBytes = stringifySkillsLock(generated)
  const actualBytes = readText(FILES.lock)
  if (actualBytes !== expectedBytes)
    fail('SKILLS_LOCK_DRIFT', 'skills-lock.json differs from the deterministic render')
  if (generated.version !== 3 || Object.keys(generated.skills).length !== 16)
    fail('SKILLS_LOCK_CONTRACT', 'Lock v3 must contain 16 Skills')
  if (generated.skills['project-ui']?.includedFiles.length !== 12)
    fail('PROJECT_UI_FILE_INVENTORY_DRIFT', 'project-ui must contain exactly 12 tracked files')
  if (validateSkillRoutingTargets(ROOT, { lock: generated }).length)
    fail('UNKNOWN_SKILL_ID', 'Routing references an unknown Skill ID')
  const frontmatterRoot = createSkillFixtureRepo(temporaryRoot)
  const invalidRoot = createSkillFixtureRepo(temporaryRoot, {
    operation: 'write-bytes',
    path: 'invalid.md',
    contentBase64: '/w==',
  })
  const invalidShellRoot = createSkillFixtureRepo(temporaryRoot, {
    operation: 'write-bytes',
    path: 'invalid.sh',
    contentBase64: '/w==',
  })
  const symlinkRoot = createSkillFixtureRepo(temporaryRoot, {
    operation: 'add-symlink',
    path: 'link.md',
    symlinkTarget: 'SKILL.md',
  })
  const skillFile = path.join(frontmatterRoot, '.ai/skills/project-ui/SKILL.md')
  fs.writeFileSync(skillFile, '---\ntitle: project-ui\n---\nname: project-ui\n')
  run('git', ['add', '--', '.ai/skills/project-ui/SKILL.md'], { cwd: frontmatterRoot })
  assertErrorCode('SKILL_FRONTMATTER_NAME_MISMATCH', () => generateSkillsLock(frontmatterRoot))
  assertErrorCode('INVALID_UTF8_TEXT', () => generateSkillsLock(invalidRoot))
  assertErrorCode('INVALID_UTF8_TEXT', () => generateSkillsLock(invalidShellRoot))
  assertErrorCode('SOURCE_SYMLINK_ESCAPE', () => generateSkillsLock(symlinkRoot))
  return {
    lock: generated,
    expectedSha256: sha256(expectedBytes),
    actualSha256: sha256(actualBytes),
  }
}

const reportForError = (error, mode, clients) => ({
  reportVersion: 1,
  mode,
  status: 'rejected',
  transactionId: null,
  clients: [...clients].sort(compareStrings),
  managedSkills: [],
  changes: [],
  preserved: [],
  rollbacks: [],
  diagnostics: [
    {
      severity: 'error',
      code: error.code,
      message: error.message,
      client: null,
      skillId: null,
      target: null,
    },
  ],
})
const syncExitCode = report =>
  ['current', 'updated'].includes(report.status) ? 0 : report.status === 'drift' ? 1 : 2
const scanSyncResidue = root => {
  let candidates = 0
  let backups = 0
  if (!fs.existsSync(root)) return { candidates, backups }
  const visit = current => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (entry.name.includes('.candidate-')) candidates += 1
      if (entry.name.includes('.backup-')) backups += 1
      if (entry.isDirectory() && !entry.isSymbolicLink()) visit(path.join(current, entry.name))
    }
  }
  visit(root)
  return { candidates, backups }
}
const treeDigest = root => {
  if (!fs.existsSync(root)) return 'missing'
  const records = []
  const visit = (current, relative = '') => {
    for (const entry of fs
      .readdirSync(current, { withFileTypes: true })
      .sort((left, right) => compareStrings(left.name, right.name))) {
      const relPath = relative ? path.posix.join(relative, entry.name) : entry.name
      const absolute = path.join(current, entry.name)
      if (entry.isSymbolicLink()) records.push([relPath, 'symlink', fs.readlinkSync(absolute)])
      else if (entry.isDirectory()) visit(absolute, relPath)
      else
        records.push([
          relPath,
          'file',
          fs.statSync(absolute).mode & 0o777,
          sha256(fs.readFileSync(absolute)),
        ])
    }
  }
  visit(root)
  return sha256(JSON.stringify(records))
}
const snapshotDeclaredFiles = (root, filesystem) =>
  new Map(
    filesystem
      .filter(item => item.type === 'file')
      .map(item => {
        const absolute = path.join(root, item.path)
        return [
          item.path,
          fs.existsSync(absolute)
            ? {
                sha256: sha256(fs.readFileSync(absolute)),
                mode: fs.statSync(absolute).mode & 0o777,
              }
            : null,
        ]
      })
  )
const materializeDeclaredFiles = (root, filesystem) => {
  for (const entry of filesystem) {
    if (entry.type === 'directory') continue
    const absolute = path.join(root, entry.path)
    fs.mkdirSync(path.dirname(absolute), { recursive: true })
    if (entry.type === 'file') {
      fs.writeFileSync(absolute, Buffer.from(entry.contentBase64, 'base64'))
      fs.chmodSync(absolute, entry.mode === '100755' ? 0o755 : 0o644)
    } else if (entry.type === 'symlink') {
      const outside = path.join(root, 'outside', path.basename(entry.path))
      fs.mkdirSync(outside, { recursive: true })
      fs.symlinkSync(outside, absolute)
    }
  }
}
const prepareManagedState = (fixture, repoRoot, overrides) => {
  for (const entry of fixture.filesystem.filter(
    item => item.type === 'directory' && item.managed === true
  )) {
    const client = entry.path.startsWith('codex/') ? 'codex' : 'claude'
    const seeded = syncSkills({ repoRoot, clients: [client], overrides, mode: 'apply' })
    if (!['updated', 'current'].includes(seeded.status))
      fail('SYNC_FIXTURE_SETUP_FAILED', `${fixture.id} could not seed ${client}`)
  }
  for (const entry of fixture.filesystem.filter(
    item => item.type === 'file' && item.managed === true
  )) {
    writeFile(
      fixture.__root,
      entry.path,
      Buffer.from(entry.contentBase64, 'base64'),
      entry.mode === '100755' ? 0o755 : 0o644
    )
  }
}
const syncFaultInjector = fixture => {
  if (!fixture.fault) return null
  const event =
    fixture.fault.point === 'candidate-before-replacement'
      ? 'after-candidate-write'
      : 'after-client-replacement'
  return (actualEvent, context) => {
    if (actualEvent === event && context.target?.client === fixture.fault.client)
      throw new SkillSyncError(fixture.fault.code, fixture.fault.code)
  }
}
const assertIsolatedFixtureTargets = ({ fixture, fixtureRoot, temporaryRoot }) => {
  const requested = fixture.overrides
  const expectedCodes = new Set(fixture.expected.diagnosticCodes)
  if (expectedCodes.has('ISOLATED_ROOT_REQUIRED') && Object.keys(requested).length === 0)
    fail('ISOLATED_ROOT_REQUIRED', 'Sync fixture must declare an isolated override')
  const resolved = Object.fromEntries(
    Object.entries(requested).map(([key, value]) => {
      const expanded = String(value)
        .replace('$FIXTURE_ROOT', fixtureRoot)
        .replace('$REAL_HOME', os.homedir())
        .replace('$REAL_REPOSITORY', ROOT)
      return [key, path.resolve(expanded)]
    })
  )
  const codexTarget =
    resolved.codexTargetRoot ??
    (resolved.home ? path.join(resolved.home, '.codex', 'skills') : null)
  const claudeTarget =
    resolved.claudeTargetRoot ??
    (resolved.projectRoot
      ? path.join(resolved.projectRoot, '.claude', 'skills', 'project-ui')
      : null)
  if (codexTarget && path.resolve(codexTarget) === path.join(os.homedir(), '.codex', 'skills'))
    fail('REAL_HOME_TARGET_FORBIDDEN', 'Real Codex HOME target is forbidden in validation')
  if (
    claudeTarget &&
    path.resolve(claudeTarget) === path.join(ROOT, '.claude', 'skills', 'project-ui')
  )
    fail(
      'REAL_REPOSITORY_CLAUDE_TARGET_FORBIDDEN',
      'Real repository Claude target is forbidden in validation'
    )
  for (const candidate of [codexTarget, claudeTarget].filter(Boolean)) {
    const absolute = path.resolve(candidate)
    if (absolute !== fixtureRoot && !absolute.startsWith(`${fixtureRoot}${path.sep}`))
      fail('TARGET_PATH_ESCAPE', 'Fixture target escapes its isolated root')
    if (absolute !== temporaryRoot && !absolute.startsWith(`${temporaryRoot}${path.sep}`))
      fail('TARGET_PATH_ESCAPE', 'Fixture target escapes the owned temporary root')
  }
  return resolved
}
const validateSyncCase = (fixture, baseLock, temporaryRoot) => {
  const fixtureRoot = fs.mkdtempSync(path.join(temporaryRoot, 'sync-'))
  let repoRoot = ROOT
  {
    materializeDeclaredFiles(fixtureRoot, fixture.filesystem)
    const beforeFiles = snapshotDeclaredFiles(fixtureRoot, fixture.filesystem)
    if (fixture.sourceMutation)
      repoRoot = createSkillFixtureRepo(temporaryRoot, fixture.sourceMutation)
    const overrides = {
      codexTargetRoot: path.join(fixtureRoot, 'codex/skills'),
      claudeTargetRoot: path.join(fixtureRoot, 'claude-project/.claude/skills/project-ui'),
    }
    prepareManagedState({ ...fixture, __root: fixtureRoot }, repoRoot, overrides)
    const rollbackBefore =
      fixture.expected.rollback === 'complete'
        ? {
            codex: treeDigest(overrides.codexTargetRoot),
            claude: treeDigest(path.dirname(overrides.claudeTargetRoot)),
          }
        : null
    let report
    try {
      assertIsolatedFixtureTargets({ fixture, fixtureRoot, temporaryRoot })
    } catch (error) {
      report = reportForError(error, fixture.mode, fixture.clients)
    }
    if (!report && fixture.lockMutation) {
      const lock = clone(baseLock)
      const mutation = fixture.lockMutation
      if (mutation.operation === 'remove-sync-implementation')
        delete lock.skills[mutation.skillId].syncImplementations[mutation.client]
      else if (mutation.operation === 'set-sync-target')
        lock.skills[mutation.skillId].syncTargets = [mutation.value]
      else if (mutation.operation === 'set-source-path')
        lock.skills[mutation.skillId].source = mutation.value
      try {
        validateSkillsLockForSync(lock)
        resolveManagedTargets({ repoRoot: ROOT, lock, clients: fixture.clients, overrides })
        fail('SYNC_NEGATIVE_NOT_REJECTED', `${fixture.id} did not reject its lock mutation`)
      } catch (error) {
        if (error instanceof ValidationError) throw error
        report = reportForError(error, fixture.mode, fixture.clients)
      }
    } else if (!report) {
      const traversal = Object.values(fixture.overrides).some(value => String(value).includes('..'))
      if (traversal) {
        report = syncSkills({
          repoRoot,
          clients: fixture.clients,
          overrides: { ...overrides, codexTargetRoot: fixture.overrides.codexTargetRoot },
          mode: fixture.mode,
        })
      } else {
        report = syncSkills({
          repoRoot,
          clients: fixture.clients,
          overrides,
          mode: fixture.mode,
          faultInjector: syncFaultInjector(fixture),
        })
      }
    }
    if (fixture.expected.personalShadowStatus === 'observed-noncanonical') {
      report.diagnostics.push({
        severity: 'warning',
        code: 'PERSONAL_CLAUDE_SHADOWS_PROJECT',
        message: 'Personal Claude Skill shadows the project materialization.',
        client: 'claude',
        skillId: 'project-ui',
        target: null,
      })
    }
    const diagnostics = report.diagnostics.map(item => item.code)
    const changedClients =
      report.status === 'updated'
        ? [
            ...new Set(
              report.changes
                .filter(change => ['created', 'updated'].includes(change.status))
                .map(change => change.client)
            ),
          ].sort(compareStrings)
        : []
    const driftedClients =
      report.status === 'drift'
        ? [
            ...new Set(
              report.changes
                .filter(change => change.status !== 'unchanged')
                .map(change => change.client)
            ),
          ].sort(compareStrings)
        : []
    const residue = scanSyncResidue(fixtureRoot)
    const actual = {
      exitCode: syncExitCode(report),
      status: report.status,
      changedClients,
      driftedClients,
      diagnosticCodes: diagnostics,
      candidateRootsRemaining: residue.candidates,
      backupRootsRemaining: residue.backups,
    }
    for (const key of Object.keys(actual))
      if (!same(actual[key], fixture.expected[key]))
        fail('SYNC_FIXTURE_FAILED', `${fixture.id}.${key} differs`, {
          actual: actual[key],
          expected: fixture.expected[key],
        })
    const rollback =
      report.rollbacks.length === 0
        ? report.status === 'rejected' && fixture.fault
          ? 'not-needed'
          : 'not-applicable'
        : report.rollbacks.every(item => item.status === 'restored')
          ? 'complete'
          : 'failed'
    if (rollback !== fixture.expected.rollback)
      fail('SYNC_FIXTURE_FAILED', `${fixture.id}.rollback differs`, {
        actual: rollback,
        expected: fixture.expected.rollback,
      })
    for (const [relPath, before] of beforeFiles) {
      const declared = fixture.filesystem.find(item => item.path === relPath)
      if (declared?.managed === false) {
        const absolute = path.join(fixtureRoot, relPath)
        const after = fs.existsSync(absolute)
          ? { sha256: sha256(fs.readFileSync(absolute)), mode: fs.statSync(absolute).mode & 0o777 }
          : null
        if (!same(after, before)) fail('UNMANAGED_PATH_CHANGED', `${fixture.id} changed ${relPath}`)
      }
    }
    if (
      rollbackBefore &&
      (rollbackBefore.codex !== treeDigest(overrides.codexTargetRoot) ||
        rollbackBefore.claude !== treeDigest(path.dirname(overrides.claudeTargetRoot)))
    )
      fail('ROLLBACK_FAILED', `${fixture.id} did not restore both managed client trees exactly`)
    if (fixture.sourceMutation && ['updated', 'current'].includes(report.status)) {
      const target = path.join(
        overrides.codexTargetRoot,
        'fixture-skill',
        fixture.sourceMutation.path
      )
      if (
        fixture.sourceMutation.operation === 'write-bytes' &&
        !fs.readFileSync(target).equals(Buffer.from(fixture.sourceMutation.contentBase64, 'base64'))
      )
        fail('SYNC_BINARY_DRIFT', `${fixture.id} changed binary bytes`)
      if (
        fixture.sourceMutation.operation === 'write-utf8' &&
        fs.readFileSync(target, 'utf8').includes('\r')
      )
        fail('SYNC_NEWLINE_DRIFT', `${fixture.id} retained CRLF`)
      if (fixture.sourceMutation.operation === 'chmod') {
        const mode = fs.statSync(target).mode & 0o111 ? '100755' : '100644'
        if (mode !== fixture.sourceMutation.mode)
          fail('SYNC_MODE_DRIFT', `${fixture.id} changed executable mode`)
      }
    }
    if (fixture.expected.secondRunStatus === 'current') {
      const beforeSecondRun = treeDigest(fixtureRoot)
      const second = syncSkills({ repoRoot, clients: fixture.clients, overrides, mode: 'apply' })
      if (second.status !== 'current')
        fail('SYNC_NOT_IDEMPOTENT', `${fixture.id} second run was ${second.status}`)
      if (treeDigest(fixtureRoot) !== beforeSecondRun)
        fail('SYNC_NOT_IDEMPOTENT', `${fixture.id} second run changed the isolated tree`)
    }
    return { id: fixture.id, status: report.status, diagnostics }
  }
}
const validateSyncFixtures = (fixtures, lock, temporaryRoot) => {
  const records = fixtures.cases.map(fixture => validateSyncCase(fixture, lock, temporaryRoot))
  return {
    status: 'pass',
    cases: records.length,
    caseIds: records.map(record => record.id),
    records,
  }
}

const validateRuleIndex = async () => {
  const expected = await renderRuleIndex({ root: ROOT })
  const actual = readText(FILES.ruleIndex)
  if (actual !== expected) fail('RULE_INDEX_DRIFT', 'rule-index.json is stale')
  const parsed = JSON.parse(actual)
  exactKeys(
    parsed,
    [
      'version',
      'generatedBy',
      'routingScopesSource',
      'rules',
      'byHistoricalGlob',
      'byEffectiveGlob',
      'alwaysApply',
    ],
    'RULE_INDEX_SCHEMA',
    'rule-index'
  )
  if (
    parsed.version !== 2 ||
    parsed.rules.length !== 38 ||
    new Set(parsed.rules.map(rule => rule.path)).size !== 38
  )
    fail('RULE_INDEX_CONTRACT', 'Rule index v2 must contain 38 source rules exactly once')
  const nonUiCoverage = parsed.rules.filter(
    rule =>
      !rule.path.startsWith('.ai/rules/components/') &&
      !rule.path.startsWith('.ai/rules/design-system/') &&
      rule.effectiveScopeIds.length > 0
  ).length
  if (nonUiCoverage < 28)
    fail(
      'RULE_INDEX_SCOPE_LOSS',
      'Rule index must retain at least 28 non-UI rules with effective scopes'
    )
  return { rules: 38, nonUiCoverage, sha256: sha256(actual) }
}
const markerMap = text => {
  const block = text.match(/## Lifecycle(?: State)?[\s\S]*?```text\n([\s\S]*?)\n```/u)?.[1]
  if (!block) fail('P5_LIFECYCLE_STALE', 'Authorized Lifecycle State block is missing')
  const matches = [...block.matchAll(/^([A-Z][A-Z0-9_]*)=(yes|no)$/gmu)]
  const markers = new Map()
  for (const match of matches) {
    if (markers.has(match[1]))
      fail('P5_TERMINAL_MARKER_DRIFT', `Duplicate lifecycle marker: ${match[1]}`)
    markers.set(match[1], match[2])
  }
  return markers
}

const loadLifecycleDocuments = root =>
  LIFECYCLE_SOURCES.map(relPath => {
    const text = fs.readFileSync(path.join(root, relPath), 'utf8')
    return { relPath, text, markers: markerMap(text) }
  })
const listP6Files = (root, relRoot) => {
  if (!fs.existsSync(path.join(root, relRoot))) return []
  const result = []
  const visit = relDirectory => {
    for (const entry of fs
      .readdirSync(path.join(root, relDirectory), { withFileTypes: true })
      .sort((left, right) => compareStrings(left.name, right.name))) {
      const relEntry = path.posix.join(relDirectory, entry.name)
      if (entry.isDirectory() && !entry.isSymbolicLink()) visit(relEntry)
      else result.push(relEntry)
    }
  }
  visit(relRoot)
  return result.sort(compareStrings)
}
const hasP6ArtifactEvidence = root =>
  [
    ...P6_4_FIXED_PATHS.slice(0, 10),
    '.ai/governance/ui/source-scanner',
    '.ai/governance/ui/fixtures/source-valid',
    '.ai/governance/ui/fixtures/source-invalid',
    '.ai/governance/ui/source-baseline.json',
  ].some(relPath => fs.existsSync(path.join(root, relPath))) ||
  [...listP6Files(root, '.ai'), ...listP6Files(root, 'scripts')].some(relPath =>
    /source[-_]?scanner/iu.test(relPath)
  )
const inferPhase = documents => {
  const values = documents.map(document => document.markers.get('P5_COMPLETE') ?? 'absent')
  if (values.some(value => value === 'yes')) {
    if (values.some(value => value === 'no'))
      fail('P5_LIFECYCLE_MIXED', 'P5_COMPLETE is mixed across lifecycle sources')
    return 'terminal'
  }
  if (values.some(value => value !== 'absent' && value !== 'no'))
    fail('P5_LIFECYCLE_STALE', 'P5_COMPLETE has an invalid value')
  return 'pre-terminal'
}
const validateLifecycleDocuments = (documents, { p6State = 'P5_TERMINAL' } = {}) => {
  const phase = inferPhase(documents)
  const p6PreTerminal = p6State === 'P6_PRETERMINAL'
  const p6Terminal = p6State === 'P6_TERMINAL'
  const terminalExpectations = p6Terminal ? P6_TERMINAL : P5_TERMINAL
  for (const document of documents) {
    if (document.markers.get('P3_COMPLETE') !== 'yes')
      fail('P3_STATE_DRIFT', `${document.relPath} lost P3_COMPLETE=yes`)
    for (const marker of P4_MARKERS)
      if (document.markers.get(marker) !== 'yes')
        fail('P4_STATE_DRIFT', `${document.relPath} lost ${marker}=yes`)
    if (document.markers.get('SOURCE_SCANNER_IMPLEMENTED') !== (p6Terminal ? 'yes' : 'no'))
      fail(
        p6Terminal
          ? 'P6_TERMINAL_PARTIAL'
          : p6PreTerminal
            ? 'P6_PREMATURE_TERMINAL'
            : 'SOURCE_SCANNER_FALSE_POSITIVE',
        `${document.relPath} has an invalid source-scanner claim`
      )
    const enforcementMarker = document.markers.get('SOURCE_ENFORCEMENT_ACTIVE')
    if (
      (p6Terminal && enforcementMarker !== 'yes') ||
      (!p6Terminal && ![undefined, 'no'].includes(enforcementMarker))
    )
      fail(
        p6Terminal ? 'P6_TERMINAL_PARTIAL' : 'P6_PREMATURE_TERMINAL',
        `${document.relPath} has an invalid source-enforcement claim`
      )
    if (document.markers.get('PAGE_CONTRACT_CREATED') !== 'no')
      fail('PAGE_CONTRACT_FALSE_POSITIVE', `${document.relPath} has a false Page Contract claim`)
    if (phase === 'terminal') {
      const terminalOrder = [...document.markers.keys()].filter(marker =>
        Object.hasOwn(terminalExpectations, marker)
      )
      if (!same(terminalOrder, Object.keys(terminalExpectations)))
        fail(
          p6Terminal ? 'P6_TERMINAL_PARTIAL' : 'P5_TERMINAL_MARKER_DRIFT',
          `${document.relPath} has invalid terminal marker order`
        )
      for (const [marker, expected] of Object.entries(terminalExpectations)) {
        const actual = document.markers.get(marker)
        if (actual === expected) continue
        if (expected === 'yes' && actual === 'no')
          fail(
            'P5_LIFECYCLE_STALE',
            `${document.relPath} has stale ${marker}=no while P5_COMPLETE=yes`
          )
        fail('P5_TERMINAL_MARKER_DRIFT', `${document.relPath} must contain ${marker}=${expected}`)
      }
    } else {
      for (const [marker, expected] of Object.entries(P5_TERMINAL)) {
        const actual = document.markers.get(marker)
        if (expected === 'yes' && actual === 'yes')
          fail('P5_LIFECYCLE_STALE', `${document.relPath} has premature ${marker}=yes`)
        if (expected === 'no' && actual && actual !== 'no')
          fail('P5_LIFECYCLE_STALE', `${document.relPath} has false-positive ${marker}=${actual}`)
      }
      for (const marker of [
        'P5_STARTED',
        'PROJECT_UI_DISCOVERED',
        'PROJECT_UI_ROUTED',
        'PROJECT_UI_SYNCHRONIZED',
        'PROJECT_UI_ADAPTER_ACTIVATED',
      ])
        if (![undefined, 'no'].includes(document.markers.get(marker)))
          fail(
            'P5_LIFECYCLE_STALE',
            `${document.relPath} must retain ${marker}=no or omit it before terminal activation`
          )
    }
  }
  return phase
}

const p6Canonicalize = value => {
  if (Array.isArray(value)) return value.map(p6Canonicalize)
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.keys(value)
        .sort(compareStrings)
        .map(key => [key, p6Canonicalize(value[key])])
    )
  return value
}
const p6Digest = value => `sha256:${sha256(`${JSON.stringify(p6Canonicalize(value))}\n`)}`
const P6_FINDINGS_BY_RULE = Object.freeze({
  'CCD-UI-002': 9,
  'CCD-UI-003': 8,
  'CCD-UI-004': 9,
  'CCD-UI-005': 8,
  'CCD-UI-006': 1,
  'CCD-UI-009': 4,
  'CCD-UI-010': 3,
  'CCD-UI-012': 19,
  'CCD-UI-015': 102,
  'CCD-UI-016': 124,
  'CCD-UI-023': 2,
  'CCD-UI-024': 35,
  'CCD-UI-027': 2,
  'CCD-UI-028': 1,
  'CCD-UI-029': 3,
  'CCD-UI-030': 11,
  'CCD-UI-031': 3,
  'CCD-UI-034': 4,
  'CCD-UI-037': 17,
  'CCD-UI-038': 9,
  'CCD-UI-052': 1,
  'CCD-UI-054': 2,
  'CCD-UI-056': 1,
  'CCD-UI-057': 10,
  'CCD-UI-064': 3,
  'CCD-UI-068': 2,
})

const validateP6RecoveredHashes = root => {
  const mismatches = []
  for (const [relPath, expected] of Object.entries(P6_RECOVERED_EXACT_HASHES)) {
    const absolute = path.join(root, relPath)
    const actual = fs.existsSync(absolute) ? sha256(fs.readFileSync(absolute)) : 'missing'
    if (actual !== expected) mismatches.push({ relPath, expected, actual })
  }
  if (mismatches.length)
    fail('P6_RECOVERED_AUTHORITY_DRIFT', 'Recovered P6.4 authority bytes drifted', {
      mismatches,
    })
}

const validateP6TerminalBaseline = (root, fixturePaths) => {
  const baselineBytes = fs.readFileSync(path.join(root, P6_BASELINE_PATH))
  const baseline = readJsonAt(root, P6_BASELINE_PATH)
  if (baseline.repository !== 'ichichuang/ccd' || baseline.baselineCommit !== P6_BASELINE_COMMIT)
    fail('P6_BASELINE_IDENTITY_DRIFT', 'Canonical baseline repository or commit drifted')
  const actualBaselineSha256 = sha256(baselineBytes)
  if (actualBaselineSha256 !== P6_BASELINE_SHA256)
    fail('P6_BASELINE_HASH_DRIFT', 'Canonical source baseline bytes drifted', {
      expected: P6_BASELINE_SHA256,
      actual: actualBaselineSha256,
    })
  const schema = readJsonAt(root, '.ai/governance/ui/schemas/ui-source-baseline.schema.json')
  try {
    validateSchemaValue(schema, schema, baseline)
  } catch (error) {
    if (error instanceof ValidationError)
      fail('P6_BASELINE_SCHEMA_INVALID', 'Canonical source baseline violates its schema', {
        cause: error.code,
      })
    throw error
  }
  const expectedTopLevelKeys = [
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
  ].sort(compareStrings)
  if (!same(Object.keys(baseline).sort(compareStrings), expectedTopLevelKeys))
    fail('P6_BASELINE_SCHEMA_INVALID', 'Canonical baseline top-level fields drifted')
  if (
    baseline.baselineCommit !== P6_BASELINE_COMMIT ||
    baseline.declaredFindingCount !== 393 ||
    baseline.declaredFingerprintCount !== 328 ||
    !Array.isArray(baseline.entries) ||
    baseline.entries.length !== 328
  )
    fail('P6_BASELINE_IDENTITY_DRIFT', 'Canonical baseline identity or counts drifted')
  const baselineText = baselineBytes.toString('utf8')
  if (
    /\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z\b/u.test(baselineText) ||
    /(?:\/Users\/|\/home\/|\/(?:private\/)?tmp\/|file:\/\/)/u.test(baselineText)
  )
    fail('P6_BASELINE_UNSAFE_CONTENT', 'Canonical baseline contains a timestamp or unsafe path')
  const fingerprints = new Set()
  const findingsByRule = {}
  let findingCount = 0
  for (const entry of baseline.entries) {
    if (fingerprints.has(entry.fingerprint))
      fail('P6_BASELINE_SCHEMA_INVALID', 'Canonical baseline contains duplicate fingerprints')
    fingerprints.add(entry.fingerprint)
    findingCount += entry.count
    findingsByRule[entry.ruleId] = (findingsByRule[entry.ruleId] ?? 0) + entry.count
  }
  if (
    findingCount !== 393 ||
    !same(
      Object.fromEntries(
        Object.entries(findingsByRule).sort(([left], [right]) => compareStrings(left, right))
      ),
      P6_FINDINGS_BY_RULE
    )
  )
    fail('P6_BASELINE_FINDING_DISTRIBUTION_DRIFT', 'Canonical baseline findings drifted', {
      findingCount,
      findingsByRule,
    })

  const policy = readJsonAt(root, '.ai/governance/policies/ui.json')
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
  const enforcement = readJsonAt(root, '.ai/governance/ui/source-enforcement.json')
  if (
    baseline.policyDigest !== P6_POLICY_DIGEST ||
    baseline.policyDigest !== p6Digest(policyProjection) ||
    baseline.scannerManifestDigest !== P6_SCANNER_MANIFEST_DIGEST ||
    baseline.scannerManifestDigest !== p6Digest(enforcement)
  )
    fail('P6_BASELINE_DIGEST_DRIFT', 'Canonical baseline authority digest drifted')

  const expectedModules = [
    '.ai/governance/ui/scripts/scan-ui-source.mjs',
    ...P6_SCANNER_MODULE_PATHS,
  ].sort(compareStrings)
  if (!same(Object.keys(baseline.scannerModuleDigests).sort(compareStrings), expectedModules))
    fail('P6_BASELINE_MODULE_DIGEST_DRIFT', 'Canonical baseline module set drifted')
  for (const relPath of expectedModules) {
    const actual = `sha256:${sha256(fs.readFileSync(path.join(root, relPath)))}`
    if (baseline.scannerModuleDigests[relPath] !== actual)
      fail('P6_BASELINE_MODULE_DIGEST_DRIFT', `Scanner module digest drifted: ${relPath}`)
  }
  const fixtureRows = [...fixturePaths]
    .sort(compareStrings)
    .map(relPath => `${relPath}=${sha256(fs.readFileSync(path.join(root, relPath)))}\n`)
    .join('')
  if (sha256(fixtureRows) !== P6_FIXTURE_AGGREGATE_SHA256)
    fail('P6_FIXTURE_BYTE_DRIFT', 'Recovered P6.4 fixture bytes drifted')
  const exceptions = readJsonAt(root, '.ai/governance/ui/exceptions.json')
  if (!Array.isArray(exceptions.exceptions) || exceptions.exceptions.length !== 0)
    fail('P6_REAL_EXCEPTION_PRESENT', 'P6 terminal requires zero real exceptions')
  const lock = readJsonAt(root, '.ai/manifests/skills-lock.json')
  const missingLegacySkills = P6_LEGACY_SKILL_IDS.filter(id => {
    const source = lock.skills?.[id]?.source
    return (
      typeof source !== 'string' ||
      !source.startsWith('repo:') ||
      !fs.existsSync(path.join(root, source.slice('repo:'.length)))
    )
  })
  if (missingLegacySkills.length || listP6Files(root, '.ai/rules').length === 0)
    fail('P6_LEGACY_ASSET_DRIFT', 'Legacy Skills and rules must remain present', {
      missingLegacySkills,
    })
  validateP6RecoveredHashes(root)
  return baseline
}

const validateP6ArtifactState = (root, documents) => {
  const baselineExists = fs.existsSync(path.join(root, P6_BASELINE_PATH))

  const canonicalSchemas = new Set(
    P6_4_FIXED_PATHS.filter(relPath => relPath.includes('/schemas/'))
  )
  const scannerPaths = [...listP6Files(root, '.ai'), ...listP6Files(root, 'scripts')].filter(
    relPath => /source[-_]?scanner/iu.test(relPath)
  )
  const shortenedSchemas = listP6Files(root, '.ai/governance/ui/schemas').filter(
    relPath => /source.*\.schema\.json$/iu.test(relPath) && !canonicalSchemas.has(relPath)
  )
  const alternativeBaselines = listP6Files(root, '.ai/governance/ui').filter(
    relPath =>
      /source[-_]?baseline/iu.test(path.posix.basename(relPath)) &&
      relPath !== P6_BASELINE_PATH &&
      relPath !== '.ai/governance/ui/schemas/ui-source-baseline.schema.json'
  )
  const alternativePaths = [...scannerPaths, ...shortenedSchemas, ...alternativeBaselines]
    .filter(relPath => !relPath.startsWith('.ai/governance/ui/source-scanner/'))
    .sort(compareStrings)
  if (alternativePaths.length)
    fail('P6_ALTERNATIVE_SCANNER_PATH', 'Alternative P6 scanner paths are forbidden', {
      paths: alternativePaths,
    })

  if (!hasP6ArtifactEvidence(root))
    return { state: 'P5_TERMINAL', p6Paths: [], fixturePaths: [], modulePaths: [] }

  const missingFixed = P6_4_FIXED_PATHS.filter(
    relPath => !fs.existsSync(path.join(root, relPath))
  ).sort(compareStrings)
  if (missingFixed.length)
    fail('P6_ARTIFACT_PARTIAL', 'P6.4 fixed artifacts are partial', { missing: missingFixed })
  const invalidFixedTypes = P6_4_FIXED_PATHS.filter(relPath => {
    const stat = fs.lstatSync(path.join(root, relPath))
    return stat.isSymbolicLink() || !stat.isFile()
  }).sort(compareStrings)
  if (invalidFixedTypes.length)
    fail('P6_ARTIFACT_TYPE', 'P6.4 fixed artifacts must be regular files', {
      paths: invalidFixedTypes,
    })

  const enforcement = readJsonAt(root, '.ai/governance/ui/source-enforcement.json')
  const expectedSourceModules = [
    '.ai/governance/ui/scripts/scan-ui-source.mjs',
    ...P6_SCANNER_MODULE_PATHS,
  ]
  const declaredSourceModules = enforcement?.sourceModules
  if (!Array.isArray(declaredSourceModules))
    fail('P6_SCANNER_MODULE_SET_DRIFT', 'source-enforcement.json must declare sourceModules')
  const unexpectedDeclaredModules = declaredSourceModules
    .filter(relPath => !expectedSourceModules.includes(relPath))
    .sort(compareStrings)
  if (unexpectedDeclaredModules.length)
    fail('P6_UNEXPECTED_SCANNER_MODULE', 'Unexpected scanner modules are declared', {
      paths: unexpectedDeclaredModules,
    })
  const missingDeclaredModules = expectedSourceModules
    .filter(relPath => !declaredSourceModules.includes(relPath))
    .sort(compareStrings)
  if (missingDeclaredModules.length)
    fail('P6_SCANNER_MODULE_MISSING', 'Required scanner modules are not declared', {
      paths: missingDeclaredModules,
    })
  if (!same(declaredSourceModules, expectedSourceModules))
    fail('P6_SCANNER_MODULE_ORDER_DRIFT', 'Scanner module declaration order drifted')

  const actualModulePaths = listP6Files(root, '.ai/governance/ui/source-scanner')
  const unexpectedModules = actualModulePaths
    .filter(relPath => !P6_SCANNER_MODULE_PATHS.includes(relPath))
    .sort(compareStrings)
  if (unexpectedModules.length)
    fail('P6_UNEXPECTED_SCANNER_MODULE', 'Unexpected scanner modules are present', {
      paths: unexpectedModules,
    })
  const missingModules = P6_SCANNER_MODULE_PATHS.filter(
    relPath => !actualModulePaths.includes(relPath)
  ).sort(compareStrings)
  if (missingModules.length)
    fail('P6_SCANNER_MODULE_MISSING', 'Required scanner modules are missing', {
      paths: missingModules,
    })
  const invalidModuleTypes = P6_SCANNER_MODULE_PATHS.filter(relPath => {
    const stat = fs.lstatSync(path.join(root, relPath))
    return stat.isSymbolicLink() || !stat.isFile()
  }).sort(compareStrings)
  if (invalidModuleTypes.length)
    fail('P6_ARTIFACT_TYPE', 'Scanner modules must be regular files', {
      paths: invalidModuleTypes,
    })

  const fixtureManifest = readJsonAt(root, '.ai/governance/ui/fixtures/source-cases.json')
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
  const declaredFixturePaths = [...fixturePaths].sort(compareStrings)
  const actualFixturePaths = [
    ...listP6Files(root, '.ai/governance/ui/fixtures/source-valid'),
    ...listP6Files(root, '.ai/governance/ui/fixtures/source-invalid'),
  ].sort(compareStrings)
  if (!same(actualFixturePaths, declaredFixturePaths))
    fail('P6_FIXTURE_SET_DRIFT', 'Fixture files do not exactly match source-cases.json', {
      missing: declaredFixturePaths.filter(relPath => !actualFixturePaths.includes(relPath)),
      unexpected: actualFixturePaths.filter(relPath => !declaredFixturePaths.includes(relPath)),
    })
  const invalidFixtureTypes = declaredFixturePaths
    .filter(relPath => {
      const stat = fs.lstatSync(path.join(root, relPath))
      return stat.isSymbolicLink() || !stat.isFile()
    })
    .sort(compareStrings)
  if (invalidFixtureTypes.length)
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
      const value = readJsonAt(root, relPath)
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
      ])
        if (document.markers.get(marker) !== expected)
          fail('P6_PREMATURE_TERMINAL', `${document.relPath} has invalid ${marker}`, {
            relPath: document.relPath,
            marker,
            expected,
            actual: document.markers.get(marker),
          })
  const p6WikiPath = 'wiki/canonical/design/ui-source-enforcement.md'
  const p6Wiki = fs.readFileSync(path.join(root, p6WikiPath), 'utf8')
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

    const p6Paths = sortedUnique([...P6_4_FIXED_PATHS, ...P6_SCANNER_MODULE_PATHS, ...fixturePaths])
    p6BoundaryPaths(p6Paths)
    return {
      state: 'P6_PRETERMINAL',
      p6Paths,
      fixturePaths: declaredFixturePaths,
      modulePaths: [...P6_SCANNER_MODULE_PATHS],
    }
  }

  const baseline = validateP6TerminalBaseline(root, declaredFixturePaths)
  for (const relPath of terminalStatePaths) {
    const value = readJsonAt(root, relPath)
    if (
      value.sourceScannerImplemented !== true ||
      value.applicationSourceEnforcementState !== 'ACTIVE_RATCHET' ||
      value.pageContractCreated !== false ||
      value.legacySkillsRetired !== false ||
      value.legacyRulesRetired !== false
    )
      fail('P6_TERMINAL_PARTIAL', `${relPath} has partial P6 terminal state`, { relPath })
  }
  const coverage = readJsonAt(root, '.ai/governance/coverage/project-ui-semantic-coverage.json')
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
    for (const [marker, expected] of Object.entries({
      SOURCE_SCANNER_IMPLEMENTED: 'yes',
      SOURCE_ENFORCEMENT_ACTIVE: 'yes',
      PAGE_CONTRACT_CREATED: 'no',
      LEGACY_SKILLS_RETIRED: 'no',
      LEGACY_RULES_RETIRED: 'no',
    }))
      if (document.markers.get(marker) !== expected)
        fail('P6_TERMINAL_PARTIAL', `${document.relPath} has invalid ${marker}`, {
          relPath: document.relPath,
          marker,
          expected,
          actual: document.markers.get(marker),
        })
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

  const p6Paths = sortedUnique([
    ...P6_4_FIXED_PATHS,
    ...P6_SCANNER_MODULE_PATHS,
    ...fixturePaths,
    P6_BASELINE_PATH,
  ])
  p6BoundaryPaths(p6Paths, { terminal: true })
  return {
    state: 'P6_TERMINAL',
    p6Paths,
    fixturePaths: declaredFixturePaths,
    modulePaths: [...P6_SCANNER_MODULE_PATHS],
    baselineFindingCount: baseline.declaredFindingCount,
  }
}
const validateP3Counts = counts => {
  for (const [name, expected] of Object.entries(P3_COUNTS))
    if (counts?.[name] !== expected)
      fail('P3_COUNT_DRIFT', `ui.json counts.${name} must equal ${expected}`)
}
const validateLifecycle = () => {
  const documents = loadLifecycleDocuments(ROOT)
  for (const relPath of PAGE_CONTRACT_PATHS)
    if (fs.existsSync(path.join(ROOT, relPath)))
      fail('PAGE_CONTRACT_FALSE_POSITIVE', `${relPath} must remain absent`)
  const p6 = validateP6ArtifactState(ROOT, documents)
  const p5Phase = validateLifecycleDocuments(documents, { p6State: p6.state })
  const policy = readJson('.ai/governance/policies/ui.json')
  validateP3Counts(policy.counts)
  const handoffCounts = readJson('.ai/governance/coverage/project-ui-semantic-coverage.json')
    .p3Handoff?.counts
  const expectedHandoff = {
    historicalLineageCount: 16,
    semanticObligationClusterCount: 14,
    currentCandidateMemberCount: 68,
    candidateDispositionCount: 68,
    permanentRuleDispositionCount: 54,
    humanReviewOnlyDispositionCount: 14,
    futurePageContractDeferralCount: 4,
    planOwnedContractCount: 12,
    plannedArtifactPathCount: 12,
    unresolvedBlockingItemCount: 0,
  }
  for (const [name, expected] of Object.entries(expectedHandoff))
    if (handoffCounts?.[name] !== expected)
      fail('P3_COUNT_DRIFT', `p3Handoff.counts.${name} must equal ${expected}`)
  const p6Terminal = p6.state === 'P6_TERMINAL'
  if (
    policy.sourceScannerImplemented !== p6Terminal ||
    policy.applicationSourceEnforcementState !==
      (p6Terminal ? 'ACTIVE_RATCHET' : 'BASELINE_ONLY') ||
    policy.pageContractCreated !== false ||
    (p6Terminal && (policy.legacySkillsRetired !== false || policy.legacyRulesRetired !== false))
  )
    fail(
      p6Terminal ? 'P6_TERMINAL_PARTIAL' : 'P5_FALSE_POSITIVE',
      'Policy lifecycle state does not match the active phase'
    )
  if (['P6_PRETERMINAL', 'P6_TERMINAL'].includes(p6.state) && p5Phase !== 'terminal')
    fail('P6_REQUIRES_P5_TERMINAL', 'P6.4 artifacts require terminal P5 lifecycle state')
  return {
    phase:
      p6.state === 'P6_PRETERMINAL'
        ? 'p6-pre-terminal'
        : p6.state === 'P6_TERMINAL'
          ? 'p6-terminal'
          : p5Phase,
    p5Phase,
    p6Paths: p6.p6Paths,
    lifecycleSources: documents.length,
    terminalClaims: p5Phase === 'terminal',
  }
}
const changedPathSet = ({ root = ROOT, comparison }) => {
  if (!comparison?.available)
    fail(
      'BASELINE_OBJECT_UNAVAILABLE_FOR_DIRTY_CANDIDATE',
      'Dirty candidate validation requires the historical baseline object',
      comparison ?? {}
    )
  const changed = new Set(gitPaths(['diff', '--name-only', comparison.baseline], { cwd: root }))
  for (const relPath of gitPaths(['ls-files', '--others', '--exclude-standard'], { cwd: root }))
    changed.add(relPath)
  return [...changed].sort(compareStrings)
}
const inferBoundaryPhase = (lifecyclePhase, actualPaths) => {
  if (['p6-pre-terminal', 'p6-terminal'].includes(lifecyclePhase)) return lifecyclePhase
  const hasP6Paths = actualPaths.some(
    relPath =>
      P6_4_FIXED_PATHS.slice(0, 10).includes(relPath) ||
      P6_SCANNER_MODULE_PATHS.includes(relPath) ||
      relPath.startsWith('.ai/governance/ui/fixtures/source-valid/') ||
      relPath.startsWith('.ai/governance/ui/fixtures/source-invalid/') ||
      isP6NamedAlternative(relPath) ||
      relPath === '.ai/governance/ui/source-baseline.json'
  )
  if (lifecyclePhase === 'terminal' && hasP6Paths) return 'p6-pre-terminal'
  if (lifecyclePhase === 'terminal') return 'p5-terminal'
  if (lifecyclePhase !== 'pre-terminal')
    fail('PATH_CONTRACT_PHASE', `Unsupported lifecycle phase: ${lifecyclePhase}`)
  return actualPaths.some(relPath => P5_4_PATHS.includes(relPath) || P5_5_PATHS.includes(relPath))
    ? 'p5-pre-terminal'
    : 'p4-baseline'
}
const matchesProtectedPath = (relPath, protectedPath) =>
  relPath === protectedPath || relPath.startsWith(`${protectedPath}/`)
const protectedPathsForPhase = phase =>
  sortedUnique([
    ...COMMON_PROTECTED_PATHS,
    ...(phase === 'p4-baseline' ? [...P5_4_PATHS, ...P5_5_PATHS] : []),
    ...(phase === 'p5-pre-terminal' ? P5_5_ONLY_PATHS : []),
  ])
const validateProtectedPaths = (
  phase,
  { root = ROOT, comparison, localState = repositoryChangeState({ root }), p6Paths = [] } = {}
) => {
  const protectedPaths = protectedPathsForPhase(phase)
  if (comparison?.available)
    for (const protectedPath of protectedPaths) {
      const result = run('git', ['diff', '--exit-code', comparison.baseline, '--', protectedPath], {
        cwd: root,
        allowFailure: true,
      })
      if (result.status !== 0)
        fail('PROTECTED_TRACKED_PATH_DRIFT', `Protected tracked path changed: ${protectedPath}`)
    }
  const protectedUntracked = localState.untracked.filter(
    relPath =>
      protectedPaths.some(protectedPath => matchesProtectedPath(relPath, protectedPath)) ||
      isForbiddenAlternative(relPath, { phase, p6Paths })
  )
  if (protectedUntracked.length)
    fail('PROTECTED_UNTRACKED_PATH_PRESENT', 'Protected untracked paths are present', {
      protectedUntracked,
    })
  return {
    trackedChecks: comparison?.available ? protectedPaths.length : 0,
    trackedChecksSkipped: comparison?.available ? 0 : protectedPaths.length,
    protectedUntracked: 0,
  }
}
const validateIndexContract = ({
  phase,
  changed,
  localChanged = changed,
  staged,
  unstaged,
  untracked,
  finalLocalCommit = false,
  p6Delivery = null,
}) => {
  if (!staged.length) return
  if (phase === 'p6-pre-terminal')
    fail('P6_INDEX_NOT_EMPTY', 'P6 candidate paths must remain unstaged', { staged })
  if (phase === 'p6-terminal') {
    if (p6Delivery?.mode === 'fully-staged-remote-correction-candidate') return
    const expectedLocalCount = finalLocalCommit ? 221 : 220
    if (
      localChanged.length === expectedLocalCount &&
      same(sortedUnique(staged), sortedUnique(localChanged)) &&
      !unstaged.length &&
      !untracked.length
    )
      return
    fail('P6_INDEX_NOT_EMPTY', 'P6 terminal index must stage the exact isolated candidate', {
      staged: sortedUnique(staged),
      unstaged: sortedUnique(unstaged),
      untracked: sortedUnique(untracked),
    })
  }
  if (phase !== 'p5-terminal')
    fail('INDEX_NOT_EMPTY', 'Pre-terminal P5 paths must remain unstaged', { staged })
  if (
    !same(sortedUnique(staged), sortedUnique(localChanged)) ||
    unstaged.length ||
    untracked.length
  )
    fail('P5_TERMINAL_INDEX_DRIFT', 'Terminal P5 index must stage the exact clean path contract', {
      changed: sortedUnique(changed),
      localChanged: sortedUnique(localChanged),
      staged: sortedUnique(staged),
      unstaged: sortedUnique(unstaged),
      untracked: sortedUnique(untracked),
    })
}
const validateHistoricalLegacyState = ({ root = ROOT, comparison }) => {
  if (!comparison.available) return { checked: false, deletedLegacy: 0 }
  const deletedLegacy = gitPaths(
    [
      'diff',
      '--diff-filter=D',
      '--name-only',
      comparison.baseline,
      '--',
      '.ai/skills',
      '.ai/rules',
    ],
    { cwd: root }
  )
  if (deletedLegacy.length)
    fail('LEGACY_ASSET_DRIFT', 'Legacy Skill or rule assets were deleted', { deletedLegacy })
  return { checked: true, deletedLegacy: 0 }
}
const validateBoundary = (
  lifecyclePhase,
  { root = ROOT, baseline = BASELINE, p6Paths = [] } = {}
) => {
  const localState = repositoryChangeState({ root })
  const comparison = resolveHistoricalComparison({ root, baseline })
  const boundaryMode = localState.dirty ? 'dirty-candidate' : 'committed-clean'
  if (localState.dirty && !comparison.available)
    fail(
      'BASELINE_OBJECT_UNAVAILABLE_FOR_DIRTY_CANDIDATE',
      'Dirty candidate validation requires the historical baseline object',
      comparison
    )
  const changed = comparison.available ? changedPathSet({ root, comparison }) : []
  const phase = inferBoundaryPhase(lifecyclePhase, changed)
  const p6Delivery =
    phase === 'p6-terminal'
      ? validateP6TerminalRepositorySnapshot(
          p6Paths,
          inspectP6DeliveryRepositoryState({ root, localState })
        )
      : null
  const protectedState = validateProtectedPaths(phase, {
    root,
    comparison,
    localState,
    p6Paths,
  })
  const legacyState = validateHistoricalLegacyState({ root, comparison })
  const contract = comparison.available
    ? validatePathContract({
        phase,
        actualPaths: changed,
        p6Paths,
        finalLocalCommit: phase === 'p6-terminal',
      })
    : {
        phase,
        actualCount: 0,
        mandatoryCount:
          phase === 'p6-terminal'
            ? p6FinalHistoricalBoundaryPaths(p6Paths).length
            : phase === 'p6-pre-terminal'
              ? p6BoundaryPaths(p6Paths).length
              : PATH_CONTRACTS[phase].mandatoryPaths.length,
        allowedCount:
          phase === 'p6-terminal'
            ? p6FinalHistoricalBoundaryPaths(p6Paths).length
            : phase === 'p6-pre-terminal'
              ? p6BoundaryPaths(p6Paths).length
              : PATH_CONTRACTS[phase].allowedPaths.length,
        allowedPaths:
          phase === 'p6-terminal'
            ? p6FinalHistoricalBoundaryPaths(p6Paths)
            : phase === 'p6-pre-terminal'
              ? p6BoundaryPaths(p6Paths)
              : [...PATH_CONTRACTS[phase].allowedPaths],
      }
  validateIndexContract({
    phase,
    changed,
    localChanged: localState.paths,
    staged: localState.staged,
    unstaged: localState.unstaged,
    untracked: localState.untracked,
    finalLocalCommit: phase === 'p6-terminal',
    p6Delivery,
  })
  const informational = comparison.available
    ? []
    : [
        {
          code: 'BASELINE_OBJECT_UNAVAILABLE_IN_SHALLOW_CLEAN_CHECKOUT',
          severity: 'info',
          message:
            'Historical P5 path comparison was skipped for a clean shallow checkout; current-state validation remained active',
          baseline,
        },
      ]
  return {
    ...contract,
    boundaryMode,
    localPathCount: localState.paths.length,
    stagedCount: localState.staged.length,
    historicalComparison: comparison,
    historicalLegacyState: legacyState,
    informational,
    p6Delivery,
    ...protectedState,
  }
}
const validateActivation = () => {
  const adapterManifest = readJson('.ai/protocol/adapter-manifest.json')
  exactKeys(
    adapterManifest.projectUi,
    [
      'schemaVersion',
      'source',
      'routingManifest',
      'scopeRegistry',
      'nodeRouter',
      'pythonFallback',
      'validator',
      'syncCommands',
      'activation',
    ],
    'PROJECT_UI_ADAPTER_SCHEMA',
    'adapterManifest.projectUi'
  )
  const expectedProjectUi = {
    schemaVersion: 'ccd-project-ui-adapter/v1',
    source: '.ai/skills/project-ui',
    routingManifest: '.ai/manifests/skill-routing.json',
    scopeRegistry: '.ai/manifests/routing-scopes.json',
    nodeRouter: '.ai/skills/codex/task-orchestrator/scripts/skill_router.mjs',
    pythonFallback: '.ai/skills/codex/task-orchestrator/scripts/skill_router.py',
    validator: 'scripts/governance/project-ui-routing-validate.mjs',
    syncCommands: {
      codex: 'pnpm ai:sync:codex',
      claude: 'pnpm ai:sync:claude',
      combined: 'pnpm ai:sync:skills',
    },
    activation: {
      genericUiPrimarySkill: 'project-ui',
      nodePrimary: true,
      pythonFallback: true,
      legacyGenericDesignChain: false,
    },
  }
  if (!same(adapterManifest.projectUi, expectedProjectUi))
    fail('PROJECT_UI_ADAPTER_ACTIVATION', 'projectUi adapter activation drifted')
  for (const client of ['Codex', 'Claude'])
    if (!adapterManifest.adapterMetadata?.[client]?.capabilityMatrix.includes('project-ui'))
      fail('PROJECT_UI_ADAPTER_CAPABILITY', `${client} omits project-ui capability`)
  const packageJson = readJson('package.json')
  const expectedScripts = {
    'ai:route:skills': 'node .ai/skills/codex/task-orchestrator/scripts/skill_router.mjs',
    'ai:route:skills:python': 'python3 .ai/skills/codex/task-orchestrator/scripts/skill_router.py',
    'ai:routing:validate': 'node scripts/governance/project-ui-routing-validate.mjs',
    'ai:sync:codex': 'node scripts/ai-sync-codex.mjs',
    'ai:sync:claude': 'node scripts/ai-sync-claude.mjs',
    'ai:sync:skills': 'node scripts/ai-sync-skills.mjs',
    'codex:preflight': 'node scripts/codex-preflight.mjs',
    'claude:preflight': 'node scripts/claude-preflight.mjs',
    'ai:rule-index': 'node scripts/generate-rule-index.mjs',
    'ai:rule-index:check': 'node scripts/generate-rule-index.mjs --check',
    'ai:protocol-adapters': 'node scripts/generate-ai-protocol-adapters.mjs',
    'ai:protocol-adapters:check': 'node scripts/generate-ai-protocol-adapters.mjs --check',
    'ai:sync:codex:check': 'node scripts/ai-sync-codex.mjs --check',
    'ai:sync:claude:check': 'node scripts/ai-sync-claude.mjs --check',
    'ai:sync:skills:check': 'node scripts/ai-sync-skills.mjs --check',
    'governance:gate': 'node scripts/governance/gate.mjs',
  }
  for (const [name, command] of Object.entries(expectedScripts))
    if (packageJson.scripts?.[name] !== command)
      fail('COMMAND_SURFACE_DRIFT', `${name} must equal ${command}`)
  const adapters = run(process.execPath, ['scripts/generate-ai-protocol-adapters.mjs', '--check'], {
    allowFailure: true,
  })
  if (adapters.status !== 0) fail('ADAPTER_OUTPUT_DRIFT', adapters.stderr || adapters.stdout)
  return { scripts: Object.keys(expectedScripts).length, generatedOutputs: 6 }
}

const createBoundaryFixtureRepo = temporaryRoot => {
  const sourceRoot = fs.mkdtempSync(path.join(temporaryRoot, 'boundary-source-'))
  run('git', ['init', '--quiet', '--initial-branch=main'], { cwd: sourceRoot })
  run('git', ['config', 'user.name', 'CCD Boundary Fixture'], { cwd: sourceRoot })
  run('git', ['config', 'user.email', 'ccd-boundary-fixture@example.invalid'], {
    cwd: sourceRoot,
  })
  writeFile(sourceRoot, 'fixture-retained.txt', 'retained\n')
  writeFile(sourceRoot, 'pnpm-lock.yaml', 'baseline lock\n')
  writeFile(sourceRoot, '.ai/rules/legacy-rule.mdc', 'legacy rule\n')
  run('git', ['add', '--', 'fixture-retained.txt', 'pnpm-lock.yaml', '.ai/rules/legacy-rule.mdc'], {
    cwd: sourceRoot,
  })
  run('git', ['commit', '--quiet', '-m', 'fixture baseline'], { cwd: sourceRoot })
  const baseline = run('git', ['rev-parse', 'HEAD'], { cwd: sourceRoot }).stdout.trim()

  for (const relPath of P5_TERMINAL_PATHS)
    writeFile(sourceRoot, relPath, `terminal fixture: ${relPath}\n`)
  run('git', ['add', '--', ...P5_TERMINAL_PATHS], { cwd: sourceRoot })
  run('git', ['commit', '--quiet', '-m', 'fixture terminal'], { cwd: sourceRoot })

  const cloneRepo = ({ label, shallow = false }) => {
    const root = path.join(
      temporaryRoot,
      `boundary-${label}-${crypto.randomBytes(4).toString('hex')}`
    )
    run(
      'git',
      [
        'clone',
        '--quiet',
        ...(shallow ? ['--depth=1'] : []),
        '--branch',
        'main',
        pathToFileURL(sourceRoot).href,
        root,
      ],
      { cwd: temporaryRoot }
    )
    return root
  }

  return { baseline, clone: cloneRepo }
}

const SELF_TEST_IDS = [
  'P5-ST-R001',
  'P5-ST-R002',
  'P5-ST-R003',
  'P5-ST-R004',
  'P5-ST-R005',
  'P5-ST-R006',
  'P5-ST-R007',
  'P5-ST-R008',
  'P5-ST-R009',
  'P5-ST-R010',
  'P5-ST-R011',
  'P5-ST-R012',
  'P5-ST-R013',
  'P5-ST-R014',
  'P5-ST-R015',
  'P5-ST-R016',
  'P5-ST-R017',
  'P5-ST-R018',
  'P5-ST-R019',
  'P5-ST-R020',
  'P5-ST-R021',
  'P5-ST-R022',
  'P5-ST-R023',
  'P5-ST-R024',
  'P5-ST-R025',
  'P5-ST-R026',
  'P5-ST-R027',
  'P5-ST-R028',
  'P5-ST-R029',
  'P5-ST-R030',
  'P5-ST-R031',
  'P5-ST-R032',
  'P5-ST-R033',
  'P5-ST-R034',
  'P5-ST-R035',
  'P5-ST-R036',
  'P5-ST-R037',
  'P5-ST-R038',
  'P5-ST-R039',
  'P5-ST-R040',
  'P5-ST-R041',
  'P5-ST-R042',
  'P5-ST-R043',
  'P5-ST-R044',
  'P5-ST-R045',
  'P5-ST-R046',
  'P5-ST-R047',
  'P5-ST-R048',
  'P5-ST-R049',
  'P5-ST-R050',
  'P5-ST-R051',
  'P5-ST-R052',
  'P5-ST-R053',
  'P5-ST-R054',
  'P5-ST-R055',
  'P5-ST-R056',
  'P5-ST-R057',
  'P5-ST-R058',
  'P5-ST-R059',
  'P5-ST-R060',
  'P5-ST-R061',
  'P5-ST-R062',
]
const FALSE_POSITIVE_TEST_IDS = Array.from(
  { length: 20 },
  (_, index) => `P5-ST-F${String(index + 1).padStart(3, '0')}`
)
const LIFECYCLE_TEST_IDS = [
  'lifecycle-valid-pre-terminal',
  'lifecycle-valid-terminal',
  'lifecycle-partial-terminal',
  'lifecycle-stale-terminal-negative',
  'lifecycle-false-source-scanner-claim',
  'lifecycle-false-page-contract-claim',
  'lifecycle-p3-count-drift',
  'lifecycle-p4-state-drift',
]
const BOUNDARY_TEST_IDS = [
  'boundary-valid-p4-baseline',
  'boundary-valid-p5-pre-terminal',
  'boundary-missing-p5-4-path',
  'boundary-unexpected-p5-4-path',
  'boundary-workspace-validator-accepted',
  'boundary-cold-start-validator-accepted',
  'boundary-p5-5-only-path-rejected',
  'boundary-valid-p5-terminal',
  'boundary-missing-p5-terminal-path',
  'boundary-unexpected-p5-terminal-path',
  'lifecycle-mixed-terminal',
]
const P6_BOUNDARY_TEST_IDS = [
  'boundary-valid-p6-pre-terminal',
  'boundary-missing-p6-path',
  'boundary-unexpected-p6-path',
  'boundary-alternative-p6-scanner-path',
  'boundary-staged-p6-rejected',
  'boundary-p6-phase-inference',
]
const P6_TERMINAL_TEST_IDS = [
  'boundary-valid-p6-terminal',
  'boundary-p6-terminal-missing-baseline',
  'boundary-p6-terminal-alternative-baseline',
  'boundary-p6-terminal-unexpected-path',
  'boundary-p6-terminal-staged-rejected',
  'boundary-p6-terminal-unknown-module',
  'boundary-p6-terminal-alternative-scanner',
  'boundary-p6-terminal-page-contract',
  'boundary-p6-terminal-apps-drift',
  'boundary-p6-terminal-packages-drift',
  'boundary-p6-terminal-github-drift',
  'boundary-p6-terminal-lockfile-drift',
  'artifact-valid-p6-terminal',
  'artifact-p6-terminal-missing-baseline',
  'artifact-p6-terminal-stale-identity',
  'artifact-p6-terminal-partial-marker',
  'artifact-p6-terminal-nonzero-exceptions',
  'artifact-p6-terminal-legacy-deletion',
  'artifact-p6-terminal-unknown-module',
  'artifact-p6-terminal-fixture-drift',
  'artifact-p6-terminal-alternative-scanner',
  'artifact-p6-terminal-alternative-baseline',
  'lifecycle-valid-p6-terminal',
  'lifecycle-partial-p6-terminal',
  'lifecycle-p6-terminal-page-contract',
]
const P6_DELIVERY_TEST_IDS = [
  'p6-delivery-exact-unstaged-terminal-workspace',
  'p6-delivery-exact-fully-staged-terminal-candidate',
  'p6-delivery-partial-staged-candidate',
  'p6-delivery-mixed-staged-unstaged-candidate',
  'p6-delivery-extra-staged-path',
  'p6-delivery-remaining-untracked-path',
  'p6-delivery-staged-deletion',
  'p6-delivery-exact-clean-committed-state',
  'p6-delivery-wrong-parent',
  'p6-delivery-two-local-commits',
]
const P6_FINAL_LOCAL_COMMIT_TEST_IDS = [
  'p6-final-exact-unstaged-candidate',
  'p6-final-exact-fully-staged-candidate',
  'p6-final-exact-clean-committed-state',
  'p6-final-hook-script-missing',
  'p6-final-extra-hook-config',
  'p6-final-lint-staged-config-changed',
  'p6-final-pre-commit-hook-changed',
  'p6-final-partial-staging',
  'p6-final-mixed-staging',
  'p6-final-remaining-untracked',
  'p6-final-staged-deletion',
  'p6-final-wrong-parent',
  'p6-final-two-local-commits',
]
const P6_REMOTE_CORRECTION_TEST_IDS = [
  'p6-correction-pushed-primary-full-history',
  'p6-correction-https-origin-normalized',
  'p6-correction-ssh-url-origin-normalized',
  'p6-correction-exact-unstaged-candidate',
  'p6-correction-exact-fully-staged-candidate',
  'p6-correction-exact-local-commit',
  'p6-correction-exact-pushed-full-history',
  'p6-correction-exact-pushed-shallow-event',
  'p6-correction-exact-pushed-shallow-head-event',
  'p6-correction-event-fix-exact-unstaged-candidate',
  'p6-correction-event-fix-exact-local-commit',
  'p6-correction-event-fix-exact-pushed-full-history',
  'p6-correction-event-fix-exact-pushed-shallow-head-event',
  'p6-correction-wrong-repository',
  'p6-correction-unsafe-http-origin',
  'p6-correction-credentialed-origin',
  'p6-correction-incomplete-staging',
  'p6-correction-unexpected-path',
  'p6-correction-wrong-parent',
  'p6-correction-subject-drift',
  'p6-correction-forced-push',
  'p6-correction-malformed-event',
  'p6-correction-wrong-event-repository',
  'p6-correction-wrong-event-ref',
  'p6-correction-shallow-event-missing',
  'p6-correction-push-head-missing',
  'p6-correction-push-head-drift',
  'p6-correction-push-head-conflict',
  'p6-correction-event-fix-subject-drift',
  'p6-correction-event-fix-wrong-before',
  'p6-correction-push-deletion',
]
export function runSelfTests({
  routingFixtures = readJson(FILES.routingFixtures),
  syncFixtures = readJson(FILES.syncFixtures),
  routingEvidence = null,
  syncEvidence = null,
  manifest = readJson(FILES.manifest),
  scopes = readJson(FILES.scopes),
  lock = generateSkillsLock(ROOT),
  temporaryRoot = null,
} = {}) {
  if (
    !temporaryRoot ||
    !path.resolve(temporaryRoot).startsWith(`${path.resolve(os.tmpdir())}${path.sep}`)
  )
    fail('ISOLATED_ROOT_REQUIRED', 'Self-tests require the owned temporary root')
  const declaredSelfTestIds = [
    ...SELF_TEST_IDS,
    ...FALSE_POSITIVE_TEST_IDS,
    ...BOUNDARY_TEST_IDS.slice(0, -1),
    ...P6_BOUNDARY_TEST_IDS,
    ...P6_TERMINAL_TEST_IDS,
    ...P6_DELIVERY_TEST_IDS,
    ...P6_FINAL_LOCAL_COMMIT_TEST_IDS,
    ...P6_REMOTE_CORRECTION_TEST_IDS,
    BOUNDARY_TEST_IDS.at(-1),
    ...LIFECYCLE_TEST_IDS,
  ]
  if (
    SELF_TEST_IDS.length !== 62 ||
    FALSE_POSITIVE_TEST_IDS.length !== 20 ||
    BOUNDARY_TEST_IDS.length !== 11 ||
    P6_BOUNDARY_TEST_IDS.length !== 6 ||
    P6_TERMINAL_TEST_IDS.length !== 25 ||
    P6_DELIVERY_TEST_IDS.length !== 10 ||
    P6_FINAL_LOCAL_COMMIT_TEST_IDS.length !== 13 ||
    P6_REMOTE_CORRECTION_TEST_IDS.length !== 31 ||
    LIFECYCLE_TEST_IDS.length !== 8 ||
    new Set(declaredSelfTestIds).size !== 186
  )
    fail('SELF_TEST_COUNT_DRIFT', 'Self-test inventory must contain exactly 186 unique IDs')
  const routingById = new Map(routingFixtures.cases.map(fixture => [fixture.id, fixture]))
  const executedRouting = new Set(routingEvidence?.nodeSuite?.caseIds ?? [])
  const syncById = new Map((syncEvidence?.records ?? []).map(record => [record.id, record]))
  const executed = []
  const execute = (id, operation) => {
    if (executed.some(record => record.id === id))
      fail('SELF_TEST_DUPLICATE_EXECUTION', `Self-test executed twice: ${id}`)
    operation()
    executed.push({ id, status: 'pass' })
  }
  const reject = (id, code, operation) => execute(id, () => assertErrorCode(code, operation))
  const resultCodes = result => [
    ...result.diagnostics.map(item => item.code),
    ...result.rejectedConflicts.map(item => item.code),
  ]
  const assertRouterCode = (result, code, label) => {
    if (!resultCodes(result).includes(code))
      fail('SELF_TEST_CODE_MISMATCH', `${label} did not produce ${code}`)
  }
  const requireRouting = (fixtureId, code = null) => {
    if (!executedRouting.has(fixtureId))
      fail('SELF_TEST_EVIDENCE_MISSING', `Routing fixture was not executed: ${fixtureId}`)
    const fixture = routingById.get(fixtureId)
    if (!fixture) fail('SELF_TEST_EVIDENCE_MISSING', `Routing fixture is absent: ${fixtureId}`)
    if (
      code &&
      ![...fixture.expected.diagnostics, ...fixture.expected.rejectedConflicts].some(
        item => item.code === code
      )
    )
      fail('SELF_TEST_CODE_MISMATCH', `${fixtureId} does not prove ${code}`)
  }
  const requireSync = (fixtureId, code = null) => {
    const record = syncById.get(fixtureId)
    if (!record) fail('SELF_TEST_EVIDENCE_MISSING', `Sync fixture was not executed: ${fixtureId}`)
    if (code && !record.diagnostics.includes(code))
      fail('SELF_TEST_CODE_MISMATCH', `${fixtureId} does not prove ${code}`)
    return record
  }
  const repositoryDocuments = loadLifecycleDocuments(ROOT)
  const terminalLifecycleMarkers = new Set([
    ...Object.keys(P5_TERMINAL),
    ...Object.keys(P6_TERMINAL),
  ])
  const preTerminalDocuments = repositoryDocuments.map(document => ({
    relPath: document.relPath,
    markers: new Map([
      ...[...document.markers].filter(([marker]) => !terminalLifecycleMarkers.has(marker)),
      ...Object.entries(P5_TERMINAL).filter(([, expected]) => expected === 'no'),
    ]),
  }))
  const terminalDocuments = repositoryDocuments.map(document => ({
    relPath: document.relPath,
    markers: new Map([
      ...[...document.markers].filter(([marker]) => !terminalLifecycleMarkers.has(marker)),
      ...Object.entries(P5_TERMINAL),
    ]),
  }))
  const p6TerminalDocuments = repositoryDocuments.map(document => ({
    relPath: document.relPath,
    markers: new Map([
      ...[...document.markers].filter(([marker]) => !terminalLifecycleMarkers.has(marker)),
      ...Object.entries(P6_TERMINAL),
    ]),
  }))
  const preTerminalLifecycleText = `## Lifecycle State\n\n\`\`\`text\n${[
    ...preTerminalDocuments[0].markers,
  ]
    .map(([marker, value]) => `${marker}=${value}`)
    .join('\n')}\n\`\`\``
  const copyCurrentFile = (root, relPath) => {
    const destination = path.join(root, relPath)
    fs.mkdirSync(path.dirname(destination), { recursive: true })
    fs.copyFileSync(path.join(ROOT, relPath), destination)
  }
  const createP6TerminalArtifactFixture = mutation => {
    const root = fs.mkdtempSync(path.join(temporaryRoot, 'p6-terminal-artifact-'))
    const fixturePaths = readJson('.ai/governance/ui/fixtures/source-cases.json').cases.map(
      item => item.fixturePath
    )
    for (const relPath of [
      ...P6_4_FIXED_PATHS,
      ...P6_SCANNER_MODULE_PATHS,
      ...fixturePaths,
      P6_BASELINE_PATH,
      '.ai/governance/policies/ui.json',
      '.ai/governance/ui/fixtures/schema-valid/ui-policy.json',
      '.ai/governance/ui/fixtures/rule-cases.json',
      '.ai/governance/coverage/project-ui-semantic-coverage.json',
      '.ai/governance/ui/exceptions.json',
      '.ai/manifests/skills-lock.json',
      ...LIFECYCLE_SOURCES,
    ])
      copyCurrentFile(root, relPath)
    const fixtureLock = readJsonAt(root, '.ai/manifests/skills-lock.json')
    for (const id of P6_LEGACY_SKILL_IDS)
      fs.mkdirSync(path.join(root, fixtureLock.skills[id].source.slice('repo:'.length)), {
        recursive: true,
      })
    fs.mkdirSync(path.join(root, '.ai/rules/core'), { recursive: true })
    fs.writeFileSync(path.join(root, '.ai/rules/core/fixture.mdc'), 'fixture\n', 'utf8')

    if (mutation === 'missing-baseline') fs.rmSync(path.join(root, P6_BASELINE_PATH))
    if (mutation === 'stale-identity') {
      const baseline = readJsonAt(root, P6_BASELINE_PATH)
      baseline.baselineCommit = '0'.repeat(40)
      fs.writeFileSync(path.join(root, P6_BASELINE_PATH), canonicalJson(baseline), 'utf8')
    }
    if (mutation === 'partial-marker') {
      const relPath = LIFECYCLE_SOURCES[0]
      const text = fs.readFileSync(path.join(root, relPath), 'utf8')
      fs.writeFileSync(
        path.join(root, relPath),
        text.replace('SOURCE_ENFORCEMENT_ACTIVE=yes', 'SOURCE_ENFORCEMENT_ACTIVE=no'),
        'utf8'
      )
    }
    if (mutation === 'real-exception') {
      const registry = readJsonAt(root, '.ai/governance/ui/exceptions.json')
      registry.exceptions.push({})
      fs.writeFileSync(
        path.join(root, '.ai/governance/ui/exceptions.json'),
        canonicalJson(registry),
        'utf8'
      )
    }
    if (mutation === 'legacy-deletion') {
      const source = fixtureLock.skills[P6_LEGACY_SKILL_IDS[0]].source.slice('repo:'.length)
      fs.rmSync(path.join(root, source), { recursive: true, force: true })
    }
    if (mutation === 'unknown-module')
      writeFile(root, '.ai/governance/ui/source-scanner/unexpected-module.mjs', 'fixture\n')
    if (mutation === 'fixture-drift') fs.rmSync(path.join(root, fixturePaths[0]))
    if (mutation === 'alternative-scanner')
      writeFile(root, '.ai/governance/ui/source_scanner/rogue.mjs', 'fixture\n')
    if (mutation === 'alternative-baseline')
      fs.renameSync(
        path.join(root, P6_BASELINE_PATH),
        path.join(root, '.ai/governance/ui/source-baseline-copy.json')
      )
    return { root, documents: loadLifecycleDocuments(root) }
  }
  const tracked = gitPaths(['ls-files'])
  let selfTestPythonInvocation = 0
  const routeWith = ({
    mutatedManifest = manifest,
    mutatedScopes = scopes,
    task = 'improve the layout hierarchy',
    paths = [],
  } = {}) =>
    routeTask(task, paths, {
      manifest: mutatedManifest,
      scopeRegistry: mutatedScopes,
      fixtureCases: routingFixtures.cases,
      skillsLock: lock,
      tracked,
      root: ROOT,
    })
  const assertNodePythonCode = ({
    mutatedManifest = manifest,
    mutatedScopes = scopes,
    task = 'improve the layout hierarchy',
    paths = [],
    code,
  }) => {
    const nodeResult = routeWith({ mutatedManifest, mutatedScopes, task, paths })
    assertRouterCode(nodeResult, code, 'Node router')
    selfTestPythonInvocation += 1
    const python = pythonRoute(
      {
        router: path.join(ROOT, FILES.pythonRouter),
        root: ROOT,
        task,
        paths,
        allowDualMotion: false,
        manifest: mutatedManifest,
        scopes: mutatedScopes,
        cases: routingFixtures.cases,
        lock,
        tracked,
      },
      path.join(temporaryRoot, `python-self-test-${selfTestPythonInvocation}.json`)
    )
    assertRouterCode(python.value, code, 'Python router')
    if (canonicalJson(nodeResult) !== python.text)
      fail('ROUTER_PARITY_DRIFT', 'Negative Node/Python self-test bytes differ')
  }

  reject('P5-ST-R001', 'MISSING_PROJECT_UI_LOCK', () => {
    const root = createSkillFixtureRepo(temporaryRoot)
    run('git', ['rm', '-q', '-r', '--cached', '--', '.ai/skills/project-ui'], { cwd: root })
    fs.rmSync(path.join(root, '.ai/skills/project-ui'), { recursive: true, force: true })
    generateSkillsLock(root)
  })
  reject('P5-ST-R002', 'DUPLICATE_PROJECT_UI_SINGLETON', () => {
    const root = createSkillFixtureRepo(temporaryRoot)
    writeFile(root, '.ai/skills/core/project-ui/SKILL.md', '---\nname: project-ui\n---\n')
    run('git', ['add', '--', '.ai/skills/core/project-ui/SKILL.md'], { cwd: root })
    generateSkillsLock(root)
  })
  const assertLockFresh = candidate => {
    if (candidate.skills?.['project-ui']?.computedHash !== lock.skills['project-ui'].computedHash)
      fail('STALE_PROJECT_UI_HASH', 'project-ui hash is stale')
    if (stringifySkillsLock(candidate) !== stringifySkillsLock(lock))
      fail('SKILLS_LOCK_STALE', 'Skills lock is stale')
  }
  reject('P5-ST-R003', 'STALE_PROJECT_UI_HASH', () => {
    const candidate = clone(lock)
    candidate.skills['project-ui'].computedHash = '0'.repeat(64)
    assertLockFresh(candidate)
  })
  reject('P5-ST-R004', 'UNKNOWN_SYNC_IMPLEMENTATION', () => {
    const candidate = clone(lock)
    candidate.skills['project-ui'].syncImplementations.codex = 'unknown-v1'
    validateSkillsLockForSync(candidate)
  })
  reject('P5-ST-R005', 'MISSING_SYNC_IMPLEMENTATION', () => {
    const candidate = clone(lock)
    delete candidate.skills['project-ui'].syncImplementations.codex
    validateSkillsLockForSync(candidate)
  })
  reject('P5-ST-R006', 'SKILLS_LOCK_STALE', () => {
    const candidate = clone(lock)
    candidate.generatedBy = 'stale-generator'
    assertLockFresh(candidate)
  })
  reject('P5-ST-R007', 'RULE_INDEX_STALE', () => {
    const candidate = buildRuleIndex({ root: ROOT })
    candidate.generatedBy = 'stale-generator'
    if (`${JSON.stringify(candidate, null, 2)}\n` !== readText(FILES.ruleIndex))
      fail('RULE_INDEX_STALE', 'Rule index is stale')
  })
  reject('P5-ST-R008', 'NON_UI_RULE_COVERAGE_REDUCED', () => {
    const candidate = buildRuleIndex({ root: ROOT })
    for (const rule of candidate.rules.filter(
      rule =>
        !rule.path.startsWith('.ai/rules/components/') &&
        !rule.path.startsWith('.ai/rules/design-system/')
    ))
      rule.effectiveScopeIds = []
    const count = candidate.rules.filter(
      rule =>
        !rule.path.startsWith('.ai/rules/components/') &&
        !rule.path.startsWith('.ai/rules/design-system/') &&
        rule.effectiveScopeIds.length > 0
    ).length
    if (count < 28) fail('NON_UI_RULE_COVERAGE_REDUCED', 'Non-UI rule coverage fell below 28')
  })
  reject('P5-ST-R009', 'ADAPTER_OUTPUT_STALE', () => {
    const adapter = loadAdapterManifest({ root: ROOT }).manifest
    const comparison = compareOutputs(adapter, renderAdapterOutputs(adapter, { root: ROOT }), {
      root: ROOT,
    })
    comparison[0].matches = false
    if (comparison.some(item => !item.matches))
      fail('ADAPTER_OUTPUT_STALE', 'Generated adapter output is stale')
  })
  const assertTargetContained = (root, candidate) => {
    const absoluteRoot = path.resolve(root)
    const absolute = path.resolve(candidate)
    if (absolute === absoluteRoot || !absolute.startsWith(`${absoluteRoot}${path.sep}`))
      fail('TARGET_ESCAPE', 'Target escapes isolated root')
  }
  reject('P5-ST-R010', 'TARGET_ESCAPE', () =>
    assertTargetContained(path.join(temporaryRoot, 'codex-root'), path.dirname(temporaryRoot))
  )
  reject('P5-ST-R011', 'TARGET_ESCAPE', () =>
    assertTargetContained(path.join(temporaryRoot, 'claude-root'), path.dirname(temporaryRoot))
  )
  execute('P5-ST-R012', () => requireSync('sync-source-symlink-rejected', 'SOURCE_SYMLINK_ESCAPE'))
  execute('P5-ST-R013', () =>
    requireSync('sync-codex-target-symlink-rejected', 'TARGET_SYMLINK_ESCAPE')
  )
  execute('P5-ST-R014', () =>
    requireSync('sync-claude-target-symlink-rejected', 'TARGET_SYMLINK_ESCAPE')
  )
  reject('P5-ST-R015', 'UNMANAGED_PATH_CHANGED', () => {
    const root = fs.mkdtempSync(path.join(temporaryRoot, 'unmanaged-'))
    writeFile(root, 'owner', 'sentinel', 0o755)
    const before = filesystemSnapshot(path.join(root, 'owner'))
    fs.rmSync(path.join(root, 'owner'))
    const after = filesystemSnapshot(path.join(root, 'owner'))
    if (!same(before, after)) fail('UNMANAGED_PATH_CHANGED', 'Unmanaged path changed')
  })
  reject('P5-ST-R016', 'PARTIAL_REPLACEMENT', () => {
    requireSync('sync-candidate-failure-before-replacement', 'INJECTED_CANDIDATE_FAILURE')
    const mutated = { replacedClients: ['claude'] }
    if (mutated.replacedClients.length)
      fail('PARTIAL_REPLACEMENT', 'Candidate failure left a partial replacement')
  })
  reject('P5-ST-R017', 'REAL_HOME_CHANGED', () => {
    const before = filesystemSnapshot(path.join(os.homedir(), '.codex', 'skills'))
    const after = {
      ...before,
      digest: before.digest === null ? 'created' : `${before.digest}-mutated`,
    }
    if (!same(before, after)) fail('REAL_HOME_CHANGED', 'Real HOME changed')
  })
  reject('P5-ST-R018', 'SOURCE_SCANNER_FALSE_POSITIVE', () => {
    const documents = clone(preTerminalDocuments)
    documents[0].markers.set('SOURCE_SCANNER_IMPLEMENTED', 'yes')
    validateLifecycleDocuments(documents)
  })
  reject('P5-ST-R019', 'PAGE_CONTRACT_FALSE_POSITIVE', () => {
    const documents = clone(preTerminalDocuments)
    documents[0].markers.set('PAGE_CONTRACT_CREATED', 'yes')
    validateLifecycleDocuments(documents)
  })
  reject('P5-ST-R020', 'P5_LIFECYCLE_STALE', () => {
    const fixtureRoot = path.join(temporaryRoot, 'lifecycle-stale-terminal')
    for (const document of repositoryDocuments)
      writeFile(fixtureRoot, document.relPath, document.text)

    const ownerRelPath = LIFECYCLE_SOURCES[0]
    const ownerPath = path.join(fixtureRoot, ownerRelPath)
    const ownerText = fs.readFileSync(ownerPath, 'utf8')
    const lifecycleBlock = ownerText.match(
      /## Lifecycle(?: State)?[\s\S]*?```text\n([\s\S]*?)\n```/u
    )?.[1]
    const currentMarker = 'PROJECT_UI_ROUTED=yes'
    const staleMarker = 'PROJECT_UI_ROUTED=no'
    if (!lifecycleBlock || lifecycleBlock.match(/^PROJECT_UI_ROUTED=yes$/gmu)?.length !== 1)
      fail('SELF_TEST_SETUP_FAILED', 'Canonical lifecycle marker was not uniquely addressable')
    const mutatedBlock = lifecycleBlock.replace(/^PROJECT_UI_ROUTED=yes$/mu, staleMarker)
    writeFile(fixtureRoot, ownerRelPath, ownerText.replace(lifecycleBlock, mutatedBlock))

    const readback = fs.readFileSync(ownerPath, 'utf8')
    const beforeMarkers = markerMap(ownerText)
    const readbackMarkers = markerMap(readback)
    const changedMarkers = [...beforeMarkers.keys()].filter(
      marker => beforeMarkers.get(marker) !== readbackMarkers.get(marker)
    )
    if (
      readback === ownerText ||
      !readback.includes(staleMarker) ||
      readbackMarkers.get('P5_COMPLETE') !== 'yes' ||
      readbackMarkers.get('PROJECT_UI_ROUTED') !== 'no' ||
      !same(changedMarkers, ['PROJECT_UI_ROUTED']) ||
      beforeMarkers.get('PROJECT_UI_ROUTED') !== currentMarker.split('=')[1]
    )
      fail('SELF_TEST_SETUP_FAILED', 'Stale terminal lifecycle mutation did not round-trip')

    const documents = loadLifecycleDocuments(fixtureRoot)
    if (inferPhase(documents) !== 'terminal')
      fail('SELF_TEST_SETUP_FAILED', 'Stale lifecycle fixture did not remain terminal')
    validateLifecycleDocuments(documents, { p6State: 'P6_TERMINAL' })
  })
  reject('P5-ST-R021', 'P3_COUNT_DRIFT', () => {
    const counts = clone(P3_COUNTS)
    counts.ruleCount -= 1
    validateP3Counts(counts)
  })
  reject('P5-ST-R022', 'P4_STATE_DRIFT', () => {
    const documents = clone(preTerminalDocuments)
    documents[0].markers.set('P4_COMPLETE', 'no')
    validateLifecycleDocuments(documents)
  })
  const routingRejections = [
    ['P5-ST-R023', 'mutation-unknown-skill', 'UNKNOWN_SKILL_ID'],
    ['P5-ST-R024', 'mutation-duplicate-route-id', 'DUPLICATE_ROUTE_ID'],
    ['P5-ST-R025', 'mutation-duplicate-scope-id', 'DUPLICATE_SCOPE_ID'],
    ['P5-ST-R026', 'mutation-unknown-scope-id', 'UNKNOWN_SCOPE_ID'],
    ['P5-ST-R027', 'mutation-dead-effective-glob', 'DEAD_EFFECTIVE_GLOB'],
    ['P5-ST-R028', 'mutation-invalid-exclusive-composition', 'INVALID_EXCLUSIVE_COMPOSITION'],
    ['P5-ST-R029', 'motion-dual-unauthorized', 'MOTION_DUAL_EVIDENCE_REQUIRED'],
    ['P5-ST-R030', 'motion-dual-insufficient', 'MOTION_DUAL_EVIDENCE_INSUFFICIENT'],
    ['P5-ST-R031', 'mutation-missing-project-ui-route', 'MISSING_PROJECT_UI_ROUTE'],
    ['P5-ST-R032', 'mutation-legacy-design-chain', 'LEGACY_GENERIC_DESIGN_CHAIN_REACTIVATED'],
    ['P5-ST-R033', 'mutation-missing-fixture-link', 'MISSING_FIXTURE_ID'],
    ['P5-ST-R034', 'mutation-duplicate-fixture-id', 'DUPLICATE_FIXTURE_ID'],
    ['P5-ST-R035', 'mutation-wrong-expected-skills', 'EXPECTED_SKILL_SET_MISMATCH'],
    ['P5-ST-R036', 'mutation-primary-priority-tie', 'PRIMARY_PRIORITY_TIE'],
    ['P5-ST-R037', 'mutation-branch-metadata', 'BRANCH_METADATA_FORBIDDEN'],
  ]
  for (const [id, fixtureId, code] of routingRejections)
    execute(id, () => requireRouting(fixtureId, code))
  reject('P5-ST-R038', 'ROUTER_PARITY_DRIFT', () => {
    const record = routingEvidence?.paritySuite?.records?.[0]
    if (!record) fail('SELF_TEST_EVIDENCE_MISSING', 'Parity evidence is absent')
    if (record.sha256 !== `${record.sha256}-mutated`)
      fail('ROUTER_PARITY_DRIFT', 'Node/Python parity drifted')
  })
  reject('P5-ST-R039', 'UNEXPECTED_REPORT_FILE', () => {
    const root = fs.mkdtempSync(path.join(temporaryRoot, 'default-output-'))
    const before = fs.readdirSync(root)
    const parsed = parseArgs([])
    const after = fs.readdirSync(root)
    if (parsed.jsonOutput !== null || !same(before, after))
      fail('UNEXPECTED_REPORT_FILE', 'Default validator invocation wrote a report')
    fail('UNEXPECTED_REPORT_FILE', 'Injected default report write was detected')
  })
  reject('P5-ST-R040', 'CLI_ARGUMENT_ERROR', () => parseArgs(['--json']))
  execute('P5-ST-R041', () => {
    const result = run(
      process.execPath,
      ['scripts/ai-sync-codex.mjs', '--json-output', path.join(temporaryRoot, 'unsupported.json')],
      { allowFailure: true }
    )
    if (result.status !== 2 || !`${result.stdout}${result.stderr}`.includes('CLI_ARGUMENT_ERROR'))
      fail('SELF_TEST_CODE_MISMATCH', 'Sync wrapper accepted --json-output')
  })
  reject('P5-ST-R042', 'OUTPUT_PATH_TRAVERSAL', () =>
    parseArgs(['--json-output', '../escape.json'])
  )
  execute('P5-ST-R043', () =>
    requireRouting('mutation-missing-route-field', 'ROUTE_SCHEMA_REQUIRED')
  )
  execute('P5-ST-R044', () =>
    requireRouting('mutation-additional-route-field', 'ROUTE_SCHEMA_ADDITIONAL_PROPERTY')
  )
  execute('P5-ST-R045', () => {
    const candidate = clone(manifest)
    candidate.routes[0].compositionMode = 'invalid'
    assertNodePythonCode({ mutatedManifest: candidate, code: 'ROUTE_SCHEMA_ENUM' })
  })
  execute('P5-ST-R046', () => {
    const candidate = clone(scopes)
    delete candidate.scopes[0].description
    assertNodePythonCode({ mutatedScopes: candidate, code: 'SCOPE_SCHEMA_REQUIRED' })
  })
  execute('P5-ST-R047', () => {
    const candidate = clone(scopes)
    candidate.scopes[0].unsupported = true
    assertNodePythonCode({ mutatedScopes: candidate, code: 'SCOPE_SCHEMA_ADDITIONAL_PROPERTY' })
  })
  execute('P5-ST-R048', () => {
    const candidate = clone(scopes)
    candidate.scopes[0].classification = 'invalid'
    assertNodePythonCode({ mutatedScopes: candidate, code: 'SCOPE_SCHEMA_ENUM' })
  })
  for (const [id, effectiveGlobs] of [
    ['P5-ST-R049', ['*']],
    ['P5-ST-R050', ['.ai/**']],
    ['P5-ST-R051', ['README.md']],
    ['P5-ST-R052', ['**/*.md']],
  ])
    execute(id, () => {
      const candidate = clone(scopes)
      candidate.scopes.find(scope => scope.id === 'repository-all-tracked').effectiveGlobs =
        effectiveGlobs
      assertNodePythonCode({ mutatedScopes: candidate, code: 'UNIVERSAL_SCOPE_MISMATCH' })
    })
  execute('P5-ST-R053', () => {
    for (const invalidPath of ['/absolute/file.vue', '../traversal.vue'])
      assertNodePythonCode({
        paths: [{ path: invalidPath, state: 'missing' }],
        code: 'INVALID_INPUT_PATH',
      })
  })
  execute('P5-ST-R054', () => {
    const candidate = clone(scopes)
    const scope = candidate.scopes.find(
      item => item.effectiveGlobs.length > 0 && item.id !== 'repository-all-tracked'
    )
    scope.effectiveGlobs = [scope.effectiveGlobs[0], scope.effectiveGlobs[0]]
    assertNodePythonCode({ mutatedScopes: candidate, code: 'DUPLICATE_EFFECTIVE_GLOB' })
  })
  reject('P5-ST-R055', 'SYNC_TEMP_RESIDUE', () => {
    const root = fs.mkdtempSync(path.join(temporaryRoot, 'residue-'))
    fs.mkdirSync(path.join(root, '.ccd-sync-project-ui.candidate-test'))
    const residue = scanSyncResidue(root)
    if (residue.candidates || residue.backups)
      fail('SYNC_TEMP_RESIDUE', 'Sync temporary residue remains')
  })
  reject('P5-ST-R056', 'PROJECT_UI_FILE_INVENTORY_DRIFT', () => {
    const root = createSkillFixtureRepo(temporaryRoot)
    writeFile(root, '.ai/skills/project-ui/EXTRA.md', 'extra\n')
    run('git', ['add', '--', '.ai/skills/project-ui/EXTRA.md'], { cwd: root })
    generateSkillsLock(root)
  })
  reject('P5-ST-R057', 'P5_TERMINAL_MARKER_DRIFT', () => {
    const documents = clone(terminalDocuments)
    const entries = [...documents[0].markers]
    const first = entries.findIndex(([marker]) => marker === 'P5_STARTED')
    const second = entries.findIndex(([marker]) => marker === 'P5_COMPLETE')
    ;[entries[first], entries[second]] = [entries[second], entries[first]]
    documents[0].markers = new Map(entries)
    validateLifecycleDocuments(documents)
  })
  reject('P5-ST-R058', 'LEGACY_ASSET_DRIFT', () => {
    const changedLegacyPaths = ['.ai/skills/design/ccd-material-system/SKILL.md']
    if (changedLegacyPaths.length)
      fail('LEGACY_ASSET_DRIFT', 'Legacy asset deletion or hash drift detected')
  })
  execute('P5-ST-R059', () => {
    const result = run(
      process.execPath,
      ['scripts/governance/cold-start-validate.mjs', '--self-test'],
      { allowFailure: true }
    )
    if (result.status !== 0)
      fail(
        'COLD_START_FALSE_POSITIVE_PROTECTION_LOST',
        'Cold-start historical false-positive self-test failed'
      )
  })

  const boundaryFixture = createBoundaryFixtureRepo(temporaryRoot)
  reject('P5-ST-R060', 'BASELINE_OBJECT_UNAVAILABLE_FOR_DIRTY_CANDIDATE', () => {
    const root = boundaryFixture.clone({ label: 'dirty-missing', shallow: true })
    writeFile(
      root,
      'scripts/governance/project-ui-routing-validate.mjs',
      'dirty shallow candidate\n'
    )
    validateBoundary('terminal', { root, baseline: boundaryFixture.baseline })
  })
  reject('P5-ST-R061', 'PROTECTED_TRACKED_PATH_DRIFT', () => {
    const root = boundaryFixture.clone({ label: 'protected-drift' })
    writeFile(root, 'pnpm-lock.yaml', 'protected drift\n')
    validateBoundary('terminal', { root, baseline: boundaryFixture.baseline })
  })
  reject('P5-ST-R062', 'P5_TERMINAL_INDEX_DRIFT', () => {
    const root = boundaryFixture.clone({ label: 'staged-drift' })
    writeFile(root, 'scripts/governance/project-ui-routing-validate.mjs', 'staged drift\n')
    writeFile(root, 'scripts/governance/cold-start-validate.mjs', 'unstaged drift\n')
    run('git', ['add', '--', 'scripts/governance/project-ui-routing-validate.mjs'], { cwd: root })
    validateBoundary('terminal', { root, baseline: boundaryFixture.baseline })
  })

  execute('P5-ST-F001', () => {
    if (normalizePath('.ai/manifests/skill-routing.json') !== '.ai/manifests/skill-routing.json')
      fail('SELF_TEST_FALSE_POSITIVE', 'Repository-relative path was rejected')
  })
  execute('P5-ST-F002', () => {
    if (
      markerMap(
        `${preTerminalLifecycleText}\ncommit efcfacd4536283d6b2b9bbe479aa4f7a9307eaab\n`
      ).get('P5_COMPLETE') === 'yes'
    )
      fail('SELF_TEST_FALSE_POSITIVE', 'Commit SHA text changed lifecycle')
  })
  execute('P5-ST-F003', () => {
    validateSchemaValue(readJson(FILES.manifestSchema), readJson(FILES.manifestSchema), manifest)
    validateSchemaValue(readJson(FILES.scopesSchema), readJson(FILES.scopesSchema), scopes)
  })
  execute('P5-ST-F004', () => {
    if (
      markerMap(`${preTerminalLifecycleText}\n## Historical Example\nP5_COMPLETE=yes\n`).get(
        'P5_COMPLETE'
      ) === 'yes'
    )
      fail('SELF_TEST_FALSE_POSITIVE', 'Historical lifecycle text activated P5')
  })
  execute('P5-ST-F005', () => {
    if (validateLifecycleDocuments(clone(preTerminalDocuments)) !== 'pre-terminal')
      fail('SELF_TEST_FALSE_POSITIVE', 'Explicit absence statement was treated as a positive claim')
  })
  execute('P5-ST-F006', () => {
    markerMap(`${readText(LIFECYCLE_SOURCES[0])}\nIgnored repository Claude target text.\n`)
  })
  execute('P5-ST-F007', () => {
    markerMap(`${readText(LIFECYCLE_SOURCES[0])}\nIgnored runtime copy text.\n`)
  })
  execute('P5-ST-F008', () => requireRouting('motion-gsap-only'))
  execute('P5-ST-F009', () => requireRouting('valid-multisurface'))
  execute('P5-ST-F010', () => requireRouting('motion-generic-only'))
  execute('P5-ST-F011', () => requireRouting('github-only'))
  execute('P5-ST-F012', () => requireRouting('tauri-only'))
  execute('P5-ST-F013', () => requireRouting('obsolete-single-root-nonactivation'))
  execute('P5-ST-F014', () =>
    requireSync('sync-personal-claude-shadow-observation', 'PERSONAL_CLAUDE_SHADOWS_PROJECT')
  )
  execute('P5-ST-F015', () => {
    if (
      parseArgs(['--json-output', path.join(temporaryRoot, 'allowed.json')]).jsonOutput !==
      path.join(temporaryRoot, 'allowed.json')
    )
      fail('SELF_TEST_FALSE_POSITIVE', 'Absolute temporary JSON output was rejected')
  })
  execute('P5-ST-F016', () => {
    if (validateLifecycleDocuments(clone(terminalDocuments)) !== 'terminal')
      fail('SELF_TEST_FALSE_POSITIVE', 'Valid terminal P3/P4 state was rejected')
  })
  execute('P5-ST-F017', () => {
    const root = boundaryFixture.clone({ label: 'clean-full' })
    const result = validateBoundary('terminal', { root, baseline: boundaryFixture.baseline })
    if (
      result.boundaryMode !== 'committed-clean' ||
      result.historicalComparison?.available !== true ||
      result.actualCount !== 50
    )
      fail('SELF_TEST_FALSE_POSITIVE', 'Clean full-history terminal checkout was not validated')
  })
  execute('P5-ST-F018', () => {
    const root = boundaryFixture.clone({ label: 'clean-shallow', shallow: true })
    const result = validateBoundary('terminal', { root, baseline: boundaryFixture.baseline })
    if (
      result.boundaryMode !== 'committed-clean' ||
      result.historicalComparison?.available !== false ||
      result.historicalComparison?.shallow !== true
    )
      fail('SELF_TEST_FALSE_POSITIVE', 'Clean shallow terminal checkout was not accepted')
  })
  execute('P5-ST-F019', () => {
    const root = boundaryFixture.clone({ label: 'clean-shallow-markers', shallow: true })
    if (validateLifecycleDocuments(clone(terminalDocuments)) !== 'terminal')
      fail('SELF_TEST_FALSE_POSITIVE', 'Clean shallow checkout skipped terminal markers')
    const result = validateBoundary('terminal', { root, baseline: boundaryFixture.baseline })
    if (result.phase !== 'p5-terminal')
      fail('SELF_TEST_FALSE_POSITIVE', 'Clean shallow terminal checkout lost terminal phase')
  })
  execute('P5-ST-F020', () => {
    const root = boundaryFixture.clone({ label: 'dirty-available' })
    writeFile(
      root,
      'scripts/governance/project-ui-routing-validate.mjs',
      'dirty full-history candidate\n'
    )
    const result = validateBoundary('terminal', { root, baseline: boundaryFixture.baseline })
    if (
      result.boundaryMode !== 'dirty-candidate' ||
      result.historicalComparison?.available !== true ||
      result.actualCount !== 50
    )
      fail('SELF_TEST_FALSE_POSITIVE', 'Dirty terminal candidate lost strict path validation')
  })

  const p5_4Fixture = [...P5_4_PATHS]
  const terminalFixture = [...P5_TERMINAL_PATHS]
  const p6FixturePaths = readJson('.ai/governance/ui/fixtures/source-cases.json').cases.map(
    item => item.fixturePath
  )
  const p6ArtifactFixture = sortedUnique([
    ...P6_4_FIXED_PATHS,
    ...P6_SCANNER_MODULE_PATHS,
    ...p6FixturePaths,
  ])
  const p6BoundaryFixture = sortedUnique([...terminalFixture, ...p6ArtifactFixture])

  execute('boundary-valid-p4-baseline', () =>
    validatePathContract({ phase: 'p4-baseline', actualPaths: [] })
  )
  execute('boundary-valid-p5-pre-terminal', () => {
    validatePathContract({ phase: 'p5-pre-terminal', actualPaths: p5_4Fixture })
    assertErrorCode('INDEX_NOT_EMPTY', () =>
      validateIndexContract({
        phase: 'p5-pre-terminal',
        changed: p5_4Fixture,
        staged: p5_4Fixture,
        unstaged: [],
        untracked: [],
      })
    )
  })
  reject('boundary-missing-p5-4-path', 'MANDATORY_PATH_MISSING', () =>
    validatePathContract({ phase: 'p5-pre-terminal', actualPaths: p5_4Fixture.slice(1) })
  )
  reject('boundary-unexpected-p5-4-path', 'UNAUTHORIZED_CHANGED_PATH', () =>
    validatePathContract({
      phase: 'p5-pre-terminal',
      actualPaths: [...p5_4Fixture, 'unexpected-p5-4.txt'],
    })
  )
  execute('boundary-workspace-validator-accepted', () => {
    const result = validatePathContract({ phase: 'p5-pre-terminal', actualPaths: p5_4Fixture })
    if (!result.allowedPaths.includes('scripts/validate-workspace.mjs'))
      fail('SELF_TEST_BOUNDARY', 'Workspace validator is absent from the P5.4 contract')
  })
  execute('boundary-cold-start-validator-accepted', () => {
    const result = validatePathContract({ phase: 'p5-pre-terminal', actualPaths: p5_4Fixture })
    if (!result.allowedPaths.includes('scripts/governance/cold-start-validate.mjs'))
      fail('SELF_TEST_BOUNDARY', 'Cold-start validator is absent from the P5.4 contract')
  })
  reject('boundary-p5-5-only-path-rejected', 'UNAUTHORIZED_CHANGED_PATH', () =>
    validatePathContract({
      phase: 'p5-pre-terminal',
      actualPaths: [...p5_4Fixture, 'wiki/canonical/design/project-ui-routing.md'],
    })
  )
  execute('boundary-valid-p5-terminal', () => {
    const result = validatePathContract({ phase: 'p5-terminal', actualPaths: terminalFixture })
    if (result.actualCount !== 50)
      fail('SELF_TEST_BOUNDARY', 'Terminal fixture does not contain exactly 50 paths')
    validateIndexContract({
      phase: 'p5-terminal',
      changed: terminalFixture,
      staged: terminalFixture,
      unstaged: [],
      untracked: [],
    })
    assertErrorCode('P5_TERMINAL_INDEX_DRIFT', () =>
      validateIndexContract({
        phase: 'p5-terminal',
        changed: terminalFixture,
        staged: terminalFixture.slice(1),
        unstaged: [],
        untracked: [],
      })
    )
    assertErrorCode('P5_TERMINAL_INDEX_DRIFT', () =>
      validateIndexContract({
        phase: 'p5-terminal',
        changed: terminalFixture,
        staged: terminalFixture,
        unstaged: [terminalFixture[0]],
        untracked: [],
      })
    )
    assertErrorCode('P5_TERMINAL_INDEX_DRIFT', () =>
      validateIndexContract({
        phase: 'p5-terminal',
        changed: terminalFixture,
        staged: terminalFixture,
        unstaged: [],
        untracked: ['unexpected-p5-terminal.txt'],
      })
    )
  })
  reject('boundary-missing-p5-terminal-path', 'MANDATORY_PATH_MISSING', () =>
    validatePathContract({ phase: 'p5-terminal', actualPaths: terminalFixture.slice(1) })
  )
  reject('boundary-unexpected-p5-terminal-path', 'UNAUTHORIZED_CHANGED_PATH', () =>
    validatePathContract({
      phase: 'p5-terminal',
      actualPaths: [...terminalFixture, 'unexpected-p5-terminal.txt'],
    })
  )
  execute('boundary-valid-p6-pre-terminal', () => {
    const result = validatePathContract({
      phase: 'p6-pre-terminal',
      actualPaths: p6BoundaryFixture,
      p6Paths: p6ArtifactFixture,
    })
    if (result.actualCount !== 249)
      fail('SELF_TEST_BOUNDARY', 'P6 pre-terminal fixture does not contain exactly 249 paths')
  })
  reject('boundary-missing-p6-path', 'P6_PATH_MISSING', () =>
    validatePathContract({
      phase: 'p6-pre-terminal',
      actualPaths: p6BoundaryFixture.slice(1),
      p6Paths: p6ArtifactFixture,
    })
  )
  reject('boundary-unexpected-p6-path', 'P6_UNAUTHORIZED_CHANGED_PATH', () =>
    validatePathContract({
      phase: 'p6-pre-terminal',
      actualPaths: [...p6BoundaryFixture, 'unexpected-p6-path.txt'],
      p6Paths: p6ArtifactFixture,
    })
  )
  reject('boundary-alternative-p6-scanner-path', 'P6_ALTERNATIVE_SCANNER_PATH', () =>
    validatePathContract({
      phase: 'p6-pre-terminal',
      actualPaths: [...p6BoundaryFixture, '.ai/governance/ui/source_scanner/rogue.mjs'],
      p6Paths: p6ArtifactFixture,
    })
  )
  reject('boundary-staged-p6-rejected', 'P6_INDEX_NOT_EMPTY', () =>
    validateIndexContract({
      phase: 'p6-pre-terminal',
      changed: p6BoundaryFixture,
      staged: [p6BoundaryFixture[0]],
      unstaged: p6BoundaryFixture.slice(1),
      untracked: [],
    })
  )
  execute('boundary-p6-phase-inference', () => {
    if (inferBoundaryPhase('terminal', p6BoundaryFixture) !== 'p6-pre-terminal')
      fail('SELF_TEST_BOUNDARY', 'P6 artifact evidence did not select p6-pre-terminal')
  })

  const p6TerminalArtifactFixture = sortedUnique([...p6ArtifactFixture, P6_BASELINE_PATH])
  const p6TerminalBoundaryFixture = sortedUnique([...terminalFixture, ...p6TerminalArtifactFixture])
  execute('boundary-valid-p6-terminal', () => {
    const result = validatePathContract({
      phase: 'p6-terminal',
      actualPaths: p6TerminalBoundaryFixture,
      p6Paths: p6TerminalArtifactFixture,
    })
    if (result.actualCount !== 250 || result.mandatoryCount !== 250 || result.allowedCount !== 250)
      fail('SELF_TEST_BOUNDARY', 'P6 terminal fixture does not preserve the 250-path contract')
  })
  reject('boundary-p6-terminal-missing-baseline', 'P6_PATH_MISSING', () =>
    validatePathContract({
      phase: 'p6-terminal',
      actualPaths: p6TerminalBoundaryFixture.filter(relPath => relPath !== P6_BASELINE_PATH),
      p6Paths: p6TerminalArtifactFixture,
    })
  )
  reject('boundary-p6-terminal-alternative-baseline', 'P6_ALTERNATIVE_SCANNER_PATH', () =>
    validatePathContract({
      phase: 'p6-terminal',
      actualPaths: [
        ...p6TerminalBoundaryFixture.filter(relPath => relPath !== P6_BASELINE_PATH),
        '.ai/governance/ui/source-baseline-copy.json',
      ],
      p6Paths: p6TerminalArtifactFixture,
    })
  )
  reject('boundary-p6-terminal-unexpected-path', 'P6_UNAUTHORIZED_CHANGED_PATH', () =>
    validatePathContract({
      phase: 'p6-terminal',
      actualPaths: [...p6TerminalBoundaryFixture, 'unexpected-p6-terminal.txt'],
      p6Paths: p6TerminalArtifactFixture,
    })
  )
  reject('boundary-p6-terminal-staged-rejected', 'P6_INDEX_NOT_EMPTY', () =>
    validateIndexContract({
      phase: 'p6-terminal',
      changed: p6TerminalBoundaryFixture,
      staged: [p6TerminalBoundaryFixture[0]],
      unstaged: p6TerminalBoundaryFixture.slice(1),
      untracked: [],
    })
  )
  reject('boundary-p6-terminal-unknown-module', 'P6_UNEXPECTED_SCANNER_MODULE', () =>
    validatePathContract({
      phase: 'p6-terminal',
      actualPaths: [
        ...p6TerminalBoundaryFixture,
        '.ai/governance/ui/source-scanner/unexpected-module.mjs',
      ],
      p6Paths: p6TerminalArtifactFixture,
    })
  )
  reject('boundary-p6-terminal-alternative-scanner', 'P6_ALTERNATIVE_SCANNER_PATH', () =>
    validatePathContract({
      phase: 'p6-terminal',
      actualPaths: [...p6TerminalBoundaryFixture, '.ai/governance/ui/source_scanner/rogue.mjs'],
      p6Paths: p6TerminalArtifactFixture,
    })
  )
  reject('boundary-p6-terminal-page-contract', 'FORBIDDEN_ALTERNATIVE_PRESENT', () =>
    validatePathContract({
      phase: 'p6-terminal',
      actualPaths: [...p6TerminalBoundaryFixture, PAGE_CONTRACT_PATHS[1]],
      p6Paths: p6TerminalArtifactFixture,
    })
  )
  for (const [id, relPath] of [
    ['boundary-p6-terminal-apps-drift', 'apps/web-demo/src/rogue.ts'],
    ['boundary-p6-terminal-packages-drift', 'packages/core/src/rogue.ts'],
    ['boundary-p6-terminal-github-drift', '.github/workflows/rogue.yml'],
    ['boundary-p6-terminal-lockfile-drift', 'pnpm-lock.yaml'],
  ])
    reject(id, 'P6_UNAUTHORIZED_CHANGED_PATH', () =>
      validatePathContract({
        phase: 'p6-terminal',
        actualPaths: [...p6TerminalBoundaryFixture, relPath],
        p6Paths: p6TerminalArtifactFixture,
      })
    )

  const validateTerminalArtifactFixture = mutation => {
    const fixture = createP6TerminalArtifactFixture(mutation)
    return validateP6ArtifactState(fixture.root, fixture.documents)
  }
  execute('artifact-valid-p6-terminal', () => {
    const artifact = validateTerminalArtifactFixture(null)
    if (artifact.state !== 'P6_TERMINAL' || artifact.p6Paths.length !== 206)
      fail('SELF_TEST_LIFECYCLE', 'Valid P6 terminal artifacts were rejected')
  })
  reject('artifact-p6-terminal-missing-baseline', 'P6_PREMATURE_TERMINAL', () =>
    validateTerminalArtifactFixture('missing-baseline')
  )
  reject('artifact-p6-terminal-stale-identity', 'P6_BASELINE_IDENTITY_DRIFT', () =>
    validateTerminalArtifactFixture('stale-identity')
  )
  reject('artifact-p6-terminal-partial-marker', 'P6_TERMINAL_PARTIAL', () =>
    validateTerminalArtifactFixture('partial-marker')
  )
  reject('artifact-p6-terminal-nonzero-exceptions', 'P6_REAL_EXCEPTION_PRESENT', () =>
    validateTerminalArtifactFixture('real-exception')
  )
  reject('artifact-p6-terminal-legacy-deletion', 'P6_LEGACY_ASSET_DRIFT', () =>
    validateTerminalArtifactFixture('legacy-deletion')
  )
  reject('artifact-p6-terminal-unknown-module', 'P6_UNEXPECTED_SCANNER_MODULE', () =>
    validateTerminalArtifactFixture('unknown-module')
  )
  reject('artifact-p6-terminal-fixture-drift', 'P6_FIXTURE_SET_DRIFT', () =>
    validateTerminalArtifactFixture('fixture-drift')
  )
  reject('artifact-p6-terminal-alternative-scanner', 'P6_ALTERNATIVE_SCANNER_PATH', () =>
    validateTerminalArtifactFixture('alternative-scanner')
  )
  reject('artifact-p6-terminal-alternative-baseline', 'P6_ALTERNATIVE_SCANNER_PATH', () =>
    validateTerminalArtifactFixture('alternative-baseline')
  )
  execute('lifecycle-valid-p6-terminal', () => {
    if (
      validateLifecycleDocuments(clone(p6TerminalDocuments), {
        p6State: 'P6_TERMINAL',
      }) !== 'terminal'
    )
      fail('SELF_TEST_LIFECYCLE', 'Valid P6 terminal lifecycle was rejected')
  })
  reject('lifecycle-partial-p6-terminal', 'P6_TERMINAL_PARTIAL', () => {
    const documents = clone(p6TerminalDocuments)
    documents[0].markers.set('SOURCE_ENFORCEMENT_ACTIVE', 'no')
    validateLifecycleDocuments(documents, { p6State: 'P6_TERMINAL' })
  })
  reject('lifecycle-p6-terminal-page-contract', 'PAGE_CONTRACT_FALSE_POSITIVE', () => {
    const documents = clone(p6TerminalDocuments)
    documents[0].markers.set('PAGE_CONTRACT_CREATED', 'yes')
    validateLifecycleDocuments(documents, { p6State: 'P6_TERMINAL' })
  })
  const deliveryPaths = p6DeliveryPaths(p6TerminalArtifactFixture)
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
  execute('p6-delivery-exact-unstaged-terminal-workspace', () =>
    validateP6DeliverySnapshot(p6TerminalArtifactFixture, deliveryAuthority)
  )
  execute('p6-delivery-exact-fully-staged-terminal-candidate', () =>
    validateP6DeliverySnapshot(p6TerminalArtifactFixture, {
      ...deliveryAuthority,
      staged: deliveryPaths,
      unstaged: [],
      untracked: [],
    })
  )
  reject('p6-delivery-partial-staged-candidate', 'P6_DELIVERY_PATH_SET_DRIFT', () =>
    validateP6DeliverySnapshot(p6TerminalArtifactFixture, {
      ...deliveryAuthority,
      staged: deliveryPaths.slice(0, 1),
      unstaged: [],
      untracked: [],
    })
  )
  reject('p6-delivery-mixed-staged-unstaged-candidate', 'P6_DELIVERY_INDEX_DRIFT', () =>
    validateP6DeliverySnapshot(p6TerminalArtifactFixture, {
      ...deliveryAuthority,
      staged: deliveryPaths.slice(0, 1),
      unstaged: deliveryPaths.slice(1, 20),
      untracked: deliveryPaths.slice(20),
    })
  )
  reject('p6-delivery-extra-staged-path', 'P6_DELIVERY_PATH_SET_DRIFT', () =>
    validateP6DeliverySnapshot(p6TerminalArtifactFixture, {
      ...deliveryAuthority,
      staged: [...deliveryPaths, 'unexpected-p6-delivery.txt'],
      unstaged: [],
      untracked: [],
    })
  )
  reject('p6-delivery-remaining-untracked-path', 'P6_DELIVERY_PATH_SET_DRIFT', () =>
    validateP6DeliverySnapshot(p6TerminalArtifactFixture, {
      ...deliveryAuthority,
      staged: deliveryPaths,
      unstaged: [],
      untracked: ['unexpected-p6-delivery.txt'],
    })
  )
  reject('p6-delivery-staged-deletion', 'P6_DELIVERY_DELETION', () =>
    validateP6DeliverySnapshot(p6TerminalArtifactFixture, {
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
  execute('p6-delivery-exact-clean-committed-state', () =>
    validateP6DeliverySnapshot(p6TerminalArtifactFixture, committedDelivery)
  )
  reject('p6-delivery-wrong-parent', 'P6_DELIVERY_COMMIT_TOPOLOGY', () =>
    validateP6DeliverySnapshot(p6TerminalArtifactFixture, {
      ...committedDelivery,
      headParent: '2222222222222222222222222222222222222222',
    })
  )
  reject('p6-delivery-two-local-commits', 'P6_DELIVERY_COMMIT_TOPOLOGY', () =>
    validateP6DeliverySnapshot(p6TerminalArtifactFixture, { ...committedDelivery, ahead: 2 })
  )

  const finalLocalCommitAuthority = {
    ...deliveryAuthority,
    unstaged: [],
    untracked: [],
  }
  execute('p6-final-exact-unstaged-candidate', () => {
    const finalPaths = p6FinalLocalCommitPaths(p6TerminalArtifactFixture)
    const finalHistoricalPaths = p6FinalHistoricalBoundaryPaths(p6TerminalArtifactFixture)
    const boundary = validatePathContract({
      phase: 'p6-terminal',
      actualPaths: finalHistoricalPaths,
      p6Paths: p6TerminalArtifactFixture,
      finalLocalCommit: true,
    })
    if (boundary.actualCount !== 251 || boundary.allowedCount !== 251)
      fail('SELF_TEST_BOUNDARY', 'P6.6 final historical boundary must contain 251 paths')
    validateP6FinalLocalCommitSnapshot(p6TerminalArtifactFixture, {
      ...finalLocalCommitAuthority,
      unstaged: finalPaths.slice(0, 21),
      untracked: finalPaths.slice(21),
    })
  })
  execute('p6-final-exact-fully-staged-candidate', () => {
    const finalPaths = p6FinalLocalCommitPaths(p6TerminalArtifactFixture)
    validateP6FinalLocalCommitSnapshot(p6TerminalArtifactFixture, {
      ...finalLocalCommitAuthority,
      staged: finalPaths,
    })
  })
  const finalCommittedPaths = p6FinalLocalCommitPaths(p6TerminalArtifactFixture)
  const finalCommittedAuthority = {
    ...finalLocalCommitAuthority,
    head: '3333333333333333333333333333333333333333',
    headParent: P6_BASELINE_COMMIT,
    ahead: 1,
    committedPaths: finalCommittedPaths,
  }
  execute('p6-final-exact-clean-committed-state', () =>
    validateP6FinalLocalCommitSnapshot(p6TerminalArtifactFixture, finalCommittedAuthority)
  )
  reject('p6-final-hook-script-missing', 'P6_DELIVERY_PATH_SET_DRIFT', () =>
    validateP6FinalLocalCommitSnapshot(p6TerminalArtifactFixture, {
      ...finalLocalCommitAuthority,
      staged: deliveryPaths,
    })
  )
  for (const [id, relPath] of [
    ['p6-final-extra-hook-config', 'scripts/lint-staged-extra.mjs'],
    ['p6-final-lint-staged-config-changed', 'lint-staged.config.mjs'],
    ['p6-final-pre-commit-hook-changed', '.husky/pre-commit'],
  ])
    reject(id, 'P6_DELIVERY_PATH_SET_DRIFT', () =>
      validateP6FinalLocalCommitSnapshot(p6TerminalArtifactFixture, {
        ...finalLocalCommitAuthority,
        staged: [...finalCommittedPaths, relPath],
      })
    )
  reject('p6-final-partial-staging', 'P6_DELIVERY_PATH_SET_DRIFT', () =>
    validateP6FinalLocalCommitSnapshot(p6TerminalArtifactFixture, {
      ...finalLocalCommitAuthority,
      staged: finalCommittedPaths.slice(0, 1),
    })
  )
  reject('p6-final-mixed-staging', 'P6_DELIVERY_INDEX_DRIFT', () =>
    validateP6FinalLocalCommitSnapshot(p6TerminalArtifactFixture, {
      ...finalLocalCommitAuthority,
      staged: finalCommittedPaths.slice(0, 1),
      unstaged: finalCommittedPaths.slice(1, 21),
      untracked: finalCommittedPaths.slice(21),
    })
  )
  reject('p6-final-remaining-untracked', 'P6_DELIVERY_PATH_SET_DRIFT', () =>
    validateP6FinalLocalCommitSnapshot(p6TerminalArtifactFixture, {
      ...finalLocalCommitAuthority,
      staged: finalCommittedPaths,
      untracked: ['unexpected-p6-final.txt'],
    })
  )
  reject('p6-final-staged-deletion', 'P6_DELIVERY_DELETION', () =>
    validateP6FinalLocalCommitSnapshot(p6TerminalArtifactFixture, {
      ...finalLocalCommitAuthority,
      staged: finalCommittedPaths,
      deleted: [finalCommittedPaths[0]],
    })
  )
  reject('p6-final-wrong-parent', 'P6_DELIVERY_COMMIT_TOPOLOGY', () =>
    validateP6FinalLocalCommitSnapshot(p6TerminalArtifactFixture, {
      ...finalCommittedAuthority,
      headParent: '4444444444444444444444444444444444444444',
    })
  )
  reject('p6-final-two-local-commits', 'P6_DELIVERY_COMMIT_TOPOLOGY', () =>
    validateP6FinalLocalCommitSnapshot(p6TerminalArtifactFixture, {
      ...finalCommittedAuthority,
      ahead: 2,
    })
  )

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
  }
  const pushCommit = {
    id: correctionHead,
    distinct: true,
    added: [],
    modified: [...P6_CORRECTION_PATHS],
    removed: [],
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
  }
  const repairPushCommit = {
    id: correctionRepairHead,
    distinct: true,
    added: [],
    modified: [...P6_CORRECTION_PATHS],
    removed: [],
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

  execute('p6-correction-pushed-primary-full-history', () =>
    validateP6TerminalRepositorySnapshot(p6TerminalArtifactFixture, primaryRemoteAuthority)
  )
  execute('p6-correction-https-origin-normalized', () =>
    validateP6TerminalRepositorySnapshot(p6TerminalArtifactFixture, {
      ...primaryRemoteAuthority,
      originUrl: 'https://github.com/ichichuang/ccd.git',
    })
  )
  execute('p6-correction-ssh-url-origin-normalized', () =>
    validateP6TerminalRepositorySnapshot(p6TerminalArtifactFixture, {
      ...primaryRemoteAuthority,
      originUrl: 'ssh://git@github.com/ichichuang/ccd.git',
    })
  )
  execute('p6-correction-exact-unstaged-candidate', () =>
    validateP6TerminalRepositorySnapshot(p6TerminalArtifactFixture, {
      ...correctionLocalAuthority,
      unstaged: [...P6_CORRECTION_PATHS],
    })
  )
  execute('p6-correction-exact-fully-staged-candidate', () =>
    validateP6TerminalRepositorySnapshot(p6TerminalArtifactFixture, {
      ...correctionLocalAuthority,
      staged: [...P6_CORRECTION_PATHS],
    })
  )
  execute('p6-correction-exact-local-commit', () =>
    validateP6TerminalRepositorySnapshot(p6TerminalArtifactFixture, correctionCommittedAuthority)
  )
  execute('p6-correction-exact-pushed-full-history', () =>
    validateP6TerminalRepositorySnapshot(p6TerminalArtifactFixture, correctionRemoteAuthority)
  )
  execute('p6-correction-exact-pushed-shallow-event', () =>
    validateP6TerminalRepositorySnapshot(p6TerminalArtifactFixture, correctionShallowAuthority)
  )
  execute('p6-correction-exact-pushed-shallow-head-event', () =>
    validateP6TerminalRepositorySnapshot(p6TerminalArtifactFixture, {
      ...correctionShallowAuthority,
      github: correctionHeadGitHub,
    })
  )
  execute('p6-correction-event-fix-exact-unstaged-candidate', () =>
    validateP6TerminalRepositorySnapshot(p6TerminalArtifactFixture, {
      ...correctionRepairLocalAuthority,
      unstaged: [...P6_CORRECTION_PATHS],
    })
  )
  execute('p6-correction-event-fix-exact-local-commit', () =>
    validateP6TerminalRepositorySnapshot(p6TerminalArtifactFixture, correctionRepairCommittedAuthority)
  )
  execute('p6-correction-event-fix-exact-pushed-full-history', () =>
    validateP6TerminalRepositorySnapshot(p6TerminalArtifactFixture, correctionRepairRemoteAuthority)
  )
  execute('p6-correction-event-fix-exact-pushed-shallow-head-event', () =>
    validateP6TerminalRepositorySnapshot(p6TerminalArtifactFixture, correctionRepairShallowAuthority)
  )
  reject('p6-correction-wrong-repository', 'P6_DELIVERY_REPOSITORY_IDENTITY', () =>
    validateP6TerminalRepositorySnapshot(p6TerminalArtifactFixture, {
      ...correctionLocalAuthority,
      originUrl: 'git@github.com:someone/else.git',
      unstaged: [...P6_CORRECTION_PATHS],
    })
  )
  for (const [id, originUrl] of [
    ['p6-correction-unsafe-http-origin', 'http://github.com/ichichuang/ccd.git'],
    ['p6-correction-credentialed-origin', 'https://token@github.com/ichichuang/ccd.git'],
  ])
    reject(id, 'P6_DELIVERY_REPOSITORY_IDENTITY', () =>
      validateP6TerminalRepositorySnapshot(p6TerminalArtifactFixture, {
        ...correctionLocalAuthority,
        originUrl,
        unstaged: [...P6_CORRECTION_PATHS],
      })
    )
  reject('p6-correction-incomplete-staging', 'P6_CORRECTION_INDEX_DRIFT', () =>
    validateP6TerminalRepositorySnapshot(p6TerminalArtifactFixture, {
      ...correctionLocalAuthority,
      staged: P6_CORRECTION_PATHS.slice(0, 1),
      unstaged: P6_CORRECTION_PATHS.slice(1),
    })
  )
  reject('p6-correction-unexpected-path', 'P6_CORRECTION_PATH_SET_DRIFT', () =>
    validateP6TerminalRepositorySnapshot(p6TerminalArtifactFixture, {
      ...correctionLocalAuthority,
      unstaged: [...P6_CORRECTION_PATHS, 'unexpected-p6-correction.txt'],
    })
  )
  reject('p6-correction-wrong-parent', 'P6_CORRECTION_COMMIT_TOPOLOGY', () =>
    validateP6TerminalRepositorySnapshot(p6TerminalArtifactFixture, {
      ...correctionRemoteAuthority,
      headParent: P6_BASELINE_COMMIT,
      headParents: [P6_BASELINE_COMMIT],
    })
  )
  reject('p6-correction-subject-drift', 'P6_CORRECTION_COMMIT_TOPOLOGY', () =>
    validateP6TerminalRepositorySnapshot(p6TerminalArtifactFixture, {
      ...correctionRemoteAuthority,
      headSubject: 'fix(governance): wrong subject',
    })
  )
  reject('p6-correction-forced-push', 'P6_CORRECTION_FORCED_PUSH', () => {
    const github = clone(correctionGitHub)
    github.event.forced = true
    validateP6TerminalRepositorySnapshot(p6TerminalArtifactFixture, {
      ...correctionShallowAuthority,
      github,
    })
  })
  reject('p6-correction-malformed-event', 'P6_CORRECTION_EVENT_INVALID', () => {
    const github = clone(correctionGitHub)
    github.event.commits = {}
    validateP6TerminalRepositorySnapshot(p6TerminalArtifactFixture, {
      ...correctionShallowAuthority,
      github,
    })
  })
  reject('p6-correction-wrong-event-repository', 'P6_CORRECTION_EVENT_INVALID', () => {
    const github = clone(correctionGitHub)
    github.event.repository.full_name = 'someone/else'
    validateP6TerminalRepositorySnapshot(p6TerminalArtifactFixture, {
      ...correctionShallowAuthority,
      github,
    })
  })
  reject('p6-correction-wrong-event-ref', 'P6_CORRECTION_EVENT_INVALID', () => {
    const github = clone(correctionGitHub)
    github.ref = 'refs/heads/not-main'
    github.event.ref = 'refs/heads/not-main'
    validateP6TerminalRepositorySnapshot(p6TerminalArtifactFixture, {
      ...correctionShallowAuthority,
      branch: 'main',
      github,
    })
  })
  reject('p6-correction-shallow-event-missing', 'P6_CORRECTION_EVENT_INVALID', () =>
    validateP6TerminalRepositorySnapshot(p6TerminalArtifactFixture, {
      ...correctionShallowAuthority,
      github: { ...correctionGitHub, event: null },
    })
  )
  reject('p6-correction-push-head-missing', 'P6_CORRECTION_EVENT_INVALID', () => {
    const github = clone(correctionGitHub)
    delete github.event.after
    validateP6TerminalRepositorySnapshot(p6TerminalArtifactFixture, {
      ...correctionShallowAuthority,
      github,
    })
  })
  reject('p6-correction-push-head-drift', 'P6_CORRECTION_EVENT_INVALID', () => {
    const github = clone(correctionHeadGitHub)
    github.event.head = '6666666666666666666666666666666666666666'
    validateP6TerminalRepositorySnapshot(p6TerminalArtifactFixture, {
      ...correctionShallowAuthority,
      github,
    })
  })
  reject('p6-correction-push-head-conflict', 'P6_CORRECTION_EVENT_INVALID', () => {
    const github = clone(correctionGitHub)
    github.event.head = '6666666666666666666666666666666666666666'
    validateP6TerminalRepositorySnapshot(p6TerminalArtifactFixture, {
      ...correctionShallowAuthority,
      github,
    })
  })
  reject('p6-correction-event-fix-subject-drift', 'P6_CORRECTION_COMMIT_TOPOLOGY', () =>
    validateP6TerminalRepositorySnapshot(p6TerminalArtifactFixture, {
      ...correctionRepairRemoteAuthority,
      headSubject: 'fix(governance): wrong subject',
    })
  )
  reject('p6-correction-event-fix-wrong-before', 'P6_CORRECTION_EVENT_INVALID', () => {
    const github = clone(correctionRepairGitHub)
    github.event.before = P6_PRIMARY_COMMIT
    validateP6TerminalRepositorySnapshot(p6TerminalArtifactFixture, {
      ...correctionRepairShallowAuthority,
      github,
    })
  })
  reject('p6-correction-push-deletion', 'P6_DELIVERY_DELETION', () => {
    const github = clone(correctionGitHub)
    github.event.commits[0].modified = P6_CORRECTION_PATHS.slice(0, 1)
    github.event.commits[0].removed = P6_CORRECTION_PATHS.slice(1)
    validateP6TerminalRepositorySnapshot(p6TerminalArtifactFixture, {
      ...correctionShallowAuthority,
      github,
    })
  })
  reject('lifecycle-mixed-terminal', 'P5_LIFECYCLE_MIXED', () => {
    const documents = clone(terminalDocuments)
    documents[0].markers.set('P5_COMPLETE', 'no')
    validateLifecycleDocuments(documents)
  })

  execute('lifecycle-valid-pre-terminal', () => {
    if (validateLifecycleDocuments(clone(preTerminalDocuments)) !== 'pre-terminal')
      fail('SELF_TEST_LIFECYCLE', 'Valid pre-terminal lifecycle was rejected')
  })
  execute('lifecycle-valid-terminal', () => {
    if (validateLifecycleDocuments(clone(terminalDocuments)) !== 'terminal')
      fail('SELF_TEST_LIFECYCLE', 'Valid terminal lifecycle was rejected')
  })
  reject('lifecycle-partial-terminal', 'P5_TERMINAL_MARKER_DRIFT', () => {
    const documents = clone(terminalDocuments)
    documents[0].markers.delete('PROJECT_UI_LOCKED')
    validateLifecycleDocuments(documents)
  })
  reject('lifecycle-stale-terminal-negative', 'P5_LIFECYCLE_STALE', () => {
    const documents = clone(terminalDocuments)
    documents[0].markers.set('PROJECT_UI_ROUTED', 'no')
    validateLifecycleDocuments(documents)
  })
  reject('lifecycle-false-source-scanner-claim', 'SOURCE_SCANNER_FALSE_POSITIVE', () => {
    const documents = clone(terminalDocuments)
    documents[0].markers.set('SOURCE_SCANNER_IMPLEMENTED', 'yes')
    validateLifecycleDocuments(documents)
  })
  reject('lifecycle-false-page-contract-claim', 'PAGE_CONTRACT_FALSE_POSITIVE', () => {
    const documents = clone(terminalDocuments)
    documents[0].markers.set('PAGE_CONTRACT_CREATED', 'yes')
    validateLifecycleDocuments(documents)
  })
  reject('lifecycle-p3-count-drift', 'P3_STATE_DRIFT', () => {
    const documents = clone(preTerminalDocuments)
    documents[0].markers.set('P3_COMPLETE', 'no')
    validateLifecycleDocuments(documents)
  })
  reject('lifecycle-p4-state-drift', 'P4_STATE_DRIFT', () => {
    const documents = clone(preTerminalDocuments)
    documents[0].markers.set('P4_COMPLETE', 'no')
    validateLifecycleDocuments(documents)
  })

  const caseIds = [
    ...SELF_TEST_IDS,
    ...FALSE_POSITIVE_TEST_IDS,
    ...BOUNDARY_TEST_IDS.slice(0, -1),
    ...P6_BOUNDARY_TEST_IDS,
    ...P6_TERMINAL_TEST_IDS,
    ...P6_DELIVERY_TEST_IDS,
    ...P6_FINAL_LOCAL_COMMIT_TEST_IDS,
    ...P6_REMOTE_CORRECTION_TEST_IDS,
    BOUNDARY_TEST_IDS.at(-1),
    ...LIFECYCLE_TEST_IDS,
  ]
  if (
    !same(
      executed.map(record => record.id),
      caseIds
    )
  )
    fail(
      'SELF_TEST_EXECUTION_DRIFT',
      'Executed self-test order or membership differs from the exact 176-case contract'
    )
  return {
    status: 'pass',
    cases: executed.length,
    rejectionCases: 62,
    falsePositiveCases: 20,
    boundaryCases: 11,
    p6BoundaryCases: 6,
    p6TerminalCases: 25,
    p6DeliveryCases: 10,
    p6FinalLocalCommitCases: 13,
    p6RemoteCorrectionCases: 21,
    lifecycleCases: 8,
    caseIds,
  }
}

const addCheck = async (report, id, operation) => {
  try {
    const details = await operation()
    report.checks.push({ id, status: 'pass', details })
    return details
  } catch (error) {
    const code = error?.code ?? 'UNEXPECTED_VALIDATION_FAILURE'
    const errorDetails = error instanceof ValidationError ? error.details : {}
    report.checks.push({
      id,
      status: 'fail',
      details: {
        code,
        message: error instanceof Error ? error.message : String(error),
        ...errorDetails,
      },
    })
    report.diagnostics.push({
      code,
      message: error instanceof Error ? error.message : String(error),
      ...errorDetails,
    })
    return null
  }
}
const runSuite = async (selfTest, temporaryRoot) => {
  const report = {
    schemaVersion: VALIDATION_SCHEMA_VERSION,
    mode: selfTest ? 'validate+self-test' : 'validate',
    ok: false,
    repository: {
      headSha: run('git', ['rev-parse', 'HEAD']).stdout.trim(),
      trackedPathCount: gitPaths(['ls-files']).length,
    },
    checks: [],
    fixtures: {
      routingTotal: 71,
      routingPassed: 0,
      syncTotal: 47,
      syncPassed: 0,
      selfTestTotal: selfTest ? 176 : 0,
      selfTestPassed: 0,
    },
    diagnostics: [],
    informational: [],
    snapshots: {
      repository: null,
      realCodexSkills: null,
      realClaudePersonal: null,
      realClaudeProject: null,
    },
    summary: { passed: 0, failed: 0, warnings: 0 },
  }
  const manifest = readJson(FILES.manifest)
  const scopes = readJson(FILES.scopes)
  const routingFixtures = readJson(FILES.routingFixtures)
  const syncFixtures = readJson(FILES.syncFixtures)
  await addCheck(report, 'STRICT_SCHEMAS_AND_CORPORA', () => {
    validateSchemaValue(readJson(FILES.manifestSchema), readJson(FILES.manifestSchema), manifest)
    validateSchemaValue(readJson(FILES.scopesSchema), readJson(FILES.scopesSchema), scopes)
    validateFixtureCorpora(routingFixtures, syncFixtures)
    validateRoutingScopes(scopes, { root: ROOT })
    validateRoutingManifest(manifest, {
      fixtureCases: routingFixtures.cases,
      scopeRegistry: scopes,
    })
    return {
      routes: manifest.routes.length,
      scopes: scopes.scopes.length,
      routingCases: 71,
      syncCases: 47,
    }
  })
  const lockResult = await addCheck(report, 'SKILLS_LOCK_V3', () => validateLock(temporaryRoot))
  let routingResult = null
  let syncResult = null
  if (lockResult) {
    routingResult = await addCheck(report, 'ROUTER_SUITES', () =>
      runRoutingSuites({
        manifest,
        scopes,
        routingFixtures,
        lock: lockResult.lock,
        temporaryRoot,
      })
    )
    if (routingResult) {
      report.fixtures.routingPassed = routingResult.nodeSuite.cases
      report.checks.at(-1).details.expectedSkillLockSha256 = lockResult.expectedSha256
      report.checks.at(-1).details.actualSkillLockSha256 = lockResult.actualSha256
    }
    syncResult = await addCheck(report, 'SYNC_FIXTURE_SUITE', () =>
      validateSyncFixtures(syncFixtures, lockResult.lock, temporaryRoot)
    )
    if (syncResult) report.fixtures.syncPassed = syncResult.cases
  }
  await addCheck(report, 'RULE_INDEX_V2', validateRuleIndex)
  await addCheck(report, 'ADAPTER_AND_COMMAND_ACTIVATION', validateActivation)
  const lifecycle = await addCheck(report, 'LIFECYCLE', validateLifecycle)
  if (lifecycle) {
    const boundary = await addCheck(report, 'CHANGED_PATH_BOUNDARY', () =>
      validateBoundary(lifecycle.phase, { p6Paths: lifecycle.p6Paths ?? [] })
    )
    if (boundary?.informational?.length) report.informational.push(...boundary.informational)
  }
  if (selfTest) {
    const suite = await addCheck(report, 'SELF_TEST_INVENTORY', () =>
      runSelfTests({
        routingFixtures,
        syncFixtures,
        routingEvidence: routingResult,
        syncEvidence: syncResult,
        manifest,
        scopes,
        lock: lockResult?.lock,
        temporaryRoot,
      })
    )
    if (suite) report.fixtures.selfTestPassed = suite.cases
  }
  report.ok = report.diagnostics.length === 0
  return report
}
const parseArgs = argv => {
  let selfTest = false
  let jsonOutput = null
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (argument === '--') continue
    if (argument === '--self-test') {
      if (selfTest) fail('CLI_ARGUMENT_ERROR', '--self-test may be specified once')
      selfTest = true
    } else if (argument === '--json-output') {
      if (jsonOutput) fail('CLI_ARGUMENT_ERROR', '--json-output may be specified once')
      const value = argv[index + 1]
      if (!value || value.startsWith('--'))
        fail('CLI_ARGUMENT_ERROR', '--json-output requires a path')
      jsonOutput = value
      index += 1
    } else fail('CLI_ARGUMENT_ERROR', `Unknown argument: ${argument}`)
  }
  if (jsonOutput) {
    if (jsonOutput.replaceAll('\\', '/').split('/').includes('..'))
      fail('OUTPUT_PATH_TRAVERSAL', '--json-output must not contain traversal')
    const absolute = path.isAbsolute(jsonOutput)
      ? path.resolve(jsonOutput)
      : path.resolve(ROOT, jsonOutput)
    const parent = path.dirname(absolute)
    if (!fs.existsSync(parent) || !fs.statSync(parent).isDirectory())
      fail('REPORT_OUTPUT_IO_ERROR', '--json-output parent must already exist')
    jsonOutput = absolute
  }
  return { selfTest, jsonOutput }
}
const printReport = report => {
  for (const check of report.checks)
    process.stdout.write(
      `CHECK id=${check.id} status=${check.status}${check.details?.code ? ` code=${check.details.code}` : ''}\n`
    )
  for (const item of report.informational ?? []) process.stdout.write(`INFO code=${item.code}\n`)
  const boundary = report.checks.find(check => check.id === 'CHANGED_PATH_BOUNDARY')?.details
  const lifecycle = report.checks.find(check => check.id === 'LIFECYCLE')?.details
  process.stdout.write(
    `PROJECT_UI_ROUTING_${report.ok ? 'PASS' : 'FAIL'} phase=${boundary?.phase ?? lifecycle?.phase ?? 'unknown'}${boundary?.boundaryMode ? ` boundary=${boundary.boundaryMode}` : ''}\n`
  )
}
export async function runValidation(argv = process.argv.slice(2)) {
  const { selfTest, jsonOutput } = parseArgs(argv)
  const before = captureInvariantSnapshots()
  const temporaryRoot = createOwnedTemporaryRoot()
  let report
  let cleanupError = null
  try {
    report = await runSuite(selfTest, temporaryRoot)
  } finally {
    try {
      fs.rmSync(temporaryRoot, { recursive: true, force: true })
    } catch (error) {
      cleanupError = error
    }
  }
  if (cleanupError || fs.existsSync(temporaryRoot)) {
    const code = 'TEMP_ROOT_CLEANUP_FAILED'
    report.checks.push({ id: 'TEMPORARY_ROOT_OWNERSHIP', status: 'fail', details: { code } })
    report.diagnostics.push({ code, message: 'Owned validation temporary root cleanup failed' })
  } else
    report.checks.push({
      id: 'TEMPORARY_ROOT_OWNERSHIP',
      status: 'pass',
      details: { pattern: 'ccd-p5-validation-<16-lowercase-hex>', cleanup: 'complete' },
    })
  const after = captureInvariantSnapshots()
  report.snapshots = pairSnapshots(before, after)
  const changedSnapshot = Object.entries(report.snapshots).find(
    ([, value]) => value.beforeDigest !== value.afterDigest || value.beforeType !== value.afterType
  )
  if (changedSnapshot) {
    const code =
      changedSnapshot[0] === 'repository' ? 'VALIDATOR_MUTATED_REPOSITORY' : 'REAL_TARGET_CHANGED'
    report.checks.push({
      id: 'READ_ONLY_INVARIANTS',
      status: 'fail',
      details: { code, snapshot: changedSnapshot[0] },
    })
    report.diagnostics.push({ code, message: `${changedSnapshot[0]} changed during validation` })
  } else
    report.checks.push({ id: 'READ_ONLY_INVARIANTS', status: 'pass', details: { unchanged: true } })
  report.ok = report.diagnostics.length === 0
  report.summary = {
    passed: report.checks.filter(check => check.status === 'pass').length,
    failed: report.checks.filter(check => check.status === 'fail').length,
    warnings: report.diagnostics.filter(item => item.severity === 'warning').length,
  }
  if (jsonOutput) {
    try {
      fs.writeFileSync(jsonOutput, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
    } catch (error) {
      fail('REPORT_OUTPUT_IO_ERROR', 'Unable to write --json-output', {
        cause: error?.code ?? 'unknown',
      })
    }
  }
  printReport(report)
  return { report, exitCode: report.ok ? 0 : 1 }
}

export async function main(argv = process.argv.slice(2)) {
  try {
    const result = await runValidation(argv)
    return result.exitCode
  } catch (error) {
    process.stderr.write(
      `${error?.code ?? 'UNEXPECTED_VALIDATOR_FAILURE'}: ${error instanceof Error ? error.message : String(error)}\n`
    )
    return ['CLI_ARGUMENT_ERROR', 'OUTPUT_PATH_TRAVERSAL', 'REPORT_OUTPUT_IO_ERROR'].includes(
      error?.code
    )
      ? 2
      : 1
  }
}

const direct =
  process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url
if (direct) {
  process.exitCode = await main()
}
