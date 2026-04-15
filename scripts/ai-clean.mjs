import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const cwd = process.cwd()
const home = os.homedir()
const args = new Set(process.argv.slice(2))

const removePath = relOrAbs => {
  const absPath = path.isAbsolute(relOrAbs) ? relOrAbs : path.join(cwd, relOrAbs)
  const stat = fs.lstatSync(absPath, { throwIfNoEntry: false })
  if (!stat) return false
  fs.rmSync(absPath, { recursive: true, force: true })
  console.log(`[REMOVE] ${absPath}`)
  return true
}

const removeEmptyDir = relOrAbs => {
  const absPath = path.isAbsolute(relOrAbs) ? relOrAbs : path.join(cwd, relOrAbs)
  const stat = fs.lstatSync(absPath, { throwIfNoEntry: false })
  if (!stat || !stat.isDirectory()) return false
  if (fs.readdirSync(absPath).length > 0) return false
  fs.rmdirSync(absPath)
  console.log(`[REMOVE] ${absPath}`)
  return true
}

const removeChildrenIf = (rootPath, predicate) => {
  const absRoot = path.isAbsolute(rootPath) ? rootPath : path.join(cwd, rootPath)
  const stat = fs.lstatSync(absRoot, { throwIfNoEntry: false })
  if (!stat || !stat.isDirectory()) return

  for (const entry of fs.readdirSync(absRoot, { withFileTypes: true })) {
    const child = path.join(absRoot, entry.name)
    if (predicate(child, entry)) {
      fs.rmSync(child, { recursive: true, force: true })
      console.log(`[REMOVE] ${child}`)
    }
  }
}

console.log('AI cleanup')
console.log('==========')

removeEmptyDir('.ai/skills/codex/github-ops/.clawhub')
removeEmptyDir('test-photo')
removeEmptyDir('node_modules/.vite-temp')

removeChildrenIf('artifacts/browser', child => {
  const name = path.basename(child)
  if (name === 'flows') return false
  return fs.lstatSync(child).isDirectory() && fs.readdirSync(child).length === 0
})
removeEmptyDir('artifacts/browser')
removeEmptyDir('artifacts')

removeChildrenIf(path.join(home, '.codex', 'tmp', 'architecture-browser-master'), child => {
  return fs.lstatSync(child).isDirectory() && fs.readdirSync(child).length === 0
})

if (args.has('--browser-artifacts') || args.has('--all')) {
  removeChildrenIf('artifacts/browser', child => path.basename(child) !== 'flows')
  removeEmptyDir('artifacts/browser')
  removeEmptyDir('artifacts')
}

if (args.has('--tmp') || args.has('--all')) {
  removePath('tmp')
}

if (args.has('--codex-tmp') || args.has('--all')) {
  removePath(path.join(home, '.codex', 'tmp', 'architecture-browser-master'))
}
