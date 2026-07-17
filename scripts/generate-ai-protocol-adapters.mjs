#!/usr/bin/env node

import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

export const MANIFEST_PATH = '.ai/protocol/adapter-manifest.json'
export const MANIFEST_SCHEMA_VERSION = 'ccd-ai-adapter-manifest/v1'
export const COLD_START_SCHEMA_VERSION = 'ccd-ai-cold-start/v1'
export const GENERATOR_OWNER = 'scripts/generate-ai-protocol-adapters.mjs'
export const VALIDATION_OWNER = 'scripts/governance/cold-start-validate.mjs'

export const COLD_START_ENUMS = Object.freeze({
  outputKinds: [
    'shared-generated-entry',
    'root-compatibility-entrypoint',
    'root-client-pointer',
    'client-adapter-guidance',
    'adapter-index',
  ],
  clients: ['shared', 'agents-aware', 'codex', 'claude'],
  discoveryRoles: [
    'shared-entry-content',
    'agents-root-discovery',
    'claude-root-discovery',
    'client-guidance',
    'adapter-index',
  ],
  authorities: [
    'canonical-protocol-authority',
    'structured-adapter-cold-start-authority',
    'generated-compatibility-output',
    'generated-guidance-output',
  ],
  contentContracts: [
    'claude-adapter',
    'codex-adapter',
    'adapter-index',
    'shared-entry',
    'root-agents',
    'root-claude',
  ],
})

export const EXPECTED_CANONICAL_SOURCES = Object.freeze([
  {
    path: MANIFEST_PATH,
    authority: 'structured-adapter-cold-start-authority',
  },
  {
    path: '.ai/protocol/AGENTS.core.md',
    authority: 'canonical-protocol-authority',
  },
])

export const EXPECTED_OUTPUTS = Object.freeze([
  {
    id: 'CLAUDE_ADAPTER',
    path: '.ai/protocol/adapters/claude.md',
    kind: 'client-adapter-guidance',
    targetClients: ['claude'],
    discoveryRole: 'client-guidance',
    authority: 'generated-guidance-output',
    contentContract: 'claude-adapter',
    sourceDependencies: [MANIFEST_PATH, '.ai/protocol/AGENTS.core.md'],
    outputDependencies: [],
    freshCloneRequired: true,
    tracked: true,
    order: 10,
  },
  {
    id: 'CODEX_ADAPTER',
    path: '.ai/protocol/adapters/codex.md',
    kind: 'client-adapter-guidance',
    targetClients: ['codex'],
    discoveryRole: 'client-guidance',
    authority: 'generated-guidance-output',
    contentContract: 'codex-adapter',
    sourceDependencies: [MANIFEST_PATH, '.ai/protocol/AGENTS.core.md'],
    outputDependencies: [],
    freshCloneRequired: true,
    tracked: true,
    order: 20,
  },
  {
    id: 'ADAPTER_INDEX',
    path: '.ai/protocol/adapters/README.md',
    kind: 'adapter-index',
    targetClients: ['shared'],
    discoveryRole: 'adapter-index',
    authority: 'generated-guidance-output',
    contentContract: 'adapter-index',
    sourceDependencies: [MANIFEST_PATH],
    outputDependencies: ['CLAUDE_ADAPTER', 'CODEX_ADAPTER'],
    freshCloneRequired: true,
    tracked: true,
    order: 30,
  },
  {
    id: 'AI_ENTRY',
    path: '.ai/protocol/AI.entry.md',
    kind: 'shared-generated-entry',
    targetClients: ['shared'],
    discoveryRole: 'shared-entry-content',
    authority: 'generated-compatibility-output',
    contentContract: 'shared-entry',
    sourceDependencies: [MANIFEST_PATH],
    outputDependencies: ['CLAUDE_ADAPTER', 'CODEX_ADAPTER'],
    freshCloneRequired: true,
    tracked: true,
    order: 40,
  },
  {
    id: 'ROOT_AGENTS',
    path: 'AGENTS.md',
    kind: 'root-compatibility-entrypoint',
    targetClients: ['agents-aware', 'codex'],
    discoveryRole: 'agents-root-discovery',
    authority: 'generated-compatibility-output',
    contentContract: 'root-agents',
    sourceDependencies: [],
    outputDependencies: ['AI_ENTRY'],
    freshCloneRequired: true,
    tracked: true,
    order: 50,
  },
  {
    id: 'ROOT_CLAUDE',
    path: 'CLAUDE.md',
    kind: 'root-client-pointer',
    targetClients: ['claude'],
    discoveryRole: 'claude-root-discovery',
    authority: 'generated-compatibility-output',
    contentContract: 'root-claude',
    sourceDependencies: [],
    outputDependencies: ['ROOT_AGENTS', 'CLAUDE_ADAPTER'],
    freshCloneRequired: true,
    tracked: true,
    order: 60,
  },
])

