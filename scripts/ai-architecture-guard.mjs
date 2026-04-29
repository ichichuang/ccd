import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { spawnSync } from 'node:child_process'
import fg from 'fast-glob'
import ts from 'typescript'

const cwd = process.cwd()
const outputFormat = process.argv.includes('--format=json') ? 'json' : 'text'
const stagedOnly = process.argv.includes('--staged')
const outputLogPath = path.join(cwd, '.ai', 'runtime', 'architecture-guard-report.json')
const cliFileArgs = process.argv
  .slice(2)
  .filter(arg => !arg.startsWith('--'))
  .map(arg => path.relative(cwd, path.resolve(cwd, arg)).split(path.sep).join(path.posix.sep))

const businessViewPatterns = ['src/views/**/*.vue']
const businessViewIgnore = [
  'src/views/example/**',
  'src/views/login/**',
  'src/views/notfound/**',
  'src/views/**/components/**',
]

const normalizePath = rel => rel.split(path.sep).join(path.posix.sep)
const readText = rel => fs.readFileSync(path.join(cwd, rel), 'utf8')

const readGitStagedFiles = () => {
  const result = spawnSync('git', ['diff', '--name-only', '--cached', '--diff-filter=ACMR'], {
    cwd,
    encoding: 'utf8',
    stdio: 'pipe',
  })

  if (result.status !== 0) {
    return []
  }

  return result.stdout
    .split('\n')
    .map(line => normalizePath(line.trim()))
    .filter(Boolean)
}

const scanScope = stagedOnly ? new Set(cliFileArgs.length > 0 ? cliFileArgs : readGitStagedFiles()) : null
const shouldScanFile = relPath => !scanScope || scanScope.has(normalizePath(relPath))

const findings = []

const fail = (ruleId, relPath, message) => {
  findings.push({ ruleId, relPath: normalizePath(relPath), message })
}

const scanFiles = (patterns, options = {}) =>
  fg.sync(patterns, {
    cwd,
    onlyFiles: true,
    dot: false,
    unique: true,
    ...options,
  }).filter(shouldScanFile)
const businessViews = scanFiles(businessViewPatterns, {
  ignore: businessViewIgnore,
})

const shouldRunSingletonCheck = relPath => {
  if (!stagedOnly) return true
  return shouldScanFile(relPath)
}

const readTextIfExists = relPath => {
  const absPath = path.join(cwd, relPath)
  return fs.existsSync(absPath) ? readText(relPath) : ''
}

const approvedRawNetworkFiles = new Set([
  'src/utils/http/methods.ts',
  'src/utils/http/interceptors.ts',
  'src/utils/http/connection.ts',
  'src/utils/date/timezone.ts',
])

const approvedRawStorageFiles = new Set([
  'src/main.ts',
  'src/hooks/modules/useThemeSwitch.ts',
  'src/stores/modules/session/permission.ts',
  'src/stores/modules/session/user.ts',
  'src/stores/modules/system/layout.ts',
  'src/stores/modules/system/size.ts',
  'src/utils/theme/engine.ts',
  'src/utils/theme/sizeEngine.ts',
  'src/utils/runtime/e2e.ts',
])

const rawStorageInfraPatterns = [
  'src/utils/safeStorage/**',
  'src/components/ProForm/engine/persistence/**',
  'src/stores/modules/system/theme.ts',
  'src/stores/modules/system/locale.ts',
]

const isGlobAllowed = (relPath, patterns) =>
  patterns.some(pattern => {
    if (pattern.endsWith('/**')) {
      return relPath.startsWith(pattern.slice(0, -3))
    }
    return relPath === pattern
  })

const hasHardcodedColor = content =>
  /#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/.test(content) ||
  /\b(?:text|bg|border|ring|from|via|to|decoration|accent|outline|divide|placeholder|caret)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black)(?:-|\/|\b)/.test(content)

