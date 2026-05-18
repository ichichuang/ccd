#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const cwd = process.cwd()
const target = path.join(cwd, '.ai', 'generated', 'drift-repair.json')
fs.mkdirSync(path.dirname(target), { recursive: true })
fs.writeFileSync(target, `${JSON.stringify({ schemaVersion: 1, generatedBy: 'scripts/governance/drift-repair.mjs', repairedAt: new Date(0).toISOString(), actions: ['deterministic-placeholder'] }, null, 2)}\n`, 'utf8')
console.log('[REPAIR] .ai/generated/drift-repair.json')
process.exit(0)
