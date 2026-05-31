# P9 Review Package — Commit Grouping Proposal

Generated: 2026-06-01  
**No commits performed in P9.**

## Proposed commit groups

### G1 — Governance policies and generated reports

| field | value |
|---|---|
| scope | `.ai/governance/policies/*`, `.ai/generated/governance-report.json`, `docs/generated/**`, `.ai/governance/api-snapshots/ccd__vue-app-platform.json` |
| rationale | M1–M2/M14 validation-generated outputs; must stay command-owned |
| validation | `pnpm validate:governance`, `pnpm api:report` |
| risk | medium — large generated diff |
| suggested_commit_subject_zh | 同步治理策略与命令生成的治理/API 报告产物 |
| suggested_commit_body_zh | 包含 topology/runtime/api 策略更新及 governance:gate 再生的 api-surface、governance-report、dependency graphs。禁止手工编辑 generated 文件；以 pnpm validate:governance 日志为证据。 |

### G2 — Platform package source (M8–M13a)

| field | value |
|---|---|
| scope | `packages/design-tokens/src/**`, `packages/vue-app-platform/src/**` |
| rationale | theme/size resolver and layout runtime foundation lanes |
| validation | `pnpm type-check`, `pnpm ci:smoke:packages`, P8 build logs |
| risk | medium — runtime behavior in packages |
| suggested_commit_subject_zh | 落地 design-tokens 与 vue-app-platform 架构修复基线 |
| suggested_commit_body_zh | 包含 M8 尺寸解析器公开 API 与 M10 layout runtime 相关变更；验证见 P8 command-logs。 |

### G3 — Web-demo runtime, config, and tests

| field | value |
|---|---|
| scope | `apps/web-demo/src/stores/**`, `apps/web-demo/src/utils/**`, `apps/web-demo/tsconfig.json`, `apps/web-demo/src/hooks/modules/*.spec.ts`, `apps/web-demo/src/types/auto-imports.d.ts` |
| rationale | M7a–M11 inherited source/test repairs + P4 safeStorage facade comment |
| validation | `pnpm --filter @ccd/web-demo test`, `pnpm type-check`, P4 piniaSerializer spec |
| risk | medium |
| suggested_commit_subject_zh | 收敛 web-demo 设备/布局/store 与 safeStorage 边界注释 |
| suggested_commit_body_zh | 含 M8–M11 继承变更及 P4 非 crypto safeStorage 门面所有权注释；不含 crypto/compression 迁移。 |

### G4 — Architecture docs, ai-plan, and P0–P9 evidence

| field | value |
|---|---|
| scope | `docs/ai-plan/**`, `docs/architecture/**`, `docs/en/**`, `docs/zh/**`, `docs/runtime/**`, `README.md`, `docs/ai-runs/20260531-*`, `docs/ai-runs/20260601-*` |
| rationale | M14–M16a + post-M16 blocker program evidence and status surfaces |
| validation | `pnpm docs:commands`, P8 FINAL_GO_NO_GO |
| risk | low–medium — large evidence tree |
| suggested_commit_subject_zh | 归档 M14–P9 架构修复证据与 NO_GO 状态文档 |
| suggested_commit_body_zh | 更新 ARCHITECTURE_ISSUE_REPAIR_LOG、DECISIONS（D-016/D-017/D-019 批准）、STATUS、FINAL_GO_NO_GO；附带 P0–P9 ai-runs 证据包。 |

### G5 — Tooling and governance scripts

| field | value |
|---|---|
| scope | `scripts/ai-route-view-scaffold.mjs`, `scripts/architecture/**`, `scripts/ci/**`, `scripts/normalize-generated-output.mjs`, `scripts/upgrade-all-themes.mjs`, `scripts/validate-token-contrast.ts`, `.ai/rules/components/*.mdc` |
| rationale | M13a scaffold alignment + architecture validators |
| validation | `pnpm ai:guard`, `pnpm arch:boundaries` |
| risk | low |
| suggested_commit_subject_zh | 对齐脚手架与架构校验脚本基线 |
| suggested_commit_body_zh | M15 scaffold 类型导入修复及 M1–M13a 架构脚本继承变更。 |

### G6 — Desktop config

| field | value |
|---|---|
| scope | `apps/desktop/tsconfig.json` |
| rationale | M13 tsconfig boundary repair |
| validation | `pnpm build:desktop` (P8 pass) |
| risk | low |
| suggested_commit_subject_zh | 修复 desktop tsconfig 包边界引用 |
| suggested_commit_body_zh | M13 tsconfig build boundary repair。 |

## Commit order recommendation

G5 → G2 → G3 → G6 → G1 → G4 (tooling/packages before generated regen; docs/evidence last)

## P9 validation evidence

- `command-logs/02-pnpm-type-check.log` — pass
- `command-logs/03-pnpm-test-run.log` — pass
- `command-logs/04-pnpm-ai-guard.log` — pass
- `command-logs/04-pnpm-validate-governance.log` — pass (if present)
- P8 `build:web-demo`, `build:desktop`, `build:ci` — pass
