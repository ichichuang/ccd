#!/usr/bin/env node
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

const REQUIRED_MARKDOWN = [
  '.ai/skills/project-ui/SKILL.md',
  '.ai/skills/project-ui/references/platform-invariants.md',
  '.ai/skills/project-ui/references/product-language.md',
  '.ai/skills/project-ui/references/product-ui-profile.md',
  '.ai/skills/project-ui/references/layout-scroll.md',
  '.ai/skills/project-ui/references/page-archetypes.md',
  '.ai/skills/project-ui/references/tokens-unocss.md',
  '.ai/skills/project-ui/references/component-priority.md',
  '.ai/skills/project-ui/references/interaction-motion.md',
  '.ai/skills/project-ui/references/accessibility.md',
  '.ai/skills/project-ui/references/validation.md',
]

const COVERAGE_ARTIFACT = '.ai/governance/ui/project-ui-semantic-coverage.json'

const WIKI_ARTIFACT = 'wiki/canonical/design/project-ui-skill.md'

const PERMANENT_PROJECT_UI_ARTIFACTS = [COVERAGE_ARTIFACT, ...REQUIRED_MARKDOWN, WIKI_ARTIFACT]

const REQUIRED_FOUNDATIONS = [
  'packages/design-tokens/src/theme-engine',
  'packages/design-tokens/src/size.ts',
  'packages/design-tokens/src/breakpoints.ts',
  'packages/unocss-preset/src/index.ts',
  'packages/vue-app-platform/src/layoutRuntime.ts',
  'packages/vue-ui/src/CScrollbar',
  'packages/vue-ui/src/AnimateWrapper',
  'packages/vue-primevue-adapter/src/index.ts',
  'packages/vue-hooks/src/index.ts',
]

const MARKER_LEXICON = new Set(
  [
    'Why forbidden',
    'Prefer',
    'Reject if found',
    'Reject if',
    'Required',
    'Forbidden',
    'Allowed',
    'Allowed for',
    'Allowed use',
    'Reason',
    'Rationale',
    'Review checklist',
    'Required review sequence',
    'Visual quality gate',
    'Quality gate',
    'Validation gate',
    'Review sequence',
    'Use when',
    'Avoid when',
    'Do not use when',
    'Recommended',
    'Not recommended',
    'Examples',
    'Example',
    'Notes',
    'Note',
    'Intent',
    'Purpose',
  ].map(item => item.toLowerCase())
)

const PLACEHOLDERS = [
  'This section owns',
  'This structural section has no direct corrected requirement mapping',
  'required by the accepted P2.3 heading registry',
  'defines the local ownership boundary for adjacent mapped sections',
  'Accepted P2.3 semantic coverage for this heading',
]

