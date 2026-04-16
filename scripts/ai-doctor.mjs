import fs from 'node:fs'
import path from 'node:path'
import {
  generateSkillsLock,
  stringifySkillsLock,
  validateSkillRoutingTargets,
} from './skill-lock-utils.mjs'

const cwd = process.cwd()

const canonicalMustExist = [
  '.ai/README.md',
  '.ai/config/cursor.settings.json',
  '.ai/protocol/AI.entry.md',
  '.ai/protocol/AGENTS.core.md',
  '.ai/protocol/adapters/README.md',
  '.ai/protocol/adapters/codex.md',
  '.ai/protocol/adapters/cursor.md',
  '.ai/rules/core/00-global-architect.mdc',
  '.ai/rules/core/00-root-gatekeeper.mdc',
  '.ai/rules/core/01-global-preflight.mdc',
  '.ai/rules/core/02-ui-preflight.mdc',
  'scripts/skill-lock-utils.mjs',
  '.ai/skills/core/unocss/SKILL.md',
  '.ai/skills/core/vite/SKILL.md',
  '.ai/skills/core/vue/SKILL.md',
  '.ai/skills/core/vueuse-functions/SKILL.md',
  '.ai/skills/codex/architecture-browser-master/SKILL.md',
  '.ai/skills/codex/task-orchestrator/SKILL.md',
  '.ai/skills/codex/github-ops/SKILL.md',
  '.ai/skills/codex/desktop-tauri-guard/SKILL.md',
  '.ai/skills/cursor/github/SKILL.md',
  '.ai/skills/cursor/playwright-mcp/SKILL.md',
  'scripts/ai-sync.mjs',
  'scripts/ai-doctor.mjs',
  'scripts/codex-preflight.mjs',
  'scripts/ai-clean.mjs',
  'scripts/ai-sync-codex.mjs',
  '.ai/runtime/repair_list.template.txt',
  '.ai/manifests/skill-routing.json',
  '.ai/manifests/skills-lock.json',
]

const fileAdapters = [
  { target: 'AGENTS.md', source: '.ai/protocol/AI.entry.md' },
  { target: '.cursor/settings.json', source: '.ai/config/cursor.settings.json' },
]

const dirAdapters = [
  { target: '.cursor/rules', sources: ['.ai/rules'] },
  { target: '.cursor/skills', sources: ['.ai/skills/core', '.ai/skills/cursor'] },
]

const localRuntimeFiles = ['.ai/runtime/repair_list.txt']
const legacyShouldBeAbsent = ['CLAUDE.md', '.claude', '.ai/config/claude.settings.local.json', '.ai/protocol/adapters/claude.md']
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

const readBuffer = rel => fs.readFileSync(path.join(cwd, rel))
const readText = rel => fs.readFileSync(path.join(cwd, rel), 'utf8')

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

for (const rel of legacyShouldBeAbsent) {
  const abs = path.join(cwd, rel)
  if (fs.existsSync(abs)) fail(`legacy Claude-era path should be removed: ${rel}`)
  else ok(`legacy path removed: ${rel}`)
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
  const expectedSkillsLock = stringifySkillsLock(generateSkillsLock(cwd))
  const currentSkillsLock = fs.readFileSync(path.join(cwd, skillsLockPath), 'utf8')
  if (currentSkillsLock !== expectedSkillsLock) {
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
  fail(`unable to validate skill routing manifest: ${error instanceof Error ? error.message : String(error)}`)
}

process.exit(hasError ? 1 : 0)
