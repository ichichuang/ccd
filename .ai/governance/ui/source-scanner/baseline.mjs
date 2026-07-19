import fs from 'node:fs'
import path from 'node:path'
import { canonicalJson, compareAscii, deepFreeze, fail } from './contracts.mjs'
import { assertJsonSchema } from './schema-validation.mjs'

const RULE_SUMMARY = deepFreeze({ sourceEnforceable: 24, assisted: 22, schemaEnforced: 8, humanReviewOnly: 14, sourceCapable: 46, total: 68 })
const DETECTOR_SUMMARY = deepFreeze({ declared: 14, sourceCapable: 12, schemaOnly: 1, humanOnly: 1, executed: 12 })

export function loadBaseline(baselinePath) {
  try { return JSON.parse(fs.readFileSync(baselinePath, 'utf8')) } catch (error) { fail('BASELINE_OUTPUT_IO', `cannot read baseline ${baselinePath}: ${error.message}`) }
}

function entryComparator(left, right) {
  for (const key of ['path', 'ruleId', 'detectorId', 'ownerKey']) {
    const result = compareAscii(left[key], right[key])
    if (result) return result
  }
  const evidence = compareAscii(canonicalJson(left.normalizedEvidence), canonicalJson(right.normalizedEvidence))
  return evidence || compareAscii(left.fingerprint, right.fingerprint)
}

export function aggregateBaseline(diagnostics, authority, snapshot) {
  const groups = new Map()
  for (const diagnostic of diagnostics.filter(item => item.baselineState !== 'EXCEPTED')) {
    const current = groups.get(diagnostic.fingerprint) ?? {
      fingerprint: diagnostic.fingerprint,
      ruleId: diagnostic.ruleId,
      detectorId: diagnostic.detectorId,
      path: diagnostic.path,
      normalizedEvidence: diagnostic.evidence,
      ownerKey: diagnostic.ownerContext?.ownerKey ?? `file:${diagnostic.path}`,
      count: 0,
      locations: [],
    }
    current.count += 1
    current.locations.push({ line: diagnostic.line, column: diagnostic.column, endLine: diagnostic.endLine, endColumn: diagnostic.endColumn })
    groups.set(diagnostic.fingerprint, current)
  }
  const entries = [...groups.values()].map(entry => ({ ...entry, locations: entry.locations.sort((a, b) => a.line - b.line || a.column - b.column || a.endLine - b.endLine || a.endColumn - b.endColumn) })).sort(entryComparator)
  return deepFreeze({
    schemaVersion: 'ccd-ui-source-baseline/v1',
    repository: 'ichichuang/ccd',
    baselineCommit: snapshot.commit,
    policyDigest: authority.policyDigest,
    scannerManifestDigest: authority.manifestDigest,
    scannerVersion: '1.0.0',
    fingerprintAlgorithm: 'sha256:ccd-ui-fingerprint/v1',
    ruleCoverageSummary: RULE_SUMMARY,
    detectorCoverageSummary: DETECTOR_SUMMARY,
    declaredFindingCount: entries.reduce((sum, entry) => sum + entry.count, 0),
    declaredFingerprintCount: entries.length,
    declaredRuleCount: 68,
    declaredFileCount: 554,
    entries,
    scannerModuleDigests: authority.scannerModuleDigests,
  })
}

