#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const ROOTS = [join(ROOT, 'docs/generated'), join(ROOT, '.ai/generated')]
const EXTENSIONS = new Set(['.md', '.json'])

function collectFiles(dir, files = []) {
  if (!existsSync(dir)) return files
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
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
