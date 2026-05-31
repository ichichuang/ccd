#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import process from 'node:process'
import { parse as parseVueSfc } from '@vue/compiler-sfc'
import ts from 'typescript'
import { patterns, readPolicy } from '../governance/policy-utils.mjs'

const root = process.cwd()
const runtimePolicy = readPolicy('runtime')
const args = new Set(process.argv.slice(2))
const inventoryMode = args.has('--inventory')
const exceptionsMode = args.has('--exceptions')
const jsonMode = args.has('--json')
const noEnforce = args.has('--no-enforce')

const defaultRuntimeSurfaces = [
  'window',
  'document',
  'navigator',
  'screen',
  'localStorage',
  'sessionStorage',
  'fetch',
  'XMLHttpRequest',
  'crypto',
  'crypto.subtle',
  'setTimeout',
  'setInterval',
  'clearTimeout',
  'clearInterval',
  'requestAnimationFrame',
  'cancelAnimationFrame',
  'console',
  'import.meta.env',
  '@tauri-apps/*',
  'invoke',
  'visualViewport',
  'documentElement',
  'location',
  'history',
  'addEventListener',
  'removeEventListener',
  'ResizeObserver',
  'MutationObserver',
  'IntersectionObserver',
  'matchMedia',
  'indexedDB',
  'caches',
]

const runtimeSurfaces = new Set(runtimePolicy.runtimeSurfaces ?? defaultRuntimeSurfaces)
const runtimeSurfaceScanRoots =
  runtimePolicy.runtimeSurfaceScanRoots ?? runtimePolicy.runtimeNeutralScanRoots
const forbiddenImports = patterns(runtimePolicy.forbiddenImports ?? [])
const forbiddenSourcePatterns = patterns(runtimePolicy.forbiddenSourcePatterns ?? [])
const runtimeClassifications = runtimePolicy.runtimeClassifications ?? []
const runtimePathAllowances = runtimePolicy.runtimePathAllowances ?? []
const runtimeSurfaceExceptions = runtimePolicy.runtimeSurfaceExceptions ?? []
const strictRuntimeNeutralPaths =
  runtimePolicy.strictRuntimeNeutralPaths ?? runtimePolicy.runtimeNeutralPackagePaths ?? []
const findings = []
const strictImportFindings = []

const globalIdentifierSurfaces = new Set(
  [...runtimeSurfaces].filter(surface => !surface.includes('.') && surface !== '@tauri-apps/*')
)
const callableSurfaces = new Set([
  'fetch',
  'setTimeout',
  'setInterval',
  'clearTimeout',
  'clearInterval',
  'requestAnimationFrame',
  'cancelAnimationFrame',
  'invoke',
  'matchMedia',
  'XMLHttpRequest',
  'ResizeObserver',
  'MutationObserver',
  'IntersectionObserver',
])
const propertySurfaces = new Set([
  'console',
  'crypto',
  'subtle',
  'visualViewport',
  'documentElement',
  'location',
  'history',
  'addEventListener',
  'removeEventListener',
  'requestAnimationFrame',
  'cancelAnimationFrame',
  'setTimeout',
  'setInterval',
  'clearTimeout',
  'clearInterval',
  'indexedDB',
  'caches',
])
const runtimeRootIdentifiers = new Set([
  'window',
  'document',
  'navigator',
  'screen',
  'localStorage',
  'sessionStorage',
  'crypto',
  'console',
  'history',
  'location',
  'globalThis',
])

function normalizePath(value) {
  return value.split(sep).join('/')
}

function relativePath(file) {
  return normalizePath(relative(root, file))
}

function isInside(relPath, parentPath) {
  const normalizedParent = normalizePath(parentPath).replace(/\/$/, '')
  return relPath === normalizedParent || relPath.startsWith(`${normalizedParent}/`)
}

function isTestFile(relPath) {
  return (
    /(?:^|\/)(?:__tests__|test|tests)\//.test(relPath) ||
    /\.(?:spec|test)\.(?:ts|tsx|js|jsx|mjs|cjs)$/.test(relPath)
  )
}

function isGeneratedTypeFile(relPath) {
  return (
    relPath.endsWith('.d.ts') ||
    /(?:^|\/)(?:auto-imports|components|env)\.d\.ts$/.test(relPath)
  )
}

