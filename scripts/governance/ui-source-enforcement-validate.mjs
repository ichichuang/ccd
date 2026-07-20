#!/usr/bin/env node
import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { performance } from 'node:perf_hooks'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { EXPECTED_SOURCE_MODULES, loadAuthority } from '../../.ai/governance/ui/source-scanner/authority.mjs'
import { aggregateBaseline, loadBaseline, validateBaseline } from '../../.ai/governance/ui/source-scanner/baseline.mjs'
import { canonicalJson, compareAscii } from '../../.ai/governance/ui/source-scanner/contracts.mjs'
import { createDetectorRegistry } from '../../.ai/governance/ui/source-scanner/detector-registry.mjs'
import { validateDiagnostic, validateDiagnosticSet } from '../../.ai/governance/ui/source-scanner/diagnostics.mjs'
import { assertRenderParity } from '../../.ai/governance/ui/source-scanner/render.mjs'
import { assertJsonSchema } from '../../.ai/governance/ui/source-scanner/schema-validation.mjs'
import { compileScopeRegistry, validateScopeInventory } from '../../.ai/governance/ui/source-scanner/scope.mjs'
import { acquireSourceSnapshot } from '../../.ai/governance/ui/source-scanner/git-source.mjs'
import { scanUiSource } from '../../.ai/governance/ui/source-scanner/orchestrator.mjs'
import { runSelfTest, SELF_TEST_CASES } from '../../.ai/governance/ui/source-scanner/self-test.mjs'

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const ENTRYPOINT = '.ai/governance/ui/scripts/scan-ui-source.mjs'
const BASELINE = '.ai/governance/ui/source-baseline.json'
const BASE_COMMIT = 'f8acb7fbbfef0c681affb74e08336ec8bc72bca0'
const BASELINE_SHA256 = '487bfa46b173fb5142c8c7ad4467267f97d56ecdecd4ba624c076403cbf05825'
const POLICY_DIGEST = 'sha256:17cc7e2142be673d2cf64be7331a169a17772676914f7c8a7514389e19bd7e5f'
const MANIFEST_DIGEST = 'sha256:7bd858115692d73a7b1c83a8b2bc4f2f2063576e0ba2d202b052ec440bc1dcb1'
const SOURCE_CASES_SHA256 = '979a417c5e9b94c292f4f20d5d15d7a4096ab37ae15686831beeee1cad4bff49'
const SOURCE_FIXTURE_AGGREGATE_SHA256 = '20b1ecf6e9816c9227d749471e389e0fc49b65072d90970345c68dcfef8a1a4b'
const MAX_RSS_BYTES = 384 * 1024 * 1024
const DIAGNOSTIC_FIELDS = Object.freeze(['id', 'ruleId', 'detectorId', 'severity', 'message', 'path', 'scopeId', 'language', 'line', 'column', 'endLine', 'endColumn', 'evidence', 'fingerprint', 'baselineState', 'ownerContext', 'exceptionId', 'parser', 'scannerVersion'])
const ALLOWED_EXTERNAL_IMPORTS = new Set(['typescript', '@vue/compiler-sfc', '@vue/compiler-dom', 'postcss', 'sass', 'fast-glob'])
const FIXTURE_GROUP_COUNTS = Object.freeze({ rule: 92, owner: 12, 'false-positive': 12, exception: 5, 'parser-failure': 5, 'unsupported-scss': 7, 'fingerprint-result': 3, 'baseline-render': 16, 'git-mode': 6, safety: 4 })
const PHASES = Object.freeze({ PRETERMINAL: 'P6_PRETERMINAL', TERMINAL: 'P6_TERMINAL', INVALID: 'INVALID_PARTIAL_OR_MIXED' })
const LIFECYCLE_SOURCES = Object.freeze([
  '.ai/skills/project-ui/SKILL.md',
  '.ai/skills/project-ui/references/platform-invariants.md',
  '.ai/skills/project-ui/references/validation.md',
  'wiki/canonical/design/machine-ui-policy.md',
  'wiki/canonical/design/project-ui-skill.md',
])
const PAGE_CONTRACT_PATHS = Object.freeze(['.ai/governance/policies/page-contract.json', '.ai/governance/ui/page-contract.json', '.ai/governance/ui/schemas/page-contract.schema.json'])
const LEGACY_SKILL_IDS = Object.freeze(['architecture-browser-master', 'ccd-animate-lite', 'ccd-gsap-motion', 'ccd-material-system', 'ccd-motion-system', 'ccd-page-archetypes', 'ccd-product-language', 'ccd-ui-review-gate', 'desktop-tauri-guard', 'github-ops', 'task-orchestrator', 'unocss', 'vite', 'vue', 'vueuse-functions'])
const LAYERS = Object.freeze({
  'contracts.mjs': 0, 'schema-validation.mjs': 0,
  'authority.mjs': 1, 'scope.mjs': 1, 'git-source.mjs': 1, 'parse-typescript.mjs': 1, 'parse-style.mjs': 1, 'parse-vue.mjs': 1,
  'source-model.mjs': 2, 'owners.mjs': 2,
  'detector-registry.mjs': 3, 'detectors/accessibility.mjs': 3, 'detectors/component-ownership.mjs': 3, 'detectors/layout-scroll.mjs': 3, 'detectors/material-zindex.mjs': 3, 'detectors/motion-lifecycle.mjs': 3, 'detectors/non-source.mjs': 3, 'detectors/primevue-customization.mjs': 3, 'detectors/responsive-ownership.mjs': 3, 'detectors/token-literals.mjs': 3,
  'diagnostics.mjs': 4, 'exceptions.mjs': 4,
  'baseline.mjs': 5, 'render.mjs': 5, 'orchestrator.mjs': 5,
  'self-test.mjs': 6, 'cli.mjs': 6,
})

