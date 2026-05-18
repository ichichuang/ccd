#!/usr/bin/env node
import process from 'node:process'
import { activeRuntimeProfile, canonicalProvider, codexConfigProvider, expectedTransportForProvider, firstLine, loadRuntimeProfile, parseArgs, run, writeExecutionSession } from './execution-utils.mjs'

const args = parseArgs()
const task = args.task ?? args._.join(' ')
if (!task) {
  console.error('[FAIL] missing task')
  process.exit(2)
}

const profile = args.profile ?? activeRuntimeProfile()
const strictProfile = process.env.STRICT_RUNTIME_PROFILE ?? null
const provider = canonicalProvider()
const transport = codexConfigProvider()
const runtimeProfile = loadRuntimeProfile(process.cwd(), profile)

const fail = message => {
  console.error(`[FAIL] ${message}`)
  process.exit(1)
}

if (strictProfile && strictProfile !== profile) fail(`profile mismatch: ${profile} != STRICT_RUNTIME_PROFILE=${strictProfile}`)
if (!provider) fail('ACTIVE_CODEX_PROVIDER unresolved')
if (!transport) fail('execute transport unresolved')
if (runtimeProfile && runtimeProfile.profile !== profile) fail(`runtime profile identity mismatch: ${runtimeProfile.profile} != ${profile}`)

const expectedTransport = expectedTransportForProvider(provider)
if (expectedTransport && transport !== expectedTransport) fail(`provider transport mismatch: ${provider} expects ${expectedTransport}, got ${transport}`)
if (!expectedTransport) fail(`provider transport mapping unresolved for ${provider}`)

const env = {
  ...process.env,
  ACTIVE_RUNTIME_PROFILE: profile,
  ACTIVE_CODEX_PROVIDER: provider,
}
if (strictProfile) env.STRICT_RUNTIME_PROFILE = strictProfile

const runtimeCheckArgs = ['scripts/runtime/provider-transport-validate.mjs']
const transportCheck = run(process.execPath, runtimeCheckArgs, { env })
if (transportCheck.status !== 0) fail(`provider transport validation failed: ${firstLine(transportCheck)}`)

writeExecutionSession(process.cwd(), { provider, runtimeProfile: profile, routingProfile: args.codexProfile ?? null })
const codexArgs = ['--cwd', process.cwd(), '--json']
if (args['no-cache']) codexArgs.push('--no-cache')
if (args['no-ephemeral']) codexArgs.push('--no-ephemeral')
if (args.codexProfile) codexArgs.push('--profile', args.codexProfile)
codexArgs.push(task)

const result = run('/Users/cc/.codex/bin/codex-token', codexArgs, { env })
process.stdout.write(result.stdout)
process.stderr.write(result.stderr)
process.exit(result.status ?? 1)
