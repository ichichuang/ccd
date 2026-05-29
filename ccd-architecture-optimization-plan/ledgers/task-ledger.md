# Task Ledger

每个 issue 默认按以下工程步骤执行。不得跨 lane 混合。

## E2E-001 — E2E QA 内部包准备重复触发：workflow step、root e2e:qa script、Playwright webServer.command 都运行 ci:prepare-internal。

- Priority: `P0`
- Severity: `Critical`
- Status: `OPEN`
- Module: `E2E QA 与 CI 反馈链路`
- Paths:
  - `package.json`
  - `playwright.config.ts`
  - `.github/workflows/ci.yml`

### Best solution

拆分 e2e:qa 与 e2e:qa:prepared；CI 先运行一次 pnpm ci:prepare-internal，然后执行 prepared suite；Playwright webServer.command 不再构建内部包。

### Implementation steps

1. Inspect only the listed paths and direct imports/consumers.
2. Write or update the smallest focused test/diagnostic before broad changes.
3. Implement the smallest patch that satisfies the boundary rule.
4. Run the listed validation command.
5. Update the active report, status, risk/decision docs if needed.
6. Stop if validation fails; mark BLOCKED with evidence.

### Validation

```bash
pnpm ci:prepare-internal && pnpm e2e:qa:prepared
```

## ARCH-001 — “common core layer” 容易被误解为把所有通用能力迁入 packages/core，违背 packages/core runtime-neutral facade 的定位。

- Priority: `P0`
- Severity: `High`
- Status: `OPEN`
- Module: `架构核心层与平台抽取`
- Paths:
  - `docs/en/architecture-contract.md`
  - `docs/architecture/ownership-boundaries.md`
  - `docs/ai-plan/SPEC.md`
  - `docs/ai-plan/PLAN.md`

### Best solution

将 common core layer 明确定义为 packages/\* 平台层组合：contracts/core/shared-utils/vue-hooks/vue-app-platform/vue-ui/vue-primevue-adapter/vue-charts；packages/core 只保留 runtime-neutral orchestration。新增 ADR 固化分层术语。

### Implementation steps

1. Inspect only the listed paths and direct imports/consumers.
2. Write or update the smallest focused test/diagnostic before broad changes.
3. Implement the smallest patch that satisfies the boundary rule.
4. Run the listed validation command.
5. Update the active report, status, risk/decision docs if needed.
6. Stop if validation fails; mark BLOCKED with evidence.

### Validation

```bash
pnpm docs:commands && pnpm arch:graphs && pnpm api:report
```

## ARCH-002 — 平台抽取缺少统一判定标准，容易把 Vue/PrimeVue/browser runtime 误迁入 contracts/core。

- Priority: `P0`
- Severity: `High`
- Status: `OPEN`
- Module: `架构核心层与平台抽取`
- Paths:
  - `packages/core/src/index.ts`
  - `packages/contracts/src/index.ts`
  - `packages/*/package.json`
  - `apps/*/package.json`

### Best solution

建立 extraction decision matrix：pure DTO -> contracts；runtime-neutral orchestration -> core；pure utils -> shared-utils；Vue/browser composables -> vue-hooks；app bootstrap/layout runtime -> vue-app-platform；UI primitives -> vue-ui；PrimeVue config -> vue-primevue-adapter；app-specific runtime -> apps adapters。

### Implementation steps

1. Inspect only the listed paths and direct imports/consumers.
2. Write or update the smallest focused test/diagnostic before broad changes.
3. Implement the smallest patch that satisfies the boundary rule.
4. Run the listed validation command.
5. Update the active report, status, risk/decision docs if needed.
6. Stop if validation fails; mark BLOCKED with evidence.

### Validation

```bash
pnpm arch:runtime && pnpm arch:boundaries && pnpm api:report
```

## DOC-001 — 多个 BLOCKED 项需要 owner/operator 决策，但缺少集中 ADR 输出结构。

- Priority: `P0`
- Severity: `High`
- Status: `OPEN`
- Module: `文档、风险与审批闭环`
- Paths:
  - `docs/architecture/adr/**`
  - `docs/ai-plan/DECISIONS.md`
  - `.ai/runtime/owner_decisions.md`

### Best solution

新增 ADR 目录并为 UI boundary、HTTP contracts、guard scope、GitHub governance、Vite lane 分别建 ADR；owner_decisions.md 只做索引和状态。

### Implementation steps

1. Inspect only the listed paths and direct imports/consumers.
2. Write or update the smallest focused test/diagnostic before broad changes.
3. Implement the smallest patch that satisfies the boundary rule.
4. Run the listed validation command.
5. Update the active report, status, risk/decision docs if needed.
6. Stop if validation fails; mark BLOCKED with evidence.

### Validation

```bash
pnpm docs:commands
```

## E2E-002 — Playwright 固定 fullyParallel:false、workers:1，全部 QA 串行，视觉测试策略拖慢所有 smoke。

- Priority: `P0`
- Severity: `High`
- Status: `OPEN`
- Module: `E2E QA 与 CI 反馈链路`
- Paths:
  - `playwright.config.ts`
  - `package.json`

### Best solution

拆三类 suite：e2e:smoke 并发 2-4 workers；e2e:layout 1-2 workers；e2e:visual 单 worker。视觉截图继续串行，非视觉 smoke 并发。

### Implementation steps

1. Inspect only the listed paths and direct imports/consumers.
2. Write or update the smallest focused test/diagnostic before broad changes.
3. Implement the smallest patch that satisfies the boundary rule.
4. Run the listed validation command.
5. Update the active report, status, risk/decision docs if needed.
6. Stop if validation fails; mark BLOCKED with evidence.

### Validation

```bash
pnpm e2e:smoke && pnpm e2e:layout && pnpm e2e:visual
```

## E2E-003 — CScrollbar scroll memory 测试失败：刷新后 after900Ms 为 0，说明滚动恢复或测试 fixture 存在真实问题。

- Priority: `P0`
- Severity: `High`
- Status: `OPEN`
- Module: `E2E QA 与 CI 反馈链路`
- Paths:
  - `e2e/layout-runtime-geometry.spec.ts`
  - `packages/vue-ui/src/CScrollbar/**`
  - `apps/web-demo/src/layouts/**`

### Best solution

开 focused lane：先用 trace/DOM metrics 定位 host scroll element 与 memory key，再修 CScrollbar restore 时序或测试 spacer fixture；禁止直接放宽断言。

### Implementation steps

1. Inspect only the listed paths and direct imports/consumers.
2. Write or update the smallest focused test/diagnostic before broad changes.
3. Implement the smallest patch that satisfies the boundary rule.
4. Run the listed validation command.
5. Update the active report, status, risk/decision docs if needed.
6. Stop if validation fails; mark BLOCKED with evidence.

### Validation

