import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const cwd = process.cwd()
const fileAdapters = [
  { source: '.ai/protocol/AI.entry.md', target: 'AGENTS.md' },
  { source: '.ai/config/cursor.settings.json', target: '.cursor/settings.json' },
]

const dirAdapters = [
  { sources: ['.ai/rules'], target: '.cursor/rules' },
  { sources: ['.ai/skills/core', '.ai/skills/cursor'], target: '.cursor/skills' },
]

const localRuntimeFiles = [
  {
    source: '.ai/runtime/repair_list.template.txt',
    target: '.ai/runtime/repair_list.txt',
  },
]

const legacyPaths = ['CLAUDE.md', '.claude']

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

const syncMergedDir = ({ sources, target }) => {
  const absTarget = path.join(cwd, target)
  ensureParentDir(target)
  removePathIfExists(target)
  fs.mkdirSync(absTarget, { recursive: true })

  for (const source of sources) {
    const absSource = path.join(cwd, source)
    if (!fs.existsSync(absSource)) continue

    for (const entry of fs.readdirSync(absSource, { withFileTypes: true })) {
      const sourceEntry = path.join(absSource, entry.name)
      const targetEntry = path.join(absTarget, entry.name)
      fs.cpSync(sourceEntry, targetEntry, { recursive: true })
    }
  }

  console.log(`[SYNC] ${target} <= ${sources.join(' + ')}`)
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

const runNodeScript = script => {
  const result = spawnSync(process.execPath, [path.join(cwd, script)], {
    cwd,
    encoding: 'utf8',
    stdio: 'pipe',
  })
  if (result.stdout) process.stdout.write(result.stdout)
  if (result.stderr) process.stderr.write(result.stderr)
  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

console.log('AI adapter sync')
console.log('===============')
runNodeScript('scripts/generate-rule-index.mjs')
for (const fileAdapter of fileAdapters) syncFile(fileAdapter)
for (const dirAdapter of dirAdapters) syncMergedDir(dirAdapter)
for (const runtimeFile of localRuntimeFiles) ensureLocalRuntimeFile(runtimeFile)
runNodeScript('scripts/migrate-ledger.mjs')
for (const legacyPath of legacyPaths) {
  removePathIfExists(legacyPath)
  console.log(`[CLEAN] removed legacy adapter: ${legacyPath}`)
}
