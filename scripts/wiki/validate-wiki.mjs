#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const root = process.cwd()
const shouldWrite = process.argv.includes('--write')

const requiredFrontmatterFields = [
  'title_en',
  'title_zh',
  'aliases',
  'tags',
  'tags_zh',
  'status',
  'confidence',
  'source_langs',
  'source_paths',
  'last_reviewed',
  'wiki_owner',
]

const generatedTargets = [
  'wiki/generated/docs-migration-status.md',
  'wiki/generated/source-coverage.md',
  'wiki/generated/missing-frontmatter.md',
  'wiki/generated/orphan-pages.md',
  'wiki/generated/low-confidence-pages.md',
  'wiki/generated/wiki-validation-summary.md',
  'wiki/generated/docs-deletion-readiness-report.md',
  'wiki/indexes/migration-map.md',
]

const requiredArchitecturePages = [
  'wiki/index.md',
  'wiki/indexes/ai-entry.md',
  'wiki/indexes/application-boundaries-index.md',
  'wiki/indexes/architecture-index.md',
  'wiki/indexes/decisions-index.md',
  'wiki/indexes/generated-evidence-index.md',
  'wiki/indexes/governance-index.md',
  'wiki/indexes/migration-map.md',
  'wiki/indexes/operations-index.md',
  'wiki/indexes/packages-index.md',
  'wiki/indexes/runtime-index.md',
  'wiki/indexes-zh/开始阅读.md',
  'wiki/canonical/architecture/monorepo-topology.md',
  'wiki/canonical/architecture/package-responsibility-matrix.md',
  'wiki/canonical/architecture/public-capability-placement.md',
  'wiki/canonical/architecture/runtime-isolation.md',
  'wiki/canonical/application-boundaries/web-demo-role.md',
  'wiki/canonical/application-boundaries/desktop-role.md',
  'wiki/canonical/application-boundaries/desktop-tauri-backend-boundary.md',
  'wiki/canonical/governance/ai-governance-control-plane.md',
  'wiki/canonical/governance/command-surface.md',
  'wiki/canonical/governance/dependency-governance.md',
  'wiki/canonical/governance/desktop-security-baseline.md',
  'wiki/canonical/governance/future-owner-approved-lanes.md',
  'wiki/canonical/governance/generated-artifact-policy.md',
  'wiki/canonical/governance/github-governance.md',
  'wiki/canonical/governance/strategic-guardrails.md',
  'wiki/canonical/governance/validation-gates.md',
  'wiki/canonical/packages/contracts-boundary.md',
  'wiki/canonical/packages/core-boundary.md',
  'wiki/canonical/packages/vue-primevue-adapter-role.md',
  'wiki/canonical/runtime/http-runtime-ownership.md',
  'wiki/canonical/runtime/safe-storage-runtime-ownership.md',
  'wiki/canonical/runtime/web-runtime.md',
  'wiki/canonical/runtime/desktop-runtime.md',
  'wiki/canonical/operations/ci-and-deploy.md',
  'wiki/canonical/operations/quickstart.md',
  'wiki/canonical/operations/release-policy.md',
]

const dispositionLabels = {
  canonical: 'canonical page',
  raw: 'raw archive',
  generated: 'generated evidence',
  shim: 'compatibility shim',
  skip: 'obsolete/skip',
  blocker: 'blocker',
}

function repoPath(...segments) {
  return path.join(root, ...segments)
}

function normalizePath(value) {
  return value.split(path.sep).join('/')
}

function readText(relPath) {
  return readFileSync(repoPath(relPath), 'utf8')
}

function fileExists(relPath) {
  return existsSync(repoPath(relPath))
}

function ensureParent(relPath) {
  mkdirSync(path.dirname(repoPath(relPath)), { recursive: true })
}

function writeGenerated(relPath, content) {
  ensureParent(relPath)
  writeFileSync(repoPath(relPath), content.endsWith('\n') ? content : `${content}\n`, 'utf8')
}

function walkFiles(relDir, options = {}) {
  const base = repoPath(relDir)
  const skipDirs = options.skipDirs ?? new Set(['node_modules', 'dist', 'coverage', '.git'])
  const files = []

  function walk(absDir) {
    let entries
    try {
      entries = readdirSync(absDir, { withFileTypes: true })
    } catch {
      return
    }

    for (const entry of entries) {
      if (entry.isDirectory() && skipDirs.has(entry.name)) continue
      const abs = path.join(absDir, entry.name)
      if (entry.isDirectory()) {
        walk(abs)
      } else if (entry.isFile()) {
        const rel = normalizePath(path.relative(root, abs))
        if (!options.extensions || options.extensions.some(ext => rel.endsWith(ext))) {
          files.push(rel)
        }
      }
    }
  }

  if (existsSync(base)) walk(base)
  return files.sort()
}

