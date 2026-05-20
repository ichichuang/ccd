import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { generateSkillsLock, validateSkillRoutingTargets } from './skill-lock-utils.mjs'

const cwd = process.cwd()
const openOnly = process.argv.includes('--open')
const currentBranch =
  spawnSync('git', ['branch', '--show-current'], {
    cwd,
    encoding: 'utf8',
    stdio: 'pipe',
  }).stdout.trim() || 'unknown'

const canonicalMustExist = [
  '.ai/README.md',
  '.ai/protocol/AI.entry.md',
  '.ai/protocol/AGENTS.core.md',
  '.ai/protocol/adapter-manifest.json',
  '.ai/protocol/adapters/README.md',
  '.ai/protocol/adapters/codex.md',
  '.ai/protocol/adapters/claude.md',
  '.ai/rules/core/00-global-architect.mdc',
  '.ai/rules/core/00-root-gatekeeper.mdc',
  '.ai/rules/core/01-global-preflight.mdc',
  '.ai/rules/core/02-ui-preflight.mdc',
  '.ai/rules/core/10-ai-generation-workflow.mdc',
  'scripts/skill-lock-utils.mjs',
  'scripts/ai-architecture-guard.mjs',
  'scripts/ai-route-view-scaffold.mjs',
  '.ai/skills/core/unocss/SKILL.md',
  '.ai/skills/core/vite/SKILL.md',
  '.ai/skills/core/vue/SKILL.md',
  '.ai/skills/core/vueuse-functions/SKILL.md',
  '.ai/skills/codex/architecture-browser-master/SKILL.md',
  '.ai/skills/codex/task-orchestrator/SKILL.md',
  '.ai/skills/codex/github-ops/SKILL.md',
  '.ai/skills/codex/desktop-tauri-guard/SKILL.md',
  'scripts/ai-sync.mjs',
  'scripts/generate-ai-protocol-adapters.mjs',
  'scripts/ai-doctor.mjs',
  'scripts/codex-preflight.mjs',
  'scripts/ai-clean.mjs',
  'scripts/ai-sync-codex.mjs',
  '.ai/runtime/repair_list.template.txt',
  '.ai/manifests/skill-routing.json',
  '.ai/manifests/skills-lock.json',
  '.ai/manifests/rule-index.json',
]

const fileAdapters = [{ target: 'AGENTS.md', source: '.ai/protocol/AI.entry.md' }]

const generatedContentChecks = [
  {
    target: 'CLAUDE.md',
    includes: ['[AGENTS.md](./AGENTS.md)', '.ai/protocol/adapter-manifest.json'],
  },
]

const dirAdapters = []

const localRuntimeFiles = ['.ai/runtime/repair_list.txt', '.ai/runtime/repair-ledger.json']
const retiredShouldBeAbsent = [
  '.cursor',
  '.ai/config/cursor.settings.json',
  '.ai/protocol/adapters/cursor.md',
  '.ai/protocol/adapters/gemini.md',
  '.ai/skills/cursor',
  '.ai/manifests/gemini-skill-index.json',
]
const architectureGateChecks = [
  {
    rel: '.husky/pre-commit',
    label: 'local architecture gate',
    acceptedCommands: ['pnpm ai:doctor', 'node scripts/ai-doctor.mjs'],
  },
  {
    rel: '.github/workflows/ci.yml',
    label: 'ci architecture gate',
    acceptedCommands: ['pnpm ai:doctor', 'node scripts/ai-doctor.mjs'],
  },
]

let hasError = false

const fail = msg => {
  hasError = true
  console.log(`[FAIL] ${msg}`)
}

const ok = msg => console.log(`[OK] ${msg}`)

const prepareInternalPackages = () => {
  console.log('[PREP] internal packages for doctor')
  const result = spawnSync('pnpm', ['ci:prepare-internal'], {
    cwd,
    encoding: 'utf8',
    stdio: 'pipe',
  })
  if (result.stdout) process.stdout.write(result.stdout)
  if (result.stderr) process.stderr.write(result.stderr)
  if (result.status !== 0) {
    throw new Error('pnpm ci:prepare-internal failed')
  }
}

