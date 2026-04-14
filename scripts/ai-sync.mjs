import fs from 'node:fs'
import path from 'node:path'

const cwd = process.cwd()
const fileAdapters = [
  { source: '.ai/protocol/AI.entry.md', target: 'AGENTS.md' },
  { source: '.ai/protocol/AI.entry.md', target: 'CLAUDE.md' },
  { source: '.ai/config/cursor.settings.json', target: '.cursor/settings.json' },
  { source: '.ai/config/claude.settings.local.json', target: '.claude/settings.local.json' },
]

const dirAdapters = [
  { source: '.ai/rules', target: '.cursor/rules' },
  { source: '.ai/skills/cursor', target: '.cursor/skills' },
  { source: '.ai/skills/claude', target: '.claude/skills' },
]

const localRuntimeFiles = [
  {
    source: '.ai/runtime/repair_list.template.txt',
    target: '.ai/runtime/repair_list.txt',
  },
]

const ensureParentDir = relPath => fs.mkdirSync(path.dirname(path.join(cwd, relPath)), { recursive: true })

const removePathIfExists = relPath => {
  const absPath = path.join(cwd, relPath)
  const stat = fs.lstatSync(absPath, { throwIfNoEntry: false })
  if (stat) fs.rmSync(absPath, { recursive: true, force: true })
}

const syncFile = ({ source, target }) => {
  const absSource = path.join(cwd, source)
  const absTarget = path.join(cwd, target)
  ensureParentDir(target)
  removePathIfExists(target)
  fs.copyFileSync(absSource, absTarget)
  console.log(`[SYNC] ${target} <= ${source}`)
}

const syncDir = ({ source, target }) => {
  const absSource = path.join(cwd, source)
  const absTarget = path.join(cwd, target)
  ensureParentDir(target)
  removePathIfExists(target)
  fs.cpSync(absSource, absTarget, { recursive: true })
  console.log(`[SYNC] ${target} <= ${source}`)
}

const ensureLocalRuntimeFile = ({ source, target }) => {
  const absSource = path.join(cwd, source)
  const absTarget = path.join(cwd, target)
  ensureParentDir(target)
  if (!fs.existsSync(absTarget)) {
    fs.copyFileSync(absSource, absTarget)
    console.log(`[CREATE] ${target} <= ${source}`)
    return
  }
  console.log(`[OK] ${target}`)
}

console.log('AI adapter sync')
console.log('===============')
for (const fileAdapter of fileAdapters) syncFile(fileAdapter)
for (const dirAdapter of dirAdapters) syncDir(dirAdapter)
for (const runtimeFile of localRuntimeFiles) ensureLocalRuntimeFile(runtimeFile)
