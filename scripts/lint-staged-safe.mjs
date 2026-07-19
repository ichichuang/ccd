import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const TRACKED_GENERATED_FILES = new Set([
  'apps/web-demo/src/types/auto-imports.d.ts',
  'apps/web-demo/src/types/components.d.ts',
  'src/types/auto-imports.d.ts',
  'src/types/components.d.ts',
  'src/views/example/components/icons/configs/iconLists.generated.ts',
  'apps/web-demo/src/views/example/components/icons/configs/iconLists.generated.ts',
])

const LOCAL_ONLY_GENERATED_FILES = new Set(['apps/web-demo/.eslintrc-auto-import.json'])

const PROTECTED_FIXTURE_PREFIXES = Object.freeze([
  '.ai/governance/ui/fixtures/source-valid/',
  '.ai/governance/ui/fixtures/source-invalid/',
])

class LintStagedSafeError extends Error {
  constructor(code, message, { exitCode = 1, lines = [] } = {}) {
    super(message)
    this.name = 'LintStagedSafeError'
    this.code = code
    this.exitCode = exitCode
    this.lines = lines
  }
}

function comparePaths(left, right) {
  return Buffer.compare(Buffer.from(left), Buffer.from(right))
}

function sortedUnique(values) {
  return [...new Set(values)].sort(comparePaths)
}

function splitNull(value) {
  return value.split('\0').filter(Boolean)
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
}

function pathSetSha256(paths) {
  return sha256(Buffer.from(`${paths.join('\n')}\n`, 'utf8'))
}

function withoutTemporaryIndex(env) {
  const realEnv = { ...env }
  delete realEnv.GIT_INDEX_FILE
  return realEnv
}

function runCommand(command, args, { root, env, input, printOutput = false } = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    env,
    input,
    stdio: 'pipe',
    encoding: 'utf8',
  })
  if (printOutput) {
    if (result.stdout) process.stdout.write(result.stdout)
    if (result.stderr) process.stderr.write(result.stderr)
  }
  return result
}

function git(args, { root, env, input } = {}) {
  const result = runCommand('git', args, { root, env, input })
  if (result.error || result.status !== 0) {
    throw new LintStagedSafeError(
      'GIT_COMMAND_FAILED',
      `git ${args.join(' ')} failed: ${(result.stderr ?? result.error?.message ?? '').trim()}`
    )
  }
  return result.stdout ?? ''
}

function resolveRepositoryRoot(env, root = undefined) {
  return fs.realpathSync(path.resolve(git(['rev-parse', '--show-toplevel'], { root, env }).trim()))
}

function readStagedPaths(root, env) {
  return sortedUnique(
    splitNull(git(['diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z'], { root, env }))
  )
}

function readUnstagedPaths(root, env) {
  return new Set(splitNull(git(['diff', '--name-only', '-z'], { root, env })))
}

function isProtectedPath(relPath) {
  if (PROTECTED_FIXTURE_PREFIXES.some(prefix => relPath.startsWith(prefix))) return true
  if (relPath.startsWith('.ai/governance/') && relPath.endsWith('.json')) return true
  return relPath === '.ai/manifests/skills-lock.json'
}

function printList(files) {
  for (const file of files) console.error(`  - ${file}`)
}

function assertNoPartiallyStagedFiles(staged, root, env) {
  const unstaged = readUnstagedPaths(root, env)
  const conflicts = staged.filter(file => unstaged.has(file))
  if (conflicts.length === 0) return

  throw new LintStagedSafeError('PARTIALLY_STAGED', 'Partially staged files detected', {
    lines: [
      'Partially staged files detected. lint-staged was not run.',
      ...conflicts.map(file => `  - ${file}`),
      'Fully stage these files or split them into a separate commit before retrying.',
      'No stash or automatic rollback was performed.',
    ],
  })
}

