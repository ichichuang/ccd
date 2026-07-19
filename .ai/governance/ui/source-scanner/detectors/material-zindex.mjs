import { deepFreeze, makeRawFinding } from '../contracts.mjs'

function finding(binding, model, node, subject, predicate) {
  return makeRawFinding(binding, model, node, { kind: binding.fingerprintKind ?? 'material-declaration', subject, predicate, value: null, related: [] })
}

export function detectMaterialZIndex({ model, binding }) {
  const results = []
  if (binding.ruleId === 'CCD-UI-035') {
    for (const node of model.elements.filter(element => element.classes.some(value => /backdrop-blur|bg-(?:white|black)\//u.test(value)) && !element.classes.some(value => /material-/u.test(value)))) results.push(finding(binding, model, node, node.tag, 'semantic-material-token-required'))
  }
  if (binding.ruleId === 'CCD-UI-036') {
    for (const node of model.elements.filter(element => ['ProTable', 'CScrollbar', 'VirtualScroller'].includes(element.tag) && element.classes.some(value => /glass/u.test(value)))) results.push(finding(binding, model, node, node.tag, 'nested-glass-forbidden'))
  }
  if (binding.ruleId === 'CCD-UI-037') {
    for (const node of model.elements.filter(element => element.classes.some(value => /(?:^|\s)z-\[?-?\d+/u.test(value)))) results.push(finding(binding, model, node, node.tag, 'semantic-z-index-required'))
    for (const node of model.declarations.filter(item => item.property === 'z-index' && /^-?\d+$/u.test(item.value))) results.push(finding(binding, model, node, node.value, 'semantic-z-index-required'))
  }
  if (binding.ruleId === 'CCD-UI-038') {
    for (const node of model.declarations.filter(item => item.property === 'z-index' && /^-?\d{3,}$/u.test(item.value))) results.push(finding(binding, model, node, node.value, 'stacking-context-restructure-required'))
    for (const node of model.elements.filter(element => element.attributes.some(attribute => attribute.name === 'style' && /z-index\s*:\s*\d{3,}/u.test(attribute.value ?? '')))) results.push(finding(binding, model, node, node.tag, 'stacking-context-restructure-required'))
  }
  return deepFreeze(results)
}
