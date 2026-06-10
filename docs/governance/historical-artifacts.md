# Historical Artifact Policy

This document labels repository-resident historical and generated-adjacent artifacts that are easy to mistake for active source.

## Current Decisions

### `output/playwright/**`

`output/` is ignored by `.gitignore` and is treated as local Playwright or browser-debug output. Most files under `output/playwright/**` are ignored local evidence such as screenshots and verification scripts. They are not source-of-truth inputs for governance, tests, or product behavior.

One legacy image is tracked:

- `output/playwright/midnight-classic-light.png`

Keep that tracked file as historical visual evidence until a future owner-approved archive lane moves or removes it. Do not add new tracked files under `output/playwright/**` in ordinary development. New durable visual evidence belongs under a documented `docs/ai-runs/**` evidence directory or an explicitly approved governance snapshot path.

### `ccd-public-layer-repair-plan-package/**`

`ccd-public-layer-repair-plan-package/**` is a tracked historical planning and evidence package for the 2026-06 public-layer repair work. It is not an active implementation plan and should not be used as the current governance source of truth.

Current active governance state remains under:

- `.ai/**`
- `docs/governance/**`
- root and workspace manifests
- generated reports refreshed by repository scripts

Do not duplicate new authored governance state into `ccd-public-layer-repair-plan-package/**`. Reference it only when historical traceability is needed.

## Validation

The labeling decision is documentation-only. Relevant guards are:

- `pnpm project:doctor`
- `pnpm docs:commands`
- `pnpm governance:gate`
