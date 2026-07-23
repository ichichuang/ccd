#!/usr/bin/env node

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'

let temporaryFileSequence = 0

function parseArgs(argv) {
  const options = { check: false, clients: [], targetRoot: null }
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index]
    if (value === '--check') options.check = true
    else if (value === '--client') {
      const client = argv[++index]
      if (!client) throw new Error('--client requires a value')
      options.clients.push(client)
    } else if (value === '--target-root') {
      const targetRoot = argv[++index]
      if (!targetRoot) throw new Error('--target-root requires a value')
      options.targetRoot = path.resolve(targetRoot)
    } else if (value !== '--') throw new Error(`Unknown argument: ${value}`)
  }
  if (options.clients.length === 0) options.clients = ['codex', 'claude']
  if (options.clients.some(client => !['codex', 'claude'].includes(client))) {
    throw new Error('Client must be codex or claude')
  }
  if (new Set(options.clients).size !== options.clients.length) {
    throw new Error('Each client may be selected only once')
  }
  return options
}

function isContained(root, candidate, allowEqual = false) {
  const relativePath = path.relative(root, candidate)
  if (relativePath === '') return allowEqual
  return relativePath !== '..' && !relativePath.startsWith(`..${path.sep}`) && !path.isAbsolute(relativePath)
}

function assertContained(root, candidate, label, allowEqual = false) {
  if (!isContained(root, candidate, allowEqual)) {
    throw new Error(`${label} escapes approved root: ${candidate}`)
  }
}

function assertNoSymlinkSegments(candidate, label) {
  const resolved = path.resolve(candidate)
  const { root } = path.parse(resolved)
  let current = root
  const segments = resolved.slice(root.length).split(path.sep).filter(Boolean)
  for (const [index, segment] of segments.entries()) {
    current = path.join(current, segment)
    if (!fs.existsSync(current)) break
    const currentStat = fs.lstatSync(current)
    if (currentStat.isSymbolicLink()) {
      throw new Error(`${label} contains a symlink: ${current}`)
    }
    if (index < segments.length - 1 && !currentStat.isDirectory()) {
      throw new Error(`${label} contains a non-directory path segment: ${current}`)
    }
  }
}

function existingAncestor(candidate) {
  let current = path.resolve(candidate)
  while (!fs.existsSync(current)) {
    const parent = path.dirname(current)
    if (parent === current) throw new Error(`No existing ancestor for path: ${candidate}`)
    current = parent
  }
  return current
}

function validateProjectedRealpath(candidate, label) {
  const ancestor = existingAncestor(candidate)
  assertNoSymlinkSegments(ancestor, label)
  const ancestorRealpath = fs.realpathSync(ancestor)
  const projected = path.resolve(ancestorRealpath, path.relative(ancestor, candidate))
  if (!isContained(ancestorRealpath, projected, true)) {
    throw new Error(`${label} has invalid realpath projection: ${candidate}`)
  }
}

function collectFiles(directory, base = directory) {
  const files = new Map()
  if (!fs.existsSync(directory)) return files
  const directoryStat = fs.lstatSync(directory)
  if (directoryStat.isSymbolicLink() || !directoryStat.isDirectory()) {
    throw new Error(`Expected a real directory: ${directory}`)
  }

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name)
    if (entry.isSymbolicLink()) throw new Error(`Skill mirror rejects symlinks: ${absolutePath}`)
    if (entry.isDirectory()) {
      for (const [relativePath, filePath] of collectFiles(absolutePath, base)) {
        files.set(relativePath, filePath)
      }
    } else if (entry.isFile()) {
      files.set(path.relative(base, absolutePath), absolutePath)
    } else {
      throw new Error(`Skill mirror rejects non-file entries: ${absolutePath}`)
    }
  }
  return files
}

function classifyDrift(sourceFiles, targetFiles) {
  const missing = [...sourceFiles.keys()].filter(relativePath => !targetFiles.has(relativePath))
  const extra = [...targetFiles.keys()].filter(relativePath => !sourceFiles.has(relativePath))
  const changed = [...sourceFiles.keys()].filter(relativePath => {
    const targetFile = targetFiles.get(relativePath)
    return targetFile && !fs.readFileSync(sourceFiles.get(relativePath)).equals(fs.readFileSync(targetFile))
  })
  return {
    missing: missing.sort(),
    changed: changed.sort(),
    extra: extra.sort(),
  }
}

function hasDrift(state) {
  return state.missing.length > 0 || state.changed.length > 0 || state.extra.length > 0
}

function printState(client, state, status) {
  console.log(
    `${client}: ${status} (missing=${state.missing.length}, changed=${state.changed.length}, extra=${state.extra.length})`
  )
  for (const category of ['missing', 'changed', 'extra']) {
    if (state[category].length > 0) {
      console.log(`  ${category}: ${state[category].join(', ')}`)
    }
  }
}

function clientRootFor(client, override, repositoryRoot) {
  if (override) {
    if (fs.existsSync(override) && fs.lstatSync(override).isSymbolicLink()) {
      throw new Error(`Target root must not be a symlink: ${override}`)
    }
    const targetRoot = fs.existsSync(override) ? fs.realpathSync(override) : override
    return path.join(targetRoot, client)
  }
  if (client === 'codex') return path.join(os.homedir(), '.codex', 'skills')
  return path.join(repositoryRoot, '.claude', 'skills')
}

