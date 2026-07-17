#!/usr/bin/env node

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
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
  const args = parseSyncArgs(process.argv.slice(2), { client: 'claude' })
  const report = syncSkills({
    repoRoot: process.cwd(),
    clients: ['claude'],
    overrides: args.overrides,
    mode: args.mode,
  })
  const personalShadow = path.join(os.homedir(), '.claude', 'skills', 'project-ui')
  const target = args.overrides.claudeTargetRoot
  if (path.resolve(personalShadow) !== path.resolve(target) && fs.existsSync(personalShadow))
    report.diagnostics.push({
      severity: 'warning',
      code: 'PERSONAL_CLAUDE_SHADOWS_PROJECT',
      message: 'A personal noncanonical project-ui copy may shadow the repository-local target.',
      client: 'claude',
      skillId: 'project-ui',
      target: 'claude/project-ui',
    })
  if (report.status === 'updated')
    report.diagnostics.push({
      severity: 'info',
      code: 'CLAUDE_RESTART_REQUIRED',
      message: 'Restart Claude to load the synchronized noncanonical runtime copy.',
      client: 'claude',
      skillId: 'project-ui',
      target: 'claude/project-ui',
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
    clients: ['claude'],
    managedSkills: [],
    changes: [],
    preserved: [],
    rollbacks: [],
    diagnostics: [
      { severity: 'error', code, message: code, client: 'claude', skillId: null, target: null },
    ],
  }
  if (process.argv.includes('--json')) process.stdout.write(canonicalSyncJson(report))
  else process.stderr.write(code + ': ' + report.diagnostics[0].message + '\n')
  process.exitCode = 2
}
