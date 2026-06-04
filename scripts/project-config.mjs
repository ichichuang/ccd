#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const CONFIG_PATH = join(ROOT, 'project.config.json')
const ROOT_PACKAGE_PATH = join(ROOT, 'package.json')
const BRAND_PATH = join(ROOT, 'apps/web-demo/src/constants/brand.ts')
const DESKTOP_INDEX_PATH = join(ROOT, 'apps/desktop/index.html')
const TAURI_CONF_PATH = join(ROOT, 'apps/desktop/src-tauri/tauri.conf.json')
const CARGO_TOML_PATH = join(ROOT, 'apps/desktop/src-tauri/Cargo.toml')
const RELEASE_MANIFEST_PATH = join(ROOT, '.release-please-manifest.json')
const GOVERNANCE_VERSION_PATH = join(ROOT, '.ai/governance/policies/version.json')

const REQUIRED_FIELDS = [
  'schemaVersion',
  'product.packageName',
  'product.displayName',
  'product.desktopProductName',
  'product.description',
  'product.author',
  'product.identifier',
  'product.keywords',
  'release.version',
  'governance.policyVersion',
  'governance.phase',
]

const COMMANDS = new Set(['print', 'validate', 'sync', 'doctor'])
const SEMVER_RE =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9A-Za-z-][0-9A-Za-z-]*))*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/
const PACKAGE_NAME_RE = /^(?:@[a-z0-9][a-z0-9._~-]*\/)?[a-z0-9][a-z0-9._~-]*$/
const IDENTIFIER_RE = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*(?:\.[a-z][a-z0-9]*(?:-[a-z0-9]+)*){2,}$/

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf-8'))
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf-8')
}

function getValue(source, dottedPath) {
  return dottedPath.split('.').reduce((value, key) => value?.[key], source)
}

function normalizeConfig(config) {
  return {
    schemaVersion: config.schemaVersion,
    product: {
      packageName: config.product.packageName,
      displayName: config.product.displayName,
      desktopProductName: config.product.desktopProductName,
      description: config.product.description,
      author: config.product.author,
      homepage: config.product.homepage,
      license: config.product.license,
      identifier: config.product.identifier,
      keywords: [...config.product.keywords],
    },
    release: {
      version: config.release.version,
    },
    governance: {
      policyVersion: config.governance.policyVersion,
      phase: config.governance.phase,
    },
  }
}

function validateConfig(config) {
  const errors = []

  for (const field of REQUIRED_FIELDS) {
    const value = getValue(config, field)
    if (
      value === undefined ||
      value === null ||
      (typeof value === 'string' && value.trim() === '') ||
      (Array.isArray(value) && value.length === 0)
    ) {
      errors.push(`Missing required field: ${field}`)
    }
  }

  if (config.schemaVersion !== 1) {
    errors.push('schemaVersion must be 1')
  }

  const product = config.product ?? {}
  const release = config.release ?? {}
  const governance = config.governance ?? {}

  for (const field of [
    'displayName',
    'desktopProductName',
    'description',
    'author',
    'identifier',
  ]) {
    if (product[field] !== undefined && typeof product[field] !== 'string') {
      errors.push(`product.${field} must be a string`)
    }
  }

  if (product.packageName !== undefined) {
    if (typeof product.packageName !== 'string' || !PACKAGE_NAME_RE.test(product.packageName)) {
      errors.push('product.packageName must be a safe npm package name')
    }
  }

  if (product.identifier !== undefined && !IDENTIFIER_RE.test(product.identifier)) {
    errors.push('product.identifier must use reverse-DNS style, e.g. com.example.app')
  }

  if (!Array.isArray(product.keywords)) {
    errors.push('product.keywords must be an array')
  } else {
    product.keywords.forEach((keyword, index) => {
      if (typeof keyword !== 'string' || keyword.trim() === '') {
        errors.push(`product.keywords[${index}] must be a non-empty string`)
      }
    })
  }

  if (product.homepage !== undefined && typeof product.homepage !== 'string') {
    errors.push('product.homepage must be a string when present')
  }

  if (product.license !== undefined && typeof product.license !== 'string') {
    errors.push('product.license must be a string when present')
  }

  if (release.version !== undefined && !SEMVER_RE.test(release.version)) {
    errors.push('release.version must be strict semver')
  }

  for (const field of ['policyVersion', 'phase']) {
    if (governance[field] !== undefined && typeof governance[field] !== 'string') {
      errors.push(`governance.${field} must be a string`)
    }
  }

  if (errors.length > 0) {
    const message = errors.map(error => `- ${error}`).join('\n')
    throw new Error(`project.config.json validation failed:\n${message}`)
  }

  return normalizeConfig(config)
}

