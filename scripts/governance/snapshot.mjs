#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { paths, writeJson } from './utils.mjs'

const entries = fs.readdirSync(paths.cwd, { withFileTypes: true }).map(entry => entry.name).sort()
const docs = fs.existsSync(path.join(paths.cwd, 'docs')) ? fs.readdirSync(path.join(paths.cwd, 'docs')).sort() : []
const ai = fs.existsSync(path.join(paths.cwd, '.ai')) ? fs.readdirSync(path.join(paths.cwd, '.ai')).sort() : []
const scripts = fs.existsSync(path.join(paths.cwd, 'scripts')) ? fs.readdirSync(path.join(paths.cwd, 'scripts')).sort() : []

writeJson('.ai/generated/architecture-snapshot.json', {
  schemaVersion: 1,
  generatedBy: 'scripts/governance/snapshot.mjs',
  runtimeFamilies: ['web', 'desktop', 'portable'],
  rootEntries: entries,
  docsEntries: docs,
  aiEntries: ai,
  scriptEntries: scripts,
})
