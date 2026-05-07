#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '../../../../..')
const manifestPath = path.join(repoRoot, '.ai', 'manifests', 'skill-routing.json')

function parseArgs(argv) {
  const args = {
    task: '',
    paths: [],
    json: false,
  }

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--json') {
      args.json = true
      continue
    }
    if (arg === '--paths') {
      i += 1
      while (i < argv.length && !argv[i].startsWith('--')) {
        args.paths.push(argv[i])
        i += 1
      }
      i -= 1
      continue
    }
    if (!args.task) {
      args.task = arg
      continue
    }
    args.task = `${args.task} ${arg}`
  }

  if (!args.task) {
    throw new Error('Usage: skill_router.mjs <task> [--paths <path...>] [--json]')
  }

  return args
}

function currentBranch() {
  const result = spawnSync('git', ['branch', '--show-current'], {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: 'pipe',
  })
  if (result.status !== 0) return 'unknown'
  return result.stdout.trim() || 'unknown'
}

function globToRegExp(pattern) {
  let source = ''
  for (let i = 0; i < pattern.length; i += 1) {
    const char = pattern[i]
    const next = pattern[i + 1]
    if (char === '*' && next === '*') {
      source += '.*'
      i += 1
      continue
    }
    if (char === '*') {
      source += '[^/]*'
      continue
    }
    if ('\\^$+?.()|{}[]'.includes(char)) {
      source += `\\${char}`
      continue
    }
    source += char
  }
  return new RegExp(`^${source}$`)
}

function matchesGlob(value, pattern) {
  return globToRegExp(pattern).test(value)
}

function containsKeyword(task, keyword) {
  const normalizedKeyword = keyword.toLowerCase()
  if (/[a-z]/i.test(normalizedKeyword)) {
    return new RegExp(`\\b${normalizedKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(
      task
    )
  }
  return task.includes(normalizedKeyword)
}

function dedupe(items) {
  return [...new Set(items)]
}

function matchRoute(task, paths, branch, route) {
  let score = 0
  const reasons = []

  for (const keyword of route.keywords ?? []) {
    if (containsKeyword(task, String(keyword))) {
      score += 2
      reasons.push(`keyword:${keyword}`)
    }
  }

  for (const pattern of route.path_globs ?? []) {
    if (paths.some(candidate => matchesGlob(candidate, pattern))) {
      score += 3
      reasons.push(`path:${pattern}`)
    }
  }

  if (score === 0) return null

  if (route.branch_modes && typeof route.branch_modes === 'object') {
    const activeBranches = new Set((route.branch_modes.active_branches ?? []).map(String))
    const hasExplicitKeyword = reasons.some(reason => reason.startsWith('keyword:'))
    const hasForcedPath = (route.path_globs ?? []).some(pattern =>
      paths.some(candidate => matchesGlob(candidate, pattern))
    )
    if (!activeBranches.has(branch) && !hasForcedPath && !hasExplicitKeyword) {
      return null
    }
  }

  return {
    route_id: String(route.id),
    score,
    skills: route.skills ?? [],
    prechecks: route.prechecks ?? [],
    token_strategy: route.token_strategy ?? [],
    reasons,
  }
}

function routeTask(task, paths) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  const branch = currentBranch()
  const normalizedTask = task.toLowerCase()

  const matches = manifest.routes
    .map(route => matchRoute(normalizedTask, paths, branch, route))
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || a.route_id.localeCompare(b.route_id))

  let selectedSkills = [...(manifest.default_route.skills ?? [])]
  let prechecks = [...(manifest.default_route.prechecks ?? [])]
  let tokenStrategy = [...(manifest.default_route.token_strategy ?? [])]
  let reasons = ['default-route']

  if (matches.length > 0) {
    selectedSkills = matches.flatMap(match => match.skills)
    prechecks = matches.flatMap(match => match.prechecks)
    tokenStrategy = matches.flatMap(match => match.token_strategy)
    reasons = matches.flatMap(match => match.reasons)
  }

  return {
    task,
    paths,
    branch,
    selected_skills: dedupe(selectedSkills),
    prechecks: dedupe(prechecks),
    token_strategy: dedupe(tokenStrategy),
    matched_routes: matches.map(match => match.route_id),
    reasons: dedupe(reasons),
  }
}

function render(payload) {
  const lines = [
    `matched_routes: ${payload.matched_routes.length ? payload.matched_routes.join(', ') : 'default'}`,
    `selected_skills: ${payload.selected_skills.join(', ')}`,
    `prechecks: ${payload.prechecks.length ? payload.prechecks.join(', ') : 'none'}`,
    'token_strategy:',
  ]
  payload.token_strategy.forEach(item => lines.push(`- ${item}`))
  return lines.join('\n')
}

try {
  const args = parseArgs(process.argv.slice(2))
  const payload = routeTask(args.task, args.paths)
  console.log(args.json ? JSON.stringify(payload, null, 2) : render(payload))
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
}
