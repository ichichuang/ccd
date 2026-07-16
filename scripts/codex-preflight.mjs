import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const cwd = process.cwd()
const home = os.homedir()

const requiredPaths = [
  '.ai/rules/architecture',
  '.ai/rules/components',
  '.ai/rules/core',
  '.ai/rules/design-system',
  '.ai/rules/integrations',
  '.ai/skills/core/unocss/SKILL.md',
  '.ai/skills/core/vite/SKILL.md',
  '.ai/skills/core/vue/SKILL.md',
  '.ai/skills/core/vueuse-functions/SKILL.md',
  '.ai/skills/codex/architecture-browser-master/SKILL.md',
  '.ai/skills/codex/task-orchestrator/SKILL.md',
  '.ai/skills/codex/github-ops/SKILL.md',
  '.ai/skills/codex/desktop-tauri-guard/SKILL.md',
  '.ai/protocol/adapters/claude.md',
  'AGENTS.md',
  'CLAUDE.md',
  '.ai/rules/core/10-ai-generation-workflow.mdc',
  'scripts/skill-lock-utils.mjs',
  'scripts/ai-sync.mjs',
  'scripts/governance/cold-start-validate.mjs',
  'scripts/ai-architecture-guard.mjs',
  'scripts/ai-doctor.mjs',
  'scripts/ai-clean.mjs',
  'scripts/ai-sync-codex.mjs',
  'scripts/ai-route-view-scaffold.mjs',
  'scripts/codex-preflight.mjs',
  '.ai/runtime/repair_list.template.md',
  '.ai/manifests/skill-routing.json',
  '.ai/manifests/skills-lock.json',
  'uno.config.ts',
  'apps/web-demo/vite.config.ts',
  'apps/desktop/vite.config.ts',
]

const requiredLocalCodexSkills = [
  'vue',
  'vueuse-functions',
  'unocss',
  'vite',
  'architecture-browser-master',
  'task-orchestrator',
  'github-ops',
  'desktop-tauri-guard',
]

const requiredDeps = ['vue', 'primevue', 'alova', '@vueuse/core', 'unocss', 'vite', 'typescript']

const exists = rel => fs.existsSync(path.join(cwd, rel))
const missingPaths = requiredPaths.filter(rel => !exists(rel))

let packageJson = null
try {
  const raw = fs.readFileSync(path.join(cwd, 'package.json'), 'utf8')
  packageJson = JSON.parse(raw)
} catch {
  packageJson = null
}

const deps = {
  ...(packageJson?.dependencies ?? {}),
  ...(packageJson?.devDependencies ?? {}),
}

const missingDeps = requiredDeps.filter(dep => !deps[dep])
const missingLocalCodexSkills = requiredLocalCodexSkills.filter(
  name => !fs.existsSync(path.join(home, '.codex', 'skills', name, 'SKILL.md'))
)

let coldStartJsonReportPath = null
const runNodeScript = (relPath, args = []) => {
  const absPath = path.join(cwd, relPath)
  const reportArgs = coldStartJsonReportPath ? ['--json-output', coldStartJsonReportPath] : []
  return spawnSync(process.execPath, [absPath, ...args, ...reportArgs], {
    cwd,
    encoding: 'utf8',
    stdio: 'pipe',
  })
}

const coldStartSchemaVersion = 'ccd-ai-cold-start/v1'
const terminalLifecycleDiagnostic = 'TERMINAL_LIFECYCLE_INCOMPLETE'
const coldStartFailureState = 'COLD_START_VALIDATION_FAIL'

const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value)

const diagnosticCode = diagnostic =>
  typeof diagnostic === 'string' ? diagnostic : diagnostic?.code

const readColdStartReport = (reportPath, expectedMode) => {
  let report
  try {
    report = JSON.parse(fs.readFileSync(reportPath, 'utf8'))
  } catch {
    throw new Error('MALFORMED_OR_MISSING_REPORT')
  }

  const validDiagnostics =
    Array.isArray(report?.diagnostics) &&
    report.diagnostics.every(diagnostic => {
      const code = diagnosticCode(diagnostic)
      return typeof code === 'string' && /^[A-Z][A-Z0-9_]*$/u.test(code)
    })
  const validDiagnosticState =
    validDiagnostics &&
    typeof report?.ok === 'boolean' &&
    (report.ok ? report.diagnostics.length === 0 : report.diagnostics.length > 0)
  const validLifecycle =
    expectedMode !== 'default' ||
    (isRecord(report?.lifecycle) &&
      typeof report.lifecycle.complete === 'boolean' &&
      report.lifecycle.complete === report.ok)

  if (
    !isRecord(report) ||
    report.schemaVersion !== coldStartSchemaVersion ||
    report.mode !== expectedMode ||
    typeof report.ok !== 'boolean' ||
    !validDiagnosticState ||
    !Array.isArray(report.checks) ||
    !Array.isArray(report.outputs) ||
    !isRecord(report.ignorePolicy) ||
    !validLifecycle
  ) {
    throw new Error('INVALID_REPORT_SCHEMA')
  }

  return report
}

const writeNodeScriptOutput = result => {
  if (result.stdout) process.stdout.write(result.stdout)
  if (result.stderr) process.stderr.write(result.stderr)
}

const runColdStartValidator = (coldStartScript, reportPath, expectedMode) => {
  let result
  coldStartJsonReportPath = reportPath
  try {
    result =
      expectedMode === 'implementation'
        ? runNodeScript(coldStartScript, ['--implementation'])
        : runNodeScript(coldStartScript)
  } finally {
    coldStartJsonReportPath = null
  }
  writeNodeScriptOutput(result)
  if (result.error || result.signal || ![0, 1].includes(result.status)) {
    throw new Error('VALIDATOR_CLI_FAILURE')
  }
  return { result, report: readColdStartReport(reportPath, expectedMode) }
}