function parseFrontmatter(content) {
  const lines = content.split('\n')
  if (lines[0] !== '---') return null
  const end = lines.findIndex((line, index) => index > 0 && line === '---')
  if (end === -1) return null

  const data = {}
  let currentKey = null

  for (const rawLine of lines.slice(1, end)) {
    const keyMatch = rawLine.match(/^([A-Za-z0-9_-]+):(?:\s*(.*))?$/)
    if (keyMatch) {
      currentKey = keyMatch[1]
      const rawValue = keyMatch[2] ?? ''
      if (rawValue === '') {
        data[currentKey] = []
      } else {
        data[currentKey] = parseScalar(rawValue)
      }
      continue
    }

    const listMatch = rawLine.match(/^\s*-\s*(.*)$/)
    if (listMatch && currentKey) {
      if (!Array.isArray(data[currentKey])) data[currentKey] = []
      data[currentKey].push(parseScalar(listMatch[1]))
    }
  }

  return { data, endLine: end + 1 }
}

function parseScalar(rawValue) {
  const trimmed = rawValue.trim()
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    const body = trimmed.slice(1, -1).trim()
    if (!body) return []
    return body.split(',').map(value => parseScalar(value))
  }
  if (/^['"].*['"]$/.test(trimmed)) return trimmed.slice(1, -1)
  if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) return Number(trimmed)
  return trimmed
}

function markdownEscape(value) {
  return String(value).replaceAll('|', '\\|')
}