const CANONICAL_SOURCE_FIELDS = ['authority', 'path']
const OUTPUT_DECLARATION_FIELDS = [
  'authority',
  'contentContract',
  'discoveryRole',
  'freshCloneRequired',
  'id',
  'kind',
  'order',
  'outputDependencies',
  'owner',
  'path',
  'sourceDependencies',
  'targetClients',
  'tracked',
  'validationOwner',
]

const REQUIRED_ROOT_FACTS = [
  'canonicalProtocol',
  'loadOrder',
  'entryTargets',
  'adapterGuides',
  'repoDefaults',
  'protocolVersions',
  'adapterMetadata',
  'coreMandate',
  'projectUi',
  'codex',
  'claude',
]

export const EXPECTED_PROJECT_UI = Object.freeze({
  schemaVersion: 'ccd-project-ui-adapter/v1',
  source: '.ai/skills/project-ui',
  routingManifest: '.ai/manifests/skill-routing.json',
  scopeRegistry: '.ai/manifests/routing-scopes.json',
  nodeRouter: '.ai/skills/codex/task-orchestrator/scripts/skill_router.mjs',
  pythonFallback: '.ai/skills/codex/task-orchestrator/scripts/skill_router.py',
  validator: 'scripts/governance/project-ui-routing-validate.mjs',
  syncCommands: {
    codex: 'pnpm ai:sync:codex',
    claude: 'pnpm ai:sync:claude',
    combined: 'pnpm ai:sync:skills',
  },
  activation: {
    genericUiPrimarySkill: 'project-ui',
    nodePrimary: true,
    pythonFallback: true,
    legacyGenericDesignChain: false,
  },
})

export class ColdStartContractError extends Error {
  constructor(code, message, details = {}) {
    super(message)
    this.name = 'ColdStartContractError'
    this.code = code
    this.details = details
  }
}

const fail = (code, message, details) => {
  throw new ColdStartContractError(code, message, details)
}

const stableValue = value => {
  if (Array.isArray(value)) return value.map(stableValue)
  if (value && typeof value === 'object' && !Buffer.isBuffer(value)) {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map(key => [key, stableValue(value[key])])
    )
  }
  return value
}

export function canonicalSerialize(value) {
  return `${JSON.stringify(stableValue(value), null, 2)}\n`
}

export function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex')
}

const normalizeGeneratedBytes = value => {
  const text = Buffer.isBuffer(value) ? value.toString('utf8') : String(value)
  return Buffer.from(`${text.replaceAll('\r\n', '\n').replaceAll('\r', '\n').trimEnd()}\n`, 'utf8')
}

const isWithin = (root, candidate) =>
  candidate === root || candidate.startsWith(`${root}${path.sep}`)

const validateRelativePath = (relPath, code = 'INVALID_DECLARED_PATH') => {
  if (typeof relPath !== 'string' || relPath.length === 0)
    fail(code, 'Declared path must be non-empty')
  if (relPath.includes('\\')) fail('BACKSLASH_PATH', `Backslashes are forbidden: ${relPath}`)
  if (path.posix.isAbsolute(relPath) || /^[A-Za-z]:\//u.test(relPath)) {
    fail('ABSOLUTE_PATH', `Absolute paths are forbidden: ${relPath}`)
  }
  const segments = relPath.split('/')
  if (segments.includes('..')) fail('PARENT_TRAVERSAL', `Parent traversal is forbidden: ${relPath}`)
  if (path.posix.normalize(relPath) !== relPath || relPath.startsWith('./')) {
    fail('NON_NORMALIZED_PATH', `Path is not normalized: ${relPath}`)
  }
  return relPath
}

const validatePathContainment = (root, relPath, { mustExist = false, output = false } = {}) => {
  const rootReal = fs.realpathSync(root)
  const absolute = path.resolve(root, relPath)
  if (!isWithin(path.resolve(root), absolute))
    fail('PATH_ESCAPE', `Path escapes repository root: ${relPath}`)

  if (fs.existsSync(absolute)) {
    const stat = fs.lstatSync(absolute)
    if (output && stat.isSymbolicLink())
      fail('SYMLINK_OUTPUT', `Output path is a symlink: ${relPath}`)
    const real = fs.realpathSync(absolute)
    if (!isWithin(rootReal, real))
      fail('SYMLINK_ESCAPE', `Path resolves outside repository: ${relPath}`)
    return
  }

  if (mustExist) fail('MISSING_CANONICAL_SOURCE', `Canonical source is missing: ${relPath}`)
  let parent = path.dirname(absolute)
  while (!fs.existsSync(parent) && parent !== path.dirname(parent)) parent = path.dirname(parent)
  const parentReal = fs.realpathSync(parent)
  if (!isWithin(rootReal, parentReal))
    fail('SYMLINK_ESCAPE', `Parent resolves outside repository: ${relPath}`)
}

