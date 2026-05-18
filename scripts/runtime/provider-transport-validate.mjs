#!/usr/bin/env node
import process from 'node:process'
import { canonicalProvider, codexConfigProvider, expectedTransportForProvider, loadOrchestration } from './execution-utils.mjs'

const provider = canonicalProvider()
const transport = codexConfigProvider()
let failed = false
const fail = message => {
  failed = true
  console.error(`[FAIL] ${message}`)
}
const ok = message => console.log(`[OK] ${message}`)

if (!provider) fail('ACTIVE_CODEX_PROVIDER unresolved')
else ok(`ACTIVE_CODEX_PROVIDER=${provider}`)

if (!transport) fail('codex execute transport unresolved')
else ok(`execute transport=${transport}`)

const expectedTransport = expectedTransportForProvider(provider)
if (expectedTransport && transport !== expectedTransport) {
  fail(`provider transport mismatch: ${provider} expects ${expectedTransport}, got ${transport}`)
} else if (expectedTransport) {
  ok('provider transport aligned')
} else if (provider) {
  fail(`provider transport mapping unresolved for ${provider}`)
}

const orchestration = loadOrchestration()
if (!Array.isArray(orchestration.roles) || orchestration.roles.length === 0) fail('orchestration roles unresolved')
else ok(`orchestration roles=${orchestration.roles.length}`)

process.exit(failed ? 1 : 0)
