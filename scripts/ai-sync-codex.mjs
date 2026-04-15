import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const cwd = process.cwd()
const targetRoot = path.join(os.homedir(), '.codex', 'skills')
const sourceRoots = ['.ai/skills/core', '.ai/skills/codex']

const syncSkill = (sourceRoot, skillName) => {
  const sourceDir = path.join(cwd, sourceRoot, skillName)
  const targetDir = path.join(targetRoot, skillName)
  fs.rmSync(targetDir, { recursive: true, force: true })
  fs.cpSync(sourceDir, targetDir, { recursive: true })
  console.log(`[SYNC] ${targetDir} <= ${path.join(sourceRoot, skillName)}`)
}

console.log('Codex skill sync')
console.log('================')
fs.mkdirSync(targetRoot, { recursive: true })

for (const sourceRoot of sourceRoots) {
  const absSourceRoot = path.join(cwd, sourceRoot)
  if (!fs.existsSync(absSourceRoot)) continue

  for (const entry of fs.readdirSync(absSourceRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    syncSkill(sourceRoot, entry.name)
  }
}
