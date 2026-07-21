#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import process from 'node:process'

const manifest = JSON.parse(fs.readFileSync('.ai/manifests/skill-routing.json', 'utf8'))
const routeIds = new Set()
const errors = []

for (const route of manifest.routes ?? []) {
  if (!route.id || routeIds.has(route.id)) errors.push(`invalid or duplicate route id: ${route.id}`)
  routeIds.add(route.id)
  if (!Array.isArray(route.skills) || route.skills.length === 0) {
    errors.push(`route ${route.id} has no skills`)
  }
}

const samples = [
  'refine the settings page layout',
  'update apps/desktop/src/adapters/window.ts',
  'change the dependency graph architecture',
]

for (const sample of samples) {
  const node = spawnSync(
    process.execPath,
    ['.ai/skills/codex/task-orchestrator/scripts/skill_router.mjs', sample, '--json'],
    { encoding: 'utf8' }
  )
  const python = spawnSync(
    'python3',
    ['.ai/skills/codex/task-orchestrator/scripts/skill_router.py', sample, '--json'],
    { encoding: 'utf8' }
  )
  if (node.status !== 0 || python.status !== 0) {
    errors.push(`router execution failed for: ${sample}`)
    continue
  }
  if (JSON.stringify(JSON.parse(node.stdout)) !== JSON.stringify(JSON.parse(python.stdout))) {
    errors.push(`router implementations disagree for: ${sample}`)
  }
}

if (errors.length > 0) {
  errors.forEach(error => console.error(error))
  process.exit(1)
}

console.log('Skill routing is valid')
