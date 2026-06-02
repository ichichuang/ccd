# M3 Before / After

## Candidate

`M3-DESKTOP-THEME`

## Before

- `apps/desktop/src/theme/index.ts` locally implemented theme CSS variable
  generation with `hexToRgb`.
- The same file locally implemented size scale variable generation with
  `FONT_SCALE_RATIOS`, `SPACING_SCALE_RATIOS`, `RADIUS_SCALE_RATIOS`,
  `TRANSITION_SCALE_MS`, and `SIZE_SCALE_KEYS`.
- Desktop app-owned behavior also wrote vars to `document.documentElement`.

## After

- Theme variable generation uses `generateThemeVars` from
  `@ccd/design-tokens/theme-engine`.
- Size scale variable generation uses `generateSizeVars` from
  `@ccd/design-tokens`.
- Size preset resolution uses package `resolveSizePreset`, with the old
  `SIZE_PRESETS[0]` fallback preserved explicitly.
- App-owned desktop behavior remains in `apps/desktop/src/theme/index.ts`:
  DOM root writes, default size source, layout dimension vars, root font size,
  and `--dialog-settings-width`.

## Changed source

- `apps/desktop/src/theme/index.ts`

## Unchanged boundaries

- No package manifest or lockfile change.
- No `@tauri-apps` or `invoke()` movement.
- No generated registry edits.
- No web-demo source changes.
- No guard weakening.

## Behavior risk

Low to medium. The app now uses the governed package theme compiler, which has
an in-memory observability event stream. DOM writes and desktop-specific layout
vars remain unchanged in owner and shape.