function walk(dir) {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const absolute = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (['dist', 'node_modules', 'target'].includes(entry.name)) return []
      return walk(absolute)
    }
    return /\.(?:ts|tsx|js|jsx|mjs|cjs|vue)$/.test(entry.name) ? [absolute] : []
  })
}

function sourceParts(file) {
  const content = readFileSync(file, 'utf8')
  if (!file.endsWith('.vue')) {
    return [
      {
        content,
        lineOffset: 0,
        scriptKind: /\.(?:tsx|jsx)$/.test(file) ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
      },
    ]
  }

  const parsed = parseVueSfc(content, { filename: file })
  return [parsed.descriptor.script, parsed.descriptor.scriptSetup].filter(Boolean).map(block => ({
    content: block.content,
    lineOffset: block.loc.start.line - 1,
    scriptKind: block.lang === 'tsx' || block.lang === 'jsx' ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  }))
}

function sourcePosition(source, node, lineOffset) {
  const pos = source.getLineAndCharacterOfPosition(node.getStart(source))
  return {
    line: pos.line + 1 + lineOffset,
    column: pos.character + 1,
  }
}

function isTypeOnlyContext(node) {
  for (let current = node; current; current = current.parent) {
    if (
      ts.isTypeNode(current) ||
      ts.isInterfaceDeclaration(current) ||
      ts.isTypeAliasDeclaration(current) ||
      ts.isImportTypeNode(current) ||
      ts.isTypeQueryNode(current)
    ) {
      return true
    }
    if (ts.isImportClause(current) && current.isTypeOnly) return true
    if (ts.isImportSpecifier(current) && current.isTypeOnly) return true
    if (ts.isExportSpecifier(current) && current.isTypeOnly) return true
  }
  return false
}

function isIdentifierDeclarationOrKey(node) {
  const parent = node.parent
  if (!parent) return false
  if ((ts.isPropertyAccessExpression(parent) || ts.isQualifiedName(parent)) && parent.name === node) {
    return true
  }
  if (ts.isCallExpression(parent) && parent.expression === node) return true
  if (ts.isNewExpression(parent) && parent.expression === node) return true
  if (ts.isPropertyAssignment(parent) && parent.name === node) return true
  if (ts.isShorthandPropertyAssignment(parent)) return true
  if (ts.isBindingElement(parent) && parent.name === node) return true
  if (ts.isPropertySignature(parent) && parent.name === node) return true
  if (ts.isMethodSignature(parent) && parent.name === node) return true
  if (ts.isPropertyDeclaration(parent) && parent.name === node) return true
  if (ts.isParameter(parent) && parent.name === node) return true
  if (ts.isVariableDeclaration(parent) && parent.name === node) return true
  if (ts.isFunctionDeclaration(parent) && parent.name === node) return true
  if (ts.isClassDeclaration(parent) && parent.name === node) return true
  if (ts.isImportSpecifier(parent) || ts.isImportClause(parent) || ts.isExportSpecifier(parent)) {
    return true
  }
  return false
}

function rootIdentifierName(node) {
  if (ts.isIdentifier(node)) return node.text
  if (ts.isPropertyAccessExpression(node)) return rootIdentifierName(node.expression)
  return null
}

function addFinding(file, source, node, surface, accessKind, lineOffset) {
  if (!runtimeSurfaces.has(surface)) return
  const relPath = relativePath(file)
  const position = sourcePosition(source, node, lineOffset)
  findings.push({
    file: relPath,
    line: position.line,
    column: position.column,
    runtime_surface: surface,
    access_kind: isGeneratedTypeFile(relPath)
      ? 'generated_type'
      : isTestFile(relPath)
        ? 'test_mock'
        : isTypeOnlyContext(node)
          ? 'type_only'
          : accessKind,
    production_or_test: isTestFile(relPath) ? 'test' : 'production',
  })
}

