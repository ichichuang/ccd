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
  'wiki/generated/source-coverage.md',
  'wiki/generated/missing-frontmatter.md',
  'wiki/generated/orphan-pages.md',
  'wiki/generated/low-confidence-pages.md',
  'wiki/generated/wiki-validation-summary.md',
]

const requiredArchitecturePages = [
  'wiki/index.md',
  'wiki/indexes/ai-entry.md',
  'wiki/indexes/application-boundaries-index.md',
  'wiki/indexes/architecture-index.md',
  'wiki/indexes/decisions-index.md',
  'wiki/indexes/generated-evidence-index.md',
  'wiki/indexes/governance-index.md',
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
      data[currentKey] = rawValue === '' ? [] : parseScalar(rawValue)
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

function countBy(items, fn) {
  return items.reduce((acc, item) => {
    const key = fn(item)
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})
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

function renderSourceCoverage(files) {
  const sourceEntries = sourcePathsFromFrontmatter(files)
  const counts = countBy(sourceEntries, entry => entry.sourcePath)
  const rows = Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([sourcePath, count]) => `| \`${markdownEscape(sourcePath)}\` | ${count} |`)

  return `${renderFrontmatter(
    'Source Coverage',
    '来源覆盖',
    ['source coverage', '来源覆盖'],
    ['generated', 'evidence'],
    ['生成视图', '证据'],
    0.90,
    ['README.md', 'README.en.md', '.ai/**', '.github/**', 'apps/**', 'packages/**', 'scripts/**', 'wiki/**']
  )}# Source Coverage

Generated view from wiki frontmatter \`source_paths\`.

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

function renderValidationSummary(allFindings) {
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
| legacy documentation tree retired | Pass | The repository policy allows the legacy tree to be absent; Git history is the historical archive. |
`
}

function collectValidationFindings(files) {
  const linkableFiles = files.filter(file =>
    frontmatterRequiredFor(file) && file !== 'wiki/generated/wiki-validation-summary.md'
  )
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

  for (const generatedTarget of generatedTargets) {
    if (!shouldWrite && !fileExists(generatedTarget)) {
      findings.push({
        file: generatedTarget,
        issue: 'generated validation artifact is missing; run pnpm wiki:refresh',
      })
    }
  }

  return findings
}

function main() {
  const files = wikiMarkdownFiles()
  const initialFindings = collectValidationFindings(files)
  const orphans = collectOrphans(files)
  const lowConfidence = collectLowConfidence(files)

  if (shouldWrite) {
    writeGenerated('wiki/generated/source-coverage.md', renderSourceCoverage(files))
    writeGenerated('wiki/generated/missing-frontmatter.md', renderMissingFrontmatter(collectFrontmatterFindings(files)))
    writeGenerated('wiki/generated/orphan-pages.md', renderOrphanPages(orphans))
    writeGenerated('wiki/generated/low-confidence-pages.md', renderLowConfidence(lowConfidence))
    const refreshedFiles = wikiMarkdownFiles()
    const refreshedFindings = collectValidationFindings(refreshedFiles)
    writeGenerated('wiki/generated/wiki-validation-summary.md', renderValidationSummary(refreshedFindings))
  }

  const finalFiles = shouldWrite ? wikiMarkdownFiles() : files
  const findings = collectValidationFindings(finalFiles)

  if (findings.length > 0) {
    console.error(`[wiki:validate] ${findings.length} blocking finding(s)`)
    for (const finding of findings) {
      console.error(`- ${finding.file ?? finding.name}: ${finding.issue ?? finding.files?.join(', ')}`)
    }
    if (!shouldWrite && initialFindings.some(finding => generatedTargets.includes(finding.file))) {
      console.error('[wiki:validate] run pnpm wiki:refresh to regenerate wiki/generated summaries')
    }
    process.exit(1)
  }

  if (shouldWrite) {
    console.log('[wiki:refresh] generated wiki validation views')
  }
  console.log('[wiki:validate] wiki validation passed')
}

main()