function readConfig() {
  if (!existsSync(CONFIG_PATH)) {
    throw new Error('project.config.json not found')
  }
  return validateConfig(readJson(CONFIG_PATH))
}

function packageManifestPaths() {
  const paths = [ROOT_PACKAGE_PATH]

  for (const dirName of ['apps', 'packages']) {
    const dir = join(ROOT, dirName)
    if (!existsSync(dir)) continue
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue
      const packagePath = join(dir, entry.name, 'package.json')
      if (existsSync(packagePath)) {
        paths.push(packagePath)
      }
    }
  }

  return paths
}

function syncRootPackage(config) {
  const json = readJson(ROOT_PACKAGE_PATH)
  json.name = config.product.packageName
  json.version = config.release.version
  json.description = config.product.description
  json.author = config.product.author
  json.license = config.product.license
  json.homepage = config.product.homepage
  json.keywords = config.product.keywords
  writeJson(ROOT_PACKAGE_PATH, json)
}

function syncWorkspacePackages(config) {
  for (const packagePath of packageManifestPaths()) {
    if (packagePath === ROOT_PACKAGE_PATH) continue
    const json = readJson(packagePath)
    json.version = config.release.version
    writeJson(packagePath, json)
  }
}

function syncBrand(config) {
  const brand = `/**\n * Project brand metadata.\n * Source of truth: project.config.json. Run pnpm project:sync after edits.\n */\nexport const brand = {\n  /** Package, URL, browser-title, and og:title identifier. */\n  name: ${JSON.stringify(config.product.packageName)},\n  /** Header display title. */\n  displayName: ${JSON.stringify(config.product.displayName)},\n  /** Header display subtitle. */\n  subtitle: 'Platform',\n  /** package.json description and meta description. */\n  description: ${JSON.stringify(config.product.description)},\n  /** og:description slogan. */\n  slogan: 'Self-protecting deterministic multi-runtime platform architecture',\n  /** og:author and meta author. */\n  author: ${JSON.stringify(config.product.author)},\n} as const\n\nexport type Brand = typeof brand\n`
  writeFileSync(BRAND_PATH, brand, 'utf-8')
}

function syncTauriConfig(config) {
  if (!existsSync(TAURI_CONF_PATH)) return
  const json = readJson(TAURI_CONF_PATH)
  json.productName = config.product.desktopProductName
  json.version = config.release.version
  json.identifier = config.product.identifier
  if (json.app?.windows?.[0]) {
    json.app.windows[0].title = config.product.desktopProductName
  }
  writeJson(TAURI_CONF_PATH, json)
}

function replaceTomlField(raw, field, value) {
  const pattern = new RegExp(`^${field}\\s*=\\s*.*$`, 'm')
  if (!pattern.test(raw)) {
    throw new Error(`Cargo.toml missing package.${field}`)
  }
  return raw.replace(pattern, `${field} = ${value}`)
}

function syncCargoToml(config) {
  if (!existsSync(CARGO_TOML_PATH)) return
  let raw = readFileSync(CARGO_TOML_PATH, 'utf-8')
  raw = replaceTomlField(raw, 'version', JSON.stringify(config.release.version))
  raw = replaceTomlField(raw, 'description', JSON.stringify(config.product.description))
  raw = replaceTomlField(raw, 'authors', `[${JSON.stringify(config.product.author)}]`)
  writeFileSync(CARGO_TOML_PATH, raw, 'utf-8')
}

