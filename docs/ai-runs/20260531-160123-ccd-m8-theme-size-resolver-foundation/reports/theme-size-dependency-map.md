# M8 Theme/Size Dependency Map

## Package Direction

```text
@ccd/design-tokens
  -> pure theme engine
  -> pure size resolver

@ccd/vue-app-platform
  -> injected theme runtime target helper
  -> layout runtime

apps/web-demo
  -> app theme facade
  -> app size facade
  -> Pinia stores
  -> browser preload/storage/device collectors
```

## Implemented Movement

- Added `packages/design-tokens/src/sizeResolver.ts`.
- Exported pure size resolver helpers through `packages/design-tokens/src/index.ts`.
- Updated `apps/web-demo/src/utils/theme/sizeEngine.ts` so app compatibility imports remain stable while pure size calculations delegate to `@ccd/design-tokens`.
- Updated `packages/design-tokens/src/size.ts` import extensions so the newly exported ESM helper resolves from built package output.

## Not Moved

- `apps/web-demo/src/utils/theme/engine.ts` DOM/storage facade remained unchanged.
- `apps/web-demo/src/utils/theme/sizeEngine.ts` DOM writers and `preload()` remained app-owned.
- `apps/web-demo/src/stores/modules/system/size.ts`, `layout.ts`, and `device.ts` remained app-owned Pinia stores.
- `apps/web-demo/src/utils/deviceSync.ts` remained app-owned browser runtime collection.
- `packages/vue-app-platform/src/themeRuntime.ts` and `layoutRuntime.ts` were verified but not changed.

## Runtime Surface Evidence

`command-logs/032-runtime-surface-scan-m8-candidates.log` shows:

- No browser/runtime identifiers in `packages/design-tokens/src/sizeResolver.ts`.
- Existing DOM/storage/preload/browser collector usage remains in app-owned files.
- Existing Pinia store/runtime usage remains in `apps/web-demo/src/stores/modules/system/**`.

## Public API Impact

`@ccd/design-tokens` root exports now include:

- `SIZE_FONT_VAR_PREFIX`
- `generateSizeVars`
- `decideRootFontSize`
- `decideLayoutDimensions`
- `deriveRuntimeFontSizeVars`
- `resolveSizePreset`
- `getScopedContentSizeVars`
- `RootFontSizeContext`
- `RootFontSizeDecision`
- `SizeResolverDeviceType`

No package manifest or lockfile change was required.
