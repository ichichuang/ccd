import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export const REQUIRED_SCOPE_SURFACES = [
  'filesystem',
  'shell',
  'dialog',
  'clipboard',
  'updater',
  'opener',
  'notification',
  'http',
  'external-navigation',
]

const CSP_ALLOWED_SOURCES = new Set([
  "'self'",
  "'none'",
  'ipc:',
  'http://ipc.localhost',
  'data:',
  'blob:',
])

const PLUGIN_SURFACE_BY_PERMISSION_PREFIX = new Map([
  ['fs', 'filesystem'],
  ['shell', 'shell'],
  ['dialog', 'dialog'],
  ['clipboard-manager', 'clipboard'],
  ['updater', 'updater'],
  ['opener', 'opener'],
  ['notification', 'notification'],
  ['http', 'http'],
])

const PLUGIN_SURFACE_BY_PACKAGE_SUFFIX = new Map([
  ['fs', 'filesystem'],
  ['shell', 'shell'],
  ['dialog', 'dialog'],
  ['clipboard-manager', 'clipboard'],
  ['updater', 'updater'],
  ['opener', 'opener'],
  ['notification', 'notification'],
  ['http', 'http'],
])

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function asSourceList(value) {
  if (Array.isArray(value)) return value
  if (typeof value === 'string') return value.split(/\s+/).filter(Boolean)
  return []
}

function cspEntries(csp) {
  if (!csp) return []
  if (typeof csp === 'string') {
    return csp
      .split(';')
      .map(part => part.trim())
      .filter(Boolean)
      .map(part => {
        const [directive, ...sources] = part.split(/\s+/)
        return [directive, sources]
      })
  }
  if (typeof csp === 'object' && !Array.isArray(csp)) {
    return Object.entries(csp).map(([directive, sources]) => [directive, asSourceList(sources)])
  }
  return []
}

function cspSourceSet(csp) {
  return new Map(cspEntries(csp).map(([directive, sources]) => [directive, new Set(sources)]))
}

function normalizeCapabilities(value) {
  if (Array.isArray(value)) return value
  if (value && typeof value === 'object' && Array.isArray(value.capabilities)) {
    return value.capabilities
  }
  if (value && typeof value === 'object') return [value]
  return []
}

function permissionIdentifier(permission) {
  if (typeof permission === 'string') return permission
  if (permission && typeof permission === 'object' && typeof permission.identifier === 'string') {
    return permission.identifier
  }
  return null
}

function pluginSurfaceFromPermission(permission) {
  const identifier = permissionIdentifier(permission)
  if (!identifier) return null
  const [prefix] = identifier.split(':')
  return PLUGIN_SURFACE_BY_PERMISSION_PREFIX.get(prefix) ?? null
}

function pluginSurfaceFromJsPackage(packageName) {
  if (!packageName.startsWith('@tauri-apps/plugin-')) return null
  return PLUGIN_SURFACE_BY_PACKAGE_SUFFIX.get(packageName.replace('@tauri-apps/plugin-', '')) ?? null
}

function pluginSurfaceFromRustCrate(crateName) {
  if (!crateName.startsWith('tauri-plugin-')) return null
  return PLUGIN_SURFACE_BY_PACKAGE_SUFFIX.get(crateName.replace('tauri-plugin-', '')) ?? null
}

function surfaceMap(policy) {
  return new Map((policy.surfaces ?? []).map(surface => [surface.surface, surface]))
}

function hasScopedEnabledPolicy(surface) {
  return (
    surface?.enabled === true &&
    Array.isArray(surface.allow) &&
    surface.allow.length > 0 &&
    Array.isArray(surface.deny) &&
    surface.deny.length > 0
  )
}

function validateCsp(tauriConfig, findings) {
  const csp = tauriConfig.app?.security?.csp
  if (!csp) {
    findings.push('apps/desktop/src-tauri/tauri.conf.json: app.security.csp must not be null')
    return
  }

  const directives = cspSourceSet(csp)
  for (const [directive, sources] of directives) {
    for (const source of sources) {
      if (source === "'unsafe-inline'" || source === "'unsafe-eval'") {
        findings.push(`apps/desktop/src-tauri/tauri.conf.json: ${directive} must not allow ${source}`)
      }
      if (!CSP_ALLOWED_SOURCES.has(source)) {
        findings.push(`apps/desktop/src-tauri/tauri.conf.json: ${directive} has unapproved source ${source}`)
      }
    }
  }

  const requiredSources = [
    ['default-src', "'self'"],
    ['connect-src', 'ipc:'],
    ['connect-src', 'http://ipc.localhost'],
    ['script-src', "'self'"],
    ['style-src', "'self'"],
    ['object-src', "'none'"],
    ['base-uri', "'none'"],
    ['frame-ancestors', "'none'"],
  ]
  for (const [directive, source] of requiredSources) {
    if (!directives.get(directive)?.has(source)) {
      findings.push(`apps/desktop/src-tauri/tauri.conf.json: ${directive} must include ${source}`)
    }
  }
}

