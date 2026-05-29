# HTTP / alova / contracts 边界 — Issue Details

## HTTP-001

- Priority: `P1`
- Severity: `High`
- Status: `BLOCKED_BY_OWNER`

### Paths

- `packages/contracts/src/network.ts`
- `packages/contracts/src/http/**`
- `.ai/runtime/owner_decisions.md`

### Problem

HTTP 专用 contracts 尚未建立，当前只有低层 NetworkClient/NetworkRequest/NetworkResponse。

### Best solution

审批后新增 packages/contracts/src/http/\*\*：RequestConfig、ResponseEnvelope、HttpErrorShape、RetryPolicy、TimeoutPolicy、AuthPolicy、TransportClient；禁止导入 browser/fetch/alova/Zod runtime。

### Validation

```bash
pnpm --filter @ccd/contracts build && pnpm api:report && pnpm arch:runtime
```

## HTTP-007

- Priority: `P1`
- Severity: `High`
- Status: `BLOCKED_BY_PRODUCT`

### Paths

- `apps/web-demo/src/hooks/modules/useAuth.ts`
- `.ai/runtime/owner_decisions.md`

### Problem

restoreLoginFromToken retry/timeout/offline UX 策略仍 pending；无法规范 auth retry policy。

### Best solution

产品/架构决策：401 立即登出；5xx/network 3 次指数退避；每次 5s timeout；可选 offline read-only session。决策后落到 contracts HTTP AuthPolicy。

### Validation

```bash
auth focused tests + e2e invalid token / offline scenario
```

## HTTP-002

- Priority: `P1`
- Severity: `Medium`
- Status: `OPEN`

### Paths

- `packages/core/src/index.ts`
- `packages/core/src/http/**`

### Problem

是否需要 packages/core/src/http/\*\* 尚未证明；盲目新增会过度工程化。

### Best solution

只有当多个 runtime 共享 retry/timeout/auth orchestration 且可 runtime-neutral 表达时，才新增 core/http；否则保持 core 只代理 network adapter。

### Validation

```bash
pnpm --filter @ccd/core build && pnpm arch:runtime
```

## HTTP-003

- Priority: `P1`
- Severity: `Medium`
- Status: `OPEN`

### Paths

- `apps/web-demo/src/utils/http/**`
- `apps/web-demo/src/adapters/http.adapter.ts`

### Problem

HTTP infra 在 utils/http，语义上不是 adapters，但现有规则把该路径视为 approved infrastructure。

### Best solution

短期保留路径，避免大规模 import churn；先引入 contracts/policy 后，再评估是否迁到 apps/web-demo/src/adapters/http/\*\*。

### Validation

```bash
pnpm arch:runtime && pnpm --filter @ccd/web-demo type-check && request-layer tests
```

## HTTP-004

- Priority: `P1`
- Severity: `Medium`
- Status: `OPEN`

### Paths

- `apps/web-demo/src/utils/http/interceptors.ts`
- `apps/web-demo/src/utils/http/methods.ts`
- `apps/web-demo/src/utils/http/connection.ts`
- `apps/web-demo/src/utils/http/**`

### Problem

response handling 同时处理 status、401 refresh/retry、notification、unwrap/decrypt、Zod validation，职责偏重。

### Best solution

拆 policy modules：authRefreshPolicy、errorMappingPolicy、responseDecodePolicy、schemaValidationPolicy、notificationPolicy；每个 policy 单测覆盖。

### Validation

```bash
pnpm exec vitest run apps/web-demo/src/utils/http
```

## HTTP-005

- Priority: `P2`
- Severity: `Medium`
- Status: `OPEN`

### Paths

- `apps/web-demo/src/api/**`

### Problem

API modules 混合 direct wrapper function 与 alova Method builder，request-state 抽象不一致。

### Best solution

统一规范：server-state 或需要 loading/cache/dedupe 的接口优先返回 Method builder 并经 useHttpRequest；简单 one-shot wrapper 明确标为 imperative API。

### Validation

```bash
pnpm --filter @ccd/web-demo type-check && request focused tests
```

## HTTP-006

- Priority: `P2`
- Severity: `Medium`
- Status: `OPEN`

### Paths

- `apps/web-demo/src/components/LoadingLottie.vue`
- `apps/web-demo/src/utils/date/timezone.ts`
- `apps/web-demo/src/utils/http/**`

### Problem

raw fetch 出现在 HTTP infra 外，未来 guard/policy 会误判或漏判。

### Best solution

定义 raw fetch allowlist：HTTP infra、asset loader、timezone probe；长期把非 HTTP raw fetch 包装为 adapter 或 platform utility。

### Validation

```bash
pnpm ai:guard && pnpm arch:runtime
```
