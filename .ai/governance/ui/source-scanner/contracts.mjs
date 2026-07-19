import path from 'node:path'

export const SCANNER_VERSION = '1.0.0'
export const SCHEMA_VERSIONS = deepFreeze({
  enforcement: 'ccd-ui-source-enforcement/v1',
  coverage: 'ccd-ui-source-coverage/v1',
  baseline: 'ccd-ui-source-baseline/v1',
  fixtures: 'ccd-ui-source-fixtures/v1',
})
export const FINGERPRINT_ALGORITHM = 'sha256:ccd-ui-fingerprint/v1'
export const EXIT_CODES = deepFreeze({
  SUCCESS: 0,
  SOURCE_VIOLATION: 1,
  CLI_USAGE_OR_PATH_SAFETY: 2,
  AUTHORITY_OR_RESULT_INTEGRITY: 3,
  GIT_OR_SOURCE_ACQUISITION: 4,
  PARSER_FAILURE: 5,
  EXCEPTION_INVALID: 6,
  BASELINE_OR_RATCHET_FAILURE: 7,
  EXPLICIT_OUTPUT_IO: 8,
  SELF_TEST_FAILURE: 9,
  PERFORMANCE_BUDGET: 10,
})

const ERROR_PREFIXES = deepFreeze([
  [/^(CLI_|PATH_|OUTPUT_PATH_)/u, EXIT_CODES.CLI_USAGE_OR_PATH_SAFETY],
  [/^(AUTH_|SCHEMA_|INVARIANT_|DETECTOR_|DIAGNOSTIC_|FINGERPRINT_|EVIDENCE_|RENDER_|SOURCE_MODEL_|OWNER_)/u, EXIT_CODES.AUTHORITY_OR_RESULT_INTEGRITY],
  [/^(GIT_|SOURCE_NOT_REGULAR)/u, EXIT_CODES.GIT_OR_SOURCE_ACQUISITION],
  [/^(PARSE_|UNSUPPORTED_|SCSS_)/u, EXIT_CODES.PARSER_FAILURE],
  [/^EXCEPTION_/u, EXIT_CODES.EXCEPTION_INVALID],
  [/^(BASELINE_|RATCHET_)/u, EXIT_CODES.BASELINE_OR_RATCHET_FAILURE],
  [/^(OUTPUT_IO|BASELINE_OUTPUT_IO)/u, EXIT_CODES.EXPLICIT_OUTPUT_IO],
  [/^SELF_TEST_/u, EXIT_CODES.SELF_TEST_FAILURE],
  [/^PERFORMANCE_/u, EXIT_CODES.PERFORMANCE_BUDGET],
])

export class ScannerError extends Error {
  constructor(reason, message, details = null, exitCode = exitCodeForReason(reason)) {
    super(message)
    this.name = 'ScannerError'
    this.reason = reason
    this.details = details
    this.exitCode = exitCode
  }
}

export function exitCodeForReason(reason) {
  for (const [pattern, code] of ERROR_PREFIXES) {
    if (pattern.test(reason)) return code
  }
  return EXIT_CODES.AUTHORITY_OR_RESULT_INTEGRITY
}

export function fail(reason, message, details = null, exitCode) {
  throw new ScannerError(reason, message, details, exitCode)
}

export function compareAscii(left, right) {
  const a = String(left)
  const b = String(right)
  return a < b ? -1 : a > b ? 1 : 0
}

export function normalizeString(value) {
  return String(value).normalize('NFC').replace(/\r\n?/gu, '\n').trim()
}

