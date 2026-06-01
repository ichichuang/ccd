# Allowlist Before / After — P20

## Before (baseline, 6 rows)

```
apps/desktop/src/plugins/index.ts
apps/web-demo/build/plugins.ts
apps/web-demo/src/layouts/components/AppPrimeVueGlobals.vue
apps/web-demo/src/plugins/modules/primevue.ts
apps/web-demo/src/types/components.d.ts
apps/web-demo/src/views/example/hooks/use-app-element-size.vue
```

## After (5 rows)

```
apps/desktop/src/plugins/index.ts
apps/web-demo/build/plugins.ts
apps/web-demo/src/layouts/components/AppPrimeVueGlobals.vue
apps/web-demo/src/plugins/modules/primevue.ts
apps/web-demo/src/types/components.d.ts
```

## Removed row

| file | primevue_import | migration |
|---|---|---|
| `apps/web-demo/src/views/example/hooks/use-app-element-size.vue` | `primevue/tag` | → `@ccd/vue-ui` `CcdTag` |

## Count

- Before: 6
- After: 5
- Delta: −1
