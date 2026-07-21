#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const root = process.cwd()
const policy = JSON.parse(fs.readFileSync('.ai/governance/policies/runtime.json', 'utf8'))
const findings = []
const importPattern = /(?:import|export)\s+(?:[^'";]+?\s+from\s+)?['"]([^'"]+)['"]|import\(['"]([^'"]+)['"]\)/g

function normalize(value) {
  return value.split(path.sep).join('/')
}

function inside(relativePath, parent) {
  return relativePath === parent || relativePath.startsWith(`${parent}/`)
}

function walk(directory) {
  if (!fs.existsSync(directory)) return []
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const absolutePath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      if (['node_modules', 'dist', 'target', 'gen'].includes(entry.name)) return []
      return walk(absolutePath)
    }
    return /\.(?:ts|tsx|js|jsx|mjs|vue)$/.test(entry.name) ? [absolutePath] : []
  })
}

for (const file of [...walk(path.join(root, 'apps')), ...walk(path.join(root, 'packages'))]) {
  const relativePath = normalize(path.relative(root, file))
  const content = fs.readFileSync(file, 'utf8')
  const neutral = policy.runtimeNeutralPaths.some(parent => inside(relativePath, parent))

  if (neutral) {
    for (const pattern of policy.forbiddenSourcePatterns.map(value => new RegExp(value))) {
      if (pattern.test(content)) findings.push(`${relativePath}: runtime global matches ${pattern}`)
    }
  }

  for (const match of content.matchAll(importPattern)) {
    const specifier = match[1] ?? match[2]
    if (neutral && policy.forbiddenImports.some(value => new RegExp(value).test(specifier))) {
      findings.push(`${relativePath}: runtime import ${specifier}`)
    }
    for (const boundary of policy.adapterBoundaries) {
      if (
        new RegExp(boundary.forbiddenImportPattern).test(specifier) &&
        !inside(relativePath, boundary.allowedPath)
      ) {
        findings.push(`${relativePath}: ${boundary.name} import must stay in ${boundary.allowedPath}`)
      }
    }
  }

  for (const boundary of policy.adapterBoundaries) {
    if (
      !inside(relativePath, boundary.allowedPath) &&
      new RegExp(boundary.forbiddenCallPattern).test(content)
    ) {
      findings.push(`${relativePath}: ${boundary.name} call must stay in ${boundary.allowedPath}`)
    }
  }
}

if (findings.length > 0) {
  console.error('Runtime boundary validation failed:')
  findings.forEach(finding => console.error(`- ${finding}`))
  process.exit(1)
}

console.log('Runtime boundary validation passed.')
