#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'
import { readPolicy } from './policy-utils.mjs'

const root = process.cwd()
const releasePolicy = readPolicy('release')
const registryPolicy = releasePolicy.githubWorkflowRegistry

if (!registryPolicy?.required) {
  console.log('GitHub workflow registry hygiene skipped: policy not required.')
  process.exit(0)
}

function localWorkflowFiles() {
  const dir = join(root, '.github/workflows')
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true })
    .filter(entry => entry.isFile() && /\.ya?ml$/.test(entry.name))
    .map(entry => `.github/workflows/${entry.name}`)
    .sort()
}

function runGh(args) {
  return spawnSync('gh', args, {
    cwd: root,
    encoding: 'utf8',
    stdio: 'pipe',
  })
}

function warn(message) {
  console.warn(`[WARN] ${message}`)
}

const expected = [...registryPolicy.allowedActiveWorkflowFiles].sort()
const allowedRemote = new Set([...(registryPolicy.allowedRemoteWorkflowPaths ?? []), ...expected])
const local = localWorkflowFiles()
const findings = []

for (const file of local) {
  if (!expected.includes(file)) {
    findings.push(`${file}: local workflow is not declared in release policy allowedActiveWorkflowFiles`)
  }
}

for (const file of expected) {
  if (!local.includes(file)) {
    findings.push(`${file}: declared active workflow file is missing locally`)
  }
}

const auth = runGh(['auth', 'status'])
if (auth.status !== 0) {
  if (registryPolicy.mode === 'warn-without-token') {
    warn('GitHub registry query skipped because gh is not authenticated.')
    if (findings.length > 0) {
      console.error('GitHub workflow registry local policy validation failed:')
      findings.forEach(finding => console.error(`- ${finding}`))
      process.exit(1)
    }
    process.exit(0)
  }
  console.error('GitHub workflow registry validation failed: gh is not authenticated.')
  process.exit(1)
}

const repo = runGh(['repo', 'view', '--json', 'nameWithOwner', '--jq', '.nameWithOwner'])
if (repo.status !== 0 || !repo.stdout.trim()) {
  console.error('GitHub workflow registry validation failed: unable to resolve repo.')
  process.exit(1)
}

const workflows = runGh([
  'api',
  `repos/${repo.stdout.trim()}/actions/workflows`,
  '--jq',
  '.workflows[] | [.id,.name,.path,.state] | @tsv',
])

if (workflows.status !== 0) {
  console.error('GitHub workflow registry validation failed: unable to list workflows.')
  process.exit(1)
}

for (const line of workflows.stdout.split('\n').filter(Boolean)) {
  const [id, name, path, state] = line.split('\t')
  if (state !== 'active') continue
  if (allowedRemote.has(path)) continue
  findings.push(
    `${name} (${id}): active remote workflow "${path}" is not declared in release policy; disable it with: gh api -X PUT repos/${repo.stdout.trim()}/actions/workflows/${id}/disable`
  )
}

if (findings.length > 0) {
  console.error('GitHub workflow registry hygiene failed:')
  findings.forEach(finding => console.error(`- ${finding}`))
  process.exit(1)
}

console.log('GitHub workflow registry hygiene passed.')
