import fs from 'node:fs'
import path from 'node:path'

const cwd = process.cwd()

const canonicalMustExist = [
  '.ai/README.md',
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
  '.ai/runtime/repair_list.txt',
  '.ai/manifests/skills-lock.json',
]

const adapters = [
  { linkPath: 'AGENTS.md', target: '.ai/protocol/AI.entry.md' },
  { linkPath: 'CLAUDE.md', target: '.ai/protocol/AI.entry.md' },
  { linkPath: '.cursor/rules', target: '../.ai/rules' },
  { linkPath: '.cursor/skills', target: '../.ai/skills/cursor' },
  { linkPath: '.claude/skills', target: '../.ai/skills/claude' },
]

let hasError = false

const fail = msg => {
  hasError = true
  console.log(`[FAIL] ${msg}`)
}

const ok = msg => console.log(`[OK] ${msg}`)

console.log('AI workspace doctor')
console.log('===================')

for (const rel of canonicalMustExist) {
  const abs = path.join(cwd, rel)
  if (!fs.existsSync(abs)) fail(`missing canonical asset: ${rel}`)
  else ok(`canonical asset: ${rel}`)
}

for (const { linkPath, target } of adapters) {
  const abs = path.join(cwd, linkPath)
  const st = fs.lstatSync(abs, { throwIfNoEntry: false })
  if (!st) {
    fail(`missing adapter: ${linkPath}`)
    continue
  }
  if (!st.isSymbolicLink()) {
    fail(`adapter is not symlink: ${linkPath}`)
    continue
  }
  const actual = fs.readlinkSync(abs)
  if (actual !== target) fail(`adapter target mismatch: ${linkPath} -> ${actual} (expected ${target})`)
  else ok(`adapter link: ${linkPath} -> ${target}`)
}

process.exit(hasError ? 1 : 0)
