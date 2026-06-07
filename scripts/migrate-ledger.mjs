#!/usr/bin/env node
import assert from 'node:assert/strict'
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

function parseTaskLine(line) {
  const markdownMatch = line.match(/^- \[([ x])\] \[([^\]\r\n]+)\] (.+)$/)
  if (markdownMatch) return markdownMatch

  return line.match(/^\[(⬜️|✅)\] \[([^\]\r\n]+)\] (.+)$/u)
}

function isMalformedTaskLikeLine(line) {
  return (
    /^- \[(?:\s*|[xX]|⬜️|✅)\]/u.test(line) || /^\[(?:⬜️|✅)\]/u.test(line)
  )
}

function formatTaskLineError(lineNumber, line) {
  return [
    `Malformed repair ledger task on line ${lineNumber}: ${line}`,
    'Expected canonical Markdown task: "- [ ] [Module] Task" or "- [x] [Module] Task".',
    'Temporary legacy task syntax remains accepted: "[⬜️] [Module] Task" or "[✅] [Module] Task".',
  ].join('\n')
}

function parseLedger(content) {
  const tasks = []
  let sequence = ''

  for (const [index, rawLine] of content.split('\n').entries()) {
    const line = rawLine.trim()
    if (!line) continue
    if (line.startsWith('#')) {
      sequence = line.replace(/^#+\s*/, '').replace(/\.$/, '')
      continue
    }

    const match = parseTaskLine(line)
    if (!match) {
      if (isMalformedTaskLikeLine(line)) throw new Error(formatTaskLineError(index + 1, line))
      continue
    }

    const [, statusMarker, module, title] = match
    const status =
      statusMarker === '✅' || statusMarker === 'x' ? 'done' : 'open'
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

function runParserSelfCheck() {
  const content = [
    '# Runtime Ledger.',
    '',
    '- Target path: `.ai/runtime/repair_list.md`',
    '- `[ ]` means open.',
    '| Validation | Command |',
    '| --- | --- |',
    'Rationale: this is prose, not a task.',
    '- [ ] [P0-Ledger-Parser] Preserve `scripts/migrate-ledger.mjs`, `.ai/runtime/repair_list.md`, punctuation, and parentheses (strict).',
    '- [x] [P1-RouteModule-Smoke] Keep paths like `apps/web-demo/src/router/modules/example.ts` and commas, periods, colons: intact.',
    '- [docs](https://example.test) is a normal Markdown link bullet, not a task.',
  ].join('\n')

  assert.deepEqual(parseLedger(content), [
    {
      id: 'p0-p0-ledger-parser-preserve-scripts-migrate-ledger-mjs-ai-runtime-repair-list-m',
      priority: 'P0',
      module: 'P0-Ledger-Parser',
      sequence: 'Runtime Ledger',
      status: 'open',
      title:
        'Preserve `scripts/migrate-ledger.mjs`, `.ai/runtime/repair_list.md`, punctuation, and parentheses (strict).',
      files: ['scripts/migrate-ledger.mjs', '.ai/runtime/repair_list.md'],
      createdAt: null,
      completedAt: null,
    },
    {
      id: 'p1-p1-routemodule-smoke-keep-paths-like-apps-web-demo-src-router-modules-example',
      priority: 'P1',
      module: 'P1-RouteModule-Smoke',
      sequence: 'Runtime Ledger',
      status: 'done',
      title:
        'Keep paths like `apps/web-demo/src/router/modules/example.ts` and commas, periods, colons: intact.',
      files: ['apps/web-demo/src/router/modules/example.ts'],
      createdAt: null,
      completedAt: null,
    },
  ])

  assert.deepEqual(
    parseLedger(
      [
        '## Legacy',
        '[⬜️] [P0-Ledger-LegacyParser] Preserve old open icon syntax.',
        '[✅] [P0-Ledger-LegacyParser] Preserve old done icon syntax.',
      ].join('\n')
    ).map(task => ({
      module: task.module,
      status: task.status,
      title: task.title,
    })),
    [
      {
        module: 'P0-Ledger-LegacyParser',
        status: 'open',
        title: 'Preserve old open icon syntax.',
      },
      {
        module: 'P0-Ledger-LegacyParser',
        status: 'done',
        title: 'Preserve old done icon syntax.',
      },
    ]
  )

  assert.throws(
    () => parseLedger('- [X] [P0-Ledger-Parser] Uppercase X is not canonical.'),
    /Malformed repair ledger task on line 1/
  )
  assert.throws(
    () => parseLedger('- [ ] Missing module label.'),
    /Malformed repair ledger task on line 1/
  )
  assert.throws(
    () => parseLedger('- [x] [P0-Ledger-Parser]'),
    /Malformed repair ledger task on line 1/
  )

  console.log('[LEDGER] parser self-check passed')
}

if (process.argv.includes('--self-check')) {
  runParserSelfCheck()
  process.exit(0)
}

if (!existsSync(inputPath)) {
  console.error(
    `Ledger migration failed: ${relative(cwd, inputPath)} does not exist. Run pnpm ai:sync to create the local Markdown ledger from .ai/runtime/repair_list.template.md, then rerun this command.`
  )
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