function syncReleaseManifest(config) {
  if (!existsSync(RELEASE_MANIFEST_PATH)) return
  const json = readJson(RELEASE_MANIFEST_PATH)
  json['.'] = config.release.version
  writeJson(RELEASE_MANIFEST_PATH, json)
}

function syncGovernanceVersion(config) {
  const json = readJson(GOVERNANCE_VERSION_PATH)
  json.policyVersion = config.governance.policyVersion
  json.governancePhase = config.governance.phase
  writeJson(GOVERNANCE_VERSION_PATH, json)
}

function sync(config) {
  syncRootPackage(config)
  syncWorkspacePackages(config)
  syncBrand(config)
  syncTauriConfig(config)
  syncCargoToml(config)
  syncReleaseManifest(config)
  syncGovernanceVersion(config)
}

function row(file, field, expected, actual) {
  return {
    file,
    field,
    expected,
    actual,
    status: actual === expected ? 'ok' : 'out-of-sync',
  }
}

function readBrandValue(name) {
  if (!existsSync(BRAND_PATH)) return undefined
  const raw = readFileSync(BRAND_PATH, 'utf-8')
  const match = raw.match(new RegExp(`${name}:\\s*(['"])(.*?)\\1`))
  return match?.[2]
}

function desktopHtmlPlaceholderStatus(pattern) {
  if (!existsSync(DESKTOP_INDEX_PATH)) return 'missing file'
  const raw = readFileSync(DESKTOP_INDEX_PATH, 'utf-8')
  return pattern.test(raw) ? 'template placeholder' : 'missing placeholder'
}

