#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { activeRuntimeProfile, cacheStats, canonicalProvider, parseArgs, resultCachePath, sha256, tokenCacheDir, writeJson } from './execution-utils.mjs'

const args = parseArgs()
const action = args._[0] ?? (args.purge ? 'purge' : args.fingerprint ? 'fingerprint' : 'inspect')
const namespace = sha256(JSON.stringify({ provider: canonicalProvider(), runtimeProfile: activeRuntimeProfile() }))
const fingerprintPath = path.join(tokenCacheDir, 'cache-fingerprint.json')

if (action === 'purge') {
  fs.rmSync(resultCachePath, { force: true })
  writeJson(fingerprintPath, {
    namespace,
    provider: canonicalProvider(),
    runtimeProfile: activeRuntimeProfile(),
    purgedAt: new Date().toISOString(),
  })
  console.log(`[OK] purged codex result cache for namespace ${namespace}`)
  process.exit(0)
}

const data = {
  namespace,
  provider: canonicalProvider(),
  runtimeProfile: activeRuntimeProfile(),
  cache: cacheStats(),
  timestamp: new Date().toISOString(),
}

if (action === 'fingerprint') {
  writeJson(fingerprintPath, data)
}

console.log(JSON.stringify(data, null, 2))
