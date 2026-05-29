# 02 — 目标架构

## 目标拓扑

```text
packages/contracts
  ↓ type-only / policy-only
packages/core
  ↓ runtime-neutral orchestration facade
packages/shared-utils
packages/design-tokens
packages/unocss-preset
packages/vue-hooks
packages/vue-app-platform
packages/vue-ui
packages/vue-primevue-adapter
packages/vue-charts
  ↓ package build outputs
apps/web-demo
apps/desktop
```

## 分层规则

| 层                   | 允许内容                                                             | 禁止内容                                                             | 典型路径                                   |
| -------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------ |
| root                 | orchestration scripts、workspace metadata、CI orchestration          | runtime app logic、browser UI code                                   | `package.json`, `turbo.json`, `scripts/**` |
| contracts            | DTO、capability interface、policy type、transport shape              | Vue、PrimeVue、Zod runtime、fetch、storage、timer                    | `packages/contracts/src/**`                |
| core                 | runtime-neutral adapter facade、policy executor                      | browser globals、Node builtins、Tauri、Pinia、router、Vue components | `packages/core/src/**`                     |
| shared-utils         | pure function、serialization、clone/equal、bridge helper             | DOM、Vue runtime、network、storage                                   | `packages/shared-utils/src/**`             |
| vue-hooks            | Vue/browser composables、directives                                  | app-specific stores/routes/auth                                      | `packages/vue-hooks/src/**`                |
| vue-app-platform     | app lifecycle、layout runtime、theme runtime、platform orchestration | business views、route table、domain API                              | `packages/vue-app-platform/src/**`         |
| vue-ui               | CCD-owned primitives、stable UI wrappers                             | raw PrimeVue re-export bucket                                        | `packages/vue-ui/src/**`                   |
| vue-primevue-adapter | PrimeVue preset/PT/services/config                                   | business UI / app views                                              | `packages/vue-primevue-adapter/src/**`     |
| apps                 | project entry、routes、stores、runtime adapters、views               | reusable platform components/types                                   | `apps/*/src/**`                            |

## 抽取决策矩阵

| 候选能力                               | 判断问题                                                         | 目标位置                                  |
| -------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------- |
| DTO / API shape / capability interface | 是否不依赖 runtime？是否跨 web/desktop 可复用？                  | `packages/contracts`                      |
| 运行时无关编排                         | 是否只通过 adapter interface 工作？                              | `packages/core`                           |
| pure utility                           | 是否无 Vue/DOM/runtime？                                         | `packages/shared-utils`                   |
| Vue composable                         | 是否依赖 Vue reactive/lifecycle，但不依赖具体 app store/router？ | `packages/vue-hooks`                      |
| layout/theme/app lifecycle             | 是否跨 app shell 复用？                                          | `packages/vue-app-platform`               |
| UI primitive/wrapper                   | 是否是 CCD-owned UI 语义？                                       | `packages/vue-ui`                         |
| 高级业务无关组件                       | 是否体量较大且依赖多个 UI primitives？                           | `packages/vue-pro-components`（建议新增） |
| PrimeVue config/service                | 是否 PrimeVue-specific？                                         | `packages/vue-primevue-adapter`           |
| app-specific behavior                  | 是否依赖具体 route/store/env/domain？                            | `apps/*`                                  |
