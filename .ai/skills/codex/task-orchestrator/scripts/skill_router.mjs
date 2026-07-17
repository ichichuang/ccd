#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { execFileSync } from 'node:child_process'
import { fileURLToPath, pathToFileURL } from 'node:url'

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
export const REPO_ROOT = path.resolve(SCRIPT_DIR, '../../../../..')
export const MANIFEST_PATH = path.join(REPO_ROOT, '.ai/manifests/skill-routing.json')
export const SCOPES_PATH = path.join(REPO_ROOT, '.ai/manifests/routing-scopes.json')
export const FIXTURE_PATH = path.join(
  REPO_ROOT,
  '.ai/governance/routing/fixtures/routing-cases.json'
)
export const LOCK_PATH = path.join(REPO_ROOT, '.ai/manifests/skills-lock.json')

const ROUTE_FIELDS = [
  'id',
  'description',
  'keywords',
  'scopeIds',
  'priority',
  'compositionMode',
  'exclusiveGroup',
  'primarySkills',
  'supplementalSkills',
  'prechecks',
  'tokenStrategy',
  'matchPolicy',
  'positiveFixtureIds',
  'negativeFixtureIds',
]
const RESULT_FIELDS = [
  'resultVersion',
  'manifestVersion',
  'routerVersion',
  'status',
  'input',
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
const compareStrings = (left, right) => {
  const leftScalars = [...left].map(character => character.codePointAt(0))
  const rightScalars = [...right].map(character => character.codePointAt(0))
  for (let index = 0; index < Math.min(leftScalars.length, rightScalars.length); index += 1) {
    if (leftScalars[index] !== rightScalars[index]) return leftScalars[index] - rightScalars[index]
  }
  return leftScalars.length - rightScalars.length
}
const unique = values => [...new Set(values)]
const SCOPE_CLASSIFICATIONS = new Set([
  'universal',
  'ui-source',
  'style-source',
  'typescript-source',
  'ui-subsystem',
  'routing-subsystem',
  'composable-subsystem',
  'state-subsystem',
  'non-ui-subsystem',
  'adapter-subsystem',
  'type-subsystem',
  'utility-subsystem',
  'bootstrap-subsystem',
  'build-configuration',
  'runtime-entrypoint',
  'runtime-specific',
  'governance-integration',
  'shared-ui-source',
  'shared-typescript-source',
  'shared-ui-package',
  'design-system-package',
  'shared-vue-package',
  'repository-tooling',
  'remote-governance',
  'test-surface',
  'ai-governance',
  'rule-lineage',
  'workspace-configuration',
  'design-system-configuration',
  'future-reserved',
])

export class RoutingContractError extends Error {
  constructor(code, message, details = {}) {
    super(message)
    this.name = 'RoutingContractError'
    this.code = code
    this.details = details
  }
}
const fail = (code, message, details = {}) => {
  throw new RoutingContractError(code, message, details)
}
const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'))
export const canonicalJson = value => `${JSON.stringify(value, null, 2)}\n`

const exactKeys = (value, expected, missingCode, extraCode, label) => {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    fail(missingCode, `${label} must be an object`)
  const actual = Object.keys(value)
  const missing = expected.filter(key => !actual.includes(key))
  const extra = actual.filter(key => !expected.includes(key))
  if (missing.length > 0) fail(missingCode, `${label} is missing required fields`, { missing })
  if (extra.length > 0) {
    if (extra.some(key => /branch/iu.test(key)))
      fail('BRANCH_METADATA_FORBIDDEN', `${label} contains branch metadata`, { extra })
    fail(extraCode, `${label} contains unsupported fields`, { extra })
  }
}
const assertUniqueStrings = (values, code, label, { allowEmpty = true } = {}) => {
  if (
    !Array.isArray(values) ||
    (!allowEmpty && values.length === 0) ||
    values.some(value => typeof value !== 'string' || value.length === 0)
  ) {
    fail(code, `${label} must be ${allowEmpty ? 'an' : 'a non-empty'} array of strings`)
  }
  if (new Set(values).size !== values.length) fail(code, `${label} contains duplicates`)
}
const assertSorted = (values, code, label) => {
  const sorted = [...values].sort(compareStrings)
  if (JSON.stringify(values) !== JSON.stringify(sorted))
    fail(code, `${label} must use deterministic ordering`)
}
const isId = value => typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(value)

export function normalizePath(value) {
  const normalized = String(value)
    .trim()
    .replaceAll('\\', '/')
    .replace(/\/+/gu, '/')
    .replace(/^\.\//u, '')
  const segments = normalized.split('/')
  if (
    normalized.length === 0 ||
    normalized.includes('\0') ||
    normalized.startsWith('/') ||
    /^[A-Za-z]:\//u.test(normalized) ||
    segments.includes('.') ||
    segments.includes('..')
  )
    fail('INVALID_INPUT_PATH', `Path must be repository-relative: ${value}`)
  return normalized
}

export function globToRegExp(pattern) {
  if (pattern === '**') return /^.*$/u
  if (
    typeof pattern !== 'string' ||
    pattern.length === 0 ||
    pattern.startsWith('/') ||
    pattern.includes('\\') ||
    pattern.includes('\0') ||
    /[?![\]{}]/u.test(pattern) ||
    pattern.split('/').some(segment => segment === '.' || segment === '..') ||
    pattern.includes('@(')
  )
    fail('INVALID_EFFECTIVE_GLOB', `Unsupported routing glob: ${pattern}`)
  let source = ''
  for (let index = 0; index < pattern.length; index += 1) {
    const character = pattern[index]
    if (character === '*' && pattern[index + 1] === '*') {
      if (pattern[index + 2] === '/') {
        source += '(?:.*/)?'
        index += 2
      } else {
        source += '.*'
        index += 1
      }
    } else if (character === '*') source += '[^/]*'
    else {
      if ('\\^$+?.()|{}'.includes(character)) source += '\\'
      source += character
    }
  }
  return new RegExp(`^${source}$`, 'u')
}
export const matchesGlob = (value, pattern) => globToRegExp(pattern).test(value)

const normalizeText = value =>
  String(value)
    .normalize('NFKC')
    .toLocaleLowerCase('en-US')
    .replaceAll('ß', 'ss')
    .replaceAll('ς', 'σ')
    .trim()
    .replace(/\s+/gu, ' ')
const isWordCharacter = value => value !== undefined && /[\p{L}\p{N}_]/u.test(value)
export function containsKeyword(task, keyword) {
  const haystack = normalizeText(task)
  const needle = normalizeText(keyword)
  if (/[^\x00-\x7F]/u.test(needle)) return haystack.includes(needle)
  let offset = haystack.indexOf(needle)
  while (offset >= 0) {
    const before = offset === 0 ? undefined : [...haystack.slice(0, offset)].at(-1)
    const after = [...haystack.slice(offset + needle.length)][0]
    const needleStart = [...needle][0]
    const needleEnd = [...needle].at(-1)
    if (
      (!isWordCharacter(needleStart) || !isWordCharacter(before)) &&
      (!isWordCharacter(needleEnd) || !isWordCharacter(after))
    )
      return true
    offset = haystack.indexOf(needle, offset + 1)
  }
  return false
}

export function trackedPaths(root = REPO_ROOT) {
  return execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' })
    .split('\0')
    .filter(Boolean)
    .map(normalizePath)
    .sort(compareStrings)
}

export function validateRoutingScopes(registry, { tracked = null, root = REPO_ROOT } = {}) {
  exactKeys(
    registry,
    ['version', 'globSemantics', 'trackedTopologySource', 'scopes', 'ruleAssignments'],
    'SCOPE_SCHEMA_REQUIRED',
    'SCOPE_SCHEMA_ADDITIONAL_PROPERTY',
    'routing scopes'
  )
  if (
    registry.version !== 1 ||
    registry.globSemantics !== 'ccd-routing-glob/v1' ||
    registry.trackedTopologySource !== 'git ls-files -z'
  )
    fail('SCOPE_SCHEMA_ENUM', 'Routing scope version or semantics drifted')
  if (!Array.isArray(registry.scopes) || !Array.isArray(registry.ruleAssignments))
    fail('SCOPE_SCHEMA_REQUIRED', 'Scopes and assignments must be arrays')
  const inventory = tracked ?? trackedPaths(root)
  const ids = new Set()
  let previousId = ''
  for (const scope of registry.scopes) {
    exactKeys(
      scope,
      [
        'id',
        'description',
        'classification',
        'consumers',
        'effectiveGlobs',
        'trackedMatchPolicy',
        'justification',
      ],
      'SCOPE_SCHEMA_REQUIRED',
      'SCOPE_SCHEMA_ADDITIONAL_PROPERTY',
      `scope:${scope?.id ?? 'unknown'}`
    )
    if (!isId(scope.id) || ids.has(scope.id))
      fail('DUPLICATE_SCOPE_ID', `Invalid or duplicate scope ID: ${scope.id}`)
    if (previousId && compareStrings(previousId, scope.id) >= 0)
      fail('NONDETERMINISTIC_SCOPE_ORDER', 'Scopes must be sorted by ID')
    previousId = scope.id
    ids.add(scope.id)
    if (
      typeof scope.description !== 'string' ||
      scope.description.length === 0 ||
      !SCOPE_CLASSIFICATIONS.has(scope.classification)
    )
      fail('SCOPE_SCHEMA_ENUM', `${scope.id} has invalid metadata`)
    assertUniqueStrings(scope.consumers, 'DUPLICATE_SCOPE_CONSUMER', `${scope.id}.consumers`)
    if (scope.consumers.some(consumer => !['rule-index', 'skill-routing'].includes(consumer)))
      fail('SCOPE_SCHEMA_ENUM', `${scope.id} has an invalid consumer`)
    assertSorted(scope.consumers, 'NONDETERMINISTIC_SCOPE_ORDER', `${scope.id}.consumers`)
    assertUniqueStrings(
      scope.effectiveGlobs,
      'DUPLICATE_EFFECTIVE_GLOB',
      `${scope.id}.effectiveGlobs`
    )
    assertSorted(scope.effectiveGlobs, 'NONDETERMINISTIC_SCOPE_ORDER', `${scope.id}.effectiveGlobs`)
    if (scope.classification === 'future-reserved') {
      if (
        scope.effectiveGlobs.length !== 0 ||
        scope.trackedMatchPolicy !== 'reserved-empty' ||
        !scope.justification
      )
        fail('INVALID_RESERVED_SCOPE', `${scope.id} is not a valid future reservation`)
      continue
    }
    if (scope.effectiveGlobs.length === 0)
      fail('DEAD_EFFECTIVE_GLOB', `${scope.id} has no effective globs`)
    if (scope.id === 'repository-all-tracked') {
      if (
        scope.classification !== 'universal' ||
        scope.trackedMatchPolicy !== 'exact-all-tracked' ||
        JSON.stringify(scope.effectiveGlobs) !== '["**"]'
      )
        fail('UNIVERSAL_SCOPE_MISMATCH', 'Universal scope must be the exact ** sentinel')
      const resolved = inventory.filter(candidate =>
        scope.effectiveGlobs.some(glob => matchesGlob(candidate, glob))
      )
      if (JSON.stringify(resolved) !== JSON.stringify(inventory))
        fail('UNIVERSAL_SCOPE_MISMATCH', 'Universal scope does not equal git ls-files')
    } else {
      if (scope.trackedMatchPolicy !== 'at-least-one-per-glob')
        fail('SCOPE_SCHEMA_ENUM', `${scope.id} has an invalid tracked match policy`)
      for (const glob of scope.effectiveGlobs)
        if (!inventory.some(candidate => matchesGlob(candidate, glob)))
          fail('DEAD_EFFECTIVE_GLOB', `${scope.id}:${glob} matches no tracked path`)
    }
  }
  const rulePaths = new Set()
  let previousRule = ''
  for (const assignment of registry.ruleAssignments) {
    exactKeys(
      assignment,
      ['rulePath', 'scopeIds'],
      'SCOPE_SCHEMA_REQUIRED',
      'SCOPE_SCHEMA_ADDITIONAL_PROPERTY',
      `assignment:${assignment?.rulePath ?? 'unknown'}`
    )
    if (!/^\.ai\/rules\/.+\.mdc$/u.test(assignment.rulePath) || rulePaths.has(assignment.rulePath))
      fail(
        'DUPLICATE_RULE_ASSIGNMENT',
        `Invalid or duplicate rule assignment: ${assignment.rulePath}`
      )
    if (previousRule && compareStrings(previousRule, assignment.rulePath) >= 0)
      fail('NONDETERMINISTIC_SCOPE_ORDER', 'Rule assignments must be sorted')
    previousRule = assignment.rulePath
    rulePaths.add(assignment.rulePath)
    assertUniqueStrings(
      assignment.scopeIds,
      'DUPLICATE_SCOPE_ID',
      `${assignment.rulePath}.scopeIds`,
      { allowEmpty: false }
    )
    assertSorted(
      assignment.scopeIds,
      'NONDETERMINISTIC_SCOPE_ORDER',
      `${assignment.rulePath}.scopeIds`
    )
    for (const scopeId of assignment.scopeIds)
      if (!ids.has(scopeId)) fail('UNKNOWN_SCOPE_ID', `Unknown scope ${scopeId}`)
  }
  return registry
}

export function validateRoutingManifest(
  manifest,
  { fixtureCases = null, scopeRegistry = null, skillIds = null } = {}
) {
  exactKeys(
    manifest,
    ['version', 'routerVersion', 'scopeRegistry', 'fallback', 'motionPolicy', 'routes'],
    'ROUTE_SCHEMA_REQUIRED',
    'ROUTE_SCHEMA_ADDITIONAL_PROPERTY',
    'routing manifest'
  )
  if (
    manifest.version !== 3 ||
    manifest.routerVersion !== 1 ||
    manifest.scopeRegistry !== '.ai/manifests/routing-scopes.json'
  )
    fail('ROUTE_SCHEMA_ENUM', 'Routing manifest version or registry path drifted')
  exactKeys(
    manifest.fallback,
    [
      'id',
      'description',
      'priority',
      'compositionMode',
      'exclusiveGroup',
      'primarySkills',
      'supplementalSkills',
      'prechecks',
      'tokenStrategy',
    ],
    'ROUTE_SCHEMA_REQUIRED',
    'ROUTE_SCHEMA_ADDITIONAL_PROPERTY',
    'fallback'
  )
  if (
    manifest.fallback.id !== 'fallback' ||
    manifest.fallback.priority !== 0 ||
    manifest.fallback.compositionMode !== 'fallback'
  )
    fail('ROUTE_SCHEMA_ENUM', 'Fallback contract drifted')
  exactKeys(
    manifest.motionPolicy,
    ['exclusiveGroup', 'allowDualMotionFlag', 'requiresIndependentEvidence'],
    'ROUTE_SCHEMA_REQUIRED',
    'ROUTE_SCHEMA_ADDITIONAL_PROPERTY',
    'motionPolicy'
  )
  if (
    manifest.motionPolicy.exclusiveGroup !== 'motion-engine' ||
    manifest.motionPolicy.allowDualMotionFlag !== 'allowDualMotion' ||
    manifest.motionPolicy.requiresIndependentEvidence !== true
  )
    fail('ROUTE_SCHEMA_ENUM', 'Motion policy drifted')
  if (!Array.isArray(manifest.routes)) fail('ROUTE_SCHEMA_REQUIRED', 'routes must be an array')
  const scopes = scopeRegistry ?? readJson(path.join(REPO_ROOT, manifest.scopeRegistry))
  validateRoutingScopes(scopes)
  const scopeIds = new Set(scopes.scopes.map(scope => scope.id))
  const resolvedSkillIds = skillIds ?? new Set(Object.keys(readJson(LOCK_PATH).skills ?? {}))
  const knownSkillIds =
    resolvedSkillIds instanceof Set ? resolvedSkillIds : new Set(resolvedSkillIds)
  const fixtureIds = new Set()
  for (const fixture of fixtureCases ?? []) {
    if (fixtureIds.has(fixture.id))
      fail('DUPLICATE_FIXTURE_ID', `Duplicate fixture ID: ${fixture.id}`)
    fixtureIds.add(fixture.id)
  }
  const routeIds = new Set()
  for (const route of manifest.routes) {
    exactKeys(
      route,
      ROUTE_FIELDS,
      'ROUTE_SCHEMA_REQUIRED',
      'ROUTE_SCHEMA_ADDITIONAL_PROPERTY',
      `route:${route?.id ?? 'unknown'}`
    )
    if (!isId(route.id) || routeIds.has(route.id))
      fail('DUPLICATE_ROUTE_ID', `Invalid or duplicate route ID: ${route.id}`)
    routeIds.add(route.id)
    if (
      !Number.isInteger(route.priority) ||
      route.priority < 1 ||
      route.priority > 1000 ||
      !['primary', 'composable', 'supplemental-only', 'fallback'].includes(route.compositionMode)
    )
      fail('ROUTE_SCHEMA_ENUM', `Invalid route enum or priority: ${route.id}`)
    for (const field of [
      'keywords',
      'scopeIds',
      'primarySkills',
      'supplementalSkills',
      'prechecks',
      'tokenStrategy',
      'positiveFixtureIds',
      'negativeFixtureIds',
    ]) {
      assertUniqueStrings(route[field], 'ROUTE_SCHEMA_ENUM', `${route.id}.${field}`, {
        allowEmpty: ['scopeIds', 'primarySkills', 'supplementalSkills', 'prechecks'].includes(
          field
        ),
      })
      if (field === 'scopeIds')
        for (const scopeId of route[field])
          if (!scopeIds.has(scopeId))
            fail('UNKNOWN_SCOPE_ID', `Unknown scope ${scopeId} on ${route.id}`)
      if (fixtureCases && ['positiveFixtureIds', 'negativeFixtureIds'].includes(field))
        for (const fixtureId of route[field])
          if (!fixtureIds.has(fixtureId))
            fail('MISSING_FIXTURE_ID', `Missing linked fixture ${fixtureId}`)
      if (
        [
          'keywords',
          'scopeIds',
          'supplementalSkills',
          'positiveFixtureIds',
          'negativeFixtureIds',
        ].includes(field)
      )
        assertSorted(route[field], 'NONDETERMINISTIC_ROUTE_ORDER', `${route.id}.${field}`)
    }
    exactKeys(
      route.matchPolicy,
      ['keywordMinimum', 'scopeMinimum', 'combine', 'explicitKeywordRequired', 'pathStatePolicy'],
      'ROUTE_SCHEMA_REQUIRED',
      'ROUTE_SCHEMA_ADDITIONAL_PROPERTY',
      `${route.id}.matchPolicy`
    )
    if (
      !Number.isInteger(route.matchPolicy.keywordMinimum) ||
      route.matchPolicy.keywordMinimum < 0 ||
      !Number.isInteger(route.matchPolicy.scopeMinimum) ||
      route.matchPolicy.scopeMinimum < 0 ||
      !['any', 'all'].includes(route.matchPolicy.combine) ||
      typeof route.matchPolicy.explicitKeywordRequired !== 'boolean' ||
      !['any', 'new-or-explicit-keyword'].includes(route.matchPolicy.pathStatePolicy)
    )
      fail('ROUTE_SCHEMA_ENUM', `Invalid match policy: ${route.id}`)
    for (const skillId of [...route.primarySkills, ...route.supplementalSkills])
      if (!knownSkillIds.has(skillId))
        fail('UNKNOWN_SKILL_ID', `Unknown Skill ${skillId} on ${route.id}`)
  }
  for (const skillId of [
    ...manifest.fallback.primarySkills,
    ...manifest.fallback.supplementalSkills,
  ])
    if (!knownSkillIds.has(skillId)) fail('UNKNOWN_SKILL_ID', `Unknown fallback Skill ${skillId}`)
  const projectUi = manifest.routes.find(route => route.id === 'project-ui')
  if (!projectUi) fail('MISSING_PROJECT_UI_ROUTE', 'project-ui route is required')
  if (
    projectUi.compositionMode !== 'primary' ||
    projectUi.matchPolicy.explicitKeywordRequired !== true ||
    projectUi.primarySkills[0] !== 'project-ui'
  )
    fail('MISSING_PROJECT_UI_ROUTE', 'project-ui primary activation drifted')
  if (
    projectUi.supplementalSkills.some(
      skillId =>
        skillId.startsWith('ccd-') &&
        skillId !== 'ccd-gsap-motion' &&
        skillId !== 'ccd-animate-lite'
    )
  )
    fail(
      'LEGACY_GENERIC_DESIGN_CHAIN_REACTIVATED',
      'Legacy design chain must not be generic UI supplements'
    )
  const unocss = manifest.routes.find(route => route.id === 'core-unocss')
  if (
    !unocss ||
    JSON.stringify(unocss.matchPolicy) !==
      JSON.stringify({
        keywordMinimum: 1,
        scopeMinimum: 0,
        combine: 'any',
        explicitKeywordRequired: true,
        pathStatePolicy: 'any',
      }) ||
    unocss.keywords.some(keyword =>
      ['theme', 'style', 'styling', 'css', 'scss', 'design token'].includes(normalizeText(keyword))
    )
  )
    fail('BROAD_UNOCSS_EVIDENCE', 'UnoCSS requires narrow explicit engine evidence')
  const vite = manifest.routes.find(route => route.id === 'core-vite')
  if (!vite || vite.scopeIds.some(id => ['root-scripts', 'workspace-config'].includes(id)))
    fail('BROAD_VITE_EVIDENCE', 'Vite route includes broad scopes')
  for (const route of manifest.routes.filter(
    candidate => candidate.exclusiveGroup === 'motion-engine'
  ))
    if (route.compositionMode !== 'supplemental-only')
      fail('INVALID_EXCLUSIVE_COMPOSITION', `${route.id} must remain supplemental-only`)
  return manifest
}

const routeRecord = route => ({
  id: route.id,
  priority: route.priority,
  compositionMode: route.compositionMode,
  exclusiveGroup: route.exclusiveGroup,
  primarySkills: route.primarySkills,
  supplementalSkills: route.supplementalSkills,
})
const emptyResult = (
  manifest,
  input,
  status,
  diagnostics,
  matchedRoutes = [],
  rejectedConflicts = []
) => ({
  resultVersion: 1,
  manifestVersion: manifest?.version ?? null,
  routerVersion: manifest?.routerVersion ?? null,
  status,
  input,
  primaryRoute: null,
  supplementalRoutes: [],
  matchedRoutes,
  primarySkills: [],
  supplementalSkills: [],
  selectedSkills: [],
  prechecks: [],
  tokenStrategy: [],
  matchReasons: [],
  rejectedConflicts,
  diagnostics,
})
const diagnostic = (code, message, routeIds = [], paths = []) => ({
  severity: 'error',
  code,
  message,
  routeIds,
  paths,
})
const conflict = (code, routeIds, skillIds, evidence) => ({ code, routeIds, skillIds, evidence })

const evaluateRoute = (route, task, inputPaths, scopesById) => {
  let keywords = route.keywords.filter(keyword => containsKeyword(task, keyword))
  if (
    route.id === 'project-ui' &&
    keywords.length === 1 &&
    keywords[0] === 'design' &&
    /\b(?:api|database|migration|schema)\b/iu.test(normalizeText(task))
  )
    keywords = []
  if (
    route.id === 'project-ui' &&
    keywords.every(keyword => ['design', '设计'].includes(keyword)) &&
    /(?:design token engine|utility engine|unocss|设计令牌引擎|工具类引擎)/iu.test(
      normalizeText(task)
    )
  )
    keywords = []
  const matchedScopeIds = route.scopeIds.filter(scopeId =>
    inputPaths.some(item => item.matchedScopeIds.includes(scopeId))
  )
  const keywordSatisfied =
    route.matchPolicy.keywordMinimum === 0 || keywords.length >= route.matchPolicy.keywordMinimum
  const scopeSatisfied =
    route.matchPolicy.scopeMinimum === 0 || matchedScopeIds.length >= route.matchPolicy.scopeMinimum
  const activeDimensions = []
  if (route.matchPolicy.keywordMinimum > 0) activeDimensions.push(keywordSatisfied)
  if (route.matchPolicy.scopeMinimum > 0) activeDimensions.push(scopeSatisfied)
  let matches =
    activeDimensions.length > 0 &&
    (route.matchPolicy.combine === 'all'
      ? activeDimensions.every(Boolean)
      : activeDimensions.some(Boolean))
  if (route.matchPolicy.explicitKeywordRequired && !keywordSatisfied) matches = false
  const newPathEvidence = inputPaths.some(
    item => item.state !== 'tracked' && route.scopeIds.some(id => item.matchedScopeIds.includes(id))
  )
  if (
    route.id === 'core-vue' &&
    keywords.length === 0 &&
    !inputPaths.some(
      item =>
        item.path.endsWith('.vue') && route.scopeIds.some(id => item.matchedScopeIds.includes(id))
    )
  )
    matches = false
  if (
    route.matchPolicy.pathStatePolicy === 'new-or-explicit-keyword' &&
    keywords.length === 0 &&
    !newPathEvidence
  )
    matches = false
  if (!matches) return null
  const reasons = []
  if (keywords.length > 0)
    reasons.push({ routeId: route.id, kind: 'keyword', matcher: 'keywords', evidence: keywords })
  if (matchedScopeIds.length > 0)
    reasons.push({
      routeId: route.id,
      kind: 'scope',
      matcher: 'scopeIds',
      evidence: matchedScopeIds,
    })
  if (newPathEvidence && route.matchPolicy.pathStatePolicy === 'new-or-explicit-keyword')
    reasons.push({
      routeId: route.id,
      kind: 'path-state',
      matcher: 'new-or-explicit-keyword',
      evidence: inputPaths
        .filter(item => item.state !== 'tracked')
        .map(item => item.path)
        .sort(compareStrings),
    })
  return { route, reasons }
}

export function routeTask(task, paths = [], options = {}) {
  const manifest = options.manifest ?? readJson(MANIFEST_PATH)
  const scopes = options.scopeRegistry ?? readJson(SCOPES_PATH)
  const fixtures = options.fixtureCases ?? readJson(FIXTURE_PATH).cases
  const lock = options.skillsLock ?? readJson(LOCK_PATH)
  const normalizedTask = String(task).trim().replace(/\s+/gu, ' ')
  let input = { task: normalizedTask, paths: [], allowDualMotion: options.allowDualMotion === true }
  try {
    if (!normalizedTask) fail('CLI_ARGUMENT_ERROR', 'Task text is required')
    const suppliedStates = new Map(
      paths
        .filter(item => item && typeof item === 'object')
        .map(item => [normalizePath(item.path), item.state])
    )
    const rawPaths = unique(
      paths.map(item => normalizePath(item && typeof item === 'object' ? item.path : item))
    ).sort(compareStrings)
    const tracked = options.tracked ?? trackedPaths(options.root ?? REPO_ROOT)
    const trackedSet = new Set(tracked)
    validateRoutingScopes(scopes, { tracked, root: options.root ?? REPO_ROOT })
    validateRoutingManifest(manifest, {
      fixtureCases: fixtures,
      scopeRegistry: scopes,
      skillIds: new Set(Object.keys(lock.skills ?? {})),
    })
    const scopeById = new Map(scopes.scopes.map(scope => [scope.id, scope]))
    input = {
      task: normalizedTask,
      paths: rawPaths.map(candidate => ({
        path: candidate,
        state:
          suppliedStates.get(candidate) ??
          (trackedSet.has(candidate)
            ? 'tracked'
            : fs.existsSync(path.join(options.root ?? REPO_ROOT, candidate))
              ? 'untracked'
              : 'missing'),
        matchedScopeIds: scopes.scopes
          .filter(scope => scope.effectiveGlobs.some(glob => matchesGlob(candidate, glob)))
          .map(scope => scope.id)
          .sort(compareStrings),
      })),
      allowDualMotion: options.allowDualMotion === true,
    }
    const matched = manifest.routes
      .map(route => evaluateRoute(route, normalizedTask, input.paths, scopeById))
      .filter(Boolean)
    const sortedMatched = [...matched].sort(
      (a, b) => b.route.priority - a.route.priority || compareStrings(a.route.id, b.route.id)
    )
    const specialized = sortedMatched.filter(
      item => item.route.exclusiveGroup === manifest.motionPolicy.exclusiveGroup
    )
    const hasConcrete = sortedMatched.some(item =>
      ['primary', 'composable'].includes(item.route.compositionMode)
    )
    const activeMatched = hasConcrete
      ? sortedMatched.filter(item => item.route.compositionMode !== 'fallback')
      : sortedMatched
    const matchedRecords = activeMatched.map(item => routeRecord(item.route))
    if (specialized.length > 1 && !input.allowDualMotion) {
      const routeIds = specialized.map(item => item.route.id)
      const skillIds = unique(specialized.flatMap(item => item.route.supplementalSkills)).sort(
        compareStrings
      )
      return emptyResult(manifest, input, 'rejected', [], matchedRecords, [
        conflict('MOTION_DUAL_EVIDENCE_REQUIRED', routeIds, skillIds, ['allowDualMotion=false']),
      ])
    }
    if (input.allowDualMotion && specialized.length !== 2) {
      const routeIds = specialized.map(item => item.route.id)
      const skillIds = unique(specialized.flatMap(item => item.route.supplementalSkills)).sort(
        compareStrings
      )
      return emptyResult(manifest, input, 'rejected', [], matchedRecords, [
        conflict('MOTION_DUAL_EVIDENCE_INSUFFICIENT', routeIds, skillIds, [
          `matched=${specialized.length}`,
        ]),
      ])
    }
    const concrete = activeMatched.filter(item =>
      ['primary', 'composable'].includes(item.route.compositionMode)
    )
    const primaryPool =
      concrete.length > 0
        ? concrete
        : activeMatched.filter(item => item.route.compositionMode === 'fallback')
    let primary = null
    if (primaryPool.length > 0) {
      const highest = primaryPool[0].route.priority
      const tied = primaryPool.filter(item => item.route.priority === highest)
      if (tied.length > 1) {
        const routeIds = tied.map(item => item.route.id).sort(compareStrings)
        return emptyResult(manifest, input, 'rejected', [], matchedRecords, [
          conflict(
            'PRIMARY_PRIORITY_TIE',
            routeIds,
            unique(tied.flatMap(item => item.route.primarySkills)).sort(compareStrings),
            [`priority=${highest}`]
          ),
        ])
      }
      primary = primaryPool[0]
    }
    if (!primary)
      primary = {
        route: manifest.fallback,
        reasons: [
          {
            routeId: 'fallback',
            kind: 'fallback',
            matcher: 'default',
            evidence: ['no-concrete-route'],
          },
        ],
      }
    const isFallback = primary.route.compositionMode === 'fallback'
    const supplemental = isFallback
      ? []
      : activeMatched.filter(
          item =>
            item.route.id !== primary.route.id &&
            ['composable', 'supplemental-only'].includes(item.route.compositionMode)
        )
    const primarySkills = [...primary.route.primarySkills]
    const supplementalSkills = unique([
      ...primary.route.supplementalSkills,
      ...supplemental.flatMap(item => [
        ...item.route.primarySkills,
        ...item.route.supplementalSkills,
      ]),
    ])
      .filter(skillId => !primarySkills.includes(skillId))
      .sort(compareStrings)
    const stableRouteValues = field =>
      unique([
        ...(primary.route[field] ?? []),
        ...supplemental.flatMap(item => item.route[field] ?? []),
      ])
    const result = {
      resultVersion: 1,
      manifestVersion: manifest.version,
      routerVersion: manifest.routerVersion,
      status: isFallback ? 'fallback' : 'matched',
      input,
      primaryRoute: routeRecord(primary.route),
      supplementalRoutes: supplemental.map(item => routeRecord(item.route)),
      matchedRoutes:
        primary.route.id === 'fallback' ? [routeRecord(primary.route)] : matchedRecords,
      primarySkills,
      supplementalSkills,
      selectedSkills: [...primarySkills, ...supplementalSkills],
      prechecks: stableRouteValues('prechecks'),
      tokenStrategy: stableRouteValues('tokenStrategy'),
      matchReasons: [...primary.reasons, ...supplemental.flatMap(item => item.reasons)].sort(
        (a, b) => {
          const priorityA = (
            manifest.routes.find(route => route.id === a.routeId) ?? manifest.fallback
          ).priority
          const priorityB = (
            manifest.routes.find(route => route.id === b.routeId) ?? manifest.fallback
          ).priority
          return (
            priorityB - priorityA ||
            compareStrings(a.routeId, b.routeId) ||
            compareStrings(a.kind, b.kind) ||
            compareStrings(a.matcher, b.matcher)
          )
        }
      ),
      rejectedConflicts: [],
      diagnostics: [],
    }
    const fixturePathKey = value =>
      JSON.stringify(
        (value ?? [])
          .map(item => ({
            path: normalizePath(item && typeof item === 'object' ? item.path : item),
            state: item && typeof item === 'object' ? item.state : undefined,
          }))
          .sort(
            (left, right) =>
              compareStrings(left.path, right.path) ||
              compareStrings(left.state ?? '', right.state ?? '')
          )
      )
    const inputPathKey = fixturePathKey(
      input.paths.map(item => ({ path: item.path, state: item.state }))
    )
    const matchingFixtures = fixtures.filter(
      fixture =>
        fixture.classification !== 'mutation' &&
        String(fixture.task ?? '')
          .trim()
          .replace(/\s+/gu, ' ') === normalizedTask &&
        fixturePathKey(fixture.paths) === inputPathKey &&
        fixture.flags?.allowDualMotion === input.allowDualMotion
    )
    for (const fixture of matchingFixtures) {
      if (
        JSON.stringify(fixture.expected?.selectedSkills) !== JSON.stringify(result.selectedSkills)
      ) {
        fail(
          'EXPECTED_SKILL_SET_MISMATCH',
          `Fixture ${fixture.id} expected Skill set differs from normalized routing output`
        )
      }
    }
    if (Object.keys(result).join(',') !== RESULT_FIELDS.join(','))
      fail('RESULT_SHAPE_DRIFT', 'Normalized result key order drifted')
    return result
  } catch (error) {
    if (!(error instanceof RoutingContractError)) throw error
    return emptyResult(manifest, input, 'invalid', [
      diagnostic(
        error.code,
        error.message,
        error.details.routeIds ?? [],
        error.details.paths ?? []
      ),
    ])
  }
}

function parseCli(argv) {
  const task = []
  const paths = []
  let allowDualMotion = false
  let json = false
  let index = 0
  while (index < argv.length) {
    const value = argv[index]
    if (value === '--') {
      index += 1
      continue
    }
    if (value === '--json') {
      if (json) fail('CLI_ARGUMENT_ERROR', '--json may be specified once')
      json = true
      index += 1
      continue
    }
    if (value === '--allow-dual-motion') {
      if (allowDualMotion) fail('CLI_ARGUMENT_ERROR', '--allow-dual-motion may be specified once')
      allowDualMotion = true
      index += 1
      continue
    }
    if (value === '--paths') {
      index += 1
      const start = index
      while (index < argv.length && !argv[index].startsWith('--')) {
        paths.push(argv[index])
        index += 1
      }
      if (index === start) fail('CLI_ARGUMENT_ERROR', '--paths requires at least one path')
      continue
    }
    if (value.startsWith('--')) fail('CLI_ARGUMENT_ERROR', `Unknown argument: ${value}`)
    task.push(value)
    index += 1
  }
  let taskText = task.join(' ').trim()
  if (!taskText && !process.stdin.isTTY) taskText = fs.readFileSync(0, 'utf8').trim()
  if (!taskText) fail('CLI_ARGUMENT_ERROR', 'Task text is required')
  return { task: taskText, paths, allowDualMotion, json }
}

const renderText = result =>
  [
    `status=${result.status}`,
    `primaryRoute=${result.primaryRoute?.id ?? 'none'}`,
    `selectedSkills=${result.selectedSkills.join(',') || 'none'}`,
    `diagnostics=${result.diagnostics.map(item => item.code).join(',') || 'none'}`,
  ].join('\n')

export async function main(argv = process.argv.slice(2)) {
  try {
    const args = parseCli(argv)
    const result = routeTask(args.task, args.paths, { allowDualMotion: args.allowDualMotion })
    process.stdout.write(args.json ? canonicalJson(result) : `${renderText(result)}\n`)
    if (result.status === 'invalid') process.exitCode = 3
    else if (result.status === 'rejected') process.exitCode = 4
  } catch (error) {
    const code = error instanceof RoutingContractError ? error.code : 'ROUTER_RUNTIME_ERROR'
    process.stderr.write(`${code}: ${error.message}\n`)
    process.exitCode =
      error instanceof RoutingContractError &&
      ['CLI_ARGUMENT_ERROR', 'INVALID_INPUT_PATH'].includes(error.code)
        ? 2
        : 1
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) await main()
