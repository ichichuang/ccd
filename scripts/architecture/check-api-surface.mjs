#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import process from 'node:process'
import ts from 'typescript'
import { readPolicies, workspacePackages } from '../governance/policy-utils.mjs'

const root = process.cwd()
const { api: apiPolicy, topology } = readPolicies('api', 'topology')
const reportPath = join(root, 'wiki/generated/api-surface-report.json')
const markdownPath = join(root, 'wiki/generated/api-surface-report.md')
const snapshotDir = join(root, apiPolicy.snapshotDir)
const findings = []

function ensureParent(file) {
  mkdirSync(dirname(file), { recursive: true })
}

function exportedNames(file) {
  if (!existsSync(file)) return []
  const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true)
  const names = new Set()
  for (const statement of source.statements) {
    const modifiers = ts.canHaveModifiers(statement) ? ts.getModifiers(statement) : undefined
    const isExported = modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword)
    if (isExported && 'name' in statement && statement.name && ts.isIdentifier(statement.name)) names.add(statement.name.text)
    if (ts.isExportDeclaration(statement) && statement.exportClause && ts.isNamedExports(statement.exportClause)) {
      for (const element of statement.exportClause.elements) names.add(element.name.text)
    }
  }
  return [...names].sort((a, b) => a.localeCompare(b))
}

function snapshotName(packageName) {
  return `${packageName.replace(/^@/, '').replace(/\//g, '__')}.json`
}

function exportSubpaths(exportsField) {
  if (!exportsField) return []
  if (typeof exportsField === 'string') return ['.']
  return Object.keys(exportsField).sort()
}

function formatGeneratedOutputs() {
  const result = spawnSync(
    'pnpm',
    [
      'exec',
      'prettier',
      '--write',
      '--no-error-on-unmatched-pattern',
      'wiki/generated/api-surface-report.json',
      'wiki/generated/api-surface-report.md',
      `${apiPolicy.snapshotDir}/**/*.json`,
    ],
    {
      cwd: root,
      encoding: 'utf8',
      stdio: 'pipe',
    }
  )

  if (result.status === 0) return
  if (result.stdout) process.stdout.write(result.stdout)
  if (result.stderr) process.stderr.write(result.stderr)
  process.exit(result.status ?? 1)
}

const governedPackages = workspacePackages(topology)
  .filter(item => item.publicApi === true && item.path.startsWith('packages/'))
  .map(packageInfo => {
    const manifest = JSON.parse(readFileSync(join(root, packageInfo.path, 'package.json'), 'utf8'))
    return {
      ...packageInfo,
      manifest,
      exports: exportSubpaths(manifest.exports),
    }
  })
  .filter(item => item.exports.length > 0)

for (const item of governedPackages) {
  if (!apiPolicy.packages.includes(item.name)) {
    findings.push(`${item.path}: public API package missing from API policy packages: ${item.name}`)
  }
}

function compareSnapshot(item, current) {
  const snapshotPath = join(snapshotDir, snapshotName(item.package))
  if (!existsSync(snapshotPath)) {
    ensureParent(snapshotPath)
    writeFileSync(snapshotPath, `${JSON.stringify(current, null, 2)}\n`)
    return
  }

  const baseline = JSON.parse(readFileSync(snapshotPath, 'utf8'))
  if (apiPolicy.breakingChangeRules.failOnSubpathRemoval) {
    const removedSubpaths = baseline.exports.filter(name => !current.exports.includes(name))
    for (const name of removedSubpaths) findings.push(`${item.path}: public export subpath removed: ${name}`)
  }
  if (apiPolicy.breakingChangeRules.failOnExportRemoval) {
    const removedSymbols = baseline.rootSymbols.filter(name => !current.rootSymbols.includes(name))
    for (const name of removedSymbols) findings.push(`${item.path}: public root symbol removed: ${name}`)
  }
  if (apiPolicy.breakingChangeRules.failOnInternalSubpathExport) {
    const internalSubpaths = current.exports.filter(name => name !== '.' && /internal|src|private/.test(name))
    for (const name of internalSubpaths) findings.push(`${item.path}: internal subpath leaked publicly: ${name}`)
  }
}

const report = governedPackages.map(packageInfo => {
  const packageDir = packageInfo.path
  const item = {
    package: packageInfo.manifest.name,
    path: packageDir,
    exports: packageInfo.exports,
    rootSymbols: exportedNames(join(root, packageDir, 'src/index.ts')),
  }
  compareSnapshot(item, item)
  return item
})

ensureParent(reportPath)
writeFileSync(reportPath, `${JSON.stringify({ schemaVersion: 1, generatedBy: 'scripts/architecture/check-api-surface.mjs', packages: report }, null, 2)}\n`)
writeFileSync(
  markdownPath,
  `---
title_en: API Surface Report
title_zh: API 表面报告
aliases:
  - API Surface Report
tags:
  - generated
  - api
tags_zh:
  - 生成视图
  - API
status: published
confidence: 0.92
source_langs:
  - en
source_paths:
  - packages/**
  - .ai/governance/policies/api.json
  - scripts/architecture/check-api-surface.mjs
last_reviewed: '2026-06-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# API Surface Report\n\n${report
    .map(item => `## ${item.package}\n\n- Path: \`${item.path}\`\n- Export subpaths: ${item.exports.map(name => `\`${name}\``).join(', ') || 'none'}\n- Root symbols: ${item.rootSymbols.map(name => `\`${name}\``).join(', ') || 'none'}\n`)
    .join('\n')}`.replace(/\n*$/u, '\n')
)
formatGeneratedOutputs()

if (findings.length > 0) {
  console.error('API surface validation failed:')
  findings.forEach(finding => console.error(`- ${finding}`))
  process.exit(1)
}

console.log(`API surface report generated: ${relative(root, reportPath)}`)
