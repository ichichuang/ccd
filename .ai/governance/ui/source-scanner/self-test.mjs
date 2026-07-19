import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { performance } from 'node:perf_hooks'
import { spawnSync } from 'node:child_process'
import { aggregateBaseline, compareBaseline, pruneBaseline, validateBaseline } from './baseline.mjs'
import { ScannerError, canonicalJson, deepFreeze, fail } from './contracts.mjs'
import { runDetectors } from './detector-registry.mjs'
import { finalizeDiagnostics, sortDiagnostics, validateDiagnosticSet } from './diagnostics.mjs'
import { applyExceptions } from './exceptions.mjs'
import { acquireSourceSnapshot } from './git-source.mjs'
import { assertRenderParity, buildResult, renderJson, renderText } from './render.mjs'
import { assertJsonSchema } from './schema-validation.mjs'
import { compileScopeRegistry } from './scope.mjs'
import { buildSourceModels } from './source-model.mjs'

const SOURCE_RULE_NUMBERS = deepFreeze([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 63, 64, 66, 67, 68])
const OWNER_IDS = deepFreeze(['OWNER-OC-PRIME-ADAPTER-VALID', 'OWNER-OC-PRO-COMPONENT-VALID', 'OWNER-OC-CHART-RUNTIME-VALID', 'OWNER-OC-FEEDBACK-DIALOG-VALID', 'OWNER-OC-PT-PRESET-VALID', 'OWNER-OC-TOKEN-AUTHORITY-VALID', 'OWNER-OC-DEVICE-RUNTIME-VALID', 'OWNER-OC-SIZE-ENGINE-VALID', 'OWNER-OC-SCROLLBAR-VALID', 'OWNER-OC-PROFORM-NATIVE-VALID', 'OWNER-OC-MOTION-RUNTIME-VALID', 'OWNER-OC-LAYOUT-RUNTIME-VALID'])
const SOURCE_DETECTORS = deepFreeze(['AccessibilityReviewer', 'DeepSelectorExceptionScanner', 'EchartsOwnershipScanner', 'FeedbackAbstractionScanner', 'LayoutScrollScanner', 'MaterialZIndexScanner', 'MotionLifecycleScanner', 'NativeControlScanner', 'PassThroughConflictScanner', 'PrimeVueComponentPriorityScanner', 'ResponsiveOwnershipScanner', 'TokenLiteralScanner'])
const REASON_CASES = deepFreeze({
  'EXCEPTION-INELIGIBLE': [6, 'EXCEPTION_RULE_INELIGIBLE'], 'EXCEPTION-EXPIRED': [6, 'EXCEPTION_EXPIRED'], 'EXCEPTION-BROAD': [6, 'EXCEPTION_SCOPE'], 'EXCEPTION-UNMATCHED': [6, 'EXCEPTION_UNMATCHED'],
  'PARSER-VUE-ERROR': [5, 'PARSE_VUE'], 'PARSER-TS-ERROR': [5, 'PARSE_TS'], 'PARSER-TSX-ERROR': [5, 'PARSE_TSX'], 'PARSER-CSS-ERROR': [5, 'PARSE_CSS'], 'PARSER-SCSS-ERROR': [5, 'PARSE_SCSS'],
  'SCSS-INTERPOLATION': [5, 'SCSS_INTERPOLATION'], 'SCSS-GENERATED-SELECTOR': [5, 'SCSS_GENERATED_SELECTOR'], 'SCSS-UNRESOLVED-MIXIN': [5, 'SCSS_UNRESOLVED_MIXIN'], 'SCSS-LOOP': [5, 'SCSS_LOOP'], 'SCSS-ONE-TO-MANY': [5, 'SCSS_ONE_TO_MANY_MAP'], 'SCSS-UNRESOLVED-IMPORT': [5, 'SCSS_UNRESOLVED_IMPORT'], 'SCSS-UNMAPPABLE-NODE': [5, 'SCSS_UNMAPPABLE_NODE'],
  'DIAGNOSTIC-DUPLICATE-REJECTED': [3, 'DIAGNOSTIC_DUPLICATE_ID'],
  'BASELINE-NEW-FINGERPRINT': [7, 'RATCHET_NEW_FINGERPRINT'], 'BASELINE-COUNT-INCREASE': [7, 'RATCHET_COUNT_INCREASE'], 'BASELINE-NEW-FILE': [7, 'RATCHET_NEW_FILE'], 'BASELINE-STALE-FINDING': [7, 'RATCHET_STALE_ENTRY'], 'BASELINE-COUNT-DECREASE': [7, 'RATCHET_COUNT_DECREASE'], 'BASELINE-REMOVED-FILE': [7, 'RATCHET_REMOVED_FINDING'], 'BASELINE-PRUNE-REJECT': [7, 'RATCHET_NEW_FINGERPRINT'], 'BASELINE-WRONG-REPOSITORY': [7, 'BASELINE_REPOSITORY'], 'BASELINE-WRONG-COMMIT': [7, 'BASELINE_COMMIT'], 'BASELINE-POLICY-DIGEST': [7, 'BASELINE_POLICY_DIGEST'], 'BASELINE-MANIFEST-DIGEST': [7, 'BASELINE_MANIFEST_DIGEST'], 'BASELINE-MODULE-DIGEST': [7, 'BASELINE_MODULE_DIGEST'],
  'MODE-UNTRACKED-CANDIDATE': [1, null], 'MODE-MISSING-SHALLOW-OBJECT': [4, 'GIT_OBJECT_MISSING'], 'MODE-DIRTY-SHALLOW': [4, 'GIT_DIRTY_SHALLOW'],
  'PATH-TRAVERSAL': [2, 'PATH_TRAVERSAL'], 'SYMLINK-ESCAPE': [2, 'PATH_SYMLINK'],
})

