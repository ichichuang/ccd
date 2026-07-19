import { compareAscii, deepFreeze, fail, normalizePosixPath } from './contracts.mjs'

const FIXED_EXTENSIONS = '{vue,ts,tsx,css,scss}'

function expandPattern(pattern) {
  if (typeof pattern !== 'string' || pattern.length === 0) fail('AUTH_MANIFEST', 'scope pattern must be non-empty')
  if (/[?\[\]()!+@\\]/u.test(pattern)) fail('AUTH_MANIFEST', `unsupported scope grammar: ${pattern}`)
  const brace = pattern.match(/\{[^}]+\}/u)
  if (!brace) return [pattern]
  if (brace[0] !== FIXED_EXTENSIONS || pattern.match(/\{[^}]+\}/gu).length !== 1) {
    fail('AUTH_MANIFEST', `unsupported extension alternatives: ${pattern}`)
  }
  return ['vue', 'ts', 'tsx', 'css', 'scss'].map(extension => pattern.replace(FIXED_EXTENSIONS, extension))
}

function segmentMatches(pattern, segment) {
  const source = `^${pattern.split('*').map(part => part.replace(/[.$^{|}]/gu, '\\$&')).join('.*')}$`
  return new RegExp(source, 'u').test(segment)
}

function matchSegments(patternSegments, pathSegments, patternIndex = 0, pathIndex = 0) {
  if (patternIndex === patternSegments.length) return pathIndex === pathSegments.length
  const pattern = patternSegments[patternIndex]
  if (pattern === '**') {
    if (patternIndex === patternSegments.length - 1) return true
    for (let index = pathIndex; index <= pathSegments.length; index += 1) {
      if (matchSegments(patternSegments, pathSegments, patternIndex + 1, index)) return true
    }
    return false
  }
  if (pathIndex >= pathSegments.length || !segmentMatches(pattern, pathSegments[pathIndex])) return false
  return matchSegments(patternSegments, pathSegments, patternIndex + 1, pathIndex + 1)
}

function compilePattern(pattern) {
  const alternatives = expandPattern(pattern).map(item => item.split('/'))
  return deepFreeze({ pattern, matches: candidate => alternatives.some(segments => matchSegments(segments, candidate.split('/'))) })
}

export function compileScopeRegistry(scopes, exclusions = []) {
  if (!Array.isArray(scopes) || scopes.length === 0) fail('AUTH_MANIFEST', 'scope registry must be non-empty')
  const ids = new Set()
  const compiledScopes = scopes.map(scope => {
    if (ids.has(scope.id)) fail('AUTH_MANIFEST', `duplicate scope ${scope.id}`)
    ids.add(scope.id)
    return deepFreeze({ ...scope, matchers: scope.patterns.map(compilePattern) })
  })
  const compiledExclusions = exclusions.map(compilePattern)
  return deepFreeze({ scopes: compiledScopes, exclusions: compiledExclusions })
}

function assertNotTemporary(candidate) {
  const segments = candidate.toLowerCase().split('/')
  if (segments.some(segment => ['tmp', 'temp'].includes(segment) || segment.endsWith('.tmp') || segment.startsWith('.tmp-'))) {
    fail('PATH_TEMPORARY', `temporary path is forbidden: ${candidate}`)
  }
}

export function classifyPath(registry, candidate) {
  const normalized = normalizePosixPath(candidate)
  assertNotTemporary(normalized)
  if (registry.exclusions.some(matcher => matcher.matches(normalized))) return deepFreeze({ path: normalized, excluded: true, matches: [] })
  const matches = registry.scopes.filter(scope => scope.matchers.some(matcher => matcher.matches(normalized)))
  return deepFreeze({ path: normalized, excluded: false, matches: matches.map(scope => scope.id).sort(compareAscii) })
}

export function assertScopedPath(registry, candidate) {
  const result = classifyPath(registry, candidate)
  if (result.excluded) fail('PATH_EXCLUDED', `path is excluded from UI source enforcement: ${result.path}`)
  if (result.matches.length === 0) fail('PATH_ZERO_SCOPE', `path matches no UI source scope: ${result.path}`)
  if (result.matches.length > 1) fail('PATH_MULTI_SCOPE', `path matches multiple UI source scopes: ${result.path}`, result.matches)
  return deepFreeze({ path: result.path, scopeId: result.matches[0] })
}

export function validateScopeInventory(registry, files, expectedInventory = null) {
  const seen = new Set()
  const scopeCounts = Object.fromEntries(registry.scopes.map(scope => [scope.id, 0]))
  const languageCounts = { vue: 0, ts: 0, tsx: 0, css: 0, scss: 0 }
  let overlaps = 0
  for (const file of files) {
    if (seen.has(file.path)) fail('SCOPE_COUNT_DRIFT', `duplicate source path ${file.path}`)
    seen.add(file.path)
    const classified = classifyPath(registry, file.path)
    if (classified.excluded || classified.matches.length === 0) continue
    if (classified.matches.length > 1) overlaps += 1
    for (const scopeId of classified.matches) scopeCounts[scopeId] += 1
    const extension = file.path.split('.').at(-1)
    if (Object.hasOwn(languageCounts, extension)) languageCounts[extension] += 1
  }
  const deadScopes = Object.values(scopeCounts).filter(count => count === 0).length
  const inventory = deepFreeze({ total: Object.values(scopeCounts).reduce((sum, count) => sum + count, 0), ...languageCounts, overlaps, deadScopes, scopeCounts })
  if (expectedInventory) {
    for (const key of ['total', 'vue', 'ts', 'tsx', 'css', 'scss', 'overlaps', 'deadScopes']) {
      if (inventory[key] !== expectedInventory[key]) fail('SCOPE_COUNT_DRIFT', `${key}=${inventory[key]} must equal ${expectedInventory[key]}`)
    }
    for (const scope of registry.scopes) {
      if (scopeCounts[scope.id] !== scope.declaredCount) fail('SCOPE_COUNT_DRIFT', `${scope.id}=${scopeCounts[scope.id]} must equal ${scope.declaredCount}`)
    }
  }
  return inventory
}
