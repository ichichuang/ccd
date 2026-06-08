import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { spawnSync } from 'node:child_process'
import fg from 'fast-glob'
import ts from 'typescript'
import { parse as parseVueSfc } from '@vue/compiler-sfc'
import {
  classifyPrimeVueBoundaryReference,
  extractPrimeVueReferences,
} from './architecture/primevue-boundary-policy.mjs'
import { readPolicy } from './governance/policy-utils.mjs'

const cwd = process.cwd()
const aiPolicy = readPolicy('ai')
const outputFormat = process.argv.includes('--format=json') ? 'json' : 'text'
const stagedOnly = process.argv.includes('--staged')
const outputLogPath = path.join(cwd, '.ai', 'runtime', 'architecture-guard-report.json')
const cliFileArgs = process.argv
  .slice(2)
  .filter(arg => !arg.startsWith('--'))
  .map(arg => path.relative(cwd, path.resolve(cwd, arg)).split(path.sep).join(path.posix.sep))

const businessViewPatterns = ['apps/web-demo/src/views/**/*.vue']
const businessViewIgnore = [
  'apps/web-demo/src/views/example/**',
  'apps/web-demo/src/views/login/**',
  'apps/web-demo/src/views/notfound/**',
  'apps/web-demo/src/views/**/components/**',
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
const governedGeneratedCodeFiles = scanFiles(['apps/**/*.{ts,tsx,vue,js,mjs}', 'packages/**/*.{ts,tsx,vue,js,mjs}'], {
  ignore: ['**/dist/**', '**/node_modules/**'],
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
  'apps/web-demo/src/utils/http/methods.ts',
  'apps/web-demo/src/utils/http/interceptors.ts',
  'apps/web-demo/src/utils/http/connection.ts',
  'apps/web-demo/src/utils/date/timezone.ts',
  'apps/web-demo/src/layouts/components/LoadingLottie.vue',
])

const approvedRawStorageFiles = new Set([
  'apps/web-demo/src/main.ts',
  'apps/web-demo/src/hooks/modules/useThemeSwitch.ts',
  'apps/web-demo/src/stores/modules/session/permission.ts',
  'apps/web-demo/src/stores/modules/session/user.ts',
  'apps/web-demo/src/stores/modules/system/layout.ts',
  'apps/web-demo/src/stores/modules/system/size.ts',
  'apps/web-demo/src/utils/theme/engine.ts',
  'apps/web-demo/src/utils/theme/sizeEngine.ts',
  'apps/web-demo/src/utils/runtime/e2e.ts',
])

const rawStorageInfraPatterns = [
  'apps/web-demo/src/utils/safeStorage/**',
  'apps/web-demo/src/components/ProForm/engine/persistence/**',
  'apps/web-demo/src/components/ProTable/engine/hooks/useProTableColumnSettingsStorage.ts',
  'apps/web-demo/src/stores/modules/system/theme.ts',
  'apps/web-demo/src/stores/modules/system/locale.ts',
]

const approvedVueUseStorageFiles = new Set([
  'apps/web-demo/src/components/ProTable/engine/hooks/useProTableColumnSettingsStorage.ts',
])

const approvedGlassBaseFiles = new Set([
  'packages/unocss-preset/src/shortcuts/semanticShortcuts.ts',
])

const approvedRawZIndexFiles = new Set([
  'apps/web-demo/index.html',
  'apps/web-demo/src/assets/styles/custom-nprogress.scss',
  'apps/web-demo/src/assets/styles/theme/transitions.scss',
  'apps/web-demo/src/assets/styles/theme/modes/circle.scss',
  'apps/web-demo/src/assets/styles/theme/modes/curtain.scss',
  'apps/web-demo/src/assets/styles/theme/modes/diamond.scss',
  'apps/web-demo/src/assets/styles/theme/modes/fade.scss',
  'apps/web-demo/src/assets/styles/theme/modes/glitch.scss',
  'apps/web-demo/src/assets/styles/theme/modes/implosion.scss',
])

const approvedDirectTransportFiles = new Set([
  'apps/web-demo/src/sync/runtime.ts',
  'apps/web-demo/src/sync/socket.ts',
  // Route window lifecycle coordination is infrastructure, not state synchronization.
  'apps/web-demo/src/router/utils/helper.ts',
])

const stripJsComments = content =>
  content.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')

const lineForIndex = (content, index) => content.slice(0, Math.max(0, index)).split(/\r?\n/).length

const scriptKindForPath = relPath => (relPath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS)

const createSourceFile = (relPath, content) =>
  ts.createSourceFile(relPath, content, ts.ScriptTarget.Latest, true, scriptKindForPath(relPath))

const parseVueDescriptor = relPath => {
  const content = readText(relPath)
  const result = parseVueSfc(content, {
    filename: relPath,
    sourceMap: false,
  })
  if (result.errors.length > 0) {
    fail('vue-sfc-parse', relPath, `Vue SFC parser reported ${result.errors.length} error(s)`)
  }
  return result.descriptor
}

const getVueScriptSetupContent = relPath => parseVueDescriptor(relPath).scriptSetup?.content ?? ''

const getScriptLikeSources = relPath => {
  if (!relPath.endsWith('.vue')) {
    return [{ relPath, content: readText(relPath), kind: scriptKindForPath(relPath) }]
  }

  const descriptor = parseVueDescriptor(relPath)
  return [descriptor.script, descriptor.scriptSetup]
    .filter(Boolean)
    .map(block => ({
      relPath,
      content: block.content,
      kind: block.lang === 'tsx' ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    }))
}

const hasModifier = (node, kind) => Boolean(ts.getModifiers(node)?.some(modifier => modifier.kind === kind))

const isExportedDeclaration = node => hasModifier(node, ts.SyntaxKind.ExportKeyword)

const getCallExpressionName = node => {
  if (!ts.isCallExpression(node)) return null
  if (ts.isIdentifier(node.expression)) return node.expression.text
  return null
}

const unwrapExpression = node => {
  let current = node
  while (ts.isParenthesizedExpression(current) || ts.isAsExpression(current) || ts.isTypeAssertionExpression(current)) {
    current = current.expression
  }
  return current
}

const isConstAssertion = (node, sourceFile) =>
  ts.isAsExpression(node) && node.type.getText(sourceFile) === 'const'

const isAllowedTypeAssertion = (node, sourceFile) => {
  if (isConstAssertion(node, sourceFile)) return true
  const typeText = node.type.getText(sourceFile)
  const expressionText = node.expression.getText(sourceFile)

  if (/^(?:HTML|SVG|MouseEvent|PointerEvent|KeyboardEvent|InputEvent|Event|Element|Node|Window|Document|ViewTransition)\b/.test(typeText)) {
    return true
  }
  if (/^typeof\s+/.test(typeText)) return true
  if (/\b(?:target|currentTarget|nativeEvent|event|el|element)\b/i.test(expressionText) && /(?:Element|Event|Node|Window|Document)\b/.test(typeText)) {
    return true
  }
  return false
}

const routeAccessFacadePath = 'apps/web-demo/src/router/utils/accessControl.ts'
const routeAccessFacade = shouldRunSingletonCheck(routeAccessFacadePath)
  ? readTextIfExists(routeAccessFacadePath)
  : ''
if (routeAccessFacade) {
  if (!routeAccessFacade.includes("from '@ccd/vue-app-platform'")) {
    fail(
      'route-access-helper-owner',
      routeAccessFacadePath,
      'route access pure helpers must be owned by @ccd/vue-app-platform; app accessControl.ts may only remain as a compatibility facade'
    )
  }

  for (const forbiddenImplementationToken of [
    'function normalizePath',
    'function checkMenuAuths',
    'decodeURIComponent',
  ]) {
    if (routeAccessFacade.includes(forbiddenImplementationToken)) {
      fail(
        'route-access-helper-owner',
        routeAccessFacadePath,
        `app accessControl.ts must not reintroduce route access helper implementation token "${forbiddenImplementationToken}"`
      )
    }
  }
}

for (const responseContractPath of [
  'apps/web-demo/src/types/api.ts',
  'apps/web-demo/src/utils/http/types.ts',
]) {
  const content = shouldRunSingletonCheck(responseContractPath)
    ? stripJsComments(readTextIfExists(responseContractPath))
    : ''
  if (/\b(?:interface|type)\s+ApiResponse\b/.test(content)) {
    fail(
      'api-response-contract-name',
      responseContractPath,
      'ambiguous ApiResponse definitions are forbidden; use BackendApiResponseEnvelope or HttpClientResponseEnvelope'
    )
  }
}

const primeVueBoundaryFiles = scanFiles(['apps/**/*.{ts,tsx,vue,js,mjs}', 'packages/**/*.{ts,tsx,vue,js,mjs}'], {
  ignore: ['**/dist/**', '**/node_modules/**'],
})
for (const relPath of primeVueBoundaryFiles) {
  const rawContent = readText(relPath)
  const content = stripJsComments(rawContent)
  const references = extractPrimeVueReferences(content)
  if (references.length === 0) continue

  for (const reference of references) {
    const classification = classifyPrimeVueBoundaryReference(relPath, rawContent, reference)
    if (!classification.allowed) {
      fail(classification.ruleId, relPath, classification.message)
    }
  }
}

const blockedGeneratedCodePatterns = aiPolicy.blockedGeneratedCodePatterns.map(rule => ({
  ...rule,
  regex: new RegExp(rule.pattern),
}))
const aiAllowedRuntimeAccessPaths = aiPolicy.allowedRuntimeAccessPaths ?? []

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

const VUE_SFC_MACRO_ORDER = [
  'defineOptions',
  'defineProps',
  'defineEmits',
  'defineModel',
  'defineSlots',
]
const VUE_SFC_MACROS = new Set([...VUE_SFC_MACRO_ORDER, 'defineExpose'])
const VUE_SFC_MACRO_RANK = new Map(VUE_SFC_MACRO_ORDER.map((name, index) => [name, index]))

const collectMacroUsages = (statement, sourceFile) => {
  const usages = []
  const visit = node => {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && VUE_SFC_MACROS.has(node.expression.text)) {
      usages.push({
        name: node.expression.text,
        pos: node.getStart(sourceFile),
      })
    }
    ts.forEachChild(node, visit)
  }
  visit(statement)
  return usages
}

