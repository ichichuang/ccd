#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'

const cwd = process.cwd()
const strict = process.argv.includes('--strict')
const requireMise = process.argv.includes('--require-mise') || process.env.CCD_RUNTIME_REQUIRE_MISE === '1'
const home = os.homedir()
const shell = fs.existsSync(process.env.SHELL ?? '')
  ? process.env.SHELL
  : fs.existsSync('/bin/zsh')
    ? '/bin/zsh'
    : '/bin/sh'

let failed = false
let warningCount = 0

const fail = message => {
  failed = true
  console.log(`[FAIL] ${message}`)
}

const warn = message => {
  warningCount += 1
  console.log(`[WARN] ${message}`)
}

const ok = message => console.log(`[OK] ${message}`)

const readText = relPath => fs.readFileSync(path.join(cwd, relPath), 'utf8')

const stripEnvValue = value => {
  const trimmed = value.trim()
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1)
  }
  return trimmed
}

const readEnvFile = relPath => {
  const absolutePath = path.join(cwd, relPath)
  if (!fs.existsSync(absolutePath)) return null

  const values = new Map()
  readText(relPath)
    .split(/\r?\n/)
    .forEach(line => {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) return

      const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
      if (!match) return
      values.set(match[1], stripEnvValue(match[2]))
    })

  return values
}

const readJson = relPath => JSON.parse(readText(relPath))

const mergeEnvFiles = relPaths => {
  const values = new Map()
  const missing = []

  relPaths.forEach(relPath => {
    const envValues = readEnvFile(relPath)
    if (!envValues) {
      missing.push(relPath)
      return
    }

    envValues.forEach((value, key) => values.set(key, value))
  })

  return { values, missing }
}

const getEnvValue = (values, key) => values.get(key)?.trim() ?? ''

const isHttpUrl = value => {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

const isPublicPath = value => {
  if (isHttpUrl(value)) return value.endsWith('/')
  return value.startsWith('/') && value.endsWith('/')
}

const isPositiveIntegerString = value => /^\d+$/.test(value) && Number(value) > 0

const isPortString = value => {
  if (!isPositiveIntegerString(value)) return false
  const port = Number(value)
  return port >= 1 && port <= 65_535
}

const storagePrefixPattern = /^[A-Za-z0-9:_-]{3,80}$/
const compressionModes = new Set(['none', 'gzip', 'brotli', 'both'])
const routerModes = new Set(['history', 'hash'])
const appEnvironments = new Set(['development', 'production'])

const run = (command, args, options = {}) =>
  spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    stdio: 'pipe',
    env: process.env,
    ...options,
  })

const runShell = (mode, command) => {
  const flag = mode === 'interactive' ? '-ic' : '-lc'
  return run(shell, [flag, command])
}

const outputOf = result => [result.stdout, result.stderr].filter(Boolean).join('\n').trim()

const summarize = result => {
  const output = outputOf(result)
  if (!output) return `exit ${result.status ?? 'unknown'}`
  return output.split('\n').find(Boolean)?.slice(0, 180) ?? `exit ${result.status ?? 'unknown'}`
}

const parseVersion = value => {
  const match = value.match(/v?(\d+)\.(\d+)\.(\d+)/)
  if (!match) return null
  return match.slice(1).map(Number)
}

const compareVersions = (left, right) => {
  for (let index = 0; index < 3; index += 1) {
    if (left[index] > right[index]) return 1
    if (left[index] < right[index]) return -1
  }
  return 0
}

const versionAtLeast = (actual, expected) => {
  const actualParts = parseVersion(actual)
  const expectedParts = parseVersion(expected)
  if (!actualParts || !expectedParts) return false
  return compareVersions(actualParts, expectedParts) >= 0
}

const readMiseToolVersion = tool => {
  const relPath = 'mise.toml'
  if (!fs.existsSync(path.join(cwd, relPath))) return null
  const pattern = new RegExp(`^${tool}\\s*=\\s*["']([^"']+)["']`, 'm')
  return readText(relPath).match(pattern)?.[1] ?? null
}

const packageJson = JSON.parse(readText('package.json'))
const expectedNodeVersion =
  readMiseToolVersion('node') ?? packageJson.engines?.node?.match(/\d+\.\d+\.\d+/)?.[0]