function invariant(condition, message) {
  if (!condition) throw new Error(message)
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.resolve(REPO_ROOT, relativePath), 'utf8'))
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

function listFiles(relativeRoot) {
  const result = []
  function visit(directory) {
    for (const entry of fs.readdirSync(path.resolve(REPO_ROOT, directory), { withFileTypes: true }).sort((left, right) => compareAscii(left.name, right.name))) {
      const relativePath = path.posix.join(directory, entry.name)
      if (entry.isDirectory() && !entry.isSymbolicLink()) visit(relativePath)
      else result.push(relativePath)
    }
  }
  visit(relativeRoot)
  return result.sort(compareAscii)
}

function lifecycleMarkers(relativePath) {
  const source = fs.readFileSync(path.resolve(REPO_ROOT, relativePath), 'utf8')
  const markers = {}
  for (const match of source.matchAll(/^([A-Z][A-Z0-9_]*)=(yes|no)$/gmu)) {
    invariant(!Object.hasOwn(markers, match[1]), `duplicate lifecycle marker ${match[1]} in ${relativePath}`)
    markers[match[1]] = match[2]
  }
  return markers
}

function classifyPhaseState(state) {
  const preterminalPolicy = state.policyStates.every(item => item.sourceScannerImplemented === false && item.applicationSourceEnforcementState === 'BASELINE_ONLY')
  const terminalPolicy = state.policyStates.every(item => item.sourceScannerImplemented === true && item.applicationSourceEnforcementState === 'ACTIVE_RATCHET')
  const preterminalMarkers = state.lifecycleMarkers.every(item => item.SOURCE_SCANNER_IMPLEMENTED === 'no' && [undefined, 'no'].includes(item.SOURCE_ENFORCEMENT_ACTIVE)) && state.sourceWikiMarkers.SOURCE_SCANNER_IMPLEMENTED === 'no' && state.sourceWikiMarkers.SOURCE_ENFORCEMENT_ACTIVE === 'no'
  const terminalMarkers = state.lifecycleMarkers.every(item => item.SOURCE_SCANNER_IMPLEMENTED === 'yes' && item.SOURCE_ENFORCEMENT_ACTIVE === 'yes') && state.sourceWikiMarkers.SOURCE_SCANNER_IMPLEMENTED === 'yes' && state.sourceWikiMarkers.SOURCE_ENFORCEMENT_ACTIVE === 'yes'
  if (state.safetyMarkersValid && !state.baselinePresent && preterminalPolicy && preterminalMarkers) return PHASES.PRETERMINAL
  if (state.safetyMarkersValid && state.baselinePresent && terminalPolicy && terminalMarkers) return PHASES.TERMINAL
  return PHASES.INVALID
}

function inspectPhaseState() {
  const policyPaths = ['.ai/governance/policies/ui.json', '.ai/governance/ui/fixtures/schema-valid/ui-policy.json', '.ai/governance/coverage/project-ui-semantic-coverage.json']
  const policyStates = policyPaths.map(relativePath => ({ relativePath, ...readJson(relativePath) }))
  const lifecycleDocuments = LIFECYCLE_SOURCES.map(relativePath => ({ relativePath, markers: lifecycleMarkers(relativePath) }))
  const sourceWikiMarkers = lifecycleMarkers('wiki/canonical/design/ui-source-enforcement.md')
  const safetyMarkersValid = policyStates.every(item => item.pageContractCreated === false && item.legacySkillsRetired === false && item.legacyRulesRetired === false) && [...lifecycleDocuments.map(item => item.markers), sourceWikiMarkers].every(markers => markers.PAGE_CONTRACT_CREATED === 'no' && markers.LEGACY_SKILLS_RETIRED === 'no' && markers.LEGACY_RULES_RETIRED === 'no')
  const state = { baselinePresent: fs.existsSync(path.resolve(REPO_ROOT, BASELINE)), policyStates, lifecycleMarkers: lifecycleDocuments.map(item => item.markers), sourceWikiMarkers, safetyMarkersValid }
  return { ...state, lifecycleDocuments, phase: classifyPhaseState(state) }
}