const isTypeOnlyTopLevelStatement = statement =>
  ts.isImportDeclaration(statement) ||
  ts.isImportEqualsDeclaration(statement) ||
  ts.isExportDeclaration(statement) ||
  ts.isInterfaceDeclaration(statement) ||
  ts.isTypeAliasDeclaration(statement) ||
  ts.isModuleDeclaration(statement)

const vueSfcMacroFiles = scanFiles(
  ['apps/web-demo/src/**/*.vue', 'apps/desktop/src/**/*.vue', 'packages/**/*.vue'],
  {
    ignore: ['**/dist/**', '**/node_modules/**'],
  }
)

for (const relPath of vueSfcMacroFiles) {
  const scriptSetup = getVueScriptSetupContent(relPath)
  if (!scriptSetup.trim()) continue

  const sourceFile = createSourceFile(relPath, scriptSetup)
  const macroUsages = []
  let businessLogicSeen = false

  sourceFile.statements.forEach((statement, statementIndex) => {
    const usages = collectMacroUsages(statement, sourceFile)
    if (usages.length > 0) {
      for (const usage of usages) {
        macroUsages.push({ ...usage, statementIndex })
        if (usage.name !== 'defineExpose' && businessLogicSeen) {
          fail(
            'vue-sfc-macro-order',
            relPath,
            `${usage.name}() must be declared before business logic in <script setup> (line ${lineForIndex(scriptSetup, usage.pos)})`
          )
        }
      }
    } else if (!isTypeOnlyTopLevelStatement(statement) && !ts.isEmptyStatement(statement)) {
      businessLogicSeen = true
    }

    if (usages.some(usage => usage.name === 'defineExpose')) {
      const hasFollowingDeclaration = sourceFile.statements
        .slice(statementIndex + 1)
        .some(nextStatement => !ts.isEmptyStatement(nextStatement))
      if (hasFollowingDeclaration) {
        fail(
          'vue-sfc-macro-order',
          relPath,
          `defineExpose() must be the last declaration in <script setup> (line ${lineForIndex(scriptSetup, usages[0].pos)})`
        )
      }
    }
  })

  let previousRank = -1
  for (const usage of macroUsages.filter(usage => usage.name !== 'defineExpose')) {
    const rank = VUE_SFC_MACRO_RANK.get(usage.name)
    if (rank < previousRank) {
      fail(
        'vue-sfc-macro-order',
        relPath,
        `${usage.name}() violates required macro order: ${VUE_SFC_MACRO_ORDER.join(' -> ')}`
      )
      break
    }
    previousRank = rank
  }
}

