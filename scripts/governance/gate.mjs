#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'

const isolatedPreflightRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ccd-governance-gate-'))

const checks = [
  {
    name: 'project metadata drift',
    command: ['bash', 'scripts/exec.sh', 'pnpm', 'project:doctor'],
    failure:
      'Project metadata drift detected. Update project.config.json first, then run pnpm project:sync and re-run pnpm project:doctor. Do NOT manually edit derived metadata files.',
  },
  {
    name: 'governance assets',
    command: ['bash', 'scripts/exec.sh', 'pnpm', 'governance:validate'],
  },
  {
    name: 'P6 UI source enforcement',
    command: ['pnpm', 'ui:source:validate'],
  },
  {
    name: 'P5 routing contract',
    command: ['node', 'scripts/governance/project-ui-routing-validate.mjs'],
  },
  {
    name: 'adapter routing activation',
    command: ['node', 'scripts/governance/adapters-validate.mjs'],
  },
  {
    name: 'rule-index v2 freshness',
    command: ['node', 'scripts/generate-rule-index.mjs', '--check'],
  },
  {
    name: 'seed isolated Codex target',
    command: [
      'node',
      'scripts/ai-sync-codex.mjs',
      '--target-root',
      path.join(isolatedPreflightRoot, 'codex', 'skills'),
    ],
  },
  {
    name: 'isolated Codex preflight',
    command: [
      'node',
      'scripts/codex-preflight.mjs',
      '--target-root',
      path.join(isolatedPreflightRoot, 'codex', 'skills'),
    ],
  },
  {
    name: 'seed isolated Claude target',
    command: [
      'node',
      'scripts/ai-sync-claude.mjs',
      '--project-root',
      path.join(isolatedPreflightRoot, 'claude-project'),
    ],
  },
  {
    name: 'isolated Claude preflight',
    command: [
      'node',
      'scripts/claude-preflight.mjs',
      '--project-root',
      path.join(isolatedPreflightRoot, 'claude-project'),
    ],
  },
  {
    name: 'AI architecture guard',
    command: ['bash', 'scripts/exec.sh', 'pnpm', 'ai:guard', '--', '--format=json'],
  },
  {
    name: 'architecture boundaries',
    command: ['bash', 'scripts/exec.sh', 'pnpm', 'arch:boundaries'],
  },
  {
    name: 'runtime leak detection',
    command: ['bash', 'scripts/exec.sh', 'pnpm', 'arch:runtime'],
  },
  {
    name: 'desktop security baseline',
    command: ['bash', 'scripts/exec.sh', 'pnpm', 'desktop:security'],
  },
  {
    name: 'CSS px-to-rem policy',
    command: ['bash', 'scripts/exec.sh', 'pnpm', 'css:pxtorem:check'],
  },
  {
    name: 'API snapshot compatibility',
    command: ['bash', 'scripts/exec.sh', 'pnpm', 'api:report'],
  },
  {
    name: 'supply-chain policy',
    command: ['bash', 'scripts/exec.sh', 'pnpm', 'supply:check'],
  },
  {
    name: 'release topology',
    command: ['bash', 'scripts/exec.sh', 'pnpm', 'release:governance'],
  },
  {
    name: 'GitHub workflow registry hygiene',
    command: ['node', 'scripts/governance/check-github-workflow-registry.mjs'],
  },
  {
    name: 'governance report generation',
    command: ['bash', 'scripts/exec.sh', 'pnpm', 'arch:report'],
    restorePaths: ['.ai/generated/governance-report.json', 'wiki/generated/governance-report.md'],
  },
  {
    name: 'dependency graph generation',
    command: ['bash', 'scripts/exec.sh', 'pnpm', 'arch:graphs'],
  },
  {
    name: 'wiki command validation',
    command: ['node', 'scripts/wiki/check-wiki-commands.mjs'],
    failure:
      'Documentation references nonexistent package.json scripts. Fix the source documentation, generator source, or policy source — do NOT manually edit generated files.',
  },
  {
    name: 'web-demo UI inventory freshness',
    command: ['node', 'scripts/wiki/check-ui-inventory.mjs'],
    failure:
      'wiki/generated/web-demo-ui-inventory.md drifted from the live route surface. Refresh it from the route modules + showcaseCatalog.ts + constants/router.ts and re-run pnpm wiki:ui-inventory:check.',
  },
]