const stripJsComments = content =>
  content.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')

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
  if (/\b(localStorage|sessionStorage)\b/.test(content)) {
    fail('view-raw-storage', relPath, 'business views must not use raw localStorage/sessionStorage')
  }
  if (hasHardcodedColor(content)) {
    fail('view-hardcoded-color', relPath, 'business views must use semantic design tokens instead of hardcoded colors/raw palette classes')
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

const networkBoundaryFiles = scanFiles(['src/api/**/*.{ts,tsx}', 'src/hooks/**/*.{ts,tsx}', 'src/stores/**/*.{ts,tsx}'])
for (const relPath of networkBoundaryFiles) {
  if (approvedRawNetworkFiles.has(relPath)) continue
  const content = stripJsComments(readText(relPath))
  if (/\b(fetch|axios|XMLHttpRequest)\b/.test(content)) {
    fail('raw-network', relPath, 'raw network clients are only allowed in approved HTTP/runtime infrastructure')
  }
}

const storageBoundaryFiles = scanFiles(['src/views/**/*.{vue,ts,tsx}', 'src/hooks/**/*.{ts,tsx}', 'src/stores/**/*.{ts,tsx}', 'src/components/**/*.{vue,ts,tsx}'])
for (const relPath of storageBoundaryFiles) {
  if (/\.(spec|test)\.ts$/.test(relPath)) continue
  if (approvedRawStorageFiles.has(relPath)) continue
  if (isGlobAllowed(relPath, rawStorageInfraPatterns)) continue
  if (relPath.includes('/example/')) continue
  const content = stripJsComments(readText(relPath))
  if (/\b(localStorage|sessionStorage)\b/.test(content)) {
    fail('raw-storage', relPath, 'raw browser storage is only allowed in safeStorage/runtime bootstrap exceptions')
  }
}

const layoutStorePath = 'src/stores/modules/system/layout.ts'
const layoutStore = shouldRunSingletonCheck(layoutStorePath) ? readTextIfExists(layoutStorePath) : ''
if (
  layoutStore &&
  /persist\s*:\s*\{[\s\S]*?key:\s*`[^`]*-layout`[\s\S]*?\}/.test(layoutStore) &&
  !layoutStore.includes('serializer: createPiniaEncryptedSerializer()')
) {
  fail('store-persist-serializer', layoutStorePath, 'useLayoutStore persistence must use createPiniaEncryptedSerializer()')
}

const sizeStorePath = 'src/stores/modules/system/size.ts'
const sizeStore = shouldRunSingletonCheck(sizeStorePath) ? readTextIfExists(sizeStorePath) : ''
if (
  sizeStore &&
  /persist\s*:\s*\{[\s\S]*?SIZE_PERSIST_KEY[\s\S]*?\}/.test(sizeStore) &&
  !sizeStore.includes('serializer: createPiniaEncryptedSerializer()')
) {
  fail('store-persist-serializer', sizeStorePath, 'useSizeStore persistence must use createPiniaEncryptedSerializer()')
}

const eslintConfigPath = 'eslint.config.ts'
const eslintConfig = shouldRunSingletonCheck(eslintConfigPath) ? readTextIfExists(eslintConfigPath) : ''
if (eslintConfig) {
  for (const removedAnyOverride of [
    'src/hooks/modules/useHttpRequest.ts',
    'src/locales/**/*.ts',
    'src/plugins/**/*.ts',
  ]) {
    if (eslintConfig.includes(`'${removedAnyOverride}'`) || eslintConfig.includes(`"${removedAnyOverride}"`)) {
      fail('any-exemption-drift', eslintConfigPath, `${removedAnyOverride} must not return to no-explicit-any override list`)
    }
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

const sortedFindings = findings.sort((a, b) => {
  if (a.relPath === b.relPath) return a.ruleId.localeCompare(b.ruleId)
  return a.relPath.localeCompare(b.relPath)
})

const report = {
  ok: sortedFindings.length === 0,
  mode: stagedOnly ? 'staged' : 'full',
  scannedFiles: scanScope ? [...scanScope].sort() : null,
  findings: sortedFindings,
}

fs.mkdirSync(path.dirname(outputLogPath), { recursive: true })
fs.writeFileSync(outputLogPath, `${JSON.stringify(report, null, 2)}\n`)

if (outputFormat === 'json') {
  console.log(JSON.stringify(report, null, 2))
  process.exit(sortedFindings.length === 0 ? 0 : 1)
}

if (sortedFindings.length === 0) {
  console.log('AI architecture guard')
  console.log('====================')
  console.log('[OK] no actionable architecture violations detected in guarded surfaces')
  console.log(`[LOG] ${path.relative(cwd, outputLogPath)}`)
  process.exit(0)
}

console.log('AI architecture guard')
console.log('====================')
for (const finding of sortedFindings) {
  console.log(`[FAIL] ${finding.ruleId}: ${finding.relPath}`)
  console.log(`  - ${finding.message}`)
}
console.log(`[LOG] ${path.relative(cwd, outputLogPath)}`)
process.exit(1)
