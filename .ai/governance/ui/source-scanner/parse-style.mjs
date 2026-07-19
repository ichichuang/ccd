import path from 'node:path'
import postcss from 'postcss'
import * as sass from 'sass'
import { deepFreeze, fail, normalizePosixPath, positionFromOffsets } from './contracts.mjs'

function styleLocation(sourceText, node, baseOffset) {
  const start = node.source?.start?.offset ?? 0
  const end = (node.source?.end?.offset ?? start) + 1
  return { startOffset: baseOffset + start, endOffset: baseOffset + end, location: positionFromOffsets(sourceText, start, end) }
}

function parsePostCss(pathName, text, baseOffset, parser) {
  let root
  try {
    root = postcss.parse(text, { from: pathName })
  } catch (error) {
    const reason = parser === 'postcss-css' ? 'PARSE_CSS' : 'PARSE_SCSS'
    fail(reason, `${pathName}: ${error.reason ?? error.message}`, { path: pathName, language: parser === 'postcss-css' ? 'css' : 'scss', line: error.line ?? 1, column: error.column ?? 1, endLine: error.endLine ?? error.line ?? 1, endColumn: error.endColumn ?? (error.column ?? 1) + 1 })
  }
  const selectors = []
  const declarations = []
  const atRules = []
  root.walkRules(rule => selectors.push(deepFreeze({ kind: 'selector', selector: rule.selector, ownerKey: `selector:${rule.selector}`, ...styleLocation(text, rule, baseOffset) })))
  root.walkDecls(declaration => declarations.push(deepFreeze({ kind: 'declaration', property: declaration.prop, value: declaration.value, important: declaration.important, ownerKey: declaration.parent?.selector ? `selector:${declaration.parent.selector}` : `file:${pathName}`, ...styleLocation(text, declaration, baseOffset) })))
  root.walkAtRules(atRule => atRules.push(deepFreeze({ kind: 'at-rule', name: atRule.name, params: atRule.params, ownerKey: atRule.parent?.selector ? `selector:${atRule.parent.selector}` : `file:${pathName}`, ...styleLocation(text, atRule, baseOffset) })))
  return deepFreeze({ parser, sourceText: text, selectors, declarations, atRules, deepSelectors: selectors.filter(item => /:deep\s*\(/u.test(item.selector)), mediaRules: atRules.filter(item => item.name === 'media') })
}

export function parseCssRegion({ path: pathName, text, baseOffset = 0 }) {
  return parsePostCss(pathName, text, baseOffset, 'postcss-css')
}

function snapshotMap(snapshot) {
  return new Map((snapshot?.files ?? []).map(file => [file.path, file.content]))
}

function possibleImports(candidate) {
  const extension = path.posix.extname(candidate)
  const directory = path.posix.dirname(candidate)
  const name = path.posix.basename(candidate, extension)
  return extension
    ? [candidate]
    : [candidate, `${candidate}.scss`, path.posix.join(directory, `_${name}.scss`), path.posix.join(candidate, '_index.scss')]
}

function resolveImport(specifier, containingPath, sources) {
  if (/^(?:https?:|sass:|~|\/)/u.test(specifier) || specifier.includes('..')) fail('SCSS_UNRESOLVED_IMPORT', `unsupported SCSS import ${specifier} from ${containingPath}`)
  let candidate
  if (specifier.startsWith('@/')) {
    const match = containingPath.match(/^(apps\/[^/]+\/src)\//u)
    if (!match) fail('SCSS_UNRESOLVED_IMPORT', `@ alias has no app owner in ${containingPath}`)
    candidate = path.posix.join(match[1], specifier.slice(2))
  } else if (specifier.startsWith('./')) {
    candidate = path.posix.join(path.posix.dirname(containingPath), specifier)
  } else if (/^(?:apps|packages)\//u.test(specifier)) {
    candidate = specifier
  } else {
    fail('SCSS_UNRESOLVED_IMPORT', `package or implicit SCSS import is forbidden: ${specifier}`)
  }
  const normalized = normalizePosixPath(candidate)
  const resolved = possibleImports(normalized).find(item => sources.has(item))
  if (!resolved) fail('SCSS_UNRESOLVED_IMPORT', `unresolved SCSS import ${specifier} from ${containingPath}`)
  return resolved
}

function assertSupportedScss(pathName, text) {
  const source = maskScssLineComments(text)
  if (/@(?:for|each|while)\b/u.test(source)) fail('SCSS_LOOP', `SCSS loops are unsupported in ${pathName}`)
  if (/#\{/u.test(source)) fail('SCSS_INTERPOLATION', `SCSS interpolation is unsupported in ${pathName}`)
  if (/@include\b/u.test(source)) fail('SCSS_UNRESOLVED_MIXIN', `SCSS mixin expansion is unsupported in ${pathName}`)
  if (/@(?:extend|content)\b/u.test(source)) fail('SCSS_GENERATED_SELECTOR', `generated governed selectors are unsupported in ${pathName}`)
  if (/@if\b/u.test(source)) fail('SCSS_ONE_TO_MANY_MAP', `conditional SCSS source expansion is one-to-many in ${pathName}`)
  if (/@at-root\b/u.test(source)) fail('SCSS_UNMAPPABLE_NODE', `at-root governed nodes are unmappable in ${pathName}`)
}

function maskScssLineComments(text) {
  const characters = [...text]
  let quote = null
  let blockComment = false
  for (let index = 0; index < characters.length; index += 1) {
    const current = characters[index]
    const next = characters[index + 1]
    if (blockComment) {
      if (current === '*' && next === '/') {
        blockComment = false
        index += 1
      }
      continue
    }
    if (quote) {
      if (current === '\\') index += 1
      else if (current === quote) quote = null
      continue
    }
    if (current === '"' || current === "'") {
      quote = current
      continue
    }
    if (current === '/' && next === '*') {
      blockComment = true
      index += 1
      continue
    }
    if (current === '/' && next === '/') {
      while (index < characters.length && characters[index] !== '\n') {
        characters[index] = ' '
        index += 1
      }
    }
  }
  return characters.join('')
}

export function parseScssRegion({ path: pathName, text, baseOffset = 0, snapshot }) {
  assertSupportedScss(pathName, text)
  const sources = snapshotMap(snapshot)
  sources.set(pathName, text)
  for (const match of maskScssLineComments(text).matchAll(/@(?:use|forward|import)\s+['"]([^'"]+)['"]/gu)) {
    resolveImport(match[1], pathName, sources)
  }
  const importer = {
    canonicalize(specifier, context) {
      if (specifier.startsWith('ccd://repo/')) {
        const candidate = decodeURIComponent(new URL(specifier).pathname).replace(/^\//u, '')
        const resolved = possibleImports(candidate).find(item => sources.has(item))
        if (!resolved) fail('SCSS_UNRESOLVED_IMPORT', `SCSS snapshot import missing: ${candidate}`)
        return new URL(`ccd://repo/${resolved}`)
      }
      const containing = context.containingUrl ? decodeURIComponent(context.containingUrl.pathname).replace(/^\//u, '') : pathName
      const normalizedSpecifier = context.containingUrl?.protocol === 'ccd:' && !/^(?:\.|@\/|apps\/|packages\/)/u.test(specifier) && !specifier.includes(':') ? `./${specifier}` : specifier
      const resolved = resolveImport(normalizedSpecifier, containing, sources)
      return new URL(`ccd://repo/${resolved}`)
    },
    load(canonicalUrl) {
      const relativePath = decodeURIComponent(canonicalUrl.pathname).replace(/^\//u, '')
      const contents = sources.get(relativePath)
      if (contents === undefined) fail('SCSS_UNRESOLVED_IMPORT', `SCSS snapshot import missing: ${relativePath}`)
      assertSupportedScss(relativePath, contents)
      return { contents, syntax: 'scss', sourceMapUrl: canonicalUrl }
    },
  }
  let compiled
  try {
    compiled = sass.compileString(text, { url: new URL(`ccd://repo/${pathName}`), importers: [importer], sourceMap: true, style: 'expanded', quietDeps: true })
  } catch (error) {
    if (error?.reason && String(error.reason).startsWith('SCSS_')) throw error
    fail('PARSE_SCSS', `${pathName}: ${error.message}`, { path: pathName, language: 'scss', line: error.span?.start?.line + 1 || 1, column: error.span?.start?.column + 1 || 1, endLine: error.span?.end?.line + 1 || 1, endColumn: error.span?.end?.column + 1 || 2 })
  }
  if (!compiled.sourceMap || !Array.isArray(compiled.sourceMap.sources) || compiled.sourceMap.sources.length === 0) fail('SCSS_UNMAPPABLE_NODE', `Sass emitted no source authority for ${pathName}`)
  const authoredProjection = parsePostCss(pathName, maskScssLineComments(text), baseOffset, 'sass-postcss-scss')
  const authored = deepFreeze({ ...authoredProjection, sourceText: text })
  const generated = parsePostCss(pathName, compiled.css, 0, 'sass-postcss-scss')
  if (generated.declarations.length > 0 && authored.declarations.length === 0) fail('SCSS_UNMAPPABLE_NODE', `generated governed declarations cannot map to ${pathName}`)
  return deepFreeze({ ...authored, compiledDigestInput: compiled.css, sourceMapSources: compiled.sourceMap.sources, generatedSelectorCount: generated.selectors.length, generatedDeclarationCount: generated.declarations.length })
}