function runPhaseStateSelfTests() {
  const policy = (sourceScannerImplemented, applicationSourceEnforcementState) => ({ sourceScannerImplemented, applicationSourceEnforcementState })
  const markers = (sourceScannerImplemented, sourceEnforcementActive, overrides = {}) => ({ SOURCE_SCANNER_IMPLEMENTED: sourceScannerImplemented, SOURCE_ENFORCEMENT_ACTIVE: sourceEnforcementActive, PAGE_CONTRACT_CREATED: 'no', LEGACY_SKILLS_RETIRED: 'no', LEGACY_RULES_RETIRED: 'no', ...overrides })
  const preterminal = { baselinePresent: false, policyStates: Array.from({ length: 3 }, () => policy(false, 'BASELINE_ONLY')), lifecycleMarkers: Array.from({ length: 5 }, () => markers('no', 'no')), sourceWikiMarkers: markers('no', 'no'), safetyMarkersValid: true }
  const terminal = { baselinePresent: true, policyStates: Array.from({ length: 3 }, () => policy(true, 'ACTIVE_RATCHET')), lifecycleMarkers: Array.from({ length: 5 }, () => markers('yes', 'yes')), sourceWikiMarkers: markers('yes', 'yes'), safetyMarkersValid: true }
  const cases = [
    ['PHASE-PRETERMINAL-VALID', preterminal, PHASES.PRETERMINAL],
    ['PHASE-TERMINAL-VALID', terminal, PHASES.TERMINAL],
    ['PHASE-BASELINE-PRESENT-WITH-PRETERMINAL-POLICY', { ...preterminal, baselinePresent: true }, PHASES.INVALID],
    ['PHASE-BASELINE-ABSENT-WITH-TERMINAL-POLICY', { ...terminal, baselinePresent: false }, PHASES.INVALID],
    ['PHASE-TERMINAL-POLICY-WITH-STALE-MARKERS', { ...terminal, lifecycleMarkers: preterminal.lifecycleMarkers, sourceWikiMarkers: preterminal.sourceWikiMarkers }, PHASES.INVALID],
    ['PHASE-TERMINAL-MARKERS-WITH-BASELINE-ONLY', { ...preterminal, lifecycleMarkers: terminal.lifecycleMarkers, sourceWikiMarkers: terminal.sourceWikiMarkers }, PHASES.INVALID],
    ['PHASE-POLICY-INTERNAL-MIX', { ...terminal, policyStates: [policy(true, 'ACTIVE_RATCHET'), policy(false, 'BASELINE_ONLY'), policy(true, 'ACTIVE_RATCHET')] }, PHASES.INVALID],
    ['PHASE-MARKER-SOURCE-MIX', { ...terminal, lifecycleMarkers: [markers('yes', 'yes'), markers('no', 'no'), ...terminal.lifecycleMarkers.slice(2)] }, PHASES.INVALID],
    ['PHASE-SOURCE-WIKI-STALE', { ...terminal, sourceWikiMarkers: markers('no', 'no') }, PHASES.INVALID],
    ['PHASE-SCANNER-BOOLEAN-STATE-MIX', { ...terminal, policyStates: Array.from({ length: 3 }, () => policy(false, 'ACTIVE_RATCHET')) }, PHASES.INVALID],
    ['PHASE-ENFORCEMENT-STATE-MIX', { ...preterminal, policyStates: Array.from({ length: 3 }, () => policy(true, 'BASELINE_ONLY')) }, PHASES.INVALID],
    ['PHASE-SAFETY-MARKER-DRIFT', { ...terminal, safetyMarkersValid: false }, PHASES.INVALID],
  ]
  const results = cases.map(([id, state, expected]) => {
    const actual = classifyPhaseState(state)
    invariant(actual === expected, `phase-state self-test ${id} expected ${expected}, received ${actual}`)
    return { id, expected, actual }
  })
  return { declared: results.length, passed: results.length, failed: 0, caseDigest: `sha256:${sha256(canonicalJson(results))}` }
}

function scannerRelative(relativePath) {
  const prefix = '.ai/governance/ui/source-scanner/'
  return relativePath.startsWith(prefix) ? relativePath.slice(prefix.length) : relativePath
}

function importsOf(source) {
  return [...source.matchAll(/(?:from\s+|import\s*)['"]([^'"]+)['"]/gu)].map(match => match[1])
}

