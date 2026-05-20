#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import process from 'node:process'

const COMMANDS = new Set(['doctor', 'fix', 'ship'])
const GENERATED_PREFIXES = ['docs/generated/', '.ai/generated/', '.ai/governance/api-snapshots/']
const GENERATED_EXACT = new Set(['docs/generated/sbom.json'])
const MANAGED_FORMAT_FILES = [
  'project.config.json',
  'package.json',
  'apps/*/package.json',
  'packages/*/package.json',
  'apps/web-demo/src/constants/brand.ts',
  'apps/desktop/src-tauri/tauri.conf.json',
  '.ai/governance/policies/version.json',
  'docs/project-control-center.md',
  'README.md',
]
const GENERATED_FORMAT_FILES = [
  'docs/generated/**/*.json',
  'docs/generated/**/*.md',
  '.ai/generated/**/*.json',
  '.ai/generated/**/*.md',
]
const CONVENTIONAL_COMMIT_RE =
  /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert|wip|release|workflow|types)(?:\([a-z0-9-]+\))?!?: .+/

class CommandFailure extends Error {
  constructor(command, result, likelyCause, nextCommand, modifiedBeforeFailure) {
    super(`Command failed: ${command}`)
    this.command = command
    this.result = result
    this.likelyCause = likelyCause
    this.nextCommand = nextCommand
    this.modifiedBeforeFailure = modifiedBeforeFailure
  }
}

function run(command, args = [], options = {}) {
  const label = [command, ...args].join(' ')
  console.log(`\n$ ${label}`)
  const stdio = options.input !== undefined ? ['pipe', 'inherit', 'inherit'] : 'inherit'
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: 'utf-8',
    stdio: options.capture ? 'pipe' : stdio,
    shell: process.platform === 'win32',
    input: options.input,
  })
  if (options.capture) {
    if (result.stdout) process.stdout.write(result.stdout)
    if (result.stderr) process.stderr.write(result.stderr)
  }
  return { ...result, label, output: `${result.stdout ?? ''}\n${result.stderr ?? ''}` }
}

function runRequired(command, args, likelyCause, nextCommand, options = {}) {
  const result = run(command, args, options)
  if (result.status !== 0) {
    throw new CommandFailure(
      result.label,
      result,
      likelyCause,
      nextCommand,
      getStatusLines().length > 0
    )
  }
  return result
}

function getStatusLines(args = ['status', '--short']) {
  const result = spawnSync('git', args, {
    cwd: process.cwd(),
    encoding: 'utf-8',
    stdio: 'pipe',
  })
  return (result.stdout ?? '')
    .split('\n')
    .map(line => line.trimEnd())
    .filter(Boolean)
}

function changedFiles() {
  return getStatusLines().map(line => line.slice(3))
}

function generatedFiles() {
  return changedFiles().filter(
    file =>
      GENERATED_EXACT.has(file) ||
      GENERATED_PREFIXES.some(prefix => file.startsWith(prefix)) ||
      /^docs\/generated\/(api-surface-report|graphs\/)/.test(file)
  )
}

function printList(title, items, emptyText) {
  console.log(`\n${title}`)
  if (items.length === 0) {
    console.log(`- ${emptyText}`)
    return
  }
  for (const item of items) console.log(`- ${item}`)
}

function parseCommitMessage(args) {
  const messageArgs = args[0] === '--' ? args.slice(1) : args
  const message =
    messageArgs[0] === '--message' || messageArgs[0] === '-m'
      ? messageArgs.slice(1).join(' ')
      : messageArgs.join(' ')
  const trimmed = message.trim().replace(/[ \t]+/g, ' ')
  if (!trimmed) {
    throw new Error('Commit message is empty. Example: feat: improve project automation')
  }

  const [subject, ...body] = trimmed.split(/\r?\n/)
  const sanitizedSubject = subject
    .trim()
    .replace(/[.。!！]+$/u, '')
    .trim()
  const sanitized = [sanitizedSubject, ...body].join('\n').trim()

  if (!CONVENTIONAL_COMMIT_RE.test(sanitizedSubject)) {
    throw new Error(
      [
        'Commit message must be a Conventional Commit.',
        'Examples:',
        '- feat: improve project automation',
        '- fix: sync generated API report',
        '- docs: update project control center',
        '- chore: refresh governance outputs',
        '- refactor: simplify project metadata controller',
      ].join('\n')
    )
  }

  return sanitized
}

