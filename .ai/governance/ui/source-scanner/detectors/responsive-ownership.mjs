import { deepFreeze, makeRawFinding } from '../contracts.mjs'

function finding(binding, model, node, kind, subject, predicate) {
  return makeRawFinding(binding, model, node, { kind, subject, predicate, value: null, related: [] })
}

export function detectResponsiveOwnership({ model, binding }) {
  let nodes = []
  if (binding.ruleId === 'CCD-UI-023') nodes = model.scriptNodes.filter(item => /(?:width|height|layout|breakpoint)/iu.test(item.name) && /=\s*\d{3,}/u.test(item.text) && !/LAYOUT_SCALE_RATIOS/u.test(item.text))
  if (binding.ruleId === 'CCD-UI-024') nodes = [...model.propertyAccess.filter(item => /^(?:window\.(?:innerWidth|innerHeight|devicePixelRatio|matchMedia)|screen\.)/u.test(item.name)), ...model.calls.filter(item => /(?:useWindowSize|matchMedia|addEventListener)$/u.test(item.name))]
  if (binding.ruleId === 'CCD-UI-025') nodes = model.scriptNodes.filter(item => /(?:sidebarWidth|headerHeight|controlHeight|layoutWidth)/u.test(item.name) && /=\s*\d+/u.test(item.text))
  if (binding.ruleId === 'CCD-UI-026') nodes = model.elements.filter(item => /^(?:Sidebar|TopMenu|Header|Aside)$/u.test(item.tag) && item.classes.some(value => /(?:^|\s)(?:hidden|block|flex|grid)\b|(?:sm|md|lg|xl):/u.test(value)))
  if (binding.ruleId === 'CCD-UI-027') nodes = model.calls.filter(item => /(?:useWindowSize|useMediaQuery|matchMedia)$/u.test(item.name))
  return deepFreeze(nodes.map(node => finding(binding, model, node, binding.fingerprintKind ?? 'responsive-owner-reference', node.name ?? node.tag ?? node.text, 'central-responsive-owner-required')))
}