function assertNoBlockedGeneratedFiles(staged) {
  const blocked = staged.filter(file => LOCAL_ONLY_GENERATED_FILES.has(file))
  if (blocked.length === 0) return

  throw new LintStagedSafeError('LOCAL_ONLY_GENERATED', 'Generated files are staged', {
    lines: [
      'Generated files are staged. lint-staged was not run.',
      ...blocked.map(file => `  - ${file}`),
      'These are local-only generated artifacts and must not be committed.',
      'No stash or automatic rollback was performed.',
    ],
  })
}

function warnTrackedGeneratedFiles(staged) {
  const generated = staged.filter(file => TRACKED_GENERATED_FILES.has(file))
  if (generated.length === 0) return

  console.warn('Tracked generated files are staged:')
  printList(generated)
  console.warn('Confirm their source inputs changed intentionally before committing.')
}

function parseIndexEntry(output, relPath, source) {
  const records = splitNull(output)
  if (records.length !== 1)
    throw new LintStagedSafeError(
      'INDEX_ENTRY_DRIFT',
      `${source} must contain one entry for ${relPath}`
    )
  const match = /^(\d+) ([0-9a-f]+) (\d+)\t(.*)$/u.exec(records[0])
  if (!match || match[3] !== '0' || match[4] !== relPath)
    throw new LintStagedSafeError(
      'INDEX_ENTRY_DRIFT',
      `${source} contains an invalid entry for ${relPath}`
    )
  return { mode: match[1], blob: match[2], stage: match[3], path: match[4] }
}

function readIndexEntry(root, env, relPath, source = 'index') {
  return parseIndexEntry(
    git(['ls-files', '--stage', '-z', '--', relPath], { root, env }),
    relPath,
    source
  )
}

function readHeadEntry(root, env, relPath) {
  const output = git(['ls-tree', '-z', 'HEAD', '--', relPath], { root, env })
  if (!output) return null
  const records = splitNull(output)
  const match = records.length === 1 ? /^(\d+) ([a-z]+) ([0-9a-f]+)\t(.*)$/u.exec(records[0]) : null
  if (!match || match[2] !== 'blob' || match[4] !== relPath)
    throw new LintStagedSafeError('HEAD_ENTRY_DRIFT', `HEAD entry is invalid for ${relPath}`)
  return { mode: match[1], blob: match[3], path: match[4] }
}

function readWorktreeSnapshot(root, relPath) {
  const absolute = path.join(root, relPath)
  const stat = fs.lstatSync(absolute)
  const bytes = stat.isSymbolicLink()
    ? Buffer.from(fs.readlinkSync(absolute), 'utf8')
    : fs.readFileSync(absolute)
  return {
    sha256: sha256(bytes),
    mode: stat.mode & 0o777,
    type: stat.isSymbolicLink() ? 'symlink' : 'file',
  }
}

function snapshotProtectedState(root, env, protectedPaths) {
  const entries = new Map()
  const worktree = new Map()
  for (const relPath of protectedPaths) {
    entries.set(relPath, readIndexEntry(root, env, relPath, 'real index'))
    worktree.set(relPath, readWorktreeSnapshot(root, relPath))
  }
  return { entries, worktree }
}

function assertProtectedState(root, env, protectedPaths, expected) {
  for (const relPath of protectedPaths) {
    assert.deepEqual(
      readIndexEntry(root, env, relPath, 'real index'),
      expected.entries.get(relPath)
    )
    assert.deepEqual(readWorktreeSnapshot(root, relPath), expected.worktree.get(relPath))
  }
}

function assertExactPaths(actual, expected, code, label) {
  if (
    actual.length !== expected.length ||
    actual.some((value, index) => value !== expected[index])
  ) {
    throw new LintStagedSafeError(code, `${label} path set drifted`, {
      lines: [
        `${label} path set drifted.`,
        `Expected: ${expected.join(', ')}`,
        `Actual: ${actual.join(', ')}`,
      ],
    })
  }
}

function applyEligibleEntries(root, env, entries) {
  if (entries.length === 0) return
  const input = entries.map(entry => `${entry.mode} ${entry.blob}\t${entry.path}\0`).join('')
  git(['update-index', '-z', '--index-info'], { root, env, input })
}

function runRealLintStaged({ root, env }) {
  return runCommand('pnpm', ['exec', 'lint-staged', '--no-stash'], {
    root,
    env,
    printOutput: true,
  })
}

