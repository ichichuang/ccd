#!/usr/bin/env node

import { existsSync, readdirSync, rmSync } from 'node:fs'
import { dirname, isAbsolute, join, relative, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(SCRIPT_DIR, '..')

function isInsideRoot(root, target) {
  const relativePath = relative(root, target)
  return relativePath === '' || (!relativePath.startsWith('..') && !isAbsolute(relativePath))
}

function assertSafeTarget(root, target) {
  const resolvedRoot = resolve(root)
  const resolvedTarget = resolve(target)
  if (resolvedTarget === resolvedRoot) {
    throw new Error(`Refusing to remove repository root: ${resolvedTarget}`)
  }
  if (!isInsideRoot(resolvedRoot, resolvedTarget)) {
    throw new Error(`Refusing to remove path outside repository root: ${resolvedTarget}`)
  }
  return resolvedTarget
}

function workspaceDirs(root, scope) {
  const scopePath = join(root, scope)
  if (!existsSync(scopePath)) return []
  return readdirSync(scopePath, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => join(scopePath, entry.name))
}

export function cleanPaths(paths, options = {}) {
  const root = resolve(options.root ?? REPO_ROOT)
  const cwd = resolve(options.cwd ?? process.cwd())
  for (const artifactPath of paths) {
    const target = assertSafeTarget(root, resolve(cwd, artifactPath))
    rmSync(target, { recursive: true, force: true })
  }
}

export function collectWorkspaceBuildArtifacts(root = REPO_ROOT) {
  const resolvedRoot = resolve(root)
  return [
    ...workspaceDirs(resolvedRoot, 'packages').map(packageDir => join(packageDir, 'dist')),
    ...workspaceDirs(resolvedRoot, 'apps').map(appDir => join(appDir, 'dist')),
    join(resolvedRoot, 'node_modules/.tmp'),
  ]
}

export function cleanWorkspaceBuildArtifacts(root = REPO_ROOT) {
  cleanPaths(collectWorkspaceBuildArtifacts(root), { root, cwd: root })
}

function printUsage() {
  console.error(`Usage:
  node scripts/clean-artifacts.mjs paths <path>...
  node scripts/clean-artifacts.mjs workspace-build`)
}

function main(argv) {
  const [command, ...args] = argv
  if (command === 'paths') {
    if (args.length === 0) {
      printUsage()
      return 64
    }
    cleanPaths(args)
    return 0
  }

  if (command === 'workspace-build') {
    cleanWorkspaceBuildArtifacts()
    return 0
  }

  printUsage()
  return 64
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    process.exitCode = main(process.argv.slice(2))
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  }
}
