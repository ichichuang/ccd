#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const cwd = process.cwd()
const required = [
  '.ai/protocol/version.json',
  '.ai/governance/policies/version.json',
  '.ai/governance/policies/topology.json',
  '.ai/governance/policies/runtime.json',
  '.ai/governance/policies/ai.json',
  '.ai/governance/policies/api.json',
  '.ai/governance/policies/supply-chain.json',
  '.ai/governance/policies/release.json',
  '.ai/orchestration/manifest.json',
  '.ai/runtime-profile/local/profile.json',
  '.ai/runtime-profile/desktop/profile.json',
  '.changeset/config.json',
  '.github/CODEOWNERS',
  'mise.toml',
  'scripts/env.sh',
  'scripts/exec.sh',
  'scripts/env-doctor.mjs',
  'scripts/ai-os-doctor.mjs',
  'scripts/bootstrap-runtime.sh',
  'docs/architecture/stable-baseline.md',
  'docs/architecture/legacy-web-demo-cleanup.md',
  'legacy/README.md',
  'docs/runtime/execute-reliability.md',
  'docs/runtime/runtime-isolation.md',
  'docs/governance/protocol-versioning.md',
  'docs/governance/adapter-architecture.md',
  'docs/governance/ai-orchestration.md',
  'docs/release/release-policy.md',
  'docs/release/runtime-promotion-checklist.md',
  'legacy/root-app/ARCHIVE.md',
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

function readJsonIfExists(rel) {
  const absolute = path.join(cwd, rel)
  if (!fs.existsSync(absolute)) return null
  return JSON.parse(fs.readFileSync(absolute, 'utf8'))
}

function requireCondition(condition, okMessage, failMessage) {
  if (condition) {
    console.log(`[OK] ${okMessage}`)
    return
  }
  console.error(`[FAIL] ${failMessage}`)
  failed = true
}
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


const topology = readJsonIfExists('.ai/governance/policies/topology.json')
if (topology?.legacyArchive) {
  const legacy = topology.legacyArchive
  requireCondition(
    legacy.path === 'legacy/root-app' && fs.existsSync(path.join(cwd, legacy.path)),
    `legacy archive path governed: ${legacy.path}`,
    'legacy archive path must be legacy/root-app and exist'
  )
  requireCondition(
    legacy.activeGraphEntryForbidden === true && legacy.workspaceParticipationForbidden === true,
    'legacy archive is blocked from active graph and workspace participation',
    'legacy archive policy must forbid active graph entry and workspace participation'
  )

  const workspace = fs.existsSync(path.join(cwd, 'pnpm-workspace.yaml'))
    ? fs.readFileSync(path.join(cwd, 'pnpm-workspace.yaml'), 'utf8')
    : ''
  requireCondition(
    !workspace.includes('legacy'),
    'pnpm workspace excludes legacy archive',
    'pnpm workspace must not include legacy archive paths'
  )

  const tsconfig = readJsonIfExists('tsconfig.json')
  requireCondition(
    Array.isArray(tsconfig?.exclude) && tsconfig.exclude.includes('legacy/**'),
    'root tsconfig excludes legacy archive',
    'root tsconfig must exclude legacy/**'
  )

  for (const target of legacy.activeEditTargets ?? []) {
    requireCondition(
      fs.existsSync(path.join(cwd, target)),
      `active edit target exists: ${target}`,
      `active edit target missing: ${target}`
    )
  }
}

process.exit(failed ? 1 : 0)
