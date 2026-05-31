# M8 Remaining App Facade Scope

The following surfaces intentionally remain app-owned after M8:

| surface | owner after M8 | reason | future lane |
|---|---|---|---|
| `applyTheme` in `apps/web-demo/src/utils/theme/engine.ts` | app compatibility facade | Injects `document.documentElement`, `localStorage`, and app storage keys into `@ccd/vue-app-platform`. | Future theme runtime facade cleanup, not M8. |
| `applySizeTheme` | app compatibility facade | Writes root style and preserves non-size variables. | Future injected target helper only with visual validation. |
| `applyRuntimeSizeUpdate` | app compatibility facade | Writes root style and `dataset.fontScale`; now consumes package pure font-var derivation. | Future injected target helper only with layout/visual validation. |
| `applyRootFontSize` | app compatibility facade | Direct DOM `setProperty` and `dataset` mutation. | Future compatibility cleanup if consumers remain. |
| `applyAllSizeVars` | app compatibility facade | First-paint DOM mutation for preload path. | Future injected preloader helper only with first-paint validation. |
| `preload` | app bootstrap utility | Reads `document`, `window.devicePixelRatio`, `localStorage`, safeStorage payloads, and app device collectors before Pinia mounts. | Future preloader adapter split; not M8. |
| `useSizeStore` | app Pinia store | Owns persisted state, serializer, and cross-window sync. | M10 pure state extraction only; store remains app-owned. |
| `deviceSync.ts` and `useDeviceStore` | app runtime collectors/stores | Use `navigator`, `window`, `screen`, listeners, debounce, and Pinia. | M9 device runtime resolver foundation. |

M8 does not reduce PrimeVue allowlists, does not touch safeStorage crypto/compression, does not move stores, and does not change manifests or lockfile.