const BROKEN_PATTERNS = [
  /\bmust When\b/,
  /\bmust not Adding\b/,
  /\bmust not Putting\b/,
  /\bmust Use\b/,
  /Intent \| must Use/,
  /\bmust\s+(?:#|[A-Z][A-Za-z -]{2,}$)/m,
  /\bmust not\s+[A-Z][A-Za-z -]{2,}\.?$/m,
]

const STALE_PATTERNS = [
  'uncommitted P2.4 source',
  'local P2 change set',
  'pending commit',
  'pending push',
  'pending remote verification',
  'not present on GitHub remote main',
]

const EXPECTED_SEMANTIC_CORRECTION_COMMIT = 'b3b6d59b6b29a15cce518d7cd35f025da0665cde'

const EXPECTED_CANONICAL_STATE = {
  projectUiSource: 'complete-and-tracked',
  semanticCorrectionCommit: EXPECTED_SEMANTIC_CORRECTION_COMMIT,
  p2SourcePhase: 'complete',
  skillLockDiscovered: false,
  routed: false,
  synchronized: false,
  adapterActivated: false,
  machineUiPolicyPresent: false,
  pageContractSchemaPresent: false,
  p3Started: false,
  p4Started: false,
  p5Started: false,
}

const EXPECTED_P3_HANDOFF_SOURCE_BASELINES = {
  sourceBaselineCommit: '624948ea9058507f8fae91975dabc715d984703a',
  semanticCorrectionCommit: EXPECTED_SEMANTIC_CORRECTION_COMMIT,
  canonicalClosureCommit: '0767895a53005f326767cfdf3102f6b72709aa31',
}

const EXPECTED_P3_HANDOFF_COUNTS = {
  historicalMarkerCount: 16,
  semanticObligationClusterCount: 14,
  currentCandidateMemberCount: 68,
  planOwnedContractCount: 12,
  unresolvedBlockingItemCount: 0,
}

const EXPECTED_P2_COUNTS = {
  activeRequirementCount: 345,
  retiredRequirementCount: 24,
  rejectedCandidateOccurrenceCount: 39,
  duplicateNormativeOccurrenceCount: 15,
  excludedNonCandidateFragmentCount: 2124,
  foundationPathCount: 9,
  staleCanonicalStatementCount: 0,
}

const EXPECTED_P2_COVERAGE_DECISION_SHA256 =
  '70aa7fb52c8d0234c693c3cd2aab427a12117992c7c0e19cca5ee1f3f443e40a'
const EXPECTED_P2_REQUIREMENT_STATE_SHA256 =
  '8a36e20ed43296065801b61cefebf0d701d09846a2059268f546b4569d034a00'
const EXPECTED_P2_CONFLICT_RESOLUTION_SHA256 =
  '740996fac616c4cea9509a0253f6734055a8f57867e6db28e28294c09f3bb037'

const EXPECTED_P3_HANDOFF_CLUSTERS = {
  'P3-HO-CLUSTER-001': [
    'P2C-REQ-0003',
    'P2C-REQ-0007',
    'P2C-REQ-0025',
    'P2C-REQ-0044',
    'P2C-REQ-0068',
  ],
  'P3-HO-CLUSTER-002': ['P2C-REQ-0012', 'P2C-REQ-0013', 'P2C-REQ-0014'],
  'P3-HO-CLUSTER-003': ['P2C-REQ-0020', 'P2C-REQ-0021', 'P2C-REQ-0024'],
  'P3-HO-CLUSTER-004': [
    'P2C-REQ-0119',
    'P2C-REQ-0120',
    'P2C-REQ-0144',
    'P2C-REQ-0149',
    'P2C-REQ-0177',
  ],
  'P3-HO-CLUSTER-005': [
    'P2C-REQ-0156',
    'P2C-REQ-0158',
    'P2C-REQ-0241',
    'P2C-REQ-0242',
    'P2C-REQ-0243',
    'P2C-REQ-0244',
  ],
  'P3-HO-CLUSTER-006': [
    'P2C-REQ-0181',
    'P2C-REQ-0253',
    'P2C-REQ-0256',
    'P2C-REQ-0269',
    'P2C-REQ-0270',
  ],
  'P3-HO-CLUSTER-007': [
    'P2C-REQ-0015',
    'P2C-REQ-0047',
    'P2C-REQ-0048',
    'P2C-REQ-0139',
    'P2C-REQ-0140',
    'P2C-REQ-0248',
    'P2C-REQ-0266',
  ],
  'P3-HO-CLUSTER-008': [
    'P2C-REQ-0198',
    'P2C-REQ-0201',
    'P2C-REQ-0202',
    'P2C-REQ-0204',
    'P2C-REQ-0206',
    'P2C-REQ-0208',
    'P2C-REQ-0308',
    'P2C-REQ-0310',
  ],
  'P3-HO-CLUSTER-009': [
    'P2C-REQ-0301',
    'P2C-REQ-0304',
    'P2C-REQ-0348',
    'P2C-REQ-0350',
    'P2C-REQ-0352',
  ],
  'P3-HO-CLUSTER-010': ['P2C-REQ-0276', 'P2C-REQ-0278', 'P2C-REQ-0309', 'P2C-REQ-0320'],
  'P3-HO-CLUSTER-011': [
    'P2C-REQ-0220',
    'P2C-REQ-0221',
    'P2C-REQ-0287',
    'P2C-REQ-0288',
    'P2C-REQ-0295',
    'P2C-REQ-0325',
    'P2C-REQ-0349',
  ],
  'P3-HO-CLUSTER-012': ['P2C-REQ-0329', 'P2C-REQ-0330', 'P2C-REQ-0347', 'P2C-REQ-0354'],
  'P3-HO-CLUSTER-013': ['P2C-REQ-0011', 'P2C-REQ-0023', 'P2C-REQ-0155', 'P2C-REQ-0240'],
  'P3-HO-CLUSTER-014': ['P2C-REQ-0249', 'P2C-REQ-0254'],
}

const EXPECTED_P3_PLAN_OWNED_CONTRACT_IDS = [
  'machine-policy-document-contract',
  'machine-policy-schema-contract',
  'product-ui-profile-schema-contract',
  'ccd-profile-document-contract',
  'ui-exception-schema-contract',
  'empty-exception-registry-contract',
  'schema-fixture-contract',
  'rule-case-contract',
  'policy-validator-contract',
  'validator-self-test-contract',
  'canonical-wiki-contract',
  'lifecycle-integration-contract',
]

const EXPECTED_P3_HISTORICAL_MARKERS = {
  'P2-REQ-0007': ['P2C-REQ-0006'],
  'P2-REQ-0016': ['P2C-REQ-0012', 'P2C-REQ-0013'],
  'P2-REQ-0054': ['P2C-REQ-0028'],
  'P2-REQ-0092': ['P2C-REQ-0047'],
  'P2-REQ-0114': ['P2C-REQ-0065'],
  'P2-REQ-0118': ['P2C-REQ-0067'],
  'P2-REQ-0121': ['P2C-REQ-0006', 'P2C-REQ-0008', 'P2C-REQ-0044'],
  'P2-REQ-0184': [],
  'P2-REQ-0265': ['P2C-REQ-0159', 'P2C-REQ-0160'],
  'P2-REQ-0581': [],
  'P2-REQ-0583': [],
  'P2-REQ-0596': [],
  'P2-REQ-0599': [],
  'P2-REQ-0604': [],
  'P2-REQ-0613': [],
  'P2-REQ-0614': ['P2C-REQ-0366'],
}

const P3_MACHINE_POLICY_PATHS = [
  '.ai/governance/policies/ui.json',
  '.ai/governance/ui/schemas/ui-policy.schema.json',
  '.ai/governance/ui/schemas/product-ui-profile.schema.json',
  '.ai/governance/ui/schemas/ui-exception.schema.json',
  '.ai/governance/ui/schemas/ui-exception-registry.schema.json',
  '.ai/governance/ui/profiles/ccd-architectural-glass.json',
  '.ai/governance/ui/exceptions.json',
  '.ai/governance/ui/fixtures/rule-cases.json',
  '.ai/governance/ui/scripts/validate-ui-policy.mjs',
  'wiki/canonical/design/machine-ui-policy.md',
]

const STALE_LIFECYCLE_PATTERNS = [
  { label: 'p2-under-correction', regex: /\bp2 remains under correction\b/ },
  { label: 'p2-correction-pending', regex: /\bp2 correction (?:is )?pending\b/ },
  {
    label: 'change-set-unstaged',
    regex:
      /\b(?:correction (?:is |was |remains )?unstaged|(?:correction )?change set (?:is |remains |leaves the correction change set )?unstaged)\b/,
  },
  {
    label: 'change-set-uncommitted',
    regex: /\b(?:correction )?change set (?:is |remains )?uncommitted\b/,
  },
  { label: 'pending-commit', regex: /\bpending commit\b/ },
  { label: 'pending-push', regex: /\bpending push\b/ },
  { label: 'awaiting-remote-verification', regex: /\bawaiting remote verification\b/ },
  { label: 'pending-remote-verification', regex: /\bpending remote verification\b/ },
  { label: 'p2c3-reentry', regex: /\bp2c\.3 may be re-executed\b/ },
  { label: 'ready-before-push', regex: /\bready\b.*\bbefore push\b/ },
  {
    label: 'remote-push-not-verified',
    regex: /\bremote push (?:is )?not (?:yet )?verified\b/,
  },
]

const EPHEMERAL_PATH_PATTERNS = [
  { label: 'file:///private/tmp/', regex: /file:\/\/\/private\/tmp\// },
  { label: 'file:///tmp/', regex: /file:\/\/\/tmp\// },
  { label: '/private/tmp/', regex: /\/private\/tmp\// },
  { label: '/var/folders/', regex: /\/var\/folders\// },
  { label: '/tmp/', regex: /\/tmp\// },
  { label: 'file:///Users/<user>/', regex: /file:\/\/\/Users\/[^/\s"'`]+(?:\/|$)/ },
  { label: 'file:///home/<user>/', regex: /file:\/\/\/home\/[^/\s"'`]+(?:\/|$)/ },
  { label: '/Users/<user>/', regex: /\/Users\/[^/\s"'`]+(?:\/|$)/ },
  { label: '/home/<user>/', regex: /\/home\/[^/\s"'`]+(?:\/|$)/ },
]

const OBSOLETE_ACTIVE_PATTERNS = [
  /(^|[\s(])src\/views(?:\/|\b)/,
  /(^|[\s(])src\/router(?:\/|\b)/,
  /(^|[\s(])src\/types\/components\.d\.ts\b/,
  /(^|[\s(])src\/utils\/theme\/presetComponents(?:\/|\b)/,
  /(^|[\s(])src\/\*\*/,
]

const ALLOWED_EVIDENCE_TYPES = new Set([
  'governance-dependency',
  'implementation-evidence',
  'governance-dependency-and-implementation-evidence',
])

const ALLOWED_RECONCILIATION_STATES = new Set([
  'retained',
  'reclassified',
  'consolidated-but-explicit',
])

const args = process.argv.slice(2)
let jsonOutput = null
let coverageOverride = null
let selfTest = false
for (let index = 0; index < args.length; index += 1) {
  if (args[index] === '--json-output') {
    jsonOutput = args[index + 1]
    index += 1
    continue
  }
  if (args[index] === '--coverage-json') {
    coverageOverride = args[index + 1]
    index += 1
    continue
  }
  if (args[index] === '--self-test') {
    selfTest = true
    continue
  }
  console.error(`Unknown argument: ${args[index]}`)
  process.exit(2)
}

function findRoot(start) {
  let dir = path.resolve(start)
  while (true) {
    if (
      fs.existsSync(path.join(dir, '.ai/skills/project-ui/SKILL.md')) &&
      fs.existsSync(path.join(dir, '.ai/governance/ui/project-ui-semantic-coverage.json'))
    ) {
      return dir
    }
    const parent = path.dirname(dir)
    if (parent === dir) return path.resolve(start)
    dir = parent
  }
}

const root = findRoot(process.cwd())
const failures = []
const baselineFailures = []
const warnings = []

function addFailure(code, message, details = {}) {
  failures.push({ code, message, ...details })
}

function addBaselineFailure(code, message, details = {}) {
  baselineFailures.push({ code, message, ...details })
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath))
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8')
}

function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex')
}

function validateP3Handoff(coverageData) {
  const localFailures = []
  const fail = (code, message, details = {}) => {
    localFailures.push({ code, message, ...details })
  }
  const handoff = coverageData?.p3Handoff
  if (!handoff || typeof handoff !== 'object') {
    fail('p3-handoff-missing', 'Coverage artifact must contain the corrected P3 handoff.')
    return localFailures
  }

  const requiredCollections = [
    'authorityLayers',
    'semanticCandidates',
    'semanticObligationClusters',
    'supportingRequirementIds',
    'humanReviewBackgroundRequirementIds',
    'planOwnedContracts',
    'historicalMarkerDispositions',
    'semanticAreaCoverage',
    'unresolvedItems',
    'nonBlockingExcludedAmbiguities',
    'validation',
    'preservedP2State',
    'preservedLifecycleState',
  ]
  for (const field of requiredCollections) {
    if (!(field in handoff)) {
      fail('p3-handoff-structure', 'P3 handoff is missing a required separated collection.', {
        field,
      })
    }
  }

  if (handoff.schemaVersion !== 'ccd-p3-handoff/v1')
    fail('p3-handoff-schema-version', 'P3 handoff schema version is not recognized.', {
      actual: handoff.schemaVersion,
    })
  if (handoff.status !== 'ready-for-p3-baseline-revalidation')
    fail('p3-handoff-status', 'P3 handoff is not ready for P3 baseline revalidation.', {
      actual: handoff.status,
    })

  for (const [field, expected] of Object.entries(EXPECTED_P3_HANDOFF_SOURCE_BASELINES)) {
    if (handoff.sourceBaselines?.[field] !== expected)
      fail('p3-handoff-source-baseline', 'P3 handoff source baseline is incorrect.', {
        field,
        expected,
        actual: handoff.sourceBaselines?.[field],
      })
  }
  for (const [field, expected] of Object.entries(EXPECTED_P3_HANDOFF_COUNTS)) {
    if (handoff.counts?.[field] !== expected)
      fail('p3-handoff-count', 'P3 handoff declared count is incorrect.', {
        field,
        expected,
        actual: handoff.counts?.[field],
      })
  }

  const authorityLayers = Array.isArray(handoff.authorityLayers) ? handoff.authorityLayers : []
  if (
    authorityLayers.length !== 5 ||
    new Set(authorityLayers.map(layer => layer.layer)).size !== authorityLayers.length
  )
    fail('p3-handoff-authority-layers', 'P3 handoff must keep five unique authority layers.')

  const requirements = Array.isArray(coverageData?.requirements) ? coverageData.requirements : []
  const requirementById = new Map(
    requirements.map(requirement => [requirement.requirementId, requirement])
  )
  const expectedClusterIds = Object.keys(EXPECTED_P3_HANDOFF_CLUSTERS)
  const expectedCandidateIds = Object.values(EXPECTED_P3_HANDOFF_CLUSTERS).flat()
  const expectedCandidateSet = new Set(expectedCandidateIds)
  const semanticCandidates = handoff.semanticCandidates ?? {}
  const candidateIds = Array.isArray(semanticCandidates.currentRequirementIds)
    ? semanticCandidates.currentRequirementIds
    : []
  const candidateIdSet = new Set(candidateIds)

  if (semanticCandidates.canonicalUnit !== 'semantic-obligation-cluster')
    fail(
      'p3-handoff-canonical-unit',
      'P3 handoff canonical unit must be semantic-obligation-cluster.'
    )
  if (semanticCandidates.currentRequirementMemberCount !== 68)
    fail('p3-handoff-candidate-count', 'P3 handoff must declare 68 current candidate members.')
  if (semanticCandidates.clusterCount !== 14)
    fail('p3-handoff-cluster-count', 'P3 handoff must declare 14 semantic obligation clusters.')
  if (JSON.stringify(semanticCandidates.clusterIds) !== JSON.stringify(expectedClusterIds))
    fail('p3-handoff-cluster-inventory', 'P3 handoff cluster inventory is incorrect.')
  if (
    !Array.isArray(semanticCandidates.futurePolicyRuleIds) ||
    semanticCandidates.futurePolicyRuleIds.length !== 0
  )
    fail(
      'p3-handoff-premature-policy-rule-id',
      'Permanent Machine UI Policy rule IDs must not exist during P3.1C.'
    )
  if (candidateIdSet.size !== candidateIds.length)
    fail('p3-handoff-duplicate-candidate', 'P3 semantic candidate IDs must be unique.', {
      count: candidateIds.length,
      unique: candidateIdSet.size,
    })
  if (
    candidateIdSet.size !== expectedCandidateSet.size ||
    [...expectedCandidateSet].some(requirementId => !candidateIdSet.has(requirementId))
  )
    fail('p3-handoff-candidate-inventory', 'P3 semantic candidate inventory is incorrect.')

  for (const candidateId of candidateIds) {
    if (EXPECTED_P3_PLAN_OWNED_CONTRACT_IDS.includes(candidateId))
      fail(
        'p3-handoff-plan-contract-as-candidate',
        'P3 plan-owned contracts must not be counted as P2 semantic candidates.',
        { candidateId }
      )
    const requirement = requirementById.get(candidateId)
    if (!requirement) {
      fail('p3-handoff-unknown-candidate', 'P3 semantic candidate does not resolve to P2.', {
        candidateId,
      })
      continue
    }
    if (requirement.coverageDecision !== 'covered')
      fail(
        'p3-handoff-candidate-coverage-decision',
        'Every P3 semantic candidate must remain an active covered P2 requirement.',
        { candidateId, actual: requirement.coverageDecision }
      )
  }

  const clusters = Array.isArray(handoff.semanticObligationClusters)
    ? handoff.semanticObligationClusters
    : []
  const clusterIds = clusters.map(cluster => cluster.clusterId)
  if (clusters.length !== 14)
    fail('p3-handoff-cluster-count', 'P3 handoff must contain exactly 14 clusters.', {
      actual: clusters.length,
    })
  if (new Set(clusterIds).size !== clusterIds.length)
    fail('p3-handoff-duplicate-cluster', 'P3 handoff cluster IDs must be unique.')
  if (JSON.stringify(clusterIds) !== JSON.stringify(expectedClusterIds))
    fail('p3-handoff-cluster-inventory', 'P3 handoff cluster IDs are incorrect.')

  const ownerCounts = new Map()
  for (const cluster of clusters) {
    const expectedMembers = EXPECTED_P3_HANDOFF_CLUSTERS[cluster.clusterId]
    const currentRequirementIds = Array.isArray(cluster.currentRequirementIds)
      ? cluster.currentRequirementIds
      : []
    for (const requirementId of currentRequirementIds) {
      ownerCounts.set(requirementId, (ownerCounts.get(requirementId) ?? 0) + 1)
    }
    if (!expectedMembers) {
      fail('p3-handoff-cluster-inventory', 'Unknown P3 handoff cluster found.', {
        clusterId: cluster.clusterId,
      })
      continue
    }
    if (JSON.stringify(currentRequirementIds) !== JSON.stringify(expectedMembers))
      fail('p3-handoff-cluster-membership', 'P3 handoff cluster membership is incorrect.', {
        clusterId: cluster.clusterId,
      })
    if (cluster.candidateRequirementCount !== expectedMembers.length)
      fail('p3-handoff-cluster-member-count', 'Cluster member count is incorrect.', {
        clusterId: cluster.clusterId,
        expected: expectedMembers.length,
        actual: cluster.candidateRequirementCount,
      })
    if (cluster.canonicalUnit !== 'semantic-obligation-cluster' || cluster.layer !== 3)
      fail('p3-handoff-cluster-authority', 'Cluster authority metadata is incorrect.', {
        clusterId: cluster.clusterId,
      })

    for (const field of [
      'normativeInvariant',
      'scope',
      'machineClassifiability',
      'currentEnforcement',
      'futureSourceScannerBoundary',
      'futurePageContractBoundary',
      'redundancyRationale',
      'selectionRationale',
    ]) {
      if (typeof cluster[field] !== 'string' || cluster[field].trim() === '')
        fail('p3-handoff-cluster-capability', 'Cluster capability metadata is missing.', {
          clusterId: cluster.clusterId,
          field,
        })
    }
    if (
      !/^(?:machine-enforceable|machine-classifiable|mixed|human-review-only)\b/.test(
        cluster.machineClassifiability ?? ''
      )
    )
      fail(
        'p3-handoff-unknown-cluster-capability',
        'Cluster machine classifiability is not recognized.',
        { clusterId: cluster.clusterId, actual: cluster.machineClassifiability }
      )
    if (!Array.isArray(cluster.historicalLineage))
      fail('p3-handoff-cluster-lineage', 'Cluster historical lineage must be explicit.', {
        clusterId: cluster.clusterId,
      })
    if (cluster.permanentPolicyRuleIdsAssigned !== false)
      fail(
        'p3-handoff-premature-policy-rule-id',
        'Clusters must not assign permanent Machine UI Policy rule IDs during P3.1C.',
        { clusterId: cluster.clusterId }
      )

    const normalizedTexts = Array.isArray(cluster.normalizedRequirementTexts)
      ? cluster.normalizedRequirementTexts
      : []
    const normalizedById = new Map(normalizedTexts.map(record => [record.requirementId, record]))
    if (normalizedById.size !== normalizedTexts.length)
      fail('p3-handoff-duplicate-candidate', 'Cluster normalized-text records must be unique.', {
        clusterId: cluster.clusterId,
      })
    const semanticSourceIds = Array.isArray(cluster.semanticSourceIds)
      ? cluster.semanticSourceIds
      : []
    const semanticSourcePaths = Array.isArray(cluster.semanticSourcePaths)
      ? cluster.semanticSourcePaths
      : []
    const sourceSections = Array.isArray(cluster.sourceSections) ? cluster.sourceSections : []
    const sourceLocations = Array.isArray(cluster.sourceLocations) ? cluster.sourceLocations : []
    if (
      semanticSourceIds.length === 0 ||
      semanticSourcePaths.length === 0 ||
      sourceSections.length === 0 ||
      sourceLocations.length === 0
    )
      fail('p3-handoff-missing-semantic-source', 'Cluster semantic source metadata is missing.', {
        clusterId: cluster.clusterId,
      })

    for (const requirementId of expectedMembers) {
      const requirement = requirementById.get(requirementId)
      const normalizedRecord = normalizedById.get(requirementId)
      if (!requirement || !normalizedRecord) {
        fail('p3-handoff-text-hash-mismatch', 'Cluster normalized-text record is missing.', {
          clusterId: cluster.clusterId,
          requirementId,
        })
        continue
      }
      const expectedHash = sha256(requirement.normalizedRequirement)
      if (
        normalizedRecord.normalizedRequirementText !== requirement.normalizedRequirement ||
        normalizedRecord.normalizedTextHash !== expectedHash
      )
        fail(
          'p3-handoff-text-hash-mismatch',
          'Cluster normalized text or hash does not match current P2.',
          { clusterId: cluster.clusterId, requirementId }
        )

      const sourceMatches = (requirement.sourceOccurrences ?? []).some(occurrence =>
        sourceLocations.some(
          location =>
            location.path === occurrence.sourceAsset &&
            location.section === occurrence.sourceHeading &&
            location.startLine === occurrence.startLine &&
            location.endLine === occurrence.endLine &&
            location.sourceSliceSha256 === occurrence.sourceSliceSha256
        )
      )
      const sourcePathMatches = (requirement.sourceOccurrences ?? []).some(occurrence =>
        semanticSourcePaths.includes(occurrence.sourceAsset)
      )
      const sourceSectionMatches = (requirement.sourceOccurrences ?? []).some(occurrence =>
        sourceSections.includes(occurrence.sourceHeading)
      )
      if (
        !semanticSourceIds.includes(expectedHash) ||
        !sourceMatches ||
        !sourcePathMatches ||
        !sourceSectionMatches
      )
        fail(
          'p3-handoff-missing-semantic-source',
          'Cluster semantic source does not match current P2.',
          { clusterId: cluster.clusterId, requirementId }
        )
    }
  }

  for (const candidateId of expectedCandidateIds) {
    const ownerCount = ownerCounts.get(candidateId) ?? 0
    if (ownerCount === 0)
      fail(
        'p3-handoff-missing-cluster-membership',
        'Every selected candidate must have one primary cluster.',
        { candidateId }
      )
    if (ownerCount > 1)
      fail(
        'p3-handoff-duplicate-primary-ownership',
        'A selected candidate cannot belong to multiple primary clusters.',
        { candidateId, ownerCount }
      )
  }

  const supportingRequirementIds = Array.isArray(handoff.supportingRequirementIds)
    ? handoff.supportingRequirementIds
    : []
  const humanReviewRequirementIds = Array.isArray(handoff.humanReviewBackgroundRequirementIds)
    ? handoff.humanReviewBackgroundRequirementIds
    : []
  const ambiguityIds = Array.isArray(handoff.nonBlockingExcludedAmbiguities)
    ? handoff.nonBlockingExcludedAmbiguities.map(item => item.requirementId)
    : []
  for (const [collection, ids] of [
    ['supportingRequirementIds', supportingRequirementIds],
    ['humanReviewBackgroundRequirementIds', humanReviewRequirementIds],
    ['nonBlockingExcludedAmbiguities', ambiguityIds],
  ]) {
    if (new Set(ids).size !== ids.length)
      fail('p3-handoff-supporting-context', 'Supporting context IDs must be unique.', {
        collection,
      })
    for (const requirementId of ids) {
      if (!requirementById.has(requirementId) || candidateIdSet.has(requirementId))
        fail(
          'p3-handoff-supporting-context',
          'Supporting context must resolve to active non-candidate P2 requirements.',
          { collection, requirementId }
        )
    }
  }
  const separatedContextIds = [
    ...supportingRequirementIds,
    ...humanReviewRequirementIds,
    ...ambiguityIds,
  ]
  if (new Set(separatedContextIds).size !== separatedContextIds.length)
    fail(
      'p3-handoff-supporting-context',
      'Supporting, human-review, and ambiguity context collections must remain separate.'
    )
  for (const ambiguity of handoff.nonBlockingExcludedAmbiguities ?? []) {
    if (ambiguity.blocksHandoff !== false || typeof ambiguity.reason !== 'string')
      fail(
        'p3-handoff-blocking-ambiguity',
        'Excluded ambiguities must remain explicit and non-blocking.',
        { requirementId: ambiguity.requirementId }
      )
  }

  const historicalDispositions = Array.isArray(handoff.historicalMarkerDispositions)
    ? handoff.historicalMarkerDispositions
    : []
  const historicalIds = historicalDispositions.map(item => item.historicalRequirementId)
  const expectedHistoricalIds = Object.keys(EXPECTED_P3_HISTORICAL_MARKERS)
  if (
    historicalDispositions.length !== 16 ||
    new Set(historicalIds).size !== historicalIds.length ||
    JSON.stringify(historicalIds) !== JSON.stringify(expectedHistoricalIds)
  )
    fail(
      'p3-handoff-historical-inventory',
      'P3 handoff must disposition all 16 historical markers without parity assumptions.'
    )
  for (const disposition of historicalDispositions) {
    const expectedReplacements = EXPECTED_P3_HISTORICAL_MARKERS[disposition.historicalRequirementId]
    if (
      !expectedReplacements ||
      JSON.stringify(disposition.currentReplacementRequirementIds) !==
        JSON.stringify(expectedReplacements)
    )
      fail('p3-handoff-historical-lineage', 'Historical marker lineage is incorrect.', {
        historicalRequirementId: disposition.historicalRequirementId,
      })
    if (
      typeof disposition.currentClassification !== 'string' ||
      disposition.currentClassification.trim() === '' ||
      typeof disposition.historicalMarkerEligibleAsCanonicalUnit !== 'boolean'
    )
      fail(
        'p3-handoff-historical-disposition',
        'Every historical marker must have an explicit disposition.',
        { historicalRequirementId: disposition.historicalRequirementId }
      )
    for (const replacementId of disposition.currentReplacementRequirementIds ?? []) {
      if (!requirementById.has(replacementId))
        fail('p3-handoff-historical-lineage', 'Historical replacement ID is not active.', {
          historicalRequirementId: disposition.historicalRequirementId,
          replacementId,
        })
    }
  }

  const planOwnedContracts = Array.isArray(handoff.planOwnedContracts)
    ? handoff.planOwnedContracts
    : []
  const planContractIds = planOwnedContracts.map(contract => contract.id)
  if (
    planOwnedContracts.length !== 12 ||
    new Set(planContractIds).size !== planContractIds.length ||
    JSON.stringify(planContractIds) !== JSON.stringify(EXPECTED_P3_PLAN_OWNED_CONTRACT_IDS)
  )
    fail(
      'p3-handoff-plan-contract-inventory',
      'P3 handoff must contain exactly the 12 controller-owned contracts.'
    )
  for (const contract of planOwnedContracts) {
    if (
      contract.createsNewUiSemantics !== false ||
      typeof contract.controllerAuthority !== 'string' ||
      !contract.controllerAuthority.includes('P3 controller') ||
      !Array.isArray(contract.repositorySemanticDependencies) ||
      contract.repositorySemanticDependencies.length === 0 ||
      !Array.isArray(contract.requiredP3Deliverables) ||
      contract.requiredP3Deliverables.length === 0 ||
      typeof contract.validationBoundary !== 'string' ||
      contract.validationBoundary.trim() === ''
    )
      fail(
        'p3-handoff-plan-contract-authority',
        'Plan-owned contracts must derive authority from the P3 controller without creating UI semantics.',
        { contractId: contract.id }
      )
    if (candidateIdSet.has(contract.id))
      fail(
        'p3-handoff-plan-contract-as-candidate',
        'P3 plan-owned contracts must remain outside P2 semantic candidates.',
        { contractId: contract.id }
      )
  }

  const semanticAreaCoverage = Array.isArray(handoff.semanticAreaCoverage)
    ? handoff.semanticAreaCoverage
    : []
  if (
    semanticAreaCoverage.length !== 14 ||
    JSON.stringify(semanticAreaCoverage.map(area => area.clusterId)) !==
      JSON.stringify(expectedClusterIds)
  )
    fail('p3-handoff-semantic-area-coverage', 'Semantic area coverage is incomplete.')
  for (const area of semanticAreaCoverage) {
    if (
      JSON.stringify(area.candidateRequirementIds) !==
        JSON.stringify(EXPECTED_P3_HANDOFF_CLUSTERS[area.clusterId]) ||
      !Array.isArray(area.semanticSourcePaths) ||
      area.semanticSourcePaths.length === 0 ||
      !Array.isArray(area.projectUiAuthorityPaths) ||
      area.projectUiAuthorityPaths.length === 0
    )
      fail('p3-handoff-semantic-area-coverage', 'Semantic area coverage is incorrect.', {
        clusterId: area.clusterId,
      })
  }

  const unresolvedItems = Array.isArray(handoff.unresolvedItems) ? handoff.unresolvedItems : []
  if (unresolvedItems.length !== 0 || handoff.counts?.unresolvedBlockingItemCount !== 0)
    fail(
      'p3-handoff-unresolved-blocker',
      'P3 handoff cannot be ready while unresolved blocking items exist.'
    )

  const requiredValidationKeys = [
    'semanticCandidateIntegrity',
    'semanticClusterIntegrity',
    'supportingContextSeparation',
    'historicalMarkerDisposition',
    'planOwnedContractInventory',
    'p2AccountingPreservation',
    'lifecycleStatePreservation',
    'futureP3CompletionState',
  ]
  for (const key of requiredValidationKeys) {
    if (
      handoff.validation?.[key] !== (key === 'futureP3CompletionState' ? 'phase-gated' : 'required')
    )
      fail('p3-handoff-validation-contract', 'P3 handoff validation contract is incomplete.', {
        key,
        actual: handoff.validation?.[key],
      })
  }

  for (const [field, expected] of Object.entries(EXPECTED_P2_COUNTS)) {
    if (coverageData?.[field] !== expected || handoff.preservedP2State?.[field] !== expected)
      fail('p3-handoff-p2-count-drift', 'P2 accounting count changed during handoff.', {
        field,
        expected,
        coverage: coverageData?.[field],
        preserved: handoff.preservedP2State?.[field],
      })
  }
  if (
    requirements.length !== EXPECTED_P2_COUNTS.activeRequirementCount ||
    (coverageData?.retiredRequirements ?? []).length !==
      EXPECTED_P2_COUNTS.retiredRequirementCount ||
    (coverageData?.rejectedCandidateOccurrences ?? []).length !==
      EXPECTED_P2_COUNTS.rejectedCandidateOccurrenceCount ||
    (coverageData?.duplicateOccurrences ?? []).length !==
      EXPECTED_P2_COUNTS.duplicateNormativeOccurrenceCount ||
    (coverageData?.excludedFragments ?? []).length !==
      EXPECTED_P2_COUNTS.excludedNonCandidateFragmentCount ||
    (coverageData?.foundationReuse ?? []).length !== EXPECTED_P2_COUNTS.foundationPathCount
  )
    fail('p3-handoff-p2-count-drift', 'P2 accounting collections changed during handoff.')

  const coverageDecisionSha256 = sha256(
    JSON.stringify(
      requirements.map(requirement => [requirement.requirementId, requirement.coverageDecision])
    )
  )
  const requirementStateSha256 = sha256(
    JSON.stringify(
      requirements.map(requirement => ({
        requirementId: requirement.requirementId,
        normalizedRequirement: requirement.normalizedRequirement,
        coverageDecision: requirement.coverageDecision,
        sourceOccurrences: requirement.sourceOccurrences,
        sourceSliceSha256: requirement.sourceSliceSha256,
        primaryTargetFile: requirement.primaryTargetFile,
        primaryTargetHeading: requirement.primaryTargetHeading,
        secondaryTargets: requirement.secondaryTargets,
        conflictIds: requirement.conflictIds,
      }))
    )
  )
  const conflictResolutionSha256 = sha256(JSON.stringify(coverageData?.conflictResolutions))
  if (
    coverageDecisionSha256 !== EXPECTED_P2_COVERAGE_DECISION_SHA256 ||
    handoff.preservedP2State?.coverageDecisionSha256 !== EXPECTED_P2_COVERAGE_DECISION_SHA256 ||
    handoff.preservedP2State?.coverageDecisionValuesUnchanged !== true
  )
    fail('p3-handoff-coverage-decision-drift', 'P2 coverage decisions changed during handoff.')
  if (
    requirementStateSha256 !== EXPECTED_P2_REQUIREMENT_STATE_SHA256 ||
    handoff.preservedP2State?.requirementStateSha256 !== EXPECTED_P2_REQUIREMENT_STATE_SHA256 ||
    handoff.preservedP2State?.projectUiSemanticsUnchanged !== true
  )
    fail(
      'p3-handoff-p2-semantic-state-drift',
      'P2 requirement text or semantic source mapping changed during handoff.'
    )
  if (
    conflictResolutionSha256 !== EXPECTED_P2_CONFLICT_RESOLUTION_SHA256 ||
    handoff.preservedP2State?.conflictResolutionSha256 !== EXPECTED_P2_CONFLICT_RESOLUTION_SHA256
  )
    fail('p3-handoff-p2-conflict-drift', 'P2 conflict decisions changed during handoff.')

  const canonicalState = coverageData?.canonicalState ?? {}
  if (canonicalState.p3Started !== false)
    fail('p3-handoff-p3-started', 'P3 must remain not started after handoff correction.')
  if (canonicalState.machineUiPolicyPresent !== false)
    fail(
      'p3-handoff-machine-policy-presence',
      'Machine UI Policy must remain absent after handoff correction.'
    )
  if (canonicalState.pageContractSchemaPresent !== false)
    fail(
      'p3-handoff-page-contract-presence',
      'Page Contract Schema must remain absent after handoff correction.'
    )
  for (const field of [
    'p4Started',
    'p5Started',
    'skillLockDiscovered',
    'routed',
    'synchronized',
    'adapterActivated',
  ]) {
    if (canonicalState[field] !== false)
      fail('p3-handoff-lifecycle-state', 'P3 handoff changed a protected lifecycle state.', {
        field,
        actual: canonicalState[field],
      })
  }
  for (const [field, expected] of Object.entries(handoff.preservedLifecycleState ?? {})) {
    if (expected !== false || canonicalState[field] !== expected)
      fail('p3-handoff-lifecycle-state', 'Preserved lifecycle state does not match P2.', {
        field,
        expected,
        actual: canonicalState[field],
      })
  }
  for (const machinePolicyPath of P3_MACHINE_POLICY_PATHS) {
    if (exists(machinePolicyPath))
      fail(
        'p3-handoff-machine-policy-presence',
        'A permanent P3 Machine UI Policy path exists before P3 starts.',
        { path: machinePolicyPath }
      )
  }
  const prematurePolicyRuleIds = JSON.stringify(handoff).match(/\bCCD-UI-\d{3}\b/g) ?? []
  if (prematurePolicyRuleIds.length > 0)
    fail(
      'p3-handoff-premature-policy-rule-id',
      'Permanent CCD-UI rule IDs must not exist before P3 starts.',
      { ids: [...new Set(prematurePolicyRuleIds)] }
    )

  return localFailures
}

function normalizeRequirement(text) {
  return String(text ?? '')
    .trim()
    .replace(/^[-*+]\s+/, '')
    .replace(/^\d+[.)]\s+/, '')
    .replace(/^\[[ xX]\]\s+/, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/\s+/g, ' ')
    .replace(/[:;]\s*$/, '')
    .trim()
}

function tokenCount(text) {
  return normalizeRequirement(text).split(/\s+/).filter(Boolean).length
}

function sourceLine(occurrence) {
  const sourcePath = path.join(root, occurrence.sourceAsset ?? '')
  if (!fs.existsSync(sourcePath)) return occurrence.text ?? ''
  const lines = fs.readFileSync(sourcePath, 'utf8').split(/\r?\n/)
  return lines[occurrence.startLine - 1] ?? occurrence.text ?? ''
}

function lineIsLabel(line) {
  const trimmed = String(line ?? '').trim()
  if (/^\s*[-*+]\s+/.test(trimmed)) return false
  if (/^\s*[#/]/.test(trimmed)) return false
  const withoutWrappers = normalizeRequirement(trimmed)
  return /[:;]\s*(?:\*\*)?$/.test(trimmed) || MARKER_LEXICON.has(withoutWrappers.toLowerCase())
}

function lineIntroducesAdjacentMaterial(occurrence) {
  const sourcePath = path.join(root, occurrence.sourceAsset ?? '')
  if (!fs.existsSync(sourcePath)) return true
  const lines = fs.readFileSync(sourcePath, 'utf8').split(/\r?\n/)
  const after = lines.slice(occurrence.endLine, occurrence.endLine + 3).join('\n')
  return (
    /^\s*[-*+]\s+/m.test(after) ||
    /^\s*\d+[.)]\s+/m.test(after) ||
    /^```/m.test(after) ||
    /^\s*\|/m.test(after)
  )
}

function hasCompleteProposition(text) {
  const normalized = normalizeRequirement(text)
  const lower = normalized.toLowerCase()
  if (!normalized) return false
  if (MARKER_LEXICON.has(lower)) return false
  if (/\b(if|when|for|because|where|use|define|preserve|prioritize|feel)$/.test(lower)) return false
  if (/^(use|avoid|do not use|must not|forbidden|required)$/.test(lower)) return false
  if (/^(forbidden|required)\s+(on|inside|for)\b/.test(lower)) return false
  if (/^(required|forbidden)\s+[—-]\s+semantic tokens only$/.test(lower)) return false
  if (/^examples?\s+below\s+use\b/.test(lower)) return false
  if (/^must\s+not\s+(?:inside|combinations)\b/.test(lower)) return false
  if (
    /^(login|reduced motion|every page|ccd ui|it)\b.*\b(use|preserve|define|feel|prioritize)$/.test(
      lower
    )
  ) {
    return false
  }
  if (/^reject\b.*\b(if|found)$/.test(lower)) return false
  if (/^reject\s+if\s+any\s+answer\s+is\s+no$/.test(lower)) return false
  if (/^use icons for$/.test(lower)) return false
  return /\b(must|must not|should|should not|do not|never|forbidden|required|use|prefer|reject|preserve|define|include|follow|consume|load|own|owns)\b/i.test(
    normalized
  )
}

function classifyStandaloneMarker(requirement) {
  const normalized = normalizeRequirement(requirement.normalizedRequirement)
  const lower = normalized.toLowerCase()
  const occurrences = requirement.sourceOccurrences ?? []
  const labelContext =
    occurrences.length === 0 ||
    occurrences.every(occurrence => {
      const line = sourceLine(occurrence) || occurrence.text
      return lineIsLabel(line) && lineIntroducesAdjacentMaterial(occurrence)
    })
  const bounded =
    MARKER_LEXICON.has(lower) ||
    /\b(if|when|for|because|where)$/.test(lower) ||
    (tokenCount(normalized) <= 6 && labelContext) ||
    (/^(forbidden|required)\s+(on|inside|for)\b/.test(lower) && labelContext)

  const falsePositive =
    /^prefer\s+the\s+existing\s+shared\s+component\s+before\s+creating\s+a\s+new\s+primitive\.?$/i.test(
      normalized
    ) ||
    /^reject\s+the\s+change\s+if\s+(?:keyboard\s+)?focus\s+cannot\s+return\s+to\s+the\s+trigger\.?$/i.test(
      normalized
    ) ||
    /^required\s+validation\s+must\s+preserve\s+(?:business|route)\s+behavior\.?$/i.test(
      normalized
    ) ||
    /^allowed\s+structural\s+(?:css\s+)?values\s+include\s+minmax\(\),?\s+(?:calc\(\),?\s+)?and\s+clamp\(\)\.?$/i.test(
      normalized
    )

  return !falsePositive && bounded && labelContext && !hasCompleteProposition(normalized)
}

function hasObsoleteActivePath(text) {
  return OBSOLETE_ACTIVE_PATTERNS.find(pattern => pattern.test(text))
}

function sections(markdown) {
  const lines = markdown.split(/\r?\n/)
  const found = []
  for (let index = 0; index < lines.length; index += 1) {
    const match = /^(#{1,6})\s+(.+?)\s*$/.exec(lines[index])
    if (match) {
      found.push({ level: match[1].length, heading: match[2], start: index, body: '' })
    }
  }
  for (let index = 0; index < found.length; index += 1) {
    const end = index + 1 < found.length ? found[index + 1].start : lines.length
    found[index].body = lines.slice(found[index].start + 1, end).join('\n')
  }
  return found
}

function isSubstantive(body) {
  const compact = body
    .replace(/\[[^\]]+\]\([^)]*\)/g, '')
    .replace(/[*_#>|\-\s]/g, '')
    .trim()
  return (
    compact.length >= 80 &&
    /(must|should|require|forbid|reject|preserve|verify|use|load|apply|define|confirm|validate|own|separate|remain|avoid|govern|communicate|eligible|belong|record|create|support|select|replace|start|include|treat|choose|control|inspect|do not|does not|cannot|\bis\b|\bare\b)/i.test(
      body
    )
  )
}

function firstEphemeralPathMatch(value) {
  for (const pattern of EPHEMERAL_PATH_PATTERNS) {
    if (pattern.regex.test(value)) return pattern.label
  }
  return null
}

function scanJsonStrings(value, fieldPath, file, findings) {
  if (typeof value === 'string') {
    const matchedPattern = firstEphemeralPathMatch(value)
    if (matchedPattern) {
      findings.push({
        file,
        field: fieldPath.join('.'),
        pattern: matchedPattern,
        value,
      })
    }
    return
  }

  if (!value || typeof value !== 'object') return

  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      scanJsonStrings(value[index], fieldPath.concat(String(index)), file, findings)
    }
    return
  }

  for (const [key, nestedValue] of Object.entries(value)) {
    scanJsonStrings(nestedValue, fieldPath.concat(key), file, findings)
  }
}

function scanTextLines(file, text, findings) {
  const lines = text.split(/\r?\n/)
  for (let index = 0; index < lines.length; index += 1) {
    const matchedPattern = firstEphemeralPathMatch(lines[index])
    if (matchedPattern) {
      findings.push({
        file,
        line: index + 1,
        pattern: matchedPattern,
        value: lines[index].trim(),
      })
    }
  }
}

function normalizeLifecycleText(text) {
  return String(text ?? '')
    .replace(/[`*_]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

function staleLifecycleMatches(text) {
  const normalized = normalizeLifecycleText(text)
  return STALE_LIFECYCLE_PATTERNS.filter(pattern => pattern.regex.test(normalized)).map(
    pattern => pattern.label
  )
}

function isCurrentLifecycleHeading(heading) {
  return /\b(?:current integration state|p2 and p3 state|handoff|current state|canonical state)\b/i.test(
    String(heading ?? '')
  )
}

function isHistoricalHeading(heading) {
  return /\b(?:history|historical|before|prior)\b/i.test(String(heading ?? ''))
}

function isCurrentLifecycleField(field) {
  return /\b(?:handoff|canonicalState|currentState|coverageSummary|qualityGate\.summary)\b/.test(
    field
  )
}

function isHistoricalField(field) {
  return /\b(?:history|historical|previous|prior)\b/i.test(field)
}

function hasExplicitHistoricalMarker(text) {
  return /\b(?:historical note|historically|before commit|prior to commit|previously)\b/i.test(
    String(text ?? '')
  )
}

function shouldRejectLifecycleAssertion({ text, heading, field }) {
  const matches = staleLifecycleMatches(text)
  if (matches.length === 0) return null

  const currentContext =
    isCurrentLifecycleHeading(heading) || (field ? isCurrentLifecycleField(field) : false)
  const historicalContext =
    hasExplicitHistoricalMarker(text) &&
    (isHistoricalHeading(heading) || (field ? isHistoricalField(field) : false))

  if (historicalContext && !currentContext) return null

  return {
    matches,
    classification: 'stale-current-lifecycle-state',
  }
}

function scanMarkdownLifecycleAssertions(file, text) {
  const findings = []
  const lines = text.split(/\r?\n/)
  let heading = null
  for (let index = 0; index < lines.length; index += 1) {
    const match = /^(#{1,6})\s+(.+?)\s*$/.exec(lines[index])
    if (match) heading = match[2]
    const rejection = shouldRejectLifecycleAssertion({ text: lines[index], heading })
    if (rejection) {
      findings.push({
        file,
        heading,
        line: index + 1,
        text: lines[index].trim(),
        ...rejection,
      })
    }
  }
  return findings
}

function scanJsonLifecycleAssertions(value, fieldPath = [], file = COVERAGE_ARTIFACT) {
  if (typeof value === 'string') {
    const field = fieldPath.join('.')
    const rejection = shouldRejectLifecycleAssertion({ text: value, field })
    return rejection
      ? [
          {
            file,
            field,
            text: value,
            ...rejection,
          },
        ]
      : []
  }

  if (!value || typeof value !== 'object') return []

  if (Array.isArray(value)) {
    return value.flatMap((nestedValue, index) =>
      scanJsonLifecycleAssertions(nestedValue, fieldPath.concat(String(index)), file)
    )
  }

  return Object.entries(value).flatMap(([key, nestedValue]) =>
    scanJsonLifecycleAssertions(nestedValue, fieldPath.concat(key), file)
  )
}

function scanCurrentLifecycleState(coverageData) {
  const findings = coverageData ? scanJsonLifecycleAssertions(coverageData) : []

  for (const file of PERMANENT_PROJECT_UI_ARTIFACTS) {
    if (file === COVERAGE_ARTIFACT) continue
    if (!exists(file)) continue
    findings.push(...scanMarkdownLifecycleAssertions(file, read(file)))
  }

  return findings
}

function extractSectionBody(markdown, heading) {
  return sections(markdown).find(section => section.heading === heading)?.body ?? ''
}

function assertExpectedCanonicalState(coverageData, wiki) {
  const localFailures = []
  const canonicalState = coverageData?.canonicalState ?? {}
  for (const [key, expected] of Object.entries(EXPECTED_CANONICAL_STATE)) {
    if (canonicalState[key] !== expected) {
      localFailures.push({
        code: 'canonical-state-mismatch',
        message: 'Coverage canonicalState does not match the expected current lifecycle state.',
        field: `canonicalState.${key}`,
        expected,
        actual: canonicalState[key],
      })
    }
  }

  const p2State = extractSectionBody(wiki, 'P2 And P3 State')
  const handoff = extractSectionBody(wiki, 'Handoff')
  for (const [label, phrase, body] of [
    [
      'p2-complete',
      'The project-ui semantic-quality correction is complete and tracked on main.',
      p2State,
    ],
    ['skill-lock', 'project-ui remains undiscovered by the current Skill lock', p2State],
    ['not-adapter-activated', 'not adapter-activated', p2State],
    ['machine-ui-policy', 'Machine UI Policy does not exist.', p2State],
    ['page-contract-schema', 'Page Contract Schema does not exist.', p2State],
    ['p3-not-started', 'P3 has not started', p2State],
    ['p4-not-started', 'P4 has not started.', p2State],
    ['p5-not-started', 'P5 has not started.', p2State],
    ['semantic-commit', EXPECTED_SEMANTIC_CORRECTION_COMMIT, handoff],
    [
      'p2-source-complete',
      'P2 project-ui source construction and semantic correction are complete.',
      handoff,
    ],
  ]) {
    if (!body.includes(phrase)) {
      localFailures.push({
        code: 'wiki-canonical-state-mismatch',
        message: 'Wiki canonical state does not match coverage canonicalState.',
        label,
        expected: phrase,
      })
    }
  }

  return localFailures
}

function scanPermanentProjectUiArtifacts() {
  const findings = []
  if (coverage) scanJsonStrings(coverage, [], COVERAGE_ARTIFACT, findings)

  for (const file of PERMANENT_PROJECT_UI_ARTIFACTS) {
    if (file === COVERAGE_ARTIFACT) continue
    if (!exists(file)) continue
    scanTextLines(file, read(file), findings)
  }

  return findings
}

function runSelfTest() {
  const negativeTexts = [
    'P2 remains under correction.',
    'P2 correction pending.',
    'P2 correction is pending.',
    'The correction change set is unstaged.',
    'The correction change set remains unstaged.',
    'The correction change set is uncommitted.',
    'The correction change set remains uncommitted.',
    'The state has a pending commit.',
    'The state has a pending push.',
    'The change is awaiting remote verification.',
    'The change has pending remote verification.',
    'P2C.3 may be re-executed after validation.',
    'The controller is ready before push.',
    'The controller is ready for controller remote recheck before push.',
    'The remote push is not verified.',
    'The remote push is not yet verified.',
    'Current state: P2 remains under correction.',
    'Current state: P2 correction pending.',
    'Current state: correction change set unstaged.',
    'Current state: correction change set uncommitted.',
    'Current state: pending commit.',
    'Current state: pending push.',
    'Current state: awaiting remote verification.',
    'Current state: pending remote verification.',
    'Current state: P2C.3 may be re-executed.',
    'Current state: ready for controller remote recheck before push.',
    'Current state: remote push not verified.',
    'Handoff: P2 remains under correction.',
    'Handoff: the correction change set is unstaged.',
    'Handoff: the correction change set is uncommitted.',
    'Handoff: pending commit and pending push remain.',
    'Handoff: awaiting remote verification.',
    'Handoff: remote push not yet verified.',
    'P2 remains under correction until validation and commit complete.',
    'The correction change set is unstaged and pending push.',
    'P2C.3 may be re-executed before remote acceptance.',
  ]

  const negativeResults = negativeTexts.map((text, index) => {
    const findings = scanMarkdownLifecycleAssertions(
      'self-test.md',
      `## P2 And P3 State\n\n${text}\n`
    )
    return {
      id: index + 1,
      text,
      passed:
        findings.length > 0 &&
        findings.every(finding => finding.classification === 'stale-current-lifecycle-state'),
      findings,
    }
  })

  const positiveResults = [
    {
      id: 1,
      text: 'Historical note: before commit b3b6d59..., the correction was unstaged.',
      findings: scanMarkdownLifecycleAssertions(
        'self-test.md',
        '## Historical Notes\n\nHistorical note: before commit b3b6d59..., the correction was unstaged.\n'
      ),
    },
    {
      id: 2,
      text: 'Historical note: before commit b3b6d59..., the correction was unstaged.',
      findings: scanJsonLifecycleAssertions({
        history: {
          historicalNote: 'Historical note: before commit b3b6d59..., the correction was unstaged.',
        },
      }),
    },
  ].map(result => ({ ...result, passed: result.findings.length === 0 }))

  const handoffFixture = JSON.parse(read(COVERAGE_ARTIFACT))
  const handoffPositiveFailures = validateP3Handoff(handoffFixture)
  const handoffNegativeCases = [
    {
      id: 'unknown-candidate-id',
      expectedCode: 'p3-handoff-unknown-candidate',
      mutate: fixture => {
        fixture.p3Handoff.semanticCandidates.currentRequirementIds[0] = 'P2C-REQ-9999'
      },
    },
    {
      id: 'duplicate-candidate-id',
      expectedCode: 'p3-handoff-duplicate-candidate',
      mutate: fixture => {
        fixture.p3Handoff.semanticCandidates.currentRequirementIds.push(
          fixture.p3Handoff.semanticCandidates.currentRequirementIds[0]
        )
      },
    },
    {
      id: 'missing-cluster-membership',
      expectedCode: 'p3-handoff-missing-cluster-membership',
      mutate: fixture => {
        fixture.p3Handoff.semanticObligationClusters[0].currentRequirementIds.shift()
      },
    },
    {
      id: 'duplicate-primary-cluster-ownership',
      expectedCode: 'p3-handoff-duplicate-primary-ownership',
      mutate: fixture => {
        fixture.p3Handoff.semanticObligationClusters[1].currentRequirementIds.push(
          fixture.p3Handoff.semanticObligationClusters[0].currentRequirementIds[0]
        )
      },
    },
    {
      id: 'normalized-text-hash-mismatch',
      expectedCode: 'p3-handoff-text-hash-mismatch',
      mutate: fixture => {
        fixture.p3Handoff.semanticObligationClusters[0].normalizedRequirementTexts[0].normalizedTextHash =
          '0'.repeat(64)
      },
    },
    {
      id: 'missing-semantic-source',
      expectedCode: 'p3-handoff-missing-semantic-source',
      mutate: fixture => {
        fixture.p3Handoff.semanticObligationClusters[0].semanticSourceIds = []
        fixture.p3Handoff.semanticObligationClusters[0].sourceLocations = []
      },
    },
    {
      id: 'unknown-cluster-capability',
      expectedCode: 'p3-handoff-unknown-cluster-capability',
      mutate: fixture => {
        fixture.p3Handoff.semanticObligationClusters[0].machineClassifiability =
          'unknown-capability'
      },
    },
    {
      id: 'historical-marker-without-disposition',
      expectedCode: 'p3-handoff-historical-disposition',
      mutate: fixture => {
        delete fixture.p3Handoff.historicalMarkerDispositions[0].currentClassification
      },
    },
    {
      id: 'missing-plan-owned-contract',
      expectedCode: 'p3-handoff-plan-contract-inventory',
      mutate: fixture => {
        fixture.p3Handoff.planOwnedContracts.pop()
      },
    },
    {
      id: 'plan-owned-contract-counted-as-semantic-candidate',
      expectedCode: 'p3-handoff-plan-contract-as-candidate',
      mutate: fixture => {
        fixture.p3Handoff.semanticCandidates.currentRequirementIds.push(
          fixture.p3Handoff.planOwnedContracts[0].id
        )
      },
    },
    {
      id: 'changed-p2-count',
      expectedCode: 'p3-handoff-p2-count-drift',
      mutate: fixture => {
        fixture.activeRequirementCount -= 1
      },
    },
    {
      id: 'changed-coverage-decision',
      expectedCode: 'p3-handoff-coverage-decision-drift',
      mutate: fixture => {
        fixture.requirements[0].coverageDecision = 'implementation-evidence'
      },
    },
    {
      id: 'false-p3-started-state',
      expectedCode: 'p3-handoff-p3-started',
      mutate: fixture => {
        fixture.canonicalState.p3Started = true
      },
    },
    {
      id: 'false-machine-ui-policy-presence',
      expectedCode: 'p3-handoff-machine-policy-presence',
      mutate: fixture => {
        fixture.canonicalState.machineUiPolicyPresent = true
      },
    },
    {
      id: 'false-page-contract-presence',
      expectedCode: 'p3-handoff-page-contract-presence',
      mutate: fixture => {
        fixture.canonicalState.pageContractSchemaPresent = true
      },
    },
    {
      id: 'premature-permanent-policy-rule-id',
      expectedCode: 'p3-handoff-premature-policy-rule-id',
      mutate: fixture => {
        fixture.p3Handoff.semanticCandidates.futurePolicyRuleIds = [['CCD', 'UI', '001'].join('-')]
      },
    },
  ]
  const handoffNegativeResults = handoffNegativeCases.map(testCase => {
    const fixture = structuredClone(handoffFixture)
    testCase.mutate(fixture)
    const findings = validateP3Handoff(fixture)
    return {
      id: testCase.id,
      expectedCode: testCase.expectedCode,
      passed: findings.some(finding => finding.code === testCase.expectedCode),
      findings,
    }
  })

  const report = {
    status:
      negativeResults.every(result => result.passed) &&
      positiveResults.every(result => result.passed) &&
      handoffPositiveFailures.length === 0 &&
      handoffNegativeResults.every(result => result.passed)
        ? 'pass'
        : 'fail',
    negative: {
      count: negativeResults.length,
      falsePasses: negativeResults.filter(result => result.findings.length === 0).length,
      wrongReasonFailures: negativeResults.filter(
        result =>
          result.findings.length > 0 &&
          result.findings.some(
            finding => finding.classification !== 'stale-current-lifecycle-state'
          )
      ).length,
      results: negativeResults,
    },
    positive: {
      count: positiveResults.length,
      falsePositiveFailures: positiveResults.filter(result => result.findings.length > 0).length,
      results: positiveResults,
    },
    handoff: {
      positiveFailureCount: handoffPositiveFailures.length,
      positiveFailures: handoffPositiveFailures,
      negativeCount: handoffNegativeResults.length,
      falsePasses: handoffNegativeResults.filter(result => !result.passed).length,
      results: handoffNegativeResults,
    },
  }

  if (jsonOutput) {
    const outputPath = path.resolve(jsonOutput)
    fs.mkdirSync(path.dirname(outputPath), { recursive: true })
    fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`)
  }

  if (report.status !== 'pass') {
    console.log('project-ui semantic quality self-test: FAIL')
    console.error(JSON.stringify(report, null, 2))
    process.exit(1)
  }

  console.log('project-ui semantic quality self-test: PASS')
  console.log(
    JSON.stringify(
      {
        negativeTestCount: report.negative.count,
        positiveTestCount: report.positive.count,
        falsePasses: report.negative.falsePasses,
        wrongReasonFailures: report.negative.wrongReasonFailures,
        falsePositiveFailures: report.positive.falsePositiveFailures,
        handoffNegativeTestCount: report.handoff.negativeCount,
        handoffFalsePasses: report.handoff.falsePasses,
        handoffPositiveFailureCount: report.handoff.positiveFailureCount,
      },
      null,
      2
    )
  )
  process.exit(0)
}

if (selfTest) runSelfTest()

let coverage = null
try {
  const coveragePath = coverageOverride
    ? path.resolve(coverageOverride)
    : path.join(root, COVERAGE_ARTIFACT)
  coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'))
} catch (error) {
  addBaselineFailure('coverage-json-parse', 'Coverage JSON parse failed.', { error: error.message })
}

const requiredHeadings = {}
if (coverage?.targetFiles) {
  for (const target of coverage.targetFiles) {
    requiredHeadings[target.file] = target.requiredHeadings ?? []
  }
}

for (const relativePath of REQUIRED_MARKDOWN) {
  if (!exists(relativePath)) {
    addBaselineFailure('missing-markdown', 'Required Markdown file is missing.', {
      file: relativePath,
    })
    continue
  }

  const text = read(relativePath)
  if (relativePath.endsWith('/SKILL.md')) {
    if (!/^---\nname: project-ui\n[\s\S]*?\n---\n/.test(text)) {
      addFailure('skill-frontmatter', 'SKILL.md must keep project-ui frontmatter.', {
        file: relativePath,
      })
    }
  } else if (/^---\n[\s\S]*?\n---\n/.test(text)) {
    addFailure('reference-frontmatter', 'Internal references must not be Skills.', {
      file: relativePath,
    })
  }

  for (const phrase of PLACEHOLDERS) {
    if (text.includes(phrase))
      addFailure('placeholder', 'Placeholder phrase found.', { file: relativePath, phrase })
  }
  for (const pattern of BROKEN_PATTERNS) {
    if (pattern.test(text))
      addFailure('broken-modal', 'Malformed modal construction found.', {
        file: relativePath,
        pattern: String(pattern),
      })
  }
  const obsoletePattern = hasObsoleteActivePath(text)
  if (obsoletePattern)
    addFailure('obsolete-active-path', 'Obsolete single-root path found.', {
      file: relativePath,
      pattern: String(obsoletePattern),
    })

  const sectionMap = new Map(sections(text).map(section => [section.heading, section]))
  for (const heading of requiredHeadings[relativePath] ?? []) {
    const section = sectionMap.get(heading)
    if (!section) {
      addFailure('missing-heading', 'Required heading missing.', { file: relativePath, heading })
      continue
    }
    if (!isSubstantive(section.body))
      addFailure('weak-section', 'Required section lacks substantive content.', {
        file: relativePath,
        heading,
      })
  }
}

const referencesDir = path.join(root, '.ai/skills/project-ui/references')
const references = fs.existsSync(referencesDir)
  ? fs.readdirSync(referencesDir).filter(name => name.endsWith('.md'))
  : []
if (references.length !== 10)
  addFailure('reference-count', 'Expected exactly ten reference Markdown files.', {
    count: references.length,
  })
if (!exists('.ai/skills/project-ui/scripts/validate-semantic-quality.mjs'))
  addBaselineFailure('support-script-missing', 'Semantic-quality support script is missing.')

if (coverage) {
  const permanentPathFindings = scanPermanentProjectUiArtifacts()
  const concreteEphemeralPathCount = permanentPathFindings.length
  if (concreteEphemeralPathCount > 0) {
    for (const finding of permanentPathFindings) {
      addFailure(
        'concrete-ephemeral-path',
        'concrete ephemeral path in permanent canonical artifact',
        finding
      )
    }
  }

  if (coverage.schemaVersion !== 'project-ui-semantic-coverage/v2') {
    addBaselineFailure('schema-version', 'Unexpected coverage schema version.', {
      schemaVersion: coverage.schemaVersion,
    })
  }

  for (const failure of validateP3Handoff(coverage)) {
    addFailure(failure.code, failure.message, failure)
  }

  const requirements = coverage.requirements ?? []
  const retiredRequirements = coverage.retiredRequirements ?? []
  const duplicateOccurrences = coverage.duplicateOccurrences ?? []
  const rejectedCandidates = coverage.rejectedCandidateOccurrences ?? []
  const excludedFragments = coverage.excludedFragments ?? []
  const sourceAssets = coverage.sourceAssets ?? []
  const foundationReuse = coverage.foundationReuse ?? []
  const requirementIds = new Set(requirements.map(item => item.requirementId))
  const retiredIds = new Set(retiredRequirements.map(item => item.requirementId))
  const decisionCounts = {}

  if (requirementIds.size !== requirements.length)
    addFailure('duplicate-requirement-id', 'Requirement IDs must be unique.', {
      count: requirements.length,
      unique: requirementIds.size,
    })

  for (const requirement of requirements) {
    decisionCounts[requirement.coverageDecision] =
      (decisionCounts[requirement.coverageDecision] ?? 0) + 1
    if (!requirement.normalizedRequirement || !/[A-Za-z]/.test(requirement.normalizedRequirement)) {
      addFailure('empty-requirement', 'Requirement lacks normalized text.', {
        requirementId: requirement.requirementId,
      })
    }
    if (classifyStandaloneMarker(requirement)) {
      addFailure(
        'active-standalone-marker',
        'Active requirement is a standalone non-propositional marker.',
        {
          requirementId: requirement.requirementId,
          text: requirement.normalizedRequirement,
        }
      )
    }
    if (!requirement.primaryTargetFile || !requirement.primaryTargetHeading)
      addFailure('unmapped-requirement', 'Requirement lacks target mapping.', {
        requirementId: requirement.requirementId,
      })
    const obsoletePattern = hasObsoleteActivePath(requirement.normalizedRequirement)
    if (obsoletePattern)
      addFailure('obsolete-requirement-path', 'Obsolete path found in normalized requirement.', {
        requirementId: requirement.requirementId,
        pattern: String(obsoletePattern),
      })
    if (!Array.isArray(requirement.sourceOccurrences) || requirement.sourceOccurrences.length === 0)
      addFailure('missing-source-occurrence', 'Requirement lacks source occurrences.', {
        requirementId: requirement.requirementId,
      })
  }

  if (sourceAssets.length !== 22)
    addFailure('source-count', 'Expected exactly 22 source assets.', { count: sourceAssets.length })
  if (
    new Set(sourceAssets.map(sourceAsset => sourceAsset.sourceAsset)).size !== sourceAssets.length
  )
    addFailure('duplicate-source-asset', 'Source assets must be unique.')

  const sourceAssetSet = new Set(sourceAssets.map(sourceAsset => sourceAsset.sourceAsset))
  const rejectedAssignment = new Map()
  for (const rejected of rejectedCandidates) {
    if (!rejected.sourceAsset || !sourceAssetSet.has(rejected.sourceAsset)) {
      addFailure(
        'unassigned-rejected-candidate',
        'Rejected candidate is not assigned to one known source asset.',
        { candidateId: rejected.candidateId, sourceAsset: rejected.sourceAsset }
      )
    }
    rejectedAssignment.set(
      rejected.candidateId,
      (rejectedAssignment.get(rejected.candidateId) ?? 0) + 1
    )
  }
  for (const [candidateId, count] of rejectedAssignment) {
    if (count !== 1)
      addFailure('duplicate-rejected-assignment', 'Rejected candidate assignment must be unique.', {
        candidateId,
        count,
      })
  }

  for (const retired of retiredRequirements) {
    if (requirementIds.has(retired.requirementId))
      addFailure('retired-still-active', 'Retired marker is still active.', {
        requirementId: retired.requirementId,
      })
    if (retired.replacementRequirementId !== null)
      addFailure('retired-replacement', 'Retired marker must not have a replacement requirement.', {
        requirementId: retired.requirementId,
      })
    if (retired.retiredByCorrectionClass !== 'standalone-non-propositional-marker')
      addFailure('retired-class', 'Retired marker has wrong correction class.', {
        requirementId: retired.requirementId,
      })
    const assigned = rejectedCandidates.filter(
      candidate =>
        candidate.relatedRetiredRequirementId === retired.requirementId ||
        candidate.retiredRequirementId === retired.requirementId
    )
    if (assigned.length !== 1)
      addFailure(
        'retired-rejected-assignment',
        'Retired marker must have exactly one rejected candidate assignment.',
        { requirementId: retired.requirementId, assigned: assigned.length }
      )
    if (assigned[0]?.classification !== 'standalone-non-propositional-marker')
      addFailure(
        'retired-rejected-class',
        'Retired marker rejected candidate has wrong classification.',
        { requirementId: retired.requirementId }
      )
  }

  const accounting = coverage.candidateAccounting ?? {}
  const acceptedNormative = requirements.length + duplicateOccurrences.length
  if (accounting.rawCandidateOccurrenceCount !== acceptedNormative + rejectedCandidates.length)
    addFailure('raw-accounting', 'Candidate equation does not balance.', {
      raw: accounting.rawCandidateOccurrenceCount,
      acceptedNormative,
      rejected: rejectedCandidates.length,
    })
  if (accounting.acceptedNormativeOccurrenceCount !== acceptedNormative)
    addFailure('normative-accounting', 'Accepted normative occurrence count mismatch.', {
      summary: accounting.acceptedNormativeOccurrenceCount,
      actual: acceptedNormative,
    })
  if (accounting.uniqueRequirementCount !== requirements.length)
    addFailure('unique-accounting', 'Unique requirement count mismatch.', {
      summary: accounting.uniqueRequirementCount,
      actual: requirements.length,
    })
  if (accounting.duplicateOccurrenceCount !== duplicateOccurrences.length)
    addFailure('duplicate-accounting', 'Duplicate occurrence count mismatch.', {
      summary: accounting.duplicateOccurrenceCount,
      actual: duplicateOccurrences.length,
    })
  if (accounting.excludedFragmentCount !== excludedFragments.length)
    addFailure('excluded-accounting', 'Excluded fragment count mismatch.', {
      summary: accounting.excludedFragmentCount,
      actual: excludedFragments.length,
    })

  let sourceCandidateTotal = 0
  let sourceAcceptedTotal = 0
  let sourceDuplicateTotal = 0
  let sourceRejectedTotal = 0
  let sourceExcludedTotal = 0
  let sourceAuditedTotal = 0
  for (const source of sourceAssets) {
    for (const key of [
      'totalAuditedFragmentCount',
      'candidateFragmentCount',
      'acceptedRepresentativeOccurrenceCount',
      'duplicateNormativeOccurrenceCount',
      'rejectedCandidateOccurrenceCount',
      'excludedNonCandidateFragmentCount',
      'acceptedRequirementIds',
      'duplicateOccurrenceIds',
      'rejectedCandidateIds',
      'excludedFragmentIds',
    ]) {
      if (!(key in source))
        addFailure('source-required-key', 'Source asset lacks required accounting key.', {
          sourceAsset: source.sourceAsset,
          key,
        })
    }
    if (
      source.candidateFragmentCount !==
      source.acceptedRepresentativeOccurrenceCount +
        source.duplicateNormativeOccurrenceCount +
        source.rejectedCandidateOccurrenceCount
    )
      addFailure('source-candidate-balance', 'Source candidate equation does not balance.', {
        sourceAsset: source.sourceAsset,
      })
    if (
      source.totalAuditedFragmentCount !==
      source.candidateFragmentCount + source.excludedNonCandidateFragmentCount
    )
      addFailure('source-audited-balance', 'Source audited equation does not balance.', {
        sourceAsset: source.sourceAsset,
      })
    sourceCandidateTotal += source.candidateFragmentCount ?? 0
    sourceAcceptedTotal += source.acceptedRepresentativeOccurrenceCount ?? 0
    sourceDuplicateTotal += source.duplicateNormativeOccurrenceCount ?? 0
    sourceRejectedTotal += source.rejectedCandidateOccurrenceCount ?? 0
    sourceExcludedTotal += source.excludedNonCandidateFragmentCount ?? 0
    sourceAuditedTotal += source.totalAuditedFragmentCount ?? 0
  }
  if (sourceCandidateTotal !== accounting.rawCandidateOccurrenceCount)
    addFailure('source-candidate-total', 'Source candidate total mismatch.', {
      sourceCandidateTotal,
      summary: accounting.rawCandidateOccurrenceCount,
    })
  if (sourceAcceptedTotal !== requirements.length)
    addFailure('source-accepted-total', 'Source accepted representative total mismatch.', {
      sourceAcceptedTotal,
      requirements: requirements.length,
    })
  if (sourceDuplicateTotal !== duplicateOccurrences.length)
    addFailure('source-duplicate-total', 'Source duplicate total mismatch.', {
      sourceDuplicateTotal,
      duplicates: duplicateOccurrences.length,
    })
  if (sourceRejectedTotal !== rejectedCandidates.length)
    addFailure('source-rejected-total', 'Source rejected total mismatch.', {
      sourceRejectedTotal,
      rejected: rejectedCandidates.length,
    })
  if (sourceExcludedTotal !== excludedFragments.length)
    addFailure('source-excluded-total', 'Source excluded total mismatch.', {
      sourceExcludedTotal,
      excluded: excludedFragments.length,
    })
  if (sourceAuditedTotal !== accounting.totalAuditedFragmentCount)
    addFailure('source-audited-total', 'Source audited total mismatch.', {
      sourceAuditedTotal,
      summary: accounting.totalAuditedFragmentCount,
    })

  const foundationPaths = foundationReuse.map(item => item.path)
  for (const requiredPath of REQUIRED_FOUNDATIONS) {
    if (!foundationPaths.includes(requiredPath))
      addFailure('foundation-missing', 'Exact required foundation path is missing.', {
        path: requiredPath,
      })
  }
  if (new Set(foundationPaths).size !== foundationPaths.length)
    addFailure('foundation-duplicate', 'Foundation paths must be unique.')
  for (const foundation of foundationReuse) {
    for (const key of [
      'path',
      'exists',
      'tracked',
      'currentRole',
      'projectUiOwnerFile',
      'projectUiOwnerHeading',
      'relatedRequirementIds',
      'reuseObligation',
      'prohibitedDuplication',
      'evidenceType',
      'reconciliationState',
    ]) {
      if (!(key in foundation))
        addFailure('foundation-key', 'Foundation record lacks required metadata.', {
          path: foundation.path,
          key,
        })
    }
    if (!ALLOWED_EVIDENCE_TYPES.has(foundation.evidenceType))
      addFailure('foundation-evidence-type', 'Foundation evidence type is not allowed.', {
        path: foundation.path,
        evidenceType: foundation.evidenceType,
      })
    if (!ALLOWED_RECONCILIATION_STATES.has(foundation.reconciliationState))
      addFailure('foundation-state', 'Foundation reconciliation state is not allowed.', {
        path: foundation.path,
        reconciliationState: foundation.reconciliationState,
      })
  }

  const summary = coverage.coverageSummary ?? {}
  const quality = summary.quality ?? summary
  for (const [field, value] of [
    ['coverageSummary.concreteEphemeralPathCount', summary.concreteEphemeralPathCount],
    ['coverageSummary.quality.concreteEphemeralPathCount', quality.concreteEphemeralPathCount],
    [
      'qualityGate.summary.concreteEphemeralPathCount',
      coverage.qualityGate?.summary?.concreteEphemeralPathCount,
    ],
  ]) {
    if (value !== concreteEphemeralPathCount)
      addFailure('concrete-ephemeral-summary', 'Concrete ephemeral path summary mismatch.', {
        field,
        summary: value,
        actual: concreteEphemeralPathCount,
      })
  }

  if (summary.uniqueRequirementCount !== requirements.length)
    addFailure('summary-requirement-count', 'Coverage summary requirement count mismatch.', {
      summary: summary.uniqueRequirementCount,
      actual: requirements.length,
    })
  if (summary.acceptedNormativeOccurrenceCount !== acceptedNormative)
    addFailure('summary-accepted-count', 'Coverage summary accepted normative count mismatch.', {
      summary: summary.acceptedNormativeOccurrenceCount,
      actual: acceptedNormative,
    })
  if (summary.rejectedCandidateOccurrenceCount !== rejectedCandidates.length)
    addFailure('summary-rejected-count', 'Coverage summary rejected count mismatch.', {
      summary: summary.rejectedCandidateOccurrenceCount,
      actual: rejectedCandidates.length,
    })
  if (summary.duplicateOccurrenceCount !== duplicateOccurrences.length)
    addFailure('summary-duplicate-count', 'Coverage summary duplicate count mismatch.', {
      summary: summary.duplicateOccurrenceCount,
      actual: duplicateOccurrences.length,
    })
  if (summary.excludedFragmentCount !== excludedFragments.length)
    addFailure('summary-excluded-count', 'Coverage summary excluded count mismatch.', {
      summary: summary.excludedFragmentCount,
      actual: excludedFragments.length,
    })
  if (summary.sourceAssetCount !== sourceAssets.length)
    addFailure('summary-source-count', 'Coverage summary source count mismatch.', {
      summary: summary.sourceAssetCount,
      actual: sourceAssets.length,
    })
  if (summary.foundationPathCount !== foundationReuse.length)
    addFailure('summary-foundation-count', 'Coverage summary foundation count mismatch.', {
      summary: summary.foundationPathCount,
      actual: foundationReuse.length,
    })
  const decisionTotal = Object.values(summary.coverageDecisionCounts ?? {}).reduce(
    (sum, value) => sum + value,
    0
  )
  if (decisionTotal !== requirements.length)
    addFailure('decision-total', 'Coverage decisions must sum to active requirements.', {
      decisionTotal,
      requirements: requirements.length,
    })
  for (const [decision, count] of Object.entries(decisionCounts)) {
    if ((summary.coverageDecisionCounts ?? {})[decision] !== count)
      addFailure('decision-summary', 'Coverage decision count mismatch.', {
        decision,
        summary: (summary.coverageDecisionCounts ?? {})[decision],
        actual: count,
      })
  }

  for (const key of [
    'ambiguousMarkerCount',
    'differentDefectClassCount',
    'invalidNormalizedRequirementCount',
    'unassignedRejectedCandidateCount',
    'sourceAccountingMismatchCount',
    'silentlyOmittedFoundationCount',
    'placeholderPhraseCount',
    'malformedModalCount',
    'activeObsoletePathCount',
    'unmappedRequirementCount',
    'silentDropCount',
    'contradictoryCoveredRuleCount',
    'staleCanonicalStatementCount',
    'concreteEphemeralPathCount',
  ]) {
    const value = quality[key] ?? summary[key]
    if (value !== 0)
      addFailure('quality-summary', 'Quality terminal count is nonzero.', { key, value })
  }

  const lifecycleFindings = scanCurrentLifecycleState(coverage)
  const staleCanonicalStatementCount = lifecycleFindings.length
  for (const finding of lifecycleFindings) {
    addFailure(
      'stale-current-lifecycle-state',
      'Stale current lifecycle state found in permanent project-ui artifact.',
      finding
    )
  }
  for (const [field, value] of [
    ['staleCanonicalStatementCount', coverage.staleCanonicalStatementCount],
    ['coverageSummary.staleCanonicalStatementCount', summary.staleCanonicalStatementCount],
    ['coverageSummary.quality.staleCanonicalStatementCount', quality.staleCanonicalStatementCount],
    [
      'qualityGate.summary.staleCanonicalStatementCount',
      coverage.qualityGate?.summary?.staleCanonicalStatementCount,
    ],
  ]) {
    if (value !== staleCanonicalStatementCount) {
      addFailure('stale-canonical-summary', 'Stale canonical statement summary mismatch.', {
        field,
        summary: value,
        actual: staleCanonicalStatementCount,
      })
    }
  }

  if (exists(WIKI_ARTIFACT)) {
    const wiki = read(WIKI_ARTIFACT)
    for (const failure of assertExpectedCanonicalState(coverage, wiki)) {
      addFailure(failure.code, failure.message, failure)
    }
  }

  for (const requirement of requirements) {
    for (const occurrence of requirement.sourceOccurrences ?? []) {
      if (!sourceAssetSet.has(occurrence.sourceAsset))
        addFailure('unknown-source-occurrence', 'Requirement references unknown source asset.', {
          requirementId: requirement.requirementId,
          sourceAsset: occurrence.sourceAsset,
        })
      const sourcePath = path.join(root, occurrence.sourceAsset)
      if (fs.existsSync(sourcePath)) {
        const sourceLines = fs.readFileSync(sourcePath, 'utf8').split(/\r?\n/)
        const slice = sourceLines.slice(occurrence.startLine - 1, occurrence.endLine).join('\n')
        const hashInput = occurrence.text ?? slice
        if (occurrence.sourceSliceSha256 && sha256(hashInput) !== occurrence.sourceSliceSha256)
          addFailure('source-slice-hash', 'Source slice hash mismatch.', {
            requirementId: requirement.requirementId,
            sourceAsset: occurrence.sourceAsset,
            startLine: occurrence.startLine,
            endLine: occurrence.endLine,
          })
      }
    }
  }

  for (const retiredId of retiredIds) {
    if (
      !rejectedCandidates.some(
        candidate =>
          candidate.relatedRetiredRequirementId === retiredId ||
          candidate.retiredRequirementId === retiredId
      )
    ) {
      addFailure(
        'retired-missing-rejected-candidate',
        'Retired marker is missing from rejected-candidate accounting.',
        { requirementId: retiredId }
      )
    }
  }
}

if (exists('wiki/canonical/design/project-ui-skill.md')) {
  const wiki = read('wiki/canonical/design/project-ui-skill.md')
  const obsoletePattern = hasObsoleteActivePath(wiki)
  if (obsoletePattern)
    addFailure('obsolete-wiki-path', 'Obsolete path found in wiki.', {
      pattern: String(obsoletePattern),
    })
  if (wiki.includes('/tmp')) addFailure('wiki-temp-path', 'Wiki must not mention /tmp paths.')
  if (/future correction commit SHA\s*(?:=|:)\s*[a-f0-9]{40}/i.test(wiki)) {
    addFailure('wiki-future-sha', 'Wiki must not invent a future correction commit SHA.')
  }
}

const report = {
  status: baselineFailures.length === 0 && failures.length === 0 ? 'pass' : 'fail',
  root,
  summary: {
    markdownFileCount: REQUIRED_MARKDOWN.length,
    internalReferenceCount: references.length,
    requirementCount: coverage?.requirements?.length ?? 0,
    retiredRequirementCount: coverage?.retiredRequirements?.length ?? 0,
    sourceAssetCount: coverage?.sourceAssets?.length ?? 0,
    duplicateOccurrenceCount: coverage?.duplicateOccurrences?.length ?? 0,
    rejectedCandidateOccurrenceCount: coverage?.rejectedCandidateOccurrences?.length ?? 0,
    excludedFragmentCount: coverage?.excludedFragments?.length ?? 0,
    foundationPathCount: coverage?.foundationReuse?.length ?? 0,
    staleCanonicalStatementCount: coverage ? scanCurrentLifecycleState(coverage).length : 0,
    concreteEphemeralPathCount:
      coverage?.coverageSummary?.quality?.concreteEphemeralPathCount ??
      coverage?.coverageSummary?.concreteEphemeralPathCount ??
      0,
    failureCount: failures.length,
    baselineFailureCount: baselineFailures.length,
    warningCount: warnings.length,
  },
  baselineFailures,
  failures,
  warnings,
}

if (jsonOutput) {
  const outputPath = path.resolve(jsonOutput)
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`)
}

if (baselineFailures.length > 0) {
  console.log('project-ui semantic quality: BASELINE FAILURE')
  console.error(JSON.stringify(baselineFailures.slice(0, 25), null, 2))
  process.exit(2)
}

if (failures.length > 0) {
  console.log('project-ui semantic quality: FAIL')
  console.error(JSON.stringify(failures.slice(0, 25), null, 2))
  process.exit(1)
}

console.log('project-ui semantic quality: PASS')
console.log(JSON.stringify(report.summary, null, 2))