function runDoctor() {
  console.log('CCD doctor')
  runRequired(
    'pnpm',
    ['project:validate'],
    'project.config.json is invalid.',
    'pnpm project:validate'
  )
  console.log('\nProject config status: ok')

  runRequired(
    'pnpm',
    ['project:doctor'],
    'metadata targets are out of sync.',
    'pnpm project:sync && pnpm project:doctor'
  )
  console.log('\nMetadata sync status: ok')

  const status = getStatusLines()
  printList('Git working tree status', status, 'clean')
  console.log(`\nSuggested next command: ${status.length > 0 ? 'pnpm ccd:fix' : 'pnpm ccd:doctor'}`)
}

function runGovernanceGateWithGeneratedRetry() {
  const first = run('pnpm', ['governance:gate'], { capture: true })
  if (first.status === 0) return

  const generatedSyncFailure = /Generated governance artifacts changed during the gate/.test(
    first.output
  )
  if (!generatedSyncFailure) {
    throw new CommandFailure(
      first.label,
      first,
      'governance reported an architecture or policy violation.',
      'pnpm governance:gate',
      getStatusLines().length > 0
    )
  }

  console.log(
    '\nGovernance refreshed generated artifacts; continuing with deterministic formatting.'
  )
}

function formatManaged() {
  runRequired(
    'pnpm',
    ['exec', 'prettier', '--write', ...MANAGED_FORMAT_FILES],
    'managed metadata formatting failed.',
    'pnpm exec prettier --write project.config.json package.json'
  )
}

function formatGenerated() {
  runRequired(
    'pnpm',
    ['exec', 'prettier', '--write', '--no-error-on-unmatched-pattern', ...GENERATED_FORMAT_FILES],
    'generated report formatting failed.',
    'pnpm exec prettier --write "docs/generated/**/*.json" "docs/generated/**/*.md"'
  )
}

function normalizeGenerated() {
  runRequired(
    'pnpm',
    ['generated:normalize'],
    'generated whitespace normalization failed.',
    'pnpm generated:normalize'
  )
}

function runProjectDoctorWithRetry() {
  const first = run('pnpm', ['project:doctor'])
  if (first.status === 0) return

  console.log('\nproject:doctor failed; rerunning project:sync once.')
  runRequired('pnpm', ['project:sync'], 'project metadata sync failed.', 'pnpm project:sync')
  runRequired(
    'pnpm',
    ['project:doctor'],
    'metadata targets are still out of sync after one retry.',
    'pnpm project:doctor'
  )
}

function runDiffCheckWithGeneratedRetry() {
  const first = run('git', ['diff', '--check'])
  if (first.status === 0) return
  const generatedOnly = generatedFiles().length > 0
  if (!generatedOnly) {
    throw new CommandFailure(
      first.label,
      first,
      'whitespace errors remain in source files.',
      'git diff --check',
      true
    )
  }
  console.log('\ngit diff --check failed with generated outputs present; normalizing once.')
  normalizeGenerated()
  const second = run('git', ['diff', '--check'])
  if (second.status !== 0) {
    throw new CommandFailure(
      second.label,
      second,
      'generated whitespace did not normalize after one retry.',
      'pnpm generated:normalize'
    )
  }
}