const expectedPnpmVersion =
  readMiseToolVersion('pnpm') ?? packageJson.packageManager?.match(/^pnpm@(.+)$/)?.[1]
const expectedMiseNodeBin = expectedNodeVersion
  ? path.join(home, '.local', 'share', 'mise', 'installs', 'node', expectedNodeVersion, 'bin')
  : null

const checkSpawnedTool = (name, args, expectedVersion) => {
  const result = run(name, args)
  if (result.status !== 0) {
    fail(`${name} direct spawn failed: ${summarize(result)}`)
    return
  }

  const version = outputOf(result)
  if (expectedVersion && !versionAtLeast(version, expectedVersion)) {
    fail(`${name} version ${version} is below expected ${expectedVersion}`)
    return
  }

  ok(`${name} direct spawn: ${version}`)
}

const isFunctionBinding = (name, result) => {
  const output = outputOf(result)
  return (
    output.includes(`${name} is a function`) ||
    output.includes(`${name} is a shell function`) ||
    new RegExp(`${name}\\s*\\(\\)\\s*\\{`).test(output)
  )
}

const inspectShellBinding = mode => {
  const nodeType = runShell(mode, 'type node')
  const pnpmType = runShell(mode, 'type pnpm')
  const nodeIsFunction = isFunctionBinding('node', nodeType)
  const pnpmIsFunction = isFunctionBinding('pnpm', pnpmType)
  const label = mode === 'interactive' ? 'interactive shell' : 'non-interactive shell'

  if (!nodeIsFunction && !pnpmIsFunction) {
    ok(`${label} node/pnpm bindings are not shell functions`)
    return
  }

  const tools = [
    nodeIsFunction ? 'node' : null,
    pnpmIsFunction ? 'pnpm' : null,
  ].filter(Boolean).join(', ')

  fail(`${label} has ${tools} function wrapper; binary bindings are required`)
}

const checkShellTool = (name, expectedVersion) => {
  const result = runShell('non-interactive', `${name} -v`)
  if (result.status !== 0) {
    fail(`non-interactive shell ${name} failed: ${summarize(result)}`)
    return
  }

  const version = outputOf(result)
  if (expectedVersion && !versionAtLeast(version, expectedVersion)) {
    fail(`non-interactive shell ${name} version ${version} is below expected ${expectedVersion}`)
    return
  }

  ok(`non-interactive shell ${name}: ${version}`)
}

const checkRuntimeScript = relPath => {
  if (!fs.existsSync(path.join(cwd, relPath))) {
    fail(`missing runtime script: ${relPath}`)
    return
  }

  ok(`runtime script: ${relPath}`)
}

const checkDemoModeEnvDefaults = () => {
  const envFiles = ['.env', '.env.development', '.env.production', '.env.analyze']
  const booleanKeys = ['VITE_DEMO_MOCK_ENABLED', 'VITE_PUBLIC_DEMO_ENABLED']

  envFiles.forEach(relPath => {
    const values = readEnvFile(relPath)
    if (!values) return

    booleanKeys.forEach(key => {
      const value = values.get(key)
      if (value !== undefined && value !== 'true' && value !== 'false') {
        fail(`${relPath} ${key} must be true or false`)
      }
    })
  })

  const productionEnv = readEnvFile('.env.production')
  if (!productionEnv) {
    warn('.env.production missing; production demo/mock default could not be checked')
    return
  }

  const publicDemoEnabled = productionEnv.get('VITE_PUBLIC_DEMO_ENABLED') === 'true'
  const legacyDemoMockEnabled = productionEnv.get('VITE_DEMO_MOCK_ENABLED') === 'true'

  if (legacyDemoMockEnabled && !publicDemoEnabled) {
    fail(
      '.env.production enables VITE_DEMO_MOCK_ENABLED without VITE_PUBLIC_DEMO_ENABLED=true'
    )
    return
  }

  if (publicDemoEnabled) {
    warn('.env.production explicitly enables public demo mode')
    return
  }

  ok('production demo/mock defaults require explicit public demo opt-in')
}

