#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const aiRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..')
const manifestPath = path.join(aiRoot, 'manifests/skill-routing.json')

function parseArgs(argv) {
  const json = argv.includes('--json')
  const values = argv.filter(value => value !== '--json' && value !== '--')
  return { json, task: values.join(' ').trim() }
}

function route(task, manifest) {
  const normalized = task.toLowerCase()
  const matches = manifest.routes
    .map(item => {
      const keywordMatches = item.keywords.filter(keyword => normalized.includes(keyword.toLowerCase()))
      const pathMatches = item.paths.filter(candidate => normalized.includes(candidate.toLowerCase()))
      return {
        id: item.id,
        skills: item.skills,
        priority: item.priority,
        evidence: [...keywordMatches, ...pathMatches],
      }
    })
    .filter(item => item.evidence.length > 0)
    .sort((left, right) => right.priority - left.priority || left.id.localeCompare(right.id))

  const selectedSkills = [...new Set(matches.flatMap(item => item.skills))]
  return {
    task,
    routes: matches.map(({ id, evidence }) => ({ id, evidence })),
    skills: selectedSkills.length > 0 ? selectedSkills : manifest.fallback,
  }
}

const args = parseArgs(process.argv.slice(2))
if (!args.task) {
  console.error('Usage: skill_router.mjs "<task>" [--json]')
  process.exit(1)
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
const result = route(args.task, manifest)

if (args.json) {
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
} else {
  process.stdout.write(`${result.skills.join(', ')}\n`)
}
