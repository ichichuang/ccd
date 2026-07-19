import { deepFreeze, makeRawFinding } from '../contracts.mjs'

function finding(binding, model, node, subject, predicate) {
  return makeRawFinding(binding, model, node, { kind: binding.fingerprintKind ?? 'accessibility-evidence', subject, predicate, value: null, related: [] })
}

export function detectAccessibility({ model, binding }) {
  const results = []
  if (binding.ruleId === 'CCD-UI-048') {
    for (const node of model.elements) {
      const names = node.attributes.map(attribute => attribute.name)
      if (names.some(name => /(?:mouseenter|mouseleave|mouseover|mouseout)/u.test(name)) && !names.some(name => /(?:focus|blur|click|keydown)/u.test(name))) results.push(finding(binding, model, node, node.tag, 'keyboard-equivalent-required'))
    }
  }
  if (binding.ruleId === 'CCD-UI-049') for (const node of model.elements.filter(element => element.attributes.some(attribute => /tooltip/u.test(attribute.name) && /event\s*:\s*['"]hover/u.test(attribute.value ?? '')))) results.push(finding(binding, model, node, node.tag, 'focus-tooltip-required'))
  if (binding.ruleId === 'CCD-UI-050') for (const node of model.elements.filter(element => element.classes.some(value => /border-decorative-on-every-surface/u.test(value)))) results.push(finding(binding, model, node, node.tag, 'semantic-boundary-required'))
  if (binding.ruleId === 'CCD-UI-051') for (const node of model.elements.filter(element => element.attributes.some(attribute => /^(?:v-bind:)?key$/u.test(attribute.name) && /theme/u.test(attribute.value ?? '')))) results.push(finding(binding, model, node, node.tag, 'theme-remount-forbidden'))
  return deepFreeze(results)
}