const runRepositoryColdStart = coldStartScript => {
  let reportDirectory = null
  let outcome = {
    defaultValidation: coldStartFailureState,
    fallbackInvoked: false,
    implementationValidation: null,
    repositoryState: coldStartFailureState,
    passed: false,
  }

  try {
    reportDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'ccd-codex-preflight-'))
    const defaultReportPath = path.join(reportDirectory, 'default.json')
    const defaultValidation = runColdStartValidator(coldStartScript, defaultReportPath, 'default')
    const defaultDiagnostics = defaultValidation.report.diagnostics.map(diagnosticCode)

    if (defaultValidation.result.status === 0 && defaultValidation.report.ok) {
      outcome = {
        ...outcome,
        defaultValidation: 'pass',
        repositoryState: 'TERMINAL_COLD_START_PASS',
        passed: true,
      }
    } else if (
      defaultValidation.result.status === 1 &&
      !defaultValidation.report.ok &&
      defaultDiagnostics.length === 1 &&
      defaultDiagnostics[0] === terminalLifecycleDiagnostic
    ) {
      outcome.defaultValidation = terminalLifecycleDiagnostic
      outcome.fallbackInvoked = true
      const implementationReportPath = path.join(reportDirectory, 'implementation.json')
      const implementationValidation = runColdStartValidator(
        coldStartScript,
        implementationReportPath,
        'implementation'
      )
      const implementationDiagnostics =
        implementationValidation.report.diagnostics.map(diagnosticCode)

      if (implementationValidation.result.status === 0 && implementationValidation.report.ok) {
        outcome.implementationValidation = 'COLD_START_IMPLEMENTATION_PASS'
        outcome.repositoryState = 'IMPLEMENTATION_COLD_START_PASS_PENDING_LIFECYCLE'
        outcome.passed = true
      } else {
        outcome.implementationValidation =
          implementationDiagnostics.join(',') || coldStartFailureState
      }
    } else {
      outcome.defaultValidation = defaultDiagnostics.join(',') || coldStartFailureState
    }
  } catch {
    outcome.repositoryState = coldStartFailureState
    outcome.passed = false
  } finally {
    if (reportDirectory) {
      try {
        fs.rmSync(reportDirectory, { recursive: true, force: true })
      } catch {
        outcome.repositoryState = coldStartFailureState
        outcome.passed = false
      }
    }
  }

  console.log(`DEFAULT_VALIDATION=${outcome.defaultValidation}`)
  console.log(`FALLBACK_INVOKED=${outcome.fallbackInvoked ? 'yes' : 'no'}`)
  if (outcome.implementationValidation) {
    console.log(`IMPLEMENTATION_VALIDATION=${outcome.implementationValidation}`)
  }
  console.log(`REPOSITORY_COLD_START_STATE=${outcome.repositoryState}`)
  return outcome.passed
}

const printCheck = (label, ok) => {
  const mark = ok ? '[OK]' : '[FAIL]'
  console.log(`${mark} ${label}`)
}

console.log('CCD Codex Preflight')
console.log('====================')

printCheck('package.json parse', Boolean(packageJson))
printCheck('required paths', missingPaths.length === 0)
for (const p of missingPaths) {
  console.log(`  - missing: ${p}`)
}

printCheck('required dependencies', missingDeps.length === 0)
for (const dep of missingDeps) {
  console.log(`  - missing dep: ${dep}`)
}

const coldStartScript = 'scripts/governance/cold-start-validate.mjs'
let coldStartPassed = false
if (missingPaths.length === 0 && fs.existsSync(path.join(cwd, coldStartScript))) {
  coldStartPassed = runRepositoryColdStart(coldStartScript)
}
printCheck('repository cold-start', coldStartPassed)

if (missingLocalCodexSkills.length === 0) {
  printCheck('optional Codex home skill installation', true)
} else {
  console.log('[WARN] optional Codex home skills are not installed')
  for (const name of missingLocalCodexSkills) {
    console.log(
      `  - optional local skill: ${name} (run pnpm ai:sync:codex when installation is desired)`
    )
  }
}

const doctorScript = 'scripts/ai-doctor.mjs'
const canRunDoctor =
  Boolean(packageJson) && missingPaths.length === 0 && fs.existsSync(path.join(cwd, doctorScript))

let doctorPassed = false
if (!canRunDoctor) {
  printCheck('ai workspace doctor', false)
  console.log(
    `  - unable to run ${doctorScript}; fix required paths above and then run pnpm ai:doctor`
  )
} else {
  const doctorResult = runNodeScript(doctorScript)
  if (doctorResult.stdout) process.stdout.write(doctorResult.stdout)
  if (doctorResult.stderr) process.stderr.write(doctorResult.stderr)
  doctorPassed = doctorResult.status === 0
  printCheck('ai workspace doctor', doctorPassed)
  if (!doctorPassed) {
    console.log('  - architecture drift detected. Run pnpm ai:sync, then pnpm ai:doctor.')
  }
}

const passed =
  Boolean(packageJson) &&
  missingPaths.length === 0 &&
  missingDeps.length === 0 &&
  coldStartPassed &&
  doctorPassed
console.log('--------------------')
console.log(passed ? 'Preflight passed.' : 'Preflight failed.')

process.exit(passed ? 0 : 1)