const ZERO_CASES = deepFreeze(['EXCEPTION-ELIGIBLE-MATCH', 'FINGERPRINT-LINE-SHIFT-STABLE', 'FINGERPRINT-FILE-MOVE-CHANGES', 'BASELINE-EMPTY', 'BASELINE-PRUNE-ACCEPT', 'RENDER-TEXT-JSON-PARITY', 'DIAGNOSTIC-ORDERING', 'MODE-STAGED-UNSTAGED-ISOLATION', 'MODE-COMMIT-WORKTREE-ISOLATION', 'MODE-CLEAN-SHALLOW', 'NO-REPOSITORY-WRITE', 'NO-REAL-HOME-ACCESS'])

function expectedCaseMap() {
  const result = new Map()
  for (const number of SOURCE_RULE_NUMBERS) {
    const ruleId = `CCD-UI-${String(number).padStart(3, '0')}`
    result.set(`SRC-${ruleId}-VALID`, [0, null])
    result.set(`SRC-${ruleId}-INVALID`, [1, null])
  }
  for (const id of OWNER_IDS) result.set(id, [0, null])
  for (const detector of SOURCE_DETECTORS) result.set(`FP-${detector}-VALID`, [0, null])
  for (const id of ZERO_CASES) result.set(id, [0, null])
  for (const [id, expectation] of Object.entries(REASON_CASES)) result.set(id, expectation)
  return result
}

function runGit(repoRoot, args) {
  const result = spawnSync('git', args, { cwd: repoRoot, encoding: 'utf8', env: { ...process.env, HOME: process.env.CCD_UI_SCANNER_HOME, GIT_CONFIG_NOSYSTEM: '1' } })
  if (result.status !== 0) fail('SELF_TEST_FAILURE', `fixture git ${args[0]} failed: ${result.stderr.trim()}`)
  return result.stdout.trim()
}

