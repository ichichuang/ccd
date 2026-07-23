#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const root = process.cwd()
const manifestPath = '.ai/manifests/skill-routing.json'
const legacyManifestName = ['routing', 'scopes.json'].join('-')
const legacyManifestPath = path.join('.ai', 'manifests', legacyManifestName)
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
const errors = []
const expectedSkillOrder = [
  'project-ui',
  'desktop-tauri-guard',
  'gsap-core',
  'vue',
  'unocss',
  'vite',
  'github-ops',
  'task-orchestrator',
]
const expectedRouteIds = [
  'desktop',
  'github',
  'unocss',
  'gsap',
  'vite',
  'vue',
  'project-ui',
  'ai',
]
const expectedGlobs = {
  desktop: ['apps/desktop/**'],
  github: ['.github/**'],
  unocss: ['uno.config.ts', 'packages/unocss-preset/**', 'packages/design-tokens/**'],
  gsap: [
    'apps/web-demo/src/plugins/animation/**',
    'apps/web-demo/src/views/login/components/AuthShaderBackdrop.vue',
    'apps/web-demo/src/views/login/components/LoginShell.vue',
    'apps/web-demo/src/views/login/composables/useLoginPaletteTransition.ts',
  ],
  vite: ['vite.config.ts', 'apps/*/vite.config.ts', 'apps/*/build/**'],
  vue: ['apps/*/src/**/*.vue', 'packages/vue-*/src/**'],
  'project-ui': ['apps/*/src/**/*.vue', 'apps/*/src/**/*.tsx', 'packages/vue-ui/src/**'],
  ai: ['.ai/**', 'AGENTS.md', 'CLAUDE.md'],
}
const expectedPaths = {
  desktop: ['apps/desktop/'],
  github: ['.github/'],
  unocss: ['uno.config.ts', 'packages/unocss-preset/', 'packages/design-tokens/'],
  gsap: [
    'apps/web-demo/src/plugins/animation/',
    'apps/web-demo/src/views/login/components/AuthShaderBackdrop.vue',
    'apps/web-demo/src/views/login/components/LoginShell.vue',
    'apps/web-demo/src/views/login/composables/useLoginPaletteTransition.ts',
  ],
  vite: ['vite.config.ts', 'apps/web-demo/build/'],
  vue: ['apps/web-demo/src/', 'packages/vue-'],
  'project-ui': ['apps/web-demo/src/views/', 'apps/web-demo/src/layouts/', 'packages/vue-ui/'],
  ai: ['.ai/', 'AGENTS.md', 'CLAUDE.md'],
}
const skillPaths = {
  'desktop-tauri-guard': '.ai/skills/codex/desktop-tauri-guard/SKILL.md',
  'github-ops': '.ai/skills/codex/github-ops/SKILL.md',
  'gsap-core': '.ai/skills/core/gsap-core/SKILL.md',
  unocss: '.ai/skills/core/unocss/SKILL.md',
  vite: '.ai/skills/core/vite/SKILL.md',
  vue: '.ai/skills/core/vue/SKILL.md',
  'project-ui': '.ai/skills/project-ui/SKILL.md',
  'task-orchestrator': '.ai/skills/codex/task-orchestrator/SKILL.md',
}

function equal(left, right) {
  return JSON.stringify(left) === JSON.stringify(right)
}

if (manifest.version !== 2) errors.push(`unexpected routing manifest version: ${manifest.version}`)
if (!equal(manifest.skillOrder, expectedSkillOrder)) {
  errors.push('routing manifest has an unexpected deterministic skill order')
}
if (!equal(manifest.fallback, ['task-orchestrator'])) {
  errors.push('routing manifest has an unexpected fallback')
}