const readBuffer = rel => fs.readFileSync(path.join(cwd, rel))
const readText = rel => fs.readFileSync(path.join(cwd, rel), 'utf8')

const printOpenLedgerTasks = () => {
  const ledgerPath = '.ai/runtime/repair_list.txt'
  const absLedger = path.join(cwd, ledgerPath)
  if (!fs.existsSync(absLedger)) {
    console.error(`[FAIL] missing local runtime file: ${ledgerPath}`)
    process.exit(1)
  }

  const groups = new Map()
  for (const line of readText(ledgerPath).split('\n')) {
    const match = line.match(/^\[⬜️\]\s+\[([^\]]+)\]\s+(.+)$/)
    if (!match) continue
    const [, module, task] = match
    const priority = module.match(/^P\d+/)?.[0] ?? 'PX'
    const key = `${priority} ${module}`
    const items = groups.get(key) ?? []
    items.push(task)
    groups.set(key, items)
  }

  console.log('Open repair ledger')
  console.log('==================')
  for (const [group, items] of [...groups.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    console.log(`\n${group}`)
    items.forEach(item => console.log(`  - ${item}`))
  }
  console.log(
    `\n${[...groups.values()].reduce((total, items) => total + items.length, 0)} open tasks`
  )
}

if (openOnly) {
  printOpenLedgerTasks()
  process.exit(0)
}

const listFilesInAbsDir = root => {
  if (!fs.existsSync(root)) return []

  const files = []
  const walk = (currentAbs, currentRel) => {
    for (const entry of fs.readdirSync(currentAbs, { withFileTypes: true })) {
      const nextAbs = path.join(currentAbs, entry.name)
      const nextRel = path.posix.join(currentRel, entry.name)
      if (entry.isDirectory()) {
        walk(nextAbs, nextRel)
        continue
      }
      files.push(nextRel)
    }
  }

  walk(root, '')
  return files.sort()
}

const listFiles = relDir => listFilesInAbsDir(path.join(cwd, relDir))

const listMergedFiles = relDirs => {
  const merged = new Map()

  for (const relDir of relDirs) {
    const root = path.join(cwd, relDir)
    if (!fs.existsSync(root)) continue

    for (const relFile of listFilesInAbsDir(root)) {
      merged.set(relFile, path.posix.join(relDir, relFile))
    }
  }

  return merged
}

console.log('AI workspace doctor')
console.log('===================')
ok(`workspace governance: ${currentBranch}`)

for (const rel of canonicalMustExist) {
  const abs = path.join(cwd, rel)
  if (!fs.existsSync(abs)) fail(`missing canonical asset: ${rel}`)
  else ok(`canonical asset: ${rel}`)
}

for (const rel of localRuntimeFiles) {
  const abs = path.join(cwd, rel)
  if (!fs.existsSync(abs)) fail(`missing local runtime file: ${rel} (run pnpm ai:sync)`)
  else ok(`local runtime file: ${rel}`)
}

for (const rel of retiredShouldBeAbsent) {
  const abs = path.join(cwd, rel)
  if (fs.existsSync(abs)) fail(`retired Cursor/Gemini path should be removed: ${rel}`)
  else ok(`retired path removed: ${rel}`)
}

for (const { rel, label, acceptedCommands } of architectureGateChecks) {
  const abs = path.join(cwd, rel)
  if (!fs.existsSync(abs)) {
    fail(`missing ${label}: ${rel}`)
    continue
  }

  const content = readText(rel)
  if (!acceptedCommands.some(command => content.includes(command))) {
    fail(
      `${label} does not invoke ai:doctor: ${rel} (expected one of: ${acceptedCommands.join(', ')})`
    )
    continue
  }

  ok(`${label}: ${rel}`)
}

for (const { target, source } of fileAdapters) {
  const absTarget = path.join(cwd, target)
  if (!fs.existsSync(absTarget)) {
    fail(`missing generated adapter: ${target}`)
    continue
  }
  if (!readBuffer(target).equals(readBuffer(source))) {
    fail(`stale generated adapter: ${target} (run pnpm ai:sync)`)
    continue
  }
  ok(`generated adapter: ${target}`)
}

