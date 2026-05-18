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
checkSpawnedTool('node', ['-v'], expectedNodeVersion)
checkSpawnedTool('pnpm', ['-v'], expectedPnpmVersion)
checkShellTool('node', expectedNodeVersion)
checkShellTool('pnpm', expectedPnpmVersion)
checkRuntimeScript('scripts/env.sh')
checkRuntimeScript('scripts/exec.sh')
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