function slugFromPath(relPath) {
  return relPath
    .replace(/^docs\//, '')
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function decisionTarget(relPath) {
  return `wiki/canonical/decisions/${path.posix.basename(relPath, '.md').toLowerCase()}.md`
}

function classifyDocFile(relPath) {
  const base = path.posix.basename(relPath)

  if (base === '.gitkeep' || base === '.gitignore') {
    return {
      disposition: 'skip',
      target: 'not migrated',
      note: 'Repository placeholder or ignore marker; no architecture content.',
    }
  }

  if (relPath === 'docs/README.md') {
    return {
      disposition: 'shim',
      target: 'docs/README.md -> wiki/index.md',
      note: 'Temporary legacy compatibility shim while /docs remains.',
    }
  }

  const exactTargets = new Map([
    ['docs/documentation-system.md', ['canonical', 'wiki/_schema/wiki-governance.md', 'Dual-doc policy folded into wiki schema.']],
    ['docs/architecture.md', ['canonical', 'wiki/canonical/architecture/monorepo-topology.md', 'Architecture entry folded into canonical topology.']],
    ['docs/governance.md', ['canonical', 'wiki/indexes/governance-index.md', 'Governance router replaced by wiki governance index.']],
    ['docs/branch-model.md', ['canonical', 'wiki/canonical/governance/github-governance.md', 'Branch model folded into GitHub governance.']],
    ['docs/project-control-center.md', ['canonical', 'wiki/canonical/operations/project-control-center.md', 'Standalone operations page required before deletion.']],
    ['docs/theme-presets.md', ['canonical', 'wiki/canonical/packages/design-tokens-role.md', 'Theme facts folded into design token ownership.']],
    ['docs/ai-workspace.md', ['canonical', 'wiki/canonical/governance/ai-governance-control-plane.md', '.ai/** remains executable source of truth.']],
    ['docs/architecture/example-route-inventory.md', ['raw', 'wiki/raw/repo-archive/docs-architecture-history-index.md', 'Historical inventory evidence.']],
    ['docs/architecture/legacy-equivalence-checklist.md', ['raw', 'wiki/raw/repo-archive/docs-architecture-history-index.md', 'Historical migration checklist.']],
    ['docs/architecture/legacy-web-demo-cleanup.md', ['raw', 'wiki/raw/repo-archive/docs-architecture-history-index.md', 'Historical cleanup record.']],
    ['docs/architecture/ownership-boundaries.md', ['canonical', 'wiki/canonical/architecture/package-responsibility-matrix.md', 'Boundary facts folded into package responsibility matrix.']],
    ['docs/architecture/stable-baseline.md', ['canonical', 'wiki/canonical/architecture/monorepo-topology.md', 'Stable baseline folded into topology.']],
    ['docs/architecture/vite8-isolated-inventory.md', ['raw', 'wiki/raw/repo-archive/docs-architecture-history-index.md', 'Toolchain migration inventory evidence.']],
    ['docs/governance/historical-artifacts.md', ['raw', 'wiki/raw/repo-archive/docs-historical-governance-index.md', 'Historical artifact policy evidence.']],
    ['docs/governance/primevue-i18n-verification.md', ['raw', 'wiki/raw/repo-archive/docs-historical-governance-index.md', 'Verification evidence; summary remains in PrimeVue adapter page.']],
    ['docs/governance/product-lines.md', ['canonical', 'wiki/canonical/governance/product-scope-boundary.md', 'Current product scope boundary.']],
    ['docs/governance/protocol-versioning.md', ['canonical', 'wiki/canonical/governance/ai-governance-control-plane.md', 'Protocol versioning summarized in AI governance.']],
    ['docs/governance/adapter-architecture.md', ['canonical', 'wiki/canonical/governance/ai-governance-control-plane.md', 'Adapter architecture summarized in AI governance.']],
    ['docs/governance/ai-orchestration.md', ['canonical', 'wiki/canonical/governance/ai-governance-control-plane.md', 'AI orchestration summarized in AI governance.']],
    ['docs/governance/branch-model.md', ['canonical', 'wiki/canonical/governance/github-governance.md', 'Branch governance folded into GitHub governance.']],
    ['docs/governance/dependency-policy.md', ['canonical', 'wiki/canonical/governance/dependency-governance.md', 'Current dependency governance.']],
    ['docs/governance/desktop-security-scope-review.md', ['canonical', 'wiki/canonical/governance/desktop-security-baseline.md', 'Current desktop security baseline.']],
    ['docs/governance/github-governance.md', ['canonical', 'wiki/canonical/governance/github-governance.md', 'Current GitHub governance.']],
    ['docs/governance/README.md', ['canonical', 'wiki/indexes/governance-index.md', 'Governance routing replaced by wiki index.']],
    ['docs/governance/strategic-guardrails.md', ['canonical', 'wiki/canonical/governance/strategic-guardrails.md', 'Current P4 strategic guardrail registry.']],
    ['docs/zh/bugfix-runtime-ui-plan.md', ['raw', 'wiki/raw/repo-archive/docs-zh-bugfix-runtime-ui-plan.md', 'Historical bugfix plan evidence.']],
  ])

  const exact = exactTargets.get(relPath)
  if (exact) {
    return { disposition: exact[0], target: exact[1], note: exact[2] }
  }

  if (relPath.startsWith('docs/generated/')) {
    return {
      disposition: 'generated',
      target: 'wiki/indexes/generated-evidence-index.md',
      note: 'Generator-owned evidence; keep provenance, do not canonicalize by hand.',
    }
  }

  if (relPath.startsWith('docs/ai-runs/')) {
    return {
      disposition: 'raw',
      target: 'wiki/raw/repo-archive/docs-ai-runs-index.md',
      note: 'Historical execution evidence; /docs retained until immutable archive preservation is complete.',
    }
  }

  if (relPath.startsWith('docs/ai-plan/')) {
    return {
      disposition: 'raw',
      target: 'wiki/raw/repo-archive/docs-ai-plan-index.md',
      note: 'Historical planning packet; not canonical architecture prose.',
    }
  }

  if (relPath.startsWith('docs/adr/')) {
    return {
      disposition: 'canonical',
      target: decisionTarget(relPath),
      note: 'ADR ID and decision wording preserved in canonical decision corpus.',
    }
  }

  if (relPath.startsWith('docs/en/')) {
    const name = path.posix.basename(relPath)
    const targetByName = {
      'ai-entry.md': 'wiki/indexes/ai-entry.md',
      'architecture-contract.md': 'wiki/canonical/architecture/monorepo-topology.md',
      'governance-contract.md': 'wiki/indexes/governance-index.md',
      'command-contract.md': 'wiki/canonical/governance/command-surface.md',
      'ci-deploy-contract.md': 'wiki/canonical/operations/ci-and-deploy.md',
      'project-metadata-contract.md': 'wiki/canonical/governance/command-surface.md',
      'troubleshooting-contract.md': 'wiki/canonical/operations/troubleshooting.md',
    }
    return {
      disposition: 'canonical',
      target: targetByName[name] ?? 'wiki/indexes/ai-entry.md',
      note: 'English AI contract facts migrated into English canonical wiki substrate.',
    }
  }

  if (relPath.startsWith('docs/zh/')) {
    const name = path.posix.basename(relPath)
    const targetByName = {
      '00-overview.md': 'wiki/indexes-zh/开始阅读.md',
      '01-quickstart.md': 'wiki/canonical/operations/quickstart.md',
      '02-architecture.md': 'wiki/indexes-zh/架构总览.md',
      '03-governance.md': 'wiki/indexes-zh/治理与验证索引.md',
      '04-project-control-center.md': 'wiki/canonical/operations/project-control-center.md',
      '05-ci-deploy.md': 'wiki/canonical/operations/ci-and-deploy.md',
      '06-ai-workflow.md': 'wiki/canonical/governance/ai-governance-control-plane.md',
      '07-troubleshooting.md': 'wiki/canonical/operations/troubleshooting.md',
      '08-release.md': 'wiki/canonical/operations/release-policy.md',
    }
    return {
      disposition: 'canonical',
      target: targetByName[name] ?? 'wiki/indexes-zh/开始阅读.md',
      note: 'Chinese source content supports presentation metadata and indexes, not duplicate Chinese canon.',
    }
  }

  if (relPath.startsWith('docs/runtime/')) {
    const target = {
      'desktop-runtime.md': 'wiki/canonical/runtime/desktop-runtime.md',
      'execute-reliability.md': 'wiki/canonical/runtime/execute-reliability.md',
      'portable-runtime.md': 'wiki/canonical/runtime/portable-runtime.md',
      'runtime-isolation.md': 'wiki/canonical/architecture/runtime-isolation.md',
      'web-runtime.md': 'wiki/canonical/runtime/web-runtime.md',
    }[path.posix.basename(relPath)]
    return {
      disposition: 'canonical',
      target: target ?? 'wiki/indexes/runtime-index.md',
      note: 'Runtime rule migrated into canonical runtime/architecture pages.',
    }
  }

  if (relPath.startsWith('docs/release/')) {
    const target = path.posix.basename(relPath) === 'runtime-promotion-checklist.md'
      ? 'wiki/canonical/operations/runtime-promotion-checklist.md'
      : 'wiki/canonical/operations/release-policy.md'
    return {
      disposition: 'canonical',
      target,
      note: 'Release policy migrated into operations canon.',
    }
  }

  if (relPath.startsWith('docs/codex/')) {
    return {
      disposition: 'raw',
      target: 'wiki/raw/repo-archive/docs-codex-index.md',
      note: 'Codex-specific support evidence; .ai/** remains canonical control plane.',
    }
  }

  return {
    disposition: 'blocker',
    target: 'unmapped',
    note: 'No migration rule matched this file.',
  }
}

function docsInventory() {
  return walkFiles('docs', { skipDirs: new Set() }).map(sourcePath => ({
    sourcePath,
    ...classifyDocFile(sourcePath),
  }))
}

function wikiMarkdownFiles() {
  return walkFiles('wiki', {
    extensions: ['.md'],
    skipDirs: new Set(['node_modules', 'dist', 'coverage', '.git']),
  })
}

function frontmatterRequiredFor(relPath) {
  return (
    relPath === 'wiki/index.md' ||
    relPath === 'wiki/log.md' ||
    relPath.startsWith('wiki/canonical/') ||
    relPath.startsWith('wiki/indexes/') ||
    relPath.startsWith('wiki/indexes-zh/') ||
    relPath.startsWith('wiki/maps-zh/') ||
    relPath.startsWith('wiki/generated/') ||
    relPath.startsWith('wiki/_schema/')
  )
}

function collectFrontmatterFindings(files) {
  const findings = []
  for (const file of files) {
    if (!frontmatterRequiredFor(file)) continue
    const parsed = parseFrontmatter(readText(file))
    if (!parsed) {
      findings.push({ file, issue: 'missing frontmatter block' })
      continue
    }
    for (const field of requiredFrontmatterFields) {
      const value = parsed.data[field]
      if (
        value === undefined ||
        value === '' ||
        (Array.isArray(value) && value.length === 0)
      ) {
        findings.push({ file, issue: `missing or empty ${field}` })
      }
    }
  }
  return findings
}

function allFrontmatter(files) {
  return files
    .map(file => ({ file, parsed: parseFrontmatter(readText(file)) }))
    .filter(entry => entry.parsed)
}

function sourcePathsFromFrontmatter(files) {
  const paths = []
  for (const { file, parsed } of allFrontmatter(files)) {
    if (!frontmatterRequiredFor(file)) continue
    const sourcePaths = parsed.data.source_paths
    if (!Array.isArray(sourcePaths)) continue
    for (const sourcePath of sourcePaths) {
      paths.push({ file, sourcePath: String(sourcePath) })
    }
  }
  return paths
}

function validateSourcePath(sourcePath) {
  if (sourcePath.startsWith('uploaded://')) return true
  if (/^https?:\/\//.test(sourcePath)) return true
  if (sourcePath.includes('*')) {
    const base = sourcePath.split('*')[0].replace(/\/$/, '')
    return base.length === 0 || fileExists(base)
  }
  return fileExists(sourcePath)
}

function collectSourcePathFindings(files) {
  return sourcePathsFromFrontmatter(files)
    .filter(({ sourcePath }) => !validateSourcePath(sourcePath))
    .map(({ file, sourcePath }) => ({ file, issue: `source path does not resolve: ${sourcePath}` }))
}

function basenameIndex(files) {
  const index = new Map()
  for (const file of files) {
    const key = path.posix.basename(file, '.md')
    const list = index.get(key) ?? []
    list.push(file)
    index.set(key, list)
  }
  return index
}

function collectDuplicateBasenames(files) {
  return [...basenameIndex(files).entries()]
    .filter(([, filesForName]) => filesForName.length > 1)
    .map(([name, filesForName]) => ({ name, files: filesForName }))
}

function extractWikiLinks(content) {
  const links = []
  const re = /\[\[([^\]]+)\]\]/g
  let match
  while ((match = re.exec(content))) {
    const raw = match[1].split('|')[0].split('#')[0].trim()
    if (raw) links.push(raw)
  }
  return links
}

function collectWikiLinkFindings(files) {
  const index = basenameIndex(files)
  const findings = []
  for (const file of files) {
    const links = extractWikiLinks(readText(file))
    for (const link of links) {
      const targetName = path.posix.basename(link, '.md')
      if (!index.has(targetName)) {
        findings.push({ file, issue: `unresolved wikilink: [[${link}]]` })
      }
    }
  }
  return findings
}

function resolveMarkdownLink(fromFile, href) {
  if (
    href.startsWith('#') ||
    href.startsWith('mailto:') ||
    href.startsWith('http://') ||
    href.startsWith('https://') ||
    href.startsWith('uploaded://')
  ) {
    return true
  }
  if (href.includes('://')) return true
  const withoutAnchor = href.split('#')[0]
  if (!withoutAnchor || withoutAnchor.startsWith('<')) return true
  const decoded = decodeURI(withoutAnchor)
  const baseDir = path.posix.dirname(fromFile)
  const target = normalizePath(path.posix.normalize(path.posix.join(baseDir, decoded)))
  return fileExists(target)
}

function collectMarkdownLinkFindings(files) {
  const findings = []
  const markdownLink = /(?<!!)\[[^\]]+\]\(([^)]+)\)/g
  for (const file of files) {
    const content = readText(file)
    let match
    while ((match = markdownLink.exec(content))) {
      const href = match[1].trim().replace(/^<|>$/g, '')
      if (!resolveMarkdownLink(file, href)) {
        findings.push({ file, issue: `unresolved markdown link: ${href}` })
      }
    }
  }
  return findings
}

