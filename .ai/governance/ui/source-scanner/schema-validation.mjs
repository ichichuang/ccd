import { deepFreeze, fail } from './contracts.mjs'

function typeMatches(value, expected) {
  if (expected === 'null') return value === null
  if (expected === 'array') return Array.isArray(value)
  if (expected === 'object') return value !== null && typeof value === 'object' && !Array.isArray(value)
  if (expected === 'integer') return Number.isInteger(value)
  return typeof value === expected
}

function pointer(root, reference) {
  if (!reference.startsWith('#/')) fail('SCHEMA_UNSUPPORTED', `only local schema references are supported: ${reference}`)
  return reference
    .slice(2)
    .split('/')
    .reduce((value, token) => value?.[token.replace(/~1/gu, '/').replace(/~0/gu, '~')], root)
}

function validateNode(schema, value, root, instancePath, schemaPath, errors) {
  if (!schema || typeof schema !== 'object') {
    errors.push({ instancePath, schemaPath, code: 'SCHEMA_INVALID', message: 'schema node must be an object' })
    return
  }
  if (schema.$ref) {
    const resolved = pointer(root, schema.$ref)
    if (!resolved) fail('SCHEMA_INVALID', `unresolved schema reference ${schema.$ref}`)
    validateNode(resolved, value, root, instancePath, schema.$ref, errors)
    return
  }
  if (schema.const !== undefined && JSON.stringify(value) !== JSON.stringify(schema.const)) {
    errors.push({ instancePath, schemaPath: `${schemaPath}/const`, code: 'const', message: `must equal ${JSON.stringify(schema.const)}` })
  }
  if (Array.isArray(schema.enum) && !schema.enum.some(item => JSON.stringify(item) === JSON.stringify(value))) {
    errors.push({ instancePath, schemaPath: `${schemaPath}/enum`, code: 'enum', message: 'must equal one declared value' })
  }
  if (schema.type) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type]
    if (!types.some(type => typeMatches(value, type))) {
      errors.push({ instancePath, schemaPath: `${schemaPath}/type`, code: 'type', message: `must be ${types.join(' or ')}` })
      return
    }
  }
  if (typeof value === 'string') {
    if (schema.minLength !== undefined && value.length < schema.minLength) errors.push({ instancePath, schemaPath, code: 'minLength', message: `must have length >= ${schema.minLength}` })
    if (schema.pattern && !new RegExp(schema.pattern, 'u').test(value)) errors.push({ instancePath, schemaPath, code: 'pattern', message: `must match ${schema.pattern}` })
  }
  if (typeof value === 'number' && schema.minimum !== undefined && value < schema.minimum) errors.push({ instancePath, schemaPath, code: 'minimum', message: `must be >= ${schema.minimum}` })
  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) errors.push({ instancePath, schemaPath, code: 'minItems', message: `must contain at least ${schema.minItems} items` })
    if (schema.maxItems !== undefined && value.length > schema.maxItems) errors.push({ instancePath, schemaPath, code: 'maxItems', message: `must contain at most ${schema.maxItems} items` })
    if (schema.uniqueItems) {
      const serialized = value.map(item => JSON.stringify(item))
      if (new Set(serialized).size !== value.length) errors.push({ instancePath, schemaPath, code: 'uniqueItems', message: 'must contain unique items' })
    }
    if (schema.items) value.forEach((item, index) => validateNode(schema.items, item, root, `${instancePath}/${index}`, `${schemaPath}/items`, errors))
  }
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    const keys = Object.keys(value)
    for (const required of schema.required ?? []) {
      if (!Object.hasOwn(value, required)) errors.push({ instancePath, schemaPath: `${schemaPath}/required`, code: 'required', message: `missing required property ${required}` })
    }
    if (schema.minProperties !== undefined && keys.length < schema.minProperties) errors.push({ instancePath, schemaPath, code: 'minProperties', message: `must contain at least ${schema.minProperties} properties` })
    if (schema.maxProperties !== undefined && keys.length > schema.maxProperties) errors.push({ instancePath, schemaPath, code: 'maxProperties', message: `must contain at most ${schema.maxProperties} properties` })
    for (const [key, item] of Object.entries(value)) {
      const child = schema.properties?.[key]
      if (child) {
        validateNode(child, item, root, `${instancePath}/${key}`, `${schemaPath}/properties/${key}`, errors)
        continue
      }
      const patternEntry = Object.entries(schema.patternProperties ?? {}).find(([pattern]) => new RegExp(pattern, 'u').test(key))
      if (patternEntry) {
        validateNode(patternEntry[1], item, root, `${instancePath}/${key}`, `${schemaPath}/patternProperties/${patternEntry[0]}`, errors)
      } else if (schema.additionalProperties === false) {
        errors.push({ instancePath: `${instancePath}/${key}`, schemaPath: `${schemaPath}/additionalProperties`, code: 'additionalProperties', message: `unexpected property ${key}` })
      } else if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
        validateNode(schema.additionalProperties, item, root, `${instancePath}/${key}`, `${schemaPath}/additionalProperties`, errors)
      }
    }
  }
  for (const [keyword, mode] of [['allOf', 'all'], ['anyOf', 'any'], ['oneOf', 'one']]) {
    if (!Array.isArray(schema[keyword])) continue
    const outcomes = schema[keyword].map((candidate, index) => {
      const nested = []
      validateNode(candidate, value, root, instancePath, `${schemaPath}/${keyword}/${index}`, nested)
      return nested
    })
    const passing = outcomes.filter(outcome => outcome.length === 0).length
    const accepted = mode === 'all' ? passing === outcomes.length : mode === 'any' ? passing > 0 : passing === 1
    if (!accepted) errors.push({ instancePath, schemaPath: `${schemaPath}/${keyword}`, code: keyword, message: `${keyword} condition failed` })
  }
}

export function validateJsonSchema(schema, value) {
  const errors = []
  validateNode(schema, value, schema, '', '#', errors)
  return deepFreeze({ ok: errors.length === 0, errors })
}

export function assertJsonSchema(schema, value, label = 'value') {
  const result = validateJsonSchema(schema, value)
  if (!result.ok) fail('SCHEMA_INVALID', `${label} failed schema validation`, result.errors)
  return value
}
