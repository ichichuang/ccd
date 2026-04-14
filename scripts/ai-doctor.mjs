import fs from 'node:fs'
import path from 'node:path'

const cwd = process.cwd()

const canonicalMustExist = [
  '.ai/README.md',
  '.ai/config/cursor.settings.json',
  '.ai/config/claude.settings.local.json',
  '.ai/protocol/AI.entry.md',
  '.ai/protocol/AGENTS.core.md',
  '.ai/protocol/adapters/README.md',
  '.ai/protocol/adapters/codex.md',
  '.ai/protocol/adapters/claude.md',
  '.ai/protocol/adapters/cursor.md',
  '.ai/rules/core/00-global-architect.mdc',
  '.ai/rules/core/00-root-gatekeeper.mdc',
  '.ai/rules/core/01-preflight-checklist.mdc',
  '.ai/skills/claude/unocss/SKILL.md',
  '.ai/skills/claude/vite/SKILL.md',
  '.ai/skills/claude/vue/SKILL.md',
  '.ai/skills/claude/vueuse-functions/SKILL.md',
  '.ai/skills/cursor/github/SKILL.md',
  '.ai/skills/cursor/playwright-mcp/SKILL.md',
  '.ai/runtime/repair_list.template.txt',
  '.ai/manifests/skills-lock.json',
]

const fileAdapters = [
  { target: 'AGENTS.md', source: '.ai/protocol/AI.entry.md' },
  { target: 'CLAUDE.md', source: '.ai/protocol/AI.entry.md' },
  { target: '.cursor/settings.json', source: '.ai/config/cursor.settings.json' },
  { target: '.claude/settings.local.json', source: '.ai/config/claude.settings.local.json' },
]

const dirAdapters = [
  { target: '.cursor/rules', source: '.ai/rules' },
  { target: '.cursor/skills', source: '.ai/skills/cursor' },
  { target: '.claude/skills', source: '.ai/skills/claude' },
]

const localRuntimeFiles = ['.ai/runtime/repair_list.txt']

let hasError = false

const fail = msg => {
  hasError = true
  console.log(`[FAIL] ${msg}`)
}

const ok = msg => console.log(`[OK] ${msg}`)

const readBuffer = rel => fs.readFileSync(path.join(cwd, rel))

const listFiles = relDir => {
  const root = path.join(cwd, relDir)
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

for (const { target, source } of dirAdapters) {
  const targetFiles = listFiles(target)
  const sourceFiles = listFiles(source)
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
    const sourceFile = path.posix.join(source, relFile)
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

process.exit(hasError ? 1 : 0)
