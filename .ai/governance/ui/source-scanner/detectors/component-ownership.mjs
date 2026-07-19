import { deepFreeze, makeRawFinding } from '../contracts.mjs'

const NATIVE_CONTROLS = new Set(['button', 'input', 'select', 'textarea', 'table', 'option', 'form'])

function finding(binding, model, node, kind, subject, predicate, value = null) {
  return makeRawFinding(binding, model, node, { kind, subject, predicate, value, related: [] })
}

export function detectPrimeVueComponentPriority({ model, binding }) {
  const results = []
  if (binding.ruleId === 'CCD-UI-001') {
    for (const node of model.elements.filter(element => ['DataTable', 'TreeTable', 'VirtualScroller'].includes(element.tag))) results.push(finding(binding, model, node, 'component-reference', node.tag, 'must-use-project-wrapper'))
  } else if (binding.ruleId === 'CCD-UI-002') {
    for (const node of model.elements.filter(element => NATIVE_CONTROLS.has(element.tag))) results.push(finding(binding, model, node, 'native-element', node.tag, 'outside-structural-allowlist'))
  } else if (binding.ruleId === 'CCD-UI-003') {
    for (const node of model.elements.filter(element => ['button', 'input', 'select', 'textarea', 'table'].includes(element.tag))) results.push(finding(binding, model, node, 'component-reference', node.tag, 'primevue-equivalent-exists'))
  }
  return deepFreeze(results)
}

export function detectNativeControls({ model, binding }) {
  return deepFreeze(model.elements.filter(element => NATIVE_CONTROLS.has(element.tag)).map(node => finding(binding, model, node, 'native-element', node.tag, 'native-control-forbidden')))
}

export function detectEchartsOwnership({ model, binding }) {
  const nodes = [
    ...model.imports.filter(item => ['echarts', 'vue-echarts'].includes(item.module)),
    ...model.calls.filter(item => item.name === 'echarts.init'),
    ...model.elements.filter(item => item.tag === 'VChart'),
  ]
  return deepFreeze(nodes.map(node => finding(binding, model, node, 'runtime-api-reference', node.name ?? node.tag ?? node.module, 'chart-runtime-owner-required')))
}

export function detectFeedbackAbstraction({ model, binding }) {
  let nodes = []
  if (binding.ruleId === 'CCD-UI-006') nodes = model.calls.filter(item => ['alert', 'confirm', 'useToast'].includes(item.name) || item.name.endsWith('.$toast'))
  if (binding.ruleId === 'CCD-UI-007') {
    const constructors = model.newExpressions.filter(item => /ToastService|MessageService/u.test(item.name))
    nodes = constructors.length > 0 ? constructors : model.calls.filter(item => /(?:toast|message|confirmation)Service\.(?:add|show|open)$/iu.test(item.name))
  }
  if (binding.ruleId === 'CCD-UI-008') nodes = model.elements.filter(item => item.tag === 'Dialog')
  return deepFreeze(nodes.map(node => finding(binding, model, node, binding.ruleId === 'CCD-UI-008' ? 'component-reference' : 'feedback-call', node.name ?? node.tag, 'feedback-facade-required')))
}