function targetForScope(scopeId, id, extension) {
  const safe = id.replace(/[^A-Za-z0-9_-]/gu, '-')
  const roots = {
    APP_ADAPTERS: 'apps/test/src/adapters', APP_BOOTSTRAP_THEME: 'apps/test/src/theme', APP_CONSTANTS: 'apps/test/src/constants', APP_DIRECTIVES: 'apps/test/src/directives', APP_HOOKS: 'apps/test/src/hooks', APP_LAYOUTS: 'apps/test/src/layouts', APP_PLUGINS: 'apps/test/src/plugins', APP_ROUTER: 'apps/test/src/router', APP_STORES: 'apps/test/src/stores', APP_STYLES: 'apps/test/src/assets/styles', APP_THEME_UTILS: 'apps/test/src/utils/theme', APP_VIEWS: 'apps/test/src/views', SHARED_CHARTS: 'packages/vue-charts/src', SHARED_HOOKS: 'packages/vue-hooks/src', SHARED_PLATFORM: 'packages/vue-app-platform/src', SHARED_PRIME: 'packages/vue-primevue-adapter/src', SHARED_TOKENS: 'packages/design-tokens/src', SHARED_UI: 'packages/vue-ui/src', SHARED_UNOCSS: 'packages/unocss-preset/src',
  }
  return `${roots[scopeId] ?? 'apps/test/src/views'}/fixtures/${safe}${extension}`
}

const OWNER_TARGETS = deepFreeze({
  'OWNER-OC-PRIME-ADAPTER-VALID': ['packages/vue-primevue-adapter/src/theme/colorAdapter.ts', 'CCD-UI-066'],
  'OWNER-OC-PRO-COMPONENT-VALID': ['packages/vue-ui/src/ProTable/ProTable.vue', 'CCD-UI-001'],
  'OWNER-OC-CHART-RUNTIME-VALID': ['packages/vue-charts/src/chartRuntime.ts', 'CCD-UI-005'],
  'OWNER-OC-FEEDBACK-DIALOG-VALID': ['apps/web-demo/src/adapters/showcaseFeedback.adapter.ts', 'CCD-UI-006'],
  'OWNER-OC-PT-PRESET-VALID': ['packages/vue-primevue-adapter/src/theme/primevuePreset.ts', 'CCD-UI-011'],
  'OWNER-OC-TOKEN-AUTHORITY-VALID': ['packages/design-tokens/src/theme.ts', 'CCD-UI-015'],
  'OWNER-OC-DEVICE-RUNTIME-VALID': ['apps/web-demo/src/stores/modules/system/device.ts', 'CCD-UI-024'],
  'OWNER-OC-SIZE-ENGINE-VALID': ['apps/web-demo/src/utils/theme/sizeEngine.ts', 'CCD-UI-023'],
  'OWNER-OC-SCROLLBAR-VALID': ['packages/vue-ui/src/CScrollbar/CScrollbar.vue', 'CCD-UI-028'],
  'OWNER-OC-PROFORM-NATIVE-VALID': ['packages/vue-ui/src/ProForm/renderers/components/ProInputText.vue', 'CCD-UI-063'],
  'OWNER-OC-MOTION-RUNTIME-VALID': ['apps/web-demo/src/plugins/animation/gsap.ts', 'CCD-UI-054'],
  'OWNER-OC-LAYOUT-RUNTIME-VALID': ['packages/vue-app-platform/src/layoutRuntime.ts', 'CCD-UI-067'],
})

function digestTree(repoRoot) {
  const records = []
  function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.name === '.git') continue
      const full = path.join(directory, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (entry.isFile()) records.push(`${path.relative(repoRoot, full)}:${crypto.createHash('sha256').update(fs.readFileSync(full)).digest('hex')}`)
      else records.push(`${path.relative(repoRoot, full)}:${entry.isSymbolicLink() ? 'symlink' : 'other'}`)
    }
  }
  walk(repoRoot)
  return crypto.createHash('sha256').update(records.join('\n')).digest('hex')
}

function subsetSnapshot(snapshot, file) {
  return deepFreeze({ ...snapshot, mode: 'paths', files: [file] })
}

function scanSnapshot(snapshot, authority, ruleIds, exceptionRegistry = authority.exceptions) {
  const built = buildSourceModels(snapshot, authority)
  const rawFindings = runDetectors({ authority, models: built.models, ruleIds })
  let diagnostics = finalizeDiagnostics(rawFindings)
  diagnostics = applyExceptions({ registry: exceptionRegistry, authority, snapshot, diagnostics, now: new Date('2026-07-19T00:00:00Z') })
  return { rawFindings, diagnostics, exit: diagnostics.some(item => item.baselineState !== 'EXCEPTED') ? 1 : 0 }
}

