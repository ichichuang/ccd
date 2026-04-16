import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const cwd = process.cwd()
const home = os.homedir()

const requiredPaths = [
  '.ai/config/cursor.settings.json',
  '.ai/rules/architecture',
  '.ai/rules/components',
  '.ai/rules/core',
  '.ai/rules/design-system',
  '.ai/rules/integrations',
  '.ai/skills/core/unocss/SKILL.md',
  '.ai/skills/core/vite/SKILL.md',
  '.ai/skills/core/vue/SKILL.md',
  '.ai/skills/core/vueuse-functions/SKILL.md',
  '.ai/skills/codex/architecture-browser-master/SKILL.md',
  '.ai/skills/codex/task-orchestrator/SKILL.md',
  '.ai/skills/codex/github-ops/SKILL.md',
  '.ai/skills/cursor/github/SKILL.md',
  '.ai/skills/cursor/playwright-mcp/SKILL.md',
  '.cursor/rules',
  '.cursor/skills',
  '.cursor/settings.json',
  'AGENTS.md',
  'scripts/skill-lock-utils.mjs',
  'scripts/ai-sync.mjs',
  'scripts/ai-doctor.mjs',
  'scripts/ai-clean.mjs',
  'scripts/ai-sync-codex.mjs',
  'scripts/codex-preflight.mjs',
  '.ai/runtime/repair_list.template.txt',
  '.ai/runtime/repair_list.txt',
  '.ai/manifests/skill-routing.json',
  '.ai/manifests/skills-lock.json',
  'uno.config.ts',
  'vite.config.ts',
]

const requiredLocalCodexSkills = [
  'vue',
  'vueuse-functions',
  'unocss',
  'vite',
  'architecture-browser-master',
  'task-orchestrator',
  'github-ops',
]

const requiredDeps = [
  'vue',
  'primevue',
  'alova',
  '@vueuse/core',
  'unocss',
  'vite',
  'typescript',
]

const exists = rel => fs.existsSync(path.join(cwd, rel))
const missingPaths = requiredPaths.filter(rel => !exists(rel))

let packageJson = null
try {
  const raw = fs.readFileSync(path.join(cwd, 'package.json'), 'utf8')
  packageJson = JSON.parse(raw)
} catch {
  packageJson = null
}

const deps = {
  ...(packageJson?.dependencies ?? {}),
  ...(packageJson?.devDependencies ?? {}),
}

const missingDeps = requiredDeps.filter(dep => !deps[dep])
const missingLocalCodexSkills = requiredLocalCodexSkills.filter(name => !fs.existsSync(path.join(home, '.codex', 'skills', name, 'SKILL.md')))

const runNodeScript = relPath => {
  const absPath = path.join(cwd, relPath)
  return spawnSync(process.execPath, [absPath], {
    cwd,
    encoding: 'utf8',
    stdio: 'pipe',
  })
}

const printCheck = (label, ok) => {
  const mark = ok ? '[OK]' : '[FAIL]'
  console.log(`${mark} ${label}`)
}

console.log('CCD Codex Preflight')
console.log('====================')

printCheck('package.json parse', Boolean(packageJson))
printCheck('required paths', missingPaths.length === 0)
for (const p of missingPaths) {
  console.log(`  - missing: ${p}`)
}

printCheck('required dependencies', missingDeps.length === 0)
for (const dep of missingDeps) {
  console.log(`  - missing dep: ${dep}`)
}

printCheck('local codex skills', missingLocalCodexSkills.length === 0)
for (const name of missingLocalCodexSkills) {
  console.log(`  - missing local codex skill: ${name} (run pnpm ai:sync:codex)`)
}

const doctorScript = 'scripts/ai-doctor.mjs'
const canRunDoctor =
  Boolean(packageJson) &&
  missingPaths.length === 0 &&
  fs.existsSync(path.join(cwd, doctorScript))

let doctorPassed = false
if (!canRunDoctor) {
  printCheck('ai workspace doctor', false)
  console.log(`  - unable to run ${doctorScript}; fix required paths above and then run pnpm ai:doctor`)
} else {
  const doctorResult = runNodeScript(doctorScript)
  if (doctorResult.stdout) process.stdout.write(doctorResult.stdout)
  if (doctorResult.stderr) process.stderr.write(doctorResult.stderr)
  doctorPassed = doctorResult.status === 0
  printCheck('ai workspace doctor', doctorPassed)
  if (!doctorPassed) {
    console.log('  - architecture drift detected. Run pnpm ai:sync, then pnpm ai:doctor.')
  }
}

const passed =
  Boolean(packageJson) &&
  missingPaths.length === 0 &&
  missingDeps.length === 0 &&
  missingLocalCodexSkills.length === 0 &&
  doctorPassed
console.log('--------------------')
console.log(passed ? 'Preflight passed.' : 'Preflight failed.')

process.exit(passed ? 0 : 1)
