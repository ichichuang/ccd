import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { compareAscii, deepFreeze, fail, normalizePosixPath } from './contracts.mjs'
import { assertScopedPath, classifyPath } from './scope.mjs'

function git(repoRoot, args, options = {}) {
  const result = spawnSync('git', args, {
    cwd: repoRoot,
    encoding: options.encoding ?? 'utf8',
    input: options.input,
    maxBuffer: 128 * 1024 * 1024,
    env: {
      ...process.env,
      HOME: process.env.CCD_UI_SCANNER_HOME ?? path.join(os.tmpdir(), 'ccd-ui-source-no-home'),
      GIT_CONFIG_NOSYSTEM: '1',
      GIT_TERMINAL_PROMPT: '0',
    },
  })
  if (result.error || result.status !== 0) fail(options.reason ?? 'GIT_COMMAND', `git ${args[0]} failed: ${(result.stderr || result.error?.message || '').toString().trim()}`)
  return result.stdout
}

export function resolveRepository(repoRoot) {
  const resolved = fs.realpathSync(repoRoot)
  const top = git(resolved, ['rev-parse', '--show-toplevel']).trim()
  if (fs.realpathSync(top) !== resolved) fail('GIT_NOT_REPOSITORY', `repository root mismatch: ${top}`)
  return resolved
}

function contentDigest(content) {
  return `sha256:${crypto.createHash('sha256').update(content).digest('hex')}`
}

function parseIndex(repoRoot) {
  const output = git(repoRoot, ['ls-files', '-s', '-z'])
  const records = new Map()
  for (const record of output.split('\0').filter(Boolean)) {
    const match = record.match(/^(\d+) ([0-9a-f]{40,64}) (\d)\t(.+)$/u)
    if (!match) fail('GIT_COMMAND', `invalid index record: ${record}`)
    const [, mode, oid, stage, filePath] = match
    if (stage !== '0') fail('GIT_UNMERGED_INDEX', `unmerged index path: ${filePath}`)
    records.set(filePath, { mode, oid })
  }
  return records
}

function parseTree(repoRoot, ref) {
  const output = git(repoRoot, ['ls-tree', '-rz', '--full-tree', ref])
  const records = new Map()
  for (const record of output.split('\0').filter(Boolean)) {
    const match = record.match(/^(\d+) (\w+) ([0-9a-f]{40,64})\t(.+)$/u)
    if (!match) fail('GIT_COMMAND', `invalid tree record at ${ref}`)
    const [, mode, type, oid, filePath] = match
    records.set(filePath, { mode, type, oid })
  }
  return records
}

function parseChangedPaths(repoRoot, args) {
  const tokens = git(repoRoot, ['diff', '--name-status', '-z', '--diff-filter=ACMR', ...args]).split('\0').filter(Boolean)
  const paths = []
  for (let index = 0; index < tokens.length; ) {
    const status = tokens[index++]
    if (/^[RC]/u.test(status)) {
      index += 1
      paths.push(tokens[index++])
    } else {
      paths.push(tokens[index++])
    }
  }
  return paths
}

export function readBlobBatch(repoRoot, oids) {
  const unique = [...new Set(oids)]
  if (unique.length === 0) return new Map()
  const output = git(repoRoot, ['cat-file', '--batch'], { input: `${unique.join('\n')}\n`, encoding: null })
  const buffer = Buffer.isBuffer(output) ? output : Buffer.from(output)
  const result = new Map()
  let cursor = 0
  for (const requested of unique) {
    const headerEnd = buffer.indexOf(10, cursor)
    if (headerEnd < 0) fail('GIT_COMMAND', 'truncated git cat-file header')
    const header = buffer.subarray(cursor, headerEnd).toString('utf8')
    const match = header.match(/^([0-9a-f]{40,64}) blob (\d+)$/u)
    if (!match) fail('GIT_OBJECT_MISSING', `missing or non-blob Git object ${requested}`)
    const size = Number(match[2])
    const start = headerEnd + 1
    const end = start + size
    result.set(requested, Buffer.from(buffer.subarray(start, end)))
    cursor = end + 1
  }
  return result
}

function assertRegularWorkingPath(repoRoot, relativePath) {
  const segments = normalizePosixPath(relativePath).split('/')
  let current = repoRoot
  for (const segment of segments) {
    current = path.join(current, segment)
    const stat = fs.lstatSync(current)
    if (stat.isSymbolicLink()) fail('PATH_SYMLINK', `symlink path is forbidden: ${relativePath}`)
  }
  const stat = fs.lstatSync(current)
  if (!stat.isFile()) fail('SOURCE_NOT_REGULAR', `source must be a regular file: ${relativePath}`)
  return current
}

