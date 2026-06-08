#!/usr/bin/env node
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
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
  if (!trimmed) return null
  try {
    return JSON.parse(trimmed)
  } catch {
    return null
  }
}

function summarizeOutdated(result) {
  const data = parseJsonOutput(result)
  if (!data) return { status: 'parse-failed', count: null, packages: [] }
  const packages = Object.entries(data)
    .map(([name, item]) => ({
      name,
      current: item.current,
      wanted: item.wanted,
      latest: item.latest,
      dependencyType: item.dependencyType,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
  return { status: result.status === 0 ? 'current' : 'outdated-found', count: packages.length, packages }
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
  },
}

mkdirSync(dirname(outputPath), { recursive: true })
writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`)

console.log(`Dependency scan summary written to ${outputPath}`)
console.log(`Outdated packages: ${report.scans.outdated.count ?? 'unknown'}`)
console.log(`pnpm audit status: ${report.scans.audit.status}`)
console.log(`Cargo inventory status: ${report.scans.cargoTree.status}`)