const assertExactArray = (actual, expected, code, label) => {
  if (!Array.isArray(actual) || JSON.stringify(actual) !== JSON.stringify(expected)) {
    fail(code, `${label} must match the closed contract`)
  }
}

const assertNoPathCollisions = records => {
  const normalized = new Map()
  const caseFolded = new Map()
  for (const { kind, value } of records) {
    const key = path.posix.normalize(value)
    const folded = key.toLocaleLowerCase('en-US')
    if (normalized.has(key)) {
      fail('DUPLICATE_NORMALIZED_PATH', `Duplicate normalized path: ${value}`, {
        first: normalized.get(key),
        second: kind,
      })
    }
    if (caseFolded.has(folded)) {
      fail('CASE_FOLD_PATH_COLLISION', `Case-fold path collision: ${value}`, {
        first: caseFolded.get(folded),
        second: kind,
      })
    }
    normalized.set(key, kind)
    caseFolded.set(folded, kind)
  }
}

export function buildDependencyGraph(manifest) {
  const outputs = manifest?.coldStart?.outputs
  if (!Array.isArray(outputs)) fail('INVALID_OUTPUTS', 'coldStart.outputs must be an array')
  return new Map(outputs.map(output => [output.id, [...output.outputDependencies]]))
}

export function topologicalSort(graph, orderById = new Map()) {
  const state = new Map()
  const result = []
  const stack = []
  const ids = [...graph.keys()].sort(
    (left, right) =>
      (orderById.get(left) ?? 0) - (orderById.get(right) ?? 0) || left.localeCompare(right)
  )

  const visit = id => {
    if (state.get(id) === 'done') return
    if (state.get(id) === 'visiting') {
      const cycleStart = stack.indexOf(id)
      const cycle = [...stack.slice(cycleStart), id]
      fail('DEPENDENCY_CYCLE', `Output dependency cycle: ${cycle.join(' -> ')}`, { cycle })
    }
    if (!graph.has(id)) fail('UNKNOWN_DEPENDENCY', `Unknown output dependency: ${id}`)
    state.set(id, 'visiting')
    stack.push(id)
    for (const dependency of graph.get(id)) visit(dependency)
    stack.pop()
    state.set(id, 'done')
    result.push(id)
  }

  for (const id of ids) visit(id)
  return result
}

