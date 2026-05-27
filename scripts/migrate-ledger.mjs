#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import process from 'node:process'

const cwd = process.cwd()
const inputPath = join(cwd, '.ai', 'runtime', 'repair_list.md')
const outputPath = join(cwd, '.ai', 'runtime', 'repair-ledger.json')

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

function extractPriority(module) {
  const match = module.match(/^P\d+/)
  return match ? match[0] : 'PX'
}

function extractFiles(title) {
  const matches = Array.from(title.matchAll(/`([^`]+)`/g))
  return [...new Set(matches.map(match => match[1]).filter(value => /[/.]/.test(value)))]
}

function parseLedger(content) {
  const tasks = []
  let sequence = ''

  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim()
    if (!line) continue
    if (line.startsWith('#')) {
      sequence = line.replace(/^#+\s*/, '').replace(/\.$/, '')
      continue
    }

    const markdownMatch = line.match(/^-\s+\[([ xX])\]\s+\[([^\]]+)\]\s+(.+)$/)
    const legacyMatch = line.match(/^\[(⬜️|✅)\]\s+\[([^\]]+)\]\s+(.+)$/)
    const match = markdownMatch ?? legacyMatch
    if (!match) continue

    const [, statusMarker, module, title] = match
    const status =
      statusMarker === '✅' || statusMarker.toLowerCase() === 'x' ? 'done' : 'open'
    const priority = extractPriority(module)
    const baseId = slugify(`${priority}-${module}-${title}`)

    tasks.push({
      id: baseId || `task-${tasks.length + 1}`,
      priority,
      module,
      sequence,
      status,
      title,
      files: extractFiles(title),
      createdAt: null,
      completedAt: null,
    })
  }

  return tasks
}

if (!existsSync(inputPath)) {
  console.error(`Ledger migration failed: ${relative(cwd, inputPath)} does not exist.`)
  process.exit(1)
}

const tasks = parseLedger(readFileSync(inputPath, 'utf8'))
const manifest = {
  schemaVersion: 1,
  generatedBy: 'scripts/migrate-ledger.mjs',
  source: relative(cwd, inputPath).split('\\').join('/'),
  tasks,
}

mkdirSync(dirname(outputPath), { recursive: true })
writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`)
console.log(`[LEDGER] ${relative(cwd, outputPath)} (${tasks.length} tasks)`)
