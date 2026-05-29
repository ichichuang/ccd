# Layout Runtime 与 App Platform — Issue Details

## APP-001

- Priority: `P1`
- Severity: `High`
- Status: `OPEN`

### Paths

- `apps/web-demo/src/layouts/runtime/layoutRuntime.ts`
- `packages/vue-app-platform/**`

### Problem

layoutRuntime 是跨 app platform 候选，但仍在 web-demo app。

### Best solution

先抽纯 runtime 状态机/布局计算到 packages/vue-app-platform；router/store/DOM access 通过 app adapter 注入；web-demo 只保留 install/route wiring。

### Validation

```bash
pnpm --filter @ccd/vue-app-platform build && pnpm --filter @ccd/web-demo type-check && e2e:layout
```

## APP-002

- Priority: `P1`
- Severity: `Medium`
- Status: `OPEN`

### Paths

- `apps/web-demo/src/utils/theme/engine.ts`
- `packages/design-tokens/**`
- `packages/vue-app-platform/**`

### Problem

theme engine 仍在 app utils，但主题 token 与 size/breakpoint 本应平台化。

### Best solution

纯 token derivation 放 design-tokens；Vue/runtime theme application 放 vue-app-platform；app 只注入 storage/media/browser capability。

### Validation

```bash
pnpm validate:tokens && pnpm --filter @ccd/web-demo type-check && visual-token tests
```

## APP-003

- Priority: `P2`
- Severity: `Medium`
- Status: `OPEN`

### Paths

- `apps/web-demo/src/utils/safeStorage/**`
- `packages/contracts/src/storage.ts`
- `packages/core/src/index.ts`

### Problem

safeStorage 跨 app 可复用，但涉及 localStorage/sessionStorage 与 obfuscation policy，不能直接塞 core。

### Best solution

contracts 定义 SafeStoragePolicy/StorageCodec；app adapter 实现 browser storage；shared-utils 提供 pure codec helpers；core 只消费 StorageAdapter。

### Validation

```bash
pnpm arch:runtime && storage focused tests
```

## APP-004

- Priority: `P2`
- Severity: `Medium`
- Status: `OPEN`

### Paths

- `apps/desktop/**`
- `apps/web-demo/**`
- `.ai/rules/integrations/09-desktop-branch-governance.mdc`

### Problem

desktop 与 web app platform drift 检查仍偏人工，CI scope 未定。

### Best solution

审批后将 desktop drift summary 纳入 CI；web/desktop 共享 platform package，app 只保留 runtime adapter 差异。

### Validation

```bash
pnpm build:desktop && pnpm budget:desktop && desktop drift check
```
