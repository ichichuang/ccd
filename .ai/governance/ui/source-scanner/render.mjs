import { canonicalJson, deepFreeze, fail } from './contracts.mjs'

export function buildResult({ snapshot, diagnostics, performance, baseline = null }) {
  const byRule = {}
  for (const diagnostic of diagnostics) byRule[diagnostic.ruleId] = (byRule[diagnostic.ruleId] ?? 0) + 1
  return deepFreeze({ schemaVersion: 'ccd-ui-source-result/v1', scannerVersion: '1.0.0', repository: snapshot.repository, commit: snapshot.commit, mode: snapshot.mode, fileCount: snapshot.files.length, findingCount: diagnostics.length, parserErrorCount: 0, findingsByRule: byRule, diagnostics, baseline, performance })
}

export function renderJson(result) {
  return canonicalJson(result)
}

export function renderText(result) {
  const lines = [`CCD UI source scan ${result.scannerVersion}`, `mode=${result.mode} commit=${result.commit}`, `files=${result.fileCount} findings=${result.findingCount} parserErrors=${result.parserErrorCount}`]
  for (const diagnostic of result.diagnostics) lines.push(`${diagnostic.path}:${diagnostic.line}:${diagnostic.column} ${diagnostic.ruleId} ${diagnostic.detectorId} ${diagnostic.message} [${diagnostic.id}]`)
  return `${lines.join('\n')}\n`
}

export function assertRenderParity(result) {
  const parsed = JSON.parse(renderJson(result))
  if (canonicalJson(parsed.diagnostics) !== canonicalJson(result.diagnostics)) fail('RENDER_PARITY', 'text/JSON result sources diverged')
  return true
}
