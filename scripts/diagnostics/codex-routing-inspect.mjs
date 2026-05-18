#!/usr/bin/env node
import { parseArgs, run, outputOf } from '../runtime/execution-utils.mjs'

const args = parseArgs()
const task = args.task ?? (args._.join(' ') || 'AI OS governance runtime orchestration provider topology migration')
const result = run('/Users/cc/.codex/bin/codex-token', ['--cwd', process.cwd(), '--no-execute', '--json', task])
const parsed = result.status === 0 ? JSON.parse(result.stdout) : null
console.log(JSON.stringify({
  activeProfile: parsed?.profile ?? null,
  routingClassification: parsed?.task_type ?? null,
  routingState: parsed,
  error: result.status === 0 ? null : outputOf(result),
  timestamp: new Date().toISOString(),
}, null, 2))
