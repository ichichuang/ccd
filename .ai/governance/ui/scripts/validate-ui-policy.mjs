#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '../../../../')

const colors = {
  red: s => `\x1b[31m${s}\x1b[0m`,
  green: s => `\x1b[32m${s}\x1b[0m`,
  yellow: s => `\x1b[33m${s}\x1b[0m`,
  cyan: s => `\x1b[36m${s}\x1b[0m`,
}

let errors = []
let passed = 0

function fail(msg) {
  errors.push(msg)
}
function ok(msg) {
  passed++
}

function rel(p) {
  return path.relative(repoRoot, p)
}

function readJson(p, required = true) {
  const full = path.resolve(repoRoot, p)
  if (!fs.existsSync(full)) {
    if (required) throw new Error(`Missing file: ${p}`)
    return null
  }
  return JSON.parse(fs.readFileSync(full, 'utf8'))
}

// Minimal JSON Schema draft-07 validator sufficient for our schemas.
class MiniValidator {
  constructor(schema, root = schema, defs = schema.definitions, rootFile = schema.__file__) {
    this.schema = schema
    this.root = root
    this.defs = defs || root.definitions
    this.rootFile = rootFile || schema.__file__
  }

  validate(data, schema = this.schema, pathStr = '') {
    if (schema === true) return
    if (schema === false) throw new ValidationError(pathStr, 'schema false')
    if (schema.$ref) {
      const ref = schema.$ref
      let target
      if (ref.startsWith('#/definitions/')) {
        const name = ref.slice('#/definitions/'.length)
        target = this.defs?.[name]
      } else if (ref.endsWith('.schema.json')) {
        // Load external schema from same directory as root schema
        const rootFile = this.rootFile
        const base = rootFile ? path.dirname(rootFile) : process.cwd()
        const extPath = path.resolve(base, ref)
        target = JSON.parse(fs.readFileSync(extPath, 'utf8'))
        target.__file__ = extPath
      } else {
        throw new ValidationError(pathStr, `unsupported $ref ${ref}`)
      }
      if (!target) throw new ValidationError(pathStr, `unresolved $ref ${ref}`)
      const childValidator = new MiniValidator(target, this.root, this.defs, this.rootFile)
      return childValidator.validate(data, target, pathStr)
    }

    if (schema.type) {
      const types = Array.isArray(schema.type) ? schema.type : [schema.type]
      let actual = data === null ? 'null' : Array.isArray(data) ? 'array' : typeof data
      if (actual === 'number' && types.includes('integer') && Number.isInteger(data)) {
        actual = 'integer'
      }
      if (!types.includes(actual)) {
        throw new ValidationError(pathStr, `expected type ${schema.type}, got ${actual}`)
      }
    }

    if (schema.enum && !schema.enum.includes(data)) {
      throw new ValidationError(pathStr, `value ${JSON.stringify(data)} not in enum`)
    }

    if (typeof data === 'string') {
      if (schema.minLength !== undefined && data.length < schema.minLength) {
        throw new ValidationError(pathStr, `minLength ${schema.minLength}`)
      }
      if (schema.maxLength !== undefined && data.length > schema.maxLength) {
        throw new ValidationError(pathStr, `maxLength ${schema.maxLength}`)
      }
      if (schema.pattern && !new RegExp(schema.pattern).test(data)) {
        throw new ValidationError(pathStr, `pattern ${schema.pattern}`)
      }
      if (
        schema.format === 'date-time' &&
        !/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z/.test(data)
      ) {
        throw new ValidationError(pathStr, 'format date-time')
      }
    }

    if (typeof data === 'number') {
      if (schema.minimum !== undefined && data < schema.minimum) {
        throw new ValidationError(pathStr, `minimum ${schema.minimum}`)
      }
    }

    if (Array.isArray(data)) {
      if (schema.minItems !== undefined && data.length < schema.minItems) {
        throw new ValidationError(pathStr, `minItems ${schema.minItems}`)
      }
      if (schema.items) {
        data.forEach((item, i) => this.validate(item, schema.items, `${pathStr}[${i}]`))
      }
    }

    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
      if (schema.propertyNames) {
        for (const key of Object.keys(data)) {
          this.validate(key, schema.propertyNames, `${pathStr}<key:${key}>`)
        }
      }
      if (schema.required) {
        for (const key of schema.required) {
          if (!(key in data)) {
            throw new ValidationError(pathStr, `missing required property ${key}`)
          }
        }
      }
      if (schema.additionalProperties === false) {
        const allowed = new Set(Object.keys(schema.properties || {}))
        for (const key of Object.keys(data)) {
          if (!allowed.has(key)) {
            throw new ValidationError(pathStr, `additional property ${key} not allowed`)
          }
        }
      }
      if (schema.properties) {
        for (const [key, sub] of Object.entries(schema.properties)) {
          if (key in data) {
            this.validate(data[key], sub, `${pathStr}.${key}`)
          }
        }
      }
    }