function inboundLinkMap(files) {
  const inbound = new Map(files.map(file => [file, 0]))
  const nameToFiles = basenameIndex(files)
  for (const file of files) {
    const links = extractWikiLinks(readText(file))
    for (const link of links) {
      const name = path.posix.basename(link, '.md')
      const targets = nameToFiles.get(name) ?? []
      for (const target of targets) {
        inbound.set(target, (inbound.get(target) ?? 0) + 1)
      }
    }
  }
  return inbound
}

function collectOrphans(files) {
  const inbound = inboundLinkMap(files)
  return files
    .filter(file => file.startsWith('wiki/canonical/'))
    .filter(file => (inbound.get(file) ?? 0) === 0)
}

function collectLowConfidence(files) {
  return allFrontmatter(files)
    .filter(({ file }) => frontmatterRequiredFor(file))
    .map(({ file, parsed }) => ({
      file,
      confidence: Number(parsed.data.confidence),
      status: String(parsed.data.status ?? ''),
    }))
    .filter(entry => Number.isFinite(entry.confidence) && entry.confidence < 0.75)
}

function renderFrontmatter(titleEn, titleZh, aliases, tags, tagsZh, confidence, sourcePaths) {
  const lines = [
    '---',
    `title_en: ${titleEn}`,
    `title_zh: ${titleZh}`,
    'aliases:',
    ...aliases.map(alias => `  - ${alias}`),
    'tags:',
    ...tags.map(tag => `  - ${tag}`),
    'tags_zh:',
    ...tagsZh.map(tag => `  - ${tag}`),
    'status: published',
    `confidence: ${confidence.toFixed(2)}`,
    'source_langs:',
    '  - en',
    'source_paths:',
    ...sourcePaths.map(sourcePath => `  - ${sourcePath}`),
    "last_reviewed: '2026-06-11'",
    'wiki_owner: LLM-maintained CCD architecture wiki',
    '---',
    '',
  ]
  return lines.join('\n')
}

