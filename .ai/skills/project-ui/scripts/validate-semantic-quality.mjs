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

  const coverageText = JSON.stringify(coverage)
  for (const phrase of STALE_PATTERNS) {
    if (coverageText.includes(phrase))
      addFailure('stale-canonical', 'Stale canonical phrase found in coverage.', { phrase })
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
  for (const phrase of STALE_PATTERNS) {
    if (wiki.includes(phrase))
      addFailure('stale-wiki', 'Stale canonical phrase found in wiki.', { phrase })
  }
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
