---
title_en: CI and Deploy
title_zh: CI 与部署
aliases:
  - GitHub Actions
  - Deploy
  - CI 部署
tags:
  - operations
  - ci
  - deploy
tags_zh:
  - 运维
  - CI
  - 部署
status: verified
confidence: 0.91
source_langs:
  - en
  - zh
source_paths:
  - .github/workflows/ci.yml
  - .github/workflows/deploy.yml
  - README.en.md
  - wiki/**
  - wiki/**
  - package.json
last_reviewed: '2026-06-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# CI and Deploy

GitHub Actions is the quality gate. Vercel and GitHub Pages are deployment build targets and must not be confused with CI quality validation.

## Current workflows

- `.github/workflows/ci.yml` runs `CI Guardian` on `main`, `develop`, and pull requests to `main`. It has `Core Quality` and `E2E QA` jobs.
- `.github/workflows/deploy.yml` runs GitHub Pages deployment on pushes to `main` and manual dispatch.
- CI installs pnpm `10.28.2`, sets up Node.js `24.x`, and runs frozen install through `scripts/exec.sh`.

## Separation rule

- `pnpm build:ci` is CI quality parity.
- `pnpm vercel:build` is the Vercel deployment build.
- `pnpm build:web-demo` plus Pages artifact upload is GitHub Pages deployment.

## Validation commands

```bash
pnpm build:ci
pnpm e2e:qa
pnpm vercel:build
pnpm build:web-demo
pnpm governance:github-workflows
```

## Evidence paths

This page is compiled from the following repository evidence paths:

- `.github/workflows/ci.yml`
- `.github/workflows/deploy.yml`
- `README.en.md`
- `wiki/**`
- `wiki/**`
- `package.json`

## Related pages

- [[github-governance]]
- [[validation-gates]]
- [[command-surface]]
