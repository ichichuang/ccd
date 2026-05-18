#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const cwd = process.cwd()
const version = JSON.parse(fs.readFileSync(path.join(cwd, '.ai', 'protocol', 'version.json'), 'utf8'))
const manifest = JSON.parse(fs.readFileSync(path.join(cwd, '.ai', 'protocol', 'adapter-manifest.json'), 'utf8'))

if (!manifest.adapterMetadata || typeof manifest.adapterMetadata !== 'object') {
  console.error('[FAIL] adapterMetadata missing from .ai/protocol/adapter-manifest.json')
  process.exit(1)
}

for (const name of Object.keys(manifest.adapterGuides)) {
  const meta = manifest.adapterMetadata[name]
  if (!meta) {
    console.error(`[FAIL] adapter metadata missing for ${name}`)
    process.exit(1)
  }
  if (meta.compatibleProtocolVersion !== version.protocolVersion) {
    console.error(`[FAIL] ${name} protocol mismatch: ${meta.compatibleProtocolVersion} != ${version.protocolVersion}`)
    process.exit(1)
  }
}

console.log('[OK] adapter compatibility validated')