function executeSafeLintStaged({
  root = null,
  env = process.env,
  lintStagedRunner,
  onTemporaryDirectory = null,
} = {}) {
  const realEnv = withoutTemporaryIndex(env)
  const repositoryRoot = fs.realpathSync(path.resolve(root ?? resolveRepositoryRoot(realEnv)))
  const resolvedRoot = resolveRepositoryRoot(realEnv, repositoryRoot)
  if (repositoryRoot !== resolvedRoot)
    throw new LintStagedSafeError('REPOSITORY_ROOT_DRIFT', 'Resolved repository root drifted')

  const realIndex = path.resolve(
    git(['rev-parse', '--path-format=absolute', '--git-path', 'index'], {
      root: repositoryRoot,
      env: realEnv,
    }).trim()
  )
  const staged = readStagedPaths(repositoryRoot, realEnv)
  assertNoPartiallyStagedFiles(staged, repositoryRoot, realEnv)
  assertNoBlockedGeneratedFiles(staged)
  warnTrackedGeneratedFiles(staged)

  const protectedPaths = staged.filter(isProtectedPath)
  const eligiblePaths = staged.filter(relPath => !isProtectedPath(relPath))
  const protectedState = snapshotProtectedState(repositoryRoot, realEnv, protectedPaths)
  const initialRealTree = git(['write-tree'], { root: repositoryRoot, env: realEnv }).trim()
  const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'ccd-lint-staged-safe-'))
  const temporaryIndex = path.join(temporaryDirectory, 'index')
  if (path.resolve(temporaryDirectory).startsWith(`${repositoryRoot}${path.sep}`))
    throw new LintStagedSafeError(
      'TEMPORARY_INDEX_LOCATION',
      'Temporary index is inside repository'
    )
  if (path.resolve(temporaryIndex) === realIndex)
    throw new LintStagedSafeError('TEMPORARY_INDEX_COLLISION', 'Temporary index equals real index')
  if (onTemporaryDirectory) onTemporaryDirectory(temporaryDirectory)

  const temporaryEnv = { ...realEnv, GIT_INDEX_FILE: temporaryIndex }
  try {
    git(['read-tree', initialRealTree], { root: repositoryRoot, env: temporaryEnv })
    for (const relPath of protectedPaths) {
      const headEntry = readHeadEntry(repositoryRoot, realEnv, relPath)
      if (headEntry) {
        git(['update-index', '--cacheinfo', headEntry.mode, headEntry.blob, headEntry.path], {
          root: repositoryRoot,
          env: temporaryEnv,
        })
      } else {
        git(['update-index', '--force-remove', '--', relPath], {
          root: repositoryRoot,
          env: temporaryEnv,
        })
      }
    }

    const temporaryStaged = readStagedPaths(repositoryRoot, temporaryEnv)
    assertExactPaths(temporaryStaged, eligiblePaths, 'TEMPORARY_PATH_SET_DRIFT', 'Temporary staged')
    const realTreeBeforeLintStaged = git(['write-tree'], {
      root: repositoryRoot,
      env: realEnv,
    }).trim()
    if (realTreeBeforeLintStaged !== initialRealTree)
      throw new LintStagedSafeError('REAL_INDEX_MUTATED', 'Real index changed before lint-staged')

    console.log(
      `lint-staged-safe isolated index: protected=${protectedPaths.length} eligible=${eligiblePaths.length} eligiblePathSetSha256=${pathSetSha256(eligiblePaths)}`
    )
    const lintResult = lintStagedRunner({
      root: repositoryRoot,
      env: temporaryEnv,
      protectedPaths,
      eligiblePaths,
      temporaryIndex,
    })
    const lintStatus = lintResult.status ?? 1
    const realTreeAfterLintStaged = git(['write-tree'], {
      root: repositoryRoot,
      env: realEnv,
    }).trim()
    if (realTreeAfterLintStaged !== initialRealTree)
      throw new LintStagedSafeError(
        'REAL_INDEX_MUTATED',
        'Real index changed while lint-staged ran'
      )
    assertProtectedState(repositoryRoot, realEnv, protectedPaths, protectedState)

    if (lintStatus !== 0) {
      return {
        status: lintStatus,
        protectedPaths,
        eligiblePaths,
        eligiblePathSetSha256: pathSetSha256(eligiblePaths),
      }
    }

    const finalEligibleEntries = eligiblePaths.map(relPath =>
      readIndexEntry(repositoryRoot, temporaryEnv, relPath, 'temporary index')
    )
    assertProtectedState(repositoryRoot, realEnv, protectedPaths, protectedState)
    applyEligibleEntries(repositoryRoot, realEnv, finalEligibleEntries)
    assertProtectedState(repositoryRoot, realEnv, protectedPaths, protectedState)
    return {
      status: 0,
      protectedPaths,
      eligiblePaths,
      eligiblePathSetSha256: pathSetSha256(eligiblePaths),
    }
  } finally {
    fs.rmSync(temporaryDirectory, { recursive: true, force: true })
  }
}

