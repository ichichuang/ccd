#!/usr/bin/env node
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { spawnSync } from 'node:child_process'
import process from 'node:process'

const root = process.cwd()
const outputPath = join(root, '.ai/runtime/dependency-scan-summary.json')

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    env: process.env,
    maxBuffer: 1024 * 1024 * 24,
  })
  return {
    command: [command, ...args].join(' '),
    status: result.status ?? 1,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    error: result.error ? result.error.message : null,
  }
}

function parseJsonOutput(result) {
  const trimmed = result.stdout.trim()
  const candidates = [trimmed, extractJsonPayload(trimmed), extractJsonPayload(result.stderr)]
  for (const candidate of candidates) {
    if (!candidate) continue
    try {
      return JSON.parse(candidate)
    } catch {
      // try the next candidate
    }
  }
  return null
}

function extractJsonPayload(value) {
  const trimmed = value.trim()
  if (!trimmed) return null
  const firstObject = trimmed.indexOf('{')
  const firstArray = trimmed.indexOf('[')
  const first =
    firstObject === -1
      ? firstArray
      : firstArray === -1
        ? firstObject
        : Math.min(firstObject, firstArray)
  if (first === -1) return null
  const lastObject = trimmed.lastIndexOf('}')
  const lastArray = trimmed.lastIndexOf(']')
  const last = Math.max(lastObject, lastArray)
  if (last <= first) return null
  return trimmed.slice(first, last + 1)
}

