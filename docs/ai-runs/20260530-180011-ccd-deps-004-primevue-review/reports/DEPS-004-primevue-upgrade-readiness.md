# DEPS-004 PrimeVue Upgrade Readiness Review

- Lane: `DEPS-004` review-only
- Repo: `/Users/cc/MyPorject/ccd`
- Baseline: `main` at `af4b1955 docs(auth): 记录 HTTP-007 认证恢复产品决策`
- Decision context: HTTP-001 and HTTP-007 sealed by user input; CI Guardian `26680763779` reported PASS by user input
- Result: `REVIEW_COMPLETE`, `UPGRADE_NOT_APPROVED`

No package upgrade was performed. `package.json` and `pnpm-lock.yaml` were not edited. `pnpm update` was not run.

## Evidence

Primary evidence is under:

- `docs/ai-runs/20260530-180011-ccd-deps-004-primevue-review/command-logs/`
- `docs/ai-runs/20260530-180011-ccd-deps-004-primevue-review/reports/`

High-signal generated evidence:

- `reports/primevue-version-surface.json`
- `reports/primevue-direct-import-file-counts.txt`
- `reports/primevue-direct-import-scope-counts.txt`
- `command-logs/01-direct-import-inventory.log`
- `command-logs/02-ui001-guard-snippet.log`
- `command-logs/03-vue-h-usage-inventory.log`
- `command-logs/04-e2e-primevue-coverage-inventory.log`

## Current Version Surface

Installed versions from `pnpm list` and `node_modules/*/package.json`:

| Package | Installed | Declared ranges |
| --- | ---: | --- |
| `primevue` | `4.5.4` | root, web-demo, desktop, adapter, vue-ui: `^4.5.4` |
| `@primevue/core` | `4.5.4` | root, web-demo, desktop, adapter: `^4.5.4` |
| `@primevue/forms` | `4.5.4` | root, web-demo: `^4.5.4` |
| `@primevue/icons` | `4.5.4` | root, web-demo: `^4.5.4` |
| `@primevue/auto-import-resolver` | `4.5.4` | root, web-demo devDependency: `^4.5.4` |
| `@primeuix/themes` | `2.0.3` | root, web-demo, desktop, adapter: `^2.0.3` |

Evidence:

- `package.json` declares root PrimeVue ranges at lines 176-194 and resolver at line 224.
- `packages/vue-primevue-adapter/package.json`, `packages/vue-ui/package.json`, `apps/web-demo/package.json`, and `apps/desktop/package.json` declare app/package-local ranges.
- `apps/web-demo/build/optimize.ts` prebundles `@primevue/forms`, PrimeVue services, and many `primevue/*` subpaths.
- `apps/web-demo/vite.config.ts` chunks `@primeuix`, `@primevue`, and `primevue` into `vendor-ui`.

## Direct Import Inventory

`command-logs/01-direct-import-inventory.log` contains 167 direct import matches across the requested surfaces:

| Scope | Matches | Interpretation |
| --- | ---: | --- |
| `.ai/rules` | 4 | Documentation examples in auto-import rule, not runtime imports. |
| `apps/desktop` | 1 | `apps/desktop/src/plugins/index.ts` installs PrimeVue via adapter config. |
| `apps/web-demo` | 94 | Includes 62 generated `src/types/components.d.ts` entries, app bootstrap/global shell, exact allowlist files, and approved showcase imports. |
| `packages/vue-primevue-adapter` | 8 | Adapter owns theme, PT, config type, services, locale helpers. |
| `packages/vue-ui` | 60 | Internal CCD wrappers/compositions around PrimeVue primitives, ProForm, ProTable, PrimeDialog, CScrollbar. |
| `e2e` | 0 | E2E references PrimeVue DOM classes, but does not import PrimeVue packages directly. |

Notable details:

- `@primeuix/themes` direct source imports are confined to `packages/vue-primevue-adapter/src/theme/primevuePreset.ts`.
- `@primevue/forms` is dependency/prebundle surface only; no current source direct import was found in the requested surfaces.
- `@primevue/icons` source direct imports appear in `apps/web-demo/src/layouts/components/AppPrimeVueGlobals.vue` for toast message icons.
- `apps/web-demo/src/types/components.d.ts` is generated auto-import typing, not hand-written runtime code.

## UI-001 Guard Status

UI-001 guard was preserved unchanged.

Current enforcement in `scripts/ai-architecture-guard.mjs`:

