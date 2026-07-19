import { deepFreeze, fail } from './contracts.mjs'

function pathMatches(pattern, candidate) {
  if (pattern.endsWith('/**')) return candidate === pattern.slice(0, -3) || candidate.startsWith(pattern.slice(0, -2))
  return candidate === pattern
}

function owningSpan(model, ownerKey, offset, context) {
  if (ownerKey?.startsWith('selector:')) return model.selectors.find(selector => selector.ownerKey === ownerKey && offset >= selector.startOffset && offset <= selector.endOffset)
  const direct = model.ownerSymbols.find(symbol => symbol.ownerKey === ownerKey && offset >= symbol.startOffset && offset <= symbol.endOffset)
  if (direct && context.symbols.includes(direct.name)) return direct
  return model.ownerSymbols
    .filter(symbol => offset >= symbol.startOffset && offset <= symbol.endOffset && context.symbols.includes(symbol.name))
    .sort((left, right) => (left.endOffset - left.startOffset) - (right.endOffset - right.startOffset))[0]
}

export function resolveOwnerContexts({ model, authority, ruleId, evidenceKind, ownerKey, offset = 0 }) {
  const matches = []
  const pathOnly = []
  for (const context of authority.manifest.ownerContexts) {
    if (!context.ruleIds.includes(ruleId) || !context.paths.some(pattern => pathMatches(pattern, model.path))) continue
    pathOnly.push(context.id)
    if (!context.allowedEvidence.includes(evidenceKind)) continue
    const span = owningSpan(model, ownerKey, offset, context)
    const symbolAllowed = span && (context.symbols.length === 0 || context.symbols.includes(span.name) || context.symbols.includes(ownerKey.replace(/^symbol:/u, '')))
    const selectorAllowed = span && ownerKey.startsWith('selector:') && (context.selectors.length === 0 || context.selectors.some(selector => ownerKey.slice(9).startsWith(selector)))
    if (symbolAllowed || selectorAllowed) {
      const pathSpecificity = Math.max(...context.paths.filter(pattern => pathMatches(pattern, model.path)).map(pattern => pattern.replace(/\/\*\*$/u, '').length))
      matches.push({ ownerContextId: context.id, ownerKey, specificity: [-pathSpecificity, context.ruleIds.length, context.paths.length, context.symbols.length] })
    }
  }
  matches.sort((left, right) => {
    for (let index = 0; index < left.specificity.length; index += 1) {
      if (left.specificity[index] !== right.specificity[index]) return left.specificity[index] - right.specificity[index]
    }
    return 0
  })
  if (matches.length > 1 && matches[0].specificity.every((value, index) => value === matches[1].specificity[index])) fail('OWNER_CONTEXT_AMBIGUOUS', `multiple equally specific owner contexts authorize ${ruleId} at ${model.path}`, matches.slice(0, 2))
  const match = matches[0] ? deepFreeze({ ownerContextId: matches[0].ownerContextId, ownerKey: matches[0].ownerKey }) : null
  return deepFreeze({ match, pathOnly })
}

export function validateOwnerMatch({ model, authority, ruleId, evidenceKind, ownerKey, offset }) {
  const result = resolveOwnerContexts({ model, authority, ruleId, evidenceKind, ownerKey, offset })
  if (!result.match && result.pathOnly.length > 0) fail('OWNER_PATH_ONLY_MATCH', `path alone cannot authorize ${ruleId} at ${model.path}`, result.pathOnly)
  if (!result.match) fail('OWNER_CONTEXT_UNKNOWN', `no owner authorizes ${ruleId} at ${model.path}`)
  return result.match
}
