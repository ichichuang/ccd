#!/usr/bin/env node
import { activeRuntimeProfile, cacheStats, canonicalProvider, codexTransportAlignment, loadOrchestration, parseArgs, run, outputOf, writeExecutionSession } from '../runtime/execution-utils.mjs'

const args = parseArgs()
const task = args.task ?? (args._.join(' ') || 'AI OS governance runtime orchestration provider topology migration')
const noExecute = run('/Users/cc/.codex/bin/codex-token', ['--cwd', process.cwd(), '--no-execute', '--json', task])
const noExecuteState = noExecute.status === 0 ? JSON.parse(noExecute.stdout) : null
const fingerprint = writeExecutionSession(process.cwd(), {
  provider: canonicalProvider(),
  runtimeProfile: activeRuntimeProfile(),
  routingProfile: noExecuteState?.profile ?? null,
})
const transport = codexTransportAlignment()

console.log(JSON.stringify({
  providerIdentity: canonicalProvider(),
  executeTransport: transport.transport ?? 'unresolved',
  expectedTransport: transport.expectedTransport,
  transportAligned: transport.aligned,
  cacheSource: cacheStats(),
  activeProfile: activeRuntimeProfile(),
  routingClassification: noExecuteState?.task_type ?? null,
  routingProfile: noExecuteState?.profile ?? null,
  orchestrationState: {
    roleCount: Array.isArray(loadOrchestration().roles) ? loadOrchestration().roles.length : 0,
    hasDelegation: Boolean(loadOrchestration().delegation),
  },
  executionFingerprint: fingerprint.fingerprint,
  executionTimestamp: new Date().toISOString(),
  error: noExecute.status === 0 ? null : outputOf(noExecute),
}, null, 2))
