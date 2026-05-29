# Governance / Guard / GitHub 治理 — Issue Details

## GOV-001

- Priority: `P0`
- Severity: `High`
- Status: `BLOCKED_BY_OWNER`

### Paths

- `.ai/runtime/owner_decisions.md`
- `.ai/runtime/rule_coverage_matrix.md`
- `scripts/ai-architecture-guard.mjs`

### Problem

guard coverage、rule contradictions、design-token canonical file、desktop drift CI 多项 owner decisions pending。

### Best solution

一次只决策一个 owner decision；为每个决策写 ADR，随后再加 guard。不要未审批直接扩大 guard。

### Validation

```bash
pnpm ai:doctor && pnpm ai:guard && pnpm docs:commands
```

## GOV-002

- Priority: `P1`
- Severity: `High`
- Status: `OPEN`

### Paths

- `docs/ai-plan/FINAL_GO_NO_GO.md`
- `docs/ai-plan/FINAL_VALIDATION_MATRIX.md`
- `docs/ai-plan/CHANGE_SUMMARY.md`

### Problem

最终状态是 NO_GO，原因不是全量验证失败，而是 blocker 未解除/未接受。

### Best solution

将 blocker 转化为 owner-accepted exception 或实际修复 lane；每个 blocker 必须有 owner、due date、exit criteria。

### Validation

```bash
pnpm ai:doctor --open && open actionable scan
```

## GOV-003

- Priority: `P1`
- Severity: `Medium`
- Status: `BLOCKED_BY_OPERATOR`

### Paths

- `.github/workflows/ci.yml`
- `.github/CODEOWNERS`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `.github/ISSUE_TEMPLATE/**`

### Problem

.github/\*\* 变更与 remote branch protection 需要 operator approval。

### Best solution

审批后设置 required checks：Core Quality、E2E smoke、governance gate、type-check、lint、build:ci；CODEOWNERS 覆盖 .ai/docs/packages/apps/workflows。

### Validation

```bash
GitHub branch protection review + PR dry run
```

## GOV-004

- Priority: `P1`
- Severity: `Medium`
- Status: `OPEN`

### Paths

- `docs/generated/**`
- `.ai/generated/**`
- `.ai/governance/api-snapshots/**`
- `package.json`

### Problem

generated artifacts 必须用官方命令刷新，不能手改；治理 gate 可能要求 generated-sync rerun。

### Best solution

所有涉及 API/dependency/graph/supply-chain 的变更后运行 pnpm governance:refresh，再运行 pnpm governance:gate；文档明确 generated drift 处理流程。

### Validation

```bash
pnpm governance:refresh && pnpm governance:gate && git diff --check
```

## GOV-005

- Priority: `P2`
- Severity: `Medium`
- Status: `OPEN`

### Paths

- `docs/ai-plan/NEXT_ACTIONS.md`
- `docs/ai-plan/PLAN.md`
- `docs/en/architecture-contract.md`

### Problem

部分计划文档存在历史阶段段落，与当前“下一步 B-007”存在语义 drift。

### Best solution

重写 Next Actions 为当前优先级版本；保留历史内容到 archived section，避免 AI/人误执行旧 M2 建议。

### Validation

```bash
pnpm docs:commands
```