function validateModuleGraph(authority) {
  invariant(canonicalJson(authority.manifest.sourceModules) === canonicalJson(EXPECTED_SOURCE_MODULES), 'scanner module set is not exact')
  const actualModules = [ENTRYPOINT, ...listFiles('.ai/governance/ui/source-scanner')].sort(compareAscii)
  invariant(canonicalJson(actualModules) === canonicalJson(EXPECTED_SOURCE_MODULES), 'unexpected or missing scanner module')
  const alternativeBaselines = listFiles('.ai/governance/ui').filter(relativePath => /source[-_]?baseline/iu.test(path.posix.basename(relativePath)) && relativePath !== BASELINE && relativePath !== '.ai/governance/ui/schemas/ui-source-baseline.schema.json')
  invariant(alternativeBaselines.length === 0, `alternative baseline path is forbidden: ${alternativeBaselines.join(', ')}`)
  const moduleSet = new Set(authority.manifest.sourceModules)
  const edges = new Map(authority.manifest.sourceModules.map(modulePath => [modulePath, []]))
  for (const modulePath of authority.manifest.sourceModules) {
    const source = fs.readFileSync(path.resolve(REPO_ROOT, modulePath), 'utf8')
    invariant(!/\b(?:TODO|FIXME|placeholder|stub detector)\b/iu.test(source), `unfinished implementation marker in ${modulePath}`)
    const imports = importsOf(source)
    if (modulePath.endsWith('/scope.mjs')) invariant(canonicalJson(imports) === canonicalJson(['./contracts.mjs']), 'scope.mjs import closure is not exact')
    if (modulePath.includes('/detectors/')) invariant(imports.every(specifier => specifier === '../contracts.mjs'), `detector imports forbidden dependency: ${modulePath}`)
    for (const specifier of imports) {
      if (specifier.startsWith('node:') || specifier.startsWith('.')) {
        if (!specifier.startsWith('.')) continue
        const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(modulePath), specifier))
        if (!moduleSet.has(resolved)) continue
        edges.get(modulePath).push(resolved)
        const sourceLayer = LAYERS[scannerRelative(modulePath)] ?? 6
        const targetLayer = LAYERS[scannerRelative(resolved)] ?? 6
        invariant(targetLayer <= sourceLayer, `reverse scanner dependency ${modulePath} -> ${resolved}`)
      } else {
        invariant(ALLOWED_EXTERNAL_IMPORTS.has(specifier), `undeclared scanner dependency ${specifier} in ${modulePath}`)
      }
    }
  }
  const visiting = new Set()
  const visited = new Set()
  function visit(modulePath) {
    if (visiting.has(modulePath)) throw new Error(`scanner import cycle at ${modulePath}`)
    if (visited.has(modulePath)) return
    visiting.add(modulePath)
    for (const target of edges.get(modulePath)) visit(target)
    visiting.delete(modulePath)
    visited.add(modulePath)
  }
  for (const modulePath of authority.manifest.sourceModules) visit(modulePath)
  return { moduleCount: authority.manifest.sourceModules.length, edgeCount: [...edges.values()].reduce((sum, items) => sum + items.length, 0) }
}

function validateRepositoryIntegration(authority, phaseState) {
  const packageJson = readJson('package.json')
  invariant(packageJson.scripts['ui:source:scan'] === `node ${ENTRYPOINT}`, 'ui:source:scan command is not exact')
  invariant(packageJson.scripts['ui:source:validate'] === 'node scripts/governance/ui-source-enforcement-validate.mjs', 'ui:source:validate command is not exact')
  invariant(Object.keys(packageJson.scripts).filter(key => key.startsWith('ui:source:')).length === 2, 'source command set must contain exactly two commands')
  for (const dependency of ['typescript', '@vue/compiler-sfc', '@vue/compiler-dom', 'postcss', 'sass']) invariant(Boolean(packageJson.dependencies?.[dependency] ?? packageJson.devDependencies?.[dependency]), `direct parser dependency missing: ${dependency}`)

  invariant(authority.exceptions.exceptions.length === 0, 'real exception registry must remain empty')

  const gate = fs.readFileSync(path.resolve(REPO_ROOT, 'scripts/governance/gate.mjs'), 'utf8')
  const call = "command: ['pnpm', 'ui:source:validate']"
  invariant(gate.split(call).length - 1 === 1, 'Gate must contain exactly one source validator call')
  invariant(gate.indexOf(call) > gate.indexOf("name: 'governance assets'") && gate.indexOf(call) < gate.indexOf("name: 'P5 routing contract'"), 'source validator Gate order is incorrect')

  const wiki = fs.readFileSync(path.resolve(REPO_ROOT, 'wiki/canonical/design/ui-source-enforcement.md'), 'utf8')
  if (phaseState.phase === PHASES.PRETERMINAL) {
    invariant(!phaseState.baselinePresent, 'canonical baseline must be absent in P6 preterminal')
    for (const statement of ['canonical baseline is absent', 'strict ratchet is inactive', 'product debt has not been repaired', 'P6.5 has not started', 'P6_4_PRETERMINAL=yes', 'SOURCE_SCANNER_IMPLEMENTED=no', 'SOURCE_ENFORCEMENT_ACTIVE=no', 'CANONICAL_SOURCE_BASELINE_PRESENT=no', 'P6_5_STARTED=no']) invariant(wiki.includes(statement), `preterminal Wiki statement missing: ${statement}`)
  } else {
    invariant(phaseState.phase === PHASES.TERMINAL && phaseState.baselinePresent, 'terminal phase requires the canonical baseline')
    for (const statement of ['P6_5_BASELINE_RATCHET_ACTIVATION=yes', 'SOURCE_SCANNER_IMPLEMENTED=yes', 'SOURCE_ENFORCEMENT_ACTIVE=yes', 'CANONICAL_SOURCE_BASELINE_PRESENT=yes', 'STRICT_SOURCE_RATCHET_ACTIVE=yes', 'PAGE_CONTRACT_CREATED=no', 'LEGACY_SKILLS_RETIRED=no', 'LEGACY_RULES_RETIRED=no', 'P6 implementation and local commit are completed by P6.6', 'P6.7 performs external push, CI, deployment, and remote-authority acceptance', 'Remote acceptance is operational evidence and is not encoded as a repository lifecycle marker']) invariant(wiki.includes(statement), `terminal Wiki statement missing: ${statement}`)
    for (const marker of ['P6_6_PENDING=yes', 'P6_7_REMOTE_ACCEPTANCE_PENDING=yes']) invariant(!wiki.includes(marker), `retired lifecycle marker remains: ${marker}`)
    invariant(!wiki.includes('P6_COMPLETE=yes'), 'terminal source Wiki must not claim P6 completion')
    const semanticCoverage = readJson('.ai/governance/coverage/project-ui-semantic-coverage.json')
    const sourceEnforcement = semanticCoverage.sourceEnforcement
    invariant(sourceEnforcement?.phase === 'P6_TERMINAL' && sourceEnforcement?.scannerImplementationPresent === true && sourceEnforcement?.canonicalBaselinePresent === true && sourceEnforcement?.strictNewFingerprintAndCountIncreaseRatchetActive === true, 'semantic coverage terminal activation is partial')
    invariant(sourceEnforcement?.ruleCounts?.sourceEnforceable === 24 && sourceEnforcement?.ruleCounts?.assisted === 22 && sourceEnforcement?.ruleCounts?.schema === 8 && sourceEnforcement?.ruleCounts?.humanReviewOnly === 14, 'semantic coverage terminal rule partition drifted')
    invariant(sourceEnforcement?.scopeCount === 20 && sourceEnforcement?.governedP5FileCount === 554 && sourceEnforcement?.acceptedHistoricalFindingCount === 393 && sourceEnforcement?.acceptedHistoricalFindingsDerivedFromCanonicalBaseline === true, 'semantic coverage terminal inventory drifted')
    invariant(sourceEnforcement?.realExceptionCount === 0 && sourceEnforcement?.pageContractCreated === false && sourceEnforcement?.legacySkillsRetained === true && sourceEnforcement?.legacyRulesRetained === true, 'semantic coverage terminal boundaries drifted')
  }
  const designIndex = fs.readFileSync(path.resolve(REPO_ROOT, 'wiki/indexes/design-index.md'), 'utf8')
  invariant(designIndex.split('[[ui-source-enforcement]]').length - 1 === 1, 'design index must contain exactly one source-enforcement link')
  for (const pageContractPath of PAGE_CONTRACT_PATHS) invariant(!fs.existsSync(path.resolve(REPO_ROOT, pageContractPath)), `Page Contract artifact is forbidden: ${pageContractPath}`)
}

