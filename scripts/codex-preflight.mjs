import fs from 'node:fs'
import path from 'node:path'

const cwd = process.cwd()

const requiredPaths = [
  '.ai/rules/architecture',
  '.ai/rules/components',
  '.ai/rules/core',
  '.ai/rules/design-system',
  '.ai/rules/integrations',
  '.ai/skills/claude/unocss/SKILL.md',
  '.ai/skills/claude/vite/SKILL.md',
  '.ai/skills/claude/vue/SKILL.md',
  '.ai/skills/claude/vueuse-functions/SKILL.md',
  '.ai/skills/cursor/github/SKILL.md',
  '.ai/skills/cursor/playwright-mcp/SKILL.md',
  '.cursor/rules',
  '.cursor/skills',
  '.claude/skills',
  'AGENTS.md',
  'CLAUDE.md',
  '.ai/runtime/repair_list.txt',
  '.ai/manifests/skills-lock.json',
  'uno.config.ts',
  'vite.config.ts',
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

const passed = Boolean(packageJson) && missingPaths.length === 0 && missingDeps.length === 0
console.log('--------------------')
console.log(passed ? 'Preflight passed.' : 'Preflight failed.')

process.exit(passed ? 0 : 1)
