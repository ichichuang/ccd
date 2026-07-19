import crypto from 'node:crypto'
import { SCANNER_VERSION, canonicalJson, compareAscii, deepFreeze, fail, normalizeString, uniqueSorted } from './contracts.mjs'

const FIELD_NAMES = deepFreeze(['id', 'ruleId', 'detectorId', 'severity', 'message', 'path', 'scopeId', 'language', 'line', 'column', 'endLine', 'endColumn', 'evidence', 'fingerprint', 'baselineState', 'ownerContext', 'exceptionId', 'parser', 'scannerVersion'])

export function normalizeEvidence(evidence) {
  if (!evidence || !['kind', 'subject', 'predicate', 'value', 'related'].every(key => Object.hasOwn(evidence, key))) fail('EVIDENCE_INVALID', 'diagnostic evidence is incomplete')
  return deepFreeze({
    kind: normalizeString(evidence.kind),
    subject: normalizeString(evidence.subject),
    predicate: normalizeString(evidence.predicate),
    value: evidence.value === null ? null : normalizeString(evidence.value),
    related: uniqueSorted(evidence.related.map(normalizeString)),
  })
}

export function createFingerprint({ ruleId, detectorId, path, evidence, ownerKey }) {
  const bytes = `ccd-ui-fingerprint/v1\0${ruleId}\0${detectorId}\0${path}\0${canonicalJson(evidence).trimEnd()}\0${ownerKey}`
  return `sha256:${crypto.createHash('sha256').update(bytes).digest('hex')}`
}

export function normalizeDiagnostic(raw) {
  const evidence = normalizeEvidence(raw.evidence)
  const ownerKey = raw.ownerContext?.ownerKey ?? `file:${raw.path}`
  const fingerprint = createFingerprint({ ...raw, evidence, ownerKey })
  const message = `${raw.messageId}: ${raw.evidence.predicate}`.replace(/[\r\n]+/gu, ' ')
  return {
    id: null,
    ruleId: raw.ruleId,
    detectorId: raw.detectorId,
    severity: 'error',
    message,
    path: raw.path,
    scopeId: raw.scopeId,
    language: raw.language,
    line: raw.location.line,
    column: raw.location.column,
    endLine: raw.location.endLine,
    endColumn: raw.location.endColumn,
    evidence,
    fingerprint,
    baselineState: 'UNBASELINED',
    ownerContext: raw.ownerContext ?? null,
    exceptionId: null,
    parser: raw.parser,
    scannerVersion: SCANNER_VERSION,
  }
}

export function sortDiagnostics(diagnostics) {
  const keys = ['path', 'line', 'column', 'endLine', 'endColumn', 'ruleId', 'detectorId', 'fingerprint']
  return [...diagnostics].sort((left, right) => {
    for (const key of keys) {
      const result = typeof left[key] === 'number' ? left[key] - right[key] : compareAscii(left[key], right[key])
      if (result !== 0) return result
    }
    return 0
  })
}

export function finalizeDiagnostics(rawFindings) {
  const ordered = sortDiagnostics(rawFindings.map(normalizeDiagnostic))
  const ordinals = new Map()
  const finalized = ordered.map(diagnostic => {
    const ordinal = (ordinals.get(diagnostic.fingerprint) ?? 0) + 1
    ordinals.set(diagnostic.fingerprint, ordinal)
    return deepFreeze({ ...diagnostic, id: `${diagnostic.fingerprint}#${String(ordinal).padStart(6, '0')}` })
  })
  validateDiagnosticSet(finalized)
  for (const diagnostic of finalized) validateDiagnostic(diagnostic)
  return deepFreeze(finalized)
}

export function validateDiagnosticSet(diagnostics) {
  const ids = diagnostics.map(item => item.id)
  if (new Set(ids).size !== ids.length) fail('DIAGNOSTIC_DUPLICATE_ID', 'diagnostic IDs must be unique')
  return diagnostics
}

export function validateDiagnostic(diagnostic) {
  if (JSON.stringify(Object.keys(diagnostic)) !== JSON.stringify(FIELD_NAMES)) fail('DIAGNOSTIC_SCHEMA', `diagnostic fields are not exact for ${diagnostic.id}`)
  if (!/^sha256:[0-9a-f]{64}#\d{6}$/u.test(diagnostic.id) || !/^sha256:[0-9a-f]{64}$/u.test(diagnostic.fingerprint)) fail('FINGERPRINT_INVALID', `diagnostic fingerprint is invalid: ${diagnostic.id}`)
  if (!/^CCD-UI-\d{3}$/u.test(diagnostic.ruleId) || diagnostic.severity !== 'error') fail('DIAGNOSTIC_SCHEMA', `diagnostic identity is invalid: ${diagnostic.id}`)
  if (![diagnostic.line, diagnostic.column, diagnostic.endLine, diagnostic.endColumn].every(Number.isInteger)) fail('DIAGNOSTIC_SCHEMA', `diagnostic location is invalid: ${diagnostic.id}`)
  return diagnostic
}