```bash
pnpm exec playwright test e2e/layout-runtime-geometry.spec.ts -g "AppContainer CScrollbar restores persisted scroll memory smoothly after refresh"
```

## E2E-004 — dashboard visual baseline 高度不匹配：expected 986x549，actual 986x2194；可能是真实 layout 变化或 snapshot stale。

- Priority: `P0`
- Severity: `High`
- Status: `OPEN`
- Module: `E2E QA 与 CI 反馈链路`
- Paths:
  - `e2e/qa-regression.spec.ts`
  - `e2e/__snapshots__/qa-regression.spec.ts/qa-dashboard-desktop.png`
  - `apps/web-demo/src/views/dashboard/**`
  - `apps/web-demo/src/layouts/**`

### Best solution

先记录 DOM geometry 和 layout CSS 变更原因；如果真实布局正确，按官方命令更新 snapshot；如果布局错误，修 dashboard/layout 高度约束。

### Implementation steps

1. Inspect only the listed paths and direct imports/consumers.
2. Write or update the smallest focused test/diagnostic before broad changes.
3. Implement the smallest patch that satisfies the boundary rule.
4. Run the listed validation command.
5. Update the active report, status, risk/decision docs if needed.
6. Stop if validation fails; mark BLOCKED with evidence.

### Validation

```bash
pnpm exec playwright test e2e/qa-regression.spec.ts -g "visual baselines catch silent layout collapse"
```

## E2E-005 — production table-heavy 诊断显示 .p-datatable height 0，A/B 已证明不是 pxtorem patch 引入。

- Priority: `P0`
- Severity: `High`
- Status: `OPEN`
- Module: `E2E QA 与 CI 反馈链路`
- Paths:
  - `apps/web-demo/src/components/ProTable/**`
  - `apps/web-demo/src/views/example/components/primevue-collection/pro-table/**`

### Best solution

建立 production preview focused diagnostic；检查 ProTable container min-height、loading state、virtual scroll、async data resolve；修复后补截图验证。

### Implementation steps

1. Inspect only the listed paths and direct imports/consumers.
2. Write or update the smallest focused test/diagnostic before broad changes.
3. Implement the smallest patch that satisfies the boundary rule.
4. Run the listed validation command.
5. Update the active report, status, risk/decision docs if needed.
6. Stop if validation fails; mark BLOCKED with evidence.

### Validation

```bash
pnpm build:web-demo && pnpm preview && production screenshot diagnostic
```

## GOV-001 — guard coverage、rule contradictions、design-token canonical file、desktop drift CI 多项 owner decisions pending。

- Priority: `P0`
- Severity: `High`
- Status: `BLOCKED_BY_OWNER`
- Module: `Governance / Guard / GitHub 治理`
- Paths:
  - `.ai/runtime/owner_decisions.md`
  - `.ai/runtime/rule_coverage_matrix.md`
  - `scripts/ai-architecture-guard.mjs`

### Best solution

一次只决策一个 owner decision；为每个决策写 ADR，随后再加 guard。不要未审批直接扩大 guard。

### Implementation steps

1. Inspect only the listed paths and direct imports/consumers.
2. Write or update the smallest focused test/diagnostic before broad changes.
3. Implement the smallest patch that satisfies the boundary rule.
4. Run the listed validation command.
5. Update the active report, status, risk/decision docs if needed.
6. Stop if validation fails; mark BLOCKED with evidence.

### Validation

```bash
pnpm ai:doctor && pnpm ai:guard && pnpm docs:commands
```

## APP-001 — layoutRuntime 是跨 app platform 候选，但仍在 web-demo app。

- Priority: `P1`
- Severity: `High`
- Status: `OPEN`
- Module: `Layout Runtime 与 App Platform`
- Paths:
  - `apps/web-demo/src/layouts/runtime/layoutRuntime.ts`
  - `packages/vue-app-platform/**`

### Best solution

先抽纯 runtime 状态机/布局计算到 packages/vue-app-platform；router/store/DOM access 通过 app adapter 注入；web-demo 只保留 install/route wiring。

### Implementation steps

1. Inspect only the listed paths and direct imports/consumers.
2. Write or update the smallest focused test/diagnostic before broad changes.
3. Implement the smallest patch that satisfies the boundary rule.
4. Run the listed validation command.
5. Update the active report, status, risk/decision docs if needed.
6. Stop if validation fails; mark BLOCKED with evidence.

### Validation

```bash
pnpm --filter @ccd/vue-app-platform build && pnpm --filter @ccd/web-demo type-check && e2e:layout
```

## COMP-001 — ProForm 具备平台通用价值，但仍在 apps/web-demo；与 apps 只保留项目壳目标冲突。

- Priority: `P1`
- Severity: `High`
- Status: `OPEN`
- Module: `ProForm / ProTable / 通用组件迁移`
- Paths:
  - `apps/web-demo/src/components/ProForm/**`

### Best solution

分层迁移：schema/type/contracts -> packages/contracts 或 shared-utils；form controller/reactivity/runtime-neutral helpers -> shared-utils；Vue renderers/components -> packages/vue-ui 或新增 packages/vue-pro-components。

### Implementation steps

1. Inspect only the listed paths and direct imports/consumers.
2. Write or update the smallest focused test/diagnostic before broad changes.
3. Implement the smallest patch that satisfies the boundary rule.
4. Run the listed validation command.
5. Update the active report, status, risk/decision docs if needed.
6. Stop if validation fails; mark BLOCKED with evidence.

### Validation

```bash
pnpm --filter @ccd/web-demo type-check && focused ProForm vitest && pnpm api:report
```

## COMP-002 — ProTable 已修复局部 helper/export 边界，但仍是 app-local 通用组件。

- Priority: `P1`
- Severity: `High`
- Status: `OPEN`
- Module: `ProForm / ProTable / 通用组件迁移`
- Paths:
  - `apps/web-demo/src/components/ProTable/**`

### Best solution

先完成 B-007 layout 修复；再将 ProTable API types、column schema、executor contract 抽到 contracts/shared-utils；Vue renderer 迁到 vue-ui 或 vue-pro-components；examples 改为只消费公开包入口。

### Implementation steps

1. Inspect only the listed paths and direct imports/consumers.
2. Write or update the smallest focused test/diagnostic before broad changes.
3. Implement the smallest patch that satisfies the boundary rule.
4. Run the listed validation command.
5. Update the active report, status, risk/decision docs if needed.
6. Stop if validation fails; mark BLOCKED with evidence.

### Validation

```bash
pnpm exec vitest run ProTable && pnpm --filter @ccd/web-demo type-check && pnpm api:report
```

## GOV-002 — 最终状态是 NO_GO，原因不是全量验证失败，而是 blocker 未解除/未接受。

