---
title_en: Execute Reliability
title_zh: 执行可靠性
aliases:
  - Deterministic execution
  - scripts/exec.sh
  - 确定性执行
tags:
  - runtime
  - operations
  - commands
tags_zh:
  - 运行时
  - 运维
  - 命令
status: verified
confidence: 0.89
source_langs:
  - en
source_paths:
  - docs/runtime/execute-reliability.md
  - docs/adr/ADR-004-runtime-environment-policy.md
  - package.json
  - scripts/env.sh
  - scripts/exec.sh
  - mise.toml
  - .github/workflows/ci.yml
last_reviewed: '2026-06-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# Execute Reliability

CCD treats command execution as an architecture surface. The repository uses deterministic wrappers and aligned toolchain policy so local shells, CI, Turbo tasks, and AI/Codex execution do not silently run different Node or pnpm binaries.

## Current policy

- Node.js `24.x` is the intentional engine lane.
- `package.json`, `mise.toml`, GitHub Actions setup, `@tsconfig/node24`, and `@types/node@24` are aligned.
- Critical commands run through `scripts/exec.sh` where documented.
- `scripts/env.sh` supports deterministic runtime setup and mise activation when available.
- Do not relax engines in unrelated cleanup, dependency, UI, or desktop branches.

## Validation commands

```bash
pnpm runtime:env
pnpm runtime:exec
pnpm env:doctor
pnpm project:doctor
pnpm validate
```

## Evidence paths

This page is compiled from the following repository evidence paths:

- `docs/runtime/execute-reliability.md`
- `docs/adr/ADR-004-runtime-environment-policy.md`
- `package.json`
- `scripts/env.sh`
- `scripts/exec.sh`
- `mise.toml`
- `.github/workflows/ci.yml`

## Related pages

- [[command-surface]]
- [[validation-gates]]
- [[adr-004-runtime-environment-policy]]
