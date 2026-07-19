import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { loadAuthority } from './authority.mjs'
import { aggregateBaseline, loadBaseline, pruneBaseline, validateBaseline, writeBaselineExclusive } from './baseline.mjs'
import { EXIT_CODES, ScannerError, canonicalJson, fail } from './contracts.mjs'
import { explainRule } from './detector-registry.mjs'
import { scanUiSource } from './orchestrator.mjs'
import { renderJson, renderText } from './render.mjs'
import { runSelfTest } from './self-test.mjs'

const REPO_ROOT = path.resolve(fileURLToPath(new URL('../../../../', import.meta.url)))

function nextValue(argv, index, flag) {
  const value = argv[index + 1]
  if (!value || value.startsWith('--')) fail('CLI_USAGE', `${flag} requires a value`)
  return value
}

export function parseCliArgs(argv) {
  if (argv[0] === '--') argv = argv.slice(1)
  const result = { mode: 'default', format: 'text', paths: [], noBaseline: false, checkBaseline: false, selfTest: false, explainRule: null, generateBaseline: null, jsonOutput: null, ref: null, base: null, head: null }
  const acquisition = []
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (argument === '--all') { result.mode = 'all'; acquisition.push(argument) }
    else if (argument === '--staged') { result.mode = 'staged'; acquisition.push(argument) }
    else if (argument === '--ref') { result.mode = 'ref'; result.ref = nextValue(argv, index, argument); acquisition.push(argument); index += 1 }
    else if (argument === '--base') { result.base = nextValue(argv, index, argument); index += 1 }
    else if (argument === '--head') { result.head = nextValue(argv, index, argument); index += 1 }
    else if (argument === '--paths') {
      result.mode = 'paths'; acquisition.push(argument)
      while (argv[index + 1] && !argv[index + 1].startsWith('--')) result.paths.push(argv[++index])
      if (result.paths.length === 0) fail('CLI_USAGE', '--paths requires one or more file paths')
    } else if (argument === '--format') { result.format = nextValue(argv, index, argument); index += 1 }
    else if (argument === '--json-output') { result.jsonOutput = nextValue(argv, index, argument); index += 1 }
    else if (argument === '--generate-baseline') { result.generateBaseline = nextValue(argv, index, argument); index += 1 }
    else if (argument === '--check-baseline') result.checkBaseline = true
    else if (argument === '--no-baseline') result.noBaseline = true
    else if (argument === '--self-test') result.selfTest = true
    else if (argument === '--explain-rule') { result.explainRule = nextValue(argv, index, argument); index += 1 }
    else fail('CLI_USAGE', `unknown argument: ${argument}`)
  }
  if (result.base || result.head) {
    if (!result.base || !result.head) fail('CLI_USAGE', '--base and --head must appear together')
    result.mode = 'range'; acquisition.push('--base/--head')
  }
  if (acquisition.length > 1) fail('CLI_USAGE', 'source acquisition modes are mutually exclusive')
  if (!['text', 'json'].includes(result.format)) fail('CLI_USAGE', '--format must be text or json')
  if (result.selfTest && argv.length !== 1) fail('CLI_USAGE', '--self-test is exclusive')
  if (result.explainRule && argv.length !== 2) fail('CLI_USAGE', '--explain-rule is exclusive')
  if (result.jsonOutput && result.generateBaseline) fail('CLI_USAGE', '--json-output and --generate-baseline cannot be combined')
  if (result.noBaseline && result.checkBaseline) fail('CLI_USAGE', '--no-baseline and --check-baseline conflict')
  if (result.generateBaseline && !result.checkBaseline && (result.mode !== 'ref' || result.ref !== 'f8acb7fbbfef0c681affb74e08336ec8bc72bca0')) fail('CLI_USAGE', 'adoption baseline generation requires --ref f8acb7f...')
  return result
}

