import path from 'node:path'
import { deepFreeze, fail, positionFromOffsets } from './contracts.mjs'
import { parseCssRegion, parseScssRegion } from './parse-style.mjs'
import { parseTypeScriptRegion } from './parse-typescript.mjs'
import { parseVueFile } from './parse-vue.mjs'

function relocate(node, sourceText, filePath) {
  if (!node || typeof node !== 'object' || !Number.isInteger(node.startOffset)) return node
  const ownerKey = node.ownerKey?.startsWith('file:') ? `file:${filePath}` : node.ownerKey
  return deepFreeze({ ...node, ownerKey, location: positionFromOffsets(sourceText, node.startOffset, node.endOffset) })
}

function arraysFromScripts(scripts, key, sourceText, filePath) {
  return scripts.flatMap(script => script[key] ?? []).map(node => relocate(node, sourceText, filePath))
}

function buildNormalized(file, parsed) {
  const scripts = parsed.parser === 'vue-sfc' ? parsed.scripts : ['typescript', 'tsx'].includes(parsed.parser) ? [parsed] : []
  const styleRegions = parsed.parser === 'vue-sfc' ? parsed.styles : ['postcss-css', 'sass-postcss-scss'].includes(parsed.parser) ? [parsed] : []
  const templateElements = parsed.parser === 'vue-sfc' ? parsed.template.elements : []
  const jsxElements = arraysFromScripts(scripts, 'jsxElements', file.content, file.path)
  const elements = [
    ...templateElements.map(node => relocate(node, file.content, file.path)),
    ...jsxElements.map(node => deepFreeze({ ...node, kind: 'element', classes: (node.attributes ?? []).filter(attribute => attribute.name === 'class' || attribute.name === 'className').flatMap(attribute => String(attribute.value ?? '').replace(/^['"{]|['"}]$/gu, '').split(/\s+/u).filter(Boolean)), parentIndex: null })),
  ]
  const styles = styleRegions.map(region => deepFreeze({
    ...region,
    selectors: region.selectors.map(node => relocate(node, file.content, file.path)),
    declarations: region.declarations.map(node => relocate(node, file.content, file.path)),
    atRules: region.atRules.map(node => relocate(node, file.content, file.path)),
    deepSelectors: region.deepSelectors.map(node => relocate(node, file.content, file.path)),
    mediaRules: region.mediaRules.map(node => relocate(node, file.content, file.path)),
  }))
  const componentName = path.posix.basename(file.path).replace(/\.[^.]+$/u, '')
  const ownerSymbols = [
    deepFreeze({ kind: 'component', name: componentName, ownerKey: `symbol:${componentName}`, startOffset: 0, endOffset: Math.max(1, file.content.length), location: positionFromOffsets(file.content, 0, Math.max(1, file.content.length)) }),
    ...arraysFromScripts(scripts, 'ownerSymbols', file.content, file.path),
  ]
  const imports = arraysFromScripts(scripts, 'imports', file.content, file.path)
  const model = {
    schemaVersion: 'ccd-ui-source-model/v1',
    path: file.path,
    scopeId: file.scopeId,
    language: file.language,
    sourceMode: file.sourceMode,
    blobId: file.blobId,
    contentDigest: file.contentDigest,
    parser: parsed.parser,
    sourceText: file.content,
    regions: parsed.parser === 'vue-sfc' ? ['template', ...scripts.map(() => 'script'), ...styles.map(() => 'style')] : [file.language],
    imports,
    moduleSpecifiers: scripts.flatMap(script => script.moduleSpecifiers ?? []),
    components: elements.map(element => element.tag),
    directives: elements.flatMap(element => element.attributes ?? []).filter(attribute => attribute.directive),
    bindings: elements.flatMap(element => element.attributes ?? []),
    classes: elements.flatMap(element => element.classes ?? []),
    elements,
    scriptNodes: arraysFromScripts(scripts, 'scriptNodes', file.content, file.path),
    calls: arraysFromScripts(scripts, 'calls', file.content, file.path),
    newExpressions: arraysFromScripts(scripts, 'newExpressions', file.content, file.path),
    propertyAccess: arraysFromScripts(scripts, 'propertyAccess', file.content, file.path),
    objectLiterals: arraysFromScripts(scripts, 'objectLiterals', file.content, file.path),
    literals: arraysFromScripts(scripts, 'literals', file.content, file.path),
    jsxElements,
    styles,
    selectors: styles.flatMap(style => style.selectors),
    declarations: styles.flatMap(style => style.declarations),
    atRules: styles.flatMap(style => style.atRules),
    ownerSymbols,
    listenerAdds: arraysFromScripts(scripts, 'listenerAdds', file.content, file.path),
    listenerRemoves: arraysFromScripts(scripts, 'listenerRemoves', file.content, file.path),
    lifecycle: arraysFromScripts(scripts, 'lifecycle', file.content, file.path),
    lexicalEvidence: [...scripts.flatMap(script => script.literals ?? []).map(item => item.value), ...elements.flatMap(element => element.classes ?? []), ...styles.flatMap(style => style.declarations.map(declaration => declaration.value))],
    parserDiagnostics: [],
  }
  return deepFreeze(model)
}

function parseSourceFile(file, snapshot) {
  let parsed
  if (file.language === 'vue') parsed = parseVueFile(file, snapshot)
  else if (file.language === 'ts' || file.language === 'tsx') parsed = parseTypeScriptRegion({ path: file.path, text: file.content, language: file.language })
  else if (file.language === 'css') parsed = parseCssRegion({ path: file.path, text: file.content })
  else if (file.language === 'scss') parsed = parseScssRegion({ path: file.path, text: file.content, snapshot })
  else fail('SOURCE_MODEL_LOCATION', `unsupported governed language ${file.language}`)
  return parsed
}

export function buildSourceModel(file, authority, snapshot) {
  return buildNormalized(file, parseSourceFile(file, snapshot), authority)
}

export function buildSourceModels(snapshot, authority) {
  const cache = new Map()
  const models = []
  for (const file of snapshot.files) {
    const key = `${file.language}\0${file.contentDigest}`
    let parsed = cache.get(key)
    if (!parsed) {
      parsed = parseSourceFile(file, snapshot)
      cache.set(key, parsed)
    }
    models.push(buildNormalized(file, parsed, authority))
  }
  if (new Set(models.map(model => model.path)).size !== models.length) fail('SOURCE_MODEL_DUPLICATE', 'source models must have unique paths')
  return deepFreeze({ models, uniqueBlobCount: cache.size, fileCount: models.length })
}
