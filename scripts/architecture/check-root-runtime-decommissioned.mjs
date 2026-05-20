#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const root = process.cwd()
const allowed = new Set(['NOTICE.md'])
const srcDir = path.join(root, 'src')

function fail(message) {
  console.error(`[root-runtime] ${message}`)
  process.exitCode = 1
}

if (fs.existsSync(srcDir)) {
  const entries = fs.readdirSync(srcDir).filter(name => !allowed.has(name))
  if (entries.length > 0) {
    fail(`root /src must be orchestration-only/deprecated; unexpected runtime entries: ${entries.join(', ')}`)
  }
}

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
const scripts = pkg.scripts ?? {}
for (const [name, command] of Object.entries(scripts)) {
  if (String(command).includes('build:root')) {
    fail(`package script "${name}" still references build:root`)
  }
}

const workflowDir = path.join(root, '.github', 'workflows')
if (fs.existsSync(workflowDir)) {
  for (const file of fs.readdirSync(workflowDir)) {
    if (!/\.ya?ml$/.test(file)) continue
    const content = fs.readFileSync(path.join(workflowDir, file), 'utf8')
    if (content.includes('build:root')) {
      fail(`workflow ${file} still references build:root`)
    }
  }
}


const removedArchive = path.join(root, 'legacy')
if (fs.existsSync(removedArchive)) {
  fail('legacy directory has been removed and must not be recreated')
}
const workspacePath = path.join(root, 'pnpm-workspace.yaml')
if (fs.existsSync(workspacePath) && fs.readFileSync(workspacePath, 'utf8').includes('legacy')) {
  fail('pnpm workspace must not include removed legacy package paths')
}
const packageFiles = []
function collectPackageFiles(dir) {
  if (!fs.existsSync(dir)) return
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (['node_modules', 'dist'].includes(entry.name)) continue
      collectPackageFiles(absolute)
    } else if (entry.name === 'package.json') {
      packageFiles.push(absolute)
    }
  }
}
collectPackageFiles(path.join(root, 'apps'))
collectPackageFiles(path.join(root, 'packages'))
for (const file of packageFiles) {
  const content = fs.readFileSync(file, 'utf8')
}

if (process.exitCode) process.exit(process.exitCode)
console.log('[root-runtime] root runtime decommission guard passed')
