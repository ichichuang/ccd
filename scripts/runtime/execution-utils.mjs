import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'

export const cwd = process.cwd()
export const codexHome = path.resolve(process.env.CODEX_HOME ?? path.join(os.homedir(), '.codex'))
export const tokenCacheDir = path.join(codexHome, 'cache', 'token-pipeline')
export const resultCachePath = path.join(tokenCacheDir, 'result_cache.json')
export const fileCachePath = path.join(tokenCacheDir, 'file_cache.json')
export const memoryPath = path.join(tokenCacheDir, 'memory.json')
export const aiContextPath = '/Users/cc/AI-Research-OS/AI_CONTEXT.md'

export function readJson(filePath, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch {
    return fallback
  }
}

export function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

export function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
}

export function hashFile(filePath) {
  if (!fs.existsSync(filePath)) return null
  return sha256(fs.readFileSync(filePath))
}

export function run(command, args, options = {}) {
  return spawnSync(command, args, {
    cwd: options.cwd ?? cwd,
    encoding: 'utf8',
    stdio: 'pipe',
    env: options.env ?? process.env,
  })
}

export function outputOf(result) {
  return [result.stdout, result.stderr].filter(Boolean).join('\n').trim()
}

export function firstLine(result) {
  return outputOf(result).split('\n').find(Boolean) ?? ''
}

export function parseArgs(argv = process.argv.slice(2)) {
  const parsed = { _: [] }
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (!arg.startsWith('--')) {
      parsed._.push(arg)
      continue
    }
    const [key, inlineValue] = arg.slice(2).split('=')
    if (inlineValue !== undefined) {
      parsed[key] = inlineValue
      continue
    }
    const next = argv[index + 1]
    if (next && !next.startsWith('--')) {
      parsed[key] = next
      index += 1
    } else {
      parsed[key] = true
    }
  }
  return parsed
}

export function currentBranch(repo = cwd) {
  const result = run('git', ['branch', '--show-current'], { cwd: repo })
  return result.status === 0 ? result.stdout.trim() : 'unknown'
}

export function gitRoot(repo = cwd) {
  const result = run('git', ['rev-parse', '--show-toplevel'], { cwd: repo })
  return result.status === 0 && result.stdout.trim() ? result.stdout.trim() : repo
}

export function loadProtocolVersion(repo = cwd) {
  return readJson(path.join(repo, '.ai/protocol/version.json'), {})
}

export function loadOrchestration(repo = cwd) {
  return readJson(path.join(repo, '.ai/orchestration/manifest.json'), {})
}

export function canonicalProvider() {
  const envProvider = process.env.ACTIVE_CODEX_PROVIDER
  if (envProvider) return envProvider
  if (!fs.existsSync(aiContextPath)) return null
  const text = fs.readFileSync(aiContextPath, 'utf8')
  return text.match(/ACTIVE_CODEX_PROVIDER:\s*`([^`]+)`/)?.[1] ?? null
}

export function codexConfigProvider() {
  const configPath = path.join(codexHome, 'config.toml')
  if (!fs.existsSync(configPath)) return null
  const text = fs.readFileSync(configPath, 'utf8')
  return text.match(/^model_provider\s*=\s*"([^"]+)"/m)?.[1] ?? null
}

export function expectedTransportForProvider(provider) {
  const transportMap = {
    'remote-moacode': 'apirouter',
    'packy-local': 'packyapi',
  }
  return provider ? transportMap[provider] ?? null : null
}

export function codexTransportAlignment() {
  const provider = canonicalProvider()
  const transport = codexConfigProvider()
  const expectedTransport = expectedTransportForProvider(provider)
  return {
    provider,
    transport,
    expectedTransport,
    aligned: Boolean(expectedTransport && transport === expectedTransport),
  }
}

export function activeRuntimeProfile() {
  return process.env.ACTIVE_RUNTIME_PROFILE ?? process.env.STRICT_RUNTIME_PROFILE ?? 'local'
}

export function profilePath(repo = cwd, profile = activeRuntimeProfile()) {
  return path.join(repo, '.ai/runtime-profile', profile, 'profile.json')
}

export function loadRuntimeProfile(repo = cwd, profile = activeRuntimeProfile()) {
  return readJson(profilePath(repo, profile), null)
}

export function cacheStats() {
  const resultCache = readJson(resultCachePath, {}) ?? {}
  const fileCache = readJson(fileCachePath, {}) ?? {}
  const memory = readJson(memoryPath, {}) ?? {}
  return {
    tokenCacheDir,
    resultCacheExists: fs.existsSync(resultCachePath),
    resultCacheEntries: Object.keys(resultCache).length,
    fileCacheEntries: Object.keys(fileCache).length,
    memoryRoots: Object.keys(memory).length,
    resultCacheHash: hashFile(resultCachePath),
    fileCacheHash: hashFile(fileCachePath),
  }
}

export function executionFingerprint(repo = cwd, options = {}) {
  const provider = options.provider ?? canonicalProvider()
  const runtimeProfile = options.runtimeProfile ?? activeRuntimeProfile()
  const protocolVersion = loadProtocolVersion(repo)
  const orchestration = loadOrchestration(repo)
  const routingProfile = options.routingProfile ?? null
  const payload = {
    provider,
    transport: codexConfigProvider(),
    expectedTransport: expectedTransportForProvider(provider),
    runtimeProfile,
    protocolVersion,
    orchestrationHash: sha256(JSON.stringify(orchestration)),
    routingProfile,
  }
  return { ...payload, fingerprint: sha256(JSON.stringify(payload)) }
}

export function writeExecutionSession(repo = cwd, options = {}) {
  const executionDir = path.join(repo, '.ai/execution')
  const fingerprint = executionFingerprint(repo, options)
  const timestamp = new Date().toISOString()
  writeJson(path.join(executionDir, 'execution-fingerprint.json'), { ...fingerprint, timestamp })
  writeJson(path.join(executionDir, 'provider-session.json'), {
    provider: fingerprint.provider,
    configProvider: codexConfigProvider(),
    expectedTransport: fingerprint.expectedTransport,
    canonicalSource: aiContextPath,
    timestamp,
  })
  writeJson(path.join(executionDir, 'runtime-session.json'), {
    runtimeProfile: fingerprint.runtimeProfile,
    strictRuntimeProfile: process.env.STRICT_RUNTIME_PROFILE ?? null,
    activeRuntimeProfile: process.env.ACTIVE_RUNTIME_PROFILE ?? null,
    timestamp,
  })
  return fingerprint
}
