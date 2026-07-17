#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { spawnSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'
import { format as formatWithPrettier } from 'prettier'

import {
  RoutingContractError,
  validateRoutingScopes as validateScopeRegistry,
} from '../.ai/skills/codex/task-orchestrator/scripts/skill_router.mjs'

export const RULE_INDEX_VERSION = 2
export const RULE_INDEX_PATH = '.ai/manifests/rule-index.json'
export const ROUTING_SCOPES_PATH = '.ai/manifests/routing-scopes.json'

const compareStrings = (left, right) => (left === right ? 0 : left < right ? -1 : 1)
const canonicalJson = value =>
  formatWithPrettier(JSON.stringify(value), {
    parser: 'json',
    printWidth: 100,
    tabWidth: 2,
    useTabs: false,
    endOfLine: 'lf',
  })

export class RuleIndexError extends Error {
  constructor(code, message, details = {}) {
    super(message)
    this.name = 'RuleIndexError'
    this.code = code
    this.details = details
  }
}
const fail = (code, message, details = {}) => {
  throw new RuleIndexError(code, message, details)
}
const trackedFiles = root => {
  const result = spawnSync('git', ['ls-files', '-z'], {
    cwd: root,
    encoding: 'utf8',
    stdio: 'pipe',
  })
  if (result.error || result.status !== 0)
    fail('GIT_INDEX_READ_FAILED', 'Unable to read tracked topology')
  return result.stdout.split('\0').filter(Boolean).sort(compareStrings)
}
const extractFrontmatter = content => {
  if (!content.startsWith('---')) return ''
  const end = content.indexOf('\n---', 3)
  return end < 0 ? '' : content.slice(3, end).trim()
}
const parseScalar = value => {
  const trimmed = value.trim()
  if (trimmed === 'true') return true
  if (trimmed === 'false') return false
  return trimmed.replace(/^['"]|['"]$/gu, '')
}
const parseInlineList = value => {
  const trimmed = value.trim()
  if (!trimmed.startsWith('[') || !trimmed.endsWith(']')) return null
  const quoted = Array.from(trimmed.matchAll(/(['"])(.*?)\1/gu)).map(match => match[2])
  return quoted.length > 0
    ? quoted
    : trimmed
        .slice(1, -1)
        .split(',')
        .map(item => item.trim())
        .filter(Boolean)
}
const parseFrontmatter = content => {
  const metadata = {}
  const lines = extractFrontmatter(content).split('\n')
  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(/^([A-Za-z0-9_-]+):\s*(.*)$/u)
    if (!match) continue
    const inline = parseInlineList(match[2])
    if (inline) {
      metadata[match[1]] = inline
      continue
    }
    if (match[2].trim()) {
      metadata[match[1]] = parseScalar(match[2])
      continue
    }
    const values = []
    let cursor = index + 1
    while (cursor < lines.length) {
      const item = lines[cursor].match(/^\s*-\s*(.+)$/u)
      if (!item) break
      values.push(parseScalar(item[1]))
      cursor += 1
    }
    if (values.length > 0) {
      metadata[match[1]] = values
      index = cursor - 1
    }
  }
  return metadata
}

export function validateRoutingScopes(registry, { root = process.cwd(), tracked = null } = {}) {
  try {
    return validateScopeRegistry(registry, { root, tracked })
  } catch (error) {
    if (error instanceof RoutingContractError) fail(error.code, error.message, error.details)
    throw error
  }
}

export function buildRuleIndex({ root = process.cwd() } = {}) {
  const tracked = trackedFiles(root)
  const rulePaths = tracked.filter(relPath => /^\.ai\/rules\/.+\.mdc$/u.test(relPath))
  if (rulePaths.length !== 38 || new Set(rulePaths).size !== rulePaths.length)
    fail('RULE_COUNT_DRIFT', 'Exactly 38 tracked rules are required')
  const registry = JSON.parse(fs.readFileSync(path.join(root, ROUTING_SCOPES_PATH), 'utf8'))
  validateRoutingScopes(registry, { root, tracked })
  const assignments = new Map(
    registry.ruleAssignments.map(assignment => [assignment.rulePath, assignment.scopeIds])
  )
  if (
    rulePaths.some(rulePath => !assignments.has(rulePath)) ||
    [...assignments].some(([rulePath]) => !rulePaths.includes(rulePath))
  )
    fail('RULE_ASSIGNMENT_DRIFT', 'Every tracked rule must be assigned exactly once')
  const scopes = new Map(registry.scopes.map(scope => [scope.id, scope]))
  const rules = rulePaths
    .map(rulePath => {
      if (
        path.posix.isAbsolute(rulePath) ||
        rulePath.includes('\\') ||
        rulePath.split('/').includes('..')
      )
        fail('MALFORMED_RULE_PATH', 'Malformed rule path: ' + rulePath)
      const metadata = parseFrontmatter(fs.readFileSync(path.join(root, rulePath), 'utf8'))
      const historicalGlobs = Array.isArray(metadata.globs) ? [...metadata.globs] : []
      const effectiveScopeIds = [...assignments.get(rulePath)].sort(compareStrings)
      const effectiveGlobs = [
        ...new Set(effectiveScopeIds.flatMap(scopeId => scopes.get(scopeId).effectiveGlobs)),
      ].sort(compareStrings)
      return {
        path: rulePath,
        description: typeof metadata.description === 'string' ? metadata.description : '',
        historicalGlobs,
        alwaysApply: metadata.alwaysApply === true,
        effectiveScopeIds,
        effectiveGlobs,
      }
    })
    .sort((left, right) => compareStrings(left.path, right.path))
  const byHistoricalGlob = {}
  const byEffectiveGlob = {}
  for (const rule of rules) {
    for (const glob of rule.historicalGlobs) {
      byHistoricalGlob[glob] ??= []
      byHistoricalGlob[glob].push(rule.path)
    }
    for (const glob of rule.effectiveGlobs) {
      byEffectiveGlob[glob] ??= []
      byEffectiveGlob[glob].push(rule.path)
    }
  }
  const sortedIndex = index =>
    Object.fromEntries(
      Object.entries(index)
        .sort(([left], [right]) => compareStrings(left, right))
        .map(([glob, paths]) => [glob, paths.sort(compareStrings)])
    )
  const nonUiCount = rules.filter(
    rule =>
      !rule.path.startsWith('.ai/rules/components/') &&
      !rule.path.startsWith('.ai/rules/design-system/') &&
      rule.effectiveScopeIds.length > 0
  ).length
  if (nonUiCount < 28) fail('NON_UI_RULE_COVERAGE_REDUCED', 'Non-UI rule coverage fell below 28')
  return {
    version: RULE_INDEX_VERSION,
    generatedBy: 'scripts/generate-rule-index.mjs',
    routingScopesSource: ROUTING_SCOPES_PATH,
    rules,
    byHistoricalGlob: sortedIndex(byHistoricalGlob),
    byEffectiveGlob: sortedIndex(byEffectiveGlob),
    alwaysApply: rules
      .filter(rule => rule.alwaysApply)
      .map(rule => rule.path)
      .sort(compareStrings),
  }
}

const atomicWrite = (file, content) => {
  const temporary = file + '.tmp-' + process.pid
  fs.writeFileSync(temporary, content, 'utf8')
  fs.renameSync(temporary, file)
}

export const renderRuleIndex = ({ root = process.cwd() } = {}) =>
  canonicalJson(buildRuleIndex({ root }))

export async function runRuleIndexCli(argv = process.argv.slice(2), { root = process.cwd() } = {}) {
  if (argv.some(argument => !['--check', '--'].includes(argument)))
    fail('CLI_ARGUMENT_ERROR', 'Unknown rule-index argument')
  const check = argv.includes('--check')
  const expected = await renderRuleIndex({ root })
  const output = path.join(root, RULE_INDEX_PATH)
  if (check) {
    const actual = fs.existsSync(output) ? fs.readFileSync(output, 'utf8') : null
    if (actual !== expected) fail('RULE_INDEX_STALE', 'rule-index.json is stale')
    process.stdout.write('RULE_INDEX_CHECK_PASS path=' + RULE_INDEX_PATH + '\n')
    return 0
  }
  atomicWrite(output, expected)
  process.stdout.write('RULE_INDEX_GENERATED path=' + RULE_INDEX_PATH + '\n')
  return 0
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  try {
    process.exitCode = await runRuleIndexCli()
  } catch (error) {
    const code = error instanceof RuleIndexError ? error.code : 'UNEXPECTED_RULE_INDEX_FAILURE'
    process.stderr.write(
      code + ': ' + (error instanceof Error ? error.message : String(error)) + '\n'
    )
    process.exitCode =
      error instanceof RuleIndexError && error.code === 'CLI_ARGUMENT_ERROR' ? 2 : 1
  }
}