const generatedArtifactPaths = ['wiki/generated', '.ai/generated', '.ai/governance/api-snapshots']

const generatedFormatGlobs = [
  'wiki/generated/**/*.json',
  'wiki/generated/**/*.md',
  '.ai/generated/**/*.json',
  '.ai/generated/**/*.md',
  '.ai/governance/api-snapshots/**/*.json',
]

function normalizeGeneratedArtifacts() {
  spawnSync(
    'pnpm',
    ['exec', 'prettier', '--write', '--no-error-on-unmatched-pattern', ...generatedFormatGlobs],
    {
      cwd: process.cwd(),
      encoding: 'utf8',
      stdio: 'pipe',
    }
  )
  spawnSync('pnpm', ['generated:normalize'], {
    cwd: process.cwd(),
    encoding: 'utf8',
    stdio: 'pipe',
  })
}

function runCheck(check) {
  console.log(`\n[gate] ${check.name}`)
  const snapshots = (check.restorePaths ?? []).map(relPath => ({
    relPath,
    content: fs.readFileSync(relPath),
    mode: fs.statSync(relPath).mode,
  }))
  let result
  try {
    result = spawnSync(check.command[0], check.command.slice(1), {
      cwd: process.cwd(),
      encoding: 'utf8',
      stdio: 'inherit',
    })
  } finally {
    for (const snapshot of snapshots) {
      fs.writeFileSync(snapshot.relPath, snapshot.content, { mode: snapshot.mode })
      fs.chmodSync(snapshot.relPath, snapshot.mode)
    }
  }

  if (result.status === 0) return true
  console.error(`\n[gate:fail] ${check.name}`)
  if (check.failure) console.error(check.failure)
  return false
}

function gitSnapshot() {
  const result = spawnSync('git', ['diff', '--', ...generatedArtifactPaths], {
    cwd: process.cwd(),
    encoding: 'utf8',
    stdio: 'pipe',
  })
  if (result.status !== 0) return null
  return result.stdout.trim()
}

const generatedBefore = gitSnapshot()
let ok = true
for (const check of checks) {
  ok = runCheck(check) && ok
  if (!ok) break
}

if (ok) {
  console.log('\n[gate] normalizing generated artifacts before sync check')
  normalizeGeneratedArtifacts()
  console.log('\n[gate] governance artifact sync')
  const generatedAfter = gitSnapshot()
  if (generatedBefore !== generatedAfter) {
    console.error('\n[gate:fail] governance artifact sync')
    console.error(
      'Generated governance artifacts changed during the gate. Run pnpm governance:gate locally and commit updated wiki/generated, .ai/generated, and .ai/governance/api-snapshots outputs.'
    )
    const nameOnly = spawnSync('git', ['diff', '--name-only', '--', ...generatedArtifactPaths], {
      cwd: process.cwd(),
      encoding: 'utf8',
      stdio: 'pipe',
    })
    if (nameOnly.stdout?.trim()) {
      console.error('\n[gate] changed generated files:')
      console.error(nameOnly.stdout.trim())
    }
    const stat = spawnSync('git', ['diff', '--stat', '--', ...generatedArtifactPaths], {
      cwd: process.cwd(),
      encoding: 'utf8',
      stdio: 'pipe',
    })
    if (stat.stdout?.trim()) {
      console.error('\n[gate] change summary:')
      console.error(stat.stdout.trim())
    }
    ok = false
  }
}

fs.rmSync(isolatedPreflightRoot, { recursive: true, force: true })
if (!ok) process.exit(1)
console.log('\n[gate:pass] unified governance gate passed')
