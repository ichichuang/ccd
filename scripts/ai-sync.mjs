import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const cwd = process.cwd()
const localRuntimeFiles = [
  {
    source: '.ai/runtime/repair_list.template.md',
    target: '.ai/runtime/repair_list.md',
  },
]
const preservedRoots = ['.ai/runtime', '.cursor', '.claude']

const sha256 = value => crypto.createHash('sha256').update(value).digest('hex')
const ensureParentDir = relPath =>
  fs.mkdirSync(path.dirname(path.join(cwd, relPath)), { recursive: true })

const describePath = relPath => {
  const absolute = path.join(cwd, relPath)
  const stat = fs.lstatSync(absolute)
  const mode = stat.mode & 0o777
  if (stat.isSymbolicLink()) {
    return { type: 'symlink', mode, digest: sha256(Buffer.from(fs.readlinkSync(absolute), 'utf8')) }
  }
  if (stat.isDirectory()) return { type: 'directory', mode, digest: null }
  if (stat.isFile()) return { type: 'file', mode, digest: sha256(fs.readFileSync(absolute)) }
  return { type: 'other', mode, digest: null }
}

const listExistingPaths = relRoot => {
  const absoluteRoot = path.join(cwd, relRoot)
  if (!fs.existsSync(absoluteRoot)) return []
  const paths = [relRoot]
  const visit = relDirectory => {
    const absoluteDirectory = path.join(cwd, relDirectory)
    for (const entry of fs
      .readdirSync(absoluteDirectory, { withFileTypes: true })
      .sort((a, b) => a.name.localeCompare(b.name))) {
      const relEntry = path.posix.join(relDirectory, entry.name)
      paths.push(relEntry)
      if (entry.isDirectory() && !entry.isSymbolicLink()) visit(relEntry)
    }
  }
  if (fs.lstatSync(absoluteRoot).isDirectory()) visit(relRoot)
  return paths
}

const snapshotPreservedPaths = () => {
  const snapshot = new Map()
  for (const relRoot of preservedRoots) {
    for (const relPath of listExistingPaths(relRoot)) snapshot.set(relPath, describePath(relPath))
  }
  return snapshot
}

const verifyPreservedPaths = snapshot => {
  for (const [relPath, before] of snapshot) {
    const absolute = path.join(cwd, relPath)
    if (!fs.existsSync(absolute)) {
      console.error(`[FAIL] pre-existing local path was deleted: ${relPath}`)
      process.exit(1)
    }
    const after = describePath(relPath)
    if (JSON.stringify(after) !== JSON.stringify(before)) {
      console.error(`[FAIL] pre-existing local path changed: ${relPath}`)
      process.exit(1)
    }
  }
  console.log(`[OK] preserved ${snapshot.size} pre-existing local runtime path(s)`)
}

const ensureLocalRuntimeFile = ({ source, target }) => {
  const absoluteSource = path.join(cwd, source)
  const absoluteTarget = path.join(cwd, target)
  ensureParentDir(target)
  if (!fs.existsSync(absoluteTarget)) {
    fs.copyFileSync(absoluteSource, absoluteTarget)
    console.log(`[CREATE] ${target} <= ${source}`)
    return
  }
  console.log(`[OK] ${target}`)
}

const runNodeScript = script => {
  const result = spawnSync(process.execPath, [path.join(cwd, script)], {
    cwd,
    encoding: 'utf8',
    stdio: 'pipe',
  })
  if (result.stdout) process.stdout.write(result.stdout)
  if (result.stderr) process.stderr.write(result.stderr)
  if (result.status !== 0) process.exit(result.status ?? 1)
}

console.log('AI adapter sync')
console.log('===============')
const preservedSnapshot = snapshotPreservedPaths()
runNodeScript('scripts/generate-ai-protocol-adapters.mjs')
runNodeScript('scripts/generate-rule-index.mjs')
runNodeScript('scripts/generate-unocss-ide-data.mjs')
for (const runtimeFile of localRuntimeFiles) ensureLocalRuntimeFile(runtimeFile)
verifyPreservedPaths(preservedSnapshot)