function scanSource(file, part) {
  const source = ts.createSourceFile(
    file,
    part.content,
    ts.ScriptTarget.Latest,
    true,
    part.scriptKind
  )

  function visit(node) {
    if (ts.isImportDeclaration(node)) {
      const specifier = node.moduleSpecifier
      if (ts.isStringLiteral(specifier) && specifier.text.startsWith('@tauri-apps/')) {
        addFinding(file, source, specifier, '@tauri-apps/*', 'import', part.lineOffset)
      }
      if (
        ts.isStringLiteral(specifier) &&
        forbiddenImports.some(pattern => pattern.test(specifier.text)) &&
        strictRuntimeNeutralPaths.some(path => isInside(relativePath(file), path))
      ) {
        strictImportFindings.push(
          `${relativePath(file)}:${sourcePosition(source, specifier, part.lineOffset).line}:${
            sourcePosition(source, specifier, part.lineOffset).column
          } forbidden runtime import "${specifier.text}"`
        )
      }
    }

    if (ts.isPropertyAccessExpression(node)) {
      const text = node.getText(source)
      const name = node.name.text
      const rootName = rootIdentifierName(node.expression)
      const isRuntimeRoot = rootName !== null && runtimeRootIdentifiers.has(rootName)

      if (text === 'import.meta.env' || text.startsWith('import.meta.env.')) {
        addFinding(file, source, node, 'import.meta.env', 'property_access', part.lineOffset)
      }

      if (propertySurfaces.has(name)) {
        const surface = name === 'subtle' && rootName === 'crypto' ? 'crypto.subtle' : name
        const accessKind = isRuntimeRoot ? 'property_access' : 'injected_target'
        addFinding(file, source, node.name, surface, accessKind, part.lineOffset)
      }
    }

    if (ts.isCallExpression(node)) {
      const expression = node.expression
      let surface = null
      if (ts.isIdentifier(expression) && callableSurfaces.has(expression.text)) {
        surface = expression.text
      }
      if (ts.isPropertyAccessExpression(expression)) {
        const name = expression.name.text
        const rootName = rootIdentifierName(expression.expression)
        if (name === 'subtle' && rootName === 'crypto') surface = 'crypto.subtle'
        else if (callableSurfaces.has(name)) surface = name
      }
      if (surface) addFinding(file, source, expression, surface, 'direct_call', part.lineOffset)
    }

    if (ts.isNewExpression(node)) {
      const expression = node.expression
      if (ts.isIdentifier(expression) && callableSurfaces.has(expression.text)) {
        addFinding(file, source, expression, expression.text, 'direct_call', part.lineOffset)
      }
    }

    if (
      ts.isIdentifier(node) &&
      globalIdentifierSurfaces.has(node.text) &&
      !isIdentifierDeclarationOrKey(node)
    ) {
      addFinding(file, source, node, node.text, 'direct_global_read', part.lineOffset)
    }

    ts.forEachChild(node, visit)
  }

  visit(source)
}

for (const scanRoot of runtimeSurfaceScanRoots) {
  for (const file of walk(join(root, scanRoot))) {
    for (const part of sourceParts(file)) scanSource(file, part)
  }
}

function matchByPath(relPath, rules) {
  return rules
    .filter(rule => isInside(relPath, rule.path))
    .sort((a, b) => b.path.length - a.path.length)[0]
}

function normalizeSurfaces(value) {
  if (value === '*') return '*'
  return new Set(Array.isArray(value) ? value : [value])
}

function surfaceMatches(ruleSurfaces, surface) {
  if (!ruleSurfaces) return false
  const normalized = normalizeSurfaces(ruleSurfaces)
  return normalized === '*' || normalized.has(surface)
}

function exceptionEntries() {
  return runtimeSurfaceExceptions.flatMap(entry =>
    (entry.surfaces ?? [entry.runtimeSurface]).map(surface => ({
      ...entry,
      runtimeSurface: surface,
    }))
  )
}

const exceptionsByFileSurface = new Map(
  exceptionEntries().map(entry => [`${entry.path}::${entry.runtimeSurface}`, entry])
)