- Exact non-showcase app allowlist: `approvedPrimeVueAppImportFiles`.
- Approved showcase exception: `apps/web-demo/src/views/example/components/primevue-collection/**`.
- Allowed package internals: `packages/vue-ui/src/**` and `packages/vue-primevue-adapter/src/**`.
- Tests may mock/import PrimeVue.
- `@ccd/vue-ui` may import PrimeVue internally but must not publicly `export ... from 'primevue/*'`.

`pnpm ai:guard -- --format=json` returned `ok: true` with no findings.

Future upgrade lanes must not weaken this guard. Any new non-showcase app direct import must either move behind `@ccd/vue-ui` / `@ccd/vue-primevue-adapter` or receive a recorded owner-approved exact allowlist update.

## Adapter Impact

Primary adapter risk is high enough to require a dedicated upgrade lane:

- `packages/vue-primevue-adapter/src/index.ts` returns `PrimeVueConfiguration` via `createPrimeVueAdapterConfig()`, with `theme.preset`, `theme.options.prefix`, `darkModeSelector`, global `pt`, `ptOptions`, `ripple`, and locale.
- `packages/vue-primevue-adapter/src/services.ts` installs `ToastService`, `ConfirmationService`, `DialogService`, and `Tooltip`, then exposes CCD-owned toast/message adapters and locale helpers.
- `packages/vue-primevue-adapter/src/theme/primevuePreset.ts` adapts `@primeuix/themes/aura` through `definePreset()` and merges CCD design-token and size-token layers.

Upgrade impact areas:

- `PrimeVueConfiguration` type and `theme.options` shape.
- `definePreset(Aura, ...)` and `ComponentsDesignTokens`.
- PT section names for `buttonPt`, `menuPt`, `formControlsPt`, overlays, tabs, splitter.
- Toast/confirm/dialog service install APIs and composable behavior.
- Locale object shape and runtime locale mutation through `usePrimeVue()`.

## Wrapper Impact

`@ccd/vue-ui` is the broadest PrimeVue consumer:

- `CcdPrimeControls` wraps `Button`, `Drawer`, `PanelMenu`, `Popover`, `Select`, `SelectButton`, `TieredMenu`, and `ToggleSwitch`.
- `ProForm` renderers wrap form controls such as `InputText`, `InputNumber`, `InputMask`, `DatePicker`, `Select`, `MultiSelect`, `Slider`, `Rating`, `FileUpload`, `Checkbox`, and `RadioButton`.
- `ProTable` wraps `DataTable`, `Column`, `Paginator`, `Menu`, `Popover`, `Tag`, and related table UI.
- `PrimeDialog` wraps `Dialog`, `Button`, and `@primevue/core` pass-through types.
- `CScrollbar` reads `usePrimeVue()` for ARIA locale.

Current upgrade blocker: the requested CCD Vue rule "no import `h`, no `h()`" is not currently clean in source/test surfaces. Evidence is in `command-logs/03-vue-h-usage-inventory.log`, including:

- `packages/vue-ui/src/CcdPrimeControls/index.ts`
- `packages/vue-ui/src/ProTable/VirtualGridRenderer.vue`
- `packages/vue-ui/src/ProTable/ProTable.vue`
- `apps/web-demo/src/layouts/components/admin/AdminSidebarMenu.tsx`
- test harnesses using `h()`

Because this lane is review-only, no source was modified. A future implementation lane must either remediate these surfaces with TSX/template render output or record an explicit architecture exception before touching wrappers.

## Theme, PT, And Service Risk

Risk level: `HIGH`.

Reasons:

- CCD uses PrimeVue Styled Mode with a custom `@primeuix/themes` Aura preset.
- Global PT is centralized in adapter exports and app bootstrap.
- Local/global styling still contains many `.p-*` dependencies in app SCSS, layout interaction styles, toast styling, transition rules, and ProTable exceptions.
- E2E and visual tests assert `.p-*` DOM class behavior; class or DOM changes can break tests without TypeScript failures.
- `@primevue/forms` is currently prebundled but unused by source direct imports; future upgrade should either justify retaining it or handle removal in a separate dependency hygiene lane.

Specific watch points:

- PT slot names for `Select`, `MultiSelect`, `DatePicker`, `DataTable`, `Dialog`, `Drawer`, `Tabs`, `Popover`, `ConfirmPopup`, and `Splitter`.
- Toast severity mapping: CCD public API accepts `danger`, adapter normalizes it to PrimeVue `error`.
- `usePrimeVue().config.locale` runtime mutation.
- Tooltip directive install and touch/focus workarounds.
- Generated auto-import component typing from `PrimeVueResolver()`.