export function normalizePosixPath(value) {
  if (typeof value !== 'string' || value.length === 0) fail('PATH_ZERO_SCOPE', 'path must be non-empty')
  if (value.includes('\\')) fail('PATH_TRAVERSAL', `path must use POSIX separators: ${value}`)
  if (path.posix.isAbsolute(value) || path.win32.isAbsolute(value)) fail('PATH_ABSOLUTE', `absolute path is forbidden: ${value}`)
  const normalized = path.posix.normalize(value.replace(/^\.\//u, ''))
  if (normalized === '..' || normalized.startsWith('../') || normalized.includes('/../')) {
    fail('PATH_TRAVERSAL', `path traversal is forbidden: ${value}`)
  }
  if (normalized === '.' || normalized.length === 0) fail('PATH_ZERO_SCOPE', `file path required: ${value}`)
  return normalized
}

function canonicalize(value, seen) {
  if (value === null || typeof value === 'boolean' || typeof value === 'number') return value
  if (typeof value === 'string') return value.normalize('NFC').replace(/\r\n?/gu, '\n')
  if (Array.isArray(value)) return value.map(item => canonicalize(item, seen))
  if (typeof value !== 'object') fail('INVARIANT_VIOLATION', `unsupported canonical JSON value: ${typeof value}`)
  if (seen.has(value)) fail('INVARIANT_VIOLATION', 'canonical JSON cannot contain cycles')
  seen.add(value)
  const result = {}
  for (const key of Object.keys(value).sort(compareAscii)) {
    const item = value[key]
    if (item !== undefined) result[key.normalize('NFC')] = canonicalize(item, seen)
  }
  seen.delete(value)
  return result
}

export function canonicalJson(value) {
  return `${JSON.stringify(canonicalize(value, new Set()))}\n`
}

export function deepFreeze(value, seen = new Set()) {
  if (value === null || (typeof value !== 'object' && typeof value !== 'function') || seen.has(value)) return value
  seen.add(value)
  for (const key of Reflect.ownKeys(value)) deepFreeze(value[key], seen)
  return Object.freeze(value)
}

export function uniqueSorted(values) {
  return [...new Set(values)].sort(compareAscii)
}

const LINE_START_CACHE = new Map()

function lineStartsFor(text) {
  let starts = LINE_START_CACHE.get(text)
  if (starts) return starts
  starts = [0]
  for (let index = 0; index < text.length; index += 1) {
    if (text.charCodeAt(index) === 10) starts.push(index + 1)
  }
  LINE_START_CACHE.set(text, starts)
  return starts
}

export function positionFromOffsets(text, startOffset, endOffset = startOffset + 1) {
  const position = offset => {
    const bounded = Math.max(0, Math.min(text.length, offset))
    const starts = lineStartsFor(text)
    let low = 0
    let high = starts.length
    while (low < high) {
      const middle = (low + high) >>> 1
      if (starts[middle] <= bounded) low = middle + 1
      else high = middle
    }
    const lineIndex = Math.max(0, low - 1)
    return { line: lineIndex + 1, column: bounded - starts[lineIndex] + 1 }
  }
  const start = position(startOffset)
  const end = position(Math.max(startOffset + 1, endOffset))
  return { line: start.line, column: start.column, endLine: end.line, endColumn: end.column }
}

export function makeRawFinding(binding, model, node, evidence, ownerKey = null) {
  const location = node?.location ?? positionFromOffsets(model.sourceText, node?.startOffset ?? 0, node?.endOffset ?? 1)
  return deepFreeze({
    ruleId: binding.ruleId,
    detectorId: binding.detectorId,
    messageId: binding.messageId,
    path: model.path,
    scopeId: model.scopeId,
    language: model.language,
    parser: model.parser,
    location,
    evidence: {
      kind: evidence.kind,
      subject: normalizeString(evidence.subject),
      predicate: normalizeString(evidence.predicate),
      value: evidence.value === null || evidence.value === undefined ? null : normalizeString(evidence.value),
      related: uniqueSorted(evidence.related ?? []),
    },
    ownerKey: ownerKey ?? node?.ownerKey ?? `file:${model.path}`,
  })
}

export function assert(condition, reason, message, details = null) {
  if (!condition) fail(reason, message, details)
}