export function validateManifest(manifest, { root = process.cwd(), checkFileSystem = true } = {}) {
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    fail('INVALID_MANIFEST', 'Adapter manifest must be an object')
  }
  if (manifest.schemaVersion !== MANIFEST_SCHEMA_VERSION) {
    fail('MANIFEST_SCHEMA_VERSION_MISMATCH', `schemaVersion must be ${MANIFEST_SCHEMA_VERSION}`)
  }
  for (const fact of REQUIRED_ROOT_FACTS) {
    if (!(fact in manifest))
      fail('MISSING_ROOT_FACT', `Required compatibility fact is missing: ${fact}`)
  }
  if (canonicalSerialize(manifest.projectUi) !== canonicalSerialize(EXPECTED_PROJECT_UI)) {
    fail('PROJECT_UI_ACTIVATION_MISMATCH', 'projectUi adapter activation contract drifted')
  }

  const contract = manifest.coldStart
  if (!contract || typeof contract !== 'object')
    fail('MISSING_COLD_START_CONTRACT', 'coldStart is required')
  if (contract.schemaVersion !== COLD_START_SCHEMA_VERSION) {
    fail(
      'COLD_START_SCHEMA_VERSION_MISMATCH',
      `coldStart.schemaVersion must be ${COLD_START_SCHEMA_VERSION}`
    )
  }
  if (contract.generatorOwner !== GENERATOR_OWNER)
    fail('INVALID_GENERATOR_OWNER', 'Generator owner is invalid')
  if (contract.validationOwner !== VALIDATION_OWNER)
    fail('INVALID_VALIDATION_OWNER', 'Validation owner is invalid')
  if (contract.digestAlgorithm !== 'sha256')
    fail('INVALID_DIGEST_ALGORITHM', 'Digest algorithm must be sha256')

  for (const [name, expected] of Object.entries(COLD_START_ENUMS)) {
    assertExactArray(contract.enums?.[name], expected, 'ENUM_CONTRACT_MISMATCH', name)
  }

  if (!Array.isArray(contract.canonicalSources) || contract.canonicalSources.length === 0) {
    fail('INVALID_CANONICAL_SOURCES', 'coldStart.canonicalSources must be a non-empty array')
  }
  for (const source of contract.canonicalSources) {
    if (!source || typeof source !== 'object' || Array.isArray(source)) {
      fail('INVALID_CANONICAL_SOURCE', 'Canonical source declaration must be an object')
    }
    assertExactArray(
      Object.keys(source).sort(),
      CANONICAL_SOURCE_FIELDS,
      'CANONICAL_SOURCE_FIELDS_MISMATCH',
      'canonicalSource fields'
    )
    validateRelativePath(source.path)
    if (!COLD_START_ENUMS.authorities.includes(source.authority)) {
      fail('UNKNOWN_AUTHORITY', `Unknown authority: ${source.authority}`)
    }
  }
  assertExactArray(
    contract.canonicalSources,
    EXPECTED_CANONICAL_SOURCES,
    'CANONICAL_SOURCE_SET_MISMATCH',
    'canonicalSources'
  )

  if (!Array.isArray(contract.outputs) || contract.outputs.length === 0) {
    fail('INVALID_OUTPUTS', 'coldStart.outputs must be a non-empty array')
  }

  const ids = new Set()
  const outputPaths = new Set()
  const foldedPaths = new Set()
  const orders = new Set()
  const sourceSet = new Set(contract.canonicalSources.map(source => source.path))
  const orderById = new Map()

  for (const output of contract.outputs) {
    if (!output || typeof output !== 'object')
      fail('INVALID_OUTPUT', 'Output declaration must be an object')
    assertExactArray(
      Object.keys(output).sort(),
      OUTPUT_DECLARATION_FIELDS,
      'OUTPUT_DECLARATION_FIELDS_MISMATCH',
      `${output.id ?? 'unknown'}.fields`
    )
    if (typeof output.id !== 'string' || output.id.length === 0)
      fail('INVALID_OUTPUT_ID', 'Output id is required')
    if (ids.has(output.id)) fail('DUPLICATE_OUTPUT_ID', `Duplicate output id: ${output.id}`)
    ids.add(output.id)

    validateRelativePath(output.path)
    const normalized = path.posix.normalize(output.path)
    const folded = normalized.toLocaleLowerCase('en-US')
    if (outputPaths.has(normalized))
      fail('DUPLICATE_OUTPUT_PATH', `Duplicate output path: ${output.path}`)
    if (foldedPaths.has(folded))
      fail('CASE_FOLD_PATH_COLLISION', `Case-fold output collision: ${output.path}`)
    outputPaths.add(normalized)
    foldedPaths.add(folded)

    if (!Number.isSafeInteger(output.order) || output.order < 0)
      fail('INVALID_OUTPUT_ORDER', `Invalid order: ${output.id}`)
    if (orders.has(output.order))
      fail('DUPLICATE_OUTPUT_ORDER', `Duplicate output order: ${output.order}`)
    orders.add(output.order)
    orderById.set(output.id, output.order)

    if (!COLD_START_ENUMS.outputKinds.includes(output.kind))
      fail('UNKNOWN_OUTPUT_KIND', `Unknown output kind: ${output.kind}`)
    if (!Array.isArray(output.targetClients) || output.targetClients.length === 0) {
      fail('INVALID_TARGET_CLIENTS', `targetClients must be a non-empty array: ${output.id}`)
    }
    const targetClients = new Set()
    for (const client of output.targetClients) {
      if (!COLD_START_ENUMS.clients.includes(client))
        fail('UNKNOWN_CLIENT', `Unknown client: ${client}`)
      if (targetClients.has(client))
        fail('DUPLICATE_TARGET_CLIENT', `Duplicate target client: ${output.id} -> ${client}`)
      targetClients.add(client)
    }
    if (output.id === 'ROOT_AGENTS' && !targetClients.has('agents-aware')) {
      fail('ROOT_AGENTS_MISSING_AGENTS_AWARE', 'ROOT_AGENTS must target agents-aware')
    }
    if (!COLD_START_ENUMS.discoveryRoles.includes(output.discoveryRole)) {
      fail('UNKNOWN_DISCOVERY_ROLE', `Unknown discovery role: ${output.discoveryRole}`)
    }
    if (!COLD_START_ENUMS.authorities.includes(output.authority)) {
      fail('UNKNOWN_AUTHORITY', `Unknown authority: ${output.authority}`)
    }
    if (!COLD_START_ENUMS.contentContracts.includes(output.contentContract)) {
      fail('UNKNOWN_CONTENT_CONTRACT', `Unknown content contract: ${output.contentContract}`)
    }
    if (output.owner !== GENERATOR_OWNER)
      fail('INVALID_OUTPUT_OWNER', `Invalid owner: ${output.id}`)
    if (output.validationOwner !== VALIDATION_OWNER)
      fail('INVALID_OUTPUT_VALIDATION_OWNER', `Invalid validation owner: ${output.id}`)
    if (output.freshCloneRequired !== true)
      fail('INVALID_FRESH_CLONE_STATE', `Invalid fresh-clone state: ${output.id}`)
    if (output.tracked !== true)
      fail('INVALID_TRACKED_STATE', `Invalid tracked state: ${output.id}`)
    if (!Array.isArray(output.sourceDependencies) || !Array.isArray(output.outputDependencies)) {
      fail('INVALID_DEPENDENCIES', `Dependencies must be arrays: ${output.id}`)
    }
    for (const source of output.sourceDependencies) {
      validateRelativePath(source)
      if (!sourceSet.has(source))
        fail('UNKNOWN_SOURCE_DEPENDENCY', `Unknown source dependency: ${source}`)
    }
  }

  for (const output of contract.outputs) {
    const dependencies = new Set()
    for (const dependency of output.outputDependencies) {
      if (dependencies.has(dependency))
        fail('DUPLICATE_DEPENDENCY', `Duplicate dependency: ${output.id} -> ${dependency}`)
      dependencies.add(dependency)
      if (!ids.has(dependency))
        fail('UNKNOWN_DEPENDENCY', `Unknown dependency: ${output.id} -> ${dependency}`)
    }
  }

  const graph = buildDependencyGraph(manifest)
  const sortedIds = topologicalSort(graph, orderById)

  const actualIds = [...ids].sort()
  const expectedIds = EXPECTED_OUTPUTS.map(output => output.id).sort()
  if (JSON.stringify(actualIds) !== JSON.stringify(expectedIds)) {
    fail('OUTPUT_SET_MISMATCH', 'Manifest must declare exactly the six cold-start outputs')
  }

  const expectedById = new Map(EXPECTED_OUTPUTS.map(output => [output.id, output]))
  for (const output of contract.outputs) {
    const expected = expectedById.get(output.id)
    const fieldCodes = {
      path: 'OUTPUT_PATH_MISMATCH',
      kind: 'OUTPUT_KIND_MISMATCH',
      discoveryRole: 'OUTPUT_DISCOVERY_ROLE_MISMATCH',
      authority: 'OUTPUT_AUTHORITY_MISMATCH',
      contentContract: 'OUTPUT_CONTENT_CONTRACT_MISMATCH',
      order: 'OUTPUT_ORDER_MISMATCH',
    }
    for (const [field, diagnostic] of Object.entries(fieldCodes)) {
      if (output[field] !== expected[field]) fail(diagnostic, `${output.id}.${field} is invalid`)
    }
    assertExactArray(
      output.targetClients,
      expected.targetClients,
      'OUTPUT_TARGET_CLIENTS_MISMATCH',
      `${output.id}.targetClients`
    )
    assertExactArray(
      output.sourceDependencies,
      expected.sourceDependencies,
      'SOURCE_DEPENDENCY_MISMATCH',
      `${output.id}.sourceDependencies`
    )
    assertExactArray(
      output.outputDependencies,
      expected.outputDependencies,
      'OUTPUT_DEPENDENCY_MISMATCH',
      `${output.id}.outputDependencies`
    )
  }

  const declaredOrder = contract.outputs.map(output => output.id)
  const expectedOrder = [...contract.outputs]
    .sort((left, right) => left.order - right.order)
    .map(output => output.id)
  if (JSON.stringify(declaredOrder) !== JSON.stringify(expectedOrder)) {
    fail('UNSTABLE_OUTPUT_ORDER', 'Outputs must be declared in stable order')
  }
  if (JSON.stringify(sortedIds) !== JSON.stringify(expectedOrder)) {
    fail('NON_TOPOLOGICAL_OUTPUT_ORDER', 'Declared order must be topological')
  }

  assertNoPathCollisions([
    ...contract.canonicalSources.map(source => ({
      kind: `canonical-source:${source.authority}`,
      value: source.path,
    })),
    ...contract.outputs.map(output => ({ kind: `output:${output.id}`, value: output.path })),
  ])

  if (checkFileSystem) {
    for (const source of contract.canonicalSources)
      validatePathContainment(root, source.path, { mustExist: true })
    for (const output of contract.outputs)
      validatePathContainment(root, output.path, { output: true })
  }

  return { contract, graph, sortedIds }
}