export function assertShallowSafety(repoRoot, mode) {
  const shallow = git(repoRoot, ['rev-parse', '--is-shallow-repository']).trim() === 'true'
  if (!shallow) return false
  if (['default', 'all', 'paths'].includes(mode)) {
    const dirty = git(repoRoot, ['status', '--porcelain', '--untracked-files=all']).trim()
    if (dirty) fail('GIT_DIRTY_SHALLOW', 'dirty shallow working tree is not authoritative')
  }
  return true
}

function sourceRecord(relativePath, scopeId, mode, content, oid = null) {
  const extension = relativePath.split('.').at(-1)
  return deepFreeze({ path: relativePath, scopeId, language: extension, sourceMode: mode, blobId: oid ?? contentDigest(content), contentDigest: contentDigest(content), content: content.toString('utf8') })
}

function governed(registry, relativePath) {
  const result = classifyPath(registry, relativePath)
  return !result.excluded && result.matches.length > 0
}

function fromWorkingTree(repoRoot, registry, explicitPaths = null) {
  const index = parseIndex(repoRoot)
  const paths = explicitPaths ?? [...index.keys(), ...git(repoRoot, ['ls-files', '--others', '--exclude-standard', '-z']).split('\0').filter(Boolean)]
  const records = []
  for (const candidate of [...new Set(paths)].sort(compareAscii)) {
    const scoped = explicitPaths ? assertScopedPath(registry, candidate) : governed(registry, candidate) ? assertScopedPath(registry, candidate) : null
    if (!scoped) continue
    let safePath
    try {
      safePath = assertRegularWorkingPath(repoRoot, scoped.path)
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error
      if (explicitPaths) fail('SOURCE_NOT_REGULAR', `explicit source does not exist: ${scoped.path}`)
      continue
    }
    records.push(sourceRecord(scoped.path, scoped.scopeId, explicitPaths ? 'paths' : 'default', fs.readFileSync(safePath), index.get(scoped.path)?.oid ?? null))
  }
  return records
}

function fromObjects(repoRoot, registry, entries, selectedPaths, mode) {
  const selected = []
  for (const relativePath of [...selectedPaths].sort(compareAscii)) {
    if (!governed(registry, relativePath)) continue
    const scoped = assertScopedPath(registry, relativePath)
    const entry = entries.get(relativePath)
    if (!entry) continue
    if (entry.mode === '120000' || entry.type && entry.type !== 'blob') fail('PATH_SYMLINK', `nonregular Git source is forbidden: ${relativePath}`)
    selected.push({ ...entry, ...scoped })
  }
  const blobs = readBlobBatch(repoRoot, selected.map(entry => entry.oid))
  return selected.map(entry => sourceRecord(entry.path, entry.scopeId, mode, blobs.get(entry.oid), entry.oid))
}

export function acquireSourceSnapshot({ repoRoot, mode = 'default', ref = null, base = null, head = null, paths = null, scopeRegistry }) {
  const root = resolveRepository(repoRoot)
  assertShallowSafety(root, mode)
  let files
  let commit
  if (mode === 'default' || mode === 'all') {
    files = fromWorkingTree(root, scopeRegistry)
    commit = git(root, ['rev-parse', 'HEAD']).trim()
  } else if (mode === 'paths') {
    if (!Array.isArray(paths) || paths.length === 0) fail('GIT_MODE_INVALID', '--paths requires at least one path')
    files = fromWorkingTree(root, scopeRegistry, paths.map(normalizePosixPath))
    commit = git(root, ['rev-parse', 'HEAD']).trim()
  } else if (mode === 'staged') {
    const index = parseIndex(root)
    const selectedPaths = parseChangedPaths(root, ['--cached'])
    files = fromObjects(root, scopeRegistry, index, selectedPaths, mode)
    commit = git(root, ['rev-parse', 'HEAD']).trim()
  } else if (mode === 'ref') {
    if (!ref) fail('GIT_MODE_INVALID', '--ref requires a commit')
    try { commit = git(root, ['rev-parse', '--verify', `${ref}^{commit}`]).trim() } catch { fail('GIT_OBJECT_MISSING', `Git commit is unavailable: ${ref}`) }
    const tree = parseTree(root, commit)
    files = fromObjects(root, scopeRegistry, tree, tree.keys(), mode)
  } else if (mode === 'range') {
    if (!base || !head) fail('GIT_MODE_INVALID', '--base and --head must appear together')
    try {
      git(root, ['cat-file', '-e', `${base}^{commit}`])
      commit = git(root, ['rev-parse', '--verify', `${head}^{commit}`]).trim()
    } catch { fail('GIT_OBJECT_MISSING', `range object is unavailable: ${base}..${head}`) }
    const tree = parseTree(root, commit)
    const selectedPaths = parseChangedPaths(root, [base, commit])
    files = fromObjects(root, scopeRegistry, tree, selectedPaths, mode)
  } else {
    fail('GIT_MODE_INVALID', `unsupported source mode: ${mode}`)
  }
  return deepFreeze({ mode, repository: 'ichichuang/ccd', commit, files: files.sort((a, b) => compareAscii(a.path, b.path)) })
}
