# Adapter Architecture

Adapters are protocol projection targets, not canonical prompt sources.

## Canonical source

- `.ai/protocol/adapter-manifest.json`
- `.ai/protocol/version.json`

## Adapter interface

Each adapter declares:

- metadata
- capability matrix
- compatibility rules
- projection rules
- validation hooks

## Current targets

- Codex
- Claude
- future AI runtimes can be added through the same projection model

## Validation

- `pnpm ai:sync`
- `pnpm adapters:validate`
