#!/usr/bin/env node

import fs from 'node:fs'
import process from 'node:process'

const required = [
  'AGENTS.md',
  '.ai/protocol/AGENTS.core.md',
  '.ai/protocol/adapters/codex.md',
  '.ai/manifests/skill-routing.json',
  '.ai/skills/project-ui/SKILL.md',
]
const missing = required.filter(file => !fs.existsSync(file))
if (missing.length > 0) {
  console.error(`Missing Codex inputs: ${missing.join(', ')}`)
  process.exit(1)
}
console.log('Codex preflight passed')