const collectViteEnvProfileIssues = ({ name, files, expectedAppEnv }) => {
  const { values, missing } = mergeEnvFiles(files)
  const issues = []

  missing.forEach(relPath => issues.push(`missing env file ${relPath}`))

  const requiredKeys = [
    'VITE_PORT',
    'VITE_DESKTOP_PORT',
    'VITE_PUBLIC_PATH',
    'VITE_ROUTER_MODE',
    'VITE_COMPRESSION',
    'VITE_API_BASE_URL',
    'VITE_APP_ENV',
    'VITE_PINIA_PERSIST_KEY_PREFIX',
    'VITE_ROOT_REDIRECT',
    'VITE_API_TIMEOUT',
    'VITE_PROXY_TIMEOUT',
  ]

  requiredKeys.forEach(key => {
    if (!values.has(key) || getEnvValue(values, key) === '') {
      issues.push(`${key} is required`)
    }
  })

  const port = getEnvValue(values, 'VITE_PORT')
  if (port && !isPortString(port)) {
    issues.push('VITE_PORT must be an integer between 1 and 65535')
  }

  const desktopPort = getEnvValue(values, 'VITE_DESKTOP_PORT')
  if (desktopPort && !isPortString(desktopPort)) {
    issues.push('VITE_DESKTOP_PORT must be an integer between 1 and 65535')
  }

  const publicPath = getEnvValue(values, 'VITE_PUBLIC_PATH')
  if (publicPath && !isPublicPath(publicPath)) {
    issues.push('VITE_PUBLIC_PATH must be /, a root-relative path ending in /, or an http(s) URL ending in /')
  }

  const routerMode = getEnvValue(values, 'VITE_ROUTER_MODE')
  if (routerMode && !routerModes.has(routerMode)) {
    issues.push('VITE_ROUTER_MODE must be history or hash')
  }

  const compression = getEnvValue(values, 'VITE_COMPRESSION')
  if (compression && !compressionModes.has(compression)) {
    issues.push('VITE_COMPRESSION must be one of none, gzip, brotli, both')
  }

  const apiBaseUrl = getEnvValue(values, 'VITE_API_BASE_URL')
  if (apiBaseUrl && !isHttpUrl(apiBaseUrl)) {
    issues.push('VITE_API_BASE_URL must be an absolute http(s) URL')
  }

  const appEnv = getEnvValue(values, 'VITE_APP_ENV')
  if (appEnv && !appEnvironments.has(appEnv)) {
    issues.push('VITE_APP_ENV must be development or production')
  }

  if (expectedAppEnv && appEnv && appEnv !== expectedAppEnv) {
    issues.push(`VITE_APP_ENV must be ${expectedAppEnv} for ${name}`)
  }

  const storagePrefix = getEnvValue(values, 'VITE_PINIA_PERSIST_KEY_PREFIX')
  if (storagePrefix && !storagePrefixPattern.test(storagePrefix)) {
    issues.push('VITE_PINIA_PERSIST_KEY_PREFIX must be 3-80 characters using letters, digits, colon, underscore, or hyphen')
  }

  const rootRedirect = getEnvValue(values, 'VITE_ROOT_REDIRECT')
  if (rootRedirect && !rootRedirect.startsWith('/')) {
    issues.push('VITE_ROOT_REDIRECT must be an absolute app path')
  }

  const apiTimeout = getEnvValue(values, 'VITE_API_TIMEOUT')
  const proxyTimeout = getEnvValue(values, 'VITE_PROXY_TIMEOUT')
  if (apiTimeout && !isPositiveIntegerString(apiTimeout)) {
    issues.push('VITE_API_TIMEOUT must be a positive integer in milliseconds')
  }
  if (proxyTimeout && !isPositiveIntegerString(proxyTimeout)) {
    issues.push('VITE_PROXY_TIMEOUT must be a positive integer in milliseconds')
  }
  if (
    isPositiveIntegerString(apiTimeout) &&
    isPositiveIntegerString(proxyTimeout) &&
    Number(proxyTimeout) < Number(apiTimeout)
  ) {
    issues.push('VITE_PROXY_TIMEOUT must be greater than or equal to VITE_API_TIMEOUT')
  }

  return issues
}

