#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '../../../../')

const EXPECTED_SCOPE_REGISTRY = {
  'app-views': 'apps/*/src/views/**',
  'app-layouts': 'apps/*/src/layouts/**',
  'app-router': 'apps/*/src/router/**',
  'vue-ui': 'packages/vue-ui/**',
  prime: 'packages/vue-primevue-adapter/**',
  charts: 'packages/vue-charts/**',
  tokens: 'packages/design-tokens/**',
  unocss: 'packages/unocss-preset/**',
  platform: 'packages/vue-app-platform/**',
  hooks: 'packages/vue-hooks/**',
}

const EXPECTED_PLANNED_ARTIFACT_PATHS = [
  '.ai/governance/policies/ui.json',
  '.ai/governance/ui/exceptions.json',
  '.ai/governance/ui/fixtures/rule-cases.json',
  '.ai/governance/ui/fixtures/schema-invalid/**',
  '.ai/governance/ui/fixtures/schema-valid/**',
  '.ai/governance/ui/profiles/ccd-architectural-glass.json',
  '.ai/governance/ui/schemas/product-ui-profile.schema.json',
  '.ai/governance/ui/schemas/ui-exception-registry.schema.json',
  '.ai/governance/ui/schemas/ui-exception.schema.json',
  '.ai/governance/ui/schemas/ui-policy.schema.json',
  '.ai/governance/ui/scripts/validate-ui-policy.mjs',
  'wiki/canonical/design/machine-ui-policy.md',
]

const EXPECTED_HISTORICAL_REQUIREMENT_IDS = [
  'P2-REQ-0007',
  'P2-REQ-0016',
  'P2-REQ-0054',
  'P2-REQ-0092',
  'P2-REQ-0114',
  'P2-REQ-0118',
  'P2-REQ-0121',
  'P2-REQ-0184',
  'P2-REQ-0265',
  'P2-REQ-0581',
  'P2-REQ-0583',
  'P2-REQ-0596',
  'P2-REQ-0599',
  'P2-REQ-0604',
  'P2-REQ-0613',
  'P2-REQ-0614',
]

const EXPECTED_HUMAN_REVIEW_REQUIREMENT_IDS = [
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
]

const LIFECYCLE_DOCUMENTS = [
  '.ai/skills/project-ui/SKILL.md',
  '.ai/skills/project-ui/references/platform-invariants.md',
  '.ai/skills/project-ui/references/validation.md',
  'wiki/canonical/design/machine-ui-policy.md',
  'wiki/canonical/design/project-ui-skill.md',
]

const LIFECYCLE_MARKERS = [
  'P3_COMPLETE=yes',
  'MACHINE_UI_POLICY_COMPLETE=yes',
  'MACHINE_UI_POLICY_PRESENT=yes',
  'POLICY_SCHEMAS_PRESENT=yes',
  'PRODUCT_UI_PROFILE_PRESENT=yes',
  'EXCEPTION_REGISTRY_PRESENT=yes',
  'EXCEPTION_COUNT=0',
  'POLICY_FIXTURES_PRESENT=yes',
  'POLICY_VALIDATOR_PRESENT=yes',
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
  'SOURCE_SCANNER_IMPLEMENTED=no',
  'PAGE_CONTRACT_CREATED=no',
  'PROJECT_UI_DISCOVERED=no',
  'PROJECT_UI_ROUTED=no',
  'PROJECT_UI_SYNCHRONIZED=no',
  'PROJECT_UI_ADAPTER_ACTIVATED=no',
  'P5_STARTED=no',
]

const LIFECYCLE_BLOCK_TEXT = LIFECYCLE_MARKERS.join('\n')

const STALE_CURRENT_P4_PATTERNS = [
  /\bP4_STARTED=no\b/,
  /\bp4Started\s*[:=]\s*false\b/i,
  /\bP4 has not started\b/i,
  /\bP4 not started\b/i,
  /\bcold-start not started\b/i,
  /\bP4 owns cold-start and has not started\b/i,
  /\bP4 cold-start remains future\b/i,
]

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
    if ('const' in schema && data !== schema.const) {
      throw new ValidationError(pathStr, `value ${JSON.stringify(data)} does not equal const`)
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
      if (schema.maximum !== undefined && data > schema.maximum) {
        throw new ValidationError(pathStr, `maximum ${schema.maximum}`)
      }
    }

    if (Array.isArray(data)) {
      if (schema.minItems !== undefined && data.length < schema.minItems) {
        throw new ValidationError(pathStr, `minItems ${schema.minItems}`)
      }
      if (schema.maxItems !== undefined && data.length > schema.maxItems) {
        throw new ValidationError(pathStr, `maxItems ${schema.maxItems}`)
      }
      if (schema.uniqueItems) {
        const unique = new Set(data.map(item => JSON.stringify(item)))
        if (unique.size !== data.length) {
          throw new ValidationError(pathStr, 'uniqueItems')
        }
      }
      if (schema.items) {
        data.forEach((item, i) => this.validate(item, schema.items, `${pathStr}[${i}]`))
      }
    }

    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
      const propertyCount = Object.keys(data).length
      if (schema.minProperties !== undefined && propertyCount < schema.minProperties) {
        throw new ValidationError(pathStr, `minProperties ${schema.minProperties}`)
      }
      if (schema.maxProperties !== undefined && propertyCount > schema.maxProperties) {
        throw new ValidationError(pathStr, `maxProperties ${schema.maxProperties}`)
      }
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
      if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
        const declared = new Set(Object.keys(schema.properties || {}))
        for (const [key, value] of Object.entries(data)) {
          if (!declared.has(key)) {
            this.validate(value, schema.additionalProperties, `${pathStr}.${key}`)
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

function validateFixturePair(schemaPath, validPath, invalidPath, label, options = {}) {
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
    const message = e.message
    if (options.invalidReasonIncludes && !message.includes(options.invalidReasonIncludes)) {
      fail(`${label} invalid fixture failed for unexpected reason: ${message}`)
    } else {
      ok(`${label} invalid fixture correctly failed schema: ${message.split(':').pop().trim()}`)
    }
  }
}

function checkFileExists(p, label) {
  const full = path.resolve(repoRoot, p)
  if (!fs.existsSync(full)) fail(`${label} not found: ${p}`)
  else ok(`${label} exists: ${rel(full)}`)
}

function sameOrderedValues(actual, expected) {
  return JSON.stringify(actual) === JSON.stringify(expected)
}

function sameValueSet(actual, expected) {
  return (
    Array.isArray(actual) &&
    actual.length === expected.length &&
    new Set(actual).size === actual.length &&
    expected.every(value => actual.includes(value))
  )
}

function isSafeRepositoryPattern(value) {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    !path.isAbsolute(value) &&
    !value.includes('..') &&
    !value.includes('\\\\') &&
    !value.startsWith('/')
  )
}