## CSS And Visual Risk

Risk level: `HIGH`.

PrimeVue upgrade can silently alter:

- `.p-*` class names or DOM nesting used by `custom-primevue.scss`, `interaction.scss`, theme transitions, ProTable geometry, toast placement, drawer masks, PanelMenu/TieredMenu menu states, and form control focus styles.
- DataTable scroll container class names used by `ProTable`.
- Overlay mask and portal structure used by drawer/dialog tests.
- Input compound component focus/hover class transitions.

Current CSS exception policy remains:

- PT-first customization.
- No new `:deep(.p-*)` except the documented exception list.
- Existing broad app SCSS dependency on `.p-*` should be treated as visual-regression-sensitive debt, not as a reason to weaken rules.

## E2E Validation Checklist For Future Upgrade Lane

Minimum future lane validation after dependency mutation:

- `pnpm install --frozen-lockfile`
- `pnpm --filter @ccd/vue-primevue-adapter build`
- `pnpm --filter @ccd/vue-ui build`
- `pnpm --filter @ccd/web-demo type-check`
- `pnpm --filter @ccd/desktop type-check`
- `pnpm api:report`
- `pnpm ai:guard -- --format=json`
- `pnpm ai:doctor`
- `pnpm codex:preflight`
- `pnpm validate:governance`
- `pnpm test:run`
- `pnpm e2e:layout`
- `pnpm e2e:visual`
- `pnpm e2e:qa:prepared`
- `git diff --check`
- `git status --short --untracked-files=all`

Route/behavior checklist:

- Web and desktop PrimeVue bootstrap install.
- Global toast/message placement and severity mapping.
- ConfirmPopup, DynamicDialog, PrimeDialog, Drawer, Tooltip.
- ProTable basic/server/virtual/advanced/table-form combo routes.
- ProForm basic/group/validation/dag/reactions/plugins/api-events routes.
- PrimeVue overview route form controls, overlays, menu components, Button family, and theme switching.
- Sidebar/menu first-paint route state for `primevue-collection` routes.
- Visual snapshots for dashboard, theme system page, form controls, ProTable geometry, Drawer/Dialog overlays.

## Rollback Plan

For a future approved upgrade lane:

1. Keep the lane isolated to PrimeVue, `@primevue/*`, and `@primeuix/themes`.
2. Preserve a pre-upgrade evidence directory with version surface, lockfile diff, API report, and guard output.
3. If validation fails, revert only the dependency/lockfile changes and any official generated outputs from that lane.
4. Re-run `pnpm install --frozen-lockfile`.
5. Re-run `pnpm ai:guard -- --format=json`, `pnpm api:report`, `pnpm ai:doctor`, `pnpm codex:preflight`, `pnpm validate:governance`, and the relevant E2E subset.
6. Do not use rollback to mutate HTTP runtime, Login Diorama, Vite major config, GitHub remote settings, P4 work, or unrelated UI behavior.

## Exact Future Lane Approval Requirements

DEPS-004 implementation remains blocked until all of these are true:

1. A recorded owner/operator approval exists in `docs/ai-plan/DECISIONS.md` or `.ai/runtime/owner_decisions.md` naming `DEPS-004 PrimeVue upgrade implementation`.
2. The approval names exact target versions for `primevue`, all touched `@primevue/*` packages, and `@primeuix/themes`.
3. The approval explicitly permits editing `package.json` and `pnpm-lock.yaml`.
4. The approval explicitly permits the package-manager command to be used, for example a scoped install/update for only the approved packages.
5. The approval forbids unrelated dependency upgrades, Vite major migration, HTTP runtime changes, Login Diorama changes, P4 work, GitHub remote mutation, and broad UI rewrites.
6. The approval states whether visual snapshot updates are allowed; if allowed, it must define owner review criteria for changed screenshots.
7. The approval preserves UI-001 direct import policy: exact non-showcase app allowlist plus the approved PrimeVue showcase exception only.
8. The approval resolves the existing `h()` rule conflict before wrapper migrations, or records a narrow exception with owner rationale.
9. The lane includes the E2E validation checklist above and a rollback checkpoint before dependency mutation.

Until then, DEPS-004 is review-ready but not implementation-ready. The bug here is procedural, not technical: the runway exists, the takeoff clearance does not.
