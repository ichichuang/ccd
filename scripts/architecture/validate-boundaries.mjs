#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import process from 'node:process'
import ts from 'typescript'
import {
  classifyPackageInternalImport,
  validatePackagePublicSurface,
} from './package-surface-rules.mjs'
import { classifyBoundaryImport } from './shared-placement-rules.mjs'
import { patterns, readPolicies, workspacePackages } from '../governance/policy-utils.mjs'

const root = process.cwd()
const { runtime, topology } = readPolicies('runtime', 'topology')
const sourceRoots = ['packages', 'apps']
const coreDir = join(root, 'packages/core/src')
const forbiddenCoreImports = patterns(runtime.forbiddenImports)
const forbiddenCoreBuiltinImports =
  /^(node:)?(fs|path|os|process|child_process|worker_threads|http|https|stream|crypto)$/
const rootToolingDir = join(root, 'scripts')
const importPattern =
  /(?:import|export)\s+(?:[^'";]+?\s+from\s+)?['"]([^'"]+)['"]|import\(['"]([^'"]+)['"]\)/g
const forbiddenCoreGlobalPatterns = patterns(runtime.forbiddenSourcePatterns)
const appTsconfigSourceIncludePattern = /(^|\/)packages\/[^/]+\/src\//
const adapterBoundaries = runtime.adapterBoundaries.map(boundary => ({
  ...boundary,
  allowedPath: join(root, boundary.allowedPath),
  forbiddenImportPattern: new RegExp(boundary.forbiddenImportPattern),
  forbiddenCallPattern: new RegExp(boundary.forbiddenCallPattern),
}))
const findings = []
const workspacePackageList = workspacePackages(topology)
const packageExportSubpaths = new Map(
  workspacePackageList.map(item => {
    const manifest = JSON.parse(readFileSync(join(root, item.path, 'package.json'), 'utf8'))
    return [item.name, new Set(Object.keys(manifest.exports ?? {}))]
  })
)
const workspacePackageNames = new Set(workspacePackageList.map(item => item.name))

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

function reportBoundaryImport(file, specifier) {
  const relPath = relative(root, file).replaceAll('\\', '/')
  const boundary = classifyBoundaryImport(relPath, specifier)
  if (boundary && !boundary.allowed) {
    report(file, boundary.message)
  }
  const packageInternalImport = classifyPackageInternalImport(
    relPath,
    specifier,
    workspacePackageList
  )
  if (packageInternalImport && !packageInternalImport.allowed) {
    report(file, packageInternalImport.message)
  }
}

function workspaceDependencyNames(manifestSection = {}) {
  return Object.entries(manifestSection)
    .filter(
      ([name, specifier]) =>
        workspacePackageNames.has(name) &&
        typeof specifier === 'string' &&
        specifier.startsWith('workspace:')
    )
    .map(([name]) => name)
}

function uniqueSorted(values) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b))
}

function formatList(values) {
  return values.length > 0 ? values.join(', ') : 'none'
}

function readTsconfig(file) {
  const content = readFileSync(file, 'utf8')
  const parsed = ts.parseConfigFileTextToJson(file, content)
  if (parsed.error) {
    report(file, `tsconfig parse failed: ${ts.flattenDiagnosticMessageText(parsed.error.messageText, '\n')}`)
    return {}
  }
  return parsed.config ?? {}
}

for (const appDirName of readdirSync(join(root, 'apps'))) {
  const appDir = join(root, 'apps', appDirName)
  if (!statSync(appDir).isDirectory()) continue

  for (const entry of readdirSync(appDir, { withFileTypes: true })) {
    if (!entry.isFile() || !/^tsconfig(?:\.[^.]+)?\.json$/.test(entry.name)) continue

    const tsconfigPath = join(appDir, entry.name)
    const config = readTsconfig(tsconfigPath)
    const includes = Array.isArray(config.include) ? config.include : []
    for (const includePath of includes) {
      if (
        typeof includePath === 'string' &&
        appTsconfigSourceIncludePattern.test(includePath.replaceAll('\\', '/'))
      ) {
        report(
          tsconfigPath,
          `app tsconfig must not include package source path "${includePath}"; consume workspace packages through exports/build outputs or project references`
        )
      }
    }
  }
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
      reportBoundaryImport(file, specifier)

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

for (const file of walk(rootToolingDir)) {
  const content = readFileSync(file, 'utf8')

  for (const match of content.matchAll(importPattern)) {
    const specifier = match[1] ?? match[2]
    if (!specifier) continue
    reportBoundaryImport(file, specifier)
  }
}

for (const packageInfo of workspacePackageList) {
  const packageDir = join(root, packageInfo.path)
  if (!statSync(packageDir).isDirectory()) continue
  const manifestPath = join(packageDir, 'package.json')
  if (!existsSync(manifestPath)) continue
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  const manifestWorkspaceDependencies = uniqueSorted([
    ...workspaceDependencyNames(manifest.dependencies),
    ...workspaceDependencyNames(manifest.devDependencies),
  ])
  const allowedWorkspaceDependencies = uniqueSorted(packageInfo.allowedWorkspaceDependencies ?? [])

  if (
    manifestWorkspaceDependencies.length !== allowedWorkspaceDependencies.length ||
    manifestWorkspaceDependencies.some(
      (name, index) => name !== allowedWorkspaceDependencies[index]
    )
  ) {
    report(
      manifestPath,
      `workspace dependency policy mismatch for ${packageInfo.name}: manifest=[${formatList(manifestWorkspaceDependencies)}], topology=[${formatList(allowedWorkspaceDependencies)}]`
    )
  }

  for (const surfaceFinding of validatePackagePublicSurface(packageInfo, manifest, {
    hasSourceIndex: existsSync(join(packageDir, 'src/index.ts')),
    requireExplicitRootExport: topology.exportPolicy.requireExplicitRootExport,
  })) {
    report(manifestPath, surfaceFinding)
  }
}

if (findings.length > 0) {
  console.error('Architecture boundary validation failed:')
  findings.forEach(finding => console.error(`- ${finding}`))
  process.exit(1)
}

console.log('Architecture boundary validation passed.')