const checkViteEnvSchemas = () => {
  const profiles = [
    { name: 'development', files: ['.env', '.env.development'], expectedAppEnv: 'development' },
    { name: 'production', files: ['.env', '.env.production'], expectedAppEnv: 'production' },
    { name: 'analyze', files: ['.env', '.env.analyze'], expectedAppEnv: 'development' },
  ]

  profiles.forEach(profile => {
    const issues = collectViteEnvProfileIssues(profile)
    if (issues.length > 0) {
      issues.forEach(issue => fail(`${profile.name} env schema: ${issue}`))
      return
    }

    ok(`${profile.name} env schema`)
  })
}

const readDesktopEnvPort = () => {
  const { values } = mergeEnvFiles(['.env', '.env.development'])
  return Number(getEnvValue(values, 'VITE_DESKTOP_PORT'))
}

const checkDesktopEnvironmentConfig = () => {
  const viteConfig = readText('apps/desktop/vite.config.ts')
  if (!viteConfig.includes('VITE_DESKTOP_PORT') || !viteConfig.includes('loadAppViteEnv')) {
    fail('apps/desktop/vite.config.ts must load VITE_DESKTOP_PORT from the shared env files')
    return
  }

  const desktopPort = readDesktopEnvPort()
  if (!Number.isInteger(desktopPort) || desktopPort < 1 || desktopPort > 65_535) {
    fail('VITE_DESKTOP_PORT must be an integer between 1 and 65535')
    return
  }

  const tauriConfig = readJson('apps/desktop/src-tauri/tauri.conf.json')
  const buildConfig = tauriConfig?.build
  const devUrl = buildConfig?.devUrl
  const frontendDist = buildConfig?.frontendDist

  if (typeof devUrl !== 'string' || !isHttpUrl(devUrl)) {
    fail('apps/desktop/src-tauri/tauri.conf.json build.devUrl must be an absolute http(s) URL')
    return
  }

  const parsedDevUrl = new URL(devUrl)
  if (!['localhost', '127.0.0.1'].includes(parsedDevUrl.hostname)) {
    fail('desktop build.devUrl host must be localhost or 127.0.0.1')
    return
  }

  if (Number(parsedDevUrl.port) !== desktopPort) {
    fail(`desktop build.devUrl port ${parsedDevUrl.port} must match VITE_DESKTOP_PORT ${desktopPort}`)
    return
  }

  if (frontendDist !== '../dist') {
    fail('desktop build.frontendDist must remain ../dist')
    return
  }

  ok('desktop env/config schema')
}

const checkWebDemoViteCorsConfig = () => {
  const viteConfig = readText('apps/web-demo/vite.config.ts')
  const sharedConfig = readText('apps/vite.shared.ts')

  if (viteConfig.includes('cors: true')) {
    fail('apps/web-demo/vite.config.ts must not use open Vite CORS')
    return
  }

  if (!viteConfig.includes('localViteCors') || !sharedConfig.includes('localViteCors')) {
    fail('apps/web-demo/vite.config.ts must use the shared restricted local Vite CORS policy')
    return
  }

  ok('web-demo Vite CORS restricted to local origins')
}