const routeIds = []
const routeIdSet = new Set()
for (const route of manifest.routes ?? []) {
  if (!route.id || routeIdSet.has(route.id)) errors.push(`invalid or duplicate route id: ${route.id}`)
  routeIds.push(route.id)
  routeIdSet.add(route.id)

  for (const field of ['keywords', 'paths', 'globs', 'skills']) {
    if (!Array.isArray(route[field]) || route[field].length === 0) {
      errors.push(`route ${route.id} has no ${field}`)
    }
  }
  if (!Number.isInteger(route.priority)) errors.push(`route ${route.id} has invalid priority`)
  if (!equal(route.globs, expectedGlobs[route.id])) {
    errors.push(`route ${route.id} does not contain the expected consolidated scope globs`)
  }
  if (!equal(route.paths, expectedPaths[route.id])) {
    errors.push(`route ${route.id} does not contain the expected path evidence`)
  }
  for (const skill of route.skills ?? []) {
    if (!skillPaths[skill] || !fs.existsSync(skillPaths[skill])) {
      errors.push(`route ${route.id} has nonexistent skill target: ${skill}`)
    }
  }
}

if (!equal(routeIds, expectedRouteIds)) errors.push('routing manifest has unexpected route ids or order')
for (const skill of manifest.fallback ?? []) {
  if (!skillPaths[skill] || !fs.existsSync(skillPaths[skill])) {
    errors.push(`fallback has nonexistent skill target: ${skill}`)
  }
}
for (const skill of expectedSkillOrder) {
  if (!skillPaths[skill] || !fs.existsSync(skillPaths[skill])) {
    errors.push(`skill order has nonexistent skill target: ${skill}`)
  }
}

const gsapRoute = manifest.routes.find(route => route.id === 'gsap')
for (const trigger of ['gsap', 'timeline', 'scrolltrigger', 'createscopedgsapcontext']) {
  if (!gsapRoute?.keywords.includes(trigger)) errors.push(`GSAP route is missing explicit trigger: ${trigger}`)
}
for (const genericTerm of ['motion', 'animation']) {
  if (gsapRoute?.keywords.includes(genericTerm)) {
    errors.push(`GSAP route must not use generic trigger: ${genericTerm}`)
  }
}

if (fs.existsSync(legacyManifestPath)) {
  errors.push(`legacy routing manifest still exists: ${legacyManifestPath}`)
}

const adapterManifest = JSON.parse(fs.readFileSync('.ai/protocol/adapter-manifest.json', 'utf8'))
if (adapterManifest.routing?.manifest !== manifestPath) {
  errors.push('adapter manifest does not identify the sole routing manifest')
}
if (Object.hasOwn(adapterManifest.routing ?? {}, 'scopes')) {
  errors.push('adapter manifest still declares a separate routing scopes authority')
}

const readme = fs.readFileSync('.ai/README.md', 'utf8')
if (!readme.includes('`manifests/skill-routing.json` is the sole routing authority.')) {
  errors.push('.ai/README.md does not identify the sole routing manifest')
}

const stalePointerSearch = spawnSync('git', ['grep', '-n', '--', legacyManifestName], {
  cwd: root,
  encoding: 'utf8',
})
if (stalePointerSearch.status === 0) {
  errors.push(`stale routing manifest pointers:\n${stalePointerSearch.stdout.trim()}`)
} else if (stalePointerSearch.status !== 1) {
  errors.push(`tracked stale-pointer scan failed: ${stalePointerSearch.stderr.trim()}`)
}