function validateFixturesAndAuthority(authority) {
  const fixtureManifest = readJson('.ai/governance/ui/fixtures/source-cases.json')
  invariant(sha256(fs.readFileSync(path.resolve(REPO_ROOT, '.ai/governance/ui/fixtures/source-cases.json'))) === SOURCE_CASES_SHA256, 'source-cases.json byte drift')
  assertJsonSchema(authority.schemas.fixtures, fixtureManifest, 'source fixture manifest')
  invariant(fixtureManifest.cases.length === 162 && SELF_TEST_CASES.length === 162, 'source fixture authority must contain exactly 162 cases')
  invariant(new Set(fixtureManifest.cases.map(item => item.id)).size === 162, 'source fixture IDs must be unique')
  invariant(fixtureManifest.cases.filter(item => item.polarity === 'positive').length === 82 && fixtureManifest.cases.filter(item => item.polarity === 'negative').length === 80, 'source fixture polarity split must be 82/80')
  const groups = Object.groupBy(fixtureManifest.cases, item => item.group)
  for (const [group, count] of Object.entries(FIXTURE_GROUP_COUNTS)) invariant((groups[group]?.length ?? 0) === count, `fixture group ${group} must contain ${count} cases`)
  const declaredPaths = [...fixtureManifest.cases.map(item => item.fixturePath)].sort(compareAscii)
  const actualPaths = fs.globSync('.ai/governance/ui/fixtures/{source-valid,source-invalid}/**/*', { cwd: REPO_ROOT }).filter(relativePath => fs.statSync(path.resolve(REPO_ROOT, relativePath)).isFile()).sort(compareAscii)
  invariant(canonicalJson(actualPaths) === canonicalJson(declaredPaths), 'fixture file set does not exactly match source-cases.json')
  const fixtureRows = declaredPaths.map(relativePath => `${relativePath}=${sha256(fs.readFileSync(path.resolve(REPO_ROOT, relativePath)))}\n`).join('')
  invariant(sha256(fixtureRows) === SOURCE_FIXTURE_AGGREGATE_SHA256, 'source fixture byte drift')
  for (const relativePath of declaredPaths) {
    const stat = fs.lstatSync(path.resolve(REPO_ROOT, relativePath))
    invariant(stat.isFile() && !stat.isSymbolicLink(), `source fixture must be a regular file: ${relativePath}`)
  }

  const registry = createDetectorRegistry(authority)
  invariant(registry.entries.size === 14 && [...registry.entries.values()].filter(entry => entry.implementation).length === 12, 'detector registry must contain 14 declared and 12 executable detectors')
  invariant(authority.manifest.ownerContexts.length === 12, 'owner-context registry must contain exactly 12 contexts')
  const emptyBaseline = aggregateBaseline([], authority, { commit: BASE_COMMIT })
  assertJsonSchema(authority.schemas.baseline, emptyBaseline, 'empty baseline fixture')
  validateBaseline(emptyBaseline, authority)
  return { fixtureManifest, emptyBaseline, fixtureAggregateSha256: SOURCE_FIXTURE_AGGREGATE_SHA256 }
}