- Priority: `P1`
- Severity: `High`
- Status: `OPEN`
- Module: `Governance / Guard / GitHub 治理`
- Paths:
  - `docs/ai-plan/FINAL_GO_NO_GO.md`
  - `docs/ai-plan/FINAL_VALIDATION_MATRIX.md`
  - `docs/ai-plan/CHANGE_SUMMARY.md`

### Best solution

将 blocker 转化为 owner-accepted exception 或实际修复 lane；每个 blocker 必须有 owner、due date、exit criteria。

### Implementation steps

1. Inspect only the listed paths and direct imports/consumers.
2. Write or update the smallest focused test/diagnostic before broad changes.
3. Implement the smallest patch that satisfies the boundary rule.
4. Run the listed validation command.
5. Update the active report, status, risk/decision docs if needed.
6. Stop if validation fails; mark BLOCKED with evidence.

### Validation

```bash
pnpm ai:doctor --open && open actionable scan
```

## HTTP-001 — HTTP 专用 contracts 尚未建立，当前只有低层 NetworkClient/NetworkRequest/NetworkResponse。

- Priority: `P1`
- Severity: `High`
- Status: `BLOCKED_BY_OWNER`
- Module: `HTTP / alova / contracts 边界`
- Paths:
  - `packages/contracts/src/network.ts`
  - `packages/contracts/src/http/**`
  - `.ai/runtime/owner_decisions.md`

### Best solution

审批后新增 packages/contracts/src/http/\*\*：RequestConfig、ResponseEnvelope、HttpErrorShape、RetryPolicy、TimeoutPolicy、AuthPolicy、TransportClient；禁止导入 browser/fetch/alova/Zod runtime。

### Implementation steps

1. Inspect only the listed paths and direct imports/consumers.
2. Write or update the smallest focused test/diagnostic before broad changes.
3. Implement the smallest patch that satisfies the boundary rule.
4. Run the listed validation command.
5. Update the active report, status, risk/decision docs if needed.
6. Stop if validation fails; mark BLOCKED with evidence.

### Validation

```bash
pnpm --filter @ccd/contracts build && pnpm api:report && pnpm arch:runtime
```

## HTTP-007 — restoreLoginFromToken retry/timeout/offline UX 策略仍 pending；无法规范 auth retry policy。

- Priority: `P1`
- Severity: `High`
- Status: `BLOCKED_BY_PRODUCT`
- Module: `HTTP / alova / contracts 边界`
- Paths:
  - `apps/web-demo/src/hooks/modules/useAuth.ts`
  - `.ai/runtime/owner_decisions.md`

### Best solution

产品/架构决策：401 立即登出；5xx/network 3 次指数退避；每次 5s timeout；可选 offline read-only session。决策后落到 contracts HTTP AuthPolicy。

### Implementation steps

1. Inspect only the listed paths and direct imports/consumers.
2. Write or update the smallest focused test/diagnostic before broad changes.
3. Implement the smallest patch that satisfies the boundary rule.
4. Run the listed validation command.
5. Update the active report, status, risk/decision docs if needed.
6. Stop if validation fails; mark BLOCKED with evidence.

### Validation

```bash
auth focused tests + e2e invalid token / offline scenario
```

## UI-001 — 37 个源文件直接 import primevue/_ 或 @primevue/_；直接加 guard 会产生大量 false positives。

- Priority: `P1`
- Severity: `High`
- Status: `BLOCKED_BY_POLICY`
- Module: `UI 与 PrimeVue 边界治理`
- Paths:
  - `packages/vue-primevue-adapter/**`
  - `packages/vue-ui/**`
  - `apps/web-demo/**`
  - `apps/desktop/**`

### Best solution

先写 UI boundary policy：允许 adapter/bootstrap/build resolver/tests；禁止 app domain/layout 直接 import PrimeVue，迁移到 CCD wrapper；examples 可列明 showcase exceptions。

### Implementation steps

1. Inspect only the listed paths and direct imports/consumers.
2. Write or update the smallest focused test/diagnostic before broad changes.
3. Implement the smallest patch that satisfies the boundary rule.
4. Run the listed validation command.
5. Update the active report, status, risk/decision docs if needed.
6. Stop if validation fails; mark BLOCKED with evidence.

### Validation

```bash
pnpm docs:commands && pnpm arch:boundaries
```

## UI-002 — layout/navigation/domain 直接使用 Drawer/PanelMenu/TieredMenu/Tooltip/Button/Tag 等 PrimeVue 组件。

- Priority: `P1`
- Severity: `High`
- Status: `OPEN`
- Module: `UI 与 PrimeVue 边界治理`
- Paths:
  - `apps/web-demo/src/layouts/**`
  - `apps/web-demo/src/components/**`
  - `apps/desktop/src/views/DesktopHome.vue`

### Best solution

按使用频率抽 CcdDrawer、CcdMenu、CcdTooltip、CcdButton、CcdTag 等 wrapper；业务层只 import @ccd/vue-ui。

### Implementation steps

1. Inspect only the listed paths and direct imports/consumers.
2. Write or update the smallest focused test/diagnostic before broad changes.
3. Implement the smallest patch that satisfies the boundary rule.
4. Run the listed validation command.
5. Update the active report, status, risk/decision docs if needed.
6. Stop if validation fails; mark BLOCKED with evidence.

### Validation

```bash
pnpm --filter @ccd/vue-ui build && pnpm --filter @ccd/web-demo type-check && e2e:layout
```

## APP-002 — theme engine 仍在 app utils，但主题 token 与 size/breakpoint 本应平台化。

- Priority: `P1`
- Severity: `Medium`
- Status: `OPEN`
- Module: `Layout Runtime 与 App Platform`
- Paths:
  - `apps/web-demo/src/utils/theme/engine.ts`
  - `packages/design-tokens/**`
  - `packages/vue-app-platform/**`

### Best solution

纯 token derivation 放 design-tokens；Vue/runtime theme application 放 vue-app-platform；app 只注入 storage/media/browser capability。

### Implementation steps

1. Inspect only the listed paths and direct imports/consumers.
2. Write or update the smallest focused test/diagnostic before broad changes.
3. Implement the smallest patch that satisfies the boundary rule.
4. Run the listed validation command.
5. Update the active report, status, risk/decision docs if needed.
6. Stop if validation fails; mark BLOCKED with evidence.

### Validation

```bash
pnpm validate:tokens && pnpm --filter @ccd/web-demo type-check && visual-token tests
```

## ARCH-003 — apps package manifests 暴露 ./src/main.ts；语义上像库入口，但 apps 目标应是项目壳，不应作为公共 API 被其他 workspace 消费。

- Priority: `P1`
- Severity: `Medium`
- Status: `OPEN`
- Module: `架构核心层与平台抽取`
- Paths:
  - `apps/web-demo/package.json`
  - `apps/desktop/package.json`

### Best solution

移除 apps/_ package exports，或增加 explicit private app-only export policy 并让 api surface 报告忽略 apps exports；禁止其他 apps/package import apps/_。

### Implementation steps