export function validateBaseline(baseline, authority, expectedCommit = authority.manifest.baselineAuthority.commit) {
  if (baseline.repository !== 'ichichuang/ccd') fail('BASELINE_REPOSITORY', 'baseline repository mismatch')
  if (baseline.baselineCommit !== expectedCommit) fail('BASELINE_COMMIT', 'baseline commit mismatch')
  if (baseline.policyDigest !== authority.policyDigest) fail('BASELINE_POLICY_DIGEST', 'baseline policy digest mismatch')
  if (baseline.scannerManifestDigest !== authority.manifestDigest) fail('BASELINE_MANIFEST_DIGEST', 'baseline manifest digest mismatch')
  if (canonicalJson(baseline.scannerModuleDigests) !== canonicalJson(authority.scannerModuleDigests)) fail('BASELINE_MODULE_DIGEST', 'baseline scanner module digests mismatch')
  assertJsonSchema(authority.schemas.baseline, baseline, 'source baseline')
  if (baseline.declaredFindingCount !== baseline.entries.reduce((sum, entry) => sum + entry.count, 0) || baseline.declaredFingerprintCount !== baseline.entries.length || baseline.declaredRuleCount !== 68 || baseline.declaredFileCount !== 554) fail('BASELINE_COUNT_MISMATCH', 'baseline declared counts mismatch')
  if (new Set(baseline.entries.map(entry => entry.fingerprint)).size !== baseline.entries.length) fail('BASELINE_DUPLICATE_FINGERPRINT', 'baseline fingerprints must be unique')
  if (canonicalJson([...baseline.entries].sort(entryComparator)) !== canonicalJson(baseline.entries)) fail('BASELINE_ENTRY_ORDER', 'baseline entries are not canonically ordered')
  const sourceRules = new Set(authority.bindings.filter(binding => binding.scannerCategory.startsWith('source-enforceable')).map(binding => binding.ruleId))
  for (const entry of baseline.entries) {
    if (!sourceRules.has(entry.ruleId)) fail('BASELINE_HUMAN_ONLY', `baseline contains non-source rule ${entry.ruleId}`)
    if (path.posix.isAbsolute(entry.path) || entry.path.includes('..')) fail('BASELINE_ABSOLUTE_PATH', `unsafe baseline path ${entry.path}`)
  }
  return baseline
}

export function compareBaseline(baseline, current, { full = true } = {}) {
  const baselineBy = new Map(baseline.entries.map(entry => [entry.fingerprint, entry]))
  const currentBy = new Map(current.entries.map(entry => [entry.fingerprint, entry]))
  for (const [fingerprint, entry] of currentBy) {
    const previous = baselineBy.get(fingerprint)
    if (!previous) {
      if (!baseline.entries.some(item => item.path === entry.path)) fail('RATCHET_NEW_FILE', `new debt file ${entry.path}`)
      fail('RATCHET_NEW_FINGERPRINT', `new source fingerprint ${fingerprint}`)
    }
    if (entry.count > previous.count) fail('RATCHET_COUNT_INCREASE', `source finding count increased for ${fingerprint}`)
    if (full && entry.count < previous.count) fail('RATCHET_COUNT_DECREASE', `source finding count decreased without prune for ${fingerprint}`)
  }
  if (full) for (const [fingerprint, entry] of baselineBy) if (!currentBy.has(fingerprint)) fail(current.entries.some(item => item.path === entry.path) ? 'RATCHET_STALE_ENTRY' : 'RATCHET_REMOVED_FINDING', `baseline debt was removed without prune: ${fingerprint}`)
  return deepFreeze({ ok: true, baselineCount: baseline.declaredFindingCount, currentCount: current.declaredFindingCount })
}

export function pruneBaseline(baseline, current) {
  const baselineBy = new Map(baseline.entries.map(entry => [entry.fingerprint, entry]))
  for (const entry of current.entries) {
    const previous = baselineBy.get(entry.fingerprint)
    if (!previous || entry.count > previous.count || previous.ruleId !== entry.ruleId || previous.path !== entry.path || previous.ownerKey !== entry.ownerKey) fail('RATCHET_NEW_FINGERPRINT', `prune candidate is not an identity-preserving subset: ${entry.fingerprint}`)
  }
  return deepFreeze({ ...baseline, declaredFindingCount: current.entries.reduce((sum, entry) => sum + entry.count, 0), declaredFingerprintCount: current.entries.length, entries: current.entries })
}

export function serializeBaseline(baseline) {
  return canonicalJson(baseline)
}

export function writeBaselineExclusive(outputPath, baseline, repoRoot) {
  const absolute = path.resolve(outputPath)
  if (absolute === path.resolve(repoRoot, '.ai/governance/ui/source-baseline.json') && fs.existsSync(absolute)) fail('OUTPUT_PATH_UNSAFE', 'canonical baseline cannot be overwritten')
  try { fs.writeFileSync(absolute, serializeBaseline(baseline), { flag: 'wx', mode: 0o644 }) } catch (error) { fail('OUTPUT_IO', `cannot write baseline ${absolute}: ${error.message}`) }
  return absolute
}
