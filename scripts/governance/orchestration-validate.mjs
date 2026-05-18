#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const cwd = process.cwd()
const orchestration = JSON.parse(fs.readFileSync(path.join(cwd, '.ai', 'orchestration', 'manifest.json'), 'utf8'))

if (!Array.isArray(orchestration.roles) || orchestration.roles.length === 0) {
  console.error('[FAIL] orchestration roles missing')
  process.exit(1)
}

for (const role of orchestration.roles) {
  if (!role.id || !Array.isArray(role.scope) || !Array.isArray(role.permissions)) {
    console.error(`[FAIL] invalid orchestration role: ${JSON.stringify(role)}`)
    process.exit(1)
  }
}

console.log('[OK] orchestration manifest validated')