1. Inspect only the listed paths and direct imports/consumers.
2. Write or update the smallest focused test/diagnostic before broad changes.
3. Implement the smallest patch that satisfies the boundary rule.
4. Run the listed validation command.
5. Update the active report, status, risk/decision docs if needed.
6. Stop if validation fails; mark BLOCKED with evidence.

### Validation

```bash
pnpm api:report && pnpm arch:boundaries && pnpm ci:smoke:packages
```

## ARCH-004 — 架构文档仍把 createCapabilityBridge 列为 app-local candidate，但当前实现已在 packages/shared-utils。

- Priority: `P1`
- Severity: `Medium`
- Status: `OPEN`
- Module: `架构核心层与平台抽取`
- Paths:
  - `docs/en/architecture-contract.md`
  - `packages/shared-utils/src/createCapabilityBridge.ts`
  - `packages/shared-utils/src/index.ts`

### Best solution

修正文档 drift：createCapabilityBridge 属于 shared-utils pure utility；保留 apps/web-demo/infra/auth 和 infra/router 作为 app adapter capability providers。

### Implementation steps

1. Inspect only the listed paths and direct imports/consumers.
2. Write or update the smallest focused test/diagnostic before broad changes.
3. Implement the smallest patch that satisfies the boundary rule.
4. Run the listed validation command.
5. Update the active report, status, risk/decision docs if needed.
6. Stop if validation fails; mark BLOCKED with evidence.

### Validation

```bash
pnpm docs:commands && pnpm api:report
```

## ARCH-005 — root 角色是 orchestration-only，但 root dependencies 中包含大量 runtime/frontend 依赖；可能掩盖依赖所有权。

- Priority: `P1`
- Severity: `Medium`
- Status: `OPEN`
- Module: `架构核心层与平台抽取`
- Paths:
  - `package.json`
  - `apps/web-demo/package.json`
  - `apps/desktop/package.json`
  - `packages/*/package.json`

### Best solution

做 dependency ownership audit：运行时依赖应尽量归属实际消费 app/package；root 保留 orchestration/dev tooling。迁移前先用 pnpm why 和 build smoke 确认不会破坏 workspace resolution。

### Implementation steps

1. Inspect only the listed paths and direct imports/consumers.
2. Write or update the smallest focused test/diagnostic before broad changes.
3. Implement the smallest patch that satisfies the boundary rule.
4. Run the listed validation command.
5. Update the active report, status, risk/decision docs if needed.
6. Stop if validation fails; mark BLOCKED with evidence.

### Validation

```bash
pnpm ci:prepare-internal && pnpm type-check && pnpm build:ci
```

## BUILD-001 — postcss-pxtorem 仍依赖 selectorBlackList 保护 UnoCSS 原子类，长 blacklist 脆弱。

- Priority: `P1`
- Severity: `Medium`
- Status: `OPEN`
- Module: `CSS / Tokens / Vite Build`
- Paths:
  - `apps/web-demo/vite.config.ts`

### Best solution

保持 file-level exclude；逐步改为 token-first：CSS variables、design tokens、container queries、UnoCSS rules，减少全局 px-to-rem 转换面。

### Implementation steps

1. Inspect only the listed paths and direct imports/consumers.
2. Write or update the smallest focused test/diagnostic before broad changes.
3. Implement the smallest patch that satisfies the boundary rule.
4. Run the listed validation command.
5. Update the active report, status, risk/decision docs if needed.
6. Stop if validation fails; mark BLOCKED with evidence.

### Validation

```bash
pnpm build:web-demo && visual screenshots login/dashboard/table/chart
```

## COMP-003 — PrimeDialog 是可复用 UI wrapper，但留在 app components。

- Priority: `P1`
- Severity: `Medium`
- Status: `OPEN`
- Module: `ProForm / ProTable / 通用组件迁移`
- Paths:
  - `apps/web-demo/src/components/PrimeDialog/**`

### Best solution

迁移到 packages/vue-ui/src/PrimeDialog 或 packages/vue-primevue-adapter-aware wrapper；对外暴露 CCD-owned props/events，不 raw re-export PrimeVue Dialog。

### Implementation steps

1. Inspect only the listed paths and direct imports/consumers.
2. Write or update the smallest focused test/diagnostic before broad changes.
3. Implement the smallest patch that satisfies the boundary rule.
4. Run the listed validation command.
5. Update the active report, status, risk/decision docs if needed.
6. Stop if validation fails; mark BLOCKED with evidence.

### Validation

```bash
pnpm --filter @ccd/vue-ui build && pnpm --filter @ccd/web-demo type-check && focused dialog tests
```

## COMP-004 — examples 与组件内部实现耦合，部分示例历史上穿透内部 engine/types/props。

- Priority: `P1`
- Severity: `Medium`
- Status: `OPEN`
- Module: `ProForm / ProTable / 通用组件迁移`
- Paths:
  - `apps/web-demo/src/views/example/components/primevue-collection/**`

### Best solution

建立 examples consumption rule：examples 只能 import package/app public entry；禁止 ../engine、../types/props 等内部路径。迁移后用 architecture guard 检测。

### Implementation steps

1. Inspect only the listed paths and direct imports/consumers.
2. Write or update the smallest focused test/diagnostic before broad changes.
3. Implement the smallest patch that satisfies the boundary rule.
4. Run the listed validation command.
5. Update the active report, status, risk/decision docs if needed.
6. Stop if validation fails; mark BLOCKED with evidence.

### Validation

```bash
pnpm arch:boundaries && pnpm api:report && pnpm type-check
```

## DOC-002 — 风险与行动项需要从 milestone 叙事转为 blocker/task ledger，便于统计。

- Priority: `P1`
- Severity: `Medium`
- Status: `OPEN`
- Module: `文档、风险与审批闭环`
- Paths:
  - `docs/ai-plan/RISK_REGISTER.md`
  - `docs/ai-plan/NEXT_ACTIONS.md`
  - `docs/ai-plan/FINAL_GO_NO_GO.md`

### Best solution

建立 issue ledger：id/module/priority/path/owner/status/exit criteria/evidence；所有 docs 用同一 ID。

### Implementation steps

1. Inspect only the listed paths and direct imports/consumers.
2. Write or update the smallest focused test/diagnostic before broad changes.
3. Implement the smallest patch that satisfies the boundary rule.
4. Run the listed validation command.
5. Update the active report, status, risk/decision docs if needed.
6. Stop if validation fails; mark BLOCKED with evidence.

### Validation

```bash
pnpm ai:doctor --open && docs consistency check
```

## E2E-006 — 大量测试重复 loginAsAdmin、gotoVisual、waitForAppReady、waitForRuntimeLoadingIdle，导致每个 case 重复 app boot/login。

- Priority: `P1`
- Severity: `Medium`
- Status: `OPEN`
- Module: `E2E QA 与 CI 反馈链路`
- Paths:
  - `e2e/helpers/app.ts`
  - `e2e/*.spec.ts`

