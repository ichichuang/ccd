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

function runGit(args) {
  return spawnSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    stdio: 'pipe',
  })
}

function warn(message) {
  console.warn(`[WARN] ${message}`)
}

function commandOutput(result) {
  return [result.stderr, result.stdout]
    .map(output => output?.trim())
    .filter(Boolean)
    .join('\n')
    .replace(/gh[o,p,s,u,r]_[A-Za-z0-9_]+/g, '<redacted>')
}

function normalizeRepoName(value) {
  const raw = value?.trim()
  if (!raw) return ''
  const repo = raw
    .replace(/^https:\/\/github\.com\//, '')
    .replace(/^git@github\.com:/, '')
    .replace(/\.git$/, '')
    .replace(/^\/+/, '')
  return /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo) ? repo : ''
}

function resolveRepoName() {
  const envRepo = normalizeRepoName(process.env.GITHUB_REPOSITORY) || normalizeRepoName(process.env.GH_REPO)
  if (envRepo) return { name: envRepo, source: 'environment' }

  const viewedRepo = runGh(['repo', 'view', '--json', 'nameWithOwner', '--jq', '.nameWithOwner'])
  const viewedName = normalizeRepoName(viewedRepo.stdout)
  if (viewedRepo.status === 0 && viewedName) return { name: viewedName, source: 'gh repo view' }

  const remote = runGit(['config', '--get', 'remote.origin.url'])
  const remoteName = normalizeRepoName(remote.stdout)
  if (remote.status === 0 && remoteName) return { name: remoteName, source: 'remote.origin.url' }

  return {
    name: '',
    source: 'unresolved',
    detail: [
      `gh repo view: ${commandOutput(viewedRepo) || `exit ${viewedRepo.status ?? 'unknown'}`}`,
      `git remote.origin.url: ${commandOutput(remote) || `exit ${remote.status ?? 'unknown'}`}`,
    ].join('\n'),
  }
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

const repo = resolveRepoName()
if (!repo.name) {
  console.error('GitHub workflow registry validation failed: unable to resolve repo.')
  if (repo.detail) console.error(repo.detail)
  process.exit(1)
}

const workflows = runGh([
  'api',
  `repos/${repo.name}/actions/workflows`,
  '--jq',
  '.workflows[] | [.id,.name,.path,.state] | @tsv',
])

if (workflows.status !== 0) {
  const auth = runGh(['auth', 'status'])
  if (auth.status !== 0 && registryPolicy.mode === 'warn-without-token') {
    warn(`GitHub registry query skipped for ${repo.name} because gh could not list workflows.`)
    warn(commandOutput(auth) || 'gh auth status failed without diagnostic output.')
    if (findings.length > 0) {
      console.error('GitHub workflow registry local policy validation failed:')
      findings.forEach(finding => console.error(`- ${finding}`))
      process.exit(1)
    }
    process.exit(0)
  }

  console.error('GitHub workflow registry validation failed: unable to list workflows.')
  console.error(`repo: ${repo.name} (${repo.source})`)
  const output = commandOutput(workflows)
  if (output) console.error(output)
  process.exit(1)
}

for (const line of workflows.stdout.split('\n').filter(Boolean)) {
  const [id, name, path, state] = line.split('\t')
  if (state !== 'active') continue
  if (allowedRemote.has(path)) continue
  findings.push(
    `${name} (${id}): active remote workflow "${path}" is not declared in release policy; disable it with: gh api -X PUT repos/${repo.name}/actions/workflows/${id}/disable`
  )
}

if (findings.length > 0) {
  console.error('GitHub workflow registry hygiene failed:')
  findings.forEach(finding => console.error(`- ${finding}`))
  process.exit(1)
}

console.log('GitHub workflow registry hygiene passed.')
