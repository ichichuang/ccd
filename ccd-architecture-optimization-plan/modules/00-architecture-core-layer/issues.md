# 架构核心层与平台抽取 — Issue Details

## ARCH-001

- Priority: `P0`
- Severity: `High`
- Status: `DONE`

### Paths

- `docs/en/architecture-contract.md`
- `docs/architecture/ownership-boundaries.md`
- `docs/ai-plan/SPEC.md`
- `docs/ai-plan/PLAN.md`

### Problem

“common core layer” 容易被误解为把所有通用能力迁入 packages/core，违背 packages/core runtime-neutral facade 的定位。

### Best solution

将 common platform layer 明确定义为 packages/\* 平台层组合；packages/core 只保留 runtime-neutral orchestration。ADR-005 固化分层术语。

### Validation

```bash
pnpm docs:commands && pnpm arch:graphs && pnpm api:report
```

## ARCH-002

- Priority: `P0`
- Severity: `High`
- Status: `DONE`

### Paths

- `packages/core/src/index.ts`
- `packages/contracts/src/index.ts`
- `packages/*/package.json`
- `apps/*/package.json`

### Problem

平台抽取缺少统一判定标准，容易把 Vue/PrimeVue/browser runtime 误迁入 contracts/core。

### Best solution

已建立 extraction decision matrix：pure DTO -> contracts；runtime-neutral orchestration -> core；pure utils -> shared-utils；Vue/browser composables -> vue-hooks；app bootstrap/layout runtime -> vue-app-platform；UI primitives -> vue-ui；PrimeVue config -> vue-primevue-adapter；app-specific runtime -> apps adapters。

### Validation

```bash
pnpm arch:runtime && pnpm arch:boundaries && pnpm api:report
```

## ARCH-003

- Priority: `P1`
- Severity: `Medium`
- Status: `DONE`

### Paths

- `apps/web-demo/package.json`
- `apps/desktop/package.json`

### Problem

apps package manifests 暴露 ./src/main.ts；语义上像库入口，但 apps 目标应是项目壳，不应作为公共 API 被其他 workspace 消费。

### Best solution

移除 apps/_ package exports，或增加 explicit private app-only export policy 并让 api surface 报告忽略 apps exports；禁止其他 apps/package import apps/_。

### Validation

```bash
pnpm api:report && pnpm arch:boundaries && pnpm ci:smoke:packages
```

## ARCH-004

- Priority: `P1`
- Severity: `Medium`
- Status: `OPEN`

### Paths

- `docs/en/architecture-contract.md`
- `packages/shared-utils/src/createCapabilityBridge.ts`
- `packages/shared-utils/src/index.ts`

### Problem

架构文档仍把 createCapabilityBridge 列为 app-local candidate，但当前实现已在 packages/shared-utils。

### Best solution

已修正文档 drift：createCapabilityBridge 属于 shared-utils pure utility；保留 apps/web-demo/infra/auth 和 infra/router 作为 app adapter capability providers。

### Validation

```bash
pnpm docs:commands && pnpm api:report
```

## ARCH-005

- Priority: `P1`
- Severity: `Medium`
- Status: `OPEN`

### Paths

- `package.json`
- `apps/web-demo/package.json`
- `apps/desktop/package.json`
- `packages/*/package.json`

### Problem

root 角色是 orchestration-only，但 root dependencies 中包含大量 runtime/frontend 依赖；可能掩盖依赖所有权。

### Best solution

做 dependency ownership audit：运行时依赖应尽量归属实际消费 app/package；root 保留 orchestration/dev tooling。迁移前先用 pnpm why 和 build smoke 确认不会破坏 workspace resolution。

### Validation

```bash
pnpm ci:prepare-internal && pnpm type-check && pnpm build:ci
```