function findingPolicy(finding) {
  const baseClassification = matchByPath(finding.file, runtimeClassifications) ?? {
    packageOrApp: 'unknown',
    ownerLayer: 'unknown',
    classification: 'unknown',
  }
  const pathAllowance = matchByPath(finding.file, runtimePathAllowances)
  const exception = exceptionsByFileSurface.get(`${finding.file}::${finding.runtime_surface}`)
  const strictRuntimeNeutral = strictRuntimeNeutralPaths.some(path => isInside(finding.file, path))

  if (finding.access_kind === 'type_only' || finding.access_kind === 'generated_type') {
    return {
      package_or_app: baseClassification.packageOrApp,
      owner_layer: baseClassification.ownerLayer,
      current_classification: baseClassification.classification,
      allowed_by_current_policy: true,
      proposed_classification: finding.access_kind,
      proposed_policy_action: 'ignore-non-runtime-reference',
      related_issue_ids: [],
      target_owner_or_future_lane: 'none',
      notes: 'Type/generated references are indexed but not treated as runtime access.',
    }
  }

  if (finding.production_or_test === 'test' || finding.access_kind === 'test_mock') {
    return {
      package_or_app: baseClassification.packageOrApp,
      owner_layer: baseClassification.ownerLayer,
      current_classification: baseClassification.classification,
      allowed_by_current_policy: true,
      proposed_classification: 'test-only',
      proposed_policy_action: 'allow-test-only',
      related_issue_ids: [],
      target_owner_or_future_lane: 'test-only',
      notes: 'Test runtime mocks are inventoried separately from production runtime access.',
    }
  }

  if (pathAllowance && surfaceMatches(pathAllowance.surfaces, finding.runtime_surface)) {
    return {
      package_or_app: pathAllowance.packageOrApp ?? baseClassification.packageOrApp,
      owner_layer: pathAllowance.ownerLayer ?? baseClassification.ownerLayer,
      current_classification: baseClassification.classification,
      allowed_by_current_policy: true,
      proposed_classification: pathAllowance.classification,
      proposed_policy_action: pathAllowance.policyAction ?? 'allow-owned-runtime-boundary',
      related_issue_ids: pathAllowance.relatedIssueIds ?? [],
      target_owner_or_future_lane: pathAllowance.targetOwnerOrFutureLane ?? 'owned-runtime-boundary',
      notes: pathAllowance.notes ?? '',
    }
  }

  if (exception) {
    return {
      package_or_app: exception.packageOrApp ?? baseClassification.packageOrApp,
      owner_layer: exception.ownerLayer ?? baseClassification.ownerLayer,
      current_classification: baseClassification.classification,
      allowed_by_current_policy: true,
      proposed_classification: exception.classification,
      proposed_policy_action: exception.policyAction ?? 'allow-exact-classified-exception',
      related_issue_ids: exception.relatedIssueIds ?? [],
      target_owner_or_future_lane:
        exception.targetOwnerOrFutureLane ??
        [exception.migrationTarget, exception.revisitLane].filter(Boolean).join(' / '),
      notes: exception.reason ?? exception.notes ?? '',
    }
  }

  return {
    package_or_app: baseClassification.packageOrApp,
    owner_layer: baseClassification.ownerLayer,
    current_classification: baseClassification.classification,
    allowed_by_current_policy: false,
    proposed_classification: strictRuntimeNeutral ? 'violation-candidate' : 'needs-owner-decision',
    proposed_policy_action: strictRuntimeNeutral
      ? 'block-runtime-neutral-leak'
      : 'block-unclassified-runtime-surface',
    related_issue_ids: strictRuntimeNeutral ? ['C-01'] : ['C-01', 'C-02', 'C-05'],
    target_owner_or_future_lane: strictRuntimeNeutral ? 'M3/M5 owner decision' : 'M3 classify or move',
    notes: 'No matching path allowance or exact runtime surface exception.',
  }
}

function stableFindingKey(finding) {
  return [
    finding.file,
    finding.runtime_surface,
    finding.access_kind,
    finding.production_or_test,
  ].join('::')
}

function inventoryRows() {
  const rows = new Map()
  for (const finding of findings) {
    const key = stableFindingKey(finding)
    const policy = findingPolicy(finding)
    const existing = rows.get(key)
    if (existing) {
      existing.count += 1
      existing.locations.push(`${finding.line}:${finding.column}`)
      continue
    }
    rows.set(key, {
      ...finding,
      ...policy,
      count: 1,
      locations: [`${finding.line}:${finding.column}`],
    })
  }
  return [...rows.values()].sort(
    (a, b) =>
      a.file.localeCompare(b.file) ||
      a.runtime_surface.localeCompare(b.runtime_surface) ||
      a.access_kind.localeCompare(b.access_kind)
  )
}