for (const relPath of vueSfcMacroFiles) {
  const scriptSetup = stripJsComments(getVueScriptSetupContent(relPath))
  if (/\buseMitt\s*\(/.test(scriptSetup)) {
    fail(
      'use-auto-mitt',
      relPath,
      'Vue <script setup> components must use useAutoMitt() for event-bus subscriptions'
    )
  }
}

const approvedBusinessTypeAssertionFiles = new Set([
  'apps/web-demo/src/hooks/layout/useAdminBreadcrumbs.ts',
  'apps/web-demo/src/hooks/modules/useDialog.tsx',
  'apps/web-demo/src/hooks/modules/useProTableUrlSync.ts',
  'apps/web-demo/src/hooks/modules/useThemeSwitch.ts',
])
const approvedBusinessTypeAssertionPatterns = ['apps/web-demo/src/router/utils/**']

const businessTypeAssertionFiles = scanFiles(
  [
    'apps/web-demo/src/views/**/*.{vue,ts,tsx}',
    'apps/web-demo/src/hooks/**/*.{ts,tsx}',
    'apps/web-demo/src/stores/**/*.{ts,tsx}',
    'apps/web-demo/src/api/**/*.{ts,tsx}',
    'apps/web-demo/src/router/**/*.{ts,tsx}',
  ],
  {
    ignore: [
      '**/*.spec.ts',
      '**/*.test.ts',
      'apps/web-demo/src/views/example/**',
      'apps/web-demo/src/views/login/**',
      'apps/web-demo/src/views/notfound/**',
    ],
  }
)

for (const relPath of businessTypeAssertionFiles) {
  if (approvedBusinessTypeAssertionFiles.has(relPath)) continue
  if (isGlobAllowed(relPath, approvedBusinessTypeAssertionPatterns)) continue

  if (relPath.endsWith('.vue')) {
    const template = parseVueDescriptor(relPath).template?.content ?? ''
    if (/\bas\s+[A-Za-z_{]/.test(template) || /<\s*[A-Z][A-Za-z0-9_]*\s*>/.test(template)) {
      fail(
        'business-type-assertion',
        relPath,
        'Vue templates must not contain TypeScript assertions; narrow in <script setup> with castValue/type guards'
      )
    }
  }

  for (const source of getScriptLikeSources(relPath)) {
    const sourceFile = ts.createSourceFile(source.relPath, source.content, ts.ScriptTarget.Latest, true, source.kind)
    const visit = node => {
      if ((ts.isAsExpression(node) || ts.isTypeAssertionExpression(node)) && !isAllowedTypeAssertion(node, sourceFile)) {
        fail(
          'business-type-assertion',
          relPath,
          `business code type assertions must use castValue()/type guards or an approved bridge exception (line ${lineForIndex(source.content, node.getStart(sourceFile))})`
        )
      }
      ts.forEachChild(node, visit)
    }
    visit(sourceFile)
  }
}

const composableReturnFiles = scanFiles(
  [
    'apps/web-demo/src/hooks/**/*.{ts,tsx}',
    'apps/web-demo/src/layouts/**/use*.{ts,tsx}',
    'apps/web-demo/src/views/**/{hooks,composables}/**/*.{ts,tsx}',
    'packages/vue-hooks/src/**/*.{ts,tsx}',
    'packages/vue-ui/src/**/hooks/**/*.{ts,tsx}',
    'packages/vue-charts/src/**/*.{ts,tsx}',
    'packages/vue-app-platform/src/**/*.{ts,tsx}',
  ],
  {
    ignore: ['**/*.spec.ts', '**/*.test.ts', '**/dist/**'],
  }
)

for (const relPath of composableReturnFiles) {
  const sourceText = readText(relPath)
  const sourceFile = createSourceFile(relPath, sourceText)

  for (const statement of sourceFile.statements) {
    if (ts.isFunctionDeclaration(statement) && statement.name?.text.startsWith('use') && isExportedDeclaration(statement)) {
      if (!statement.type) {
        fail(
          'composable-return-type',
          relPath,
          `${statement.name.text}() must declare an explicit return type`
        )
      }
    }

    if (!ts.isVariableStatement(statement) || !isExportedDeclaration(statement)) continue
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || !declaration.name.text.startsWith('use')) continue
      const initializer = declaration.initializer
      const initializerHasReturnType =
        initializer &&
        (ts.isArrowFunction(initializer) || ts.isFunctionExpression(initializer)) &&
        Boolean(initializer.type)
      if (!declaration.type && !initializerHasReturnType) {
        fail(
          'composable-return-type',
          relPath,
          `${declaration.name.text} must declare an explicit return type`
        )
      }
    }
  }
}