function runFix() {
  const beforeGenerated = new Set(generatedFiles())
  runRequired(
    'pnpm',
    ['project:validate'],
    'project.config.json is invalid.',
    'pnpm project:validate'
  )
  runRequired('pnpm', ['project:sync'], 'project metadata sync failed.', 'pnpm project:sync')
  formatManaged()
  runGovernanceGateWithGeneratedRetry()
  formatGenerated()
  normalizeGenerated()
  runProjectDoctorWithRetry()
  runRequired('pnpm', ['ai:doctor'], 'AI workspace doctor failed.', 'pnpm ai:doctor')
  runRequired('pnpm', ['type-check'], 'TypeScript validation failed.', 'pnpm type-check')
  runRequired('pnpm', ['drift-check'], 'desktop drift validation failed.', 'pnpm drift-check')
  runDiffCheckWithGeneratedRetry()

  const generated = generatedFiles()
  const refreshed = generated.filter(file => !beforeGenerated.has(file))
  printList('Changed files', changedFiles(), 'none')
  printList('Generated files refreshed', refreshed.length > 0 ? refreshed : generated, 'none')
  console.log('\nChecks passed')
  console.log('- project:validate')
  console.log('- project:doctor')
  console.log('- ai:doctor')
  console.log('- governance:gate')
  console.log('- type-check')
  console.log('- drift-check')
  console.log('- git diff --check')
  console.log('\nNext command suggestion: pnpm ccd:ship -- "feat: describe change"')
}

function runLintStagedWithRetry() {
  const first = run('pnpm', ['lint:staged:safe'])
  if (first.status === 0) return

  console.log('\nlint-staged failed; staging modifications and retrying once.')
  runRequired('git', ['add', '-A'], 'git staging failed.', 'git add -A')
  const second = run('pnpm', ['lint:staged:safe'])
  if (second.status !== 0) {
    throw new CommandFailure(
      second.label,
      second,
      'lint-staged failed after one retry.',
      'pnpm lint:staged:safe',
      true
    )
  }
}

function runShip(args) {
  const message = parseCommitMessage(args)
  runFix()
  runRequired('git', ['add', '-A'], 'git staging failed.', 'git add -A')
  runLintStagedWithRetry()
  runRequired('git', ['add', '-A'], 'git staging failed.', 'git add -A')
  runRequired(
    'pnpm',
    ['exec', 'commitlint'],
    'commit message failed commitlint.',
    `pnpm ccd:ship -- "${message}"`,
    { input: `${message}\n` }
  )
  runRequired(
    'git',
    ['commit', '-m', message],
    'git commit failed. Husky or commitlint may have rejected the commit.',
    `git commit -m "${message}"`
  )

  const hash = run('git', ['rev-parse', '--short', 'HEAD'], { capture: true }).stdout.trim()
  const status = getStatusLines()
  console.log('\nShip complete')
  console.log(`- Commit hash: ${hash}`)
  console.log(`- Commit message used: ${message}`)
  console.log(`- Working tree: ${status.length === 0 ? 'clean' : 'dirty'}`)
  if (status.length > 0) printList('Remaining files', status, 'none')
}

function reportFailure(error) {
  if (error instanceof CommandFailure) {
    console.error('\nCCD ops failed')
    console.error(`- Failed command: ${error.command}`)
    console.error(`- Likely cause: ${error.likelyCause}`)
    console.error(`- Next suggested command: ${error.nextCommand}`)
    console.error(`- Files modified before failure: ${error.modifiedBeforeFailure ? 'yes' : 'no'}`)
    process.exit(error.result.status ?? 1)
  }

  console.error('\nCCD ops failed')
  console.error(`- ${error instanceof Error ? error.message : String(error)}`)
  console.error('- Next suggested command: pnpm ccd:doctor')
  process.exit(1)
}

function main() {
  const [command, ...args] = process.argv.slice(2)
  if (!COMMANDS.has(command)) {
    console.error('Usage: node scripts/ccd-ops.mjs <doctor|fix|ship> [message]')
    process.exit(1)
  }

  try {
    if (command === 'doctor') runDoctor()
    if (command === 'fix') runFix()
    if (command === 'ship') runShip(args)
  } catch (error) {
    reportFailure(error)
  }
}

main()
