#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import process from 'node:process'

const cwd = process.cwd()
const rulesRoot = join(cwd, '.ai', 'rules')
const outputPath = join(cwd, '.ai', 'manifests', 'rule-index.json')

function walkMdcFiles(dir) {
  if (!existsSync(dir)) return []

  const files = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const absPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...walkMdcFiles(absPath))
      continue
    }
    if (entry.name.endsWith('.mdc')) {
      files.push(absPath)
    }
  }

  return files.sort()
}

function extractFrontmatter(content) {
  if (!content.startsWith('---')) return ''
  const end = content.indexOf('\n---', 3)
  if (end === -1) return ''
  return content.slice(3, end).trim()
}

function parseScalar(value) {
  const trimmed = value.trim()
  if (trimmed === 'true') return true
  if (trimmed === 'false') return false
  return trimmed.replace(/^['"]|['"]$/g, '')
}

function parseInlineList(value) {
  const trimmed = value.trim()
  if (!trimmed.startsWith('[') || !trimmed.endsWith(']')) return null

  const quotedValues = Array.from(trimmed.matchAll(/(['"])(.*?)\1/g)).map(match => match[2])
  if (quotedValues.length > 0) {
    return quotedValues
  }

  return trimmed
    .slice(1, -1)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
}

function parseFrontmatter(frontmatter) {
  const metadata = {}
  const lines = frontmatter.split('\n')

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index]
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/)
    if (!match) continue

    const [, key, rawValue] = match
    const inlineList = parseInlineList(rawValue)
    if (inlineList) {
      metadata[key] = inlineList
      continue
    }

    if (rawValue.trim() !== '') {
      metadata[key] = parseScalar(rawValue)
      continue
    }

    const blockValues = []
    let cursor = index + 1
    while (cursor < lines.length) {
      const blockLine = lines[cursor]
      const item = blockLine.match(/^\s*-\s*(.+)$/)
      if (!item) break
      blockValues.push(parseScalar(item[1]))
      cursor++
    }
    if (blockValues.length > 0) {
      metadata[key] = blockValues
      index = cursor - 1
    }
  }

  return metadata
}

const rules = walkMdcFiles(rulesRoot).map(absPath => {
  const relPath = relative(cwd, absPath).split('\\').join('/')
  const metadata = parseFrontmatter(extractFrontmatter(readFileSync(absPath, 'utf8')))
  const globs = Array.isArray(metadata.globs) ? metadata.globs : []

  return {
    path: relPath,
    description: typeof metadata.description === 'string' ? metadata.description : '',
    globs,
    alwaysApply: metadata.alwaysApply === true,
  }
})

const byGlob = {}
for (const rule of rules) {
  for (const glob of rule.globs) {
    byGlob[glob] ??= []
    byGlob[glob].push(rule.path)
  }
}

for (const paths of Object.values(byGlob)) {
  paths.sort()
}

const manifest = {
  schemaVersion: 1,
  generatedBy: 'scripts/generate-rule-index.mjs',
  rules,
  byGlob: Object.fromEntries(Object.entries(byGlob).sort(([a], [b]) => a.localeCompare(b))),
  alwaysApply: rules.filter(rule => rule.alwaysApply).map(rule => rule.path).sort(),
}

mkdirSync(dirname(outputPath), { recursive: true })
writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`)

console.log(`[RULE-INDEX] ${relative(cwd, outputPath)}`)
