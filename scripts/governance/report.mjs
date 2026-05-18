#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { readJson, writeJson, writeText, exists } from './utils.mjs'

const adapterManifest = readJson('.ai/protocol/adapter-manifest.json')
const protocolVersion = readJson('.ai/protocol/version.json')
const orchestration = readJson('.ai/orchestration/manifest.json')
const ruleIndex = readJson('.ai/manifests/rule-index.json')
const skillRouting = readJson('.ai/manifests/skill-routing.json')

const orphanChecks = {
  docsGeneratedExists: exists('docs/generated'),
  orchestrationManifestExists: exists('.ai/orchestration/manifest.json'),
  protocolVersionExists: exists('.ai/protocol/version.json'),
}

const report = {
  schemaVersion: 1,
  generatedBy: 'scripts/governance/report.mjs',
  protocolVersion,
  adapters: Object.keys(adapterManifest.adapterGuides),
  repoDefaults: adapterManifest.repoDefaults,
  orchestrationRoles: orchestration.roles.map(role => role.id),
  ruleCount: ruleIndex.rules.length,
  routedSkillCount: skillRouting.routes.length,
  orphanChecks,
}

writeJson('.ai/generated/governance-report.json', report)
writeText('docs/generated/governance-report.md', `# Governance Report\n\n- Protocol version: ${protocolVersion.protocolVersion}\n- Manifest version: ${protocolVersion.manifestVersion}\n- Adapter version: ${protocolVersion.adapterVersion}\n- Governance version: ${protocolVersion.governanceVersion}\n- Adapters: ${Object.keys(adapterManifest.adapterGuides).join(', ')}\n- Orchestration roles: ${orchestration.roles.map(role => role.id).join(', ')}\n- Rule count: ${ruleIndex.rules.length}\n- Skill routes: ${skillRouting.routes.length}\n\n## Orphan Checks\n\n- docs/generated present: ${orphanChecks.docsGeneratedExists}\n- orchestration manifest present: ${orphanChecks.orchestrationManifestExists}\n- protocol version present: ${orphanChecks.protocolVersionExists}\n`)
