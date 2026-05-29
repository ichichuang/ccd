# ProForm / ProTable / 通用组件迁移 — Issue Details

## COMP-001

- Priority: `P1`
- Severity: `High`
- Status: `OPEN`

### Paths

- `apps/web-demo/src/components/ProForm/**`

### Problem

ProForm 具备平台通用价值，但仍在 apps/web-demo；与 apps 只保留项目壳目标冲突。

### Best solution

分层迁移：schema/type/contracts -> packages/contracts 或 shared-utils；form controller/reactivity/runtime-neutral helpers -> shared-utils；Vue renderers/components -> packages/vue-ui 或新增 packages/vue-pro-components。

### Validation

```bash
pnpm --filter @ccd/web-demo type-check && focused ProForm vitest && pnpm api:report
```

## COMP-002

- Priority: `P1`
- Severity: `High`
- Status: `OPEN`

### Paths

- `apps/web-demo/src/components/ProTable/**`

### Problem

ProTable 已修复局部 helper/export 边界，但仍是 app-local 通用组件。

### Best solution

先完成 B-007 layout 修复；再将 ProTable API types、column schema、executor contract 抽到 contracts/shared-utils；Vue renderer 迁到 vue-ui 或 vue-pro-components；examples 改为只消费公开包入口。

### Validation

```bash
pnpm exec vitest run ProTable && pnpm --filter @ccd/web-demo type-check && pnpm api:report
```

## COMP-003

- Priority: `P1`
- Severity: `Medium`
- Status: `OPEN`

### Paths

- `apps/web-demo/src/components/PrimeDialog/**`

### Problem

PrimeDialog 是可复用 UI wrapper，但留在 app components。

### Best solution

迁移到 packages/vue-ui/src/PrimeDialog 或 packages/vue-primevue-adapter-aware wrapper；对外暴露 CCD-owned props/events，不 raw re-export PrimeVue Dialog。

### Validation

```bash
pnpm --filter @ccd/vue-ui build && pnpm --filter @ccd/web-demo type-check && focused dialog tests
```

## COMP-004

- Priority: `P1`
- Severity: `Medium`
- Status: `OPEN`

### Paths

- `apps/web-demo/src/views/example/components/primevue-collection/**`

### Problem

examples 与组件内部实现耦合，部分示例历史上穿透内部 engine/types/props。

### Best solution

建立 examples consumption rule：examples 只能 import package/app public entry；禁止 ../engine、../types/props 等内部路径。迁移后用 architecture guard 检测。

### Validation

```bash
pnpm arch:boundaries && pnpm api:report && pnpm type-check
```

## COMP-005

- Priority: `P2`
- Severity: `Medium`
- Status: `OPEN`

### Paths

- `packages/vue-ui/package.json`
- `packages/vue-ui/src/index.ts`
- `packages/vue-ui/vite.config.ts`

### Problem

vue-ui 可能承载过多高级组件，需决定是否新增 packages/vue-pro-components。

### Best solution

如果 ProForm/ProTable 体量继续增长，新增 packages/vue-pro-components，依赖 vue-ui/vue-hooks/shared-utils/contracts；避免 vue-ui 基础 primitive 包膨胀。

### Validation

```bash
pnpm ci:prepare-internal && pnpm arch:graphs && pnpm api:report
```
