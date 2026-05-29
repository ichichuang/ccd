# UI 与 PrimeVue 边界治理

## 目标

PrimeVue 继续保留，但业务/平台组件不得无边界地直接依赖 PrimeVue；先 policy，后 wrapper，最后 guard。

## 负责人建议

UI Platform

## 问题清单

| ID     | Priority | Severity | Status            | Paths                                                                                                        | Problem                                                                                             | Best solution                                                                                                                                                                | Validation                                                                              |
| ------ | -------- | -------- | ----------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| UI-001 | P1       | High     | BLOCKED_BY_POLICY | packages/vue-primevue-adapter/**<br>packages/vue-ui/**<br>apps/web-demo/**<br>apps/desktop/**                | 37 个源文件直接 import primevue/_ 或 @primevue/_；直接加 guard 会产生大量 false positives。         | 先写 UI boundary policy：允许 adapter/bootstrap/build resolver/tests；禁止 app domain/layout 直接 import PrimeVue，迁移到 CCD wrapper；examples 可列明 showcase exceptions。 | pnpm docs:commands && pnpm arch:boundaries                                              |
| UI-002 | P1       | High     | OPEN              | apps/web-demo/src/layouts/**<br>apps/web-demo/src/components/**<br>apps/desktop/src/views/DesktopHome.vue    | layout/navigation/domain 直接使用 Drawer/PanelMenu/TieredMenu/Tooltip/Button/Tag 等 PrimeVue 组件。 | 按使用频率抽 CcdDrawer、CcdMenu、CcdTooltip、CcdButton、CcdTag 等 wrapper；业务层只 import @ccd/vue-ui。                                                                     | pnpm --filter @ccd/vue-ui build && pnpm --filter @ccd/web-demo type-check && e2e:layout |
| UI-003 | P1       | Medium   | OPEN              | packages/vue-ui/src/CScrollbar/CScrollbar.vue<br>packages/vue-ui/src/EmptyState/EmptyState.vue               | packages/vue-ui 内部组合 PrimeVue，但需要明确“允许内部组合、禁止 raw re-export”的规则。             | 在 package README/API surface 中声明 vue-ui 可内部适配 PrimeVue，但 public API 必须是 CCD-owned props/types；不导出 PrimeVue 原始组件或类型，除非 type-only 且有 policy。    | pnpm api:report && pnpm --filter @ccd/vue-ui build                                      |
| UI-004 | P2       | Medium   | OPEN              | apps/web-demo/src/layouts/components/AppPrimeVueGlobals.vue<br>packages/vue-primevue-adapter/src/services.ts | PrimeVue global services shell 仍在 app layout 组件中。                                             | 保留 app shell 装配，但将服务注册/locale sync/overlay outlet 约定抽到 adapter helper；AppPrimeVueGlobals 只做安装点。                                                        | pnpm --filter @ccd/vue-primevue-adapter build && e2e:smoke                              |
| UI-005 | P2       | Low      | OPEN              | apps/web-demo/src/views/example/components/primevue-collection/\*\*                                          | PrimeVue showcase examples 需要特殊边界，不能与业务 app 直用同等处理。                              | 建立 examples exception allowlist：showcase 可直接 import PrimeVue，但必须限定在 primevue-collection examples；其他 app routes 不允许。                                      | pnpm ai:guard && pnpm arch:boundaries                                                   |

## 执行原则

1. 只处理本模块列出的路径和直接调用面。
2. 先验证当前失败，再改代码。
3. 涉及审批门禁的任务只更新决策记录，不擅自实现。
4. 所有迁移必须保持 `packages/contracts -> packages/core -> apps/*` 方向。
5. 不手动编辑 generated artifacts。
