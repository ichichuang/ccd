# ProForm / ProTable / 通用组件迁移

## 目标

将 apps/web-demo 中具备平台复用价值的高级组件拆为 contracts/shared-utils/vue-ui 或新增 vue-pro-components。

## 负责人建议

Senior Vue / Architect

## 问题清单

| ID       | Priority | Severity | Status | Paths                                                                                          | Problem                                                                        | Best solution                                                                                                                                                                                                               | Validation                                                                                        |
| -------- | -------- | -------- | ------ | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| COMP-001 | P1       | High     | OPEN   | apps/web-demo/src/components/ProForm/\*\*                                                      | ProForm 具备平台通用价值，但仍在 apps/web-demo；与 apps 只保留项目壳目标冲突。 | 分层迁移：schema/type/contracts -> packages/contracts 或 shared-utils；form controller/reactivity/runtime-neutral helpers -> shared-utils；Vue renderers/components -> packages/vue-ui 或新增 packages/vue-pro-components。 | pnpm --filter @ccd/web-demo type-check && focused ProForm vitest && pnpm api:report               |
| COMP-002 | P1       | High     | OPEN   | apps/web-demo/src/components/ProTable/\*\*                                                     | ProTable 已修复局部 helper/export 边界，但仍是 app-local 通用组件。            | 先完成 B-007 layout 修复；再将 ProTable API types、column schema、executor contract 抽到 contracts/shared-utils；Vue renderer 迁到 vue-ui 或 vue-pro-components；examples 改为只消费公开包入口。                            | pnpm exec vitest run ProTable && pnpm --filter @ccd/web-demo type-check && pnpm api:report        |
| COMP-003 | P1       | Medium   | OPEN   | apps/web-demo/src/components/PrimeDialog/\*\*                                                  | PrimeDialog 是可复用 UI wrapper，但留在 app components。                       | 迁移到 packages/vue-ui/src/PrimeDialog 或 packages/vue-primevue-adapter-aware wrapper；对外暴露 CCD-owned props/events，不 raw re-export PrimeVue Dialog。                                                                  | pnpm --filter @ccd/vue-ui build && pnpm --filter @ccd/web-demo type-check && focused dialog tests |
| COMP-004 | P1       | Medium   | OPEN   | apps/web-demo/src/views/example/components/primevue-collection/\*\*                            | examples 与组件内部实现耦合，部分示例历史上穿透内部 engine/types/props。       | 建立 examples consumption rule：examples 只能 import package/app public entry；禁止 ../engine、../types/props 等内部路径。迁移后用 architecture guard 检测。                                                                | pnpm arch:boundaries && pnpm api:report && pnpm type-check                                        |
| COMP-005 | P2       | Medium   | OPEN   | packages/vue-ui/package.json<br>packages/vue-ui/src/index.ts<br>packages/vue-ui/vite.config.ts | vue-ui 可能承载过多高级组件，需决定是否新增 packages/vue-pro-components。      | 如果 ProForm/ProTable 体量继续增长，新增 packages/vue-pro-components，依赖 vue-ui/vue-hooks/shared-utils/contracts；避免 vue-ui 基础 primitive 包膨胀。                                                                     | pnpm ci:prepare-internal && pnpm arch:graphs && pnpm api:report                                   |

## 执行原则

1. 只处理本模块列出的路径和直接调用面。
2. 先验证当前失败，再改代码。
3. 涉及审批门禁的任务只更新决策记录，不擅自实现。
4. 所有迁移必须保持 `packages/contracts -> packages/core -> apps/*` 方向。
5. 不手动编辑 generated artifacts。