function repositoryPatternMatches(pattern) {
  return fs.globSync(pattern, { cwd: repoRoot }).length > 0
}

function readMarkdownSections(relativePath) {
  const fullPath = path.resolve(repoRoot, relativePath)
  const lines = fs.readFileSync(fullPath, 'utf8').split(/\r?\n/)
  const headings = []
  for (let index = 0; index < lines.length; index++) {
    const match = lines[index].match(/^(#{1,6})\s+(.+?)\s*$/)
    if (!match) continue
    headings.push({
      index,
      level: match[1].length,
      title: match[2].replace(/\s+#+\s*$/, '').trim(),
    })
  }
  return headings.map((heading, index) => {
    const next = headings.slice(index + 1).find(candidate => candidate.level <= heading.level)
    const end = next?.index ?? lines.length
    const body = lines
      .slice(heading.index + 1, end)
      .join('\n')
      .trim()
    return { ...heading, body }
  })
}

function collectRuleCaseErrors(policy, cases) {
  const findings = []
  const rules = Array.isArray(policy?.rules) ? policy.rules : []
  const ruleById = new Map(rules.map(rule => [rule.id, rule]))
  const caseIds = new Set()
  const coverage = new Map(rules.map(rule => [rule.id, { pass: 0, fail: 0 }]))

  if (!Array.isArray(cases)) return ['rule cases must be an array']

  for (const testCase of cases) {
    if (typeof testCase?.id !== 'string' || testCase.id.length === 0) {
      findings.push('rule case ID must be a non-empty string')
    } else if (caseIds.has(testCase.id)) {
      findings.push(`duplicate case ID ${testCase.id}`)
    } else {
      caseIds.add(testCase.id)
    }

    const rule = ruleById.get(testCase?.ruleId)
    if (!rule) {
      findings.push(`unknown rule ${testCase?.ruleId ?? '<missing>'} in case ${testCase?.id}`)
      continue
    }
    if (!['pass', 'fail'].includes(testCase.expectedOutcome)) {
      findings.push(`wrong expected outcome in case ${testCase.id}`)
      continue
    }
    coverage.get(rule.id)[testCase.expectedOutcome]++

    if (testCase.detector !== rule.detector?.id) {
      findings.push(`case ${testCase.id} does not exercise declared detector ${rule.detector?.id}`)
      continue
    }

    let passMatch
    let failMatch
    try {
      passMatch = new RegExp(rule.detector.fixturePassPattern, 'u').test(testCase.fixture)
      failMatch = new RegExp(rule.detector.fixtureFailPattern, 'u').test(testCase.fixture)
    } catch (error) {
      findings.push(`rule ${rule.id} detector pattern is invalid: ${error.message}`)
      continue
    }
    if (passMatch === failMatch) {
      findings.push(`case ${testCase.id} does not exercise declared detector ${rule.detector.id}`)
      continue
    }
    const actualOutcome = passMatch ? 'pass' : 'fail'
    if (actualOutcome !== testCase.expectedOutcome) {
      findings.push(
        `wrong expected outcome in case ${testCase.id}: expected ${testCase.expectedOutcome}, detector returned ${actualOutcome}`
      )
    }
  }

  for (const [ruleId, outcomes] of coverage) {
    if (outcomes.pass !== 1) findings.push(`rule ${ruleId} missing pass case`)
    if (outcomes.fail !== 1) findings.push(`rule ${ruleId} missing fail case`)
  }
  if (cases.length !== rules.length * 2) {
    findings.push(`rule case count ${cases.length} must equal ${rules.length * 2}`)
  }
  return findings
}

function runRuleCases(policy, cases) {
  const findings = collectRuleCaseErrors(policy, cases)
  if (findings.length > 0) {
    findings.forEach(finding => fail(finding))
    return
  }
  ok(`${cases.length} deterministic rule cases cover pass and fail outcomes for all rules`)
}

function collectCorrectionErrors(context) {
  const findings = []
  const add = message => findings.push(message)
  const { policy, coverage, exceptions, ruleCases } = context
  const handoff = coverage?.p3Handoff ?? {}
  const canonicalState = coverage?.canonicalState ?? {}
  const rules = Array.isArray(policy?.rules) ? policy.rules : []
  const expectedRuleIds = Array.from(
    { length: 68 },
    (_, index) => `CCD-UI-${String(index + 1).padStart(3, '0')}`
  )
  const actualRuleIds = rules.map(rule => rule.id)
  const activeRequirements = Array.isArray(coverage?.requirements) ? coverage.requirements : []
  const requirementById = new Map(
    activeRequirements.map(requirement => [requirement.requirementId, requirement])
  )
  const candidateIds = handoff.semanticCandidates?.currentRequirementIds ?? []
  const candidateIdSet = new Set(candidateIds)
  const candidateDispositions = handoff.candidateRequirementDispositions ?? []
  const policyCandidateDispositions = policy?.candidateRequirementDispositions ?? []
  const dispositionByRequirement = new Map(
    candidateDispositions.map(disposition => [disposition.requirementId, disposition])
  )
  const futurePageContractDeferrals = handoff.futurePageContractDeferrals ?? []
  const historicalLineage = handoff.historicalLineage ?? []
  const cases = ruleCases?.cases ?? []

  if (policy?.implementationState !== 'P3_COMPLETE') {
    add(`implementationState must be P3_COMPLETE, got ${policy?.implementationState}`)
  }
  if (policy?.machineUiPolicyState !== 'MACHINE_UI_POLICY_COMPLETE') {
    add(`machineUiPolicyState must be MACHINE_UI_POLICY_COMPLETE`)
  }
  if (policy?.machineUiPolicyPresent !== true) add('machineUiPolicyPresent must be true')
  const expectedPolicyArtifactState = {
    policySchemasPresent: true,
    productUiProfilePresent: true,
    exceptionRegistryPresent: true,
    exceptionCount: 0,
    fixturesPresent: true,
    validatorPresent: true,
    projectUiDiscovered: false,
    projectUiRouted: false,
    projectUiSynchronized: false,
    projectUiAdapterActivated: false,
  }
  for (const [field, expected] of Object.entries(expectedPolicyArtifactState)) {
    if (policy?.[field] !== expected) add(`${field} must be ${expected}`)
  }
  if (policy?.applicationSourceEnforcementState !== 'BASELINE_ONLY') {
    add('applicationSourceEnforcementState must be BASELINE_ONLY')
  }
  if (policy?.p3BaselineCommit !== '86f6f71045a8778a0540d11fed15ca4c0eae6fa3') {
    add('p3BaselineCommit must identify the P3 implementation commit')
  }

  const expectedPolicyFlags = {
    sourceScannerImplemented: false,
    pageContractCreated: false,
    p4Started: true,
    p5Started: false,
  }
  for (const [field, expected] of Object.entries(expectedPolicyFlags)) {
    if (policy?.[field] !== expected) add(`${field} must be ${expected}`)
    if (coverage?.[field] !== expected) add(`coverage ${field} must be ${expected}`)
  }

  const expectedCurrentState = {
    implementationState: 'P3_COMPLETE',
    machineUiPolicyState: 'MACHINE_UI_POLICY_COMPLETE',
    machineUiPolicyPresent: true,
    applicationSourceEnforcementState: 'BASELINE_ONLY',
    policySchemasPresent: true,
    productUiProfilePresent: true,
    exceptionRegistryPresent: true,
    exceptionCount: 0,
    fixturesPresent: true,
    validatorPresent: true,
    sourceScannerImplemented: false,
    pageContractCreated: false,
    p3Started: true,
    p4Started: true,
    p4Complete: true,
    coldStartAtomicReplacementComplete: true,
    agentsTracked: true,
    claudeTracked: true,
    claudeAdapterTracked: true,
    adapterManifestColdStartComplete: true,
    adapterGenerationDeterministic: true,
    aiSyncIdempotent: true,
    freshCloneEntrypointsPass: true,
    p5Started: false,
    skillLockDiscovered: false,
    routed: false,
    synchronized: false,
    adapterActivated: false,
  }
  for (const [field, expected] of Object.entries(expectedCurrentState)) {
    if (canonicalState[field] !== expected) {
      add(`${field} canonical state mismatch: expected ${expected}, got ${canonicalState[field]}`)
    }
  }

  if (handoff.status !== 'consumed-by-p3-completion') {
    add('P3 handoff status must be consumed-by-p3-completion')
  }
  if (handoff.snapshotKind !== 'PRE_IMPLEMENTATION_HANDOFF') {
    add('P3 handoff snapshotKind must preserve its pre-implementation scope')
  }
  if (handoff.consumedByImplementationCommit !== policy?.p3BaselineCommit) {
    add('P3 handoff consumedByImplementationCommit must match p3BaselineCommit')
  }
  const expectedPreImplementationLifecycleState = {
    machineUiPolicyPresent: false,
    pageContractSchemaPresent: false,
    p3Started: false,
    p4Started: false,
    p5Started: false,
    skillLockDiscovered: false,
    routed: false,
    synchronized: false,
    adapterActivated: false,
  }
  for (const [field, expected] of Object.entries(expectedPreImplementationLifecycleState)) {
    if (handoff.preImplementationLifecycleState?.[field] !== expected) {
      add(`P3 handoff pre-implementation ${field} must remain ${expected}`)
    }
  }

  if (!sameOrderedValues(actualRuleIds, expectedRuleIds)) {
    add('rule IDs must be contiguous CCD-UI-001..CCD-UI-068')
  }
  if (
    !sameValueSet(
      candidateIds,
      rules.flatMap(rule => rule.sourceRequirementIds ?? [])
    )
  ) {
    add('rule source requirements must equal the canonical 68-member candidate inventory')
  }
  if (candidateDispositions.length !== 68 || dispositionByRequirement.size !== 68) {
    add('candidate requirement dispositions must contain exactly 68 unique records')
  }
  if (
    policyCandidateDispositions.length !== 68 ||
    !sameOrderedValues(policyCandidateDispositions, candidateDispositions)
  ) {
    add('policy candidate requirement dispositions must exactly equal the 68 handoff records')
  }
  if (!sameValueSet([...dispositionByRequirement.keys()], candidateIds)) {
    add('candidate requirement dispositions must use only the canonical candidate inventory')
  }

  const permanentDispositions = candidateDispositions.filter(
    disposition => disposition.disposition === 'permanent-rule'
  )
  const humanDispositions = candidateDispositions.filter(
    disposition => disposition.disposition === 'human-review-only'
  )
  if (permanentDispositions.length !== 54 || humanDispositions.length !== 14) {
    add('candidate disposition split must be exactly 54 permanent-rule and 14 human-review-only')
  }
  for (const disposition of candidateDispositions) {
    if (
      disposition.disposition === 'human-review-only' &&
      disposition.enforcement !== 'human-review-only'
    ) {
      add(
        `human-review-only disposition ${disposition.requirementId} must use human-review-only enforcement`
      )
    }
    if (
      disposition.disposition === 'permanent-rule' &&
      disposition.enforcement === 'human-review-only'
    ) {
      add(
        `permanent-rule disposition ${disposition.requirementId} must use machine-policy enforcement`
      )
    }
  }

  const policyClusterById = new Map((policy?.clusters ?? []).map(cluster => [cluster.id, cluster]))
  const handoffClusterById = new Map(
    (handoff.semanticObligationClusters ?? []).map(cluster => [cluster.clusterId, cluster])
  )
  if (
    (policy?.clusters ?? []).length !== 14 ||
    policyClusterById.size !== 14 ||
    (handoff.semanticObligationClusters ?? []).length !== 14 ||
    handoffClusterById.size !== 14
  ) {
    add('policy and handoff must each contain exactly 14 semantic-obligation clusters')
  }
  for (const [clusterId, sourceCluster] of handoffClusterById) {
    const policyCluster = policyClusterById.get(clusterId)
    if (!policyCluster) {
      add(`policy cluster ${clusterId} is missing`)
      continue
    }
    if (
      !sameOrderedValues(policyCluster.sourceRequirementIds, sourceCluster.currentRequirementIds)
    ) {
      add(`policy cluster ${clusterId} does not preserve canonical candidate membership`)
    }
    const sourceRequirementIds = sourceCluster.currentRequirementIds ?? []
    const policyRuleIds = sourceCluster.policyRuleIds ?? []
    if (sourceRequirementIds.length !== policyRuleIds.length) {
      add(`handoff cluster ${clusterId} must zip each candidate to one completion rule`)
      continue
    }
    for (let index = 0; index < sourceRequirementIds.length; index += 1) {
      const requirementId = sourceRequirementIds[index]
      const ruleId = policyRuleIds[index]
      const rule = rules.find(candidate => candidate.id === ruleId)
      const disposition = dispositionByRequirement.get(requirementId)
      if (
        rule?.sourceRequirementIds?.[0] !== requirementId ||
        disposition?.ruleId !== ruleId ||
        disposition?.clusterId !== clusterId
      ) {
        add(`handoff cluster ${clusterId} positional rule mapping is incorrect at ${requirementId}`)
      }
    }
  }

  const sourceMappings = policy?.sourceRequirementMappings ?? {}
  const ruleToSourceMappings = policy?.ruleToSourceMappings ?? {}
  if (!sameValueSet(Object.keys(sourceMappings), candidateIds)) {
    add('sourceRequirementMappings must contain exactly the 68 candidates')
  }
  if (Object.keys(ruleToSourceMappings).length !== 68) {
    add('ruleToSourceMappings must contain exactly 68 rules')
  }
  for (const rule of rules) {
    const sourceIds = rule.sourceRequirementIds ?? []
    if (sourceIds.length !== 1) add(`rule ${rule.id} must map exactly one candidate requirement`)
    const requirementId = sourceIds[0]
    const disposition = dispositionByRequirement.get(requirementId)
    if (!disposition) {
      add(`rule ${rule.id} maps unknown or non-candidate requirement ${requirementId}`)
      continue
    }
    if (
      disposition.ruleId !== rule.id ||
      disposition.clusterId !== rule.cluster ||
      disposition.disposition !== rule.disposition ||
      disposition.enforcement !== rule.enforcement
    ) {
      add(`rule ${rule.id} does not reconcile with its candidate disposition`)
    }
    if (sourceMappings[requirementId] !== rule.id) {
      add(`sourceRequirementMappings[${requirementId}] must equal ${rule.id}`)
    }
    if (!sameOrderedValues(ruleToSourceMappings[rule.id], sourceIds)) {
      add(`ruleToSourceMappings[${rule.id}] must equal rule sourceRequirementIds`)
    }
    if (!policyClusterById.has(rule.cluster)) add(`rule ${rule.id} references unknown cluster`)
    if (rule.lifecycle !== 'completion') add(`rule ${rule.id} lifecycle must be completion`)
    if (rule.detector?.sourceScannerState !== 'NOT_IMPLEMENTED') {
      add(`rule ${rule.id} detector source scanner state must remain NOT_IMPLEMENTED`)
    }
    const expectedMessage = `Violation detected by ${rule.detector?.id} in registered scope IDs ${(rule.scope ?? []).join(', ')}.`
    if (rule.message !== expectedMessage) {
      add(`rule ${rule.id} message must reference scope IDs, not path or glob literals`)
    }
  }

  const humanReviewIds = policy?.humanReviewOnly ?? []
  const expectedHumanReviewIds = humanDispositions.map(disposition => disposition.requirementId)
  if (!sameValueSet(humanReviewIds, expectedHumanReviewIds)) {
    add('human-review list must equal the 14 human-review candidate dispositions')
  }
  if (!sameValueSet(expectedHumanReviewIds, EXPECTED_HUMAN_REVIEW_REQUIREMENT_IDS)) {
    add('human-review dispositions must equal the canonical 14-requirement inventory')
  }
  for (const requirementId of humanReviewIds) {
    if (!candidateIdSet.has(requirementId)) {
      add(`active non-candidate ${requirementId} must not be reclassified as human-review-only`)
    }
  }

  if (
    futurePageContractDeferrals.length !== 4 ||
    !sameValueSet(policy?.futurePageContract ?? [], futurePageContractDeferrals)
  ) {
    add('future Page Contract deferrals must contain exactly four separate requirements')
  }
  for (const requirementId of futurePageContractDeferrals) {
    const requirement = requirementById.get(requirementId)
    if (
      candidateIdSet.has(requirementId) ||
      requirement?.coverageDecision !== 'deferred-to-page-contract'
    ) {
      add(`Page Contract deferral ${requirementId} must remain outside the candidate set`)
    }
  }

  for (const [collectionName, requirementIds] of [
    ['supporting non-candidate', handoff.supportingNonCandidateRequirementIds ?? []],
    ['human-review background', handoff.humanReviewBackgroundRequirementIds ?? []],
  ]) {
    if (new Set(requirementIds).size !== requirementIds.length) {
      add(`${collectionName} requirements must be unique`)
    }
    for (const requirementId of requirementIds) {
      if (!requirementById.has(requirementId) || candidateIdSet.has(requirementId)) {
        add(`${collectionName} requirement ${requirementId} must be an active non-candidate`)
      }
      if (requirementId in sourceMappings || humanReviewIds.includes(requirementId)) {
        add(
          `${collectionName} requirement ${requirementId} must not receive a candidate disposition`
        )
      }
    }
  }
  for (const ambiguity of handoff.nonBlockingExcludedAmbiguities ?? []) {
    if (
      !requirementById.has(ambiguity.requirementId) ||
      candidateIdSet.has(ambiguity.requirementId) ||
      ambiguity.blocksHandoff !== false
    ) {
      add(`non-blocking excluded ambiguity ${ambiguity.requirementId} is invalid`)
    }
  }

  const policyHistoricalLineage = policy?.historicalLineage ?? []
  if (
    historicalLineage.length !== 16 ||
    !sameOrderedValues(
      historicalLineage.map(record => record.historicalRequirementId),
      EXPECTED_HISTORICAL_REQUIREMENT_IDS
    ) ||
    !sameOrderedValues(policyHistoricalLineage, historicalLineage)
  ) {
    add('historicalRequirementId inventory must contain the exact 16 P2-REQ records')
  }
  for (const record of historicalLineage) {
    if (!/^P2-REQ-\d{4}$/.test(record.historicalRequirementId ?? '')) {
      add(`historicalRequirementId ${record.historicalRequirementId} must use P2-REQ format`)
    }
    if (
      !Array.isArray(record.currentReplacementRequirementIds) ||
      typeof record.currentClassification !== 'string' ||
      record.currentClassification.trim() === '' ||
      record.historicalMarkerEligibleAsCanonicalUnit !== false
    ) {
      add(`historicalRequirementId ${record.historicalRequirementId} has an invalid lineage record`)
    }
    for (const replacementId of record.currentReplacementRequirementIds ?? []) {
      if (!requirementById.has(replacementId)) {
        add(`historicalRequirementId ${record.historicalRequirementId} has unknown replacement`)
      }
    }
  }

  const completionRuleIds = policy?.lifecycles?.completionRuleIds ?? []
  const sourceBaselineRuleIds = policy?.lifecycles?.sourceEnforcementBaselineRuleIds ?? []
  if (!sameOrderedValues(completionRuleIds, expectedRuleIds)) {
    add('completionRuleIds must contain all 68 ordered rule IDs')
  }
  if (!sameOrderedValues(sourceBaselineRuleIds, expectedRuleIds)) {
    add('sourceEnforcementBaselineRuleIds must contain all 68 ordered rule IDs')
  }
  if (!sameOrderedValues(handoff.semanticCandidates?.completionRuleIds ?? [], expectedRuleIds)) {
    add('handoff completionRuleIds must contain all 68 ordered rule IDs')
  }

  if (!sameOrderedValues(policy?.scopeRegistry, EXPECTED_SCOPE_REGISTRY)) {
    add('scope registry must equal the closed ten-scope registry')
  }
  for (const [scopeId, pattern] of Object.entries(policy?.scopeRegistry ?? {})) {
    if (!isSafeRepositoryPattern(pattern)) add(`scope ${scopeId} is absolute or contains traversal`)
    else if (!repositoryPatternMatches(pattern)) add(`scope ${scopeId} is unmatched`)
  }
  for (const rule of rules) {
    for (const scopeId of rule.scope ?? []) {
      if (!(scopeId in EXPECTED_SCOPE_REGISTRY)) add(`rule ${rule.id} has unknown scope ${scopeId}`)
    }
  }

  if (!sameOrderedValues(policy?.plannedArtifactPaths, EXPECTED_PLANNED_ARTIFACT_PATHS)) {
    add('planned artifact paths must equal the twelve authorized P3 paths')
  }
  for (const artifactPath of policy?.plannedArtifactPaths ?? []) {
    if (!isSafeRepositoryPattern(artifactPath))
      add(`planned artifact path is unauthorized: ${artifactPath}`)
    else if (!repositoryPatternMatches(artifactPath))
      add(`planned artifact path is unmatched: ${artifactPath}`)
  }

  for (const rule of rules) {
    if (!isSafeRepositoryPattern(rule.authorityPath)) {
      add(`rule ${rule.id} authorityPath is unauthorized`)
      continue
    }
    const fullPath = path.resolve(repoRoot, rule.authorityPath)
    if (!fullPath.startsWith(`${repoRoot}${path.sep}`) || !fs.existsSync(fullPath)) {
      add(`rule ${rule.id} authorityPath does not exist`)
      continue
    }
    const sections = readMarkdownSections(rule.authorityPath)
    const section = sections.find(candidate => candidate.title === rule.authoritySection)
    if (!section || section.level === 1 || section.body.length === 0) {
      add(`rule ${rule.id} authoritySection is not an exact non-empty section`)
    }
  }

  const exceptionCount = exceptions?.exceptions?.length ?? -1
  if (exceptions?.policyId !== policy?.schemaVersion) {
    add('exception registry policyId must equal the current policy schemaVersion')
  }
  if (exceptionCount !== 0 || policy?.exceptionPolicy?.realExceptionCount !== 0) {
    add(`exception count must be exactly zero, got ${exceptionCount}`)
  }
  const eligibleRuleIds = policy?.exceptionPolicy?.exceptionEligibleRuleIds ?? []
  const eligibleRules = rules.filter(rule => rule.exceptionEligible)
  if (
    !sameOrderedValues(eligibleRuleIds, ['CCD-UI-064']) ||
    eligibleRules.length !== 1 ||
    eligibleRules[0]?.id !== 'CCD-UI-064'
  ) {
    add('exception eligible rules must contain exactly the narrow deep-selector rule CCD-UI-064')
  }

  const actualRuleCaseCounts = {
    ruleCount: rules.length,
    passCaseCount: cases.filter(testCase => testCase.expectedOutcome === 'pass').length,
    failCaseCount: cases.filter(testCase => testCase.expectedOutcome === 'fail').length,
    totalCaseCount: cases.length,
  }
  if (ruleCases?.schemaVersion !== 'ccd-ui-rule-cases/v2') {
    add('rule case schemaVersion must be ccd-ui-rule-cases/v2')
  }
  for (const [field, actual] of Object.entries(actualRuleCaseCounts)) {
    if (ruleCases?.declaredCounts?.[field] !== actual) {
      add(
        `rule case declared count ${field}=${ruleCases?.declaredCounts?.[field]} must equal ${actual}`
      )
    }
  }

  const declaredCounts = {
    ruleCount: rules.length,
    clusterCount: policy?.clusters?.length ?? 0,
    candidateDispositionCount: policyCandidateDispositions.length,
    permanentRuleDispositionCount: permanentDispositions.length,
    humanReviewOnlyDispositionCount: humanDispositions.length,
    futurePageContractDeferralCount: futurePageContractDeferrals.length,
    historicalLineageCount: historicalLineage.length,
    activeP2RequirementCount: activeRequirements.length,
    scopeRegistryCount: Object.keys(policy?.scopeRegistry ?? {}).length,
    plannedArtifactPathCount: policy?.plannedArtifactPaths?.length ?? 0,
    passRuleCaseCount: cases.filter(testCase => testCase.expectedOutcome === 'pass').length,
    failRuleCaseCount: cases.filter(testCase => testCase.expectedOutcome === 'fail').length,
    exceptionCount,
  }
  for (const [field, actual] of Object.entries(declaredCounts)) {
    if (policy?.counts?.[field] !== actual) {
      add(`declared count ${field}=${policy?.counts?.[field]} does not equal ${actual}`)
    }
  }
  if (coverage?.activeRequirementCount !== 345 || activeRequirements.length !== 345) {
    add('active P2 coverage count must remain exactly 345')
  }

  const uiScripts = fs
    .globSync('.ai/governance/ui/scripts/*', { cwd: repoRoot })
    .filter(relativePath => fs.statSync(path.resolve(repoRoot, relativePath)).isFile())
  if (!sameOrderedValues(uiScripts, ['.ai/governance/ui/scripts/validate-ui-policy.mjs'])) {
    add('sourceScannerImplemented must remain false and no source scanner script may exist')
  }
  for (const pageContractPath of [
    '.ai/governance/policies/page-contract.json',
    '.ai/governance/ui/page-contract.json',
    '.ai/governance/ui/schemas/page-contract.schema.json',
  ]) {
    if (fs.existsSync(path.resolve(repoRoot, pageContractPath))) {
      add(`pageContractCreated must remain false; found ${pageContractPath}`)
    }
  }

  for (const documentPath of LIFECYCLE_DOCUMENTS) {
    const text = fs.readFileSync(path.resolve(repoRoot, documentPath), 'utf8')
    if (!text.includes(LIFECYCLE_BLOCK_TEXT)) {
      add(`${documentPath} lifecycle block must match the exact ordered P4.4 terminal block`)
    }
    for (const marker of LIFECYCLE_MARKERS) {
      if (!text.includes(marker)) add(`${documentPath} lifecycle marker missing: ${marker}`)
    }
    for (const pattern of STALE_CURRENT_P4_PATTERNS) {
      if (pattern.test(text)) add(`${documentPath} contains stale current P4 lifecycle prose`)
    }
  }

  return findings
}

function runMutationTests(context, schemaPath) {
  const { policy } = context
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

  // P4 current-state regression forbidden
  const p4Started = JSON.parse(JSON.stringify(policy))
  p4Started.p4Started = false
  const v9 = new MiniValidator(schema)
  try {
    v9.validate(p4Started)
    fail('mutation: p4Started=false should fail')
  } catch {
    ok('mutation: p4Started=false rejected')
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

  const expectCorrectionMutationRejected = (label, expectedFragment, mutate) => {
    const mutated = structuredClone(context)
    mutate(mutated)
    const findings = collectCorrectionErrors(mutated)
    if (findings.some(finding => finding.includes(expectedFragment))) {
      ok(`mutation: ${label} rejected`)
    } else {
      fail(`mutation: ${label} should fail with ${expectedFragment}`)
    }
  }

  const expectRuleCaseMutationRejected = (label, expectedFragment, mutate) => {
    const mutatedCases = structuredClone(context.ruleCases.cases)
    mutate(mutatedCases)
    const findings = collectRuleCaseErrors(context.policy, mutatedCases)
    if (findings.some(finding => finding.includes(expectedFragment))) {
      ok(`mutation: ${label} rejected`)
    } else {
      fail(`mutation: ${label} should fail with ${expectedFragment}`)
    }
  }

  expectCorrectionMutationRejected('P3 marked incomplete', 'implementationState', mutated => {
    mutated.policy.implementationState = 'P3_INCOMPLETE'
  })
  expectCorrectionMutationRejected(
    'Machine UI Policy marked absent',
    'machineUiPolicyPresent',
    mutated => {
      mutated.coverage.canonicalState.machineUiPolicyPresent = false
    }
  )
  expectCorrectionMutationRejected(
    'non-candidate mapped to human review',
    'non-candidate',
    mutated => {
      const supportingIds =
        mutated.coverage.p3Handoff.supportingNonCandidateRequirementIds ??
        mutated.coverage.p3Handoff.supportingRequirementIds
      mutated.policy.humanReviewOnly.push(supportingIds[0])
    }
  )
  expectCorrectionMutationRejected(
    'policy candidate disposition inventory truncated',
    'policy candidate requirement dispositions',
    mutated => {
      mutated.policy.candidateRequirementDispositions.pop()
    }
  )
  expectCorrectionMutationRejected(
    'policy non-candidate disposition added',
    'policy candidate requirement dispositions',
    mutated => {
      const requirementId = mutated.coverage.p3Handoff.supportingNonCandidateRequirementIds[0]
      mutated.policy.candidateRequirementDispositions.push({
        requirementId,
        ruleId: 'CCD-UI-001',
        clusterId: 'P3-HO-CLUSTER-001',
        disposition: 'human-review-only',
        enforcement: 'human-review-only',
      })
    }
  )
  expectCorrectionMutationRejected(
    'human-review disposition claims schema enforcement',
    'human-review-only disposition',
    mutated => {
      const handoffDisposition = mutated.coverage.p3Handoff.candidateRequirementDispositions.find(
        disposition => disposition.disposition === 'human-review-only'
      )
      const policyDisposition = mutated.policy.candidateRequirementDispositions.find(
        disposition => disposition.requirementId === handoffDisposition.requirementId
      )
      const rule = mutated.policy.rules.find(
        candidate => candidate.id === handoffDisposition.ruleId
      )
      handoffDisposition.enforcement = 'schema-validated'
      policyDisposition.enforcement = 'schema-validated'
      rule.enforcement = 'schema-validated'
    }
  )
  expectCorrectionMutationRejected(
    'canonical human-review classifications swapped',
    'canonical 14-requirement inventory',
    mutated => {
      const handoffDispositions = mutated.coverage.p3Handoff.candidateRequirementDispositions
      const permanent = handoffDispositions.find(item => item.disposition === 'permanent-rule')
      const human = handoffDispositions.find(item => item.disposition === 'human-review-only')
      const policyPermanent = mutated.policy.candidateRequirementDispositions.find(
        item => item.requirementId === permanent.requirementId
      )
      const policyHuman = mutated.policy.candidateRequirementDispositions.find(
        item => item.requirementId === human.requirementId
      )
      const permanentRule = mutated.policy.rules.find(item => item.id === permanent.ruleId)
      const humanRule = mutated.policy.rules.find(item => item.id === human.ruleId)
      for (const item of [permanent, policyPermanent, permanentRule]) {
        item.disposition = 'human-review-only'
        item.enforcement = 'human-review-only'
      }
      for (const item of [human, policyHuman, humanRule]) {
        item.disposition = 'permanent-rule'
        item.enforcement = 'source-scanner-not-yet-implemented'
      }
      mutated.policy.humanReviewOnly = mutated.policy.humanReviewOnly.map(requirementId =>
        requirementId === human.requirementId ? permanent.requirementId : requirementId
      )
    }
  )
  expectCorrectionMutationRejected(
    'P2C marker substituted for historical lineage',
    'historicalRequirementId',
    mutated => {
      const lineage =
        mutated.coverage.p3Handoff.historicalLineage ??
        mutated.coverage.p3Handoff.historicalMarkerDispositions
      lineage[0].historicalRequirementId = 'P2C-REQ-0007'
    }
  )
  expectCorrectionMutationRejected('unknown scope', 'scope', mutated => {
    mutated.policy.rules[0].scope = ['unknown-scope']
  })
  expectCorrectionMutationRejected('obsolete scope', 'scope', mutated => {
    mutated.policy.rules[0].scope = ['src/constants/theme.ts']
  })
  expectCorrectionMutationRejected('obsolete scope in message', 'scope IDs', mutated => {
    mutated.policy.rules[0].message += ' src/constants/theme.ts'
  })
  expectCorrectionMutationRejected('nonexistent authority section', 'authoritySection', mutated => {
    mutated.policy.rules[0].authoritySection = 'Invented Authority Section'
  })
  expectCorrectionMutationRejected('empty completion rule list', 'completionRuleIds', mutated => {
    mutated.policy.lifecycles.completionRuleIds = []
  })
  expectCorrectionMutationRejected(
    'false source-scanning compliance',
    'sourceScannerImplemented',
    mutated => {
      mutated.policy.sourceScannerImplemented = true
    }
  )
  expectCorrectionMutationRejected('false Page Contract start', 'pageContractCreated', mutated => {
    mutated.policy.pageContractCreated = true
  })
  expectCorrectionMutationRejected('current P4 start regressed', 'p4Started', mutated => {
    mutated.policy.p4Started = false
    mutated.coverage.p4Started = false
    mutated.coverage.canonicalState.p4Started = false
  })
  expectCorrectionMutationRejected('missing P4 completion marker', 'p4Complete', mutated => {
    mutated.coverage.canonicalState.p4Complete = false
  })
  expectCorrectionMutationRejected('false tracked output marker', 'agentsTracked', mutated => {
    mutated.coverage.canonicalState.agentsTracked = false
  })
  expectCorrectionMutationRejected('false P5 start', 'p5Started', mutated => {
    mutated.policy.p5Started = true
  })
  expectCorrectionMutationRejected('false project-ui discovery', 'projectUiDiscovered', mutated => {
    mutated.policy.projectUiDiscovered = true
  })
  expectCorrectionMutationRejected('declared count drift', 'declared count', mutated => {
    mutated.policy.counts.ruleCount -= 1
  })
  expectCorrectionMutationRejected(
    'rule-case declared count drift',
    'rule case declared count',
    mutated => {
      mutated.ruleCases.declaredCounts.totalCaseCount -= 1
    }
  )
  expectCorrectionMutationRejected('non-empty exception registry', 'exception count', mutated => {
    mutated.exceptions.exceptions.push({ id: 'mutation-only' })
  })
  expectCorrectionMutationRejected(
    'obsolete exception registry policy ID',
    'exception registry policyId',
    mutated => {
      mutated.exceptions.policyId = 'ccd-ui-policy/v1'
    }
  )
  expectCorrectionMutationRejected(
    'broad deep-selector eligibility',
    'exception eligible',
    mutated => {
      mutated.policy.exceptionPolicy.exceptionEligibleRuleIds.push('CCD-UI-001')
    }
  )

  expectRuleCaseMutationRejected('missing pass case', 'missing pass case', cases => {
    const index = cases.findIndex(
      testCase =>
        testCase.ruleId === 'CCD-UI-001' && (testCase.expectedOutcome ?? testCase.intent) === 'pass'
    )
    if (index >= 0) cases.splice(index, 1)
  })
  expectRuleCaseMutationRejected('missing fail case', 'missing fail case', cases => {
    const index = cases.findIndex(
      testCase => testCase.ruleId === 'CCD-UI-001' && testCase.expectedOutcome === 'fail'
    )
    if (index >= 0) cases.splice(index, 1)
  })
  expectRuleCaseMutationRejected('unknown rule case', 'unknown rule', cases => {
    cases[0].ruleId = 'CCD-UI-999'
  })
  expectRuleCaseMutationRejected('duplicate case ID', 'duplicate case ID', cases => {
    cases[1].id = cases[0].id
  })
  expectRuleCaseMutationRejected('wrong expected outcome', 'wrong expected outcome', cases => {
    cases[0].expectedOutcome = 'fail'
  })
  expectRuleCaseMutationRejected('unexercised detector', 'does not exercise', cases => {
    cases[0].fixture = 'unrelated fixture text'
  })
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
    'ui-policy',
    { invalidReasonIncludes: 'severity' }
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

  const correctionFindings = collectCorrectionErrors({ policy, coverage, exceptions, ruleCases })
  if (correctionFindings.length === 0) ok('P3 final correction reconciliation passed')
  else correctionFindings.forEach(finding => fail(finding))

  runRuleCases(policy, ruleCases.cases)
  runMutationTests(
    { policy, coverage, exceptions, ruleCases },
    '.ai/governance/ui/schemas/ui-policy.schema.json'
  )

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
