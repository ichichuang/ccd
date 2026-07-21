#!/usr/bin/env node

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'

function parseArgs(argv) {
  const options = { check: false, clients: [], targetRoot: null }
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index]
    if (value === '--check') options.check = true
    else if (value === '--client') options.clients.push(argv[++index])
    else if (value === '--target-root') options.targetRoot = path.resolve(argv[++index])
    else if (value !== '--') throw new Error(`Unknown argument: ${value}`)
  }
  if (options.clients.length === 0) options.clients = ['codex', 'claude']
  if (options.clients.some(client => !['codex', 'claude'].includes(client))) {
    throw new Error('Client must be codex or claude')
  }
  return options
}

function filesUnder(directory) {
  const files = []
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...filesUnder(absolutePath))
    else if (entry.isFile()) files.push(absolutePath)
  }
  return files
}

function targetFor(client, override) {
  if (override) return path.join(override, client, 'project-ui')
  if (client === 'codex') return path.join(os.homedir(), '.codex', 'skills', 'project-ui')
  return path.join(process.cwd(), '.claude', 'skills', 'project-ui')
}

const options = parseArgs(process.argv.slice(2))
const source = path.join(process.cwd(), '.ai', 'skills', 'project-ui')
let hasDrift = false

for (const client of options.clients) {
  const target = targetFor(client, options.targetRoot)
  for (const sourceFile of filesUnder(source)) {
    const relativePath = path.relative(source, sourceFile)
    const targetFile = path.join(target, relativePath)
    const content = fs.readFileSync(sourceFile)
    const current = fs.existsSync(targetFile) ? fs.readFileSync(targetFile) : null
    if (current?.equals(content)) continue
    hasDrift = true
    if (!options.check) {
      fs.mkdirSync(path.dirname(targetFile), { recursive: true })
      fs.writeFileSync(targetFile, content)
    }
  }
  console.log(`${client}: ${hasDrift ? (options.check ? 'out of date' : 'synchronized') : 'current'}`)
}

if (options.check && hasDrift) process.exit(1)
