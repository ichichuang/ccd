# Desktop Runtime

The `desktop-version` branch is CCD's Tauri v2 desktop product line.

## Runtime Contract

- Native shell runtime
- Tauri v2 IPC boundary
- desktop capability abstraction
- desktop release metadata and configuration
- bridge helpers for window, external-link, file, notification, and OS-level behavior

## Boundaries

- Do not continue development on `feat/tauri-integration`.
- Do not move desktop-only runtime assumptions back into `main`.
- Do not call Tauri APIs directly from business modules when a bridge helper exists.
- Keep `isTauri()` branching and Web fallback behavior together for shared features.

## Validation

```bash
pnpm arch:check
pnpm sync:desktop-config
pnpm check:drift
pnpm type-check
```

Run targeted Playwright or desktop smoke checks when routes, layout, shell behavior, or visual baselines change.
