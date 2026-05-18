# AI Orchestration

CCD orchestration is declared under `.ai/orchestration/**`.

## Governance model

The orchestration layer defines:

- agent roles
- execution scopes
- governance permissions
- protocol routing
- task delegation rules

## Runtime gate

Orchestrated agents must pass `pnpm env:doctor` before running architecture or governance automation. If a shell wrapper shadows `node` or `pnpm`, use `bash scripts/exec.sh <command>` so execution resolves the pinned binaries directly.

## Current manifest

- `.ai/orchestration/manifest.json`

## Validation

- `pnpm orchestration:validate`
- `pnpm env:doctor`
- `pnpm runtime:env`
- `pnpm governance:validate`