    if (schema.oneOf) {
      const matched = schema.oneOf.filter(sub => {
        try {
          this.validate(data, sub, pathStr)
          return true
        } catch {
          return false
        }
      })
      if (matched.length !== 1) {
        throw new ValidationError(pathStr, `oneOf matched ${matched.length} schemas`)
      }
    }
  }
}

class ValidationError extends Error {
  constructor(path, message) {
    super(`${path}: ${message}`)
    this.path = path
    this.schemaMessage = message
  }
}

function validateAgainstSchema(doc, schemaPath, label) {
  const fullSchemaPath = path.resolve(repoRoot, schemaPath)
  const schema = JSON.parse(fs.readFileSync(fullSchemaPath, 'utf8'))
  schema.__file__ = fullSchemaPath
  const validator = new MiniValidator(schema)
  try {
    validator.validate(doc)
    ok(`${label} passes ${rel(schemaPath)}`)
    return true
  } catch (e) {
    fail(`${label} schema error: ${e.message}`)
    return false
  }
}

function validateFixturePair(schemaPath, validPath, invalidPath, label) {
  const valid = readJson(validPath)
  const invalid = readJson(invalidPath)
  validateAgainstSchema(valid, schemaPath, `${label} valid fixture`)
  const fullSchemaPath = path.resolve(repoRoot, schemaPath)
  const schema = JSON.parse(fs.readFileSync(fullSchemaPath, 'utf8'))
  schema.__file__ = fullSchemaPath
  const validator = new MiniValidator(schema)
  try {
    validator.validate(invalid)
    fail(`${label} invalid fixture unexpectedly passed schema`)
  } catch (e) {
    ok(`${label} invalid fixture correctly failed schema: ${e.message.split(':').pop().trim()}`)
  }
}

function checkFileExists(p, label) {
  const full = path.resolve(repoRoot, p)
  if (!fs.existsSync(full)) fail(`${label} not found: ${p}`)
  else ok(`${label} exists: ${rel(full)}`)
}