function validateTarget(client, override, repositoryRoot, source) {
  const approvedRoot = path.resolve(clientRootFor(client, override, repositoryRoot))
  const target = path.join(approvedRoot, 'project-ui')
  if (path.basename(target) !== 'project-ui') {
    throw new Error(`Target basename must be project-ui: ${target}`)
  }
  assertContained(approvedRoot, target, `${client} target`)
  assertNoSymlinkSegments(approvedRoot, `${client} root`)
  assertNoSymlinkSegments(target, `${client} target`)
  validateProjectedRealpath(approvedRoot, `${client} root`)
  validateProjectedRealpath(target, `${client} target`)

  if (isContained(source, target, true) || isContained(target, source, true)) {
    throw new Error(`${client} target overlaps canonical source: ${target}`)
  }
  if (fs.existsSync(approvedRoot)) {
    if (!fs.lstatSync(approvedRoot).isDirectory()) {
      throw new Error(`${client} approved root is not a directory: ${approvedRoot}`)
    }
    const approvedRootRealpath = fs.realpathSync(approvedRoot)
    if (fs.existsSync(target)) {
      if (!fs.lstatSync(target).isDirectory()) {
        throw new Error(`${client} target is not a directory: ${target}`)
      }
      const targetRealpath = fs.realpathSync(target)
      assertContained(approvedRootRealpath, targetRealpath, `${client} target realpath`)
    }
  }
  return { approvedRoot, target }
}

function removeEmptyParents(target, deletedFiles) {
  const candidates = new Set()
  for (const deletedFile of deletedFiles) {
    let directory = path.dirname(deletedFile)
    while (isContained(target, directory)) {
      candidates.add(directory)
      directory = path.dirname(directory)
    }
  }
  for (const directory of [...candidates].sort((left, right) => right.length - left.length)) {
    assertContained(target, directory, 'empty directory cleanup')
    if (fs.existsSync(directory) && fs.readdirSync(directory).length === 0) fs.rmdirSync(directory)
  }
}

function copyFileAtomically(sourceFile, targetFile, target) {
  const targetParent = path.dirname(targetFile)
  assertContained(target, targetFile, 'skill file copy')
  assertNoSymlinkSegments(targetParent, 'skill file target parent')

  let temporaryFile = null
  for (let attempt = 0; attempt < 100; attempt += 1) {
    temporaryFileSequence += 1
    const candidate = path.join(
      targetParent,
      `.project-ui-sync-${process.pid}-${temporaryFileSequence}-${path.basename(targetFile)}`
    )
    assertContained(target, candidate, 'temporary skill file')
    try {
      const descriptor = fs.openSync(candidate, 'wx', 0o600)
      fs.closeSync(descriptor)
      temporaryFile = candidate
      break
    } catch (error) {
      if (error.code !== 'EEXIST') throw error
    }
  }
  if (!temporaryFile) throw new Error(`Unable to create temporary sibling for: ${targetFile}`)

  try {
    fs.copyFileSync(sourceFile, temporaryFile)
    fs.renameSync(temporaryFile, targetFile)
    temporaryFile = null
  } finally {
    if (temporaryFile && fs.existsSync(temporaryFile)) fs.unlinkSync(temporaryFile)
  }
}

function synchronize(sourceFiles, target, state) {
  const deletedFiles = []
  for (const relativePath of state.extra) {
    const targetFile = path.resolve(target, relativePath)
    assertContained(target, targetFile, 'extra file deletion')
    const targetStat = fs.lstatSync(targetFile)
    if (targetStat.isSymbolicLink() || !targetStat.isFile()) {
      throw new Error(`Refusing to delete non-file target entry: ${targetFile}`)
    }
    fs.unlinkSync(targetFile)
    deletedFiles.push(targetFile)
  }
  removeEmptyParents(target, deletedFiles)

  for (const relativePath of [...state.missing, ...state.changed]) {
    const sourceFile = sourceFiles.get(relativePath)
    const targetFile = path.resolve(target, relativePath)
    fs.mkdirSync(path.dirname(targetFile), { recursive: true })
    copyFileAtomically(sourceFile, targetFile, target)
  }
}

const options = parseArgs(process.argv.slice(2))
const repositoryRoot = fs.realpathSync(process.cwd())
const source = path.join(repositoryRoot, '.ai', 'skills', 'project-ui')
assertNoSymlinkSegments(source, 'canonical project-ui source')
const sourceRealpath = fs.realpathSync(source)
assertContained(repositoryRoot, sourceRealpath, 'canonical project-ui source realpath')
const sourceFiles = collectFiles(sourceRealpath)
let anyClientHasDrift = false

for (const client of options.clients) {
  const { approvedRoot, target } = validateTarget(
    client,
    options.targetRoot,
    repositoryRoot,
    sourceRealpath
  )
  const initialState = classifyDrift(sourceFiles, collectFiles(target))
  const clientHasDrift = hasDrift(initialState)
  anyClientHasDrift ||= clientHasDrift

  if (options.check) {
    printState(client, initialState, clientHasDrift ? 'out of date' : 'current')
    continue
  }

  fs.mkdirSync(approvedRoot, { recursive: true })
  fs.mkdirSync(target, { recursive: true })
  assertNoSymlinkSegments(target, `${client} target`)
  assertContained(fs.realpathSync(approvedRoot), fs.realpathSync(target), `${client} target realpath`)
  synchronize(sourceFiles, target, initialState)

  const finalState = classifyDrift(sourceFiles, collectFiles(target))
  if (hasDrift(finalState)) {
    throw new Error(`${client} project-ui mirror still has drift after synchronization`)
  }
  printState(client, initialState, clientHasDrift ? 'synchronized' : 'current')
}

if (options.check && anyClientHasDrift) process.exit(1)
