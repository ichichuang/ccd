# CSS / Tokens / Vite Build — Issue Details

## BUILD-001

- Priority: `P1`
- Severity: `Medium`
- Status: `OPEN`

### Paths

- `apps/web-demo/vite.config.ts`

### Problem

postcss-pxtorem 仍依赖 selectorBlackList 保护 UnoCSS 原子类，长 blacklist 脆弱。

### Best solution

保持 file-level exclude；逐步改为 token-first：CSS variables、design tokens、container queries、UnoCSS rules，减少全局 px-to-rem 转换面。

### Validation

```bash
pnpm build:web-demo && visual screenshots login/dashboard/table/chart
```

## BUILD-002

- Priority: `P2`
- Severity: `Medium`
- Status: `BLOCKED_BY_APPROVAL`

### Paths

- `apps/web-demo/vite.config.ts`
- `apps/web-demo/build/**`
- `packages/vue-ui/vite.config.ts`
- `packages/vue-charts/vite.config.ts`

### Problem

Vite 8 迁移风险面大：esbuildOptions、esbuild.drop/pure、Rollup manualChunks、experimentalMinChunkSize、minify、plugins。

### Best solution

独立 branch/worktree；先 inventory 官方文档，再逐项替换/验证；不得和 UI/HTTP/依赖升级混合。

### Validation

```bash
pnpm build:ci && pnpm e2e:qa && bundle budgets on isolated lane
```

## BUILD-003

- Priority: `P2`
- Severity: `Medium`
- Status: `OPEN`

### Paths

- `apps/web-demo/build/plugins.ts`
- `apps/web-demo/build/compress.ts`
- `apps/web-demo/build/performance.ts`

### Problem

build plugins 与 Vite major migration 强耦合，ECharts treeshake/compression/progress/visualizer 都需复核。

### Best solution

为每个 plugin 写 compatibility note：是否必须保留、是否迁到 deploy/CDN、是否有 measurable value；移除无价值 progress plugin。

### Validation

```bash
pnpm build:web-demo && pnpm budget:bundles
```

## BUILD-004

- Priority: `P2`
- Severity: `Low`
- Status: `OPEN`

### Paths

- `apps/web-demo/vite.config.ts`

### Problem

Vite config 中 scss preprocessorOptions 使用 as any，是配置层类型逃逸。

### Best solution

查看 Vite/Sass 类型定义，替换为 satisfies/明确类型或局部 typed helper；避免扩大 any。

### Validation

```bash
pnpm --filter @ccd/web-demo type-check && pnpm build:web-demo
```

## BUILD-005

- Priority: `P2`
- Severity: `Low`
- Status: `OPEN`

### Paths

- `apps/web-demo/vite.config.ts`

### Problem

server.open / preview.open 默认为 true，不适合 CI/Playwright server。

### Best solution

按 env/CI 判断 open:false；本地 dev 可保留自动打开，Playwright/CI 禁止。

### Validation

```bash
pnpm e2e:smoke && pnpm --filter @ccd/web-demo dev smoke
```
