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
  'docs',
  'wiki',
  '.ai/README.md',
  '.ai/protocol',
]

const excludeDirs = new Set(['node_modules', 'dist', '.git'])

// pnpm subcommands that are not package scripts — always valid
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

/**
 * Given a raw pnpm command string (from inline code or code block),
 * extract the script name. Returns null if not a script reference.
 */
function extractScriptName(raw) {
  // Remove backticks
  let s = raw.replace(/`/g, '').trim()

  // Strip leading env var assignments: FOO=bar BAZ=qux pnpm ...
  s = s.replace(/^(?:[A-Z_][A-Z0-9_]*=\S+\s+)+/, '')

  // Must start with pnpm
  if (!s.startsWith('pnpm')) return null

  // Tokenise after pnpm
  const rest = s.slice(4).trim()
  if (!rest) return null
  const tokens = rest.split(/\s+/)

  // Walk past flags
  let i = 0
  while (i < tokens.length) {
    const t = tokens[i]
    if (t === '--filter' || t === '-F') { i += 2; continue }
    if (t.startsWith('-')) { i++; continue }
    break
  }
  if (i >= tokens.length) return null

  let cmd = tokens[i]

  // Skip "run" keyword — next token is the script
  if (cmd === 'run') {
    i++
    if (i >= tokens.length) return null
    cmd = tokens[i]
  }

  // Only keep valid script-name characters at start
  const m = cmd.match(/^[a-zA-Z0-9][a-zA-Z0-9:_-]*/)
  if (!m) return null
  cmd = m[0]

  // Remove trailing colon if it's punctuation (not part of script name)
  // Script names can contain colons (e.g. build:ci) but not end with one
  cmd = cmd.replace(/:+$/, '')
  if (!cmd) return null

  // Known non-script subcommands
  if (nonScriptSubcommands.has(cmd)) return null

  return cmd
}

/**
 * Extract pnpm command strings from a markdown line.
 * Sources: inline code spans, code-block lines, and prose with colon-containing scripts.
 */
function extractPnpmStrings(line) {
  const results = []

  // 1. Inline code spans containing "pnpm"
  const inlineRe = /`([^`]*pnpm[^`]+)`/g
  let m
  while ((m = inlineRe.exec(line)) !== null) {
    if (/pnpm\s+/.test(m[1])) results.push(m[1])
  }

  // 2. Bare pnpm lines (code blocks): line starts with optional env vars then pnpm
  const trimmed = line.trim()
  if (/(?:[A-Z_][A-Z0-9_]*=\S+\s+)*pnpm\s+/.test(trimmed) && !trimmed.startsWith('-') && !trimmed.startsWith('*')) {
    // Only if it's not already captured as inline
    if (!results.some(r => trimmed.includes(r.trim()))) {
      results.push(trimmed)
    }
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

    // HTML comment ignore markers (range-based)
    if (/<!--\s*doc-commands:\s*ignore-start\s*-->/.test(line)) {
      ignoreRange = true
      continue
    }
    if (/<!--\s*doc-commands:\s*ignore-end\s*-->/.test(line)) {
      ignoreRange = false
      continue
    }

    if (ignoreRange) continue

    const pnpmStrings = extractPnpmStrings(line)

    for (const raw of pnpmStrings) {
      const script = extractScriptName(raw)
      if (!script) continue
      if (scripts.has(script)) continue
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

// --- Main ---

const scripts = readPackageScripts()
const files = collectMarkdownFiles()
const allFindings = []

for (const file of files) {
  const findings = scanFile(file, scripts)
  allFindings.push(...findings)
}

if (allFindings.length > 0) {
  console.error(`\n[doc-commands] Found ${allFindings.length} reference(s) to nonexistent package.json scripts:\n`)
  for (const f of allFindings) {
    console.error(`  ${f.file}:${f.line}`)
    console.error(`    command: ${f.command}`)
    console.error(`    missing script: ${f.script}`)
    console.error('')
  }
  console.error('[doc-commands] Fix the source documentation, generator source, or policy source.')
  console.error('[doc-commands] Do NOT manually edit generated files — regenerate them instead.\n')
  process.exit(1)
}

console.log(`[doc-commands] All pnpm command references in documentation are valid. (${files.length} files scanned)`)
