#!/usr/bin/env node
import { readJson, writeText } from './utils.mjs'

const adapterManifest = readJson('.ai/protocol/adapter-manifest.json')
const protocolVersion = readJson('.ai/protocol/version.json')
const orchestration = readJson('.ai/orchestration/manifest.json')

const runtimeGraph = `graph TD\n  Web[Web Runtime\\nmain] --> Shared[Shared Governance]\n  Desktop[Desktop Runtime\\ndesktop-version] --> Shared\n  Portable[Portable Runtime\\nmain-portable-version] --> Shared\n  Shared --> Protocol[Protocol ${protocolVersion.protocolVersion}]\n`

const governanceGraph = `graph TD\n  AI[.ai/**] --> Protocol[protocol]\n  AI --> Rules[rules]\n  AI --> Skills[skills]\n  AI --> Orchestration[orchestration]\n  AI --> Generated[generated]\n  Orchestration --> Roles[${orchestration.roles.map(role => role.id).join(' | ')}]\n`

const adapterGraph = `graph TD\n  Manifest[adapter-manifest.json] --> Codex[Codex adapter]\n  Manifest --> Claude[Claude adapter]\n  Manifest --> Versions[adapter version ${protocolVersion.adapterVersion}]\n  ${Object.keys(adapterManifest.adapterGuides).map(name => `${name}[${name}]`).join('\n  ')}\n`

writeText('docs/generated/diagrams/runtime-topology.mmd', runtimeGraph)
writeText('docs/generated/diagrams/governance-topology.mmd', governanceGraph)
writeText('docs/generated/diagrams/adapter-topology.mmd', adapterGraph)
writeText('docs/generated/architecture-overview.md', `# Architecture Overview\n\n## Generated diagrams\n\n- [Runtime topology](./diagrams/runtime-topology.mmd)\n- [Governance topology](./diagrams/governance-topology.mmd)\n- [Adapter topology](./diagrams/adapter-topology.mmd)\n`)