const dynamicUnoUtilityPrefix =
  '(?:p|m|px|py|pt|pb|pl|pr|mx|my|mt|mr|mb|ml|gap|gap-x|gap-y|bg|text|border|ring|w|h|min-w|max-w|min-h|max-h|rounded|shadow|z|opacity|grid-cols|col-span|row-span|duration|ease|translate|scale|rotate|top|left|right|bottom|inset)'
const unsafeDynamicUnoTemplatePattern = new RegExp(
  `(?:^|\\s)(?:!|[a-z-]+:)*${dynamicUnoUtilityPrefix}-\\$\\{`,
  'm'
)
const unsafeDynamicUnoConcatPattern = new RegExp(
  `['"](?:!|[a-z-]+:)*${dynamicUnoUtilityPrefix}-['"]\\s*\\+`
)
const approvedDynamicUnoClassFiles = new Set([
  'packages/unocss-preset/src/safelist/index.ts',
])

const dynamicUnoFiles = scanFiles(
  [
    'apps/web-demo/src/**/*.{vue,ts,tsx}',
    'packages/**/*.{vue,ts,tsx}',
  ],
  {
    ignore: [
      '**/*.spec.ts',
      '**/*.test.ts',
      '**/dist/**',
      '**/node_modules/**',
      'apps/web-demo/src/views/example/**',
    ],
  }
)
for (const relPath of dynamicUnoFiles) {
  if (approvedDynamicUnoClassFiles.has(relPath)) continue
  const content = stripJsComments(readText(relPath))
  if (unsafeDynamicUnoTemplatePattern.test(content) || unsafeDynamicUnoConcatPattern.test(content)) {
    fail(
      'unocss-dynamic-class',
      relPath,
      'dynamic UnoCSS utility composition is forbidden; use static class literals or add a documented safelist generator'
    )
  }
}

const unoSafelistPath = 'packages/unocss-preset/src/safelist/index.ts'
const unoSafelistContent = shouldRunSingletonCheck(unoSafelistPath) ? readTextIfExists(unoSafelistPath) : ''
if (unoSafelistContent) {
  for (const requiredToken of [
    'buildDynamicSizeDemoSafelist',
    'DYNAMIC_SIZE_DEMO_SAFELIST_CLASSES',
    'buildDynamicThemeDemoSafelist',
    'DYNAMIC_THEME_DEMO_SAFELIST_CLASSES',
    'getEngineSafelist',
  ]) {
    if (!unoSafelistContent.includes(requiredToken)) {
      fail(
        'unocss-safelist-contract',
        unoSafelistPath,
        `dynamic UnoCSS safelist contract must retain ${requiredToken}`
      )
    }
  }
}

for (const relPath of governedGeneratedCodeFiles) {
  if (relPath.startsWith('apps/')) continue
  if (isGlobAllowed(relPath, aiAllowedRuntimeAccessPaths)) continue
  const content = stripJsComments(readText(relPath))
  for (const rule of blockedGeneratedCodePatterns) {
    if (rule.regex.test(content)) {
      fail('ai-generated-code-policy', relPath, rule.reason)
    }
  }
}

