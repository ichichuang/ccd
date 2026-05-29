# HTTP / alova / contracts 边界

## 目标

保留 alova；新增 HTTP contracts 前必须先审批 request/error/retry/timeout/auth policy shape。

## 负责人建议

Runtime / API Platform

## 问题清单

| ID       | Priority | Severity | Status             | Paths                                                                                                                                                                      | Problem                                                                                                        | Best solution                                                                                                                                                                                     | Validation                                                                         |
| -------- | -------- | -------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| HTTP-001 | P1       | High     | BLOCKED_BY_OWNER   | packages/contracts/src/network.ts<br>packages/contracts/src/http/\*\*<br>.ai/runtime/owner_decisions.md                                                                    | HTTP 专用 contracts 尚未建立，当前只有低层 NetworkClient/NetworkRequest/NetworkResponse。                      | 审批后新增 packages/contracts/src/http/\*\*：RequestConfig、ResponseEnvelope、HttpErrorShape、RetryPolicy、TimeoutPolicy、AuthPolicy、TransportClient；禁止导入 browser/fetch/alova/Zod runtime。 | pnpm --filter @ccd/contracts build && pnpm api:report && pnpm arch:runtime         |
| HTTP-007 | P1       | High     | BLOCKED_BY_PRODUCT | apps/web-demo/src/hooks/modules/useAuth.ts<br>.ai/runtime/owner_decisions.md                                                                                               | restoreLoginFromToken retry/timeout/offline UX 策略仍 pending；无法规范 auth retry policy。                    | 产品/架构决策：401 立即登出；5xx/network 3 次指数退避；每次 5s timeout；可选 offline read-only session。决策后落到 contracts HTTP AuthPolicy。                                                    | auth focused tests + e2e invalid token / offline scenario                          |
| HTTP-002 | P1       | Medium   | OPEN               | packages/core/src/index.ts<br>packages/core/src/http/\*\*                                                                                                                  | 是否需要 packages/core/src/http/\*\* 尚未证明；盲目新增会过度工程化。                                          | 只有当多个 runtime 共享 retry/timeout/auth orchestration 且可 runtime-neutral 表达时，才新增 core/http；否则保持 core 只代理 network adapter。                                                    | pnpm --filter @ccd/core build && pnpm arch:runtime                                 |
| HTTP-003 | P1       | Medium   | OPEN               | apps/web-demo/src/utils/http/\*\*<br>apps/web-demo/src/adapters/http.adapter.ts                                                                                            | HTTP infra 在 utils/http，语义上不是 adapters，但现有规则把该路径视为 approved infrastructure。                | 短期保留路径，避免大规模 import churn；先引入 contracts/policy 后，再评估是否迁到 apps/web-demo/src/adapters/http/\*\*。                                                                          | pnpm arch:runtime && pnpm --filter @ccd/web-demo type-check && request-layer tests |
| HTTP-004 | P1       | Medium   | OPEN               | apps/web-demo/src/utils/http/interceptors.ts<br>apps/web-demo/src/utils/http/methods.ts<br>apps/web-demo/src/utils/http/connection.ts<br>apps/web-demo/src/utils/http/\*\* | response handling 同时处理 status、401 refresh/retry、notification、unwrap/decrypt、Zod validation，职责偏重。 | 拆 policy modules：authRefreshPolicy、errorMappingPolicy、responseDecodePolicy、schemaValidationPolicy、notificationPolicy；每个 policy 单测覆盖。                                                | pnpm exec vitest run apps/web-demo/src/utils/http                                  |
| HTTP-005 | P2       | Medium   | OPEN               | apps/web-demo/src/api/\*\*                                                                                                                                                 | API modules 混合 direct wrapper function 与 alova Method builder，request-state 抽象不一致。                   | 统一规范：server-state 或需要 loading/cache/dedupe 的接口优先返回 Method builder 并经 useHttpRequest；简单 one-shot wrapper 明确标为 imperative API。                                             | pnpm --filter @ccd/web-demo type-check && request focused tests                    |
| HTTP-006 | P2       | Medium   | OPEN               | apps/web-demo/src/components/LoadingLottie.vue<br>apps/web-demo/src/utils/date/timezone.ts<br>apps/web-demo/src/utils/http/\*\*                                            | raw fetch 出现在 HTTP infra 外，未来 guard/policy 会误判或漏判。                                               | 定义 raw fetch allowlist：HTTP infra、asset loader、timezone probe；长期把非 HTTP raw fetch 包装为 adapter 或 platform utility。                                                                  | pnpm ai:guard && pnpm arch:runtime                                                 |

## 执行原则

1. 只处理本模块列出的路径和直接调用面。
2. 先验证当前失败，再改代码。
3. 涉及审批门禁的任务只更新决策记录，不擅自实现。
4. 所有迁移必须保持 `packages/contracts -> packages/core -> apps/*` 方向。
5. 不手动编辑 generated artifacts。
