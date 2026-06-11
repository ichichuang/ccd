#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { spawnSync } from 'node:child_process'
import process from 'node:process'

const root = process.cwd()
const outputDir = join(root, 'wiki/generated/release')
mkdirSync(outputDir, { recursive: true })
const run = (command, args) => spawnSync(command, args, { cwd: root, encoding: 'utf8', stdio: 'pipe' })
const commandLine = (command, args) => [command, ...args].join(' ')
const hash = createHash('sha256')
const files = []
function walk(dir) {
  if (!existsSync(dir)) return
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const absolute = join(dir, entry.name)
    if (entry.isDirectory()) walk(absolute)
    else files.push(absolute)
  }
}
walk(join(root, 'apps/web-demo/dist'))
files.sort()
for (const file of files) {
  hash.update(relative(root, file))
  hash.update('\0')
  hash.update(readFileSync(file))
  hash.update('\0')
}
const commands = [
  ['pnpm', ['validate:runtime']],
  ['pnpm', ['release:governance']],
]
const checks = commands.map(([command, args]) => {
  const result = run(command, args)
  return { command: commandLine(command, args), status: result.status ?? 1 }
})
const report = {
  schemaVersion: 1,
  generatedBy: 'scripts/architecture/release-audit.mjs',
  releaseSource: 'apps/web-demo',
  rootRuntimeSourceForbidden: true,
  artifactPath: 'apps/web-demo/dist',
  artifactCount: files.length,
  artifactChecksum: files.length > 0 ? hash.digest('hex') : null,
  checks,
}
writeFileSync(join(outputDir, 'release-audit-report.json'), `${JSON.stringify(report, null, 2)}\n`)
writeFileSync(join(outputDir, 'release-audit-report.md'), `---
title_en: Release Audit Report
title_zh: 发布审计报告
aliases:
  - Release Audit Report
tags:
  - generated
  - release
tags_zh:
  - 生成视图
  - 发布
status: published
confidence: 0.90
source_langs:
  - en
source_paths:
  - apps/web-demo/dist
  - scripts/architecture/release-audit.mjs
last_reviewed: '2026-06-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# Release Audit Report\n\n- Source: \`${report.releaseSource}\`\n- Artifact path: \`${report.artifactPath}\`\n- Artifact count: ${report.artifactCount}\n- Artifact checksum: \`${report.artifactChecksum ?? 'not-built'}\`\n- Root runtime source forbidden: ${report.rootRuntimeSourceForbidden}\n\n## Checks\n\n${checks.map(check => `- \`${check.command}\`: ${check.status === 0 ? 'pass' : 'fail'}`).join('\n')}\n`)
const failed = checks.some(check => check.status !== 0)
if (failed) {
  console.error('Release audit failed. See wiki/generated/release/release-audit-report.json')
  process.exit(1)
}
console.log('Release audit report generated: wiki/generated/release/release-audit-report.json')
