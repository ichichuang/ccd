# P2 治理、CSS、Build 与依赖准备计划

## 目标

在 P0/P1 稳定后处理 generated discipline、CSS/token、Vite inventory、dependency lanes。

## 执行顺序

| Order | ID        | Module                            | Severity | Status              |
| ----- | --------- | --------------------------------- | -------- | ------------------- |
| 1     | APP-003   | Layout Runtime 与 App Platform    | Medium   | DONE                |
| 2     | APP-004   | Layout Runtime 与 App Platform    | Medium   | BLOCKED_BY_OWNER    |
| 3     | BUILD-002 | CSS / Tokens / Vite Build         | Medium   | BLOCKED_BY_APPROVAL |
| 4     | BUILD-003 | CSS / Tokens / Vite Build         | Medium   | DONE                |
| 5     | COMP-005  | ProForm / ProTable / 通用组件迁移 | Medium   | BLOCKED_BY_OWNER    |
| 6     | DEPS-001  | 依赖与工具链现代化                | Medium   | BLOCKED_BY_APPROVAL |
| 7     | DEPS-002  | 依赖与工具链现代化                | Medium   | BLOCKED_BY_APPROVAL |
| 8     | DEPS-003  | 依赖与工具链现代化                | Medium   | BLOCKED_BY_APPROVAL |
| 9     | GOV-005   | Governance / Guard / GitHub 治理  | Medium   | DONE                |
| 10    | HTTP-005  | HTTP / alova / contracts 边界     | Medium   | DONE                |
| 11    | HTTP-006  | HTTP / alova / contracts 边界     | Medium   | DONE                |
| 12    | UI-004    | UI 与 PrimeVue 边界治理           | Medium   | DONE                |
| 13    | BUILD-004 | CSS / Tokens / Vite Build         | Low      | DONE                |
| 14    | BUILD-005 | CSS / Tokens / Vite Build         | Low      | DONE                |
| 15    | UI-005    | UI 与 PrimeVue 边界治理           | Low      | DONE                |

## 任务详情

