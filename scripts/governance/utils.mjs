#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const cwd = process.cwd()
const outputDir = path.join(cwd, '.ai', 'generated')
const docsGeneratedDir = path.join(cwd, 'docs', 'generated')
const diagramsDir = path.join(docsGeneratedDir, 'diagrams')

export const ensureDir = dir => fs.mkdirSync(dir, { recursive: true })
export const writeJson = (relPath, value) => {
  const abs = path.join(cwd, relPath)
  ensureDir(path.dirname(abs))
  fs.writeFileSync(abs, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
  console.log(`[GENERATED] ${relPath}`)
}
export const writeText = (relPath, value) => {
  const abs = path.join(cwd, relPath)
  ensureDir(path.dirname(abs))
  fs.writeFileSync(abs, `${value.trimEnd()}\n`, 'utf8')
  console.log(`[GENERATED] ${relPath}`)
}
export const readJson = relPath => JSON.parse(fs.readFileSync(path.join(cwd, relPath), 'utf8'))
export const exists = relPath => fs.existsSync(path.join(cwd, relPath))
export const paths = {
  cwd,
  outputDir,
  docsGeneratedDir,
  diagramsDir,
}