function renderMigrationMap(inventory) {
  const counts = countBy(inventory, row => row.disposition)
  const rows = inventory.map(row =>
    `| \`${markdownEscape(row.sourcePath)}\` | ${dispositionLabels[row.disposition]} | \`${markdownEscape(row.target)}\` | ${markdownEscape(row.note)} |`
  )

  return `${renderFrontmatter(
    'Docs to Wiki Migration Map',
    'docs 到 wiki 迁移映射',
    ['Migration map', 'Docs migration inventory', '迁移表'],
    ['index', 'migration', 'docs'],
    ['索引', '迁移', '文档'],
    0.94,
    ['docs/**', 'wiki/canonical/**', 'uploaded://deep-research-report.md']
  )}# \`/docs\` to \`/wiki\` Migration Map

This map is generated by \`pnpm wiki:refresh\` from \`find docs -type f\`-equivalent repository inventory. Every current file under \`docs/**\` receives an explicit disposition.

## Disposition counts

| Disposition | Count |
| --- | ---: |
| canonical page | ${counts.canonical ?? 0} |
| raw archive | ${counts.raw ?? 0} |
| generated evidence | ${counts.generated ?? 0} |
| compatibility shim | ${counts.shim ?? 0} |
| obsolete/skip | ${counts.skip ?? 0} |
| blocker | ${counts.blocker ?? 0} |

## Disposition policy

- \`canonical page\`: durable architecture, governance, runtime, package, operation, or ADR knowledge compiled into English-first wiki pages.
- \`raw archive\`: historical evidence that must not become canonical prose. \`/docs\` remains the live evidence store until immutable archive preservation is complete.
- \`generated evidence\`: generator-owned output reachable through wiki generated-evidence indexes, not hand-edited canonical facts.
- \`compatibility shim\`: legacy routing path kept only to point readers to \`/wiki\`.
- \`obsolete/skip\`: placeholder or ignore file with no architecture content.
- \`blocker\`: inventory item without a migration rule; this must be fixed before deletion readiness.

## Exact \`docs/**\` inventory

| Source path | Disposition | Wiki target or archive pointer | Note |
| --- | --- | --- | --- |
${rows.join('\n')}
`
}

function countBy(items, fn) {
  return items.reduce((acc, item) => {
    const key = fn(item)
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})
}

