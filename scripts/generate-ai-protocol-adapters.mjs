#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const cwd = process.cwd()
const manifestPath = path.join(cwd, '.ai', 'protocol', 'adapter-manifest.json')
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))

const writeText = (relPath, content) => {
  const absPath = path.join(cwd, relPath)
  fs.mkdirSync(path.dirname(absPath), { recursive: true })
  fs.writeFileSync(absPath, `${content.trimEnd()}\n`, 'utf8')
  console.log(`[AI-PROTOCOL] ${relPath} <= .ai/protocol/adapter-manifest.json`)
}

const escapeMarkdownText = value => value.replaceAll('*', '\\*')
const bulletList = items => items.map(item => `- ${escapeMarkdownText(item)}`).join('\n')
const numberedList = items =>
  items.map((item, index) => `${index + 1}. ${escapeMarkdownText(item)}`).join('\n')

function renderEntry() {
  return `# AI Entry (Unified)

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

Generated from:

- .ai/protocol/adapter-manifest.json
`
}

function renderAdapterReadme() {
  return `# AI Adapter Index

These adapter notes explain how each AI tool discovers configuration in this repository.

${Object.entries(manifest.adapterGuides)
  .map(([name, relPath]) => `- ${name}: ${path.basename(relPath)}`)
  .join('\n')}

Canonical policy:

- Edit .ai/protocol/adapter-manifest.json and .ai/** sources only.
- Run pnpm ai:sync to materialize generated adapter files.
`
}

function renderCodex() {
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

## Health Commands

${bulletList(codex.healthCommands)}

Generated from:

- .ai/protocol/adapter-manifest.json
`
}

function renderClaude() {
  const claude = manifest.claude
  return `# Claude AI Adapter Guide

## Discovery Entry

${bulletList(claude.discovery)}

## Canonical Entrypoint

- ${claude.entrypoint}

## Health Commands

${bulletList(claude.healthCommands)}

Generated from:

- .ai/protocol/adapter-manifest.json
`
}

function renderClaudeEntry() {
  return `# Claude AI Entry

Read the shared repository AI entrypoint:

- [AGENTS.md](./AGENTS.md)

Do not duplicate AI protocol content here. AGENTS.md is generated from .ai/protocol/AI.entry.md, which is generated from .ai/protocol/adapter-manifest.json.
`
}

writeText('.ai/protocol/AI.entry.md', renderEntry())
writeText('.ai/protocol/adapters/README.md', renderAdapterReadme())
writeText('.ai/protocol/adapters/codex.md', renderCodex())
writeText('.ai/protocol/adapters/claude.md', renderClaude())
writeText('CLAUDE.md', renderClaudeEntry())