export function loadManifest({ root = process.cwd(), manifestPath = MANIFEST_PATH } = {}) {
  validateRelativePath(manifestPath)
  const absolute = path.join(root, manifestPath)
  let raw
  try {
    raw = fs.readFileSync(absolute, 'utf8')
  } catch (error) {
    fail('MANIFEST_READ_FAILED', `Unable to read ${manifestPath}`, { cause: error.code })
  }
  let manifest
  try {
    manifest = JSON.parse(raw)
  } catch {
    fail('MANIFEST_JSON_INVALID', `${manifestPath} is not valid JSON`)
  }
  return { manifest, raw, manifestPath }
}

const escapeMarkdownText = value => value.replaceAll('*', '\\*')
const bulletList = items => items.map(item => `- ${escapeMarkdownText(item)}`).join('\n')
const numberedList = items =>
  items.map((item, index) => `${index + 1}. ${escapeMarkdownText(item)}`).join('\n')

const renderRoutingActivation = manifest => {
  const projectUi = manifest.projectUi
  return `- Generic UI evidence routes to the stable primary Skill ID ${projectUi.activation.genericUiPrimarySkill}.
- New page or route composition routes to project-ui + task-orchestrator + vue when explicit creation evidence is present.
- Non-UI Vue work can route to vue without activating project-ui.
- Browser validation activates only from explicit browser, screenshot, navigation, Playwright, or runtime evidence.
- Motion Skills activate only from their own explicit engine evidence; there is no legacy generic design chain.
- Node is primary: node ${projectUi.nodeRouter} "<task>" --json.
- Python is fallback: python3 ${projectUi.pythonFallback} "<task>" --json.
- Validate routing with node ${projectUi.validator}.
- Synchronize Codex with ${projectUi.syncCommands.codex}, Claude with ${projectUi.syncCommands.claude}, or both with ${projectUi.syncCommands.combined}.
- Repository .ai/skills/\\*\\* sources are canonical; synchronized Codex and Claude copies are noncanonical runtime materializations.`
}