function validateScopePolicy(scopePolicy, findings) {
  if (scopePolicy.defaultDecision !== 'deny') {
    findings.push('apps/desktop/src-tauri/security-scopes.json: defaultDecision must be "deny"')
  }

  const surfaces = surfaceMap(scopePolicy)
  for (const surfaceName of REQUIRED_SCOPE_SURFACES) {
    const surface = surfaces.get(surfaceName)
    if (!surface) {
      findings.push(`apps/desktop/src-tauri/security-scopes.json: missing ${surfaceName} surface`)
      continue
    }
    if (surface.enabled === false) {
      if (!Array.isArray(surface.allow) || surface.allow.length !== 0) {
        findings.push(`apps/desktop/src-tauri/security-scopes.json: disabled ${surfaceName} must have empty allow scope`)
      }
      if (!Array.isArray(surface.deny) || !surface.deny.includes('*')) {
        findings.push(`apps/desktop/src-tauri/security-scopes.json: disabled ${surfaceName} must deny "*"`)
      }
    } else if (!hasScopedEnabledPolicy(surface)) {
      findings.push(`apps/desktop/src-tauri/security-scopes.json: enabled ${surfaceName} requires explicit allow and deny scopes`)
    }
  }
}

function validateCapabilities(capabilities, scopePolicy, findings) {
  const surfaces = surfaceMap(scopePolicy)
  let defaultCapabilityFound = false

  for (const { path, parsed } of capabilities) {
    for (const capability of normalizeCapabilities(parsed)) {
      if (capability.identifier === 'default') defaultCapabilityFound = true
      if (capability.remote?.urls?.length) {
        findings.push(`${path}: remote capability URLs are not allowed without explicit owner approval`)
      }
      if (capability.local !== true) {
        findings.push(`${path}: capability ${capability.identifier ?? '<unknown>'} must be explicitly local`)
      }
      if (!Array.isArray(capability.permissions)) {
        findings.push(`${path}: capability ${capability.identifier ?? '<unknown>'} must define permissions array`)
        continue
      }
      for (const permission of capability.permissions) {
        const identifier = permissionIdentifier(permission)
        if (identifier === 'core:default') {
          findings.push(`${path}: core:default is too broad for the desktop baseline`)
        }
        const surfaceName = pluginSurfaceFromPermission(permission)
        if (surfaceName && !hasScopedEnabledPolicy(surfaces.get(surfaceName))) {
          findings.push(`${path}: ${identifier} requires enabled ${surfaceName} scope policy before use`)
        }
      }
    }
  }

  if (!defaultCapabilityFound) {
    findings.push('apps/desktop/src-tauri/capabilities/default.json: default capability is required')
  }
}

function validatePluginPackages(packageManifest, cargoToml, scopePolicy, findings) {
  const surfaces = surfaceMap(scopePolicy)
  const deps = {
    ...(packageManifest.dependencies ?? {}),
    ...(packageManifest.devDependencies ?? {}),
    ...(packageManifest.optionalDependencies ?? {}),
  }

  for (const packageName of Object.keys(deps)) {
    const surfaceName = pluginSurfaceFromJsPackage(packageName)
    if (surfaceName && !hasScopedEnabledPolicy(surfaces.get(surfaceName))) {
      findings.push(`apps/desktop/package.json: ${packageName} requires enabled ${surfaceName} scope policy before use`)
    }
  }

  const rustPluginCrates = new Set(cargoToml.match(/tauri-plugin-[A-Za-z0-9_-]+/g) ?? [])
  for (const crateName of rustPluginCrates) {
    const surfaceName = pluginSurfaceFromRustCrate(crateName)
    if (surfaceName && !hasScopedEnabledPolicy(surfaces.get(surfaceName))) {
      findings.push(`apps/desktop/src-tauri/Cargo.toml: ${crateName} requires enabled ${surfaceName} scope policy before use`)
    }
  }
}

export function validateDesktopSecurity(inputs) {
  const findings = []
  validateCsp(inputs.tauriConfig, findings)
  validateScopePolicy(inputs.scopePolicy, findings)
  validateCapabilities(inputs.capabilities, inputs.scopePolicy, findings)
  validatePluginPackages(inputs.packageManifest, inputs.cargoToml, inputs.scopePolicy, findings)
  return findings
}

export function loadDesktopSecurityInputs(root = process.cwd()) {
  const capabilitiesDir = join(root, 'apps/desktop/src-tauri/capabilities')
  const capabilityFiles = existsSync(capabilitiesDir)
    ? readdirSync(capabilitiesDir)
        .filter(name => name.endsWith('.json'))
        .sort()
        .map(name => {
          const path = `apps/desktop/src-tauri/capabilities/${name}`
          return { path, parsed: readJson(join(root, path)) }
        })
    : []

  return {
    tauriConfig: readJson(join(root, 'apps/desktop/src-tauri/tauri.conf.json')),
    scopePolicy: readJson(join(root, 'apps/desktop/src-tauri/security-scopes.json')),
    capabilities: capabilityFiles,
    packageManifest: readJson(join(root, 'apps/desktop/package.json')),
    cargoToml: readFileSync(join(root, 'apps/desktop/src-tauri/Cargo.toml'), 'utf8'),
  }
}