function validateLegacyAssets() {
  const lock = readJson('.ai/manifests/skills-lock.json')
  invariant(Object.keys(lock.skills ?? {}).length === 16, 'Skills lock must retain project-ui and 15 legacy Skills')
  for (const id of LEGACY_SKILL_IDS) {
    const source = lock.skills?.[id]?.source
    invariant(typeof source === 'string' && source.startsWith('repo:'), `legacy Skill record is missing: ${id}`)
    const absolute = path.resolve(REPO_ROOT, source.slice('repo:'.length))
    const stat = fs.lstatSync(absolute, { throwIfNoEntry: false })
    invariant(stat?.isDirectory() && !stat.isSymbolicLink() && fs.existsSync(path.join(absolute, 'SKILL.md')), `legacy Skill source is missing: ${id}`)
  }
  const ruleIndex = readJson('.ai/manifests/rule-index.json')
  invariant(ruleIndex.version === 2 && ruleIndex.rules?.length === 38, 'legacy rule index must retain exactly 38 rules')
  for (const rule of ruleIndex.rules) {
    const stat = fs.lstatSync(path.resolve(REPO_ROOT, rule.path), { throwIfNoEntry: false })
    invariant(stat?.isFile() && !stat.isSymbolicLink(), `legacy rule source is missing: ${rule.path}`)
  }
  return { legacySkills: LEGACY_SKILL_IDS.length, legacyRules: ruleIndex.rules.length }
}

function validateTerminalBaseline(authority) {
  const baselinePath = path.resolve(REPO_ROOT, BASELINE)
  const baselineBytes = fs.readFileSync(baselinePath)
  invariant(sha256(baselineBytes) === BASELINE_SHA256, 'canonical baseline SHA-256 drift')
  const baseline = validateBaseline(loadBaseline(baselinePath), authority, BASE_COMMIT)
  invariant(authority.policyDigest === POLICY_DIGEST && baseline.policyDigest === POLICY_DIGEST, 'policy semantic digest drift')
  invariant(authority.manifestDigest === MANIFEST_DIGEST && baseline.scannerManifestDigest === MANIFEST_DIGEST, 'scanner manifest digest drift')
  invariant(baseline.repository === 'ichichuang/ccd' && baseline.baselineCommit === BASE_COMMIT, 'canonical baseline repository or commit drift')
  invariant(baseline.declaredRuleCount === 68 && baseline.declaredFileCount === 554 && baseline.declaredFindingCount === 393 && baseline.declaredFingerprintCount === 328 && baseline.entries.length === 328, 'canonical baseline declared count drift')
  invariant(canonicalJson(baseline.scannerModuleDigests) === canonicalJson(authority.scannerModuleDigests), 'scanner module digest drift')
  const reproduced = scanUiSource({ repoRoot: REPO_ROOT, authority, mode: 'ref', ref: BASE_COMMIT, checkBaseline: true, enforcePerformance: false })
  invariant(reproduced.repository === 'ichichuang/ccd' && reproduced.commit === BASE_COMMIT && reproduced.fileCount === 554 && reproduced.findingCount === 393 && reproduced.parserErrorCount === 0, 'strict baseline reproduction count or identity drift')
  const reproducedBaseline = aggregateBaseline(reproduced.diagnostics, authority, { commit: reproduced.commit })
  invariant(canonicalJson(reproducedBaseline) === baselineBytes.toString('utf8'), 'strict baseline reproduction bytes drift')
  invariant(authority.exceptions.exceptions.length === 0, 'terminal source ratchet requires zero real exceptions')
  const legacy = validateLegacyAssets()
  return { sha256: BASELINE_SHA256, repository: baseline.repository, baselineCommit: baseline.baselineCommit, declaredRuleCount: baseline.declaredRuleCount, declaredFileCount: baseline.declaredFileCount, declaredFindingCount: baseline.declaredFindingCount, declaredFingerprintCount: baseline.declaredFingerprintCount, parserErrors: reproduced.parserErrorCount, strictReproduction: true, ratchetValid: true, ...legacy }
}

function childEnvironment(isolatedHome) {
  const { CCD_UI_SCANNER_DEBUG: _debug, ...environment } = process.env
  return { ...environment, HOME: isolatedHome, CCD_UI_SCANNER_HOME: isolatedHome, TZ: 'UTC', LC_ALL: 'C', LANG: 'C' }
}

function runScanner(args, isolatedHome, acceptedStatuses) {
  const started = performance.now()
  const result = spawnSync(process.execPath, [ENTRYPOINT, ...args], { cwd: REPO_ROOT, encoding: 'utf8', maxBuffer: 128 * 1024 * 1024, env: childEnvironment(isolatedHome) })
  const wallMs = performance.now() - started
  invariant(!result.error, `scanner process failed to launch: ${result.error?.message}`)
  invariant(acceptedStatuses.includes(result.status), `scanner ${args.join(' ')} exited ${result.status}: ${result.stderr.trim()}`)
  return { status: result.status, stdout: result.stdout, stderr: result.stderr, wallMs: Number(wallMs.toFixed(3)) }
}

function median(values) {
  return [...values].sort((left, right) => left - right)[Math.floor(values.length / 2)]
}

function normalizeResultForDeterminism(result) {
  const normalized = structuredClone(result)
  delete normalized.performance
  return canonicalJson(normalized)
}