function validException(id, ruleId, filePath, dates = {}) {
  return { id, ruleId, scope: [filePath], justification: 'Self-test-only bounded exception authority.', authority: '.ai/rules/components/01-primevue-pt-styling.mdc', approvedBy: 'self-test', createdAt: dates.createdAt ?? '2026-07-18T00:00:00Z', expiresAt: dates.expiresAt ?? '2099-01-01T00:00:00Z' }
}

function baselineWith(template, entries) {
  return deepFreeze({ ...template, declaredFindingCount: entries.reduce((sum, entry) => sum + entry.count, 0), declaredFingerprintCount: entries.length, entries })
}

export const SELF_TEST_CASES = deepFreeze([...expectedCaseMap().keys()])

export function runSelfTest({ repoRoot, authority }) {
  const started = performance.now()
  const fixtureManifest = JSON.parse(fs.readFileSync(path.resolve(repoRoot, '.ai/governance/ui/fixtures/source-cases.json'), 'utf8'))
  assertJsonSchema(authority.schemas.fixtures, fixtureManifest, 'source fixtures')
  const expected = expectedCaseMap()
  const actualIds = fixtureManifest.cases.map(item => item.id)
  if (expected.size !== 162 || actualIds.length !== 162 || new Set(actualIds).size !== 162 || [...expected.keys()].some(id => !actualIds.includes(id))) fail('SELF_TEST_FAILURE', 'fixture case ID authority is not exact')
  for (const item of fixtureManifest.cases) {
    const [exit, reason] = expected.get(item.id)
    if (item.expectedExit !== exit || item.expectedReason !== reason) fail('SELF_TEST_FAILURE', `fixture expectation drift: ${item.id}`)
  }

  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ccd-ui-source-self-test-'))
  const fixtureRepo = path.join(temporaryRoot, 'fixtures')
  const modeRepo = path.join(temporaryRoot, 'modes')
  const isolatedHome = path.join(temporaryRoot, 'home')
  fs.mkdirSync(fixtureRepo, { recursive: true })
  fs.mkdirSync(isolatedHome, { recursive: true })
  const previousScannerHome = process.env.CCD_UI_SCANNER_HOME
  process.env.CCD_UI_SCANNER_HOME = isolatedHome
  const targetById = new Map()
  const results = []
  let mainSnapshot
  let fileByPath
  try {
    for (const testCase of fixtureManifest.cases) {
      const extension = path.extname(testCase.fixturePath)
      const binding = testCase.ruleId ? authority.bindingByRuleId[testCase.ruleId] : null
      let target = OWNER_TARGETS[testCase.id]?.[0]
      if (!target && testCase.id === 'SRC-CCD-UI-063-VALID') target = 'packages/vue-ui/src/ProForm/renderers/components/ProInputText.vue'
      if (!target && testCase.id === 'SRC-CCD-UI-066-VALID') target = 'packages/vue-primevue-adapter/src/theme/colorAdapter.ts'
      if (!target) target = targetForScope(binding?.scopeIds?.[0] ?? 'APP_VIEWS', testCase.id, extension)
      targetById.set(testCase.id, target)
      const fullTarget = path.join(fixtureRepo, target)
      fs.mkdirSync(path.dirname(fullTarget), { recursive: true })
      fs.writeFileSync(fullTarget, fs.readFileSync(path.resolve(repoRoot, testCase.fixturePath)))
    }
    runGit(fixtureRepo, ['init', '-q'])
    runGit(fixtureRepo, ['config', 'user.email', 'self-test@example.invalid'])
    runGit(fixtureRepo, ['config', 'user.name', 'CCD UI Self Test'])
    runGit(fixtureRepo, ['add', '--', ...targetById.values()])
    runGit(fixtureRepo, ['commit', '-qm', 'fixture authority'])
    const scopeRegistry = compileScopeRegistry(authority.manifest.scopes, authority.manifest.exclusions)
    mainSnapshot = acquireSourceSnapshot({ repoRoot: fixtureRepo, mode: 'default', scopeRegistry })
    fileByPath = new Map(mainSnapshot.files.map(file => [file.path, file]))

    const invalidSix = fileByPath.get(targetById.get('SRC-CCD-UI-006-INVALID'))
    const invalidSixScan = scanSnapshot(subsetSnapshot(mainSnapshot, invalidSix), authority, ['CCD-UI-006'])
    const baselineSnapshot = { commit: authority.manifest.baselineAuthority.commit }
    const currentBaseline = aggregateBaseline(invalidSixScan.diagnostics, authority, baselineSnapshot)
    const emptyBaseline = aggregateBaseline([], authority, baselineSnapshot)
    const fingerprintZero = `sha256:${'0'.repeat(64)}`

    fs.mkdirSync(modeRepo, { recursive: true })
    const modePath = 'apps/test/src/views/mode.ts'
    fs.mkdirSync(path.dirname(path.join(modeRepo, modePath)), { recursive: true })
    fs.writeFileSync(path.join(modeRepo, modePath), 'export const fixture = true\n')
    runGit(modeRepo, ['init', '-q'])
    runGit(modeRepo, ['config', 'user.email', 'self-test@example.invalid'])
    runGit(modeRepo, ['config', 'user.name', 'CCD UI Self Test'])
    runGit(modeRepo, ['add', '--', modePath])
    runGit(modeRepo, ['commit', '-qm', 'mode authority'])
    let shallowRepo = null

    function runCase(testCase) {
      const target = targetById.get(testCase.id)
      const file = fileByPath.get(target)
      if (testCase.group === 'rule') {
        const scanned = scanSnapshot(subsetSnapshot(mainSnapshot, file), authority, [testCase.ruleId])
        if (testCase.expectedExit === 1 && scanned.diagnostics.length !== 1) fail('SELF_TEST_FAILURE', `${testCase.id} must emit exactly one diagnostic`)
        return { exit: scanned.exit, reason: null }
      }
      if (testCase.group === 'owner') {
        const ruleId = OWNER_TARGETS[testCase.id][1]
        const scanned = scanSnapshot(subsetSnapshot(mainSnapshot, file), authority, [ruleId])
        if (scanned.diagnostics.length !== 0) fail('SELF_TEST_FAILURE', `${testCase.id} owner did not authorize its bounded evidence`)
        return { exit: 0, reason: null }
      }
      if (testCase.group === 'false-positive') {
        const ruleIds = authority.bindings.filter(binding => binding.detectorId === testCase.detectorId && binding.scannerCategory.startsWith('source-enforceable')).map(binding => binding.ruleId)
        const scanned = scanSnapshot(subsetSnapshot(mainSnapshot, file), authority, ruleIds)
        return { exit: scanned.exit, reason: null }
      }
      if (testCase.group === 'exception') {
        const ruleId = testCase.ruleId
        let exception
        if (testCase.id === 'EXCEPTION-ELIGIBLE-MATCH') exception = validException('CCD-UI-EXC-0001', ruleId, target)
        if (testCase.id === 'EXCEPTION-INELIGIBLE') exception = validException('CCD-UI-EXC-0002', ruleId, target)
        if (testCase.id === 'EXCEPTION-EXPIRED') exception = validException('CCD-UI-EXC-0003', ruleId, target, { expiresAt: '2026-01-01T00:00:00Z' })
        if (testCase.id === 'EXCEPTION-BROAD') exception = { ...validException('CCD-UI-EXC-0004', ruleId, target), scope: [`${path.posix.dirname(target)}/**`] }
        if (testCase.id === 'EXCEPTION-UNMATCHED') exception = validException('CCD-UI-EXC-0005', ruleId, target)
        const scanned = scanSnapshot(subsetSnapshot(mainSnapshot, file), authority, [ruleId], { schemaVersion: 'ccd-ui-exception-registry/v1', policyId: 'ccd-ui-policy/v2', exceptions: [exception] })
        return { exit: scanned.exit, reason: null }
      }
      if (testCase.group === 'parser-failure' || testCase.group === 'unsupported-scss') {
        buildSourceModels(subsetSnapshot(mainSnapshot, file), authority)
        return { exit: 0, reason: null }
      }
      if (testCase.group === 'fingerprint-result') {
        const source = invalidSix
        const first = scanSnapshot(subsetSnapshot(mainSnapshot, source), authority, ['CCD-UI-006'])
        if (testCase.id === 'FINGERPRINT-LINE-SHIFT-STABLE') {
          const shifted = { ...source, content: `\n${source.content}`, contentDigest: `${source.contentDigest}-shift` }
          const second = scanSnapshot(subsetSnapshot(mainSnapshot, deepFreeze(shifted)), authority, ['CCD-UI-006'])
          if (first.diagnostics[0].fingerprint !== second.diagnostics[0].fingerprint) fail('SELF_TEST_FAILURE', 'line shift changed fingerprint')
        } else if (testCase.id === 'FINGERPRINT-FILE-MOVE-CHANGES') {
          const moved = { ...source, path: `${path.posix.dirname(source.path)}/moved.ts`, contentDigest: `${source.contentDigest}-move` }
          const second = scanSnapshot(subsetSnapshot(mainSnapshot, deepFreeze(moved)), authority, ['CCD-UI-006'])
          if (first.diagnostics[0].fingerprint === second.diagnostics[0].fingerprint) fail('SELF_TEST_FAILURE', 'file move did not change fingerprint')
        } else {
          validateDiagnosticSet([first.diagnostics[0], first.diagnostics[0]])
        }
        return { exit: 0, reason: null }
      }
      if (testCase.group === 'baseline-render') {
        const one = currentBaseline
        const entry = one.entries[0]
        if (testCase.id === 'BASELINE-EMPTY') compareBaseline(emptyBaseline, emptyBaseline)
        else if (testCase.id === 'BASELINE-NEW-FINGERPRINT') compareBaseline(baselineWith(one, [{ ...entry, fingerprint: fingerprintZero }]), one)
        else if (testCase.id === 'BASELINE-COUNT-INCREASE') compareBaseline(baselineWith(one, [{ ...entry, count: 1 }]), baselineWith(one, [{ ...entry, count: 2 }]))
        else if (testCase.id === 'BASELINE-NEW-FILE') compareBaseline(baselineWith(one, [{ ...entry, path: 'apps/test/src/views/old.ts', fingerprint: fingerprintZero }]), one)
        else if (testCase.id === 'BASELINE-STALE-FINDING') compareBaseline(baselineWith(one, [entry, { ...entry, fingerprint: fingerprintZero }]), one)
        else if (testCase.id === 'BASELINE-COUNT-DECREASE') compareBaseline(baselineWith(one, [{ ...entry, count: 2 }]), one)
        else if (testCase.id === 'BASELINE-REMOVED-FILE') compareBaseline(baselineWith(one, [entry, { ...entry, path: 'apps/test/src/views/removed.ts', fingerprint: fingerprintZero }]), one)
        else if (testCase.id === 'BASELINE-PRUNE-ACCEPT') pruneBaseline(baselineWith(one, [{ ...entry, count: 2 }]), one)
        else if (testCase.id === 'BASELINE-PRUNE-REJECT') pruneBaseline(emptyBaseline, one)
        else if (testCase.id === 'BASELINE-WRONG-REPOSITORY') validateBaseline({ ...emptyBaseline, repository: 'other/repo' }, authority)
        else if (testCase.id === 'BASELINE-WRONG-COMMIT') validateBaseline({ ...emptyBaseline, baselineCommit: '1'.repeat(40) }, authority)
        else if (testCase.id === 'BASELINE-POLICY-DIGEST') validateBaseline({ ...emptyBaseline, policyDigest: fingerprintZero }, authority)
        else if (testCase.id === 'BASELINE-MANIFEST-DIGEST') validateBaseline({ ...emptyBaseline, scannerManifestDigest: fingerprintZero }, authority)
        else if (testCase.id === 'BASELINE-MODULE-DIGEST') {
          const digests = { ...emptyBaseline.scannerModuleDigests }
          digests[Object.keys(digests)[0]] = fingerprintZero
          validateBaseline({ ...emptyBaseline, scannerModuleDigests: digests }, authority)
        } else if (testCase.id === 'RENDER-TEXT-JSON-PARITY') {
          const result = buildResult({ snapshot: subsetSnapshot(mainSnapshot, invalidSix), diagnostics: invalidSixScan.diagnostics, performance: { elapsedMs: 0, maxRssBytes: 0 } })
          assertRenderParity(result)
          if (!renderText(result).endsWith('\n') || !renderJson(result).endsWith('\n')) fail('SELF_TEST_FAILURE', 'render output must end in LF')
        } else if (testCase.id === 'DIAGNOSTIC-ORDERING') sortDiagnostics([...invalidSixScan.diagnostics].reverse())
        return { exit: 0, reason: null }
      }
      if (testCase.group === 'git-mode') {
        if (testCase.id === 'MODE-UNTRACKED-CANDIDATE') {
          const untracked = 'apps/test/src/views/untracked.ts'
          fs.writeFileSync(path.join(modeRepo, untracked), "alert('x')\n")
          const snapshot = acquireSourceSnapshot({ repoRoot: modeRepo, mode: 'default', scopeRegistry })
          const scanned = scanSnapshot(snapshot, authority, ['CCD-UI-006'])
          fs.rmSync(path.join(modeRepo, untracked))
          return { exit: scanned.exit, reason: null }
        }
        if (testCase.id === 'MODE-STAGED-UNSTAGED-ISOLATION') {
          fs.writeFileSync(path.join(modeRepo, modePath), 'export const staged = true\n')
          runGit(modeRepo, ['add', '--', modePath])
          fs.writeFileSync(path.join(modeRepo, modePath), "alert('unstaged')\n")
          const snapshot = acquireSourceSnapshot({ repoRoot: modeRepo, mode: 'staged', scopeRegistry })
          const scanned = scanSnapshot(snapshot, authority, ['CCD-UI-006'])
          runGit(modeRepo, ['read-tree', 'HEAD'])
          fs.writeFileSync(path.join(modeRepo, modePath), 'export const fixture = true\n')
          return { exit: scanned.exit, reason: null }
        }
        if (testCase.id === 'MODE-COMMIT-WORKTREE-ISOLATION') {
          fs.writeFileSync(path.join(modeRepo, modePath), "alert('worktree')\n")
          const snapshot = acquireSourceSnapshot({ repoRoot: modeRepo, mode: 'ref', ref: 'HEAD', scopeRegistry })
          const scanned = scanSnapshot(snapshot, authority, ['CCD-UI-006'])
          fs.writeFileSync(path.join(modeRepo, modePath), 'export const fixture = true\n')
          return { exit: scanned.exit, reason: null }
        }
        if (testCase.id === 'MODE-MISSING-SHALLOW-OBJECT') acquireSourceSnapshot({ repoRoot: modeRepo, mode: 'ref', ref: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeef', scopeRegistry })
        if (testCase.id === 'MODE-CLEAN-SHALLOW') {
          shallowRepo = path.join(temporaryRoot, 'shallow')
          const clone = spawnSync('git', ['clone', '--depth=1', '-q', `file://${modeRepo}`, shallowRepo], { encoding: 'utf8', env: { ...process.env, HOME: isolatedHome, GIT_CONFIG_NOSYSTEM: '1' } })
          if (clone.status !== 0) fail('SELF_TEST_FAILURE', `shallow clone failed: ${clone.stderr}`)
          const snapshot = acquireSourceSnapshot({ repoRoot: shallowRepo, mode: 'default', scopeRegistry })
          return { exit: scanSnapshot(snapshot, authority, ['CCD-UI-006']).exit, reason: null }
        }
        if (testCase.id === 'MODE-DIRTY-SHALLOW') {
          if (!shallowRepo) fail('SELF_TEST_FAILURE', 'clean shallow case must run first')
          fs.writeFileSync(path.join(shallowRepo, modePath), "alert('dirty')\n")
          acquireSourceSnapshot({ repoRoot: shallowRepo, mode: 'default', scopeRegistry })
        }
        return { exit: 0, reason: null }
      }
      if (testCase.group === 'safety') {
        if (testCase.id === 'PATH-TRAVERSAL') acquireSourceSnapshot({ repoRoot: modeRepo, mode: 'paths', paths: ['../escape.ts'], scopeRegistry })
        if (testCase.id === 'SYMLINK-ESCAPE') {
          const link = 'apps/test/src/views/link.ts'
          fs.symlinkSync(path.join(temporaryRoot, 'outside.ts'), path.join(modeRepo, link))
          acquireSourceSnapshot({ repoRoot: modeRepo, mode: 'paths', paths: [link], scopeRegistry })
        }
        if (testCase.id === 'NO-REPOSITORY-WRITE') {
          const before = digestTree(modeRepo)
          const snapshot = acquireSourceSnapshot({ repoRoot: modeRepo, mode: 'paths', paths: [modePath], scopeRegistry })
          scanSnapshot(snapshot, authority, ['CCD-UI-006'])
          if (digestTree(modeRepo) !== before) fail('SELF_TEST_FAILURE', 'normal validation wrote repository files')
        }
        if (testCase.id === 'NO-REAL-HOME-ACCESS') {
          const trapHome = path.join(temporaryRoot, 'home-trap')
          fs.mkdirSync(trapHome)
          fs.chmodSync(trapHome, 0o000)
          const previousHome = process.env.HOME
          process.env.HOME = trapHome
          try {
            const snapshot = acquireSourceSnapshot({ repoRoot: modeRepo, mode: 'paths', paths: [modePath], scopeRegistry })
            scanSnapshot(snapshot, authority, ['CCD-UI-006'])
          } finally {
            process.env.HOME = previousHome
            fs.chmodSync(trapHome, 0o700)
          }
        }
        return { exit: 0, reason: null }
      }
      fail('SELF_TEST_FAILURE', `unhandled fixture group ${testCase.group}`)
    }

    for (const testCase of fixtureManifest.cases) {
      const caseStarted = performance.now()
      let actual = { exit: 0, reason: null }
      try {
        actual = runCase(testCase)
      } catch (error) {
        if (!(error instanceof ScannerError)) throw error
        actual = { exit: error.exitCode, reason: error.reason }
      }
      const [expectedExit, expectedReason] = expected.get(testCase.id)
      const passed = actual.exit === expectedExit && (expectedReason === null || actual.reason === expectedReason)
      results.push(deepFreeze({ id: expectedExit === 0 ? `ST-POS-${testCase.id}` : `ST-NEG-${testCase.id}`, caseId: testCase.id, expectedExit, expectedReason, actualExit: actual.exit, actualReason: actual.reason, passed, elapsedMs: Number((performance.now() - caseStarted).toFixed(3)) }))
    }
  } finally {
    if (previousScannerHome === undefined) delete process.env.CCD_UI_SCANNER_HOME
    else process.env.CCD_UI_SCANNER_HOME = previousScannerHome
    fs.rmSync(temporaryRoot, { recursive: true, force: true })
  }
  const elapsedMs = performance.now() - started
  const maxRssBytes = process.resourceUsage().maxRSS * 1024
  const failed = results.filter(result => !result.passed)
  if (failed.length > 0) fail('SELF_TEST_FAILURE', `${failed.length} of 162 source cases failed`, failed)
  if (elapsedMs > authority.manifest.performance.selfTestMs) fail('PERFORMANCE_BUDGET', `self-test took ${elapsedMs.toFixed(3)}ms; budget is ${authority.manifest.performance.selfTestMs}ms`)
  if (maxRssBytes > authority.manifest.performance.maxRssBytes) fail('PERFORMANCE_BUDGET', `self-test RSS ${maxRssBytes} exceeds ${authority.manifest.performance.maxRssBytes}`)
  return deepFreeze({ schemaVersion: 'ccd-ui-source-self-test/v1', declared: 162, passed: 162, failed: 0, elapsedMs: Number(elapsedMs.toFixed(3)), maxRssBytes, caseDigest: `sha256:${crypto.createHash('sha256').update(canonicalJson(results.map(result => ({ id: result.id, exit: result.actualExit, reason: result.actualReason })))).digest('hex')}`, cases: results })
}
