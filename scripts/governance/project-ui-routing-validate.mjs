#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import process from 'node:process'

const manifest = JSON.parse(fs.readFileSync('.ai/manifests/skill-routing.json', 'utf8'))
const routeIds = new Set()
const errors = []
const skillPaths = {
  'desktop-tauri-guard': '.ai/skills/codex/desktop-tauri-guard/SKILL.md',
  'github-ops': '.ai/skills/codex/github-ops/SKILL.md',
  unocss: '.ai/skills/core/unocss/SKILL.md',
  vite: '.ai/skills/core/vite/SKILL.md',
  vue: '.ai/skills/core/vue/SKILL.md',
  'project-ui': '.ai/skills/project-ui/SKILL.md',
  'task-orchestrator': '.ai/skills/codex/task-orchestrator/SKILL.md',
}

for (const route of manifest.routes ?? []) {
  if (!route.id || routeIds.has(route.id)) errors.push(`invalid or duplicate route id: ${route.id}`)
  routeIds.add(route.id)
  if (!Array.isArray(route.skills) || route.skills.length === 0) {
    errors.push(`route ${route.id} has no skills`)
  }
  for (const skill of route.skills ?? []) {
    if (!skillPaths[skill] || !fs.existsSync(skillPaths[skill])) {
      errors.push(`route ${route.id} has nonexistent skill target: ${skill}`)
    }
  }
}

for (const skill of manifest.fallback ?? []) {
  if (!skillPaths[skill] || !fs.existsSync(skillPaths[skill])) {
    errors.push(`fallback has nonexistent skill target: ${skill}`)
  }
}

const samples = [
  { task: 'implement a generic UI', skills: ['project-ui'] },
  { task: 'use project-ui for a page', skills: ['project-ui'] },
  { task: 'create a settings page layout', skills: ['project-ui'] },
  { task: 'refine responsive styling', skills: ['project-ui'] },
  { task: 'apply PrimeVue styling', skills: ['project-ui'] },
  { task: 'apply UnoCSS styling', skills: ['project-ui'] },
  { task: 'design chart visuals', skills: ['project-ui'] },
  { task: 'review UI accessibility', skills: ['project-ui'] },
  { task: 'design motion presentation', skills: ['project-ui'] },
  {
    task: 'refine UI layout and update apps/desktop/src/adapters/window.ts',
    skills: ['desktop-tauri-guard', 'project-ui'],
  },
  { task: 'update apps/desktop/src/adapters/window.ts', skills: ['desktop-tauri-guard'] },
  { task: 'configure UnoCSS build tooling', skills: ['unocss'] },
  { task: 'review authentication security', skills: ['task-orchestrator'] },
  { task: 'investigate an unfamiliar request', skills: ['task-orchestrator'] },
]

for (const sample of samples) {
  const node = spawnSync(
    process.execPath,
    ['.ai/skills/codex/task-orchestrator/scripts/skill_router.mjs', sample.task, '--json'],
    { encoding: 'utf8' }
  )
  const python = spawnSync(
    'python3',
    ['.ai/skills/codex/task-orchestrator/scripts/skill_router.py', sample.task, '--json'],
    { encoding: 'utf8' }
  )
  if (node.status !== 0 || python.status !== 0) {
    errors.push(`router execution failed for: ${sample.task}`)
    continue
  }
  if (JSON.stringify(JSON.parse(node.stdout)) !== JSON.stringify(JSON.parse(python.stdout))) {
    errors.push(`router implementations disagree for: ${sample.task}`)
    continue
  }
  const result = JSON.parse(node.stdout)
  if (JSON.stringify(result.skills) !== JSON.stringify(sample.skills)) {
    errors.push(`unexpected skill route for: ${sample.task}`)
  }
  if (sample.skills.length === 1 && sample.skills[0] === 'project-ui') {
    const routeIds = result.routes.map(route => route.id)
    if (JSON.stringify(routeIds) !== JSON.stringify(['project-ui'])) {
      errors.push(`generic UI task has non-project-ui route: ${sample.task}`)
    }
  }
}

if (errors.length > 0) {
  errors.forEach(error => console.error(error))
  process.exit(1)
}

console.log('Skill routing is valid')
