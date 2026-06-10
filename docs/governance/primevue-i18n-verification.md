# PrimeVue and vue-i18n Verification

Review date: 2026-06-10.

Current repo versions:

- `primevue`: `^4.5.5`
- `@primevue/core`: `^4.5.5`
- `@primeuix/themes`: `^2.0.3`
- `vue-i18n`: `^11.4.5`

Official sources checked:

- <https://primevue.org/configuration/>
- <https://primevue.org/passthrough/>
- <https://primevue.org/theming/styled/>
- <https://vue-i18n.intlify.dev/guide/advanced/composition>
- <https://vue-i18n.intlify.dev/api/general>
- <https://vue-i18n.intlify.dev/guide/advanced/typescript>

## PrimeVue Adapter

Current implementation surfaces:

- `packages/vue-primevue-adapter/src/index.ts`
- `packages/vue-primevue-adapter/src/services.ts`
- `packages/vue-primevue-adapter/src/theme/**`
- `apps/web-demo/src/plugins/modules/primevue.ts`
- `apps/web-demo/src/layouts/components/AppPrimeVueGlobals.vue`
- `apps/web-demo/src/locales/primevue-locales.ts`
- `apps/web-demo/src/locales/primevue-en-US.ts`
- `apps/web-demo/src/locales/primevue-zh-CN.ts`

Findings:

- PrimeVue configuration remains adapter-owned. Apps install PrimeVue through `installPrimeVueRuntime()` instead of scattering raw `app.use(PrimeVue, ...)`.
- Styled mode usage matches the official theme configuration shape: `theme.preset` plus `theme.options.prefix` and `theme.options.darkModeSelector`.
- CCD intentionally sets `darkModeSelector: ".dark"` because the app owns dark-mode class switching.
- Pass Through usage matches official global `pt` and `ptOptions` behavior. CCD sets `mergeSections: true` and `mergeProps: true` so local/global PT classes merge instead of replacing each other.
- `ripple: true` is explicit, matching PrimeVue's opt-in ripple configuration.
- Locale setup uses PrimeVue's documented global `locale` configuration. Runtime language switching updates `usePrimeVue().config.locale` through the adapter helper `applyPrimeVueLocale()`, which is compatible with PrimeVue's reactive locale config.
- Toast, confirm popup, dynamic dialog, tooltip, and PrimeVue runtime composables are exported through adapter facades. This preserves the current PrimeVue boundary and avoids raw app-wide PrimeVue service imports in business surfaces.

Validation coverage:

- `apps/web-demo/src/plugins/modules/primevue.spec.ts` verifies app installation routes through the adapter.
- `packages/vue-primevue-adapter/src/services.spec.ts` verifies config shape, service registration, toast/message helpers, runtime composable wrappers, and locale fallback.
- `scripts/architecture/primevue-boundary-policy.spec.ts` guards the app/adapter boundary.

## vue-i18n Runtime

Current implementation surfaces:

- `packages/vue-app-platform/src/i18nRuntime.ts`
- `packages/vue-app-platform/src/i18nRuntime.spec.ts`
- `apps/web-demo/src/locales/index.ts`
- `apps/web-demo/src/stores/modules/system/locale.ts`
- `apps/web-demo/src/hooks/modules/useLocale.ts`

Findings:

- CCD uses `createI18n({ legacy: false })`, which is the official composition API mode.
- `globalInjection` is explicit and defaults to true through the CCD wrapper, matching the documented path for template `$t`, `$d`, and `$n` usage with composition mode.
- The wrapper owns `locale`, `fallbackLocale`, `messages`, `datetimeFormats`, `missingWarn`, and `fallbackWarn` configuration. Development warnings are enabled only for development mode.
- Locale descriptors are contract-backed through `LocaleRegistration`, and document `lang` / `dir` attributes are applied through an app adapter.
- Message resources are centralized by locale and typed with `LocaleMessageRegistry`; this follows the official TypeScript guidance that locale resources can be typed from schema/resource definitions.

Validation coverage:

- `packages/vue-app-platform/src/i18nRuntime.spec.ts` verifies runtime creation/installation, locale fallback, locale mutation, and document `lang` / `dir` application.
- `apps/web-demo/src/stores/modules/system/locale.spec.ts` verifies app locale switching behavior.

## Decision

No PrimeVue, vue-i18n, Reka UI, TanStack Query, or dependency changes are required for P3. Current adapter and i18n usage is compatible with official PrimeVue v4 and vue-i18n composition-mode documentation.
