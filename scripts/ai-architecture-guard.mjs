import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import fg from 'fast-glob'
import ts from 'typescript'

const cwd = process.cwd()

const businessViewPatterns = ['src/views/**/*.vue']
const businessViewIgnore = [
  'src/views/example/**',
  'src/views/login/**',
  'src/views/notfound/**',
  'src/views/**/components/**',
]

const readText = rel => fs.readFileSync(path.join(cwd, rel), 'utf8')
const normalizePath = rel => rel.split(path.sep).join(path.posix.sep)

const findings = []

const fail = (ruleId, relPath, message) => {
  findings.push({ ruleId, relPath: normalizePath(relPath), message })
}

const scanFiles = patterns =>
  fg.sync(patterns, {
    cwd,
    onlyFiles: true,
    dot: false,
    unique: true,
  })
const businessViews = fg.sync(businessViewPatterns, {
  cwd,
  onlyFiles: true,
  dot: false,
  unique: true,
  ignore: businessViewIgnore,
})

for (const relPath of businessViews) {
  const content = readText(relPath)
  if (!/defineOptions\s*\(\s*\{\s*name\s*:/.test(content)) {
    fail('view-name', relPath, 'business views must declare defineOptions({ name: ... })')
  }
  if (/from\s+['"]@\/api\//.test(content)) {
    fail('view-api-import', relPath, 'business views must not import from @/api; move data flow into hooks/modules')
  }
  if (/router\.(push|replace|addRoute|removeRoute)\s*\(/.test(content)) {
    fail('view-router-direct', relPath, 'business views must not call router.push/replace/addRoute/removeRoute directly')
  }
  if (/\b(fetch|axios|XMLHttpRequest)\b/.test(content)) {
    fail('view-raw-network', relPath, 'business views must not use raw fetch/axios/XMLHttpRequest')
  }
  if (/<form\b/i.test(content)) {
    fail('view-native-form', relPath, 'business views must not use native <form>; use <ProForm>')
  }
  if (/defineStore\s*\(/.test(content)) {
    fail('view-store-definition', relPath, 'business views must not define stores inline')
  }
  if (/(interface|type)\s+\w+(DTO|Req|Res)\b/.test(content)) {
    fail('view-dto-definition', relPath, 'DTO/Req/Res contracts must not be defined inside business views')
  }
}

const storeFiles = scanFiles(['src/stores/**/*.{ts,tsx}'])
for (const relPath of storeFiles) {
  const content = readText(relPath)
  const sourceFile = ts.createSourceFile(relPath, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement)) continue
    const moduleText = statement.moduleSpecifier.getText(sourceFile).slice(1, -1)
    const isTypeOnly = Boolean(statement.importClause?.isTypeOnly)
    if (isTypeOnly) continue

    if (moduleText === 'vue-router') {
      fail('store-router-import', relPath, 'stores must not import vue-router at runtime')
    }
    if (moduleText.startsWith('@/api/')) {
      fail('store-api-import', relPath, 'stores must not import @/api directly')
    }
  }
}

const routerModuleFiles = scanFiles(['src/router/modules/**/*.ts'])
for (const relPath of routerModuleFiles) {
  const sourceText = readText(relPath)
  if (/import\s+.+\s+from\s+['"]@\/views\//.test(sourceText)) {
    fail('route-sync-view-import', relPath, 'route modules must not synchronously import @/views components')
  }

  const sourceFile = ts.createSourceFile(relPath, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  const viewImportBindings = new Set()

  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement)) continue
    const moduleText = statement.moduleSpecifier.getText(sourceFile).slice(1, -1)
    if (!moduleText.startsWith('@/views/')) continue
    const clause = statement.importClause
    if (!clause) continue
    if (clause.name) viewImportBindings.add(clause.name.text)
    const namedBindings = clause.namedBindings
    if (namedBindings && ts.isNamedImports(namedBindings)) {
      for (const element of namedBindings.elements) {
        viewImportBindings.add(element.name.text)
      }
    }
  }

  const visit = node => {
    if (ts.isObjectLiteralExpression(node) && isRouteLikeObject(node, sourceFile)) {
      validateRouteObject(node, sourceFile, relPath, viewImportBindings)
    }
    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
}

function isRouteLikeObject(node, sourceFile) {
  return node.properties.some(property => {
    if (!ts.isPropertyAssignment(property)) return false
    return getPropertyName(property.name, sourceFile) === 'path'
  })
}

function validateRouteObject(node, sourceFile, relPath, viewImportBindings) {
  const props = new Map()
  for (const property of node.properties) {
    if (!ts.isPropertyAssignment(property)) continue
    props.set(getPropertyName(property.name, sourceFile), property.initializer)
  }

  if (!props.has('name')) {
    fail('route-name', relPath, `route at ${getRoutePath(props.get('path'), sourceFile)} is missing name`)
  }

  const meta = props.get('meta')
  if (!meta || !ts.isObjectLiteralExpression(meta)) {
    fail('route-meta', relPath, `route at ${getRoutePath(props.get('path'), sourceFile)} is missing an object-literal meta block`)
  } else {
    const metaKeys = new Set(
      meta.properties
        .filter(ts.isPropertyAssignment)
        .map(property => getPropertyName(property.name, sourceFile))
    )
    if (!metaKeys.has('titleKey') && !metaKeys.has('title')) {
      fail('route-meta-title', relPath, `route at ${getRoutePath(props.get('path'), sourceFile)} must define meta.titleKey or meta.title`)
    }
  }

  const component = props.get('component')
  if (!component) return

  if (ts.isCallExpression(component) && component.expression.kind === ts.SyntaxKind.ImportKeyword) {
    fail('route-component-loader', relPath, `route at ${getRoutePath(props.get('path'), sourceFile)} must wrap import() in an arrow function`)
    return
  }

  if (ts.isIdentifier(component) && viewImportBindings.has(component.text)) {
    fail('route-component-sync-identifier', relPath, `route at ${getRoutePath(props.get('path'), sourceFile)} must not reference synchronously imported view bindings`)
    return
  }

  if (!ts.isArrowFunction(component)) return

  const importCall = extractImportCall(component.body)
  if (!importCall) {
    fail('route-component-arrow', relPath, `route at ${getRoutePath(props.get('path'), sourceFile)} must resolve the component through () => import('...')`)
    return
  }

  const [firstArg] = importCall.arguments
  if (!firstArg || !ts.isStringLiteral(firstArg)) {
    fail('route-component-path', relPath, `route at ${getRoutePath(props.get('path'), sourceFile)} must use a static import path`)
    return
  }

  const target = firstArg.text
  if (!target.startsWith('@/views/')) return

  const absTarget = path.join(cwd, target.replace(/^@\//, 'src/'))
  if (!fs.existsSync(absTarget)) {
    fail('route-component-target', relPath, `route at ${getRoutePath(props.get('path'), sourceFile)} points to a missing view: ${target}`)
  }
}

function extractImportCall(body) {
  if (ts.isCallExpression(body) && body.expression.kind === ts.SyntaxKind.ImportKeyword) {
    return body
  }
  if (!ts.isBlock(body)) return null
  for (const statement of body.statements) {
    if (!ts.isReturnStatement(statement) || !statement.expression) continue
    if (ts.isCallExpression(statement.expression) && statement.expression.expression.kind === ts.SyntaxKind.ImportKeyword) {
      return statement.expression
    }
  }
  return null
}

function getPropertyName(nameNode, sourceFile) {
  if (ts.isIdentifier(nameNode) || ts.isStringLiteral(nameNode) || ts.isNumericLiteral(nameNode)) {
    return nameNode.text
  }
  return nameNode.getText(sourceFile)
}

function getRoutePath(pathNode, sourceFile) {
  if (!pathNode) return '<unknown>'
  if (ts.isStringLiteral(pathNode) || ts.isNoSubstitutionTemplateLiteral(pathNode)) return pathNode.text
  return pathNode.getText(sourceFile)
}

if (findings.length === 0) {
  console.log('AI architecture guard')
  console.log('====================')
  console.log('[OK] no actionable architecture violations detected in guarded surfaces')
  process.exit(0)
}

console.log('AI architecture guard')
console.log('====================')
for (const finding of findings.sort((a, b) => {
  if (a.relPath === b.relPath) return a.ruleId.localeCompare(b.ruleId)
  return a.relPath.localeCompare(b.relPath)
})) {
  console.log(`[FAIL] ${finding.ruleId}: ${finding.relPath}`)
  console.log(`  - ${finding.message}`)
}
process.exit(1)