### Best solution

引入 authenticated storageState fixture；对只需登录态的测试直接复用；保留少量 auth-flow 专测覆盖 login/logout。

### Implementation steps

1. Inspect only the listed paths and direct imports/consumers.
2. Write or update the smallest focused test/diagnostic before broad changes.
3. Implement the smallest patch that satisfies the boundary rule.
4. Run the listed validation command.
5. Update the active report, status, risk/decision docs if needed.
6. Stop if validation fails; mark BLOCKED with evidence.

### Validation

```bash
pnpm e2e:smoke
```

## E2E-007 — CI 每次安装 Playwright Chromium with deps，且没有上传 Playwright test-results/html-report artifacts。

- Priority: `P1`
- Severity: `Medium`
- Status: `OPEN`
- Module: `E2E QA 与 CI 反馈链路`
- Paths:
  - `.github/workflows/ci.yml`

### Best solution

增加 Playwright browser cache 或使用 actions/cache；失败时 upload test-results、playwright-report、trace/video/screenshot artifacts。

### Implementation steps

1. Inspect only the listed paths and direct imports/consumers.
2. Write or update the smallest focused test/diagnostic before broad changes.
3. Implement the smallest patch that satisfies the boundary rule.
4. Run the listed validation command.
5. Update the active report, status, risk/decision docs if needed.
6. Stop if validation fails; mark BLOCKED with evidence.

### Validation

```bash
GitHub Actions dry run / PR check
```

## E2E-008 — CI retries=2 会把确定性失败放大为更慢失败。

- Priority: `P1`
- Severity: `Medium`
- Status: `OPEN`
- Module: `E2E QA 与 CI 反馈链路`
- Paths:
  - `playwright.config.ts`

### Best solution

在 B-007 失败修复前，将 flaky/visual 与 smoke 分离；retries 只用于 smoke 或 CI transient group；真实失败 suite 不重试。

### Implementation steps

1. Inspect only the listed paths and direct imports/consumers.
2. Write or update the smallest focused test/diagnostic before broad changes.
3. Implement the smallest patch that satisfies the boundary rule.
4. Run the listed validation command.
5. Update the active report, status, risk/decision docs if needed.
6. Stop if validation fails; mark BLOCKED with evidence.

### Validation

```bash
pnpm e2e:smoke && pnpm e2e:layout
```

## GOV-003 — .github/\*\* 变更与 remote branch protection 需要 operator approval。

- Priority: `P1`
- Severity: `Medium`
- Status: `BLOCKED_BY_OPERATOR`
- Module: `Governance / Guard / GitHub 治理`
- Paths:
  - `.github/workflows/ci.yml`
  - `.github/CODEOWNERS`
  - `.github/PULL_REQUEST_TEMPLATE.md`
  - `.github/ISSUE_TEMPLATE/**`

### Best solution

审批后设置 required checks：Core Quality、E2E smoke、governance gate、type-check、lint、build:ci；CODEOWNERS 覆盖 .ai/docs/packages/apps/workflows。

### Implementation steps

1. Inspect only the listed paths and direct imports/consumers.
2. Write or update the smallest focused test/diagnostic before broad changes.
3. Implement the smallest patch that satisfies the boundary rule.
4. Run the listed validation command.
5. Update the active report, status, risk/decision docs if needed.
6. Stop if validation fails; mark BLOCKED with evidence.

### Validation

```bash
GitHub branch protection review + PR dry run
```

## GOV-004 — generated artifacts 必须用官方命令刷新，不能手改；治理 gate 可能要求 generated-sync rerun。

- Priority: `P1`
- Severity: `Medium`
- Status: `OPEN`
- Module: `Governance / Guard / GitHub 治理`
- Paths:
  - `docs/generated/**`
  - `.ai/generated/**`
  - `.ai/governance/api-snapshots/**`
  - `package.json`

### Best solution

所有涉及 API/dependency/graph/supply-chain 的变更后运行 pnpm governance:refresh，再运行 pnpm governance:gate；文档明确 generated drift 处理流程。

### Implementation steps

1. Inspect only the listed paths and direct imports/consumers.
2. Write or update the smallest focused test/diagnostic before broad changes.
3. Implement the smallest patch that satisfies the boundary rule.
4. Run the listed validation command.
5. Update the active report, status, risk/decision docs if needed.
6. Stop if validation fails; mark BLOCKED with evidence.

### Validation

```bash
pnpm governance:refresh && pnpm governance:gate && git diff --check
```

## HTTP-002 — 是否需要 packages/core/src/http/\*\* 尚未证明；盲目新增会过度工程化。

- Priority: `P1`
- Severity: `Medium`
- Status: `OPEN`
- Module: `HTTP / alova / contracts 边界`
- Paths:
  - `packages/core/src/index.ts`
  - `packages/core/src/http/**`

### Best solution

只有当多个 runtime 共享 retry/timeout/auth orchestration 且可 runtime-neutral 表达时，才新增 core/http；否则保持 core 只代理 network adapter。

### Implementation steps

1. Inspect only the listed paths and direct imports/consumers.
2. Write or update the smallest focused test/diagnostic before broad changes.
3. Implement the smallest patch that satisfies the boundary rule.
4. Run the listed validation command.
5. Update the active report, status, risk/decision docs if needed.
6. Stop if validation fails; mark BLOCKED with evidence.

### Validation

```bash
pnpm --filter @ccd/core build && pnpm arch:runtime
```

## HTTP-003 — HTTP infra 在 utils/http，语义上不是 adapters，但现有规则把该路径视为 approved infrastructure。

- Priority: `P1`
- Severity: `Medium`
- Status: `OPEN`
- Module: `HTTP / alova / contracts 边界`
- Paths:
  - `apps/web-demo/src/utils/http/**`
  - `apps/web-demo/src/adapters/http.adapter.ts`

### Best solution

短期保留路径，避免大规模 import churn；先引入 contracts/policy 后，再评估是否迁到 apps/web-demo/src/adapters/http/\*\*。

### Implementation steps

1. Inspect only the listed paths and direct imports/consumers.
2. Write or update the smallest focused test/diagnostic before broad changes.
3. Implement the smallest patch that satisfies the boundary rule.
4. Run the listed validation command.
5. Update the active report, status, risk/decision docs if needed.
6. Stop if validation fails; mark BLOCKED with evidence.

### Validation

```bash
pnpm arch:runtime && pnpm --filter @ccd/web-demo type-check && request-layer tests
```

## HTTP-004 — response handling 同时处理 status、401 refresh/retry、notification、unwrap/decrypt、Zod validation，职责偏重。

