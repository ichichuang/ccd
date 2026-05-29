# 依赖与工具链现代化 — Issue Details

## DEPS-001

- Priority: `P2`
- Severity: `Medium`
- Status: `BLOCKED_BY_APPROVAL`

### Paths

- `package.json`
- `pnpm-lock.yaml`
- `apps/web-demo/package.json`
- `apps/desktop/package.json`

### Problem

Vite 7 -> Vite 8 是高风险 major lane，不能混入架构迁移。

### Best solution

独立 vite8 lane：官方迁移文档 review、config compatibility patch、build/e2e/budget 全套验证。

### Validation

```bash
pnpm build:ci && pnpm e2e:qa && pnpm budget:bundles
```

## DEPS-002

- Priority: `P2`
- Severity: `Medium`
- Status: `BLOCKED_BY_APPROVAL`

### Paths

- `package.json`
- `pnpm-lock.yaml`

### Problem

Vue tooling、TypeScript、vue-tsc、compiler-sfc 有升级面；会影响 type-check 与 SFC parsing。

### Best solution

单独 tooling lane；先 packages type-check，再 web-demo vue-tsc，再 full test/build。

### Validation

```bash
pnpm type-check && pnpm test:run && pnpm build:ci
```

## DEPS-003

- Priority: `P2`
- Severity: `Medium`
- Status: `BLOCKED_BY_APPROVAL`

### Paths

- `package.json`
- `pnpm-lock.yaml`
- `.github/workflows/ci.yml`
- `playwright.config.ts`

### Problem

Playwright 升级需同时处理 browser install/cache/CI artifact 策略。

### Best solution

先完成 E2E suite 拆分和 artifact 上传，再独立升级 Playwright；记录浏览器版本和 snapshot drift。

### Validation

```bash
pnpm e2e:smoke && pnpm e2e:layout && pnpm e2e:visual
```

## DEPS-004

- Priority: `P3`
- Severity: `Medium`
- Status: `BLOCKED_BY_REVIEW`

### Paths

- `package.json`
- `packages/vue-primevue-adapter/**`
- `packages/vue-ui/**`
- `apps/web-demo/**`

### Problem

PrimeVue 升级需要检查 v4 patch/minor API 与 adapter/PT/theme 行为。

### Best solution

先完成 UI boundary policy 和 wrapper 迁移，再升级 PrimeVue；adapter tests + visual-token tests 必跑。

### Validation

```bash
pnpm --filter @ccd/vue-primevue-adapter build && pnpm e2e:visual
```

## DEPS-005

- Priority: `P3`
- Severity: `Medium`
- Status: `BLOCKED_BY_HTTP_CONTRACT`

### Paths

- `package.json`
- `apps/web-demo/src/utils/http/**`

### Problem

alova 升级前 HTTP contract/adapter tests 不完整。

### Best solution

先完成 HTTP policy 和 request focused tests，再升级 alova；不要与 Vite/PrimeVue 同 lane。

### Validation

```bash
request-layer tests && pnpm type-check && pnpm e2e:smoke
```
