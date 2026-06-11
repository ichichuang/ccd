#!/usr/bin/env node
import { readJson, writeText } from './utils.mjs'

const adapterManifest = readJson('.ai/protocol/adapter-manifest.json')
const protocolVersion = readJson('.ai/protocol/version.json')
const orchestration = readJson('.ai/orchestration/manifest.json')

const runtimeGraph = `graph TD\n  Contracts[packages/contracts\\ninterfaces only] --> Core[packages/core\\nruntime-neutral logic]\n  Core --> Web[apps/web-demo\\nweb-demo browser app shell]\n  Core --> Desktop[apps/desktop\\nTauri desktop runtime shell]\n  AI[.ai/**\\nSSOT governance] --> Protocol[Protocol ${protocolVersion.protocolVersion}]\n  Protocol --> Contracts\n  Protocol --> Core\n`

const governanceGraph = `graph TD\n  AI[.ai/**] --> Protocol[protocol]\n  AI --> Rules[rules]\n  AI --> Skills[skills]\n  AI --> Orchestration[orchestration]\n  AI --> Generated[generated]\n  Orchestration --> Roles[${orchestration.roles.map(role => role.id).join(' | ')}]\n`

const adapterGraph = `graph TD\n  Manifest[adapter-manifest.json] --> Codex[Codex adapter]\n  Manifest --> Claude[Claude adapter]\n  Manifest --> Versions[adapter version ${protocolVersion.adapterVersion}]\n  ${Object.keys(adapterManifest.adapterGuides).map(name => `${name}[${name}]`).join('\n  ')}\n`

writeText('wiki/generated/diagrams/runtime-topology.mmd', runtimeGraph)
writeText('wiki/generated/diagrams/governance-topology.mmd', governanceGraph)
writeText('wiki/generated/diagrams/adapter-topology.mmd', adapterGraph)
writeText('wiki/generated/architecture-overview.md', `---
title_en: Architecture Overview
title_zh: 架构概览
aliases:
  - Architecture Overview
tags:
  - generated
  - architecture
tags_zh:
  - 生成视图
  - 架构
status: published
confidence: 0.90
source_langs:
  - en
source_paths:
  - .ai/**
  - scripts/governance/visualize.mjs
last_reviewed: '2026-06-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# Architecture Overview\n\n## Generated diagrams\n\n- [Runtime topology](./diagrams/runtime-topology.mmd)\n- [Governance topology](./diagrams/governance-topology.mmd)\n- [Adapter topology](./diagrams/adapter-topology.mmd)\n`)