function doctorRows(config) {
  const rows = []
  const rootPackage = readJson(ROOT_PACKAGE_PATH)
  rows.push(row('package.json', 'name', config.product.packageName, rootPackage.name))
  rows.push(row('package.json', 'version', config.release.version, rootPackage.version))
  rows.push(row('package.json', 'description', config.product.description, rootPackage.description))
  rows.push(row('package.json', 'author', config.product.author, rootPackage.author))
  rows.push(row('package.json', 'license', config.product.license, rootPackage.license))
  rows.push(row('package.json', 'homepage', config.product.homepage, rootPackage.homepage))
  rows.push(
    row(
      'package.json',
      'keywords',
      JSON.stringify(config.product.keywords),
      JSON.stringify(rootPackage.keywords)
    )
  )

  rows.push(
    row(
      'apps/web-demo/src/constants/brand.ts',
      'name',
      config.product.packageName,
      readBrandValue('name')
    )
  )
  rows.push(
    row(
      'apps/web-demo/src/constants/brand.ts',
      'displayName',
      config.product.displayName,
      readBrandValue('displayName')
    )
  )
  rows.push(
    row('apps/web-demo/src/constants/brand.ts', 'subtitle', 'Platform', readBrandValue('subtitle'))
  )
  rows.push(
    row(
      'apps/web-demo/src/constants/brand.ts',
      'description',
      config.product.description,
      readBrandValue('description')
    )
  )
  rows.push(
    row(
      'apps/web-demo/src/constants/brand.ts',
      'slogan',
      'Self-protecting deterministic multi-runtime platform architecture',
      readBrandValue('slogan')
    )
  )
  rows.push(
    row(
      'apps/web-demo/src/constants/brand.ts',
      'author',
      config.product.author,
      readBrandValue('author')
    )
  )
  rows.push(
    row(
      'apps/desktop/index.html',
      'title',
      'template placeholder',
      desktopHtmlPlaceholderStatus(/<title>\s*%DESKTOP_PRODUCT_NAME%\s*<\/title>/)
    )
  )
  rows.push(
    row(
      'apps/desktop/index.html',
      'meta.description',
      'template placeholder',
      desktopHtmlPlaceholderStatus(
        /<meta\b(?=[^>]*\bname="description")(?=[^>]*\bcontent="%PRODUCT_DESCRIPTION%")[^>]*\/>/
      )
    )
  )
  rows.push(
    row(
      'apps/desktop/index.html',
      'meta.author',
      'template placeholder',
      desktopHtmlPlaceholderStatus(
        /<meta\b(?=[^>]*\bname="author")(?=[^>]*\bcontent="%PRODUCT_AUTHOR%")[^>]*\/>/
      )
    )
  )

  for (const packagePath of packageManifestPaths()) {
    if (packagePath === ROOT_PACKAGE_PATH) continue
    const packageJson = readJson(packagePath)
    rows.push(
      row(relative(ROOT, packagePath), 'version', config.release.version, packageJson.version)
    )
  }

  if (existsSync(TAURI_CONF_PATH)) {
    const tauri = readJson(TAURI_CONF_PATH)
    rows.push(
      row(
        'apps/desktop/src-tauri/tauri.conf.json',
        'productName',
        config.product.desktopProductName,
        tauri.productName
      )
    )
    rows.push(
      row(
        'apps/desktop/src-tauri/tauri.conf.json',
        'version',
        config.release.version,
        tauri.version
      )
    )
    rows.push(
      row(
        'apps/desktop/src-tauri/tauri.conf.json',
        'identifier',
        config.product.identifier,
        tauri.identifier
      )
    )
    rows.push(
      row(
        'apps/desktop/src-tauri/tauri.conf.json',
        'app.windows[0].title',
        config.product.desktopProductName,
        tauri.app?.windows?.[0]?.title
      )
    )
  }

  if (existsSync(CARGO_TOML_PATH)) {
    const cargo = readFileSync(CARGO_TOML_PATH, 'utf-8')
    rows.push(
      row(
        'apps/desktop/src-tauri/Cargo.toml',
        'package.version',
        config.release.version,
        cargo.match(/^version\s*=\s*"([^"]*)"/m)?.[1]
      )
    )
    rows.push(
      row(
        'apps/desktop/src-tauri/Cargo.toml',
        'package.description',
        config.product.description,
        cargo.match(/^description\s*=\s*"([^"]*)"/m)?.[1]
      )
    )
    rows.push(
      row(
        'apps/desktop/src-tauri/Cargo.toml',
        'package.authors',
        JSON.stringify([config.product.author]),
        JSON.stringify(cargo.match(/^authors\s*=\s*\["([^"]*)"\]/m)?.slice(1) ?? [])
      )
    )
  }

  if (existsSync(RELEASE_MANIFEST_PATH)) {
    const releaseManifest = readJson(RELEASE_MANIFEST_PATH)
    rows.push(
      row('.release-please-manifest.json', '.', config.release.version, releaseManifest['.'])
    )
  }

  const governanceVersion = readJson(GOVERNANCE_VERSION_PATH)
  rows.push(
    row(
      '.ai/governance/policies/version.json',
      'policyVersion',
      config.governance.policyVersion,
      governanceVersion.policyVersion
    )
  )
  rows.push(
    row(
      '.ai/governance/policies/version.json',
      'governancePhase',
      config.governance.phase,
      governanceVersion.governancePhase
    )
  )

  return rows
}

function printRows(rows) {
  const columns = ['file', 'field', 'expected', 'actual', 'status']
  const widths = Object.fromEntries(
    columns.map(column => [
      column,
      Math.max(column.length, ...rows.map(item => String(item[column] ?? '').length)),
    ])
  )
  console.log(columns.map(column => column.padEnd(widths[column])).join(' | '))
  console.log(columns.map(column => '-'.repeat(widths[column])).join('-|-'))
  for (const item of rows) {
    console.log(
      columns.map(column => String(item[column] ?? '').padEnd(widths[column])).join(' | ')
    )
  }
}

function main() {
  const command = process.argv[2]
  if (!COMMANDS.has(command)) {
    console.error('Usage: node scripts/project-config.mjs <print|validate|sync|doctor>')
    process.exit(1)
  }

  try {
    const config = readConfig()
    if (command === 'print') {
      console.log(JSON.stringify(config, null, 2))
      return
    }
    if (command === 'validate') {
      console.log('project.config.json is valid')
      return
    }
    if (command === 'sync') {
      sync(config)
      console.log(`Project metadata synced to ${config.release.version}`)
      return
    }
    if (command === 'doctor') {
      const rows = doctorRows(config)
      printRows(rows)
      if (rows.some(item => item.status !== 'ok')) {
        process.exit(1)
      }
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

main()