function summarizeOutdated(result) {
  const data = parseJsonOutput(result)
  if (!data) {
    return {
      status: 'parse-failed',
      commandStatus: result.status,
      count: null,
      packages: [],
      stderrPreview: result.stderr.split('\n').filter(Boolean).slice(0, 8),
    }
  }
  const entries = Array.isArray(data) ? data.map(item => [item.packageName ?? item.name, item]) : Object.entries(data)
  const packages = entries
    .filter(([name]) => typeof name === 'string' && name.length > 0)
    .map(([name, item]) => ({
      name,
      current: item.current,
      wanted: item.wanted,
      latest: item.latest,
      dependencyType: item.dependencyType,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
  return {
    status: packages.length === 0 ? 'current' : 'outdated-found',
    commandStatus: result.status,
    count: packages.length,
    packages,
  }
}

function summarizeAudit(result) {
  const data = parseJsonOutput(result)
  if (!data) return { status: 'parse-failed', vulnerabilities: null, advisories: [] }
  const advisories = Object.values(data.advisories ?? {})
    .map(item => ({
      id: item.id,
      module: item.module_name,
      severity: item.severity,
      vulnerableVersions: item.vulnerable_versions,
      patchedVersions: item.patched_versions,
      recommendation: item.recommendation,
      url: item.url,
    }))
    .sort((a, b) => `${b.severity}:${b.module}`.localeCompare(`${a.severity}:${a.module}`))
  return {
    status: result.status === 0 ? 'clean' : 'advisories-found',
    vulnerabilities: data.metadata?.vulnerabilities ?? null,
    advisoryCount: advisories.length,
    advisories: advisories.slice(0, 40),
    truncated: advisories.length > 40,
  }
}

function summarizeCargoTree(result) {
  if (result.error) return { status: 'unavailable', error: result.error }
  const lines = result.stdout.split('\n').filter(Boolean)
  return {
    status: result.status === 0 ? 'inventory-generated' : 'failed',
    dependencyLineCount: lines.length,
    root: lines[0] ?? null,
  }
}

function readJson(relPath) {
  return JSON.parse(readFileSync(join(root, relPath), 'utf8'))
}

function walkFiles(dir) {
  const output = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const absolute = join(dir, entry.name)
    const rel = relative(root, absolute)
    if (entry.isDirectory()) {
      if (
        /(?:^|[/\\])(?:node_modules|dist|coverage|playwright-report|test-results|target|gen)(?:[/\\]|$)/.test(
          rel
        )
      ) {
        continue
      }
      output.push(...walkFiles(absolute))
      continue
    }
    if (!statSync(absolute).isFile()) continue
    if (/\.(?:ts|tsx|vue|js|jsx|mjs|cjs|json|html|css|scss|toml)$/.test(entry.name)) {
      output.push(absolute)
    }
  }
  return output
}

function packageNameFromSpecifier(specifier) {
  if (specifier.startsWith('.') || specifier.startsWith('/') || specifier.startsWith('node:')) return null
  if (specifier.startsWith('@')) return specifier.split('/').slice(0, 2).join('/')
  return specifier.split('/')[0]
}

function collectReferencedPackages(files) {
  const packages = new Set()
  const importPatterns = [
    /\bimport\s+(?:type\s+)?(?:[^'"]*?\s+from\s+)?['"]([^'"]+)['"]/g,
    /\bexport\s+(?:type\s+)?[^'"]*?\s+from\s+['"]([^'"]+)['"]/g,
    /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    /\brequire\.resolve\s*\(\s*['"]([^'"]+)['"]/g,
    /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  ]

  for (const file of files) {
    const source = readFileSync(file, 'utf8')
    for (const pattern of importPatterns) {
      for (const match of source.matchAll(pattern)) {
        const packageName = packageNameFromSpecifier(match[1])
        if (packageName) packages.add(packageName)
      }
    }
  }

  return packages
}

function packageManifestPaths() {
  const paths = []
  for (const workspaceRoot of ['apps', 'packages']) {
    for (const entry of readdirSync(join(root, workspaceRoot), { withFileTypes: true })) {
      if (entry.isDirectory()) paths.push(`${workspaceRoot}/${entry.name}/package.json`)
    }
  }
  return paths.sort()
}

const scriptOwnedPackages = new Set([
  '@tauri-apps/cli',
  '@types/node',
  '@vitejs/plugin-vue',
  '@vitejs/plugin-vue-jsx',
  '@vue/tsconfig',
  'postcss-pxtorem',
  'rollup-plugin-visualizer',
  'sass',
  'typescript',
  'unocss',
  'vite',
  'vite-plugin-compression',
  'vue-tsc',
])

function summarizeUnusedDeclaredDependencies() {
  return packageManifestPaths().map(manifestPath => {
    const manifest = readJson(manifestPath)
    const packageDir = dirname(manifestPath)
    const files = walkFiles(join(root, packageDir))
    const referenced = collectReferencedPackages(files)
    const declared = Object.entries({
      ...(manifest.dependencies ?? {}),
      ...(manifest.devDependencies ?? {}),
      ...(manifest.peerDependencies ?? {}),
      ...(manifest.optionalDependencies ?? {}),
    })
      .map(([name, range]) => ({ name, range }))
      .filter(item => !String(item.range).startsWith('workspace:'))
      .sort((a, b) => a.name.localeCompare(b.name))
    const potentialUnused = declared
      .filter(item => !referenced.has(item.name) && !scriptOwnedPackages.has(item.name))
      .map(item => item.name)

    return {
      package: manifest.name,
      path: packageDir,
      declaredExternalCount: declared.length,
      referencedExternalCount: declared.filter(item => referenced.has(item.name)).length,
      scriptOwned: declared.filter(item => scriptOwnedPackages.has(item.name)).map(item => item.name),
      potentialUnused,
    }
  })
}

const outdated = run('pnpm', ['outdated', '--format', 'json'])
const audit = run('pnpm', ['audit', '--audit-level', 'high', '--json'])
const cargoTree = run('cargo', ['tree', '--locked', '--manifest-path', 'apps/desktop/src-tauri/Cargo.toml', '--prefix', 'depth'])

const report = {
  schemaVersion: 1,
  generatedBy: 'scripts/architecture/dependency-scan-summary.mjs',
  notes: [
    'This report summarizes dependency scan output and does not upgrade packages.',
    'pnpm outdated exits non-zero when outdated packages exist; pnpm audit exits non-zero when advisories are found.',
    'Cargo vulnerability review remains inventory-based unless cargo-audit is installed in the execution environment.',
  ],
  scans: {
    outdated: summarizeOutdated(outdated),
    audit: summarizeAudit(audit),
    cargoTree: summarizeCargoTree(cargoTree),
    unusedDeclaredDependencies: {
      status: 'inventory-generated',
      notes: [
        'Import-based inventory only; script-owned and auto-imported packages may require human review before removal.',
        'This scan does not remove dependencies or mutate package manifests.',
      ],
      packages: summarizeUnusedDeclaredDependencies(),
    },
  },
}

mkdirSync(dirname(outputPath), { recursive: true })
writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`)

console.log(`Dependency scan summary written to ${outputPath}`)
console.log(`Outdated packages: ${report.scans.outdated.count ?? 'unknown'}`)
console.log(`pnpm audit status: ${report.scans.audit.status}`)
console.log(`Cargo inventory status: ${report.scans.cargoTree.status}`)
