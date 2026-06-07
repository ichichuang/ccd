import { normalizeImportTarget } from './shared-placement-rules.mjs'

function normalizePath(value) {
  return value.replaceAll('\\', '/').replace(/\/+/g, '/').replace(/^\.\//, '')
}

function isInside(relPath, parentPath) {
  const normalizedParent = normalizePath(parentPath).replace(/\/$/, '')
  return relPath === normalizedParent || relPath.startsWith(`${normalizedParent}/`)
}

export function collectExportTargets(exportsField) {
  if (!exportsField) return []
  if (typeof exportsField === 'string') return [exportsField]
  if (Array.isArray(exportsField)) return exportsField.flatMap(collectExportTargets)
  if (typeof exportsField === 'object') {
    return Object.values(exportsField).flatMap(collectExportTargets)
  }
  return []
}

export function workspacePackageForPath(relPath, packages) {
  const normalizedPath = normalizePath(relPath)
  return packages
    .filter(item => isInside(normalizedPath, item.path))
    .sort((a, b) => b.path.length - a.path.length)[0]
}

function workspacePackageForSourcePath(relPath, packages) {
  const normalizedPath = normalizePath(relPath)
  return packages.find(item => isInside(normalizedPath, `${item.path}/src`))
}

export function classifyPackageInternalImport(fileRelPath, specifier, packages) {
  const normalizedFile = normalizePath(fileRelPath)
  const targetRelPath = normalizeImportTarget(normalizedFile, specifier)
  if (!targetRelPath) return null

  const targetPackage = workspacePackageForSourcePath(targetRelPath, packages)
  if (!targetPackage) return null

  const importerPackage = workspacePackageForPath(normalizedFile, packages)
  if (importerPackage?.path === targetPackage.path) {
    return {
      allowed: true,
      file: normalizedFile,
      target: targetRelPath,
      owner: targetPackage.name,
      message: '',
    }
  }

  return {
    allowed: false,
    file: normalizedFile,
    target: targetRelPath,
    owner: targetPackage.name,
    message: `workspace import crosses into ${targetPackage.name} internals; import the package public export instead of "${specifier}"`,
  }
}

function isDistTarget(target) {
  return typeof target === 'string' && target.startsWith('./dist/')
}

function validateLegacyEntryField(manifest, fieldName, findings) {
  const target = manifest[fieldName]
  if (target && !isDistTarget(target)) {
    findings.push(`${fieldName} must point at ./dist/**, received "${target}"`)
  }
}

export function validatePackagePublicSurface(packageInfo, manifest, options = {}) {
  if (packageInfo.publicApi === false) return []

  const findings = []
  const requireExplicitRootExport = options.requireExplicitRootExport !== false

  if (options.hasSourceIndex === false) {
    findings.push(`${packageInfo.name} must define its public source surface in src/index.ts`)
  }

  if (requireExplicitRootExport && !manifest.exports?.['.']) {
    findings.push(`${packageInfo.name} must expose an explicit root export entry`)
  }

  for (const target of collectExportTargets(manifest.exports)) {
    if (!isDistTarget(target)) {
      findings.push(`${packageInfo.name} export target must point at ./dist/**, received "${target}"`)
    }
  }

  validateLegacyEntryField(manifest, 'main', findings)
  validateLegacyEntryField(manifest, 'module', findings)
  validateLegacyEntryField(manifest, 'types', findings)

  return findings
}