- Priority: `P1`
- Severity: `Medium`
- Status: `OPEN`
- Module: `HTTP / alova / contracts 边界`
- Paths:
  - `apps/web-demo/src/utils/http/interceptors.ts`
  - `apps/web-demo/src/utils/http/methods.ts`
  - `apps/web-demo/src/utils/http/connection.ts`
  - `apps/web-demo/src/utils/http/**`

### Best solution

拆 policy modules：authRefreshPolicy、errorMappingPolicy、responseDecodePolicy、schemaValidationPolicy、notificationPolicy；每个 policy 单测覆盖。

### Implementation steps

1. Inspect only the listed paths and direct imports/consumers.
2. Write or update the smallest focused test/diagnostic before broad changes.
3. Implement the smallest patch that satisfies the boundary rule.
4. Run the listed validation command.
5. Update the active report, status, risk/decision docs if needed.
6. Stop if validation fails; mark BLOCKED with evidence.

### Validation

```bash
pnpm exec vitest run apps/web-demo/src/utils/http
```

## UI-003 — packages/vue-ui 内部组合 PrimeVue，但需要明确“允许内部组合、禁止 raw re-export”的规则。

- Priority: `P1`
- Severity: `Medium`
- Status: `OPEN`
- Module: `UI 与 PrimeVue 边界治理`
- Paths:
  - `packages/vue-ui/src/CScrollbar/CScrollbar.vue`
  - `packages/vue-ui/src/EmptyState/EmptyState.vue`

### Best solution

在 package README/API surface 中声明 vue-ui 可内部适配 PrimeVue，但 public API 必须是 CCD-owned props/types；不导出 PrimeVue 原始组件或类型，除非 type-only 且有 policy。

### Implementation steps

1. Inspect only the listed paths and direct imports/consumers.
2. Write or update the smallest focused test/diagnostic before broad changes.
3. Implement the smallest patch that satisfies the boundary rule.
4. Run the listed validation command.
5. Update the active report, status, risk/decision docs if needed.
6. Stop if validation fails; mark BLOCKED with evidence.

### Validation

```bash
pnpm api:report && pnpm --filter @ccd/vue-ui build
```

## APP-003 — safeStorage 跨 app 可复用，但涉及 localStorage/sessionStorage 与 obfuscation policy，不能直接塞 core。

- Priority: `P2`
- Severity: `Medium`
- Status: `OPEN`
- Module: `Layout Runtime 与 App Platform`
- Paths:
  - `apps/web-demo/src/utils/safeStorage/**`
  - `packages/contracts/src/storage.ts`
  - `packages/core/src/index.ts`

### Best solution

contracts 定义 SafeStoragePolicy/StorageCodec；app adapter 实现 browser storage；shared-utils 提供 pure codec helpers；core 只消费 StorageAdapter。

### Implementation steps

1. Inspect only the listed paths and direct imports/consumers.
2. Write or update the smallest focused test/diagnostic before broad changes.
3. Implement the smallest patch that satisfies the boundary rule.
4. Run the listed validation command.
5. Update the active report, status, risk/decision docs if needed.
6. Stop if validation fails; mark BLOCKED with evidence.

### Validation

```bash
pnpm arch:runtime && storage focused tests
```

## APP-004 — desktop 与 web app platform drift 检查仍偏人工，CI scope 未定。

- Priority: `P2`
- Severity: `Medium`
- Status: `OPEN`
- Module: `Layout Runtime 与 App Platform`
- Paths:
  - `apps/desktop/**`
  - `apps/web-demo/**`
  - `.ai/rules/integrations/09-desktop-branch-governance.mdc`

### Best solution

审批后将 desktop drift summary 纳入 CI；web/desktop 共享 platform package，app 只保留 runtime adapter 差异。

### Implementation steps

1. Inspect only the listed paths and direct imports/consumers.
2. Write or update the smallest focused test/diagnostic before broad changes.
3. Implement the smallest patch that satisfies the boundary rule.
4. Run the listed validation command.
5. Update the active report, status, risk/decision docs if needed.
6. Stop if validation fails; mark BLOCKED with evidence.

### Validation

```bash
pnpm build:desktop && pnpm budget:desktop && desktop drift check
```

## BUILD-002 — Vite 8 迁移风险面大：esbuildOptions、esbuild.drop/pure、Rollup manualChunks、experimentalMinChunkSize、minify、plugins。

- Priority: `P2`
- Severity: `Medium`
- Status: `BLOCKED_BY_APPROVAL`
- Module: `CSS / Tokens / Vite Build`
- Paths:
  - `apps/web-demo/vite.config.ts`
  - `apps/web-demo/build/**`
  - `packages/vue-ui/vite.config.ts`
  - `packages/vue-charts/vite.config.ts`

### Best solution

独立 branch/worktree；先 inventory 官方文档，再逐项替换/验证；不得和 UI/HTTP/依赖升级混合。

### Implementation steps

1. Inspect only the listed paths and direct imports/consumers.
2. Write or update the smallest focused test/diagnostic before broad changes.
3. Implement the smallest patch that satisfies the boundary rule.
4. Run the listed validation command.
5. Update the active report, status, risk/decision docs if needed.
6. Stop if validation fails; mark BLOCKED with evidence.

### Validation

```bash
pnpm build:ci && pnpm e2e:qa && bundle budgets on isolated lane
```

## BUILD-003 — build plugins 与 Vite major migration 强耦合，ECharts treeshake/compression/progress/visualizer 都需复核。

- Priority: `P2`
- Severity: `Medium`
- Status: `OPEN`
- Module: `CSS / Tokens / Vite Build`
- Paths:
  - `apps/web-demo/build/plugins.ts`
  - `apps/web-demo/build/compress.ts`
  - `apps/web-demo/build/performance.ts`

### Best solution

为每个 plugin 写 compatibility note：是否必须保留、是否迁到 deploy/CDN、是否有 measurable value；移除无价值 progress plugin。

### Implementation steps

1. Inspect only the listed paths and direct imports/consumers.
2. Write or update the smallest focused test/diagnostic before broad changes.
3. Implement the smallest patch that satisfies the boundary rule.
4. Run the listed validation command.
5. Update the active report, status, risk/decision docs if needed.
6. Stop if validation fails; mark BLOCKED with evidence.

### Validation

```bash
pnpm build:web-demo && pnpm budget:bundles
```

## COMP-005 — vue-ui 可能承载过多高级组件，需决定是否新增 packages/vue-pro-components。

- Priority: `P2`
- Severity: `Medium`
- Status: `OPEN`
- Module: `ProForm / ProTable / 通用组件迁移`
- Paths:
  - `packages/vue-ui/package.json`
  - `packages/vue-ui/src/index.ts`
  - `packages/vue-ui/vite.config.ts`

### Best solution

如果 ProForm/ProTable 体量继续增长，新增 packages/vue-pro-components，依赖 vue-ui/vue-hooks/shared-utils/contracts；避免 vue-ui 基础 primitive 包膨胀。

### Implementation steps

