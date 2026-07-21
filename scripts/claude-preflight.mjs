#!/usr/bin/env node

import fs from 'node:fs'
import process from 'node:process'

const required = [
  'CLAUDE.md',
  'AGENTS.md',
  '.ai/protocol/AGENTS.core.md',
  '.ai/protocol/adapters/claude.md',
  '.ai/skills/project-ui/SKILL.md',
]
const missing = required.filter(file => !fs.existsSync(file))
if (missing.length > 0) {
  console.error(`Missing Claude inputs: ${missing.join(', ')}`)
  process.exit(1)
}
console.log('Claude preflight passed')