function testRunGit(root, env, args, { input } = {}) {
  const result = spawnSync('git', args, {
    cwd: root,
    env,
    input,
    stdio: 'pipe',
    encoding: 'utf8',
  })
  if (result.status !== 0) {
    throw new Error(`git ${args.join(' ')} failed: ${(result.stderr ?? '').trim()}`)
  }
  return (result.stdout ?? '').trim()
}

function testWrite(root, relPath, content) {
  const absolute = path.join(root, relPath)
  fs.mkdirSync(path.dirname(absolute), { recursive: true })
  fs.writeFileSync(absolute, content)
}

function createTestRepository() {
  const ownedRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ccd-lint-staged-safe-self-test-'))
  const root = path.join(ownedRoot, 'repository')
  const home = path.join(ownedRoot, 'home')
  fs.mkdirSync(root)
  fs.mkdirSync(home)
  const env = {
    ...process.env,
    HOME: home,
    XDG_CONFIG_HOME: path.join(home, '.config'),
    GIT_CONFIG_NOSYSTEM: '1',
  }
  testRunGit(root, env, ['init', '--quiet'])
  testRunGit(root, env, ['config', 'user.name', 'CCD Self Test'])
  testRunGit(root, env, ['config', 'user.email', 'ccd-self-test@example.invalid'])
  testWrite(root, '.gitignore', 'coverage\n')
  testWrite(root, 'src/ordinary.ts', "export const value = 'initial'\n")
  testWrite(root, '.ai/manifests/skills-lock.json', '{"version":"initial"}\n')
  testRunGit(root, env, [
    'add',
    '--',
    '.gitignore',
    'src/ordinary.ts',
    '.ai/manifests/skills-lock.json',
  ])
  testRunGit(root, env, ['-c', 'commit.gpgsign=false', 'commit', '--quiet', '-m', 'initial'])
  return { ownedRoot, root, env }
}

function stageIgnoredFile(root, env, relPath) {
  const blob = testRunGit(root, env, ['hash-object', '-w', '--', relPath])
  testRunGit(root, env, ['update-index', '--add', '--cacheinfo', '100644', blob, relPath])
}

function prepareIntegrationCandidate() {
  const fixture = createTestRepository()
  const { root, env } = fixture
  testWrite(root, 'src/ordinary.ts', "export const value = 'staged'\n")
  testWrite(root, '.ai/manifests/skills-lock.json', '{"version":"staged"}\n')
  testWrite(root, '.ai/governance/ui/fixtures/source-invalid/PARSER-CSS-ERROR.css', '.broken {\n')
  testWrite(root, '.ai/governance/ui/fixtures/source-invalid/PARSER-SCSS-ERROR.scss', '.broken {\n')
  testWrite(root, '.ai/governance/coverage/byte-authority.json', '{"bytes":"exact"}\n')
  testRunGit(root, env, [
    'add',
    '--',
    'src/ordinary.ts',
    '.ai/manifests/skills-lock.json',
    '.ai/governance/ui/fixtures/source-invalid/PARSER-CSS-ERROR.css',
    '.ai/governance/ui/fixtures/source-invalid/PARSER-SCSS-ERROR.scss',
  ])
  stageIgnoredFile(root, env, '.ai/governance/coverage/byte-authority.json')
  return fixture
}

