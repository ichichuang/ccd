---
title_en: GitHub Governance
title_zh: GitHub 治理
aliases:
  - GitHub workflows
  - Branch protection
  - 远端治理
  - 工作流治理
tags:
  - governance
  - github
  - ci
tags_zh:
  - 治理
  - GitHub
  - CI
status: verified
confidence: 0.9
source_langs:
  - en
  - zh
source_paths:
  - README.md
  - .ai/README.md
  - docs/governance/github-governance.md
  - .github/workflows/ci.yml
  - .github/workflows/deploy.yml
  - .github/CODEOWNERS
last_reviewed: '2026-06-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# GitHub Governance

GitHub governance covers branch protection expectations, workflow registry hygiene, CODEOWNERS, CI quality checks, deployment separation, and remote mutation discipline.

## Current workflow surfaces

- `.github/workflows/ci.yml` defines the quality gate workflow `CI Guardian` with `Core Quality` and `E2E QA` jobs.
- `.github/workflows/deploy.yml` defines GitHub Pages deployment and keeps deployment build separate from CI quality validation.
- The AI control plane documents active repo workflows as `ci.yml` and `deploy.yml`, with an active remote-managed Dependabot workflow and disabled historical desktop workflows.

## Operating rules

- Do not mutate remote GitHub settings unless a future remote-governance lane explicitly authorizes the operation.
- Keep `Core Quality` and `E2E QA` aligned with branch protection requirements.
- Keep `pnpm build:ci` as CI quality parity and `pnpm vercel:build` / Pages build behavior as deployment-specific.

## Validation commands

```bash
pnpm governance:github-workflows
pnpm governance:gate
pnpm build:ci
pnpm e2e:qa
```

## Evidence paths

This page is compiled from the following repository evidence paths:

- `README.md`
- `.ai/README.md`
- `docs/governance/github-governance.md`
- `.github/workflows/ci.yml`
- `.github/workflows/deploy.yml`
- `.github/CODEOWNERS`

## Related pages

- [[ci-and-deploy]]
- [[validation-gates]]
- [[strategic-guardrails]]