const renderSharedEntry = manifest => `# AI Entry (Unified)

Canonical AI protocol is:

- ${manifest.canonicalProtocol}

Load this entrypoint, then continue with:

${numberedList(manifest.loadOrder)}

This file is the shared entrypoint target for:

${bulletList(manifest.entryTargets)}

Per-AI adapter guidance:

${Object.entries(manifest.adapterGuides)
  .map(([name, relPath]) => `- ${name}: ${relPath}`)
  .join('\n')}

Current repo defaults:

${bulletList(manifest.repoDefaults)}

Core mandate:

${bulletList(manifest.coreMandate)}

Deterministic Skill routing:

${renderRoutingActivation(manifest)}

Generated from:

- .ai/protocol/adapter-manifest.json
`

const renderAdapterIndex = manifest => `# AI Adapter Index

These adapter notes explain how each AI tool discovers configuration in this repository.

${Object.entries(manifest.adapterGuides)
  .map(([name, relPath]) => `- ${name}: ${path.posix.basename(relPath)}`)
  .join('\n')}

Canonical policy:

- Edit .ai/protocol/adapter-manifest.json and .ai/\\*\\* sources only.
- Run pnpm ai:sync to materialize generated adapter files.
${renderRoutingActivation(manifest)}
`

const renderCodexAdapter = manifest => {
  const codex = manifest.codex
  return `# Codex Adapter Guide

## Discovery Entry

${bulletList(codex.discovery)}

## What to Load First

${numberedList(manifest.loadOrder)}

## Skill Mapping

${bulletList(codex.skillMapping)}

## Auto-Trigger Hints

${bulletList(codex.triggerHints)}

## Deterministic Routing and Synchronization

${renderRoutingActivation(manifest)}

## Health Commands

${bulletList(codex.healthCommands)}

Generated from:

- .ai/protocol/adapter-manifest.json
`
}

const renderClaudeAdapter = manifest => {
  const claude = manifest.claude
  const metadata = manifest.adapterMetadata.Claude
  return `# Claude AI Adapter Guide

## Discovery Entry

${bulletList(claude.discovery)}

## Canonical Entrypoint

- ${claude.entrypoint}

## Protocol Load Order

${numberedList(manifest.loadOrder)}

## Capability Boundary

- Capabilities: ${metadata.capabilityMatrix.join(', ')}.
- Projection rules: ${metadata.projectionRules.join(', ')}.
- Canonical repository policy remains owned by ${manifest.canonicalProtocol}.

## Deterministic Routing and Synchronization

${renderRoutingActivation(manifest)}

## Health Commands

${bulletList(claude.healthCommands)}

Generated from:

- .ai/protocol/adapter-manifest.json
`
}

const renderRootClaude = manifest => `# Claude AI Entry

Read the tracked repository AI entrypoints:

- [AGENTS.md](./AGENTS.md)
- [.ai/protocol/AGENTS.core.md](./.ai/protocol/AGENTS.core.md)
- [.ai/protocol/adapters/claude.md](./.ai/protocol/adapters/claude.md)

Do not duplicate AI protocol content here. This compatibility entry is generated from .ai/protocol/adapter-manifest.json by scripts/generate-ai-protocol-adapters.mjs.

Deterministic Skill routing:

${renderRoutingActivation(manifest)}
`

