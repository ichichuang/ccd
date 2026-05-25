import { spawnSync } from 'node:child_process'

const TRACKED_GENERATED_FILES = new Set([
  'apps/web-demo/src/types/auto-imports.d.ts',
  'apps/web-demo/src/types/components.d.ts',
  'src/types/auto-imports.d.ts',
  'src/types/components.d.ts',
  'src/views/example/components/icons/configs/iconLists.generated.ts',
  'apps/web-demo/src/views/example/components/icons/configs/iconLists.generated.ts',
])

const LOCAL_ONLY_GENERATED_FILES = new Set(['apps/web-demo/.eslintrc-auto-import.json'])

function run(cmd, args, options = {}) {
  const result = spawnSync(cmd, args, {
    stdio: 'pipe',
    encoding: 'utf8',
    ...options,
  })
  const stdout = result.stdout ?? ''
  const stderr = result.stderr ?? ''
  if (stdout) process.stdout.write(stdout)
  if (stderr) process.stderr.write(stderr)
  return result
}

function readLines(args) {
  const result = spawnSync('git', args, {
    stdio: 'pipe',
    encoding: 'utf8',
  })
  if (result.status !== 0) {
    if (result.stdout) process.stdout.write(result.stdout)
    if (result.stderr) process.stderr.write(result.stderr)
    process.exit(result.status ?? 1)
  }
  return (result.stdout ?? '')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
}

function printList(files) {
  for (const file of files) console.error(`  - ${file}`)
}

function assertNoPartiallyStagedFiles(staged) {
  const unstaged = new Set(readLines(['diff', '--name-only']))
  const conflicts = staged.filter(file => unstaged.has(file))
  if (conflicts.length === 0) return

  console.error('Partially staged files detected. lint-staged was not run.')
  printList(conflicts)
  console.error('Fully stage these files or split them into a separate commit before retrying.')
  console.error('No stash or automatic rollback was performed.')
  process.exit(1)
}

function assertNoBlockedGeneratedFiles(staged) {
  const blocked = staged.filter(file => LOCAL_ONLY_GENERATED_FILES.has(file))
  if (blocked.length === 0) return

  console.error('Generated files are staged. lint-staged was not run.')
  printList(blocked)
  console.error('These are local-only generated artifacts and must not be committed.')
  console.error('No stash or automatic rollback was performed.')
  process.exit(1)
}

function warnTrackedGeneratedFiles(staged) {
  const generated = staged.filter(file => TRACKED_GENERATED_FILES.has(file))
  if (generated.length === 0) return

  console.warn('Tracked generated files are staged:')
  printList(generated)
  console.warn('Confirm their source inputs changed intentionally before committing.')
}

function runLintStagedNoStash() {
  return run('pnpm', ['exec', 'lint-staged', '--no-stash'])
}

console.log('Running Enterprise Guardian: lint-staged --no-stash...')

const staged = readLines(['diff', '--name-only', '--cached', '--diff-filter=ACMR'])
assertNoPartiallyStagedFiles(staged)
assertNoBlockedGeneratedFiles(staged)
warnTrackedGeneratedFiles(staged)

const result = runLintStagedNoStash()
if (result.status !== 0) {
  console.error(
    'lint-staged failed. No automatic stash or rollback was performed. Your working tree was left unchanged except for tool fixes already applied by lint-staged --no-stash.'
  )
}
process.exit(result.status ?? 1)
