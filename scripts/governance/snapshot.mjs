#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { paths, writeJson } from './utils.mjs'

const hash = value => createHash('sha256').update(value).digest('hex')
const hashFiles = relPaths => {
  const payload = relPaths
    .map(relPath => {
      const abs = path.join(paths.cwd, relPath)
      return fs.existsSync(abs) ? `${relPath}\n${fs.readFileSync(abs, 'utf8')}` : `${relPath}\n<MISSING>`
    })
    .join('\n---\n')
  return hash(payload)
}

const codexVersion = () => {
  try {
    return execFileSync('/Users/cc/.codex/bin/codex', ['--version'], { encoding: 'utf8' }).trim()
  } catch {
    return 'unresolved'
  }
}

export function createGovernanceSnapshot({ write = true } = {}) {
  const entries = fs.readdirSync(paths.cwd, { withFileTypes: true }).map(entry => entry.name).sort()
  const docs = fs.existsSync(path.join(paths.cwd, 'docs')) ? fs.readdirSync(path.join(paths.cwd, 'docs')).sort() : []
  const ai = fs.existsSync(path.join(paths.cwd, '.ai')) ? fs.readdirSync(path.join(paths.cwd, '.ai')).sort() : []
  const scripts = fs.existsSync(path.join(paths.cwd, 'scripts')) ? fs.readdirSync(path.join(paths.cwd, 'scripts')).sort() : []

  const runtimePolicyHash = hashFiles([
    '.ai/protocol/AGENTS.core.md',
    '.ai/rules/core/00-global-architect.mdc',
    '.ai/rules/core/00-root-gatekeeper.mdc',
    '.ai/rules/core/01-global-preflight.mdc',
    '.ai/orchestration/manifest.json',
    'packages/ccd-core/README.md',
    'packages/runtime-portable/README.md',
    'packages/runtime-desktop/README.md',
  ])
  const providerPolicyHash = hashFiles([
    'scripts/diagnostics/codex-provider-inspect.mjs',
    'scripts/runtime/provider-transport-validate.mjs',
    '.ai/execution/provider-session.json',
  ])
  const routingPolicyHash = hashFiles([
    '.ai/manifests/skill-routing.json',
    '.ai/skills/codex/task-orchestrator/SKILL.md',
    'scripts/diagnostics/codex-routing-inspect.mjs',
  ])
  const transportPolicyHash = hashFiles([
    'scripts/runtime/execution-utils.mjs',
    'scripts/runtime/codex-exec-wrapper.mjs',
    '.ai/execution/runtime-session.json',
  ])

  const snapshot = {
    schemaVersion: '1.0.0',
    generatedBy: 'scripts/governance/snapshot.mjs',
    generatedAt: new Date().toISOString(),
    codexVersion: codexVersion(),
    runtimeFamilies: ['web', 'desktop', 'portable'],
    topology: {
      core: 'packages/ccd-core',
      runtimes: ['packages/runtime-desktop', 'packages/runtime-portable'],
      apps: ['apps/main-app', 'apps/examples', 'apps/playground'],
    },
    runtimePolicyHash,
    providerPolicyHash,
    routingPolicyHash,
    transportPolicyHash,
    rootEntries: entries,
    docsEntries: docs,
    aiEntries: ai,
    scriptEntries: scripts,
  }
  snapshot.fingerprint = hash(JSON.stringify({
    schemaVersion: snapshot.schemaVersion,
    runtimePolicyHash,
    providerPolicyHash,
    routingPolicyHash,
    transportPolicyHash,
    topology: snapshot.topology,
  }))

  if (write) {
    writeJson('.ai/generated/architecture-snapshot.json', snapshot)
    writeJson('.ai/governance-snapshot.json', snapshot)
  }

  return snapshot
}

const isCli = process.argv[1] === fileURLToPath(import.meta.url)
if (isCli) createGovernanceSnapshot()
