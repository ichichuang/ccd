#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { readPolicy } from '../governance/policy-utils.mjs'

const root = process.cwd()
const outputDir = path.join(root, 'docs/generated/graphs')
fs.mkdirSync(outputDir, { recursive: true })

const topology = readPolicy('topology')

function readJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(root, relPath), 'utf8'))
}

function write(relPath, content) {
  fs.writeFileSync(path.join(outputDir, relPath), `${content.trimEnd()}\n`)
}

function sanitizeNode(value) {
  return value.replace(/[^a-zA-Z0-9]/g, '_').replace(/^_+/, '')
}

function checksum(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex')
}

function formatGeneratedGraphOutputs() {
  const result = spawnSync(
    'pnpm',
    [
      'exec',
      'prettier',
      '--write',
      '--no-error-on-unmatched-pattern',
      'docs/generated/graphs/dependency-graph.json',
      'docs/generated/graphs/README.md',
    ],
    {
      cwd: root,
      encoding: 'utf8',
      stdio: 'pipe',
    }
  )

  if (result.status === 0) return
  if (result.stdout) process.stdout.write(result.stdout)
  if (result.stderr) process.stderr.write(result.stderr)
  process.exit(result.status ?? 1)
}

const workspace = readJson('package.json')
const turbo = readJson('turbo.json')
const packageManifests = topology.packages.map(item => ({
  ...item,
  manifest: readJson(`${item.path}/package.json`),
}))
const provenance = {
  generatedBy: 'scripts/architecture/generate-dependency-graphs.mjs',
  sourceInputs: [
    '.ai/governance/policies/topology.json',
    'package.json',
    'pnpm-lock.yaml',
    'pnpm-workspace.yaml',
    'turbo.json',
  ],
  deterministic: true,
}

const workspaceGraph = [
  'graph TD',
  '  Root["root orchestration only"] --> Turbo["Turbo orchestration"]',
  '  Root --> Governance["governance scripts and policies"]',
  ...packageManifests.map(item => `  Turbo --> ${sanitizeNode(item.name)}["${item.name}<br/>${item.path}"]`),
].join('\n')

const packageGraphLines = ['graph TD']
for (const item of packageManifests) {
  const id = sanitizeNode(item.name)
  packageGraphLines.push(
    `  ${id}["${item.name}<br/>${item.layer}<br/>${item.responsibility ?? 'governed workspace package'}"]`
  )
  for (const dependency of item.allowedWorkspaceDependencies) {
    packageGraphLines.push(`  ${sanitizeNode(dependency)} --> ${id}`)
  }
}

const runtimeGraph = [
  'graph TD',
  '  Contracts["packages/contracts<br/>interfaces only<br/>runtime forbidden"] --> Core["packages/core<br/>runtime-neutral logic<br/>runtime forbidden"]',
  '  Core --> Web["apps/web-demo<br/>web-demo browser app shell"]',
  '  Core --> Desktop["apps/desktop<br/>Tauri desktop runtime shell"]',
  '  Web --> WebAdapters["apps/web-demo/src/adapters/**<br/>browser app adapters"]',
  '  Desktop --> DesktopAdapters["apps/desktop/src/adapters/** + src-tauri<br/>desktop adapters and backend boundary"]',
  '  Root["root /src<br/>decommissioned"] -. blocked .-> Web',
].join('\n')

const turboLines = ['graph TD']
for (const [taskName, task] of Object.entries(turbo.tasks ?? {})) {
  const taskId = `Task_${sanitizeNode(taskName)}`
  turboLines.push(`  ${taskId}["${taskName}"]`)
  for (const dependency of task.dependsOn ?? []) {
    const depId = dependency.startsWith('^') ? `Parent_${sanitizeNode(dependency.slice(1))}` : `Task_${sanitizeNode(dependency)}`
    const depLabel = dependency.startsWith('^') ? `^${dependency.slice(1)}` : dependency
    turboLines.push(`  ${depId}["${depLabel}"] --> ${taskId}`)
  }
}

