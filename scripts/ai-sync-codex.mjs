#!/usr/bin/env node

import process from 'node:process'
import {
  SkillSyncError,
  canonicalSyncJson,
  parseSyncArgs,
  renderSyncReport,
  syncSkills,
} from './skill-sync-engine.mjs'

const exitCode = report =>
  report.status === 'drift'
    ? 1
    : report.status === 'rejected' || report.status === 'rolled-back'
      ? 2
      : 0

try {
  const args = parseSyncArgs(process.argv.slice(2), { client: 'codex' })
  const report = syncSkills({
    repoRoot: process.cwd(),
    clients: ['codex'],
    overrides: args.overrides,
    mode: args.mode,
  })
  process.stdout.write(renderSyncReport(report, args.json))
  process.exitCode = exitCode(report)
} catch (error) {
  const code = error instanceof SkillSyncError ? error.code : 'UNEXPECTED_SYNC_FAILURE'
  const report = {
    reportVersion: 1,
    mode: process.argv.includes('--check') ? 'check' : 'apply',
    status: 'rejected',
    transactionId: null,
    clients: ['codex'],
    managedSkills: [],
    changes: [],
    preserved: [],
    rollbacks: [],
    diagnostics: [
      { severity: 'error', code, message: code, client: 'codex', skillId: null, target: null },
    ],
  }
  if (process.argv.includes('--json')) process.stdout.write(canonicalSyncJson(report))
  else process.stderr.write(code + ': ' + report.diagnostics[0].message + '\n')
  process.exitCode = 2
}
