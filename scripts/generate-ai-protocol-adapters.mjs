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

const bulletList = items => items.map(item => `- ${item}`).join('\n')
const numberedList = items => items.map((item, index) => `${index + 1}. ${item}`).join('\n')

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

Gemini AICC routing assets:

${bulletList(manifest.routingAssets)}

Current repo defaults:

${bulletList(manifest.repoDefaults)}

Cross-project full-stack defaults:

${bulletList(manifest.crossProjectDefaults)}

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

function renderCursor() {
  const cursor = manifest.cursor
  return `# Cursor Adapter Guide

## Discovery Entry

Cursor expects:

${bulletList(cursor.expects)}

In this repo:

${bulletList(cursor.generatedFrom)}

## Canonical Policy

- Edit only .ai/** as source-of-truth.
- .cursor/** is generated compatibility output.

## Health Commands

${bulletList(cursor.healthCommands)}

Generated from:

- .ai/protocol/adapter-manifest.json
`
}

function renderGemini() {
  const gemini = manifest.gemini
  return `# Gemini Adapter Guide (CCD AICC)

## Role

${bulletList(gemini.role)}

## 0) Mandatory Context Loading

Before any reasoning:

1. Load .ai/ as the only AI-native source of truth.
2. Apply strict priority:
${gemini.contextPriority.map(item => `   - ${item}`).join('\n')}
3. Do not load everything blindly: map intent first, load only relevant rules/skills, and ignore unrelated modules.

If conflicts occur: rules > skills > existing code.

## 1) Mandatory Pre-Execution Protocol

${numberedList(gemini.preExecution)}

## 2) Execution Model

${bulletList(gemini.executionPhases)}

## 3) Output Contract (Strict)

${numberedList(gemini.outputContract)}

## 4) Forced Trigger Syntax

- [USE SKILL]: <skill-id-or-path>
- [USE RULE]: <rule-id-or-path>

## 5) Hard Constraints

${bulletList(gemini.hardConstraints)}

Generated from:

- .ai/protocol/adapter-manifest.json
`
}

writeText('.ai/protocol/AI.entry.md', renderEntry())
writeText('.ai/protocol/adapters/README.md', renderAdapterReadme())
writeText('.ai/protocol/adapters/codex.md', renderCodex())
writeText('.ai/protocol/adapters/cursor.md', renderCursor())
writeText('.ai/protocol/adapters/gemini.md', renderGemini())