function validateSelfTestMode(authority) {
  const sourceFixtures = runSelfTest({ repoRoot: REPO_ROOT, authority })
  const fixtureManifest = readJson('.ai/governance/ui/fixtures/source-cases.json')
  const expectedIds = fixtureManifest.cases.map(item => `${item.expectedExit === 0 ? 'ST-POS' : 'ST-NEG'}-${item.id}`)
  invariant(canonicalJson(sourceFixtures.cases.map(item => item.id)) === canonicalJson(expectedIds), 'validator self-test IDs are not exact')
  invariant(sourceFixtures.declared === 162 && sourceFixtures.passed === 162 && sourceFixtures.failed === 0, 'validator self-test total is not 162/162')
  const phaseStateSelfTests = runPhaseStateSelfTests()
  invariant(phaseStateSelfTests.declared === 12 && phaseStateSelfTests.passed === 12 && phaseStateSelfTests.failed === 0, 'phase-state self-test total is not 12/12')
  return { sourceFixtures, phaseStateSelfTests }
}

function validatePerformanceAndLiveAudit(authority, isolatedHome) {
  const selfTestRun = runScanner(['--self-test'], isolatedHome, [0])
  const selfTest = JSON.parse(selfTestRun.stdout)
  invariant(selfTest.declared === 162 && selfTest.passed === 162 && selfTest.failed === 0, 'scanner self-test summary is not 162/162')
  invariant(selfTestRun.wallMs <= authority.manifest.performance.selfTestMs, `external self-test took ${selfTestRun.wallMs}ms`)

  const common = ['--ref', BASE_COMMIT, '--no-baseline']
  const jsonRuns = Array.from({ length: 3 }, () => runScanner([...common, '--format', 'json'], isolatedHome, [0, 1]))
  const textRuns = Array.from({ length: 3 }, () => runScanner([...common, '--format', 'text'], isolatedHome, [0, 1]))
  const jsonResults = jsonRuns.map(run => JSON.parse(run.stdout))
  invariant(jsonResults.every(result => result.fileCount === 554 && result.parserErrorCount === 0), 'immutable full scan must cover 554 parser-clean files')
  invariant(new Set(jsonResults.map(normalizeResultForDeterminism)).size === 1, 'fresh-process JSON diagnostics are not deterministic')
  invariant(new Set(textRuns.map(run => run.stdout)).size === 1, 'fresh-process text output is not deterministic')
  const jsonMedianMs = median(jsonRuns.map(run => run.wallMs))
  const textMedianMs = median(textRuns.map(run => run.wallMs))
  const fullMedianMs = Math.max(jsonMedianMs, textMedianMs)
  const parityOverheadPercent = Math.max(0, ((jsonMedianMs - textMedianMs) / textMedianMs) * 100)
  invariant(fullMedianMs <= authority.manifest.performance.fullScanMs, `full scan median ${fullMedianMs}ms exceeds budget`)
  invariant(parityOverheadPercent <= authority.manifest.performance.renderParityOverheadPercent, `JSON/text overhead ${parityOverheadPercent.toFixed(3)}% exceeds budget`)

  const stagedRun = runScanner(['--staged', '--no-baseline', '--format', 'json'], isolatedHome, [0, 1])
  const staged = JSON.parse(stagedRun.stdout)
  invariant(stagedRun.wallMs <= authority.manifest.performance.stagedScanMs, `staged scan took ${stagedRun.wallMs}ms`)
  const maxRssBytes = Math.max(selfTest.maxRssBytes, staged.performance.maxRssBytes, ...jsonResults.map(result => result.performance.maxRssBytes))
  invariant(maxRssBytes <= MAX_RSS_BYTES, `maximum RSS ${maxRssBytes} exceeds ${MAX_RSS_BYTES}`)

  const liveRun = runScanner(['--no-baseline', '--format', 'json'], isolatedHome, [0, 1])
  const live = JSON.parse(liveRun.stdout)
  invariant(live.fileCount === 554 && live.parserErrorCount === 0, 'live repository audit must cover 554 parser-clean files')
  validateDiagnosticSet(live.diagnostics)
  for (const diagnostic of live.diagnostics) {
    invariant(canonicalJson(Object.keys(diagnostic).sort(compareAscii)) === canonicalJson([...DIAGNOSTIC_FIELDS].sort(compareAscii)), `diagnostic field set is not exact for ${diagnostic.id}`)
    validateDiagnostic(Object.fromEntries(DIAGNOSTIC_FIELDS.map(field => [field, diagnostic[field]])))
    invariant(authority.bindingByRuleId[diagnostic.ruleId]?.scannerCategory.startsWith('source-enforceable'), `non-source rule emitted diagnostic ${diagnostic.ruleId}`)
    invariant(!path.posix.isAbsolute(diagnostic.path) && !diagnostic.path.includes('..') && !JSON.stringify(diagnostic.evidence).includes(REPO_ROOT), `unsafe diagnostic output ${diagnostic.id}`)
  }
  assertRenderParity(live)
  return {
    selfTest: { wallMs: selfTestRun.wallMs, elapsedMs: selfTest.elapsedMs, maxRssBytes: selfTest.maxRssBytes },
    performance: { fullMedianMs, jsonMedianMs, textMedianMs, stagedMs: stagedRun.wallMs, parityOverheadPercent: Number(parityOverheadPercent.toFixed(3)), maxRssBytes },
    live: { exit: liveRun.status, fileCount: live.fileCount, findingCount: live.findingCount, parserErrorCount: live.parserErrorCount, findingsByRule: live.findingsByRule, elapsedMs: live.performance.elapsedMs, maxRssBytes: live.performance.maxRssBytes },
  }
}

