#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import process from 'node:process'

const root = process.cwd()

const scanPaths = [
  'README.md',
  'README.en.md',
  'AGENTS.md',
  'CLAUDE.md',
  'wiki',
  '.ai/README.md',
  '.ai/protocol',
]

const excludeDirs = new Set(['node_modules', 'dist', '.git'])

const nonScriptSubcommands = new Set([
  'install', 'exec', 'dlx', 'outdated', 'update',
  'add', 'remove', 'list', 'audit', 'pack', 'publish',
  'rebuild', 'store', 'import', 'deploy', 'licenses',
  'patch', 'patch-commit', 'why', 'init', 'test',
  'start', 'stop', 'restart', 'edit', 'server',
  'create', 'dedupe', 'link', 'unlink', 'peer',
  'setup', 'env', 'help', 'version', 'binaries',
  'run',
])

function readPackageScripts() {
  const raw = readFileSync(join(root, 'package.json'), 'utf8')
  const pkg = JSON.parse(raw)
  return new Set(Object.keys(pkg.scripts ?? {}))
}

function collectMarkdownFiles() {
  const files = []

  function walk(dir) {
    let entries
    try {
      entries = readdirSync(dir, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      if (excludeDirs.has(entry.name)) continue
      const full = join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(full)
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(full)
      }
    }
  }

  for (const p of scanPaths) {
    const full = join(root, p)
    try {
      const st = statSync(full)
      if (st.isDirectory()) {
        walk(full)
      } else if (st.isFile() && p.endsWith('.md')) {
        files.push(full)
      }
    } catch {
      // path does not exist, skip
    }
  }

  return files
}

function extractScriptName(raw) {
  let s = raw.replace(/`/g, '').trim()
  s = s.replace(/^(?:[A-Z_][A-Z0-9_]*=\S+\s+)+/, '')
  if (!s.startsWith('pnpm')) return null

  const rest = s.slice(4).trim()
  if (!rest) return null
  const tokens = rest.split(/\s+/)

  let i = 0
  while (i < tokens.length) {
    const t = tokens[i]
    if (t === '--filter' || t === '-F') { i += 2; continue }
    if (t.startsWith('-')) { i++; continue }
    break
  }
  if (i >= tokens.length) return null

  let cmd = tokens[i]
  if (cmd === 'run') {
    i++
    if (i >= tokens.length) return null
    cmd = tokens[i]
  }

  const m = cmd.match(/^[a-zA-Z0-9][a-zA-Z0-9:_-]*/)
  if (!m) return null
  cmd = m[0].replace(/:+$/, '')
  if (!cmd || nonScriptSubcommands.has(cmd)) return null
  return cmd
}

function extractPnpmStrings(line) {
  const results = []
  const inlineRe = /`([^`]*pnpm[^`]+)`/g
  let m
  while ((m = inlineRe.exec(line)) !== null) {
    if (/pnpm\s+/.test(m[1])) results.push(m[1])
  }

  const trimmed = line.trim()
  if (/(?:[A-Z_][A-Z0-9_]*=\S+\s+)*pnpm\s+/.test(trimmed) && !trimmed.startsWith('-') && !trimmed.startsWith('*')) {
    if (!results.some(r => trimmed.includes(r.trim()))) results.push(trimmed)
  }

  return results
}

function scanFile(filePath, scripts) {
  const content = readFileSync(filePath, 'utf8')
  const relPath = relative(root, filePath)
  const findings = []
  const lines = content.split('\n')
  let ignoreRange = false

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx]
    if (/<!--\s*wiki-commands:\s*ignore-start\s*-->/.test(line)) {
      ignoreRange = true
      continue
    }
    if (/<!--\s*wiki-commands:\s*ignore-end\s*-->/.test(line)) {
      ignoreRange = false
      continue
    }
    if (ignoreRange) continue

    for (const raw of extractPnpmStrings(line)) {
      const script = extractScriptName(raw)
      if (!script || scripts.has(script)) continue
      findings.push({
        file: relPath,
        line: lineIdx + 1,
        command: raw.replace(/`/g, '').trim(),
        script,
      })
    }
  }

  return findings
}

const scripts = readPackageScripts()
const files = collectMarkdownFiles()
const allFindings = files.flatMap(file => scanFile(file, scripts))

if (allFindings.length > 0) {
  console.error(`\n[wiki-commands] Found ${allFindings.length} reference(s) to nonexistent package.json scripts:\n`)
  for (const f of allFindings) {
    console.error(`  ${f.file}:${f.line}`)
    console.error(`    command: ${f.command}`)
    console.error(`    missing script: ${f.script}`)
    console.error('')
  }
  console.error('[wiki-commands] Fix the source documentation, generator source, or policy source.')
  console.error('[wiki-commands] Do not manually edit generated files; regenerate them instead.\n')
  process.exit(1)
}

console.log(`[wiki-commands] All pnpm command references in wiki/AI documentation are valid. (${files.length} files scanned)`)
