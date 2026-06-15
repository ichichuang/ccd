import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { generateSkillsLock, stringifySkillsLock } from './skill-lock-utils.mjs'

const cwd = process.cwd()
const targetRoot = path.join(os.homedir(), '.codex', 'skills')
const sourceRoots = ['.ai/skills/core', '.ai/skills/design', '.ai/skills/codex']
const skillsLockPath = path.join(cwd, '.ai', 'manifests', 'skills-lock.json')

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

const nextSkillsLock = stringifySkillsLock(generateSkillsLock(cwd))
const currentSkillsLock = fs.existsSync(skillsLockPath) ? fs.readFileSync(skillsLockPath, 'utf8') : null
if (currentSkillsLock !== nextSkillsLock) {
  fs.writeFileSync(skillsLockPath, nextSkillsLock)
  console.log('[SYNC] .ai/manifests/skills-lock.json <= scanned .ai/skills/**')
} else {
  console.log('[OK] .ai/manifests/skills-lock.json')
}

for (const sourceRoot of sourceRoots) {
  const absSourceRoot = path.join(cwd, sourceRoot)
  if (!fs.existsSync(absSourceRoot)) continue

  for (const entry of fs.readdirSync(absSourceRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    syncSkill(sourceRoot, entry.name)
  }
}