export function renderOutputs(manifest, { root = process.cwd(), checkFileSystem = true } = {}) {
  const { sortedIds } = validateManifest(manifest, { root, checkFileSystem })
  const declarationById = new Map(manifest.coldStart.outputs.map(output => [output.id, output]))
  const outputs = new Map()

  for (const id of sortedIds) {
    const declaration = declarationById.get(id)
    let content
    switch (declaration.contentContract) {
      case 'claude-adapter':
        content = renderClaudeAdapter(manifest)
        break
      case 'codex-adapter':
        content = renderCodexAdapter(manifest)
        break
      case 'adapter-index':
        content = renderAdapterIndex(manifest)
        break
      case 'shared-entry':
        content = renderSharedEntry(manifest)
        break
      case 'root-agents':
        content = outputs.get('AI_ENTRY')
        break
      case 'root-claude':
        content = renderRootClaude(manifest)
        break
      default:
        fail('UNKNOWN_CONTENT_CONTRACT', `Unknown content contract: ${declaration.contentContract}`)
    }
    outputs.set(id, normalizeGeneratedBytes(content))
  }

  return outputs
}

export function digestCanonicalSources(manifest, { root = process.cwd() } = {}) {
  validateManifest(manifest, { root })
  return new Map(
    manifest.coldStart.canonicalSources.map(source => [
      source.path,
      sha256(fs.readFileSync(path.join(root, source.path))),
    ])
  )
}

export function fingerprintOutputs(
  manifest,
  outputs,
  sourceDigests,
  { root = process.cwd(), checkFileSystem = true } = {}
) {
  const { sortedIds } = validateManifest(manifest, { root, checkFileSystem })
  const declarations = new Map(manifest.coldStart.outputs.map(output => [output.id, output]))
  const fingerprints = new Map()

  for (const id of sortedIds) {
    const declaration = declarations.get(id)
    const bytes = outputs.get(id)
    if (!Buffer.isBuffer(bytes)) fail('MISSING_EXPECTED_BYTES', `Expected bytes are missing: ${id}`)
    const payload = {
      declaration,
      canonicalSources: declaration.sourceDependencies.map(source => ({
        path: source,
        digest: sourceDigests.get(source),
      })),
      outputDependencies: declaration.outputDependencies.map(dependency => ({
        id: dependency,
        fingerprint: fingerprints.get(dependency),
      })),
      expectedBytesSha256: sha256(bytes),
    }
    fingerprints.set(id, sha256(canonicalSerialize(payload)))
  }

  return fingerprints
}

const assertDeclaredOutputMap = (manifest, outputs) => {
  const declared = manifest.coldStart.outputs.map(output => output.id).sort()
  const actual = [...outputs.keys()].sort()
  if (JSON.stringify(actual) !== JSON.stringify(declared)) {
    fail('UNDECLARED_WRITE', 'Output map must contain exactly the declared outputs')
  }
  for (const [id, bytes] of outputs) {
    if (!Buffer.isBuffer(bytes))
      fail('INVALID_OUTPUT_BYTES', `Output bytes must be a Buffer: ${id}`)
    if (!bytes.equals(normalizeGeneratedBytes(bytes))) {
      fail('NON_CANONICAL_OUTPUT_BYTES', `Output must use UTF-8, LF, and one final newline: ${id}`)
    }
  }
}

export function compareOutputs(manifest, outputs, { root = process.cwd() } = {}) {
  validateManifest(manifest, { root })
  assertDeclaredOutputMap(manifest, outputs)
  return manifest.coldStart.outputs.map(declaration => {
    const expected = outputs.get(declaration.id)
    const absolute = path.join(root, declaration.path)
    const exists = fs.existsSync(absolute)
    const actual = exists ? fs.readFileSync(absolute) : null
    return {
      id: declaration.id,
      path: declaration.path,
      exists,
      matches: Boolean(actual?.equals(expected)),
      expectedSha256: sha256(expected),
      actualSha256: actual ? sha256(actual) : null,
    }
  })
}