function assertExternalJsonOutput(outputPath, repoRoot) {
  if (!path.isAbsolute(outputPath)) fail('OUTPUT_PATH_UNSAFE', '--json-output must be an absolute external path')
  const absolute = path.resolve(outputPath)
  const relative = path.relative(repoRoot, absolute)
  if (!relative.startsWith('..') && !path.isAbsolute(relative)) fail('OUTPUT_PATH_UNSAFE', '--json-output must be outside the repository')
  if (fs.existsSync(absolute)) fail('OUTPUT_PATH_UNSAFE', '--json-output target must not exist')
  let parent = path.dirname(absolute)
  while (!fs.existsSync(parent)) parent = path.dirname(parent)
  if (fs.lstatSync(parent).isSymbolicLink()) fail('OUTPUT_PATH_UNSAFE', '--json-output parent cannot be a symlink')
  return absolute
}

function writeJsonOutput(outputPath, bytes) {
  try { fs.writeFileSync(outputPath, bytes, { flag: 'wx', mode: 0o644 }) } catch (error) { fail('OUTPUT_IO', `cannot write JSON output: ${error.message}`) }
}

export async function main(argv = process.argv.slice(2), io = process) {
  try {
    const args = parseCliArgs(argv)
    const baselineExists = fs.existsSync(path.join(REPO_ROOT, '.ai/governance/ui/source-baseline.json'))
    const authority = loadAuthority({ repoRoot: REPO_ROOT, phase: baselineExists ? 'terminal' : 'preterminal' })
    if (args.selfTest) {
      const result = runSelfTest({ repoRoot: REPO_ROOT, authority })
      io.stdout.write(canonicalJson({ schemaVersion: result.schemaVersion, declared: result.declared, passed: result.passed, failed: result.failed, elapsedMs: result.elapsedMs, maxRssBytes: result.maxRssBytes, caseDigest: result.caseDigest }))
      return EXIT_CODES.SUCCESS
    }
    if (args.explainRule) {
      io.stdout.write(canonicalJson(explainRule(authority, args.explainRule)))
      return EXIT_CODES.SUCCESS
    }
    const result = scanUiSource({ repoRoot: REPO_ROOT, authority, mode: args.mode, ref: args.ref, base: args.base, head: args.head, paths: args.paths, noBaseline: args.noBaseline || Boolean(args.generateBaseline), checkBaseline: args.checkBaseline && !args.generateBaseline })
    if (args.generateBaseline) {
      const current = aggregateBaseline(result.diagnostics, authority, { commit: result.commit })
      let output = current
      if (args.checkBaseline) {
        const canonicalPath = path.join(REPO_ROOT, authority.manifest.authority.baseline)
        const baseline = loadBaseline(canonicalPath)
        validateBaseline(baseline, authority)
        if (path.resolve(args.generateBaseline) === path.resolve(canonicalPath)) fail('OUTPUT_PATH_UNSAFE', 'prune output cannot overwrite the canonical baseline')
        output = pruneBaseline(baseline, current)
      }
      const written = writeBaselineExclusive(args.generateBaseline, output, REPO_ROOT)
      io.stdout.write(canonicalJson({ generated: written, findingCount: output.declaredFindingCount, fingerprintCount: output.declaredFingerprintCount }))
      return EXIT_CODES.SUCCESS
    }
    if (args.jsonOutput) {
      const target = assertExternalJsonOutput(args.jsonOutput, REPO_ROOT)
      writeJsonOutput(target, renderJson(result))
      io.stdout.write(renderText(result))
    } else {
      io.stdout.write(args.format === 'json' ? renderJson(result) : renderText(result))
    }
    return result.diagnostics.some(diagnostic => diagnostic.baselineState !== 'EXCEPTED') && (args.noBaseline || !baselineExists) ? EXIT_CODES.SOURCE_VIOLATION : EXIT_CODES.SUCCESS
  } catch (error) {
    const scannerError = error instanceof ScannerError ? error : new ScannerError('INVARIANT_VIOLATION', error.message)
    io.stderr.write(`${scannerError.reason}: ${scannerError.message}\n`)
    if (process.env.CCD_UI_SCANNER_DEBUG === '1' && scannerError.stack) io.stderr.write(scannerError.stack + '\n')
    return scannerError.exitCode
  }
}
