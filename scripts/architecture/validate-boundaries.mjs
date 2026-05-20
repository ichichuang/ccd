#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import process from 'node:process'
import { patterns, readPolicies, workspacePackages } from '../governance/policy-utils.mjs'

const root = process.cwd()
const { runtime, topology } = readPolicies('runtime', 'topology')
const sourceRoots = ['packages', 'apps']
const coreDir = join(root, 'packages/core/src')
const forbiddenCoreImports = patterns(runtime.forbiddenImports)
const forbiddenCoreBuiltinImports =
  /^(node:)?(fs|path|os|process|child_process|worker_threads|http|https|stream|crypto)$/
const importPattern =
  /(?:import|export)\s+(?:[^'";]+?\s+from\s+)?['"]([^'"]+)['"]|import\(['"]([^'"]+)['"]\)/g
const forbiddenCoreGlobalPatterns = patterns(runtime.forbiddenSourcePatterns)
const adapterBoundaries = runtime.adapterBoundaries.map(boundary => ({
  ...boundary,
  allowedPath: join(root, boundary.allowedPath),
  forbiddenImportPattern: new RegExp(boundary.forbiddenImportPattern),
  forbiddenCallPattern: new RegExp(boundary.forbiddenCallPattern),
}))
const findings = []
const packageExportSubpaths = new Map(
  workspacePackages(topology).map(item => {
    const manifest = JSON.parse(readFileSync(join(root, item.path, 'package.json'), 'utf8'))
    return [item.name, new Set(Object.keys(manifest.exports ?? {}))]
  })
)

function walk(dir) {
  if (!existsSync(dir)) return []
  const entries = readdirSync(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const absolute = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (['node_modules', 'dist', 'target'].includes(entry.name)) continue
      files.push(...walk(absolute))
    } else if (/\.(ts|tsx|vue|js|mjs)$/.test(entry.name)) {
      files.push(absolute)
    }
  }
  return files
}

function isInside(child, parent) {
  const normalizedParent = parent.endsWith(sep) ? parent : `${parent}${sep}`
  return child === parent || child.startsWith(normalizedParent)
}

function report(file, message) {
  findings.push(`${relative(root, file)}: ${message}`)
}

for (const sourceRoot of sourceRoots) {
  for (const file of walk(join(root, sourceRoot))) {
    const content = readFileSync(file, 'utf8')
    const isCore = isInside(file, coreDir)
    if (isCore && forbiddenCoreGlobalPatterns.some(pattern => pattern.test(content))) {
      report(file, 'core must not reference runtime globals')
    }

    for (const match of content.matchAll(importPattern)) {
      const specifier = match[1] ?? match[2]
      if (!specifier) continue

      if (isCore && forbiddenCoreImports.some(pattern => pattern.test(specifier))) {
        report(file, `core must not import runtime API "${specifier}"`)
      }
      if (isCore && forbiddenCoreBuiltinImports.test(specifier)) {
        report(file, `core must not import runtime builtin "${specifier}"`)
      }
      if (isCore && specifier.startsWith('../../apps')) {
        report(file, 'core must not import apps')
      }
      if (/^@ccd\/(web-demo|desktop)(\/|$)/.test(specifier)) {
        report(file, `cross-app package import is forbidden: "${specifier}"`)
      }
      for (const packageName of topology.exportPolicy.forbidWorkspaceDeepImports) {
        if (specifier.startsWith(`${packageName}/`)) {
          const subpath = `.${specifier.slice(packageName.length)}`
          if (!packageExportSubpaths.get(packageName)?.has(subpath)) {
            report(file, `deep import from ${packageName} is forbidden: "${specifier}"`)
          }
        }
      }
      if (specifier.includes('/packages/core/src/') || specifier.includes('packages/core/src/')) {
        report(file, `filesystem deep import into core is forbidden: "${specifier}"`)
      }
      if (file.includes(`${sep}apps${sep}`) && specifier.includes(`${sep}apps${sep}`)) {
        report(file, `cross-app filesystem import is forbidden: "${specifier}"`)
      }
      for (const boundary of adapterBoundaries) {
        if (
          boundary.forbiddenImportPattern.test(specifier) &&
          !isInside(file, boundary.allowedPath)
        ) {
          report(
            file,
            `${boundary.name} import is allowed only in ${relative(root, boundary.allowedPath)}: "${specifier}"`
          )
        }
      }
    }

    for (const boundary of adapterBoundaries) {
      if (!isInside(file, boundary.allowedPath) && boundary.forbiddenCallPattern.test(content)) {
        report(
          file,
          `direct ${boundary.name} calls are allowed only in ${relative(root, boundary.allowedPath)}`
        )
      }
    }
  }
}

for (const packageDir of workspacePackages(topology).map(item => join(root, item.path))) {
  if (!statSync(packageDir).isDirectory()) continue
  const manifestPath = join(packageDir, 'package.json')
  if (!existsSync(manifestPath)) continue
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  if (topology.exportPolicy.requireExplicitRootExport && !manifest.exports?.['.']) {
    findings.push(
      `${relative(root, manifestPath)}: package must expose only an explicit root export entry`
    )
  }
}

if (findings.length > 0) {
  console.error('Architecture boundary validation failed:')
  findings.forEach(finding => console.error(`- ${finding}`))
  process.exit(1)
}

console.log('Architecture boundary validation passed.')
