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

function parseDefaultCatalog() {
  const source = readFileSync(join(root, 'pnpm-workspace.yaml'), 'utf8')
  const lines = source.split('\n')
  const catalog = new Map()
  const startIndex = lines.findIndex(line => line === 'catalog:')
  if (startIndex === -1) return catalog

  for (let index = startIndex + 1; index < lines.length; index++) {
    const line = lines[index]
    if (!line.trim()) continue
    if (!line.startsWith('  ')) break

    const match = line.match(/^ {2}('([^']|'')+'|[^:]+):\s+(.+)$/)
    if (!match) throw new Error(`Invalid catalog line: ${line}`)

    const rawKey = match[1]
    const name = rawKey.startsWith("'") ? rawKey.slice(1, -1).replaceAll("''", "'") : rawKey
    catalog.set(name, match[3].trim())
  }

  return catalog
}

const catalog = parseDefaultCatalog()
const findings = []
const usedCatalogEntries = new Set()

if (catalog.size === 0) findings.push('pnpm-workspace.yaml: missing default dependency catalog')

for (const [name, range] of catalog.entries()) {
  if (range === '*' || range === 'latest' || range.startsWith('workspace:') || range.startsWith('catalog:')) {
    findings.push(`pnpm-workspace.yaml: invalid catalog range for ${name}: ${range}`)
  }
}

for (const manifestPath of packageManifestPaths()) {
  const manifest = readJson(manifestPath)
  for (const field of dependencyFields) {
    for (const [name, range] of Object.entries(manifest[field] ?? {})) {
      if (range.startsWith('workspace:')) continue
      if (range !== 'catalog:') {
        findings.push(`${manifestPath}: ${field}.${name} must use catalog: instead of ${range}`)
        continue
      }
      if (!catalog.has(name)) {
        findings.push(`${manifestPath}: ${field}.${name} uses catalog: but pnpm-workspace.yaml has no catalog entry`)
        continue
      }
      usedCatalogEntries.add(name)
    }
  }
}

for (const name of catalog.keys()) {
  if (!usedCatalogEntries.has(name)) findings.push(`pnpm-workspace.yaml: unused catalog entry ${name}`)
}

if (findings.length > 0) {
  console.error('Dependency catalog validation failed:')
  findings.forEach(finding => console.error(`- ${finding}`))
  process.exit(1)
}

console.log(
  `Dependency catalog validation passed (${catalog.size} catalog entries, ${packageManifestPaths().length} manifests checked from ${relative(process.cwd(), root) || '.'}).`
)
