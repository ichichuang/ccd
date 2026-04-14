import { spawnSync } from 'node:child_process'

const LINT_STAGED_SYMLINK_ERR = /beyond a symbolic link/i

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
  const res = run('git', args)
  if (res.status !== 0) return []
  return (res.stdout ?? '')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
}

function hasPartiallyStagedFiles() {
  const staged = new Set(readLines(['diff', '--name-only', '--cached', '--diff-filter=ACMR']))
  const unstaged = readLines(['diff', '--name-only'])
  return unstaged.some(file => staged.has(file))
}

function runLintStaged(args = []) {
  return run('pnpm', ['exec', 'lint-staged', ...args])
}

console.log('🧹 Running Enterprise Guardian: Lint Staged...')

const firstRun = runLintStaged()
if (firstRun.status === 0) process.exit(0)

const output = `${firstRun.stdout ?? ''}\n${firstRun.stderr ?? ''}`
const isSymlinkError = LINT_STAGED_SYMLINK_ERR.test(output)
if (!isSymlinkError) process.exit(firstRun.status ?? 1)

if (hasPartiallyStagedFiles()) {
  console.error('❌ lint-staged stash fallback blocked: partially staged files detected.')
  console.error('请先处理部分暂存文件（全部 add 或拆分提交），然后重试。')
  process.exit(1)
}

console.warn('⚠️ Detected symbolic-link stash issue, retrying lint-staged with --no-stash...')
const fallback = runLintStaged(['--no-stash'])
process.exit(fallback.status ?? 1)
