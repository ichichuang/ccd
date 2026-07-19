import { deepFreeze, makeRawFinding } from '../contracts.mjs'

function finding(binding, model, node, subject, predicate) {
  return makeRawFinding(binding, model, node, { kind: binding.fingerprintKind ?? 'motion-evidence', subject, predicate, value: null, related: [] })
}

function allValues(model) {
  return [
    ...model.elements.flatMap(element => element.classes.map(value => ({ node: element, value }))),
    ...model.declarations.map(node => ({ node, value: `${node.property}:${node.value}` })),
    ...model.calls.map(node => ({ node, value: `${node.name}(${node.arguments.join(',')})` })),
  ]
}

export function detectMotionLifecycle({ model, binding }) {
  const results = []
  const values = allValues(model)
  if (binding.ruleId === 'CCD-UI-052') for (const item of values.filter(item => /ease-in-out/u.test(item.value))) results.push(finding(binding, model, item.node, item.value, 'semantic-easing-required'))
  if (binding.ruleId === 'CCD-UI-053') for (const item of values.filter(item => /transition-timing-function\s*:\s*linear|(?:^|\s)ease-linear(?:\s|$)/u.test(item.value))) results.push(finding(binding, model, item.node, item.value, 'motion-intent-token-required'))
  if (binding.ruleId === 'CCD-UI-054') for (const node of model.calls.filter(item => item.name === 'gsap.to' && !/timeline/u.test(item.text))) results.push(finding(binding, model, node, node.text, 'bounded-choreography-required'))
  if (binding.ruleId === 'CCD-UI-055') for (const node of model.calls.filter(item => /(?:^|\.)animate$/u.test(item.name) && /\b(?:top|left|right|bottom|width|height|margin|padding)\s*:/u.test(item.text))) results.push(finding(binding, model, node, node.text, 'layout-property-animation-forbidden'))
  if (binding.ruleId === 'CCD-UI-056') for (const node of model.calls.filter(item => item.name === 'gsap.to' && /(?:rotation\s*:\s*360|repeat\s*:\s*-1|pageDecoration)/u.test(item.text))) results.push(finding(binding, model, node, node.text, 'decorative-page-motion-forbidden'))
  if (binding.ruleId === 'CCD-UI-057') {
    for (const node of model.declarations.filter(item => item.property === 'will-change')) results.push(finding(binding, model, node, `${node.property}:${node.value}`, 'unbounded-motion-performance-hint'))
  }
  if (binding.ruleId === 'CCD-UI-067') for (const node of model.calls.filter(item => /(?:^|\.)render$/u.test(item.name) && /window\.(?:innerWidth|innerHeight)|addEventListener|initialize/u.test(item.text))) results.push(finding(binding, model, node, node.text, 'renderer-must-consume-final-state'))
  if (binding.ruleId === 'CCD-UI-068') {
    const initialization = model.calls.filter(item => /(?:initialize|init)$/u.test(item.name))
    const duplicateNames = new Set(initialization.filter((item, index) => initialization.findIndex(other => other.name === item.name) !== index).map(item => item.name))
    const duplicate = initialization.find(item => duplicateNames.has(item.name))
    if (duplicate) results.push(finding(binding, model, duplicate, duplicate.name, 'duplicate-initialization'))
    else if (model.listenerAdds.length > model.listenerRemoves.length) results.push(finding(binding, model, model.listenerAdds[0], model.listenerAdds[0].name, 'listener-cleanup-required'))
  }
  return deepFreeze(results)
}