function main() {
  const argv = process.argv.slice(2)
  invariant(argv.length === 0 || (argv.length === 1 && argv[0] === '--self-test'), 'validator accepts only --self-test')
  const phaseState = inspectPhaseState()
  invariant(phaseState.phase !== PHASES.INVALID, PHASES.INVALID)
  const authority = loadAuthority({ repoRoot: REPO_ROOT, phase: phaseState.phase === PHASES.TERMINAL ? 'terminal' : 'preterminal' })
  if (argv[0] === '--self-test') {
    const result = validateSelfTestMode(authority)
    process.stdout.write(canonicalJson({
      schemaVersion: 'ccd-ui-source-validator-self-test/v2', phase: phaseState.phase,
      sourceFixtures: { declared: result.sourceFixtures.declared, passed: result.sourceFixtures.passed, failed: result.sourceFixtures.failed, elapsedMs: result.sourceFixtures.elapsedMs, maxRssBytes: result.sourceFixtures.maxRssBytes, caseDigest: result.sourceFixtures.caseDigest },
      phaseStateSelfTests: result.phaseStateSelfTests,
    }))
    return
  }

  const gitStatusBefore = spawnSync('git', ['status', '--porcelain=v1', '-z', '--untracked-files=all'], { cwd: REPO_ROOT, encoding: null }).stdout
  const moduleGraph = validateModuleGraph(authority)
  validateRepositoryIntegration(authority, phaseState)
  const fixtures = validateFixturesAndAuthority(authority)
  const phaseStateSelfTests = runPhaseStateSelfTests()
  const scopeRegistry = compileScopeRegistry(authority.manifest.scopes, authority.manifest.exclusions)
  const sourceSnapshot = acquireSourceSnapshot({ repoRoot: REPO_ROOT, mode: 'default', scopeRegistry })
  const inventory = validateScopeInventory(scopeRegistry, sourceSnapshot.files, authority.manifest.inventory)
  const terminalBaseline = phaseState.phase === PHASES.TERMINAL ? validateTerminalBaseline(authority) : null
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ccd-ui-source-validator-'))
  let runtime
  try {
    const isolatedHome = path.join(temporaryRoot, 'home')
    fs.mkdirSync(isolatedHome)
    runtime = validatePerformanceAndLiveAudit(authority, isolatedHome)
  } finally {
    fs.rmSync(temporaryRoot, { recursive: true, force: true })
  }
  const gitStatusAfter = spawnSync('git', ['status', '--porcelain=v1', '-z', '--untracked-files=all'], { cwd: REPO_ROOT, encoding: null }).stdout
  invariant(Buffer.compare(gitStatusBefore, gitStatusAfter) === 0, 'source validation changed repository state')
  invariant(fs.existsSync(path.resolve(REPO_ROOT, BASELINE)) === phaseState.baselinePresent, 'source validation changed canonical baseline presence')
  process.stdout.write(canonicalJson({
    schemaVersion: 'ccd-ui-source-validator-result/v2', status: 'pass', phase: phaseState.phase,
    authority: { modules: moduleGraph.moduleCount, moduleEdges: moduleGraph.edgeCount, rules: authority.bindings.length, detectors: authority.manifest.detectors.length, executableDetectors: authority.manifest.detectors.filter(item => item.executable).length, owners: authority.manifest.ownerContexts.length, scopes: authority.manifest.scopes.length, policyDigest: authority.policyDigest, manifestDigest: authority.manifestDigest },
    sourceFixtures: { declared: fixtures.fixtureManifest.cases.length, positive: 82, negative: 80, baselineSchemaValidated: fixtures.emptyBaseline.schemaVersion, aggregateSha256: fixtures.fixtureAggregateSha256 },
    phaseStateSelfTests,
    inventory,
    baseline: terminalBaseline,
    selfTest: runtime.selfTest,
    liveAudit: runtime.live,
    performance: runtime.performance,
    lifecycle: phaseState.phase === PHASES.TERMINAL
      ? { canonicalBaselinePresent: true, sourceScannerImplemented: true, applicationSourceEnforcementState: 'ACTIVE_RATCHET', sourceScannerMarker: 'yes', sourceEnforcementActive: 'yes', strictRatchetActive: true, ratchetAuthorized: true, realExceptions: 0 }
      : { canonicalBaselinePresent: false, sourceScannerImplemented: false, applicationSourceEnforcementState: 'BASELINE_ONLY', sourceScannerMarker: 'no', sourceEnforcementActive: 'no', strictRatchetActive: false, ratchetAuthorized: false, existingDebtFindingCount: runtime.live.findingCount, realExceptions: 0 },
  }))
}

try {
  main()
} catch (error) {
  process.stderr.write(`UI_SOURCE_VALIDATION_FAILURE: ${PHASES.INVALID}: ${error.message}\n`)
  process.exit(1)
}
