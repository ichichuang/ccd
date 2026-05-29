# UI 与 PrimeVue 边界治理 — Issue Details

## UI-001

- Priority: `P1`
- Severity: `High`
- Status: `BLOCKED_BY_POLICY`

### Paths

- `packages/vue-primevue-adapter/**`
- `packages/vue-ui/**`
- `apps/web-demo/**`
- `apps/desktop/**`

### Problem

37 个源文件直接 import primevue/_ 或 @primevue/_；直接加 guard 会产生大量 false positives。

### Best solution

先写 UI boundary policy：允许 adapter/bootstrap/build resolver/tests；禁止 app domain/layout 直接 import PrimeVue，迁移到 CCD wrapper；examples 可列明 showcase exceptions。

### Validation

```bash
pnpm docs:commands && pnpm arch:boundaries
```

## UI-002

- Priority: `P1`
- Severity: `High`
- Status: `OPEN`

### Paths

- `apps/web-demo/src/layouts/**`
- `apps/web-demo/src/components/**`
- `apps/desktop/src/views/DesktopHome.vue`

### Problem

layout/navigation/domain 直接使用 Drawer/PanelMenu/TieredMenu/Tooltip/Button/Tag 等 PrimeVue 组件。

### Best solution

按使用频率抽 CcdDrawer、CcdMenu、CcdTooltip、CcdButton、CcdTag 等 wrapper；业务层只 import @ccd/vue-ui。

### Validation

```bash
pnpm --filter @ccd/vue-ui build && pnpm --filter @ccd/web-demo type-check && e2e:layout
```

## UI-003

- Priority: `P1`
- Severity: `Medium`
- Status: `OPEN`

### Paths

- `packages/vue-ui/src/CScrollbar/CScrollbar.vue`
- `packages/vue-ui/src/EmptyState/EmptyState.vue`

### Problem

packages/vue-ui 内部组合 PrimeVue，但需要明确“允许内部组合、禁止 raw re-export”的规则。

### Best solution

在 package README/API surface 中声明 vue-ui 可内部适配 PrimeVue，但 public API 必须是 CCD-owned props/types；不导出 PrimeVue 原始组件或类型，除非 type-only 且有 policy。

### Validation

```bash
pnpm api:report && pnpm --filter @ccd/vue-ui build
```

## UI-004

- Priority: `P2`
- Severity: `Medium`
- Status: `OPEN`

### Paths

- `apps/web-demo/src/layouts/components/AppPrimeVueGlobals.vue`
- `packages/vue-primevue-adapter/src/services.ts`

### Problem

PrimeVue global services shell 仍在 app layout 组件中。

### Best solution

保留 app shell 装配，但将服务注册/locale sync/overlay outlet 约定抽到 adapter helper；AppPrimeVueGlobals 只做安装点。

### Validation

```bash
pnpm --filter @ccd/vue-primevue-adapter build && e2e:smoke
```

## UI-005

- Priority: `P2`
- Severity: `Low`
- Status: `OPEN`

### Paths

- `apps/web-demo/src/views/example/components/primevue-collection/**`

### Problem

PrimeVue showcase examples 需要特殊边界，不能与业务 app 直用同等处理。

### Best solution

建立 examples exception allowlist：showcase 可直接 import PrimeVue，但必须限定在 primevue-collection examples；其他 app routes 不允许。

### Validation

```bash
pnpm ai:guard && pnpm arch:boundaries
```
