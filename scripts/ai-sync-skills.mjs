#!/usr/bin/env node

import path from 'node:path'
import os from 'node:os'
import process from 'node:process'
import {
  SkillSyncError,
  assertNoTraversalOverride,
  canonicalSyncJson,
  renderSyncReport,
  syncSkills,
} from './skill-sync-engine.mjs'

const parseArgs = argv => {
  const parsed = { check: false, json: false, codexTargetRoot: null, claudeProjectRoot: null }
  const seen = new Set()
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (argument === '--') continue
    if (argument === '--check' || argument === '--json') {
      if (seen.has(argument))
        throw new SkillSyncError('CLI_ARGUMENT_ERROR', 'Repeated argument: ' + argument)
      seen.add(argument)
      parsed[argument === '--check' ? 'check' : 'json'] = true
      continue
    }
    if (!['--codex-target-root', '--claude-project-root'].includes(argument))
      throw new SkillSyncError('CLI_ARGUMENT_ERROR', 'Unknown combined sync argument: ' + argument)
    if (seen.has(argument))
      throw new SkillSyncError('CLI_ARGUMENT_ERROR', 'Repeated argument: ' + argument)
    const value = argv[index + 1]
    if (!value || value.startsWith('--'))
      throw new SkillSyncError('CLI_ARGUMENT_ERROR', 'Missing value for ' + argument)
    seen.add(argument)
    index += 1
    if (argument === '--codex-target-root') parsed.codexTargetRoot = value
    else parsed.claudeProjectRoot = value
  }
  if (Boolean(parsed.codexTargetRoot) !== Boolean(parsed.claudeProjectRoot))
    throw new SkillSyncError(
      'ISOLATED_ROOT_REQUIRED',
      'Combined isolated overrides must be supplied together'
    )
  const overrides = {}
  if (parsed.codexTargetRoot) {
    assertNoTraversalOverride(parsed.codexTargetRoot)
    assertNoTraversalOverride(parsed.claudeProjectRoot)
    overrides.codexTargetRoot = path.resolve(parsed.codexTargetRoot)
    overrides.claudeProjectRoot = path.resolve(parsed.claudeProjectRoot)
    if (overrides.claudeProjectRoot === path.resolve(os.homedir()))
      throw new SkillSyncError(
        'REAL_HOME_TARGET_FORBIDDEN',
        'Combined sync must not target the personal Claude HOME copy'
      )
  }
  return { ...parsed, mode: parsed.check ? 'check' : 'apply', overrides }
}
const exitCode = report =>
  report.status === 'drift'
    ? 1
    : report.status === 'rejected' || report.status === 'rolled-back'
      ? 2
      : 0

try {
  const args = parseArgs(process.argv.slice(2))
  const report = syncSkills({
    repoRoot: process.cwd(),
    clients: ['claude', 'codex'],
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
    clients: ['claude', 'codex'],
    managedSkills: [],
    changes: [],
    preserved: [],
    rollbacks: [],
    diagnostics: [
      { severity: 'error', code, message: code, client: null, skillId: null, target: null },
    ],
  }
  if (process.argv.includes('--json')) process.stdout.write(canonicalSyncJson(report))
  else process.stderr.write(code + ': ' + report.diagnostics[0].message + '\n')
  process.exitCode = 2
}