const COLOR_SINGLE_TOKENS = ['border', 'input', 'ring', 'background', 'foreground']
const COLOR_PAIR_FAMILIES = ['card', 'popover', 'secondary', 'muted']
const COLOR_QUAD_FAMILIES = ['primary', 'accent', 'danger', 'warn', 'success', 'info', 'help']
const VALID_COLOR_SUFFIXES = new Set([
  ...COLOR_SINGLE_TOKENS,
  ...COLOR_PAIR_FAMILIES.flatMap(family => [family, `${family}-foreground`]),
  ...COLOR_QUAD_FAMILIES.flatMap(family => [
    family,
    `${family}-foreground`,
    `${family}-hover`,
    `${family}-hover-foreground`,
    `${family}-light`,
    `${family}-light-foreground`,
  ]),
  'sidebar',
  'sidebar-foreground',
  'sidebar-primary',
  'sidebar-primary-foreground',
  'sidebar-accent',
  'sidebar-accent-foreground',
  'sidebar-border',
  'sidebar-ring',
])
const BORDER_RESET_TOKENS = new Set(['border-0', 'border-none'])
const BORDER_WIDTH_TOKENS = new Set(['border-px', 'border-1', 'border-2', 'border-4', 'border-8'])
const BORDER_STYLE_TOKENS = new Set(['border-solid', 'border-dashed', 'border-dotted', 'border-double'])
const DIRECTIONAL_BORDER_STYLE_TOKENS = {
  'border-t': new Set(['border-t-solid', 'border-t-dashed', 'border-t-dotted', 'border-t-double']),
  'border-r': new Set(['border-r-solid', 'border-r-dashed', 'border-r-dotted', 'border-r-double']),
  'border-b': new Set(['border-b-solid', 'border-b-dashed', 'border-b-dotted', 'border-b-double']),
  'border-l': new Set(['border-l-solid', 'border-l-dashed', 'border-l-dotted', 'border-l-double']),
}

function normalizeClassToken(token) {
  const cleaned = token.trim().replace(/^!+/, '').replace(/!+$/, '')
  if (!cleaned || cleaned.includes('[')) return cleaned
  const parts = cleaned.split(':')
  return (parts.at(-1) || cleaned).replace(/^!+/, '').replace(/!+$/, '')
}

function semanticBorderColorSuffix(token) {
  if (!token.startsWith('border-')) return null
  if (Object.hasOwn(DIRECTIONAL_BORDER_STYLE_TOKENS, token)) return null
  if (BORDER_RESET_TOKENS.has(token) || BORDER_WIDTH_TOKENS.has(token) || BORDER_STYLE_TOKENS.has(token)) {
    return null
  }
  if (/^border-[trbl]-(?:solid|dashed|dotted|double|0|none|px|\d+)$/.test(token)) {
    return null
  }
  return token.slice('border-'.length).split('/')[0]
}

function hasSemanticBorderColor(tokens) {
  return tokens.some(token => {
    const suffix = semanticBorderColorSuffix(token)
    return suffix === 'transparent' || (suffix !== null && VALID_COLOR_SUFFIXES.has(suffix))
  })
}