function renderDocsMigrationStatus(inventory, checks) {
  const counts = countBy(inventory, row => row.disposition)
  const deletionReady = checks.deletionReady ? 'Yes' : 'No'
  return `${renderFrontmatter(
    'Docs Migration Status',
    'docs 迁移状态',
    ['migration status', '迁移状态'],
    ['generated', 'migration'],
    ['生成视图', '迁移'],
    0.90,
    ['wiki/indexes/migration-map.md', 'docs/**']
  )}# Docs Migration Status

Generated view from \`pnpm wiki:refresh\`. It summarizes readiness; the exact file-level map is [[migration-map]].

| Metric | Value |
| --- | ---: |
| \`docs/**\` files inventoried | ${inventory.length} |
| Canonical page dispositions | ${counts.canonical ?? 0} |
| Raw archive dispositions | ${counts.raw ?? 0} |
| Generated evidence dispositions | ${counts.generated ?? 0} |
| Compatibility shims | ${counts.shim ?? 0} |
| Obsolete/skip dispositions | ${counts.skip ?? 0} |
| Blockers | ${counts.blocker ?? 0} |
| \`/docs\` deletion ready | ${deletionReady} |

## Current result

\`/docs\` is kept as a legacy compatibility and evidence layer in this lane.

## Deletion blockers

${checks.deletionBlockers.map(blocker => `- ${blocker}`).join('\n')}
`
}

function renderSourceCoverage(files, inventory) {
  const sourceEntries = sourcePathsFromFrontmatter(files)
  const counts = countBy(sourceEntries, entry => entry.sourcePath)
  const rows = Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([sourcePath, count]) => `| \`${markdownEscape(sourcePath)}\` | ${count} |`)

  const dispositionCounts = countBy(inventory, row => row.disposition)

  return `${renderFrontmatter(
    'Source Coverage',
    '来源覆盖',
    ['source coverage', '来源覆盖'],
    ['generated', 'evidence'],
    ['生成视图', '证据'],
    0.90,
    ['wiki/**/*.md', 'docs/**', '.ai/**', 'apps/**', 'packages/**', 'scripts/**', '.github/workflows/**']
  )}# Source Coverage

Generated view from wiki frontmatter \`source_paths\`.

## Docs disposition coverage

| Disposition | Count |
| --- | ---: |
| canonical page | ${dispositionCounts.canonical ?? 0} |
| raw archive | ${dispositionCounts.raw ?? 0} |
| generated evidence | ${dispositionCounts.generated ?? 0} |
| compatibility shim | ${dispositionCounts.shim ?? 0} |
| obsolete/skip | ${dispositionCounts.skip ?? 0} |
| blocker | ${dispositionCounts.blocker ?? 0} |

## Frontmatter source-path usage

| Source path | References |
| --- | ---: |
${rows.join('\n')}
`
}

function renderMissingFrontmatter(findings) {
  const body = findings.length === 0
    ? 'No required wiki frontmatter gaps were found.'
    : findings.map(finding => `- \`${finding.file}\`: ${finding.issue}`).join('\n')

  return `${renderFrontmatter(
    'Missing Frontmatter',
    '缺失 Frontmatter',
    ['frontmatter lint', 'frontmatter 检查'],
    ['generated', 'lint'],
    ['生成视图', '检查'],
    0.90,
    ['wiki/**/*.md', 'wiki/_schema/frontmatter-contract.md']
  )}# Missing Frontmatter

Generated view from \`pnpm wiki:refresh\`.

## Result

${body}
`
}

function renderOrphanPages(orphans) {
  const body = orphans.length === 0
    ? 'No canonical orphan pages were found by wikilink inbound analysis.'
    : orphans.map(file => `- \`${file}\``).join('\n')

  return `${renderFrontmatter(
    'Orphan Pages',
    '孤立页面',
    ['orphan pages', '孤立页面'],
    ['generated', 'lint'],
    ['生成视图', '检查'],
    0.88,
    ['wiki/**/*.md']
  )}# Orphan Pages

Generated view from \`pnpm wiki:refresh\`. Only canonical pages are treated as orphan candidates.

## Result

${body}
`
}

function renderLowConfidence(lowConfidence) {
  const body = lowConfidence.length === 0
    ? 'No required wiki page is below `0.75` confidence.'
    : lowConfidence
        .map(entry => `- \`${entry.file}\`: confidence \`${entry.confidence}\`, status \`${entry.status}\``)
        .join('\n')

  return `${renderFrontmatter(
    'Low-confidence Pages',
    '低置信度页面',
    ['confidence lint', '低置信度'],
    ['generated', 'lint'],
    ['生成视图', '检查'],
    0.88,
    ['wiki/**/*.md', 'wiki/_schema/status-confidence-policy.md']
  )}# Low-confidence Pages

Generated view from \`pnpm wiki:refresh\`.

## Policy

Pages below \`0.75\` confidence should not appear in reader-facing published views by default.

## Result

${body}
`
}