const samples = [
  { task: 'implement a generic UI', skills: ['project-ui'] },
  { task: 'build a Vue UI', skills: ['project-ui', 'vue'] },
  { task: 'apply PrimeVue styling', skills: ['project-ui', 'vue'] },
  { task: 'apply UnoCSS UI styling', skills: ['project-ui', 'unocss'] },
  {
    task: 'build a Vue UI with UnoCSS styling',
    skills: ['project-ui', 'vue', 'unocss'],
  },
  { task: 'refine a desktop UI', skills: ['project-ui', 'desktop-tauri-guard'] },
  {
    task: 'refine a desktop Vue UI',
    skills: ['project-ui', 'desktop-tauri-guard', 'vue'],
  },
  { task: 'implement a GSAP UI transition', skills: ['project-ui', 'gsap-core'] },
  {
    task: 'implement a GSAP Vue UI transition',
    skills: ['project-ui', 'gsap-core', 'vue'],
  },
  { task: 'write a Vue composable utility', skills: ['vue'] },
  { task: 'configure UnoCSS build tooling', skills: ['unocss'] },
  { task: 'configure UnoCSS build config', skills: ['unocss'] },
  { task: 'update Vite build config', skills: ['vite'] },
  { task: 'update a Tauri adapter', skills: ['desktop-tauri-guard'] },
  { task: 'update a GitHub workflow', skills: ['github-ops'] },
  { task: 'investigate an unfamiliar request', skills: ['task-orchestrator'] },
  {
    task: 'design motion presentation',
    skills: ['project-ui'],
    forbiddenSkills: ['gsap-core'],
  },
  {
    task: 'design animation presentation',
    skills: ['project-ui'],
    forbiddenSkills: ['gsap-core'],
  },
  { task: 'implement a timeline UI', skills: ['project-ui', 'gsap-core'] },
  { task: 'implement a ScrollTrigger UI', skills: ['project-ui', 'gsap-core'] },
  {
    task: 'use createScopedGsapContext for UI cleanup',
    skills: ['project-ui', 'gsap-core'],
  },
  {
    task: 'please inspect apps/catalog/src/App.vue now',
    skills: ['project-ui', 'vue'],
    requiredEvidence: [
      { route: 'vue', value: 'apps/*/src/**/*.vue' },
      { route: 'project-ui', value: 'apps/*/src/**/*.vue' },
    ],
  },
  {
    task: 'apps/catalog/src/features/account/Profile.vue',
    skills: ['project-ui', 'vue'],
    requiredEvidence: [
      { route: 'vue', value: 'apps/*/src/**/*.vue' },
      { route: 'project-ui', value: 'apps/*/src/**/*.vue' },
    ],
  },
  {
    task: 'apps/catalog/src/components/Widget.tsx',
    skills: ['project-ui'],
    requiredEvidence: [{ route: 'project-ui', value: 'apps/*/src/**/*.tsx' }],
  },
  {
    task: 'apps/desktop/src/components/WindowPanel.vue',
    skills: ['project-ui', 'desktop-tauri-guard', 'vue'],
    requiredEvidence: [
      { route: 'desktop', value: 'apps/desktop/**' },
      { route: 'vue', value: 'apps/*/src/**/*.vue' },
      { route: 'project-ui', value: 'apps/*/src/**/*.vue' },
    ],
  },
  {
    task: 'apps/web-demo/src/views/login/components/LoginShell.vue',
    skills: ['project-ui', 'gsap-core', 'vue'],
    requiredEvidenceCounts: [
      {
        route: 'gsap',
        value: 'apps/web-demo/src/views/login/components/LoginShell.vue',
        count: 2,
      },
    ],
  },
  {
    task: 'apps/catalog/build/rollup-options.ts',
    skills: ['vite'],
    requiredEvidence: [{ route: 'vite', value: 'apps/*/build/**' }],
  },
  {
    task: '.github/workflows/quality.yml',
    skills: ['github-ops'],
    requiredEvidence: [{ route: 'github', value: '.github/**' }],
  },
  {
    task: 'AGENTS.md',
    skills: ['task-orchestrator'],
    requiredEvidenceCounts: [{ route: 'ai', value: 'AGENTS.md', count: 2 }],
  },
  {
    task: 'apps/web-demo/src/services/route-owner.ts',
    skills: ['vue'],
    requiredEvidence: [{ route: 'vue', value: 'apps/web-demo/src/' }],
  },
  {
    task: 'apps/web-demo/src/layouts/layout-owner.ts',
    skills: ['project-ui', 'vue'],
    requiredEvidence: [
      { route: 'vue', value: 'apps/web-demo/src/' },
      { route: 'project-ui', value: 'apps/web-demo/src/layouts/' },
    ],
  },
  {
    task: 'apps/catalog/src/Not A.tsx',
    skills: ['task-orchestrator'],
  },
  {
    task: 'C:\\repo\\apps\\catalog\\src\\App.vue',
    skills: ['project-ui', 'vue'],
    requiredEvidence: [
      { route: 'vue', value: 'apps/*/src/**/*.vue' },
      { route: 'project-ui', value: 'apps/*/src/**/*.vue' },
    ],
  },
  {
    task: 'C:\\repo\\apps\\catalog\\src\\components\\Widget.tsx',
    skills: ['project-ui'],
    requiredEvidence: [{ route: 'project-ui', value: 'apps/*/src/**/*.tsx' }],
  },
  {
    task: 'C:\\repo\\apps\\desktop\\src\\components\\WindowPanel.vue',
    skills: ['project-ui', 'desktop-tauri-guard', 'vue'],
    requiredEvidence: [
      { route: 'desktop', value: 'apps/desktop/' },
      { route: 'desktop', value: 'apps/desktop/**' },
      { route: 'vue', value: 'apps/*/src/**/*.vue' },
      { route: 'project-ui', value: 'apps/*/src/**/*.vue' },
    ],
  },
  {
    task: '/opt/ccd/apps/catalog/src/App.vue',
    skills: ['project-ui', 'vue'],
    requiredEvidence: [
      { route: 'vue', value: 'apps/*/src/**/*.vue' },
      { route: 'project-ui', value: 'apps/*/src/**/*.vue' },
    ],
  },
  {
    task: 'Review "/opt/ccd/apps/catalog/src/components/Widget.tsx", please',
    skills: ['project-ui'],
    requiredEvidence: [{ route: 'project-ui', value: 'apps/*/src/**/*.tsx' }],
  },
  {
    task: 'notapps/catalog/src/components/Widget.tsx',
    skills: ['task-orchestrator'],
  },
  {
    task: 'notapps/web-demo/src/services/route-owner.ts',
    skills: ['task-orchestrator'],
  },
  {
    task: 'not.github/workflows/quality.yml',
    skills: ['github-ops'],
    forbiddenEvidence: [
      { route: 'github', value: '.github/' },
      { route: 'github', value: '.github/**' },
    ],
  },
  {
    task: 'not.ai/rules/core/example.mdc',
    skills: ['task-orchestrator'],
    routeIds: [],
  },
  {
    task: 'notAGENTS.md',
    skills: ['task-orchestrator'],
    routeIds: [],
  },
  {
    task: 'AGENTS.md.bak',
    skills: ['task-orchestrator'],
    routeIds: [],
  },
  {
    task: 'apps/catalog/src/App.vuex',
    skills: ['task-orchestrator'],
  },
  {
    task: 'apps/catalog/src/App.vue/child',
    skills: ['vue'],
    forbiddenSkills: ['project-ui'],
    forbiddenEvidence: [
      { route: 'vue', value: 'apps/*/src/**/*.vue' },
      { route: 'project-ui', value: 'apps/*/src/**/*.vue' },
    ],
  },
  {
    task: 'apps/catalog/src/Widget.tsx/child',
    skills: ['task-orchestrator'],
  },
  {
    task: 'AGENTS.md/child',
    skills: ['task-orchestrator'],
    routeIds: [],
  },
  {
    task: 'uno.config.ts/child',
    skills: ['task-orchestrator'],
  },
  {
    task: 'apps/web-demo/src/views/login/components/LoginShell.vue/child',
    skills: ['project-ui', 'vue'],
    forbiddenSkills: ['gsap-core'],
    forbiddenEvidence: [
      { route: 'gsap', value: 'apps/web-demo/src/views/login/components/LoginShell.vue' },
    ],
  },
]

