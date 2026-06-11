#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import process from 'node:process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const ROOTS = [
  join(ROOT, 'wiki/generated'),
  join(ROOT, '.ai/generated'),
  join(ROOT, '.ai/governance/api-snapshots'),
]
const FORMAT_GLOBS = [
  'wiki/generated/**/*.json',
  'wiki/generated/**/*.md',
  '.ai/generated/**/*.json',
  '.ai/generated/**/*.md',
  '.ai/governance/api-snapshots/**/*.json',
]
const EXTENSIONS = new Set(['.md', '.json'])

const prettier = spawnSync(
  'pnpm',
  ['exec', 'prettier', '--write', '--no-error-on-unmatched-pattern', ...FORMAT_GLOBS],
  {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: 'pipe',
  }
)

if (prettier.status !== 0) {
  if (prettier.stdout) process.stdout.write(prettier.stdout)
  if (prettier.stderr) process.stderr.write(prettier.stderr)
  process.exit(prettier.status ?? 1)
}

function collectFiles(dir, files = []) {
  if (!existsSync(dir)) return files
  for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      collectFiles(path, files)
      continue
    }
    if (entry.isFile() && EXTENSIONS.has(extname(entry.name))) {
      files.push(path)
    }
  }
  return files
}

let changed = 0

for (const root of ROOTS) {
  for (const file of collectFiles(root)) {
    const before = readFileSync(file, 'utf-8')
    const after = `${before
      .replace(/[ \t]+$/gm, '')
      .replace(/\r\n/g, '\n')
      .replace(/\n*$/u, '')}\n`
    if (after !== before) {
      writeFileSync(file, after, 'utf-8')
      changed += 1
    }
  }
}

console.log(`Generated output normalized: ${changed} file${changed === 1 ? '' : 's'} changed`)
