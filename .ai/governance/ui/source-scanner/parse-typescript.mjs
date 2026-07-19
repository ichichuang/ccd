import ts from 'typescript'
import { deepFreeze, fail, positionFromOffsets } from './contracts.mjs'

function expressionName(node, sourceFile) {
  if (!node) return ''
  if (ts.isIdentifier(node)) return node.text
  if (ts.isPropertyAccessExpression(node)) return `${expressionName(node.expression, sourceFile)}.${node.name.text}`
  if (ts.isElementAccessExpression(node)) return `${expressionName(node.expression, sourceFile)}[${node.argumentExpression?.getText(sourceFile) ?? ''}]`
  if (ts.isCallExpression(node)) return expressionName(node.expression, sourceFile)
  if (ts.isNewExpression(node)) return expressionName(node.expression, sourceFile)
  return node.getText(sourceFile).slice(0, 160)
}

function nodeRecord(node, sourceFile, baseOffset, ownerKey, extra = {}) {
  const startOffset = baseOffset + node.getStart(sourceFile)
  const endOffset = baseOffset + node.getEnd()
  return deepFreeze({ kind: ts.SyntaxKind[node.kind], startOffset, endOffset, location: positionFromOffsets(sourceFile.text, node.getStart(sourceFile), node.getEnd()), ownerKey, ...extra })
}

export function parseTypeScriptRegion({ path, text, language = 'ts', baseOffset = 0, scriptKind = null }) {
  const kind = scriptKind ?? (language === 'tsx' ? ts.ScriptKind.TSX : ts.ScriptKind.TS)
  const sourceFile = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, false, kind)
  const diagnostics = sourceFile.parseDiagnostics ?? []
  if (diagnostics.length > 0) {
    const diagnostic = diagnostics[0]
    const start = diagnostic.start ?? 0
    const length = Math.max(1, diagnostic.length ?? 1)
    fail(language === 'tsx' ? 'PARSE_TSX' : 'PARSE_TS', `${path}:${positionFromOffsets(text, start, start + length).line}: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`, { path, language, ...positionFromOffsets(text, start, start + length) })
  }

  const model = { imports: [], moduleSpecifiers: [], calls: [], newExpressions: [], propertyAccess: [], objectLiterals: [], literals: [], jsxElements: [], listenerAdds: [], listenerRemoves: [], lifecycle: [], ownerSymbols: [], scriptNodes: [] }

  function visit(node, inheritedOwner = `file:${path}`) {
    let ownerKey = inheritedOwner
    if (ts.isFunctionDeclaration(node) && node.name) ownerKey = `symbol:${node.name.text}`
    else if (ts.isClassDeclaration(node) && node.name) ownerKey = `symbol:${node.name.text}`
    else if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) ownerKey = `symbol:${node.name.text}`
    else if (ts.isMethodDeclaration(node) && node.name) ownerKey = `symbol:${node.name.getText(sourceFile)}`

    if (ownerKey !== inheritedOwner) model.ownerSymbols.push(nodeRecord(node, sourceFile, baseOffset, ownerKey, { name: ownerKey.slice(7) }))
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      model.imports.push(nodeRecord(node, sourceFile, baseOffset, ownerKey, { module: node.moduleSpecifier.text, clause: node.importClause?.getText(sourceFile) ?? '' }))
      model.moduleSpecifiers.push(node.moduleSpecifier.text)
    }
    if (ts.isCallExpression(node)) {
      const name = expressionName(node.expression, sourceFile)
      const record = nodeRecord(node, sourceFile, baseOffset, ownerKey, { name, arguments: node.arguments.map(argument => argument.getText(sourceFile).slice(0, 300)), text: node.getText(sourceFile).slice(0, 500) })
      model.calls.push(record)
      if (/(?:^|\.)addEventListener$/u.test(name)) model.listenerAdds.push(record)
      if (/(?:^|\.)removeEventListener$/u.test(name)) model.listenerRemoves.push(record)
      if (/^(?:onMounted|onBeforeMount|onUnmounted|onBeforeUnmount|onBeforeEnter|onAfterLeave)$/u.test(name)) model.lifecycle.push(record)
    }
    if (ts.isNewExpression(node)) model.newExpressions.push(nodeRecord(node, sourceFile, baseOffset, ownerKey, { name: expressionName(node.expression, sourceFile), text: node.getText(sourceFile).slice(0, 500) }))
    if (ts.isPropertyAccessExpression(node)) model.propertyAccess.push(nodeRecord(node, sourceFile, baseOffset, ownerKey, { name: expressionName(node, sourceFile) }))
    if (ts.isObjectLiteralExpression(node)) model.objectLiterals.push(nodeRecord(node, sourceFile, baseOffset, ownerKey, { text: node.getText(sourceFile).slice(0, 1000), properties: node.properties.map(property => property.name?.getText(sourceFile) ?? '') }))
    if (ts.isStringLiteralLike(node) || ts.isNumericLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) model.literals.push(nodeRecord(node, sourceFile, baseOffset, ownerKey, { value: node.text }))
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
      const opening = ts.isJsxElement(node) ? node.openingElement : node
      model.jsxElements.push(nodeRecord(node, sourceFile, baseOffset, ownerKey, {
        tag: opening.tagName.getText(sourceFile),
        attributes: opening.attributes.properties.map(attribute => ({ name: attribute.name?.getText(sourceFile) ?? '', value: attribute.initializer?.getText(sourceFile) ?? null })),
      }))
    }
    if (ts.isVariableDeclaration(node)) model.scriptNodes.push(nodeRecord(node, sourceFile, baseOffset, ownerKey, { name: node.name.getText(sourceFile), text: node.getText(sourceFile).slice(0, 500) }))
    ts.forEachChild(node, child => visit(child, ownerKey))
  }
  visit(sourceFile)
  for (const key of Object.keys(model)) {
    if (Array.isArray(model[key])) model[key].sort((left, right) => left.startOffset - right.startOffset)
  }
  return deepFreeze({ parser: language === 'tsx' ? 'tsx' : 'typescript', language, sourceText: text, ...model })
}