function findStaticStringValues(relPath, content) {
  if (/\.(md|mdc|vue)$/.test(relPath)) {
    const values = []
    const classAttrPattern = /\bclass\s*=\s*["']([^"']+)["']/g
    let classMatch
    while ((classMatch = classAttrPattern.exec(content)) !== null) {
      values.push(classMatch[1])
    }
    return values
  }

  const values = []
  const pattern = /(['"`])((?:\\.|(?!\1)[\s\S])*?)\1/g
  let match
  while ((match = pattern.exec(content)) !== null) {
    const value = match[2]
    if (value.includes('${')) continue
    values.push(value)
  }
  return values
}

function reportBorderContractIssues(relPath, content) {
  for (const value of findStaticStringValues(relPath, stripJsComments(content))) {
    if (!/\bborder(?:-|$)/.test(value)) continue
    const tokens = value.split(/\s+/).map(normalizeClassToken).filter(Boolean)
    if (tokens.length === 0) continue

    for (const token of tokens) {
      const suffix = semanticBorderColorSuffix(token)
      if (
        suffix !== null &&
        suffix !== 'transparent' &&
        !VALID_COLOR_SUFFIXES.has(suffix)
      ) {
        fail(
          'unocss-border-color-token',
          relPath,
          `border color token "${token}" must use a semantic suffix from VALID_COLORS`
        )
      }
    }

    for (const token of tokens) {
      if (token !== 'border' && !Object.hasOwn(DIRECTIONAL_BORDER_STYLE_TOKENS, token)) continue

      const hasStyle =
        token === 'border'
          ? tokens.some(candidate => BORDER_STYLE_TOKENS.has(candidate))
          : tokens.some(candidate => DIRECTIONAL_BORDER_STYLE_TOKENS[token].has(candidate))
      const hasColor = hasSemanticBorderColor(tokens)

      if (!hasStyle || !hasColor) {
        fail(
          'unocss-no-naked-border',
          relPath,
          `"${token}" must be paired with explicit border style and semantic border color`
        )
      }
    }
  }
}

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

const networkBoundaryFiles = scanFiles([
  'apps/web-demo/src/api/**/*.{ts,tsx}',
  'apps/web-demo/src/hooks/**/*.{ts,tsx}',
  'apps/web-demo/src/stores/**/*.{ts,tsx}',
  'apps/web-demo/src/layouts/components/LoadingLottie.vue',
])
for (const relPath of networkBoundaryFiles) {
  if (approvedRawNetworkFiles.has(relPath)) continue
  const content = stripJsComments(readText(relPath))
  if (/\b(fetch|axios|XMLHttpRequest)\b/.test(content)) {
    fail('raw-network', relPath, 'raw network clients are only allowed in approved HTTP/runtime infrastructure')
  }
}

const httpCouplingBoundaryFiles = scanFiles(
  [
    'apps/web-demo/src/utils/http/**/*.{ts,tsx}',
    'apps/web-demo/src/api/**/*.{ts,tsx}',
    'apps/web-demo/src/hooks/modules/useHttpRequest.ts',
    'apps/web-demo/src/adapters/http.adapter.ts',
  ],
  {
    ignore: ['**/*.spec.ts', '**/*.test.ts'],
  }
)
for (const relPath of httpCouplingBoundaryFiles) {
  const content = stripJsComments(readText(relPath))
  const checks = [
    {
      ruleId: 'http-router-coupling',
      pattern: /from\s+['"](?:@\/router(?:\/|['"])|vue-router['"])/,
      message: 'HTTP/API runtime must not import router runtime; use approved bridges outside the HTTP layer',
    },
    {
      ruleId: 'http-router-coupling',
      pattern: /\brouter\.(?:push|replace|addRoute|removeRoute)\s*\(/,
      message: 'HTTP/API runtime must not perform navigation; unauthorized flow must go through the auth bridge',
    },
    {
      ruleId: 'http-store-coupling',
      pattern: /from\s+['"](?:@\/stores(?:\/|['"])|pinia['"])/,
      message: 'HTTP/API runtime must not import Pinia stores; read auth state through tokenProvider bridges',
    },
    {
      ruleId: 'http-session-storage-coupling',
      pattern: /\b(?:localStorage|sessionStorage)\b/,
      message: 'HTTP/API runtime must not read browser session storage directly; use approved storage/auth bridges',
    },
  ]

  for (const check of checks) {
    if (check.pattern.test(content)) {
      fail(check.ruleId, relPath, check.message)
    }
  }
}

const storageBoundaryFiles = scanFiles(['apps/web-demo/src/views/**/*.{vue,ts,tsx}', 'apps/web-demo/src/hooks/**/*.{ts,tsx}', 'apps/web-demo/src/stores/**/*.{ts,tsx}', 'apps/web-demo/src/components/**/*.{vue,ts,tsx}'])
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

const vueUseBoundaryFiles = scanFiles(['apps/web-demo/src/views/**/*.{vue,ts,tsx}', 'apps/web-demo/src/hooks/**/*.{ts,tsx}', 'apps/web-demo/src/stores/**/*.{ts,tsx}', 'apps/web-demo/src/components/**/*.{vue,ts,tsx}'])
for (const relPath of vueUseBoundaryFiles) {
  if (/\.(spec|test)\.ts$/.test(relPath)) continue
  if (relPath.includes('/example/')) continue
  if (approvedVueUseStorageFiles.has(relPath)) continue
  const content = stripJsComments(readText(relPath))
  if (/\buseFetch\b/.test(content)) {
    fail('vueuse-fetch-restricted', relPath, 'business HTTP must use Alova API modules and project hooks instead of VueUse useFetch')
  }
  if (/\b(useLocalStorage|useSessionStorage|useStorage|useStorageAsync)\b/.test(content)) {
    fail('vueuse-storage-restricted', relPath, 'business persistence must use safeStorage or approved Pinia persistence instead of VueUse storage composables')
  }
}

const syncBoundaryFiles = scanFiles(['apps/web-demo/src/**/*.{ts,tsx,vue}'])
for (const relPath of syncBoundaryFiles) {
  if (/\.(spec|test)\.ts$/.test(relPath)) continue
  if (relPath.includes('/example/')) continue
  const content = stripJsComments(readText(relPath))

  if (/\.\$subscribe\s*\(/.test(content) && /\bsyncAction\s*\(/.test(content)) {
    fail(
      'sync-no-subscribe-autosync',
      relPath,
      'cross-tab/device sync must be explicit user-intent syncAction calls, not store.$subscribe auto-sync'
    )
  }

  if (approvedDirectTransportFiles.has(relPath)) continue

  if (/\bnew\s+BroadcastChannel\s*\(/.test(content)) {
    fail(
      'sync-transport-boundary',
      relPath,
      'BroadcastChannel transport must stay in apps/web-demo/src/sync/** or an approved infrastructure allowlist'
    )
  }

  if (/\bnew\s+WebSocket\s*\(|\buseWebSocket\s*\(/.test(content)) {
    fail(
      'sync-transport-boundary',
      relPath,
      'WebSocket transport must stay in apps/web-demo/src/sync/** or an approved infrastructure allowlist'
    )
  }
}

// --- raw-date-native-api: native Date APIs are forbidden outside DateUtils/tests and approved timestamp infrastructure ---
const approvedRawDateFiles = new Set([
  'apps/web-demo/src/utils/http/interceptors.ts',
])

const dateCheckFiles = scanFiles(['apps/web-demo/src/**/*.{ts,tsx,vue}'])
for (const relPath of dateCheckFiles) {
  if (/\.(spec|test)\.ts$/.test(relPath)) continue
  if (relPath.includes('/example/')) continue
  if (relPath.startsWith('apps/web-demo/src/utils/date/')) continue
  if (approvedRawDateFiles.has(relPath)) continue
  const content = stripJsComments(readText(relPath))
  const rawDateChecks = [
    {
      pattern: /\bnew\s+Date\s*\(/,
      message: 'Use DateUtils.now()/DateUtils static APIs instead of raw new Date()',
    },
    {
      pattern: /\bDate\.now\s*\(/,
      message: 'Use DateUtils.nowMs() instead of raw Date.now()',
    },
    {
      pattern: /(?<!DateUtils)\.toISOString\s*\(/,
      message: 'Use DateUtils.toISOString() instead of raw Date#toISOString()',
    },
    {
      pattern: /\.(?:toLocaleDateString|toLocaleTimeString|getFullYear|getMonth|getDate|getHours|getMinutes|getSeconds)\s*\(/,
      message: 'Use DateUtils/useDateUtils formatting helpers instead of native Date display APIs',
    },
  ]
  for (const check of rawDateChecks) {
    if (check.pattern.test(content)) {
      fail('raw-date-native-api', relPath, check.message)
    }
  }
}

// --- raw-timer: setTimeout/setInterval outside approved files ---
const approvedRawTimerFiles = new Set([
  'apps/web-demo/src/views/login/index.vue',
  'apps/web-demo/src/components/ProForm/engine/core/FormController.ts',
  'apps/web-demo/src/components/ProForm/engine/validation/ValidationEngine.ts',
  'apps/web-demo/src/utils/http/connection.ts',
  'apps/web-demo/src/utils/http/methods.ts',
  'apps/web-demo/src/utils/http/interceptors.ts',
  'apps/web-demo/src/utils/date/timezone.ts',
  'apps/web-demo/src/hooks/modules/useThemeSwitch.ts',
  'apps/web-demo/src/hooks/layout/useAdminTabs.ts',
  'apps/web-demo/src/hooks/layout/useLoading.ts',
  'apps/web-demo/src/hooks/layout/useNprogress.ts',
  'apps/web-demo/src/hooks/modules/usePermissionRoutes.ts',
  'apps/web-demo/src/layouts/components/admin/AdminSidebarMenu.tsx',
  'apps/web-demo/src/layouts/modules/LayoutAdmin.tsx',
  'apps/web-demo/src/router/utils/guardEffects.ts',
  'apps/web-demo/src/components/PrimeDialog/useDialog.ts',
  'apps/web-demo/src/adapters/charts/UseEcharts.vue',
  'apps/web-demo/src/stores/modules/system/device.ts',
  'apps/web-demo/src/api/auth/auth.api.ts',
  'apps/web-demo/src/api/system/system.api.ts',
])

const timerCheckFiles = scanFiles(['apps/web-demo/src/**/*.{ts,tsx,vue}'])
for (const relPath of timerCheckFiles) {
  if (/\.(spec|test)\.ts$/.test(relPath)) continue
  if (relPath.includes('/example/')) continue
  if (approvedRawTimerFiles.has(relPath)) continue
  const content = stripJsComments(readText(relPath))
  if (/\b(setTimeout|setInterval)\s*\(/.test(content)) {
    fail('raw-timer', relPath, 'Use useTimeoutFn/useIntervalFn from VueUse or approved timer patterns instead of raw setTimeout/setInterval')
  }
}

const designSystemFiles = scanFiles(['apps/web-demo/index.html', 'apps/web-demo/src/**/*.{vue,ts,tsx,css,scss}'])
for (const relPath of designSystemFiles) {
  const content = stripJsComments(readText(relPath))
  if (!approvedGlassBaseFiles.has(relPath) && /\bglass-base\b/.test(content)) {
    fail('unocss-glass-base-internal', relPath, 'glass-base is an internal primitive; use glass-panel, glass-shell, glass-card, glass-icon-box, or glass-capsule')
  }
  if (/\bdark:text-white!?\b/.test(content)) {
    fail('unocss-dark-text-white', relPath, 'dark:text-white is forbidden; semantic text tokens must adapt to dark mode')
  }
  if (!approvedRawZIndexFiles.has(relPath) && /\bz-index\s*:|\bz-\[(?:\d+)/.test(content)) {
    fail('unocss-raw-z-index', relPath, 'raw z-index values are forbidden outside documented infrastructure exceptions')
  }
}

const borderContractFiles = scanFiles(
  [
    'packages/unocss-preset/src/shortcuts/**/*.ts',
    'apps/web-demo/src/utils/theme/ptPresets/**/*.ts',
    'apps/web-demo/src/utils/theme/presetComponents/**/*.ts',
    'apps/web-demo/src/layouts/**/*.{vue,tsx}',
    '.ai/rules/design-system/**/*.mdc',
    '.ai/rules/components/**/*.mdc',
  ],
  { dot: true }
)
for (const relPath of borderContractFiles) {
  reportBorderContractIssues(relPath, readText(relPath))
}

const layoutStorePath = 'apps/web-demo/src/stores/modules/system/layout.ts'
const layoutStore = shouldRunSingletonCheck(layoutStorePath) ? readTextIfExists(layoutStorePath) : ''
if (
  layoutStore &&
  /persist\s*:\s*\{[\s\S]*?key:\s*`[^`]*-layout`[\s\S]*?\}/.test(layoutStore) &&
  !layoutStore.includes('serializer: createPiniaEncryptedSerializer()')
) {
  fail('store-persist-serializer', layoutStorePath, 'useLayoutStore persistence must use createPiniaEncryptedSerializer()')
}

const sizeStorePath = 'apps/web-demo/src/stores/modules/system/size.ts'
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
    'apps/web-demo/src/hooks/modules/useHttpRequest.ts',
    'apps/web-demo/src/locales/**/*.ts',
    'apps/web-demo/src/plugins/**/*.ts',
  ]) {
    if (eslintConfig.includes(`'${removedAnyOverride}'`) || eslintConfig.includes(`"${removedAnyOverride}"`)) {
      fail('any-exemption-drift', eslintConfigPath, `${removedAnyOverride} must not return to no-explicit-any override list`)
    }
  }
}

const storeFiles = scanFiles(['apps/web-demo/src/stores/**/*.{ts,tsx}'])
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

const apiFiles = scanFiles(['apps/web-demo/src/api/**/*.{ts,tsx}'])
const schemaRequiredHttpHelpers = new Set([
  'get',
  'post',
  'put',
  'patch',
  'del',
  'getRaw',
  'uploadFile',
  'uploadFiles',
])
for (const relPath of apiFiles) {
  const sourceText = readText(relPath)
  const sourceFile = ts.createSourceFile(relPath, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  const importedHttpHelpers = new Set()

  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement)) continue
    const moduleText = statement.moduleSpecifier.getText(sourceFile).slice(1, -1)
    if (moduleText !== '@/utils/http/methods') continue
    const namedBindings = statement.importClause?.namedBindings
    if (!namedBindings || !ts.isNamedImports(namedBindings)) continue
    for (const element of namedBindings.elements) {
      const importedName = element.propertyName?.text ?? element.name.text
      if (schemaRequiredHttpHelpers.has(importedName)) {
        importedHttpHelpers.add(element.name.text)
      }
    }
  }

  if (importedHttpHelpers.size === 0) continue

  const visitApiCall = node => {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && importedHttpHelpers.has(node.expression.text)) {
      if (!httpHelperCallHasResponseSchema(node, node.expression.text, sourceFile)) {
        fail(
          'api-response-schema',
          relPath,
          `${node.expression.text}() calls in apps/web-demo/src/api must pass a config object with responseSchema`
        )
      }
    }
    ts.forEachChild(node, visitApiCall)
  }

  visitApiCall(sourceFile)
}

const routerModuleFiles = scanFiles(['apps/web-demo/src/router/modules/**/*.ts'])
const MAX_ROUTE_MODULE_LINES = 300
const MAX_ROUTE_MODULE_RECORDS = 40

for (const relPath of routerModuleFiles) {
  const sourceText = readText(relPath)
  const isRouteModuleTest = /\.(?:spec|test)\.ts$/.test(relPath)
  if (!isRouteModuleTest) {
    const lineCount = sourceText.split(/\r?\n/).length
    if (lineCount > MAX_ROUTE_MODULE_LINES) {
      fail(
        'route-module-line-budget',
        relPath,
        `route module has ${lineCount} lines; split it below ${MAX_ROUTE_MODULE_LINES} lines`
      )
    }
  }

  if (/import\s+.+\s+from\s+['"]@\/views\//.test(sourceText)) {
    fail('route-sync-view-import', relPath, 'route modules must not synchronously import @/views components')
  }

  const sourceFile = ts.createSourceFile(relPath, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  const viewImportBindings = new Set()
  let routeRecordCount = 0

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
      routeRecordCount += 1
      validateRouteObject(node, sourceFile, relPath, viewImportBindings)
    }
    ts.forEachChild(node, visit)
  }

  visit(sourceFile)

  if (!isRouteModuleTest && routeRecordCount > MAX_ROUTE_MODULE_RECORDS) {
    fail(
      'route-module-record-budget',
      relPath,
      `route module defines ${routeRecordCount} route records; split it below ${MAX_ROUTE_MODULE_RECORDS} records`
    )
  }
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

  const absTarget = path.join(cwd, target.replace(/^@\//, 'apps/web-demo/src/'))
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

function httpHelperCallHasResponseSchema(callNode, helperName, sourceFile) {
  const configArgIndex = ['post', 'put', 'patch', 'uploadFile', 'uploadFiles'].includes(helperName) ? 2 : 1
  const configNode = callNode.arguments[configArgIndex]
  if (!configNode) return false

  if (ts.isObjectLiteralExpression(configNode)) {
    return objectLiteralHasProperty(configNode, 'responseSchema', sourceFile)
  }

  if (ts.isIdentifier(configNode)) {
    const declaration = findVariableObjectLiteral(sourceFile, configNode.text)
    return declaration ? objectLiteralHasProperty(declaration, 'responseSchema', sourceFile) : false
  }

  return false
}

function findVariableObjectLiteral(sourceFile, variableName) {
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || declaration.name.text !== variableName) continue
      if (declaration.initializer && ts.isObjectLiteralExpression(declaration.initializer)) {
        return declaration.initializer
      }
    }
  }
  return null
}

function objectLiteralHasProperty(node, propertyName, sourceFile) {
  return node.properties.some(property => {
    if (!ts.isPropertyAssignment(property) && !ts.isShorthandPropertyAssignment(property)) return false
    return getPropertyName(property.name, sourceFile) === propertyName
  })
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
