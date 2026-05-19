# Legacy vs Web Demo Cleanup Guidance

## Current State

`apps/web-demo/src` is the active browser runtime source of truth.
`legacy/root-app/src` is a read-only historical archive and must not re-enter active dependency graphs.

Audit snapshot:

| Metric                      | Count |
| --------------------------- | ----: |
| Shared relative file paths  |   582 |
| Byte-identical shared files |   568 |
| Divergent shared files      |    14 |
| Web-only files              |     0 |
| Legacy-only files           |     0 |

Active graph scan found no non-legacy runtime imports from `legacy/**`.

## Divergent Duplicate Files

These are the only shared paths where `legacy/root-app/src` differs from `apps/web-demo/src`:

```text
assets/styles/interaction.scss
components/ProForm/renderers/PrimeVueRenderer.spec.ts
components/ProTable/engine/core/TableController.spec.ts
components/UseEcharts/UseEcharts.spec.ts
components/UseEcharts/UseEcharts.vue
constants/size.ts
hooks/modules/useHttpRequest.ts
layouts/components/LoadingFallback.vue
layouts/modules/LayoutAdmin.spec.ts
plugins/modules/errorHandler.spec.ts
plugins/modules/primevue.spec.ts
plugins/setupPlugins.spec.ts
views/example/components/icons/configs/iconLists.generated.ts
views/login/index.vue
```

## Divergence Classification

| Path                                                            | Classification                       | Guidance                                                                         |
| --------------------------------------------------------------- | ------------------------------------ | -------------------------------------------------------------------------------- |
| `views/login/index.vue`                                         | active fix migrated                  | Keep web-demo; login interaction/animation fixes live in active runtime.         |
| `components/UseEcharts/UseEcharts.vue`                          | active hardening migrated            | Keep web-demo; retain lifecycle/runtime cleanup additions.                       |
| `layouts/modules/LayoutAdmin.spec.ts`                           | active regression coverage migrated  | Keep web-demo test coverage.                                                     |
| `assets/styles/interaction.scss`                                | active style contract migrated       | Keep web-demo unless visual regression proves legacy behavior is needed.         |
| `constants/size.ts`                                             | active runtime contract migrated     | Keep web-demo; do not restore legacy size constants without store/runtime tests. |
| `hooks/modules/useHttpRequest.ts`                               | active type/runtime cleanup migrated | Keep web-demo.                                                                   |
| `layouts/components/LoadingFallback.vue`                        | active UI cleanup migrated           | Keep web-demo unless a loading-state regression proves otherwise.                |
| `views/example/components/icons/configs/iconLists.generated.ts` | generated sample drift               | Regenerate from active generator; do not hand-merge from legacy.                 |
| `*.spec.ts` plugin/table/form/chart divergences                 | active tests migrated                | Keep web-demo; legacy test differences are archival only.                        |

## Active Edit Targets

Only these paths are active implementation targets:

- `apps/web-demo/**`
- `apps/desktop/**`
- `packages/contracts/**`
- `packages/core/**`

Root is orchestration/configuration only. `legacy/**` is audit-only.

## Cleanup Policy

1. Keep `apps/web-demo/src` canonical for browser runtime code.
2. Do not copy changes from `legacy/root-app/src` unless a specific regression proves the active file is wrong.
3. Do not import from `legacy/**`; use it only for archaeological comparison.
4. For the 568 byte-identical duplicates, prefer archive compaction over manual reconciliation.
5. For the 14 divergent files, classify before deletion:
   - active fix already migrated: keep web-demo, leave legacy archived;
   - useful old behavior: port minimal diff into web-demo with tests;
   - obsolete behavior: document as intentionally retired.

## Recommended Sequence

```bash
pnpm arch:runtime
pnpm arch:boundaries
pnpm api:report
pnpm governance:gate
```

After validation, choose one archive strategy:

| Strategy        | Use When                              | Action                                                                    |
| --------------- | ------------------------------------- | ------------------------------------------------------------------------- |
| Keep archive    | short-term audit value remains        | leave `legacy/root-app` excluded and read-only                            |
| Compact archive | duplicate noise is hurting navigation | replace identical files with a manifest or external tag reference         |
| Delete archive  | Git history is sufficient             | remove `legacy/root-app` after confirming no active imports and CI passes |

Default recommendation: keep the archive temporarily and track only the 14 divergent files as the explicit migration review set.
