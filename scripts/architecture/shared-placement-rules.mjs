import path from 'node:path'

const posix = path.posix

export const sharedPlacementDomains = [
  {
    name: 'theme and design tokens',
    owner: '@ccd/design-tokens',
    appLocalPatterns: [
      /^apps\/web-demo\/src\/constants\/(?:theme|breakpoints|size|sizeScale)(?:\.ts|\/|$)/,
      /^apps\/web-demo\/src\/utils\/theme(?:\/|$)/,
    ],
    allowedImporterPatterns: [/^apps\/web-demo\/src\//, /^apps\/web-demo\/build\//],
  },
  {
    name: 'request runtime and services',
    owner: 'apps/web-demo/src/utils/http and apps/web-demo/src/api',
    appLocalPatterns: [
      /^apps\/web-demo\/src\/api(?:\/|$)/,
      /^apps\/web-demo\/src\/services(?:\/|$)/,
      /^apps\/web-demo\/src\/utils\/http(?:\/|$)/,
    ],
    allowedImporterPatterns: [/^apps\/web-demo\/src\//],
  },
  {
    name: 'Vue composables',
    owner: '@ccd/vue-hooks for shared hooks; apps/web-demo/src/hooks for app hooks',
    appLocalPatterns: [/^apps\/web-demo\/src\/hooks(?:\/|$)/],
    allowedImporterPatterns: [/^apps\/web-demo\/src\//],
  },
  {
    name: 'i18n messages and locale wiring',
    owner: 'apps/web-demo/src/locales',
    appLocalPatterns: [/^apps\/web-demo\/src\/locales(?:\/|$)/],
    allowedImporterPatterns: [/^apps\/web-demo\/src\//],
  },
  {
    name: 'app-local utilities',
    owner: '@ccd/shared-utils for pure shared utilities; apps/web-demo/src/utils for app runtime',
    appLocalPatterns: [/^apps\/web-demo\/src\/utils(?:\/|$)/],
    allowedImporterPatterns: [/^apps\/web-demo\/src\//],
  },
  {
    name: 'app-local route surfaces',
    owner: 'apps/web-demo/src/router',
    appLocalPatterns: [/^apps\/web-demo\/src\/router(?:\/|$)/],
    allowedImporterPatterns: [/^apps\/web-demo\/src\//],
  },
  {
    name: 'app-local view surfaces',
    owner: 'apps/web-demo/src/views',
    appLocalPatterns: [/^apps\/web-demo\/src\/views(?:\/|$)/],
    allowedImporterPatterns: [/^apps\/web-demo\/src\//],
  },
  {
    name: 'app-local store surfaces',
    owner: 'apps/web-demo/src/stores',
    appLocalPatterns: [/^apps\/web-demo\/src\/stores(?:\/|$)/],
    allowedImporterPatterns: [/^apps\/web-demo\/src\//],
  },
  {
    name: 'app-local plugin wiring',
    owner: 'apps/web-demo/src/plugins',
    appLocalPatterns: [/^apps\/web-demo\/src\/plugins(?:\/|$)/],
    allowedImporterPatterns: [/^apps\/web-demo\/src\//],
  },
]

export const workspaceRuntimeImportDomains = [
  {
    name: 'UnoCSS preset runtime',
    owner: '@ccd/unocss-preset',
    specifierPattern: /^(?:unocss(?:\/|$)|@unocss\/|@iconify\/utils$)/,
    allowedImporterPatterns: [
      /^packages\/unocss-preset\/src\//,
      /^apps\/[^/]+\/vite\.config\.ts$/,
      /^apps\/[^/]+\/build\//,
      /^scripts\/ci\/verify-unocss-token-classes\.mjs$/,
      /^scripts\/generate-unocss-ide-data\.mjs$/,
    ],
  },
  {
    name: 'request runtime',
    owner: 'apps/web-demo/src/utils/http',
    specifierPattern: /^alova(?:\/|$)/,
    allowedImporterPatterns: [
      /^apps\/web-demo\/src\/utils\/http(?:\/|$)/,
      /^apps\/web-demo\/src\/hooks\/modules\/useHttpRequest(?:\.spec)?\.ts$/,
      /^apps\/web-demo\/build\//,
    ],
  },
  {
    name: 'safeStorage crypto/compression runtime',
    owner: 'apps/web-demo/src/utils/safeStorage',
    specifierPattern: /^(?:crypto-es|lz-string)$/,
    allowedImporterPatterns: [/^apps\/web-demo\/src\/utils\/safeStorage(?:\/|$)/],
  },
]

function normalizePath(value) {
  return value.replaceAll('\\', '/').replace(/\/+/g, '/').replace(/^\.\//, '')
}

function stripSpecifierSuffix(specifier) {
  return specifier.split(/[?#]/, 1)[0]
}

export function normalizeImportTarget(fileRelPath, specifier) {
  const normalizedFile = normalizePath(fileRelPath)
  const rawSpecifier = stripSpecifierSuffix(specifier)

  if (rawSpecifier.startsWith('@/')) {
    return normalizePath(`apps/web-demo/src/${rawSpecifier.slice(2)}`)
  }

  if (rawSpecifier.startsWith('@!/')) {
    return normalizePath(`apps/web-demo/src/api/${rawSpecifier.slice(3)}`)
  }

  if (rawSpecifier.startsWith('@&/')) {
    return normalizePath(`apps/web-demo/src/layouts/components/${rawSpecifier.slice(3)}`)
  }

  if (rawSpecifier.startsWith('.')) {
    return normalizePath(posix.normalize(posix.join(posix.dirname(normalizedFile), rawSpecifier)))
  }

  if (rawSpecifier.startsWith('apps/') || rawSpecifier.startsWith('packages/')) {
    return normalizePath(rawSpecifier)
  }

  return null
}

function allowedByPatterns(fileRelPath, patterns) {
  return patterns.some(pattern => pattern.test(fileRelPath))
}

function domainForTarget(targetRelPath) {
  return sharedPlacementDomains.find(domain =>
    domain.appLocalPatterns.some(pattern => pattern.test(targetRelPath))
  )
}

export function classifySharedPlacementImport(fileRelPath, specifier) {
  const normalizedFile = normalizePath(fileRelPath)
  const targetRelPath = normalizeImportTarget(normalizedFile, specifier)
  if (!targetRelPath) return null

  const domain = domainForTarget(targetRelPath)
  if (!domain) return null

  const allowed = allowedByPatterns(normalizedFile, domain.allowedImporterPatterns)
  return {
    allowed,
    domain: domain.name,
    owner: domain.owner,
    file: normalizedFile,
    target: targetRelPath,
    message: allowed
      ? ''
      : `${domain.name} import crosses the shared-placement boundary; use ${domain.owner} or an app-owned adapter instead of "${specifier}"`,
  }
}

export function classifyWorkspaceRuntimeImport(fileRelPath, specifier) {
  const normalizedFile = normalizePath(fileRelPath)
  const domain = workspaceRuntimeImportDomains.find(item => item.specifierPattern.test(specifier))
  if (!domain) return null

  const allowed = allowedByPatterns(normalizedFile, domain.allowedImporterPatterns)
  return {
    allowed,
    domain: domain.name,
    owner: domain.owner,
    file: normalizedFile,
    target: specifier,
    message: allowed
      ? ''
      : `${domain.name} import is allowed only in ${domain.owner} ownership paths: "${specifier}"`,
  }
}

export function classifyBoundaryImport(fileRelPath, specifier) {
  return (
    classifySharedPlacementImport(fileRelPath, specifier) ??
    classifyWorkspaceRuntimeImport(fileRelPath, specifier)
  )
}
