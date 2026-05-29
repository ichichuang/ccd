# Layout Runtime 与 App Platform

## 目标

将跨 app 的 layout runtime、theme runtime、safe storage policy 从 web-demo app 层迁入平台层。

## 负责人建议

Frontend Platform

## 问题清单

| ID      | Priority | Severity | Status | Paths                                                                                                       | Problem                                                                                                | Best solution                                                                                                                                       | Validation                                                                                        |
| ------- | -------- | -------- | ------ | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| APP-001 | P1       | High     | OPEN   | apps/web-demo/src/layouts/runtime/layoutRuntime.ts<br>packages/vue-app-platform/\*\*                        | layoutRuntime 是跨 app platform 候选，但仍在 web-demo app。                                            | 先抽纯 runtime 状态机/布局计算到 packages/vue-app-platform；router/store/DOM access 通过 app adapter 注入；web-demo 只保留 install/route wiring。   | pnpm --filter @ccd/vue-app-platform build && pnpm --filter @ccd/web-demo type-check && e2e:layout |
| APP-002 | P1       | Medium   | OPEN   | apps/web-demo/src/utils/theme/engine.ts<br>packages/design-tokens/**<br>packages/vue-app-platform/**        | theme engine 仍在 app utils，但主题 token 与 size/breakpoint 本应平台化。                              | 纯 token derivation 放 design-tokens；Vue/runtime theme application 放 vue-app-platform；app 只注入 storage/media/browser capability。              | pnpm validate:tokens && pnpm --filter @ccd/web-demo type-check && visual-token tests              |
| APP-003 | P2       | Medium   | OPEN   | apps/web-demo/src/utils/safeStorage/\*\*<br>packages/contracts/src/storage.ts<br>packages/core/src/index.ts | safeStorage 跨 app 可复用，但涉及 localStorage/sessionStorage 与 obfuscation policy，不能直接塞 core。 | contracts 定义 SafeStoragePolicy/StorageCodec；app adapter 实现 browser storage；shared-utils 提供 pure codec helpers；core 只消费 StorageAdapter。 | pnpm arch:runtime && storage focused tests                                                        |
| APP-004 | P2       | Medium   | OPEN   | apps/desktop/**<br>apps/web-demo/**<br>.ai/rules/integrations/09-desktop-branch-governance.mdc              | desktop 与 web app platform drift 检查仍偏人工，CI scope 未定。                                        | 审批后将 desktop drift summary 纳入 CI；web/desktop 共享 platform package，app 只保留 runtime adapter 差异。                                        | pnpm build:desktop && pnpm budget:desktop && desktop drift check                                  |

## 执行原则

1. 只处理本模块列出的路径和直接调用面。
2. 先验证当前失败，再改代码。
3. 涉及审批门禁的任务只更新决策记录，不擅自实现。
4. 所有迁移必须保持 `packages/contracts -> packages/core -> apps/*` 方向。
5. 不手动编辑 generated artifacts。
