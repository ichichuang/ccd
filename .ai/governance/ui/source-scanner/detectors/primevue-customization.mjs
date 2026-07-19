import { deepFreeze, makeRawFinding } from '../contracts.mjs'

function finding(binding, model, node, kind, subject, predicate, value = null) {
  return makeRawFinding(binding, model, node, { kind, subject, predicate, value, related: [] })
}

export function detectPassThroughConflict({ model, binding }) {
  let nodes = []
  if (binding.ruleId === 'CCD-UI-009') nodes = model.selectors.filter(item => /(?:^|[\s>+~,])\.p-[\w-]+/u.test(item.selector) && !/:deep\s*\(/u.test(item.selector))
  if (binding.ruleId === 'CCD-UI-011') nodes = [
    ...model.elements.filter(item => item.attributes?.some(attribute => /^(?:v-bind:)?pt$/u.test(attribute.name) && /duplicate-global-preset/u.test(attribute.value ?? ''))),
    ...model.literals.filter(item => /duplicate-global-preset/u.test(String(item.value))),
  ]
  return deepFreeze(nodes.map(node => finding(binding, model, node, 'pt-structure', node.selector ?? node.tag, 'pass-through-conflict')))
}

export function detectDeepSelectorException({ model, binding }) {
  let nodes = []
  if (['CCD-UI-010', 'CCD-UI-064'].includes(binding.ruleId)) nodes = model.selectors.filter(item => /:deep\s*\(\s*\.p-[\w-]+/u.test(item.selector))
  if (binding.ruleId === 'CCD-UI-063') nodes = model.elements.filter(item => ['input', 'select', 'textarea', 'button'].includes(item.tag))
  if (binding.ruleId === 'CCD-UI-066') {
    const scriptNodes = model.scriptNodes.filter(item => /warning/u.test(item.text ?? ''))
    nodes = scriptNodes.length > 0 ? scriptNodes : model.literals.filter(item => /warning/u.test(String(item.value ?? '')))
  }
  return deepFreeze(nodes.map(node => finding(binding, model, node, binding.fingerprintKind ?? 'deep-selector', node.selector ?? node.tag ?? node.value ?? node.text, binding.ruleId === 'CCD-UI-064' ? 'registered-exception-required' : 'bounded-owner-required')))
}
