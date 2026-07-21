#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const root = process.cwd()
const check = process.argv.includes('--check')

const outputs = new Map([
  [
    '.ai/protocol/AI.entry.md',
    '# AI Entry\n\nThe canonical repository protocol is `.ai/protocol/AGENTS.core.md`.\n\nLoad the canonical protocol first, then the relevant rules and skills. Client guidance is available in `.ai/protocol/adapters/codex.md` and `.ai/protocol/adapters/claude.md`.\n',
  ],
  [
    '.ai/protocol/adapters/README.md',
    '# AI Client Adapters\n\nThese files map the shared repository protocol to Codex and Claude. They do not override `.ai/protocol/AGENTS.core.md`.\n',
  ],
  [
    '.ai/protocol/adapters/codex.md',
    '# Codex Adapter\n\nRead `AGENTS.md`, then load the applicable rules and routed skills. Prefer repository scripts and existing package commands. Keep file edits scoped and validate production boundaries before reporting completion.\n',
  ],
  [
    '.ai/protocol/adapters/claude.md',
    '# Claude Adapter\n\nRead `CLAUDE.md`, follow its pointer to `AGENTS.md`, then load the applicable rules and routed skills. Preserve repository architecture and validate production boundaries before reporting completion.\n',
  ],
  [
    'AGENTS.md',
    '# CCD AI Entry\n\nCanonical protocol: `.ai/protocol/AGENTS.core.md`.\n\nLoad that file first, followed by the relevant rules under `.ai/rules/**` and skills under `.ai/skills/**`. Codex-specific guidance is in `.ai/protocol/adapters/codex.md`.\n',
  ],
  [
    'CLAUDE.md',
    '# Claude Entry\n\nRead `AGENTS.md`, then `.ai/protocol/adapters/claude.md`.\n',
  ],
])

const drift = []
for (const [relativePath, content] of outputs) {
  const absolutePath = path.join(root, relativePath)
  if (check) {
    if (!fs.existsSync(absolutePath) || fs.readFileSync(absolutePath, 'utf8') !== content) {
      drift.push(relativePath)
    }
    continue
  }
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true })
  fs.writeFileSync(absolutePath, content)
}

if (drift.length > 0) {
  console.error(`AI adapter drift: ${drift.join(', ')}`)
  process.exit(1)
}

console.log(check ? 'AI adapters are current' : 'AI adapters synchronized')