const runtimeExecutionGraph = [
  'graph TD',
  '  Shell["shell"] --> Exec["scripts/exec.sh"]',
  '  Exec --> Env["scripts/env.sh"]',
  '  Env --> Mise["mise activation when available"]',
  '  Env --> Corepack["corepack/pnpm resolution"]',
  '  Env --> Pnpm["pnpm command"]',
  '  Pnpm --> Turbo["Turbo workspace tasks"]',
  '  Turbo --> WebBuild["apps/web-demo build output"]',
].join('\n')

const ownershipGraph = [
  'graph TD',
  '  Platform["@platform-architecture"] --> Contracts["packages/contracts"]',
  '  Platform --> Core["packages/core"]',
  '  Platform --> Governance[".ai docs scripts"]',
  '  WebOwner["@web-runtime"] --> Web["apps/web-demo"]',
  '  DesktopOwner["@desktop-runtime"] --> Desktop["apps/desktop"]',
].join('\n')

const environmentGraph = [
  'graph TD',
  '  Mise["mise.toml"] --> Node["Node runtime"]',
  '  PackageManager["packageManager pnpm@10.28.2"] --> Pnpm["pnpm"]',
  '  Lockfile["pnpm-lock.yaml"] --> Install["frozen install"]',
  '  Workspace["pnpm-workspace.yaml"] --> Turbo["Turbo"]',
  '  TurboJson["turbo.json"] --> Turbo',
].join('\n')

const graphJson = {
  schemaVersion: 2,
  provenance,
  root: {
    name: workspace.name,
    role: 'orchestration-only',
    packageManager: workspace.packageManager,
  },
  packages: packageManifests.map(item => ({
    name: item.name,
    path: item.path,
    layer: item.layer,
    runtime: item.runtime ?? 'none',
    criticality: item.criticality,
    responsibility: item.responsibility ?? null,
    allowedWorkspaceDependencies: item.allowedWorkspaceDependencies,
  })),
  turbo: turbo.tasks,
  runtimeExecution: {
    entrypoint: 'scripts/exec.sh',
    environment: 'scripts/env.sh',
    workspaceRoot: '.',
    browserRuntimeSource: 'apps/web-demo',
  },
  ownership: {
    web: 'apps/web-demo',
    desktop: 'apps/desktop',
    platform: ['packages/contracts', 'packages/core', '.ai', 'scripts/architecture', 'scripts/governance'],
  },
  environmentDependencies: ['mise.toml', 'package.json#packageManager', 'pnpm-lock.yaml', 'pnpm-workspace.yaml', 'turbo.json'],
  forbiddenRelationships: topology.forbiddenRelationships,
}
graphJson.validationChecksum = checksum({ ...graphJson, validationChecksum: undefined })

write('workspace-graph.mmd', workspaceGraph)
write('package-dependency-graph.mmd', packageGraphLines.join('\n'))
write('runtime-boundary-graph.mmd', runtimeGraph)
write('turbo-task-graph.mmd', turboLines.join('\n'))
write('runtime-execution-graph.mmd', runtimeExecutionGraph)
write('package-ownership-graph.mmd', ownershipGraph)
write('environment-dependency-graph.mmd', environmentGraph)
write('dependency-graph.json', JSON.stringify(graphJson, null, 2))
write(
  'README.md',
  `# Generated Dependency Graphs

Generated by \`pnpm arch:graphs\`.

- Provenance inputs: ${provenance.sourceInputs.map(input => `\`${input}\``).join(', ')}
- Validation checksum: \`${graphJson.validationChecksum}\`

## Mermaid graphs

- [Workspace graph](./workspace-graph.mmd)
- [Package dependency graph](./package-dependency-graph.mmd)
- [Runtime boundary graph](./runtime-boundary-graph.mmd)
- [Turbo task graph](./turbo-task-graph.mmd)
- [Runtime execution graph](./runtime-execution-graph.mmd)
- [Package ownership graph](./package-ownership-graph.mmd)
- [Environment dependency graph](./environment-dependency-graph.mmd)

## Machine-readable graph

- [Dependency graph JSON](./dependency-graph.json)

These artifacts are governance documentation only and are not runtime dependencies.`
)

formatGeneratedGraphOutputs()

console.log('Generated dependency graphs in docs/generated/graphs')
