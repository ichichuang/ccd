import { deepFreeze, fail, normalizePosixPath } from './contracts.mjs'

export function validateExceptionRegistry(registry, authority, snapshot, diagnostics, now = new Date()) {
  if (registry.schemaVersion !== 'ccd-ui-exception-registry/v1' || registry.policyId !== 'ccd-ui-policy/v2' || !Array.isArray(registry.exceptions)) fail('EXCEPTION_SCOPE', 'exception registry authority is invalid')
  const knownPaths = new Set(snapshot.files.map(file => file.path))
  const ids = new Set()
  for (const exception of registry.exceptions) {
    if (ids.has(exception.id)) fail('EXCEPTION_MULTI_MATCH', `duplicate exception ${exception.id}`)
    ids.add(exception.id)
    if (exception.ruleId !== 'CCD-UI-064') fail('EXCEPTION_RULE_INELIGIBLE', `rule ${exception.ruleId} is not exception eligible`)
    if (!Array.isArray(exception.scope) || exception.scope.length !== 1 || /[*?{}[\]]/u.test(exception.scope[0])) fail('EXCEPTION_SCOPE', `exception ${exception.id} must have one exact path`)
    const scopedPath = normalizePosixPath(exception.scope[0])
    if (!knownPaths.has(scopedPath)) fail('EXCEPTION_PATH', `exception path is not a known source file: ${scopedPath}`)
    const created = Date.parse(exception.createdAt)
    const expires = Date.parse(exception.expiresAt)
    if (!Number.isFinite(created) || !Number.isFinite(expires) || created > now.getTime() || now.getTime() >= expires) fail('EXCEPTION_EXPIRED', `exception ${exception.id} is inactive or expired`)
    const matches = diagnostics.filter(diagnostic => diagnostic.ruleId === exception.ruleId && diagnostic.path === scopedPath)
    if (matches.length === 0) fail('EXCEPTION_UNMATCHED', `exception ${exception.id} matches no diagnostic`)
    if (matches.length > 1) fail('EXCEPTION_MULTI_MATCH', `exception ${exception.id} matches multiple diagnostics`)
  }
  return deepFreeze(registry)
}

export function applyExceptions({ registry, authority, snapshot, diagnostics, now = new Date() }) {
  validateExceptionRegistry(registry, authority, snapshot, diagnostics, now)
  const byIdentity = new Map(registry.exceptions.map(exception => [`${exception.ruleId}\0${exception.scope[0]}`, exception.id]))
  return deepFreeze(diagnostics.map(diagnostic => {
    const exceptionId = byIdentity.get(`${diagnostic.ruleId}\0${diagnostic.path}`)
    return exceptionId ? deepFreeze({ ...diagnostic, baselineState: 'EXCEPTED', exceptionId }) : diagnostic
  }))
}