function renderDeletionReadinessReport(checks) {
  const rows = checks.deletionCriteria
    .map(criteria => `| ${criteria.name} | ${criteria.pass ? 'Pass' : 'Fail'} | ${criteria.note} |`)
    .join('\n')

  return `${renderFrontmatter(
    'Docs Deletion Readiness Report',
    'docs 删除就绪报告',
    ['deletion readiness report', '删除就绪报告'],
    ['generated', 'migration', 'readiness'],
    ['生成视图', '迁移', '就绪'],
    0.90,
    ['wiki/_schema/docs-deletion-readiness.md', 'wiki/indexes/migration-map.md', 'docs/**']
  )}# \`/docs\` Deletion Readiness Report

Generated view from \`pnpm wiki:refresh\`.

| Criterion | Result | Evidence |
| --- | --- | --- |
${rows}

## Decision

\`/docs\` is ${checks.deletionReady ? 'deletion-ready' : 'not deletion-ready'} in this lane.

## Blockers

${checks.deletionBlockers.map(blocker => `- ${blocker}`).join('\n')}
`
}

function renderValidationSummary(allFindings, checks) {
  const rows = allFindings.length === 0
    ? '| wiki validation | Pass | No blocking validation findings. |'
    : allFindings.map(finding => `| wiki validation | Fail | \`${finding.file ?? finding.name ?? 'wiki'}\`: ${finding.issue ?? finding.files?.join(', ')} |`).join('\n')

  return `${renderFrontmatter(
    'Wiki Validation Summary',
    'Wiki 校验摘要',
    ['wiki validation', '校验摘要'],
    ['generated', 'validation'],
    ['生成视图', '校验'],
    0.90,
    ['wiki/**']
  )}# Wiki Validation Summary

Generated view from \`pnpm wiki:refresh\`.

| Check | Result | Detail |
| --- | --- | --- |
${rows}
| docs deletion readiness | ${checks.deletionReady ? 'Pass' : 'Fail'} | See [[docs-deletion-readiness-report]]. |
`
}

function renderSchemaDeletionReadiness(checks) {
  const rows = checks.deletionCriteria
    .map(criteria => `| ${criteria.name} | ${criteria.pass ? 'Pass' : 'Fail'} | ${criteria.note} |`)
    .join('\n')

  return `${renderFrontmatter(
    'Docs Deletion Readiness',
    'docs 删除就绪标准',
    ['Docs Deletion Readiness', 'docs 删除就绪标准'],
    ['schema', 'wiki-governance'],
    ['模式', 'Wiki 治理'],
    0.94,
    ['uploaded://llm-wiki.md', 'README.en.md', 'docs/documentation-system.md', 'docs/README.md', 'wiki/generated/docs-deletion-readiness-report.md']
  )}# \`/docs\` Deletion Readiness

\`/docs\` must not be deleted until all criteria pass.

## Required criteria

- Every current \`/docs\` item is mapped in [[migration-map]].
- Each mapped item has a disposition: canonical page, raw archive, generated evidence, compatibility shim, obsolete/skip, or blocker.
- Every canonical page has required frontmatter and non-empty \`source_paths\`.
- Chinese presentation views exist without duplicating canonical bodies.
- \`README.md\` and \`README.en.md\` have cut over to \`/wiki\` as the architecture KB portal.
- Link validation passes for wiki links and repo path references.
- Generated evidence remains reachable from \`wiki/generated/**\` or evidence indexes.
- Historical docs that must survive \`/docs\` deletion are archived under \`wiki/raw/repo-archive/**\` or another immutable evidence location.
- Repository validation commands for the lane pass in a real checkout.

## Current lane readiness

| Criterion | Result | Evidence |
| --- | --- | --- |
${rows}

## Current decision

\`/docs\` is ${checks.deletionReady ? 'deletion-ready' : 'not deletion-ready'} in this lane.

See [[docs-deletion-readiness-report]] and [[docs-migration-status]] for the generated evidence view.
`
}

function computeDeletionChecks(inventory, validationFindings) {
  const migrationBlockers = inventory.filter(row => row.disposition === 'blocker')
  const readmeCutover =
    fileExists('README.md') &&
    fileExists('README.en.md') &&
    readText('README.md').includes('wiki/index.md') &&
    readText('README.md').includes('wiki/indexes-zh/开始阅读.md') &&
    readText('README.en.md').includes('wiki/indexes/ai-entry.md')
  const docsShim =
    fileExists('docs/README.md') &&
    readText('docs/README.md').includes('../wiki/index.md')
  const generatedEvidenceReachable =
    fileExists('wiki/indexes/generated-evidence-index.md') &&
    readText('wiki/indexes/generated-evidence-index.md').includes('docs/generated') &&
    readText('wiki/indexes/generated-evidence-index.md').includes('.ai/generated')
  const rawArchiveComplete = false
  const repositoryValidationRecorded = false

  const deletionCriteria = [
    {
      name: 'Exact docs inventory mapped',
      pass: migrationBlockers.length === 0 && inventory.length > 0,
      note: `${inventory.length} files inventoried; ${migrationBlockers.length} blocker rows.`,
    },
    {
      name: 'Required wiki validation passes',
      pass: validationFindings.length === 0,
      note: `${validationFindings.length} blocking wiki validation findings.`,
    },
    {
      name: 'README cutover complete',
      pass: readmeCutover,
      note: 'Root README portals point to wiki index, Chinese presentation, and AI entry.',
    },
    {
      name: 'docs README compatibility shim',
      pass: docsShim,
      note: '`docs/README.md` points to `/wiki` and declares `/docs` non-canonical.',
    },
    {
      name: 'Generated evidence reachable',
      pass: generatedEvidenceReachable,
      note: '`wiki/indexes/generated-evidence-index.md` covers generated evidence roots.',
    },
    {
      name: 'Raw archive preservation complete',
      pass: rawArchiveComplete,
      note: 'Raw archive rows are indexed, but historical `/docs` files are not fully copied into immutable `wiki/raw/repo-archive/**` paths.',
    },
    {
      name: 'Repository validation recorded',
      pass: repositoryValidationRecorded,
      note: 'This generated report does not embed final command logs; final PR report must list fresh validation results.',
    },
  ]

  const deletionBlockers = deletionCriteria
    .filter(criteria => !criteria.pass)
    .map(criteria => `${criteria.name}: ${criteria.note}`)

  return {
    deletionCriteria,
    deletionBlockers,
    deletionReady: deletionBlockers.length === 0,
  }
}

