import { deepFreeze, fail } from './contracts.mjs'
import { resolveOwnerContexts } from './owners.mjs'
import { detectAccessibility } from './detectors/accessibility.mjs'
import { detectEchartsOwnership, detectFeedbackAbstraction, detectNativeControls, detectPrimeVueComponentPriority } from './detectors/component-ownership.mjs'
import { detectLayoutScroll } from './detectors/layout-scroll.mjs'
import { detectMaterialZIndex } from './detectors/material-zindex.mjs'
import { detectMotionLifecycle } from './detectors/motion-lifecycle.mjs'
import { NON_SOURCE_DETECTORS } from './detectors/non-source.mjs'
import { detectDeepSelectorException, detectPassThroughConflict } from './detectors/primevue-customization.mjs'
import { detectResponsiveOwnership } from './detectors/responsive-ownership.mjs'
import { detectTokenLiterals } from './detectors/token-literals.mjs'

const IMPLEMENTATIONS = deepFreeze({
  AccessibilityReviewer: detectAccessibility,
  DeepSelectorExceptionScanner: detectDeepSelectorException,
  EchartsOwnershipScanner: detectEchartsOwnership,
  FeedbackAbstractionScanner: detectFeedbackAbstraction,
  LayoutScrollScanner: detectLayoutScroll,
  MaterialZIndexScanner: detectMaterialZIndex,
  MotionLifecycleScanner: detectMotionLifecycle,
  NativeControlScanner: detectNativeControls,
  PassThroughConflictScanner: detectPassThroughConflict,
  PrimeVueComponentPriorityScanner: detectPrimeVueComponentPriority,
  ResponsiveOwnershipScanner: detectResponsiveOwnership,
  TokenLiteralScanner: detectTokenLiterals,
})

export function createDetectorRegistry(authority) {
  const entries = new Map()
  for (const descriptor of authority.manifest.detectors) {
    if (entries.has(descriptor.id)) fail('DETECTOR_DUPLICATE', `duplicate detector ${descriptor.id}`)
    const implementation = IMPLEMENTATIONS[descriptor.id] ?? null
    if (descriptor.executable !== Boolean(implementation)) fail('DETECTOR_INACTIVE_EXECUTION', `detector executable state mismatch: ${descriptor.id}`)
    entries.set(descriptor.id, deepFreeze({ descriptor, implementation }))
  }
  for (const descriptor of NON_SOURCE_DETECTORS) {
    if (!entries.has(descriptor.id)) fail('DETECTOR_UNKNOWN', `non-source detector missing from manifest: ${descriptor.id}`)
  }
  return deepFreeze({ entries })
}

export function runDetectors({ authority, models, ruleIds = null }) {
  const registry = createDetectorRegistry(authority)
  const selected = ruleIds ? new Set(ruleIds) : null
  const findings = []
  for (const binding of authority.bindings) {
    if (selected && !selected.has(binding.ruleId)) continue
    if (!binding.scannerCategory.startsWith('source-enforceable')) continue
    const entry = registry.entries.get(binding.detectorId)
    if (!entry?.implementation) fail('DETECTOR_INACTIVE_EXECUTION', `source binding attempted inactive detector ${binding.detectorId}`)
    for (const model of models) {
      if (!binding.languages.includes(model.language) || !binding.scopeIds.includes(model.scopeId)) continue
      const raw = entry.implementation({ model, binding, authority, ownerMatches: [] })
      if (!Array.isArray(raw)) fail('DETECTOR_RESULT_INVALID', `${binding.detectorId} did not return an array`)
      for (const finding of raw) {
        if (finding.ruleId !== binding.ruleId || finding.detectorId !== binding.detectorId || finding.path !== model.path) fail('DETECTOR_RESULT_INVALID', `${binding.detectorId} returned an invalid finding`)
        const owner = resolveOwnerContexts({ model, authority, ruleId: binding.ruleId, evidenceKind: finding.evidence.kind, ownerKey: finding.ownerKey, offset: finding.location ? model.sourceText.split('\n').slice(0, finding.location.line - 1).join('\n').length + finding.location.column - 1 : 0 })
        if (!owner.match) findings.push(deepFreeze({ ...finding, ownerContext: null, ownerKey: `file:${model.path}` }))
      }
    }
  }
  return deepFreeze(findings)
}

export function explainRule(authority, ruleId) {
  const binding = authority.bindingByRuleId[ruleId]
  if (!binding) fail('DETECTOR_UNKNOWN', `unknown rule ${ruleId}`)
  const detector = authority.detectorById[binding.detectorId]
  return deepFreeze({ binding, detector, owners: authority.manifest.ownerContexts.filter(context => binding.ownerContextIds.includes(context.id)), fixtureIds: binding.fixtureIds })
}
