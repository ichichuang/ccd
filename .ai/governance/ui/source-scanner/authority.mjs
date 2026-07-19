import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { canonicalJson, compareAscii, deepFreeze, fail } from './contracts.mjs'
import { assertJsonSchema } from './schema-validation.mjs'

export const EXPECTED_SOURCE_MODULES = deepFreeze([
  '.ai/governance/ui/scripts/scan-ui-source.mjs',
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
].sort(compareAscii))

function digestBytes(value) {
  return `sha256:${crypto.createHash('sha256').update(value).digest('hex')}`
}

function readJson(repoRoot, relativePath) {
  const fullPath = path.resolve(repoRoot, relativePath)
  try {
    return JSON.parse(fs.readFileSync(fullPath, 'utf8'))
  } catch (error) {
    fail('AUTH_SCHEMA', `cannot read JSON authority ${relativePath}: ${error.message}`)
  }
}

export function computePolicyDigest(policy) {
  const projection = {
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
  return digestBytes(canonicalJson(projection))
}

export function computeManifestDigest(manifest) {
  return digestBytes(canonicalJson(manifest))
}

export function computeScannerModuleDigests(repoRoot, modulePaths) {
  const result = {}
  for (const relativePath of [...modulePaths].sort(compareAscii)) {
    const fullPath = path.resolve(repoRoot, relativePath)
    if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) fail('AUTH_MODULE_SET', `scanner module is missing: ${relativePath}`)
    result[relativePath] = digestBytes(fs.readFileSync(fullPath))
  }
  return deepFreeze(result)
}

function sameValues(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index])
}

export function validateAuthorityBundle(bundle, phase = 'preterminal') {
  const { manifest, coverage, policy, exceptions, schemas } = bundle
  assertJsonSchema(schemas.enforcement, manifest, 'source enforcement manifest')
  assertJsonSchema(schemas.coverage, coverage, 'source coverage')
  if (!sameValues([...manifest.sourceModules].sort(compareAscii), EXPECTED_SOURCE_MODULES)) fail('AUTH_MODULE_SET', 'scanner manifest module set is not exact')
  if (coverage.bindings.length !== 68 || new Set(coverage.bindings.map(binding => binding.ruleId)).size !== 68) fail('AUTH_RULE_PARTITION', 'source coverage must bind exactly 68 unique rules')
  const expectedIds = Array.from({ length: 68 }, (_, index) => `CCD-UI-${String(index + 1).padStart(3, '0')}`)
  if (!sameValues(coverage.bindings.map(binding => binding.ruleId), expectedIds)) fail('AUTH_RULE_PARTITION', 'source coverage rule IDs must be ordered CCD-UI-001..068')
  const categoryCounts = Object.groupBy(coverage.bindings, binding => binding.scannerCategory)
  const expectedCategories = {
    'source-enforceable': 24,
    'source-enforceable-with-human-remainder': 22,
    'schema-enforced': 8,
    'human-review-only': 14,
  }
  const expectedEnforcement = {
    'source-enforceable': 'source-scanner-enforced',
    'source-enforceable-with-human-remainder': 'source-scanner-assisted-human-review',
    'schema-enforced': 'schema-validated',
    'human-review-only': 'human-review-only',
  }
  for (const [category, count] of Object.entries(expectedCategories)) {
    if ((categoryCounts[category]?.length ?? 0) !== count) fail('AUTH_RULE_PARTITION', `${category} must contain ${count} rules`)
  }
  const policyRules = new Map(policy.rules.map(rule => [rule.id, rule]))
  for (const binding of coverage.bindings) {
    const policyRule = policyRules.get(binding.ruleId)
    if (!policyRule || policyRule.detector?.id !== binding.detectorId || policyRule.disposition !== binding.originalDisposition) fail('AUTH_RULE_PARTITION', `binding ${binding.ruleId} does not reconcile with ui.json`)
    if (binding.finalEnforcement !== expectedEnforcement[binding.scannerCategory]) fail('AUTH_RULE_PARTITION', `binding ${binding.ruleId} has invalid final enforcement`)
    const sourceCapable = binding.scannerCategory.startsWith('source-enforceable')
    if (sourceCapable !== Boolean(binding.module?.startsWith('detectors/'))) fail('AUTH_RULE_PARTITION', `binding ${binding.ruleId} has invalid executable module state`)
  }
  const executable = manifest.detectors.filter(detector => detector.executable)
  if (manifest.detectors.length !== 14 || new Set(manifest.detectors.map(detector => detector.id)).size !== 14 || executable.length !== 12) fail('AUTH_DETECTOR', 'detector registry must contain 14 unique IDs and 12 executable detectors')
  if (coverage.bindings.filter(binding => binding.originalDisposition === 'permanent-rule').length !== 54 || coverage.bindings.filter(binding => binding.originalDisposition === 'human-review-only').length !== 14 || coverage.pageContractDeferrals.length !== 4) fail('AUTH_RULE_PARTITION', 'dispositions and Page Contract deferrals must remain 54/14/4')
  const exceptionIds = policy.exceptionPolicy?.exceptionEligibleRuleIds ?? []
  if (!sameValues(exceptionIds, ['CCD-UI-064']) || exceptions.exceptions?.length !== 0) fail('AUTH_RULE_PARTITION', 'real exception authority must remain empty and CCD-UI-064-only')
  const baselineExists = fs.existsSync(path.resolve(bundle.repoRoot, manifest.authority.baseline))
  if (phase === 'preterminal' && baselineExists) fail('AUTH_MANIFEST', 'canonical source baseline is forbidden in P6.4')
  if (phase === 'terminal' && !baselineExists) fail('AUTH_MANIFEST', 'canonical source baseline is required in terminal mode')
  return bundle
}

export function loadAuthority({ repoRoot, phase = 'preterminal' }) {
  const manifest = readJson(repoRoot, '.ai/governance/ui/source-enforcement.json')
  const coverage = readJson(repoRoot, '.ai/governance/ui/source-coverage.json')
  const policy = readJson(repoRoot, manifest.authority.policy)
  const exceptions = readJson(repoRoot, manifest.authority.exceptions)
  const schemas = {
    enforcement: readJson(repoRoot, '.ai/governance/ui/schemas/ui-source-enforcement.schema.json'),
    coverage: readJson(repoRoot, '.ai/governance/ui/schemas/ui-source-coverage.schema.json'),
    baseline: readJson(repoRoot, '.ai/governance/ui/schemas/ui-source-baseline.schema.json'),
    fixtures: readJson(repoRoot, '.ai/governance/ui/schemas/ui-source-fixtures.schema.json'),
  }
  const bundle = {
    repoRoot,
    phase,
    manifest,
    coverage,
    policy,
    exceptions,
    schemas,
    bindings: coverage.bindings,
    bindingByRuleId: Object.fromEntries(coverage.bindings.map(binding => [binding.ruleId, binding])),
    detectorById: Object.fromEntries(manifest.detectors.map(detector => [detector.id, detector])),
    policyDigest: computePolicyDigest(policy),
    manifestDigest: computeManifestDigest(manifest),
  }
  validateAuthorityBundle(bundle, phase)
  return deepFreeze({ ...bundle, scannerModuleDigests: computeScannerModuleDigests(repoRoot, manifest.sourceModules) })
}
