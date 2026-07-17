#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

import {
  EXPECTED_PROJECT_UI,
  EXPECTED_OUTPUTS,
  compareOutputs,
  renderOutputs,
  validateManifest,
} from '../generate-ai-protocol-adapters.mjs'

const ROOT = process.cwd()
const readJson = relPath => JSON.parse(fs.readFileSync(path.join(ROOT, relPath), 'utf8'))
const fail = message => {
  console.error(`[FAIL] ${message}`)
  process.exit(1)
}

try {
  const version = readJson('.ai/protocol/version.json')
  const manifest = readJson('.ai/protocol/adapter-manifest.json')
  const routing = readJson('.ai/manifests/skill-routing.json')
  const scopes = readJson('.ai/manifests/routing-scopes.json')
  const lock = readJson('.ai/manifests/skills-lock.json')

  validateManifest(manifest, { root: ROOT })
  if (EXPECTED_OUTPUTS.length !== 6 || manifest.coldStart.outputs.length !== 6)
    fail('adapter contract must declare exactly six generated outputs')

  for (const name of Object.keys(manifest.adapterGuides)) {
    const metadata = manifest.adapterMetadata?.[name]
    if (!metadata) fail(`adapter metadata missing for ${name}`)
    if (metadata.compatibleProtocolVersion !== version.protocolVersion)
      fail(
        `${name} protocol mismatch: ${metadata.compatibleProtocolVersion} != ${version.protocolVersion}`
      )
  }

  if (routing.version !== 3 || routing.routerVersion !== 1)
    fail('routing manifest must use version 3 and router version 1')
  if (scopes.version !== 1 || scopes.globSemantics !== 'ccd-routing-glob/v1')
    fail('routing scopes must use ccd-routing-glob/v1')
  if (lock.version !== 3 || lock.skills?.['project-ui']?.syncTargets?.includes('claude') !== true)
    fail('Skill lock v3 must activate project-ui for Claude')
  if (JSON.stringify(manifest.projectUi) !== JSON.stringify(EXPECTED_PROJECT_UI))
    fail('projectUi adapter activation must match the frozen contract')
  if (manifest.projectUi.activation.legacyGenericDesignChain !== false)
    fail('legacy generic design chain must remain disabled')

  const comparisons = compareOutputs(manifest, renderOutputs(manifest, { root: ROOT }), {
    root: ROOT,
  })
  const stale = comparisons.filter(record => !record.exists || !record.matches)
  if (stale.length > 0)
    fail(`generated adapters are stale: ${stale.map(record => record.path).join(', ')}`)

  console.log('[OK] adapter compatibility, routing activation, and six generated outputs validated')
} catch (error) {
  fail(error instanceof Error ? error.message : String(error))
}