function readIndexEntries(root, env) {
  const output = testRunGit(root, env, ['ls-files', '--stage', '-z'])
  const entries = new Map()
  for (const record of output.split('\0').filter(Boolean)) {
    const match = /^(\d+) ([0-9a-f]+) (\d+)\t(.*)$/u.exec(record)
    if (!match) throw new Error(`Invalid index record: ${record}`)
    entries.set(match[4], `${match[1]} ${match[2]} ${match[3]}`)
  }
  return entries
}

function readWorktreeState(root, relPaths) {
  return new Map(
    relPaths.map(relPath => {
      const absolute = path.join(root, relPath)
      const bytes = fs.readFileSync(absolute)
      const mode = fs.statSync(absolute).mode & 0o777
      return [
        relPath,
        {
          sha256: createHash('sha256').update(bytes).digest('hex'),
          mode,
        },
      ]
    })
  )
}

function testStagedPaths(root, env) {
  const output = testRunGit(root, env, [
    'diff',
    '--cached',
    '--name-only',
    '--diff-filter=ACMR',
    '-z',
  ])
  return output.split('\0').filter(Boolean).sort()
}

function assertMapEntriesEqual(actual, expected, paths) {
  for (const relPath of paths) assert.equal(actual.get(relPath), expected.get(relPath), relPath)
}

function assertWorktreeStatesEqual(actual, expected, paths) {
  for (const relPath of paths) assert.deepEqual(actual.get(relPath), expected.get(relPath), relPath)
}