export function writeOutputsTransactionally(manifest, outputs, { root = process.cwd() } = {}) {
  validateManifest(manifest, { root })
  assertDeclaredOutputMap(manifest, outputs)
  const comparison = compareOutputs(manifest, outputs, { root })
  const changedIds = new Set(comparison.filter(item => !item.matches).map(item => item.id))
  if (changedIds.size === 0) return { changed: [], unchanged: comparison.map(item => item.path) }

  const declarations = manifest.coldStart.outputs.filter(output => changedIds.has(output.id))
  const staged = []
  const originals = new Map()
  const replaced = []

  try {
    for (const [index, declaration] of declarations.entries()) {
      const destination = path.join(root, declaration.path)
      const parent = path.dirname(destination)
      const original = fs.existsSync(destination) ? fs.readFileSync(destination) : null
      const mode = fs.existsSync(destination) ? fs.statSync(destination).mode & 0o777 : 0o644
      originals.set(declaration.id, { original, mode, destination })
      const temporary = path.join(
        parent,
        `.${path.basename(destination)}.cold-start-${process.pid}-${index}.tmp`
      )
      if (fs.existsSync(temporary))
        fail('TEMPORARY_PATH_COLLISION', `Temporary path already exists: ${declaration.path}`)
      fs.writeFileSync(temporary, outputs.get(declaration.id), { encoding: null, flag: 'wx', mode })
      const verified = fs.readFileSync(temporary)
      if (!verified.equals(outputs.get(declaration.id))) {
        fail('TEMPORARY_BYTE_MISMATCH', `Temporary bytes differ: ${declaration.path}`)
      }
      staged.push({ declaration, temporary, destination })
    }

    for (const item of staged) {
      fs.renameSync(item.temporary, item.destination)
      replaced.push(item)
    }
  } catch (error) {
    const rollbackFailures = []
    for (const item of [...replaced].reverse()) {
      const snapshot = originals.get(item.declaration.id)
      let rollbackTemporary = null
      try {
        if (snapshot.original === null) {
          fs.rmSync(snapshot.destination, { force: true })
        } else {
          rollbackTemporary = `${snapshot.destination}.cold-start-rollback-${process.pid}.tmp`
          fs.writeFileSync(rollbackTemporary, snapshot.original, {
            flag: 'wx',
            mode: snapshot.mode,
          })
          fs.renameSync(rollbackTemporary, snapshot.destination)
        }
      } catch (rollbackError) {
        rollbackFailures.push({
          path: item.declaration.path,
          code: rollbackError.code ?? 'UNKNOWN',
        })
      } finally {
        if (rollbackTemporary) fs.rmSync(rollbackTemporary, { force: true })
      }
    }
    for (const item of staged) fs.rmSync(item.temporary, { force: true })
    if (rollbackFailures.length > 0) {
      fail('ROLLBACK_FAILED', 'Output transaction failed and rollback was incomplete', {
        rollbackFailures,
      })
    }
    fail('TRANSACTION_WRITE_FAILED', 'Output transaction failed and was rolled back', {
      cause: error.code ?? 'UNKNOWN',
    })
  } finally {
    for (const item of staged) fs.rmSync(item.temporary, { force: true })
  }

  return {
    changed: declarations.map(output => output.path),
    unchanged: comparison.filter(item => item.matches).map(item => item.path),
  }
}

export function runGeneratorCli(argv = process.argv.slice(2), { root = process.cwd() } = {}) {
  const valid = argv.length === 0 || (argv.length === 1 && argv[0] === '--check')
  if (!valid)
    fail('INVALID_ARGUMENTS', 'Usage: node scripts/generate-ai-protocol-adapters.mjs [--check]')
  const check = argv[0] === '--check'
  const { manifest } = loadManifest({ root })
  validateManifest(manifest, { root })
  const outputs = renderOutputs(manifest, { root })
  const sourceDigests = digestCanonicalSources(manifest, { root })
  fingerprintOutputs(manifest, outputs, sourceDigests, { root })
  const comparison = compareOutputs(manifest, outputs, { root })

  if (check) {
    const drift = comparison.filter(item => !item.matches)
    if (drift.length > 0) {
      for (const item of drift) console.error(`[AI-PROTOCOL:DRIFT] ${item.path}`)
      fail('OUTPUT_DRIFT', `${drift.length} generated output(s) differ`)
    }
    console.log('[AI-PROTOCOL:CHECK] six outputs are current')
    return { mode: 'check', changed: [] }
  }

  const result = writeOutputsTransactionally(manifest, outputs, { root })
  for (const relPath of result.changed) console.log(`[AI-PROTOCOL:WRITE] ${relPath}`)
  if (result.changed.length === 0) console.log('[AI-PROTOCOL] six outputs are current')
  return { mode: 'write', ...result }
}

const isDirectExecution =
  process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url

if (isDirectExecution) {
  try {
    runGeneratorCli()
  } catch (error) {
    const code =
      error instanceof ColdStartContractError ? error.code : 'UNEXPECTED_GENERATOR_FAILURE'
    console.error(`${code}: ${error.message}`)
    process.exitCode = 1
  }
}
