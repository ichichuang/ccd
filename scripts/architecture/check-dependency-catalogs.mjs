#!/usr/bin/env node
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import process from 'node:process'

const root = process.cwd()
const dependencyFields = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']

function readJson(path) {
  return JSON.parse(readFileSync(join(root, path), 'utf8'))
}

function packageManifestPaths() {
  const paths = ['package.json']
  for (const workspaceRoot of ['apps', 'packages']) {
    for (const entry of readdirSync(join(root, workspaceRoot), { withFileTypes: true })) {
      if (entry.isDirectory()) paths.push(`${workspaceRoot}/${entry.name}/package.json`)
    }
  }
  return paths.sort()
}

function parseCatalogEntry(line, indent) {
  const match = line.match(new RegExp(`^ {${indent}}('([^']|'')+'|[^:]+):\\s+(.+)$`))
  if (!match) throw new Error(`Invalid catalog line: ${line}`)

  const rawKey = match[1]
  const name = rawKey.startsWith("'") ? rawKey.slice(1, -1).replaceAll("''", "'") : rawKey
  return [name, match[3].trim()]
}

function parseCatalogs() {
  const source = readFileSync(join(root, 'pnpm-workspace.yaml'), 'utf8')
  const lines = source.split('\n')
  const catalogs = new Map([['default', new Map()]])
  const startIndex = lines.findIndex(line => line === 'catalog:')
  if (startIndex !== -1) {
    const defaultCatalog = catalogs.get('default')
    for (let index = startIndex + 1; index < lines.length; index++) {
      const line = lines[index]
      if (!line.trim()) continue
      if (!line.startsWith('  ')) break

      const [name, range] = parseCatalogEntry(line, 2)
      defaultCatalog.set(name, range)
    }
  }

  const namedStartIndex = lines.findIndex(line => line === 'catalogs:')
  if (namedStartIndex !== -1) {
    let activeCatalog = null
    for (let index = namedStartIndex + 1; index < lines.length; index++) {
      const line = lines[index]
      if (!line.trim()) continue
      if (!line.startsWith('  ')) break
      const catalogMatch = line.match(/^ {2}([A-Za-z0-9._-]+):\s*$/)
      if (catalogMatch) {
        activeCatalog = catalogMatch[1]
        catalogs.set(activeCatalog, new Map())
        continue
      }
      if (!activeCatalog) throw new Error(`Catalog entry without named catalog: ${line}`)
      const [name, range] = parseCatalogEntry(line, 4)
      catalogs.get(activeCatalog).set(name, range)
    }
  }

  return catalogs
}

function catalogRef(range) {
  if (range === 'catalog:') return 'default'
  const match = range.match(/^catalog:([A-Za-z0-9._-]+)$/)
  return match?.[1] ?? null
}

function catalogHas(catalogs, catalogName, packageName) {
  return catalogs.get(catalogName)?.has(packageName) ?? false
}

function collectOverrideRanges(value, path = 'pnpm.overrides') {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return []
  const ranges = []
  for (const [name, range] of Object.entries(value)) {
    const currentPath = `${path}.${name}`
    if (typeof range === 'string') {
      ranges.push([currentPath, name, range])
      continue
    }
    if (range && typeof range === 'object' && !Array.isArray(range)) {
      ranges.push(...collectOverrideRanges(range, currentPath))
    }
  }
  return ranges
}

function packageNameFromOverrideSelector(selector) {
  const lastSegment = selector.split('>').pop()
  if (lastSegment.includes('@') && !lastSegment.startsWith('@')) {
    return lastSegment.slice(0, lastSegment.lastIndexOf('@'))
  }
  return lastSegment
}

const catalogs = parseCatalogs()
const defaultCatalog = catalogs.get('default')
const findings = []
const usedCatalogEntries = new Set()

if (defaultCatalog.size === 0) findings.push('pnpm-workspace.yaml: missing default dependency catalog')

for (const [catalogName, catalog] of catalogs.entries()) {
  for (const [name, range] of catalog.entries()) {
    if (range === '*' || range === 'latest' || range.startsWith('workspace:') || range.startsWith('catalog:')) {
      findings.push(`pnpm-workspace.yaml: invalid ${catalogName} catalog range for ${name}: ${range}`)
    }
  }
}

for (const manifestPath of packageManifestPaths()) {
  const manifest = readJson(manifestPath)
  for (const field of dependencyFields) {
    for (const [name, range] of Object.entries(manifest[field] ?? {})) {
      if (range.startsWith('workspace:')) continue
      const catalogName = catalogRef(range)
      if (!catalogName) {
        findings.push(`${manifestPath}: ${field}.${name} must use catalog: instead of ${range}`)
        continue
      }
      if (!catalogHas(catalogs, catalogName, name)) {
        findings.push(`${manifestPath}: ${field}.${name} uses ${range} but pnpm-workspace.yaml has no catalog entry`)
        continue
      }
      usedCatalogEntries.add(`${catalogName}:${name}`)
    }
  }
}

const rootManifest = readJson('package.json')
for (const [overridePath, name, range] of collectOverrideRanges(rootManifest.pnpm?.overrides)) {
  const catalogName = catalogRef(range)
  if (!catalogName) {
    findings.push(`package.json: ${overridePath} must use a pnpm catalog instead of ${range}`)
    continue
  }
  const packageName = packageNameFromOverrideSelector(name)
  if (!catalogHas(catalogs, catalogName, packageName)) {
    findings.push(`package.json: ${overridePath} uses ${range} but pnpm-workspace.yaml has no catalog entry`)
    continue
  }
  usedCatalogEntries.add(`${catalogName}:${packageName}`)
}

for (const [catalogName, catalog] of catalogs.entries()) {
  for (const name of catalog.keys()) {
    if (!usedCatalogEntries.has(`${catalogName}:${name}`)) {
      findings.push(`pnpm-workspace.yaml: unused ${catalogName} catalog entry ${name}`)
    }
  }
}

if (findings.length > 0) {
  console.error('Dependency catalog validation failed:')
  findings.forEach(finding => console.error(`- ${finding}`))
  process.exit(1)
}

console.log(
  `Dependency catalog validation passed (${[...catalogs.values()].reduce((total, catalog) => total + catalog.size, 0)} catalog entries, ${packageManifestPaths().length} manifests checked from ${relative(process.cwd(), root) || '.'}).`
)
