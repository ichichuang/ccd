# P14 E1 Adapter-Only PrimeVue Reduction Summary

## Phase status

- **Final status**: `P14_M12_SLICE_DONE` (E1)
- **Slice**: E1 adapter-only global PrimeVue service/config/directive reduction

## Changes

| File | Change |
|------|--------|
| `packages/vue-primevue-adapter/src/directives.ts` | Export `primeVueTooltipDirective` |
| `packages/vue-primevue-adapter/src/toastIcons.ts` | Export toast severity icon map |
| `packages/vue-primevue-adapter/src/index.ts` | Public barrel exports |
| `AdminSidebarMenuCollapsed.tsx` | Use adapter tooltip directive |
| `AdminSidebarMenuInline.tsx` | Use adapter tooltip directive |
| `AppPrimeVueGlobals.vue` | Use adapter toast icons |
| `scripts/ai-architecture-guard.mjs` | Remove 2 allowlist rows |

## Allowlist reduction

- Removed: `AdminSidebarMenuCollapsed.tsx`, `AdminSidebarMenuInline.tsx`
- Remaining exact allowlist: 11 rows (was 13)

## Validation

All P14 E1 matrix commands passed. Logs: `command-logs/`
