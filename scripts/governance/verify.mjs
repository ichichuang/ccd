#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { createGovernanceSnapshot } from './snapshot.mjs'

const snapshotPath = path.join(process.cwd(), '.ai/governance-snapshot.json')
const fail = message => {
  console.error(`[FAIL] ${message}`)
  process.exitCode = 1
}
const ok = message => console.log(`[OK] ${message}`)

if (!fs.existsSync(snapshotPath)) {
  fail('missing .ai/governance-snapshot.json; run pnpm governance:snapshot')
  process.exit()
}

const current = createGovernanceSnapshot({ write: false })
const stored = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'))
const fields = [
  'schemaVersion',
  'runtimePolicyHash',
  'providerPolicyHash',
  'routingPolicyHash',
  'transportPolicyHash',
  'fingerprint',
  'codexVersion',
]

for (const field of fields) {
  if (stored[field] !== current[field]) {
    fail(`governance snapshot drift: ${field}; run pnpm governance:snapshot`)
  } else {
    ok(`governance snapshot ${field}`)
  }
}
