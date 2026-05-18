#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const cwd = process.cwd()
const required = [
  '.ai/protocol/version.json',
  '.ai/orchestration/manifest.json',
  'mise.toml',
  'scripts/env.sh',
  'scripts/exec.sh',
  'scripts/env-doctor.mjs',
  'scripts/ai-os-doctor.mjs',
  'scripts/bootstrap-runtime.sh',
  'docs/architecture/stable-baseline.md',
  'docs/runtime/execute-reliability.md',
  'docs/runtime/runtime-isolation.md',
  'docs/governance/protocol-versioning.md',
  'docs/governance/adapter-architecture.md',
  'docs/governance/ai-orchestration.md',
  'scripts/diagnostics/codex-execute-doctor.mjs',
  'scripts/diagnostics/codex-cache-inspect.mjs',
  'scripts/diagnostics/codex-provider-inspect.mjs',
  'scripts/diagnostics/codex-routing-inspect.mjs',
  'scripts/runtime/codex-exec-wrapper.mjs',
  'scripts/runtime/cache-governance.mjs',
  'scripts/runtime/provider-transport-validate.mjs',
  '.ai/execution/execution-fingerprint.json',
  '.ai/execution/provider-session.json',
  '.ai/execution/runtime-session.json',
]

let failed = false
for (const rel of required) {
  if (!fs.existsSync(path.join(cwd, rel))) {
    console.error(`[FAIL] missing governance asset: ${rel}`)
    failed = true
  } else {
    console.log(`[OK] governance asset: ${rel}`)
  }
}

const versionPath = path.join(cwd, '.ai/protocol/version.json')
if (fs.existsSync(versionPath)) {
  const version = JSON.parse(fs.readFileSync(versionPath, 'utf8'))
  const versionFields = [
    'protocolVersion',
    'manifestVersion',
    'adapterVersion',
    'governanceVersion',
    'governanceBaselineVersion',
    'runtimeProfileSchemaVersion',
    'routerSchemaVersion',
  ]

  for (const field of versionFields) {
    if (typeof version[field] !== 'string' || version[field].length === 0) {
      console.error(`[FAIL] missing protocol version field: ${field}`)
      failed = true
    } else {
      console.log(`[OK] protocol version field: ${field}=${version[field]}`)
    }
  }
}

process.exit(failed ? 1 : 0)