| ID        | Module                            | Severity | Status              | Paths                                                                                                                            | Best solution                                                                                                                                         | Validation                                                       |
| --------- | --------------------------------- | -------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| APP-003   | Layout Runtime 与 App Platform    | Medium   | DONE                | apps/web-demo/src/utils/safeStorage/\*\*<br>packages/contracts/src/storage.ts<br>packages/core/src/index.ts                      | contracts 定义 SafeStoragePolicy/StorageCodec；app adapter 实现 browser storage；shared-utils 提供 pure codec helpers；core 只消费 StorageAdapter。   | pnpm arch:runtime && storage focused tests                       |
| APP-004   | Layout Runtime 与 App Platform    | Medium   | BLOCKED_BY_OWNER    | apps/desktop/**<br>apps/web-demo/**<br>.ai/rules/integrations/09-desktop-branch-governance.mdc                                   | 审批后将 desktop drift summary 纳入 CI；web/desktop 共享 platform package，app 只保留 runtime adapter 差异；本轮不修改 CI/desktop drift scope。       | pnpm build:desktop && pnpm budget:desktop && desktop drift check |
| BUILD-002 | CSS / Tokens / Vite Build         | Medium   | BLOCKED_BY_APPROVAL | apps/web-demo/vite.config.ts<br>apps/web-demo/build/\*\*<br>packages/vue-ui/vite.config.ts<br>packages/vue-charts/vite.config.ts | 独立 branch/worktree；先 inventory 官方文档，再逐项替换/验证；不得和 UI/HTTP/依赖升级混合。                                                           | pnpm build:ci && pnpm e2e:qa && bundle budgets on isolated lane  |
| BUILD-003 | CSS / Tokens / Vite Build         | Medium   | DONE                | apps/web-demo/build/plugins.ts<br>apps/web-demo/build/compress.ts<br>apps/web-demo/build/performance.ts                          | 为每个 plugin 写 compatibility note：是否必须保留、是否迁到 deploy/CDN、是否有 measurable value；移除无价值 progress plugin。                         | pnpm build:web-demo && pnpm budget:bundles                       |
| COMP-005  | ProForm / ProTable / 通用组件迁移 | Medium   | BLOCKED_BY_OWNER    | packages/vue-ui/package.json<br>packages/vue-ui/src/index.ts<br>packages/vue-ui/vite.config.ts                                   | 新增 packages/vue-pro-components 属于 broad package split；本轮仅保留审批前提，不创建新包或改包拓扑。                                                 | pnpm ci:prepare-internal && pnpm arch:graphs && pnpm api:report  |
| DEPS-001  | 依赖与工具链现代化                | Medium   | BLOCKED_BY_APPROVAL | package.json<br>pnpm-lock.yaml<br>apps/web-demo/package.json<br>apps/desktop/package.json                                        | 独立 vite8 lane：官方迁移文档 review、config compatibility patch、build/e2e/budget 全套验证。                                                         | pnpm build:ci && pnpm e2e:qa && pnpm budget:bundles              |
| DEPS-002  | 依赖与工具链现代化                | Medium   | BLOCKED_BY_APPROVAL | package.json<br>pnpm-lock.yaml                                                                                                   | 单独 tooling lane；先 packages type-check，再 web-demo vue-tsc，再 full test/build。                                                                  | pnpm type-check && pnpm test:run && pnpm build:ci                |
| DEPS-003  | 依赖与工具链现代化                | Medium   | BLOCKED_BY_APPROVAL | package.json<br>pnpm-lock.yaml<br>.github/workflows/ci.yml<br>playwright.config.ts                                               | 先完成 E2E suite 拆分和 artifact 上传，再独立升级 Playwright；记录浏览器版本和 snapshot drift。                                                       | pnpm e2e:smoke && pnpm e2e:layout && pnpm e2e:visual             |
| GOV-005   | Governance / Guard / GitHub 治理  | Medium   | DONE                | docs/ai-plan/NEXT_ACTIONS.md<br>docs/ai-plan/PLAN.md<br>docs/en/architecture-contract.md                                         | 重写 Next Actions 为当前优先级版本；保留历史内容到 archived section，避免 AI/人误执行旧 M2 建议。                                                     | pnpm docs:commands                                               |
| HTTP-005  | HTTP / alova / contracts 边界     | Medium   | DONE                | apps/web-demo/src/api/\*\*                                                                                                       | 统一规范：server-state 或需要 loading/cache/dedupe 的接口优先返回 Method builder 并经 useHttpRequest；简单 one-shot wrapper 明确标为 imperative API。 | pnpm --filter @ccd/web-demo type-check && request focused tests  |
| HTTP-006  | HTTP / alova / contracts 边界     | Medium   | DONE                | apps/web-demo/src/components/LoadingLottie.vue<br>apps/web-demo/src/utils/date/timezone.ts<br>apps/web-demo/src/utils/http/\*\*  | 定义 raw fetch allowlist：HTTP infra、asset loader、timezone probe；长期把非 HTTP raw fetch 包装为 adapter 或 platform utility。                      | pnpm ai:guard && pnpm arch:runtime                               |
| UI-004    | UI 与 PrimeVue 边界治理           | Medium   | DONE                | apps/web-demo/src/layouts/components/AppPrimeVueGlobals.vue<br>packages/vue-primevue-adapter/src/services.ts                     | 保留 app shell 装配，但将服务注册/locale sync/overlay outlet 约定抽到 adapter helper；AppPrimeVueGlobals 只做安装点。                                 | pnpm --filter @ccd/vue-primevue-adapter build && e2e:smoke       |
| BUILD-004 | CSS / Tokens / Vite Build         | Low      | DONE                | apps/web-demo/vite.config.ts                                                                                                     | 查看 Vite/Sass 类型定义，替换为 satisfies/明确类型或局部 typed helper；避免扩大 any。                                                                 | pnpm --filter @ccd/web-demo type-check && pnpm build:web-demo    |
| BUILD-005 | CSS / Tokens / Vite Build         | Low      | DONE                | apps/web-demo/vite.config.ts                                                                                                     | 按 env/CI 判断 open:false；本地 dev 可保留自动打开，Playwright/CI 禁止。                                                                              | pnpm e2e:smoke && pnpm --filter @ccd/web-demo dev smoke          |
| UI-005    | UI 与 PrimeVue 边界治理           | Low      | DONE                | apps/web-demo/src/views/example/components/primevue-collection/\*\*                                                              | 建立 examples exception allowlist：showcase 可直接 import PrimeVue，但必须限定在 primevue-collection examples；其他 app routes 不允许。               | pnpm ai:guard && pnpm arch:boundaries                            |

## 完成标准

- 本计划内所有 `OPEN` 项完成并通过验证；或明确 `BLOCKED/DEFERRED` 并记录证据。
- 没有无关源码漂移。
- 没有 generated artifacts 手工编辑。
- 对应 `docs/ai-plan/STATUS.md`、risk/decision docs、active report 已同步。
- 必要时更新 `FINAL_GO_NO_GO.md` 和 `NEXT_ACTIONS.md`。