function runRuleCases(policy, cases) {
  // Simple deterministic matchers for baseline cases.
  const matchers = {
    'CCD-UI-001': { pass: /ProTable|ProForm/, fail: /<DataTable|<form|<input|<button/ },
    'CCD-UI-010': { pass: null, fail: /:deep\(\s*\.p-/ },
    'CCD-UI-064': {
      pass: /ProTable\/ProTable\.vue|login\/index\.vue|AnimateRouterView\.vue/,
      fail: null,
    },
    'CCD-UI-005': { pass: /UseEcharts|useChartTheme/, fail: /vue-echarts|echarts\.init/ },
    'CCD-UI-006': { pass: /ProToast|\$toast|\$message/, fail: /alert\(|confirm\(/ },
    'CCD-UI-015': {
      pass: /text-foreground|bg-background/,
      fail: /#\[?[0-9a-fA-F]{3,8}\]?|#\b[0-9a-fA-F]{3}\b/,
    },
    'CCD-UI-012': { pass: /w-\[var\(|p-md|gap-sm/, fail: /\[\d+rem\]|\[.*em\]/ },
    'CCD-UI-013': { pass: /calc\(|100dvh|var\(--/, fail: /\[\d+rem\]|\[.*em\]/ },
  }

  for (const c of cases) {
    const m = matchers[c.ruleId]
    if (!m) {
      fail(`No matcher for rule case ${c.id}`)
      continue
    }
    const fixture = c.fixture
    let result
    if (c.intent === 'pass') {
      const okMatch = m.pass && m.pass.test(fixture)
      const badMatch = m.fail && m.fail.test(fixture)
      result = okMatch && !badMatch
    } else {
      const badMatch = m.fail && m.fail.test(fixture)
      result = !!badMatch
    }
    if (result) ok(`rule case ${c.id} (${c.intent}) passed`)
    else fail(`rule case ${c.id} (${c.intent}) failed on fixture: ${fixture}`)
  }
}

function runMutationTests(policy, schemaPath) {
  // Missing field
  const missingField = JSON.parse(JSON.stringify(policy))
  delete missingField.rules[0].severity
  const fullSchemaPath = path.resolve(repoRoot, schemaPath)
  const schema = JSON.parse(fs.readFileSync(fullSchemaPath, 'utf8'))
  schema.__file__ = fullSchemaPath
  const v1 = new MiniValidator(schema)
  try {
    v1.validate(missingField)
    fail('mutation: missing severity should fail')
  } catch {
    ok('mutation: missing severity rejected')
  }

  // Bad ID
  const badId = JSON.parse(JSON.stringify(policy))
  badId.rules[0].id = 'CCD-UI-1'
  const v2 = new MiniValidator(schema)
  try {
    v2.validate(badId)
    fail('mutation: bad rule id should fail')
  } catch {
    ok('mutation: bad rule id rejected')
  }

  // Invalid disposition
  const badDisp = JSON.parse(JSON.stringify(policy))
  badDisp.rules[0].disposition = 'machine-rule'
  const v3 = new MiniValidator(schema)
  try {
    v3.validate(badDisp)
    fail('mutation: invalid disposition should fail')
  } catch {
    ok('mutation: invalid disposition rejected')
  }

  // Invalid enforcement
  const badEnf = JSON.parse(JSON.stringify(policy))
  badEnf.rules[0].enforcement = 'auto-fixed'
  const v4 = new MiniValidator(schema)
  try {
    v4.validate(badEnf)
    fail('mutation: invalid enforcement should fail')
  } catch {
    ok('mutation: invalid enforcement rejected')
  }

  // Invalid structural grammar
  const badGrammar = JSON.parse(JSON.stringify(policy))
  badGrammar.rules[0].structuralGrammar = ['px']
  const v5 = new MiniValidator(schema)
  try {
    v5.validate(badGrammar)
    fail('mutation: invalid structural grammar should fail')
  } catch {
    ok('mutation: invalid structural grammar rejected')
  }

  // Unauthorized scope path
  const badScope = JSON.parse(JSON.stringify(policy))
  badScope.rules[0].scope = ['../outside']
  const v6 = new MiniValidator(schema)
  try {
    v6.validate(badScope)
    fail('mutation: unauthorized scope should fail')
  } catch {
    ok('mutation: unauthorized scope rejected')
  }

  // False source compliance: map a malformed P2C id
  const badMapping = JSON.parse(JSON.stringify(policy))
  badMapping.sourceRequirementMappings['P2C-REQ-999'] = 'CCD-UI-001'
  const v7 = new MiniValidator(schema)
  try {
    v7.validate(badMapping)
    fail('mutation: bad source requirement id should fail')
  } catch {
    ok('mutation: bad source requirement id rejected')
  }

  // Source scanner delivery forbidden
  const scannerDelivered = JSON.parse(JSON.stringify(policy))
  scannerDelivered.sourceScannerImplemented = true
  const v8 = new MiniValidator(schema)
  try {
    v8.validate(scannerDelivered)
    fail('mutation: source scanner delivered should fail')
  } catch {
    ok('mutation: source scanner delivered rejected')
  }

  // P4 started forbidden
  const p4Started = JSON.parse(JSON.stringify(policy))
  p4Started.p4Started = true
  const v9 = new MiniValidator(schema)
  try {
    v9.validate(p4Started)
    fail('mutation: p4Started should fail')
  } catch {
    ok('mutation: p4Started rejected')
  }

  // P5 started forbidden
  const p5Started = JSON.parse(JSON.stringify(policy))
  p5Started.p5Started = true
  const v10 = new MiniValidator(schema)
  try {
    v10.validate(p5Started)
    fail('mutation: p5Started should fail')
  } catch {
    ok('mutation: p5Started rejected')
  }
}

function main() {
  console.log(colors.cyan('CCD P3 Machine UI Policy Validator'))

  const policy = readJson('.ai/governance/policies/ui.json')
  const profile = readJson('.ai/governance/ui/profiles/ccd-architectural-glass.json')
  const exceptions = readJson('.ai/governance/ui/exceptions.json')
  const coverage = readJson('.ai/governance/coverage/project-ui-semantic-coverage.json')
  const ruleCases = readJson('.ai/governance/ui/fixtures/rule-cases.json')

  // Schema validations.
  validateAgainstSchema(policy, '.ai/governance/ui/schemas/ui-policy.schema.json', 'Policy')
  validateAgainstSchema(
    profile,
    '.ai/governance/ui/schemas/product-ui-profile.schema.json',
    'Profile'
  )
  validateAgainstSchema(
    exceptions,
    '.ai/governance/ui/schemas/ui-exception-registry.schema.json',
    'Exception registry'
  )

  // Fixture validations.
  validateFixturePair(
    '.ai/governance/ui/schemas/ui-policy.schema.json',
    '.ai/governance/ui/fixtures/schema-valid/ui-policy.json',
    '.ai/governance/ui/fixtures/schema-invalid/ui-policy.json',
    'ui-policy'
  )
  validateFixturePair(
    '.ai/governance/ui/schemas/product-ui-profile.schema.json',
    '.ai/governance/ui/fixtures/schema-valid/product-ui-profile.json',
    '.ai/governance/ui/fixtures/schema-invalid/product-ui-profile.json',
    'product-ui-profile'
  )
  validateFixturePair(
    '.ai/governance/ui/schemas/ui-exception.schema.json',
    '.ai/governance/ui/fixtures/schema-valid/ui-exception.json',
    '.ai/governance/ui/fixtures/schema-invalid/ui-exception.json',
    'ui-exception'
  )
  validateFixturePair(
    '.ai/governance/ui/schemas/ui-exception-registry.schema.json',
    '.ai/governance/ui/fixtures/schema-valid/ui-exception-registry.json',
    '.ai/governance/ui/fixtures/schema-invalid/ui-exception-registry.json',
    'ui-exception-registry'
  )

  // Structural policy checks.
  if (policy.rules.length !== 68) fail(`Expected 68 rules, got ${policy.rules.length}`)
  else ok('Rule count is 68')

  if (policy.clusters.length !== 14) fail(`Expected 14 clusters, got ${policy.clusters.length}`)
  else ok('Cluster count is 14')

  const expectedIds = Array.from(
    { length: 68 },
    (_, i) => `CCD-UI-${String(i + 1).padStart(3, '0')}`
  )
  const actualIds = policy.rules.map(r => r.id)
  if (JSON.stringify(actualIds) !== JSON.stringify(expectedIds)) {
    fail(`Rule IDs are not contiguous CCD-UI-001..CCD-UI-068: ${actualIds.join(', ')}`)
  } else {
    ok('Rule IDs are contiguous CCD-UI-001..CCD-UI-068')
  }

  // Required fields present on every rule (schema already checks, but double-check explicitly).
  const requiredFields = [
    'id',
    'title',
    'description',
    'cluster',
    'severity',
    'owner',
    'scope',
    'sourceRequirementIds',
    'disposition',
    'enforcement',
    'exceptionEligible',
    'evidenceKind',
    'authorityPath',
    'authoritySection',
    'detector',
    'structuralGrammar',
    'message',
    'pageContractDependency',
    'lifecycle',
  ]
  for (const r of policy.rules) {
    for (const f of requiredFields) {
      if (!(f in r)) fail(`Rule ${r.id} missing field ${f}`)
    }
  }
  ok('All required rule fields present')

  // Scope paths must not escape repository or contain traversal.
  for (const r of policy.rules) {
    for (const s of r.scope) {
      if (s.includes('..') || s.startsWith('/') || s.startsWith('\\')) {
        fail(`Rule ${r.id} scope contains unauthorized path ${s}`)
      }
    }
  }
  ok('Scope paths are authorized')

  // Closed registries.
  const allowedSeverities = new Set(['error', 'warning'])
  const allowedOwners = new Set([
    'token-source',
    'unocss-preset',
    'shared-ui',
    'primevue-adapter',
    'chart-wrapper',
    'layout-runtime',
    'business-app',
    'product-profile',
    'product-language-review',
    'motion-system',
    'accessibility',
  ])
  const allowedDispositions = new Set([
    'permanent-rule',
    'human-review-only',
    'future-page-contract',
  ])
  const allowedEnforcements = new Set([
    'schema-validated',
    'fixture-covered',
    'source-scanner-not-yet-implemented',
    'human-review-only',
    'future-page-contract',
  ])
  const allowedEvidenceKinds = new Set([
    'executable-validator',
    'automated-test',
    'implementation-evidence',
    'registry-evidence',
    'authority-document',
    'none',
  ])
  const allowedGrammar = new Set([
    '100%',
    '100dvh',
    'auto',
    'min-content',
    'max-content',
    'fit-content',
    'fr',
    'minmax',
    'var',
    'calc',
    'min',
    'max',
    'clamp',
  ])
  for (const r of policy.rules) {
    if (!allowedSeverities.has(r.severity)) fail(`Rule ${r.id} has invalid severity ${r.severity}`)
    if (!allowedOwners.has(r.owner)) fail(`Rule ${r.id} has invalid owner ${r.owner}`)
    if (!allowedDispositions.has(r.disposition))
      fail(`Rule ${r.id} has invalid disposition ${r.disposition}`)
    if (!allowedEnforcements.has(r.enforcement))
      fail(`Rule ${r.id} has invalid enforcement ${r.enforcement}`)
    if (!allowedEvidenceKinds.has(r.evidenceKind))
      fail(`Rule ${r.id} has invalid evidenceKind ${r.evidenceKind}`)
    for (const g of r.structuralGrammar) {
      if (!allowedGrammar.has(g)) fail(`Rule ${r.id} has invalid structural grammar token ${g}`)
    }
  }
  ok('Closed registries respected')

  // Bidirectional source mappings.
  const ruleSourceMap = new Map()
  for (const r of policy.rules) {
    for (const sid of r.sourceRequirementIds) {
      if (ruleSourceMap.has(sid)) fail(`P2C requirement ${sid} assigned to multiple rules`)
      ruleSourceMap.set(sid, r.id)
    }
  }
  if (ruleSourceMap.size !== 68)
    fail(`Expected 68 unique source requirement mappings, got ${ruleSourceMap.size}`)
  else ok('68 unique source requirements mapped to rules')

  for (const [sid, rid] of ruleSourceMap) {
    const rule = policy.rules.find(r => r.id === rid)
    const mapping = policy.sourceRequirementMappings[sid]
    const expected = rule.disposition === 'human-review-only' ? 'human-review-only' : rid
    if (mapping !== expected)
      fail(`sourceRequirementMappings[${sid}] = ${mapping}, expected ${expected}`)
  }
  ok('sourceRequirementMappings agree with rule sourceRequirementIds')

  for (const [rid, sids] of Object.entries(policy.ruleToSourceMappings)) {
    const rule = policy.rules.find(r => r.id === rid)
    if (!rule) {
      fail(`ruleToSourceMappings references unknown rule ${rid}`)
      continue
    }
    if (JSON.stringify(rule.sourceRequirementIds) !== JSON.stringify(sids)) {
      fail(`ruleToSourceMappings[${rid}] does not match rule.sourceRequirementIds`)
    }
  }
  ok('ruleToSourceMappings equal rule sourceRequirementIds')

  // All P2C-REQ IDs in coverage are mapped, and no unknown IDs appear.
  const coverageIds = coverage.requirements.map(r => r.requirementId)
  const coverageIdSet = new Set(coverageIds)
  for (const cid of coverageIds) {
    if (!(cid in policy.sourceRequirementMappings))
      fail(`Coverage requirement ${cid} missing from sourceRequirementMappings`)
  }
  for (const mid of Object.keys(policy.sourceRequirementMappings)) {
    if (!coverageIdSet.has(mid))
      fail(`sourceRequirementMappings contains unknown requirement ${mid}`)
  }
  if (Object.keys(policy.sourceRequirementMappings).length !== coverageIds.length) {
    fail(
      `sourceRequirementMappings count ${Object.keys(policy.sourceRequirementMappings).length} != coverage requirement count ${coverageIds.length}`
    )
  }
  ok('All coverage P2C-REQ IDs are mapped bidirectionally')

  // Human-review-only checks.
  const humanReviewRules = policy.rules.filter(r => r.disposition === 'human-review-only')
  const requiredHumanReview = new Set([
    'P2C-REQ-0206',
    'P2C-REQ-0208',
    'P2C-REQ-0308',
    'P2C-REQ-0310',
    'P2C-REQ-0301',
    'P2C-REQ-0304',
    'P2C-REQ-0348',
    'P2C-REQ-0350',
    'P2C-REQ-0352',
    'P2C-REQ-0349',
    'P2C-REQ-0329',
    'P2C-REQ-0330',
    'P2C-REQ-0347',
    'P2C-REQ-0354',
  ])
  for (const id of requiredHumanReview) {
    if (!policy.humanReviewOnly.includes(id)) fail(`Required human-review-only ID ${id} missing`)
    const rule = policy.rules.find(r => r.sourceRequirementIds.includes(id))
    if (!rule) {
      fail(`Required human-review ID ${id} not a rule`)
      continue
    }
    if (rule.disposition !== 'human-review-only' || rule.enforcement !== 'human-review-only') {
      fail(`Rule for ${id} must be human-review-only`)
    }
  }
  ok('Required human-review-only requirements present and correctly classified')

  // Page contract deferrals.
  const pageContractDeferrals = ['P2C-REQ-0006', 'P2C-REQ-0028', 'P2C-REQ-0065', 'P2C-REQ-0067']
  for (const id of pageContractDeferrals) {
    if (!policy.futurePageContract.includes(id)) fail(`Page contract deferral ${id} missing`)
    if (policy.rules.some(r => r.sourceRequirementIds.includes(id)))
      fail(`Page contract deferral ${id} must not be a canonical rule`)
  }
  ok('Page contract deferrals excluded from canonical rules')

  // Historical markers.
  if (policy.lineageOnlyMarkers.length !== 16)
    fail(`Expected 16 lineage-only markers, got ${policy.lineageOnlyMarkers.length}`)
  else ok('Lineage-only marker count is 16')
  for (const id of policy.lineageOnlyMarkers) {
    if (policy.rules.some(r => r.sourceRequirementIds.includes(id)))
      fail(`Lineage marker ${id} must not be a canonical rule`)
    if (
      id in policy.sourceRequirementMappings &&
      policy.sourceRequirementMappings[id] !== 'historical-marker'
    ) {
      fail(`Lineage marker ${id} mapping must be historical-marker`)
    }
  }
  ok('Lineage-only markers are not canonical units')

  // Semantic-area coverage: cluster names from task present.
  const expectedClusterNames = [
    'Component priority and native-structural boundaries',
    'Form abstraction and ownership',
    'Chart ownership and ECharts theming',
    'Feedback, overlays, and focus ownership',
    'PrimeVue PassThrough ownership and conflict prevention',
    'Deep-selector prohibition and finite exact eligibility',
    'Visual constants, inline styles, UnoCSS boundaries',
    'Themes, contrast, and color contract',
    'Responsive ownership and breakpoints',
    'Layout roots, scrolling, and safe areas',
    'Material, glass safety, z-index, optical depth, borders, shadows',
    'Product UI Profile and product-language review',
    'Accessibility, state visibility, theme-state preservation',
    'Motion ownership, reduced motion, cleanup, performance, runtime-state ownership, listener lifecycle, initialization idempotency, UI-only behavior preservation',
  ]
  const clusterNames = new Set(policy.clusters.map(c => c.name))
  for (const n of expectedClusterNames) {
    if (!clusterNames.has(n)) fail(`Missing cluster ${n}`)
  }
  ok('All 14 semantic-obligation cluster names present')

  // Authority path/section existence.
  for (const r of policy.rules) {
    const full = path.resolve(repoRoot, r.authorityPath)
    if (!fs.existsSync(full)) fail(`Rule ${r.id} authorityPath missing: ${r.authorityPath}`)
    if (!r.authoritySection || r.authoritySection.length < 1)
      fail(`Rule ${r.id} authoritySection empty`)
  }
  ok('Authority paths and sections present')

  // Exception boundaries.
  if (exceptions.exceptions.length !== 0)
    fail(
      `Exception registry must contain zero real exceptions, got ${exceptions.exceptions.length}`
    )
  else ok('Exception registry contains zero real exceptions')

  const eligibleIds = new Set(policy.exceptionPolicy.exceptionEligibleRuleIds)
  if (eligibleIds.size !== 1 || !eligibleIds.has('CCD-UI-064')) {
    fail(`Only CCD-UI-064 should be exception eligible, got ${[...eligibleIds].join(', ')}`)
  }
  for (const r of policy.rules) {
    if (r.exceptionEligible && !eligibleIds.has(r.id))
      fail(`Rule ${r.id} exceptionEligible true but not in exceptionPolicy list`)
  }
  ok('Exception eligibility narrowly scoped to deep-selector rule')

  // Lifecycle.
  if (policy.lifecycles.baselineRuleIds.length !== 68)
    fail(`Expected 68 baseline rule IDs, got ${policy.lifecycles.baselineRuleIds.length}`)
  if (policy.lifecycles.completionRuleIds.length !== 0)
    fail(`Expected 0 completion rule IDs, got ${policy.lifecycles.completionRuleIds.length}`)
  for (const r of policy.rules) {
    if (r.lifecycle !== 'baseline') fail(`Rule ${r.id} lifecycle must be baseline`)
  }
  ok('All rules are baseline lifecycle')

  // Source scanner / phase flags.
  if (policy.sourceScannerImplemented !== false) fail('sourceScannerImplemented must be false')
  if (policy.pageContractCreated !== false) fail('pageContractCreated must be false')
  if (policy.p4Started !== false) fail('p4Started must be false')
  if (policy.p5Started !== false) fail('p5Started must be false')
  ok('Source scanner, Page Contract, P4, P5 remain unstarted')

  // Rule cases.
  runRuleCases(policy, ruleCases.cases)

  // Mutation / self-tests.
  runMutationTests(policy, '.ai/governance/ui/schemas/ui-policy.schema.json')

  // Summary.
  console.log('')
  if (errors.length === 0) {
    console.log(colors.green(`✓ All ${passed} checks passed`))
    process.exit(0)
  } else {
    console.log(colors.red(`✗ ${errors.length} failure(s):`))
    for (const e of errors) console.log(colors.red('  - ' + e))
    process.exit(1)
  }
}

main()