1. Inspect only the listed paths and direct imports/consumers.
2. Write or update the smallest focused test/diagnostic before broad changes.
3. Implement the smallest patch that satisfies the boundary rule.
4. Run the listed validation command.
5. Update the active report, status, risk/decision docs if needed.
6. Stop if validation fails; mark BLOCKED with evidence.

### Validation

```bash
pnpm ci:prepare-internal && pnpm arch:graphs && pnpm api:report
```

## DEPS-001 — Vite 7 -> Vite 8 是高风险 major lane，不能混入架构迁移。

- Priority: `P2`
- Severity: `Medium`
- Status: `BLOCKED_BY_APPROVAL`
- Module: `依赖与工具链现代化`
- Paths:
  - `package.json`
  - `pnpm-lock.yaml`
  - `apps/web-demo/package.json`
  - `apps/desktop/package.json`

### Best solution

独立 vite8 lane：官方迁移文档 review、config compatibility patch、build/e2e/budget 全套验证。

### Implementation steps

1. Inspect only the listed paths and direct imports/consumers.
2. Write or update the smallest focused test/diagnostic before broad changes.
3. Implement the smallest patch that satisfies the boundary rule.
4. Run the listed validation command.
5. Update the active report, status, risk/decision docs if needed.
6. Stop if validation fails; mark BLOCKED with evidence.

### Validation

```bash
pnpm build:ci && pnpm e2e:qa && pnpm budget:bundles
```

## DEPS-002 — Vue tooling、TypeScript、vue-tsc、compiler-sfc 有升级面；会影响 type-check 与 SFC parsing。

- Priority: `P2`
- Severity: `Medium`
- Status: `BLOCKED_BY_APPROVAL`
- Module: `依赖与工具链现代化`
- Paths:
  - `package.json`
  - `pnpm-lock.yaml`

### Best solution

单独 tooling lane；先 packages type-check，再 web-demo vue-tsc，再 full test/build。

### Implementation steps

1. Inspect only the listed paths and direct imports/consumers.
2. Write or update the smallest focused test/diagnostic before broad changes.
3. Implement the smallest patch that satisfies the boundary rule.
4. Run the listed validation command.
5. Update the active report, status, risk/decision docs if needed.
6. Stop if validation fails; mark BLOCKED with evidence.

### Validation

```bash
pnpm type-check && pnpm test:run && pnpm build:ci
```

## DEPS-003 — Playwright 升级需同时处理 browser install/cache/CI artifact 策略。

- Priority: `P2`
- Severity: `Medium`
- Status: `BLOCKED_BY_APPROVAL`
- Module: `依赖与工具链现代化`
- Paths:
  - `package.json`
  - `pnpm-lock.yaml`
  - `.github/workflows/ci.yml`
  - `playwright.config.ts`

### Best solution

先完成 E2E suite 拆分和 artifact 上传，再独立升级 Playwright；记录浏览器版本和 snapshot drift。

### Implementation steps

1. Inspect only the listed paths and direct imports/consumers.
2. Write or update the smallest focused test/diagnostic before broad changes.
3. Implement the smallest patch that satisfies the boundary rule.
4. Run the listed validation command.
5. Update the active report, status, risk/decision docs if needed.
6. Stop if validation fails; mark BLOCKED with evidence.

### Validation

```bash
pnpm e2e:smoke && pnpm e2e:layout && pnpm e2e:visual
```

## GOV-005 — 部分计划文档存在历史阶段段落，与当前“下一步 B-007”存在语义 drift。

- Priority: `P2`
- Severity: `Medium`
- Status: `OPEN`
- Module: `Governance / Guard / GitHub 治理`
- Paths:
  - `docs/ai-plan/NEXT_ACTIONS.md`
  - `docs/ai-plan/PLAN.md`
  - `docs/en/architecture-contract.md`

### Best solution

重写 Next Actions 为当前优先级版本；保留历史内容到 archived section，避免 AI/人误执行旧 M2 建议。

### Implementation steps

1. Inspect only the listed paths and direct imports/consumers.
2. Write or update the smallest focused test/diagnostic before broad changes.
3. Implement the smallest patch that satisfies the boundary rule.
4. Run the listed validation command.
5. Update the active report, status, risk/decision docs if needed.
6. Stop if validation fails; mark BLOCKED with evidence.

### Validation

```bash
pnpm docs:commands
```

## HTTP-005 — API modules 混合 direct wrapper function 与 alova Method builder，request-state 抽象不一致。

- Priority: `P2`
- Severity: `Medium`
- Status: `OPEN`
- Module: `HTTP / alova / contracts 边界`
- Paths:
  - `apps/web-demo/src/api/**`

### Best solution

统一规范：server-state 或需要 loading/cache/dedupe 的接口优先返回 Method builder 并经 useHttpRequest；简单 one-shot wrapper 明确标为 imperative API。

### Implementation steps

1. Inspect only the listed paths and direct imports/consumers.
2. Write or update the smallest focused test/diagnostic before broad changes.
3. Implement the smallest patch that satisfies the boundary rule.
4. Run the listed validation command.
5. Update the active report, status, risk/decision docs if needed.
6. Stop if validation fails; mark BLOCKED with evidence.

### Validation

```bash
pnpm --filter @ccd/web-demo type-check && request focused tests
```

## HTTP-006 — raw fetch 出现在 HTTP infra 外，未来 guard/policy 会误判或漏判。

- Priority: `P2`
- Severity: `Medium`
- Status: `OPEN`
- Module: `HTTP / alova / contracts 边界`
- Paths:
  - `apps/web-demo/src/components/LoadingLottie.vue`
  - `apps/web-demo/src/utils/date/timezone.ts`
  - `apps/web-demo/src/utils/http/**`

### Best solution

定义 raw fetch allowlist：HTTP infra、asset loader、timezone probe；长期把非 HTTP raw fetch 包装为 adapter 或 platform utility。

### Implementation steps

1. Inspect only the listed paths and direct imports/consumers.
2. Write or update the smallest focused test/diagnostic before broad changes.
3. Implement the smallest patch that satisfies the boundary rule.
4. Run the listed validation command.
5. Update the active report, status, risk/decision docs if needed.
6. Stop if validation fails; mark BLOCKED with evidence.

### Validation

```bash
pnpm ai:guard && pnpm arch:runtime
```

## UI-004 — PrimeVue global services shell 仍在 app layout 组件中。

- Priority: `P2`
- Severity: `Medium`
- Status: `OPEN`
- Module: `UI 与 PrimeVue 边界治理`
- Paths:
  - `apps/web-demo/src/layouts/components/AppPrimeVueGlobals.vue`
  - `packages/vue-primevue-adapter/src/services.ts`

### Best solution

保留 app shell 装配，但将服务注册/locale sync/overlay outlet 约定抽到 adapter helper；AppPrimeVueGlobals 只做安装点。

