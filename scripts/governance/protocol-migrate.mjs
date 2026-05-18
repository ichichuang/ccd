#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const cwd = process.cwd()
const version = JSON.parse(fs.readFileSync(path.join(cwd, '.ai', 'protocol', 'version.json'), 'utf8'))
const manifest = JSON.parse(fs.readFileSync(path.join(cwd, '.ai', 'protocol', 'adapter-manifest.json'), 'utf8'))

const compatibility = Object.entries(manifest.adapterGuides).map(([name, relPath]) => ({
  name,
  relPath,
  compatibleProtocolVersion: version.protocolVersion,
  compatibleAdapterVersion: version.adapterVersion,
}))

fs.mkdirSync(path.join(cwd, '.ai', 'generated'), { recursive: true })
fs.writeFileSync(path.join(cwd, '.ai', 'generated', 'protocol-compatibility.json'), `${JSON.stringify({ schemaVersion: 1, generatedBy: 'scripts/governance/protocol-migrate.mjs', compatibility }, null, 2)}\n`, 'utf8')
console.log('[PROTOCOL] .ai/generated/protocol-compatibility.json')
process.exit(0)