function runSelfTests() {
  const records = []
  const check = (id, operation) => {
    try {
      operation()
      records.push({ id, status: 'pass' })
    } catch (error) {
      records.push({
        id,
        status: 'fail',
        message: error instanceof Error ? error.message : String(error),
      })
    }
  }

  check('classifier-ordinary-product-files-eligible', () => {
    for (const extension of ['ts', 'vue', 'css', 'scss', 'json', 'md'])
      assert.equal(isProtectedPath(`apps/web-demo/src/example.${extension}`), false)
  })
  check('classifier-source-valid-all-governed-extensions-protected', () => {
    for (const extension of ['vue', 'ts', 'tsx', 'css', 'scss'])
      assert.equal(
        isProtectedPath(`.ai/governance/ui/fixtures/source-valid/fixture.${extension}`),
        true
      )
  })
  check('classifier-source-invalid-all-governed-extensions-protected', () => {
    for (const extension of ['vue', 'ts', 'tsx', 'css', 'scss'])
      assert.equal(
        isProtectedPath(`.ai/governance/ui/fixtures/source-invalid/fixture.${extension}`),
        true
      )
  })
  check('classifier-governance-json-protected', () => {
    assert.equal(isProtectedPath('.ai/governance/coverage/example.json'), true)
    assert.equal(isProtectedPath('.ai/governance/coverage/example.md'), false)
  })
  check('classifier-skills-lock-protected', () => {
    assert.equal(isProtectedPath('.ai/manifests/skills-lock.json'), true)
    assert.equal(isProtectedPath('.ai/manifests/other.json'), false)
  })

  const successFixture = prepareIntegrationCandidate()
  let successResult
  let successError
  let successTemporaryDirectory
  let successSeenStaged = []
  const successBeforeIndex = readIndexEntries(successFixture.root, successFixture.env)
  const successProtected = [
    '.ai/governance/coverage/byte-authority.json',
    '.ai/governance/ui/fixtures/source-invalid/PARSER-CSS-ERROR.css',
    '.ai/governance/ui/fixtures/source-invalid/PARSER-SCSS-ERROR.scss',
    '.ai/manifests/skills-lock.json',
  ]
  const successBeforeWorktree = readWorktreeState(successFixture.root, successProtected)
  try {
    successResult = executeSafeLintStaged({
      root: successFixture.root,
      env: successFixture.env,
      onTemporaryDirectory: directory => {
        successTemporaryDirectory = directory
      },
      lintStagedRunner: ({ root, env }) => {
        successSeenStaged = testStagedPaths(root, env)
        testWrite(root, 'src/ordinary.ts', "export const value = 'fixed'\n")
        testRunGit(root, env, ['add', '--', 'src/ordinary.ts'])
        return { status: 0, stdout: '', stderr: '' }
      },
    })
  } catch (error) {
    successError = error
  }
  const successAfterIndex = readIndexEntries(successFixture.root, successFixture.env)
  const successAfterWorktree = readWorktreeState(successFixture.root, successProtected)

  check('temporary-staged-set-keeps-ordinary-source-eligible', () => {
    if (successError) throw successError
    assert.deepEqual(successSeenStaged, ['src/ordinary.ts'])
    assert.deepEqual(successResult.eligiblePaths, ['src/ordinary.ts'])
  })
  check('temporary-staged-set-excludes-invalid-css', () => {
    if (successError) throw successError
    assert.equal(
      successSeenStaged.includes('.ai/governance/ui/fixtures/source-invalid/PARSER-CSS-ERROR.css'),
      false
    )
  })
  check('temporary-staged-set-excludes-invalid-scss', () => {
    if (successError) throw successError
    assert.equal(
      successSeenStaged.includes(
        '.ai/governance/ui/fixtures/source-invalid/PARSER-SCSS-ERROR.scss'
      ),
      false
    )
  })
  check('temporary-staged-set-excludes-byte-authoritative-json', () => {
    if (successError) throw successError
    assert.equal(successSeenStaged.includes('.ai/governance/coverage/byte-authority.json'), false)
  })
  check('ignored-protected-json-never-reaches-auto-add', () => {
    if (successError) throw successError
    assert.equal(
      testRunGit(successFixture.root, successFixture.env, [
        'check-ignore',
        '--no-index',
        '.ai/governance/coverage/byte-authority.json',
      ]),
      '.ai/governance/coverage/byte-authority.json'
    )
    assert.equal(successSeenStaged.includes('.ai/governance/coverage/byte-authority.json'), false)
  })
  check('successful-run-propagates-eligible-entry', () => {
    if (successError) throw successError
    assert.equal(successResult.status, 0)
    assert.notEqual(
      successAfterIndex.get('src/ordinary.ts'),
      successBeforeIndex.get('src/ordinary.ts')
    )
    assert.equal(
      fs.readFileSync(path.join(successFixture.root, 'src/ordinary.ts'), 'utf8'),
      "export const value = 'fixed'\n"
    )
  })
  check('successful-run-preserves-protected-index-entries', () => {
    assertMapEntriesEqual(successAfterIndex, successBeforeIndex, successProtected)
  })
  check('successful-run-preserves-protected-worktree-bytes-and-modes', () => {
    assertWorktreeStatesEqual(successAfterWorktree, successBeforeWorktree, successProtected)
  })
  check('successful-run-removes-temporary-index-directory', () => {
    assert.ok(successTemporaryDirectory)
    assert.equal(fs.existsSync(successTemporaryDirectory), false)
  })
  fs.rmSync(successFixture.ownedRoot, { recursive: true, force: true })

  const failureFixture = prepareIntegrationCandidate()
  let failureResult
  let failureError
  let failureTemporaryDirectory
  const failureBeforeTree = testRunGit(failureFixture.root, failureFixture.env, ['write-tree'])
  try {
    failureResult = executeSafeLintStaged({
      root: failureFixture.root,
      env: failureFixture.env,
      onTemporaryDirectory: directory => {
        failureTemporaryDirectory = directory
      },
      lintStagedRunner: ({ root, env }) => {
        testWrite(root, 'src/ordinary.ts', "export const value = 'failed-fix'\n")
        testRunGit(root, env, ['add', '--', 'src/ordinary.ts'])
        return { status: 9, stdout: '', stderr: 'intentional failure' }
      },
    })
  } catch (error) {
    failureError = error
  }
  check('failed-run-leaves-entire-real-index-unchanged', () => {
    if (failureError) throw failureError
    assert.equal(failureResult.status, 9)
    assert.equal(
      testRunGit(failureFixture.root, failureFixture.env, ['write-tree']),
      failureBeforeTree
    )
  })
  check('failed-run-keeps-eligible-worktree-fix-for-inspection', () => {
    assert.equal(
      fs.readFileSync(path.join(failureFixture.root, 'src/ordinary.ts'), 'utf8'),
      "export const value = 'failed-fix'\n"
    )
  })
  check('failed-run-removes-temporary-index-directory', () => {
    assert.ok(failureTemporaryDirectory)
    assert.equal(fs.existsSync(failureTemporaryDirectory), false)
  })
  fs.rmSync(failureFixture.ownedRoot, { recursive: true, force: true })

  const partialFixture = createTestRepository()
  let partialRunnerCalled = false
  testWrite(partialFixture.root, 'src/ordinary.ts', "export const value = 'staged'\n")
  testRunGit(partialFixture.root, partialFixture.env, ['add', '--', 'src/ordinary.ts'])
  testWrite(partialFixture.root, 'src/ordinary.ts', "export const value = 'unstaged'\n")
  check('partial-stage-rejection-remains-before-lint-staged', () => {
    assert.throws(
      () =>
        executeSafeLintStaged({
          root: partialFixture.root,
          env: partialFixture.env,
          lintStagedRunner: () => {
            partialRunnerCalled = true
            return { status: 0, stdout: '', stderr: '' }
          },
        }),
      error => error?.code === 'PARTIALLY_STAGED'
    )
    assert.equal(partialRunnerCalled, false)
  })
  fs.rmSync(partialFixture.ownedRoot, { recursive: true, force: true })

  const generatedFixture = createTestRepository()
  let generatedRunnerCalled = false
  testWrite(
    generatedFixture.root,
    'apps/web-demo/.eslintrc-auto-import.json',
    '{"generated":true}\n'
  )
  testRunGit(generatedFixture.root, generatedFixture.env, [
    'add',
    '--',
    'apps/web-demo/.eslintrc-auto-import.json',
  ])
  check('local-only-generated-rejection-remains-before-lint-staged', () => {
    assert.throws(
      () =>
        executeSafeLintStaged({
          root: generatedFixture.root,
          env: generatedFixture.env,
          lintStagedRunner: () => {
            generatedRunnerCalled = true
            return { status: 0, stdout: '', stderr: '' }
          },
        }),
      error => error?.code === 'LOCAL_ONLY_GENERATED'
    )
    assert.equal(generatedRunnerCalled, false)
  })
  fs.rmSync(generatedFixture.ownedRoot, { recursive: true, force: true })

  const failed = records.filter(record => record.status === 'fail')
  if (failed.length > 0) {
    for (const record of failed) console.error(`FAIL ${record.id}: ${record.message}`)
    console.error(
      `lint-staged-safe self-test: ${records.length - failed.length}/${records.length} passed`
    )
    process.exitCode = 1
    return
  }
  console.log(`lint-staged-safe self-test: ${records.length}/${records.length} passed`)
}

if (process.argv.length === 3 && process.argv[2] === '--self-test') {
  runSelfTests()
} else {
  console.log('Running Enterprise Guardian: lint-staged --no-stash...')
  try {
    const result = executeSafeLintStaged({ lintStagedRunner: runRealLintStaged })
    if (result.status !== 0) {
      console.error(
        'lint-staged failed. No automatic stash or rollback was performed. Your working tree was left unchanged except for tool fixes already applied by lint-staged --no-stash.'
      )
    }
    process.exitCode = result.status
  } catch (error) {
    if (error instanceof LintStagedSafeError && error.lines.length > 0) {
      for (const line of error.lines) console.error(line)
    } else {
      const code = error instanceof LintStagedSafeError ? error.code : 'UNEXPECTED_FAILURE'
      const message = error instanceof Error ? error.message : String(error)
      console.error(`[${code}] ${message}`)
    }
    process.exitCode = error instanceof LintStagedSafeError ? error.exitCode : 1
  }
}