### Implementation steps

1. Inspect only the listed paths and direct imports/consumers.
2. Write or update the smallest focused test/diagnostic before broad changes.
3. Implement the smallest patch that satisfies the boundary rule.
4. Run the listed validation command.
5. Update the active report, status, risk/decision docs if needed.
6. Stop if validation fails; mark BLOCKED with evidence.

### Validation

```bash
pnpm --filter @ccd/vue-primevue-adapter build && e2e:smoke
```

## BUILD-004 — Vite config 中 scss preprocessorOptions 使用 as any，是配置层类型逃逸。

- Priority: `P2`
- Severity: `Low`
- Status: `OPEN`
- Module: `CSS / Tokens / Vite Build`
- Paths:
  - `apps/web-demo/vite.config.ts`

### Best solution

查看 Vite/Sass 类型定义，替换为 satisfies/明确类型或局部 typed helper；避免扩大 any。

### Implementation steps

1. Inspect only the listed paths and direct imports/consumers.
2. Write or update the smallest focused test/diagnostic before broad changes.
3. Implement the smallest patch that satisfies the boundary rule.
4. Run the listed validation command.
5. Update the active report, status, risk/decision docs if needed.
6. Stop if validation fails; mark BLOCKED with evidence.

### Validation

```bash
pnpm --filter @ccd/web-demo type-check && pnpm build:web-demo
```

## BUILD-005 — server.open / preview.open 默认为 true，不适合 CI/Playwright server。

- Priority: `P2`
- Severity: `Low`
- Status: `OPEN`
- Module: `CSS / Tokens / Vite Build`
- Paths:
  - `apps/web-demo/vite.config.ts`

### Best solution

按 env/CI 判断 open:false；本地 dev 可保留自动打开，Playwright/CI 禁止。

### Implementation steps

1. Inspect only the listed paths and direct imports/consumers.
2. Write or update the smallest focused test/diagnostic before broad changes.
3. Implement the smallest patch that satisfies the boundary rule.
4. Run the listed validation command.
5. Update the active report, status, risk/decision docs if needed.
6. Stop if validation fails; mark BLOCKED with evidence.

### Validation

```bash
pnpm e2e:smoke && pnpm --filter @ccd/web-demo dev smoke
```

## UI-005 — PrimeVue showcase examples 需要特殊边界，不能与业务 app 直用同等处理。

- Priority: `P2`
- Severity: `Low`
- Status: `OPEN`
- Module: `UI 与 PrimeVue 边界治理`
- Paths:
  - `apps/web-demo/src/views/example/components/primevue-collection/**`

### Best solution

建立 examples exception allowlist：showcase 可直接 import PrimeVue，但必须限定在 primevue-collection examples；其他 app routes 不允许。

### Implementation steps

1. Inspect only the listed paths and direct imports/consumers.
2. Write or update the smallest focused test/diagnostic before broad changes.
3. Implement the smallest patch that satisfies the boundary rule.
4. Run the listed validation command.
5. Update the active report, status, risk/decision docs if needed.
6. Stop if validation fails; mark BLOCKED with evidence.

### Validation

```bash
pnpm ai:guard && pnpm arch:boundaries
```

## DEPS-004 — PrimeVue 升级需要检查 v4 patch/minor API 与 adapter/PT/theme 行为。

- Priority: `P3`
- Severity: `Medium`
- Status: `BLOCKED_BY_REVIEW`
- Module: `依赖与工具链现代化`
- Paths:
  - `package.json`
  - `packages/vue-primevue-adapter/**`
  - `packages/vue-ui/**`
  - `apps/web-demo/**`

### Best solution

先完成 UI boundary policy 和 wrapper 迁移，再升级 PrimeVue；adapter tests + visual-token tests 必跑。

### Implementation steps

1. Inspect only the listed paths and direct imports/consumers.
2. Write or update the smallest focused test/diagnostic before broad changes.
3. Implement the smallest patch that satisfies the boundary rule.
4. Run the listed validation command.
5. Update the active report, status, risk/decision docs if needed.
6. Stop if validation fails; mark BLOCKED with evidence.

### Validation

```bash
pnpm --filter @ccd/vue-primevue-adapter build && pnpm e2e:visual
```

## DEPS-005 — alova 升级前 HTTP contract/adapter tests 不完整。

- Priority: `P3`
- Severity: `Medium`
- Status: `BLOCKED_BY_HTTP_CONTRACT`
- Module: `依赖与工具链现代化`
- Paths:
  - `package.json`
  - `apps/web-demo/src/utils/http/**`

### Best solution

先完成 HTTP policy 和 request focused tests，再升级 alova；不要与 Vite/PrimeVue 同 lane。

### Implementation steps

1. Inspect only the listed paths and direct imports/consumers.
2. Write or update the smallest focused test/diagnostic before broad changes.
3. Implement the smallest patch that satisfies the boundary rule.
4. Run the listed validation command.
5. Update the active report, status, risk/decision docs if needed.
6. Stop if validation fails; mark BLOCKED with evidence.

### Validation

```bash
request-layer tests && pnpm type-check && pnpm e2e:smoke
```

## DOC-003 — Login Diorama 属于 P3 feature/refactor，当前不应早于 P1/P2 稳定性工作。

- Priority: `P3`
- Severity: `Medium`
- Status: `DEFERRED`
- Module: `文档、风险与审批闭环`
- Paths:
  - `apps/web-demo/src/views/login/**`
  - `docs/ai-plan/PLAN.md`

### Best solution

维持 blocked/deferred；待 E2E、UI boundary、HTTP/auth retry policy 稳定后再开单独 feature lane。

### Implementation steps

1. Inspect only the listed paths and direct imports/consumers.
2. Write or update the smallest focused test/diagnostic before broad changes.
3. Implement the smallest patch that satisfies the boundary rule.
4. Run the listed validation command.
5. Update the active report, status, risk/decision docs if needed.
6. Stop if validation fails; mark BLOCKED with evidence.

### Validation

```bash
owner approval + auth/e2e regression
```

## DOC-004 — 新组织、starter、design-system、Reka/TanStack 等战略工作超出当前 repair scope。

- Priority: `P4`
- Severity: `Low`
- Status: `DEFERRED`
- Module: `文档、风险与审批闭环`
- Paths:
  - `docs/ai-plan/PLAN.md`
  - `docs/ai-plan/FINAL_GO_NO_GO.md`

### Best solution

保持 P4 deferred；必须有独立 business case、owner approval、branch strategy。

### Implementation steps

1. Inspect only the listed paths and direct imports/consumers.
2. Write or update the smallest focused test/diagnostic before broad changes.
3. Implement the smallest patch that satisfies the boundary rule.
4. Run the listed validation command.
5. Update the active report, status, risk/decision docs if needed.
6. Stop if validation fails; mark BLOCKED with evidence.

### Validation

```bash
owner approval only
```
