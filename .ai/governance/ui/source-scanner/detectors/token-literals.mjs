import { deepFreeze, makeRawFinding } from '../contracts.mjs'

function nodesWithValue(model) {
  return [
    ...model.declarations.map(node => ({ node, value: `${node.property}:${node.value}` })),
    ...model.elements.flatMap(node => (node.classes ?? []).map(value => ({ node, value }))),
    ...model.literals.map(node => ({ node, value: String(node.value) })),
  ]
}

export function detectTokenLiterals({ model, binding }) {
  const matches = []
  for (const item of nodesWithValue(model)) {
    const value = item.value
    let predicate = null
    if (binding.ruleId === 'CCD-UI-012' && /(?:^|[^\w-])(?:\d*\.)?\d+(?:rem|em)(?:[^\w-]|$)/u.test(value) && !/var\(--/u.test(value)) predicate = 'rem-em-literal-forbidden'
    if (binding.ruleId === 'CCD-UI-014' && /(?:^|\s)invented-[\w-]+/u.test(value)) predicate = 'shortcut-not-registered'
    if (binding.ruleId === 'CCD-UI-015' && /#[0-9a-f]{3,8}\b|\brgba?\s*\(|(?:\d*\.)?\d+(?:rem|em)\b/iu.test(value) && !/var\(--/u.test(value)) predicate = 'visual-literal-forbidden'
    if (binding.ruleId === 'CCD-UI-016' && /(?:^|[:\s[(])(?:\d*\.)?\d+px\b/u.test(value) && !/var\(--/u.test(value)) predicate = 'dimension-token-required'
    if (predicate) matches.push(makeRawFinding(binding, model, item.node, { kind: binding.fingerprintKind ?? 'token-literal', subject: value, predicate, value, related: [] }))
  }
  return deepFreeze(matches)
}