for (const sample of samples) {
  const node = spawnSync(
    process.execPath,
    ['.ai/skills/codex/task-orchestrator/scripts/skill_router.mjs', sample.task, '--json'],
    {}
  )
  const python = spawnSync(
    'python3',
    ['.ai/skills/codex/task-orchestrator/scripts/skill_router.py', sample.task, '--json'],
    {}
  )
  if (node.status !== 0 || python.status !== 0) {
    errors.push(`router execution failed for: ${sample.task}`)
    continue
  }

  let nodeResult
  let pythonResult
  try {
    nodeResult = JSON.parse(node.stdout.toString('utf8'))
    pythonResult = JSON.parse(python.stdout.toString('utf8'))
  } catch {
    errors.push(`router emitted invalid JSON for: ${sample.task}`)
    continue
  }

  if (
    node.stdout.at(-1) !== 0x0a ||
    python.stdout.at(-1) !== 0x0a ||
    node.stdout.includes(0x0d) ||
    python.stdout.includes(0x0d)
  ) {
    errors.push(`router JSON is not explicit LF-only output for: ${sample.task}`)
    continue
  }
  if (!node.stdout.equals(python.stdout)) {
    errors.push(`router JSON bytes disagree for: ${sample.task}`)
    continue
  }
  if (!equal(nodeResult, pythonResult)) {
    errors.push(`router implementations disagree for: ${sample.task}`)
    continue
  }
  if (!equal(nodeResult.skills, sample.skills)) {
    errors.push(
      `unexpected skill route for "${sample.task}": ${JSON.stringify(nodeResult.skills)}`
    )
  }
  if (sample.routeIds && !equal(nodeResult.routes.map(route => route.id), sample.routeIds)) {
    errors.push(
      `unexpected route ids for "${sample.task}": ${JSON.stringify(
        nodeResult.routes.map(route => route.id)
      )}`
    )
  }
  for (const forbiddenSkill of sample.forbiddenSkills ?? []) {
    if (nodeResult.skills.includes(forbiddenSkill)) {
      errors.push(`forbidden skill ${forbiddenSkill} selected for: ${sample.task}`)
    }
  }
  for (const required of sample.requiredEvidence ?? []) {
    const route = nodeResult.routes.find(candidate => candidate.id === required.route)
    if (!route?.evidence.includes(required.value)) {
      errors.push(
        `missing ${required.route} evidence ${JSON.stringify(required.value)} for: ${sample.task}`
      )
    }
  }
  for (const required of sample.requiredEvidenceCounts ?? []) {
    const route = nodeResult.routes.find(candidate => candidate.id === required.route)
    const count = route?.evidence.filter(value => value === required.value).length ?? 0
    if (count !== required.count) {
      errors.push(
        `expected ${required.count} ${required.route} evidence entries ${JSON.stringify(
          required.value
        )} for "${sample.task}", received ${count}`
      )
    }
  }
  for (const forbidden of sample.forbiddenEvidence ?? []) {
    const route = nodeResult.routes.find(candidate => candidate.id === forbidden.route)
    if (route?.evidence.includes(forbidden.value)) {
      errors.push(
        `forbidden ${forbidden.route} evidence ${JSON.stringify(forbidden.value)} for: ${
          sample.task
        }`
      )
    }
  }

  const indexes = nodeResult.skills.map(skill => expectedSkillOrder.indexOf(skill))
  if (indexes.some(index => index < 0) || indexes.some((index, position) => index < indexes[position - 1])) {
    errors.push(`nondeterministic skill order for: ${sample.task}`)
  }
}

if (errors.length > 0) {
  errors.forEach(error => console.error(error))
  process.exit(1)
}

console.log(`Skill routing is valid (${samples.length} exact Node/Python parity samples)`)
