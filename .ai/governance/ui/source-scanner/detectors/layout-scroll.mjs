import { deepFreeze, makeRawFinding } from '../contracts.mjs'

function root(model) {
  return model.elements.find(element => element.parentIndex === null) ?? null
}

function finding(binding, model, node, subject, predicate, kind = null) {
  return makeRawFinding(binding, model, node, { kind: kind ?? binding.fingerprintKind ?? 'layout-structure', subject, predicate, value: null, related: [] })
}

export function detectLayoutScroll({ model, binding }) {
  const results = []
  const viewRoot = root(model)
  if (binding.ruleId === 'CCD-UI-028') {
    for (const node of model.elements.filter(element => element.tag !== 'CScrollbar' && element.classes.some(value => /(?:^|\s)overflow-(?:auto|scroll)(?:\s|$)/u.test(value)))) results.push(finding(binding, model, node, node.tag, 'scroll-owner-missing'))
  }
  if (binding.ruleId === 'CCD-UI-029' && viewRoot && viewRoot.classes.some(value => /(?:^|\s)bg-(?!transparent)[\w/-]+/u.test(value))) results.push(finding(binding, model, viewRoot, viewRoot.tag, 'view-root-surface-forbidden'))
  if (binding.ruleId === 'CCD-UI-030' && viewRoot && viewRoot.classes.some(value => /(?:material|surface|glass|bg-(?!transparent))/u.test(value))) results.push(finding(binding, model, viewRoot, viewRoot.tag, 'material-on-view-root'))
  if (binding.ruleId === 'CCD-UI-031' && viewRoot && viewRoot.classes.includes('col-fill')) results.push(finding(binding, model, viewRoot, viewRoot.tag, 'flowing-page-col-fill'))
  if (binding.ruleId === 'CCD-UI-032' && viewRoot && viewRoot.classes.includes('col-fill') && !viewRoot.attributes.some(attribute => attribute.name === 'data-scroll-owner') && !model.elements.some(element => element.tag === 'CScrollbar')) results.push(finding(binding, model, viewRoot, viewRoot.tag, 'view-scroll-takeover-unbounded'))
  if (binding.ruleId === 'CCD-UI-033') {
    for (const atRule of model.atRules.filter(item => item.name === 'media')) {
      const governed = model.selectors.find(selector => /\.(?:top-menu|sidebar|app-header|app-aside)\b/u.test(selector.selector))
      const declaration = model.declarations.find(item => ['display', 'visibility'].includes(item.property) && /^(?:none|hidden)$/u.test(item.value))
      if (governed && declaration) results.push(finding(binding, model, governed, governed.selector, 'shell-visibility-owned-by-css', 'media-visibility'))
    }
  }
  if (binding.ruleId === 'CCD-UI-034') for (const node of model.declarations.filter(item => /env\(safe-area-inset-/u.test(item.value))) results.push(finding(binding, model, node, `${node.property}:${node.value}`, 'central-safe-area-variable-required', 'safe-area-declaration'))
  return deepFreeze(results)
}
