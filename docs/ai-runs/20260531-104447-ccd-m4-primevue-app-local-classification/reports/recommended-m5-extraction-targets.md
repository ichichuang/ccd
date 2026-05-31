# Recommended M5 Extraction Targets

M4 is classification only. M5 should own safeStorage/theme/size/device cleanup planning and must preserve runtime behavior.

| target | source_paths | target_owner | lane | validation | notes |
| --- | --- | --- | --- | --- | --- |
| safeStorage codec split | apps/web-demo/src/utils/safeStorage/core.ts, lzstring.ts, index.ts | @ccd/shared-utils + @ccd/contracts + app storage adapter | M5 | focused safeStorage tests, pnpm arch:runtime, web-demo type-check | Extract pure serialization/compression only after persisted-format compatibility proof. |
| theme facade cleanup | apps/web-demo/src/utils/theme/engine.ts and pure theme helper residues | @ccd/design-tokens + @ccd/vue-app-platform + app adapter | M5/M6 | token tests, pnpm e2e:visual, pnpm validate:tokens | Do not move DOM/localStorage into contracts/core; root scripts should stop deep-importing app theme helpers in M6. |
| size and layout runtime split | apps/web-demo/src/utils/theme/sizeEngine.ts, stores/modules/system/size.ts, utils/deviceSync.ts | @ccd/design-tokens + @ccd/vue-app-platform + app browser adapter | M5 | size/device specs, pnpm e2e:layout, pnpm e2e:visual | Separate pure calculations from DOM writes, first-paint preload, and browser probes. |
| device breakpoint runtime split | apps/web-demo/src/stores/modules/system/device.ts, apps/web-demo/src/utils/deviceSync.ts | @ccd/design-tokens + @ccd/vue-app-platform + app browser listener | M5 | device specs, layout e2e, pnpm arch:runtime | Browser collection stays app-side; pure resolver may become package-owned. |
| theme switch transition runtime | apps/web-demo/src/hooks/modules/useThemeSwitch.ts, utils/theme/transitions.ts, utils/theme/mode.ts | @ccd/vue-app-platform + app UX integration | M5 | theme switch specs if present, pnpm e2e:visual | View Transition API/timer/DOM behavior is high visual-risk; classify before source movement. |
| ProTable URL sync facade classification | apps/web-demo/src/hooks/modules/useProTableUrlSync.ts, plugins/modules/protable.ts | @ccd/vue-ui adapter key + apps/web-demo router adapter | M4/M7 | web-demo type-check, ProTable URL sync focused tests if changed | Router coupling should remain injected; not a packages/core or vue-ui runtime migration. |
