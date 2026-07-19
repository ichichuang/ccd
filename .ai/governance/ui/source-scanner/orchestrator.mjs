import fs from 'node:fs'
import path from 'node:path'
import { performance } from 'node:perf_hooks'
import { loadAuthority } from './authority.mjs'
import { aggregateBaseline, compareBaseline, loadBaseline, validateBaseline } from './baseline.mjs'
import { deepFreeze, fail } from './contracts.mjs'
import { runDetectors } from './detector-registry.mjs'
import { finalizeDiagnostics } from './diagnostics.mjs'
import { applyExceptions } from './exceptions.mjs'
import { acquireSourceSnapshot } from './git-source.mjs'
import { buildResult } from './render.mjs'
import { compileScopeRegistry, validateScopeInventory } from './scope.mjs'
import { buildSourceModels } from './source-model.mjs'

export function scanUiSource(request) {
  const started = performance.now()
  const repoRoot = request.repoRoot
  const authority = request.authority ?? loadAuthority({ repoRoot, phase: request.phase ?? 'preterminal' })
  const scopeRegistry = compileScopeRegistry(authority.manifest.scopes, authority.manifest.exclusions)
  const snapshot = acquireSourceSnapshot({
    repoRoot,
    mode: request.mode ?? 'default',
    ref: request.ref,
    base: request.base,
    head: request.head,
    paths: request.paths,
    scopeRegistry,
  })
  const fullAuthorityScan = request.validateInventory !== false && ['default', 'all', 'ref'].includes(snapshot.mode) && (!request.ref || snapshot.commit === authority.manifest.baselineAuthority.commit)
  const inventory = validateScopeInventory(scopeRegistry, snapshot.files, fullAuthorityScan ? authority.manifest.inventory : null)
  const built = buildSourceModels(snapshot, authority)
  const rawFindings = runDetectors({ authority, models: built.models, ruleIds: request.ruleIds ?? null })
  let diagnostics = finalizeDiagnostics(rawFindings)
  diagnostics = applyExceptions({ registry: request.exceptionRegistry ?? authority.exceptions, authority, snapshot, diagnostics, now: request.now ?? new Date() })

  const canonicalPath = path.resolve(authority.repoRoot, authority.manifest.authority.baseline)
  let baseline = null
  if (request.checkBaseline || (!request.noBaseline && fs.existsSync(canonicalPath))) {
    baseline = loadBaseline(canonicalPath)
    validateBaseline(baseline, authority)
    const current = aggregateBaseline(diagnostics, authority, snapshot)
    compareBaseline(baseline, current, { full: ['default', 'all', 'ref'].includes(snapshot.mode) })
  }
  const elapsedMs = performance.now() - started
  const maxRssBytes = process.resourceUsage().maxRSS * 1024
  const budget = snapshot.mode === 'staged' ? authority.manifest.performance.stagedScanMs : authority.manifest.performance.fullScanMs
  if (request.enforcePerformance !== false && elapsedMs > budget) fail('PERFORMANCE_BUDGET', `scan took ${elapsedMs.toFixed(3)}ms; budget is ${budget}ms`)
  if (request.enforcePerformance !== false && maxRssBytes > authority.manifest.performance.maxRssBytes) fail('PERFORMANCE_BUDGET', `scan RSS ${maxRssBytes} exceeds ${authority.manifest.performance.maxRssBytes}`)
  return buildResult({ snapshot, diagnostics, baseline, performance: deepFreeze({ elapsedMs: Number(elapsedMs.toFixed(3)), maxRssBytes, uniqueBlobCount: built.uniqueBlobCount, inventory }) })
}
