#!/usr/bin/env node
import { brotliCompressSync, gzipSync } from 'node:zlib'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import process from 'node:process'

const cwd = process.cwd()
const distDirCandidates = [
  process.env.CCD_BUNDLE_DIST,
  join(cwd, 'dist'),
  join(cwd, 'apps/web-demo/dist'),
].filter(Boolean)
const distDir = distDirCandidates.find(candidate => existsSync(candidate))

const KiB = 1024

const budgets = {
  entryJsGzipKiB: 260,
  entryCssGzipKiB: 120,
  vendorCoreGzipKiB: 220,
  vendorUiGzipKiB: 460,
  vendorHeavyGzipKiB: 620,
}

function walkFiles(dir) {
  if (!existsSync(dir)) return []
  const out = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const abs = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walkFiles(abs))
    else out.push(abs)
  }
  return out
}

function compressedSizes(absPath) {
  const buf = readFileSync(absPath)
  return {
    raw: buf.length,
    gzip: gzipSync(buf, { level: 9 }).length,
    brotli: brotliCompressSync(buf).length,
  }
}

function sumAssets(files, predicate) {
  return files.filter(predicate).reduce(
    (acc, file) => {
      const sizes = compressedSizes(file)
      acc.raw += sizes.raw
      acc.gzip += sizes.gzip
      acc.brotli += sizes.brotli
      acc.files.push(relative(cwd, file))
      return acc
    },
    { raw: 0, gzip: 0, brotli: 0, files: [] }
  )
}

function formatKiB(bytes) {
  return `${(bytes / KiB).toFixed(1)} KiB`
}

function resolveHtmlAssetReferences(html, pattern) {
  const refs = new Set()
  for (const match of html.matchAll(pattern)) {
    const assetPath = match[1]
    if (/^(?:https?:)?\/\//.test(assetPath)) continue
    const normalizedPath = assetPath.replace(/^\//, '')
    refs.add(join(distDir, normalizedPath))
  }
  return refs
}

if (!distDir) {
  console.error(
    `Bundle budget check failed: no dist directory found. Checked: ${distDirCandidates
      .map(candidate => relative(cwd, candidate) || '.')
      .join(', ')}. Run pnpm build:web-demo first or set CCD_BUNDLE_DIST.`
  )
  process.exit(1)
}

const allFiles = walkFiles(distDir).filter(file => statSync(file).isFile())
const jsFiles = allFiles.filter(file => file.endsWith('.js'))
const cssFiles = allFiles.filter(file => file.endsWith('.css'))
const indexHtmlPath = join(distDir, 'index.html')
const indexHtml = existsSync(indexHtmlPath) ? readFileSync(indexHtmlPath, 'utf8') : ''
const htmlEntryJsFiles = resolveHtmlAssetReferences(
  indexHtml,
  /<script\b[^>]*\btype=["']module["'][^>]*\bsrc=["']([^"']+\.js)["'][^>]*>/g
)
const htmlEntryCssFiles = resolveHtmlAssetReferences(
  indexHtml,
  /<link\b[^>]*\brel=["']stylesheet["'][^>]*\bhref=["']([^"']+\.css)["'][^>]*>/g
)

if (htmlEntryJsFiles.size === 0 || htmlEntryCssFiles.size === 0) {
  console.error(
    `Bundle budget check failed: index.html entry assets were not found in ${relative(
      cwd,
      indexHtmlPath
    )}. Run pnpm build:web-demo first.`
  )
  process.exit(1)
}

const groups = [
  {
    id: 'entry-js',
    budgetKey: 'entryJsGzipKiB',
    assets: sumAssets(jsFiles, file => htmlEntryJsFiles.has(file)),
  },
  {
    id: 'entry-css',
    budgetKey: 'entryCssGzipKiB',
    assets: sumAssets(cssFiles, file => htmlEntryCssFiles.has(file)),
  },
  {
    id: 'vendor-core',
    budgetKey: 'vendorCoreGzipKiB',
    assets: sumAssets(jsFiles, file => /vendor-core-.*\.js$/.test(file)),
  },
  {
    id: 'vendor-ui',
    budgetKey: 'vendorUiGzipKiB',
    assets: sumAssets(jsFiles, file => /vendor-ui-.*\.js$/.test(file)),
  },
  {
    id: 'vendor-heavy',
    budgetKey: 'vendorHeavyGzipKiB',
    assets: sumAssets(jsFiles, file => /vendor-heavy-.*\.js$/.test(file)),
  },
]

const findings = []

console.log('Bundle budget report')
console.log('====================')
for (const group of groups) {
  const budgetKiB = budgets[group.budgetKey]
  const gzipKiB = group.assets.gzip / KiB
  const status = gzipKiB <= budgetKiB ? '[OK]' : '[FAIL]'
  console.log(
    `${status} ${group.id}: gzip=${formatKiB(group.assets.gzip)}, brotli=${formatKiB(group.assets.brotli)}, raw=${formatKiB(group.assets.raw)} / budget=${budgetKiB} KiB`
  )
  if (group.assets.files.length > 0) {
    group.assets.files.forEach(file => console.log(`  - ${file}`))
  }
  if (gzipKiB > budgetKiB) {
    findings.push({
      id: group.id,
      gzipKiB: Number(gzipKiB.toFixed(1)),
      budgetKiB,
      files: group.assets.files,
    })
  }
}

if (findings.length > 0) {
  console.error('\nBundle budgets exceeded:')
  findings.forEach(finding => {
    console.error(`  - ${finding.id}: ${finding.gzipKiB} KiB > ${finding.budgetKiB} KiB`)
  })
  process.exit(1)
}

console.log('Bundle budgets passed.')