function escapeMarkdown(value) {
  return String(value ?? '')
    .replace(/\|/g, '\\|')
    .replace(/\n/g, '<br>')
}

function renderMarkdownTable(rows) {
  const headers = [
    'file',
    'package_or_app',
    'owner_layer',
    'runtime_surface',
    'access_kind',
    'production_or_test',
    'current_classification',
    'allowed_by_current_policy',
    'proposed_classification',
    'proposed_policy_action',
    'related_issue_ids',
    'target_owner_or_future_lane',
    'notes',
  ]
  const lines = [
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
  ]
  for (const row of rows) {
    lines.push(
      `| ${headers
        .map(header => {
          if (header === 'related_issue_ids') return escapeMarkdown(row.related_issue_ids.join(', '))
          if (header === 'notes') {
            return escapeMarkdown(
              `${row.notes}${row.count > 1 ? ` (${row.count} refs: ${row.locations.join(', ')})` : ''}`
            )
          }
          return escapeMarkdown(row[header])
        })
        .join(' | ')} |`
    )
  }
  return `${lines.join('\n')}\n`
}

function renderExceptionTable() {
  const rows = exceptionEntries()
    .map(entry => ({
      file: entry.path,
      runtime_surface: entry.runtimeSurface,
      classification: entry.classification,
      related_issue_ids: (entry.relatedIssueIds ?? []).join(', '),
      migration_target: entry.migrationTarget ?? '',
      revisit_lane: entry.revisitLane ?? '',
      reason: entry.reason ?? entry.notes ?? '',
    }))
    .sort(
      (a, b) =>
        a.file.localeCompare(b.file) || a.runtime_surface.localeCompare(b.runtime_surface)
    )
  if (jsonMode) return `${JSON.stringify(rows, null, 2)}\n`
  const headers = [
    'file',
    'runtime_surface',
    'classification',
    'related_issue_ids',
    'migration_target',
    'revisit_lane',
    'reason',
  ]
  const lines = [
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
  ]
  for (const row of rows) {
    lines.push(`| ${headers.map(header => escapeMarkdown(row[header])).join(' | ')} |`)
  }
  return `${lines.join('\n')}\n`
}

const rows = inventoryRows()
const unclassifiedRows = rows.filter(
  row => row.production_or_test === 'production' && row.allowed_by_current_policy === false
)

if (exceptionsMode) {
  process.stdout.write(renderExceptionTable())
  process.exit(0)
}

if (inventoryMode) {
  if (jsonMode) process.stdout.write(`${JSON.stringify(rows, null, 2)}\n`)
  else process.stdout.write(renderMarkdownTable(rows))
  if (unclassifiedRows.length > 0 && !noEnforce) process.exit(1)
  process.exit(0)
}

if (unclassifiedRows.length > 0) {
  console.error('Runtime surface validation failed:')
  for (const row of unclassifiedRows) {
    console.error(
      `- ${row.file}:${row.locations[0]} ${row.runtime_surface} ${row.access_kind} is unclassified (${row.proposed_policy_action})`
    )
  }
  process.exit(1)
}

if (strictImportFindings.length > 0) {
  console.error('Strict runtime-neutral import validation failed:')
  strictImportFindings.forEach(finding => console.error(`- ${finding}`))
  process.exit(1)
}

for (const scanRoot of runtimePolicy.runtimeNeutralScanRoots ?? []) {
  const absoluteScanRoot = join(root, scanRoot)
  for (const file of walk(absoluteScanRoot)) {
    const content = readFileSync(file, 'utf8')
    if (forbiddenSourcePatterns.some(pattern => pattern.test(content))) {
      const relPath = relativePath(file)
      const hasClassifiedRuntimeRows = rows.some(
        row => row.file === relPath && row.allowed_by_current_policy
      )
      if (!hasClassifiedRuntimeRows) {
        console.error(`Runtime source pattern validation failed: ${relPath}`)
        process.exit(1)
      }
    }
  }
}

console.log(
  `Runtime surface validation passed. findings=${rows.length}, exact_exceptions=${exceptionEntries().length}`
)
