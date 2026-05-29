# 架构核心层与平台抽取

## 目标

定义 common core layer 的真实含义：不是把所有能力塞进 packages/core，而是形成 contracts/core/platform packages/apps 的稳定分层。

## 负责人建议

Architect / Maintainer

## 问题清单

| ID       | Priority | Severity | Status | Paths                                                                                                                         | Problem                                                                                                                     | Best solution                                                                                                                                                                                                                                                                                                                | Validation                                                        |
| -------- | -------- | -------- | ------ | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| ARCH-001 | P0       | High     | OPEN   | docs/en/architecture-contract.md<br>docs/architecture/ownership-boundaries.md<br>docs/ai-plan/SPEC.md<br>docs/ai-plan/PLAN.md | “common core layer” 容易被误解为把所有通用能力迁入 packages/core，违背 packages/core runtime-neutral facade 的定位。        | 将 common core layer 明确定义为 packages/\* 平台层组合：contracts/core/shared-utils/vue-hooks/vue-app-platform/vue-ui/vue-primevue-adapter/vue-charts；packages/core 只保留 runtime-neutral orchestration。新增 ADR 固化分层术语。                                                                                           | pnpm docs:commands && pnpm arch:graphs && pnpm api:report         |
| ARCH-002 | P0       | High     | OPEN   | packages/core/src/index.ts<br>packages/contracts/src/index.ts<br>packages/_/package.json<br>apps/_/package.json               | 平台抽取缺少统一判定标准，容易把 Vue/PrimeVue/browser runtime 误迁入 contracts/core。                                       | 建立 extraction decision matrix：pure DTO -> contracts；runtime-neutral orchestration -> core；pure utils -> shared-utils；Vue/browser composables -> vue-hooks；app bootstrap/layout runtime -> vue-app-platform；UI primitives -> vue-ui；PrimeVue config -> vue-primevue-adapter；app-specific runtime -> apps adapters。 | pnpm arch:runtime && pnpm arch:boundaries && pnpm api:report      |
| ARCH-003 | P1       | Medium   | OPEN   | apps/web-demo/package.json<br>apps/desktop/package.json                                                                       | apps package manifests 暴露 ./src/main.ts；语义上像库入口，但 apps 目标应是项目壳，不应作为公共 API 被其他 workspace 消费。 | 移除 apps/_ package exports，或增加 explicit private app-only export policy 并让 api surface 报告忽略 apps exports；禁止其他 apps/package import apps/_。                                                                                                                                                                    | pnpm api:report && pnpm arch:boundaries && pnpm ci:smoke:packages |
| ARCH-004 | P1       | Medium   | OPEN   | docs/en/architecture-contract.md<br>packages/shared-utils/src/createCapabilityBridge.ts<br>packages/shared-utils/src/index.ts | 架构文档仍把 createCapabilityBridge 列为 app-local candidate，但当前实现已在 packages/shared-utils。                        | 修正文档 drift：createCapabilityBridge 属于 shared-utils pure utility；保留 apps/web-demo/infra/auth 和 infra/router 作为 app adapter capability providers。                                                                                                                                                                 | pnpm docs:commands && pnpm api:report                             |
| ARCH-005 | P1       | Medium   | OPEN   | package.json<br>apps/web-demo/package.json<br>apps/desktop/package.json<br>packages/\*/package.json                           | root 角色是 orchestration-only，但 root dependencies 中包含大量 runtime/frontend 依赖；可能掩盖依赖所有权。                 | 做 dependency ownership audit：运行时依赖应尽量归属实际消费 app/package；root 保留 orchestration/dev tooling。迁移前先用 pnpm why 和 build smoke 确认不会破坏 workspace resolution。                                                                                                                                         | pnpm ci:prepare-internal && pnpm type-check && pnpm build:ci      |

## 执行原则

1. 只处理本模块列出的路径和直接调用面。
2. 先验证当前失败，再改代码。
3. 涉及审批门禁的任务只更新决策记录，不擅自实现。
4. 所有迁移必须保持 `packages/contracts -> packages/core -> apps/*` 方向。
5. 不手动编辑 generated artifacts。