function collectValidationFindings(files, inventory) {
  const linkableFiles = files.filter(frontmatterRequiredFor)
  const findings = [
    ...collectFrontmatterFindings(files),
    ...collectSourcePathFindings(files),
    ...collectWikiLinkFindings(linkableFiles),
    ...collectMarkdownLinkFindings(linkableFiles),
  ]

  for (const duplicate of collectDuplicateBasenames(linkableFiles)) {
    findings.push({
      name: duplicate.name,
      files: duplicate.files,
      issue: 'duplicate wiki basename breaks Obsidian wikilink resolution',
    })
  }

  for (const requiredPage of requiredArchitecturePages) {
    if (!fileExists(requiredPage)) {
      findings.push({
        file: requiredPage,
        issue: 'required architecture wiki page is missing',
      })
    }
  }

  for (const row of inventory) {
    if (row.disposition === 'blocker') {
      findings.push({
        file: row.sourcePath,
        issue: 'docs migration inventory row has blocker disposition',
      })
    }
  }

  if (fileExists('wiki/indexes/migration-map.md')) {
    const migrationMap = readText('wiki/indexes/migration-map.md')
    for (const row of inventory) {
      if (!migrationMap.includes(row.sourcePath)) {
        findings.push({
          file: 'wiki/indexes/migration-map.md',
          issue: `missing docs inventory row: ${row.sourcePath}`,
        })
      }
    }
  }

  return findings
}

function main() {
  const inventory = docsInventory()
  let files = wikiMarkdownFiles()
  let validationFindings = collectValidationFindings(files, inventory)
  let deletionChecks = computeDeletionChecks(inventory, validationFindings)

  if (shouldWrite) {
    const orphans = collectOrphans(files)
    const lowConfidence = collectLowConfidence(files)
    const frontmatterFindings = collectFrontmatterFindings(files)

    writeGenerated('wiki/indexes/migration-map.md', renderMigrationMap(inventory))
    writeGenerated('wiki/generated/docs-migration-status.md', renderDocsMigrationStatus(inventory, deletionChecks))
    writeGenerated('wiki/generated/source-coverage.md', renderSourceCoverage(files, inventory))
    writeGenerated('wiki/generated/missing-frontmatter.md', renderMissingFrontmatter(frontmatterFindings))
    writeGenerated('wiki/generated/orphan-pages.md', renderOrphanPages(orphans))
    writeGenerated('wiki/generated/low-confidence-pages.md', renderLowConfidence(lowConfidence))
    writeGenerated('wiki/generated/docs-deletion-readiness-report.md', renderDeletionReadinessReport(deletionChecks))
    writeGenerated('wiki/_schema/docs-deletion-readiness.md', renderSchemaDeletionReadiness(deletionChecks))

    files = wikiMarkdownFiles()
    validationFindings = collectValidationFindings(files, inventory)
    deletionChecks = computeDeletionChecks(inventory, validationFindings)
    writeGenerated('wiki/generated/wiki-validation-summary.md', renderValidationSummary(validationFindings, deletionChecks))
  }

  if (validationFindings.length > 0) {
    console.error(`[wiki:validate] Found ${validationFindings.length} blocking finding(s).`)
    for (const finding of validationFindings.slice(0, 50)) {
      const location = finding.file ?? finding.name ?? 'wiki'
      const detail = finding.issue ?? finding.files?.join(', ') ?? 'unknown finding'
      console.error(`- ${location}: ${detail}`)
    }
    if (validationFindings.length > 50) {
      console.error(`- ... ${validationFindings.length - 50} more finding(s) omitted`)
    }
    process.exit(1)
  }

  console.log(
    `[wiki:validate] OK. docs_files=${inventory.length} deletion_ready=${deletionChecks.deletionReady ? 'yes' : 'no'}`
  )
  if (!deletionChecks.deletionReady) {
    console.log('[wiki:validate] /docs remains required; see wiki/generated/docs-deletion-readiness-report.md')
  }
}

main()