for (const { target, includes } of generatedContentChecks) {
  const absTarget = path.join(cwd, target)
  if (!fs.existsSync(absTarget)) {
    fail(`missing generated adapter: ${target}`)
    continue
  }
  const content = readText(target)
  const missing = includes.filter(snippet => !content.includes(snippet))
  if (missing.length > 0) {
    fail(`stale generated adapter: ${target} (run pnpm ai:sync)`)
    continue
  }
  ok(`generated adapter: ${target}`)
}

for (const { target, sources } of dirAdapters) {
  const targetFiles = listFiles(target)
  const mergedFiles = listMergedFiles(sources)
  const sourceFiles = [...mergedFiles.keys()].sort()
  if (targetFiles.length === 0) {
    fail(`missing generated adapter directory: ${target}`)
    continue
  }
  if (JSON.stringify(targetFiles) !== JSON.stringify(sourceFiles)) {
    fail(`stale generated adapter directory: ${target} (run pnpm ai:sync)`)
    continue
  }

  let mismatch = false
  for (const relFile of sourceFiles) {
    const targetFile = path.posix.join(target, relFile)
    const sourceFile = mergedFiles.get(relFile)
    if (!readBuffer(targetFile).equals(readBuffer(sourceFile))) {
      mismatch = true
      break
    }
  }

  if (mismatch) {
    fail(`stale generated adapter directory content: ${target} (run pnpm ai:sync)`)
    continue
  }

  ok(`generated adapter directory: ${target}`)
}

const skillsLockPath = '.ai/manifests/skills-lock.json'
try {
  const expectedSkillsLock = generateSkillsLock(cwd)
  const currentSkillsLock = JSON.parse(fs.readFileSync(path.join(cwd, skillsLockPath), 'utf8'))
  if (JSON.stringify(currentSkillsLock) !== JSON.stringify(expectedSkillsLock)) {
    fail(`stale generated skill lock: ${skillsLockPath} (run pnpm ai:sync:codex)`)
  } else {
    ok(`generated skill lock: ${skillsLockPath}`)
  }
} catch (error) {
  fail(`unable to validate skill lock: ${error instanceof Error ? error.message : String(error)}`)
}

try {
  const invalidRouteTargets = validateSkillRoutingTargets(cwd)
  if (invalidRouteTargets.length > 0) {
    fail(`invalid skill-routing targets: ${invalidRouteTargets.join(', ')}`)
  } else {
    ok('skill routing targets: .ai/manifests/skill-routing.json')
  }
} catch (error) {
  fail(
    `unable to validate skill routing manifest: ${error instanceof Error ? error.message : String(error)}`
  )
}

try {
  const guard = path.join(cwd, 'scripts', 'ai-architecture-guard.mjs')
  const guardResult = spawnSync(process.execPath, [guard], {
    cwd,
    encoding: 'utf8',
    stdio: 'pipe',
  })
  if (guardResult.stdout) process.stdout.write(guardResult.stdout)
  if (guardResult.stderr) process.stderr.write(guardResult.stderr)
  if (guardResult.status !== 0) fail('architecture guard failed: pnpm ai:guard')
  else ok('architecture guard: pnpm ai:guard')
} catch (error) {
  fail(
    `unable to run architecture guard: ${error instanceof Error ? error.message : String(error)}`
  )
}

try {
  prepareInternalPackages()
} catch {
  fail('internal package preparation failed before token validation')
}

if (!hasError) {
  try {
    const tokenContrastResult = spawnSync('pnpm', ['validate:tokens'], {
      cwd,
      encoding: 'utf8',
      stdio: 'pipe',
    })
    if (tokenContrastResult.stdout) process.stdout.write(tokenContrastResult.stdout)
    if (tokenContrastResult.stderr) process.stderr.write(tokenContrastResult.stderr)
    if (tokenContrastResult.status !== 0)
      fail('token contrast validation failed: pnpm validate:tokens')
    else ok('token contrast validation: pnpm validate:tokens')
  } catch (error) {
    fail(
      `unable to run token contrast validation: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

process.exit(hasError ? 1 : 0)
