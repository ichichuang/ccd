# Web Runtime

The `main` branch is CCD's production Web application runtime.

## Runtime Contract

- Browser-first Vue 3 runtime
- Vite build and preview pipeline
- PrimeVue, UnoCSS, Pinia, Alova, ProForm, ProTable, and ECharts integration
- full examples and demo surfaces retained for architecture reference
- AI governance and generated adapters fully enabled

## Boundaries

- Do not add Tauri shell or desktop-only configuration to `main`.
- Do not introduce desktop-only assumptions into Web runtime abstractions.
- Shared bridge helpers must keep Web fallback behavior intact.
- Web runtime features must remain valid in browser deployment.

## Validation

```bash
pnpm arch:check
pnpm type-check
pnpm lint:check
pnpm test:run
```

Use targeted Playwright checks for UI, layout, or interaction-sensitive changes.