const checkDesktopViteCorsConfig = () => {
  const viteConfig = readText('apps/desktop/vite.config.ts')
  const sharedConfig = readText('apps/vite.shared.ts')

  if (viteConfig.includes('cors: true')) {
    fail('apps/desktop/vite.config.ts must not use open Vite CORS')
    return
  }

  if (!viteConfig.includes('localViteCors') || !sharedConfig.includes('localViteCors')) {
    fail('apps/desktop/vite.config.ts must use the shared restricted local Vite CORS policy')
    return
  }

  if (!/preview:\s*\{[\s\S]*cors:\s*localViteCors/.test(viteConfig)) {
    fail('apps/desktop/vite.config.ts preview must use the shared restricted local Vite CORS policy')
    return
  }

  ok('desktop Vite CORS restricted to local origins')
}

const checkExecTool = (name, expectedVersion) => {
  const result = run('bash', ['scripts/exec.sh', name, '-v'])
  if (result.status !== 0) {
    fail(`deterministic exec ${name} failed: ${summarize(result)}`)
    return
  }

  const version = outputOf(result)
  if (expectedVersion && !versionAtLeast(version, expectedVersion)) {
    fail(`deterministic exec ${name} version ${version} is below expected ${expectedVersion}`)
    return
  }

  ok(`deterministic exec ${name}: ${version}`)
}

const checkMiseAvailability = () => {
  const result = run('bash', ['-lc', 'command -v mise'])
  if (result.status === 0) {
    ok(`mise binary: ${outputOf(result)}`)
    return
  }

  if (requireMise) {
    fail('mise is required but not available on PATH')
    return
  }

  warn('mise binary unavailable; runtime bootstrap cannot provide the pinned Node runtime')
}

const checkCorepackAvailability = () => {
  const result = run('bash', ['-lc', 'command -v corepack'])
  if (result.status === 0) {
    ok(`corepack binary: ${outputOf(result)}`)
    return
  }

  warn('corepack binary unavailable; pnpm stays on the existing pinned binary path')
}

const commandPath = name => {
  const result = run('bash', ['-lc', `command -v ${name}`])
  return result.status === 0 ? outputOf(result).split('\n')[0] : null
}

const checkPathPrecedence = (name, expectedPathFragment) => {
  const resolved = commandPath(name)
  if (!resolved) {
    fail(`${name} is not resolvable on PATH`)
    return
  }

  if (expectedPathFragment && !resolved.includes(expectedPathFragment)) {
    warn(`${name} PATH precedence resolves to ${resolved}, expected path containing ${expectedPathFragment}`)
    return
  }

  ok(`${name} PATH precedence: ${resolved}`)
}

const checkMiseActivationDrift = () => {
  if (!expectedMiseNodeBin) return
  const directNode = commandPath('node')
  const execNode = outputOf(run('bash', ['scripts/exec.sh', 'bash', '-lc', 'command -v node']))
  if (directNode && execNode && directNode !== execNode) {
    warn(`mise/runtime activation drift: direct node ${directNode}; deterministic node ${execNode}`)
    return
  }
  ok('mise/runtime activation drift not detected for node')
}

const checkShellWrapperLeakageThroughExec = () => {
  const result = run('bash', ['scripts/exec.sh', 'bash', '-lc', 'type node && type pnpm'])
  if (result.status !== 0) {
    fail(`deterministic wrapper binding inspection failed: ${summarize(result)}`)
    return
  }
  const output = outputOf(result)
  if (/node is a function|pnpm is a function/.test(output)) {
    fail('deterministic wrapper leaked node/pnpm shell functions')
    return
  }
  ok('deterministic wrapper clears node/pnpm shell function leakage')
}

console.log('CCD Environment Doctor')
console.log('======================')

if (expectedNodeVersion) ok(`expected node: ${expectedNodeVersion}`)
else warn('expected node version is not declared')

if (expectedPnpmVersion) ok(`expected pnpm: ${expectedPnpmVersion}`)
else warn('expected pnpm version is not declared')

if (expectedMiseNodeBin && process.env.PATH?.split(path.delimiter).includes(expectedMiseNodeBin)) {
  ok(`PATH includes mise node bin: ${expectedMiseNodeBin}`)
} else if (expectedMiseNodeBin) {
  warn(`PATH does not include mise node bin before runtime bootstrap: ${expectedMiseNodeBin}`)
}

checkMiseAvailability()
checkCorepackAvailability()
checkPathPrecedence('node', expectedMiseNodeBin)
checkPathPrecedence('pnpm', null)
checkMiseActivationDrift()
checkShellWrapperLeakageThroughExec()
checkSpawnedTool('node', ['-v'], expectedNodeVersion)
checkSpawnedTool('pnpm', ['-v'], expectedPnpmVersion)
checkShellTool('node', expectedNodeVersion)
checkShellTool('pnpm', expectedPnpmVersion)
checkRuntimeScript('scripts/env.sh')
checkRuntimeScript('scripts/exec.sh')
checkDemoModeEnvDefaults()
checkViteEnvSchemas()
checkDesktopEnvironmentConfig()
checkWebDemoViteCorsConfig()
checkDesktopViteCorsConfig()
checkExecTool('node', expectedNodeVersion)
checkExecTool('pnpm', expectedPnpmVersion)
inspectShellBinding('non-interactive')
inspectShellBinding('interactive')

console.log('----------------------')
if (failed) {
  console.log('Environment doctor failed.')
  process.exit(1)
}

console.log(warningCount > 0 ? `Environment doctor passed with ${warningCount} warning(s).` : 'Environment doctor passed.')
