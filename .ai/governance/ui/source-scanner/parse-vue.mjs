import { baseParse, NodeTypes } from '@vue/compiler-dom'
import { parse } from '@vue/compiler-sfc'
import ts from 'typescript'
import { deepFreeze, fail, positionFromOffsets } from './contracts.mjs'
import { parseCssRegion, parseScssRegion } from './parse-style.mjs'
import { parseTypeScriptRegion } from './parse-typescript.mjs'

function templateModel(pathName, content, baseOffset) {
  let root
  try {
    root = baseParse(content, { onError: error => { throw error } })
  } catch (error) {
    fail('PARSE_VUE_TEMPLATE', `${pathName}: ${error.message}`, { path: pathName, language: 'vue', line: error.loc?.start?.line ?? 1, column: error.loc?.start?.column ?? 1, endLine: error.loc?.end?.line ?? 1, endColumn: error.loc?.end?.column ?? 2 })
  }
  const elements = []
  function visit(node, parentIndex = null) {
    let nextParent = parentIndex
    if (node.type === NodeTypes.ELEMENT) {
      const attributes = []
      const classes = []
      for (const property of node.props) {
        if (property.type === NodeTypes.ATTRIBUTE) {
          attributes.push({ name: property.name, value: property.value?.content ?? null, directive: false })
          if (property.name === 'class' && property.value) classes.push(...property.value.content.split(/\s+/u).filter(Boolean))
        } else if (property.type === NodeTypes.DIRECTIVE) {
          const name = `v-${property.name}${property.arg?.content ? `:${property.arg.content}` : ''}`
          attributes.push({ name, value: property.exp?.content ?? null, directive: true, modifiers: property.modifiers?.map(item => item.content ?? item) ?? [] })
          if (property.name === 'bind' && property.arg?.content === 'class' && property.exp?.content) classes.push(property.exp.content)
        }
      }
      const index = elements.length
      const startOffset = baseOffset + node.loc.start.offset
      const endOffset = baseOffset + node.loc.end.offset
      elements.push(deepFreeze({ kind: 'element', tag: node.tag, attributes, classes, parentIndex, ownerKey: `component:${node.tag}`, startOffset, endOffset, location: positionFromOffsets(content, node.loc.start.offset, node.loc.end.offset) }))
      nextParent = index
    }
    for (const child of node.children ?? []) visit(child, nextParent)
  }
  visit(root)
  return deepFreeze({ elements })
}

export function parseVueFile(file, snapshot) {
  const errors = []
  const result = parse(file.content, { filename: file.path, sourceMap: false, onError: error => errors.push(error) })
  errors.push(...result.errors)
  if (errors.length > 0) fail('PARSE_VUE', `${file.path}: ${errors[0].message ?? errors[0]}`, { path: file.path, language: 'vue', line: errors[0].loc?.start?.line ?? 1, column: errors[0].loc?.start?.column ?? 1, endLine: errors[0].loc?.end?.line ?? 1, endColumn: errors[0].loc?.end?.column ?? 2 })
  const descriptor = result.descriptor
  const template = descriptor.template ? templateModel(file.path, descriptor.template.content, descriptor.template.loc.start.offset) : { elements: [] }
  const scripts = []
  for (const block of [descriptor.script, descriptor.scriptSetup].filter(Boolean)) {
    const lang = block.lang === 'tsx' ? 'tsx' : 'ts'
    if (block.lang && !['ts', 'tsx', 'js', 'jsx'].includes(block.lang)) fail('UNSUPPORTED_VUE_BLOCK', `unsupported Vue script language ${block.lang} in ${file.path}`)
    scripts.push(parseTypeScriptRegion({ path: file.path, text: block.content, language: lang, baseOffset: block.loc.start.offset, scriptKind: block.lang === 'jsx' ? ts.ScriptKind.JSX : block.lang === 'js' ? ts.ScriptKind.JS : null }))
  }
  const styles = []
  for (const block of descriptor.styles) {
    const lang = block.lang ?? 'css'
    if (!['css', 'scss'].includes(lang)) fail('UNSUPPORTED_VUE_BLOCK', `unsupported Vue style language ${lang} in ${file.path}`)
    const parsed = lang === 'scss'
      ? parseScssRegion({ path: file.path, text: block.content, baseOffset: block.loc.start.offset, snapshot })
      : parseCssRegion({ path: file.path, text: block.content, baseOffset: block.loc.start.offset })
    styles.push(deepFreeze({ ...parsed, scoped: Boolean(block.scoped), module: block.module ?? false }))
  }
  return deepFreeze({ parser: 'vue-sfc', language: 'vue', sourceText: file.content, template, scripts, styles })
}
