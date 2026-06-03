# M4-T02 System Preferences Contract Decision

## Status

Task status: `DONE`

This is a design-only artifact. No source implementation files were changed.

## Decision

Move only stable type-only system preference contracts to `@ccd/contracts` after source approval. Keep `systemPreferencesSchema`, sanitizers, sync runtime, stores, local persistence, and app normalization behavior app-owned.

Recommended type-only contract shape:

```ts
export interface SystemPreferenceThemeState {
  readonly mode: string
  readonly theme: string
  readonly accentColor: string | null
}

export interface SystemPreferenceSizeState {
  readonly size: string
}

export interface SystemPreferenceLayoutState {
  readonly layout: string
  readonly collapsed: boolean
}

export interface SystemPreferences {
  readonly theme: SystemPreferenceThemeState
  readonly size: SystemPreferenceSizeState
  readonly layout: SystemPreferenceLayoutState
  readonly locale?: string
  readonly updatedAt: number
}

export type SystemPreferenceSyncType =
  | 'theme:update'
  | 'size:update'
  | 'layout:update'
  | 'locale:update'
  | 'preferences:update'

export type SystemPreferencePayload = Partial<SystemPreferences> & {
  readonly updatedAt: number
}

export interface SystemPreferenceEnvelope {
  readonly type: SystemPreferenceSyncType
  readonly payload: SystemPreferencePayload
}
```

## Rationale

The contract shape is useful across app/runtime boundaries, but runtime validation and normalization are app policy. Keeping values broad and schemas local preserves package neutrality while still making sync payload contracts explicit.

## Rejected Designs

| Design | Reason rejected |
| --- | --- |
| Move `systemPreferencesSchema` to `@ccd/contracts` | Would introduce Zod dependency pressure and schema ownership change. |
| Move sanitizer/model functions to `@ccd/contracts` | Runtime behavior and validation logic do not belong in type-only contracts. |
| Move model/store application functions to `@ccd/vue-app-platform` in M4 | They depend on app stores, app locales, defaults, and persisted state behavior. |
| Encode exact app enum unions for theme/size/layout values | Current validation depends on app design-token presets and layout constants; exact unions would drift. |

## Validation Requirements For M4 Source Work

- `pnpm --filter @ccd/contracts type-check`
- `pnpm --filter @ccd/web-demo type-check`
- `pnpm test:run` or targeted system preference sync tests
- Search evidence that `@ccd/contracts` does not import Zod, stores, locales, safeStorage, sync runtime, or design-token presets for this contract.

## Current Blocker

M4 source implementation is blocked until the operator approves continuing source changes in the dirty `main` working tree or provides an isolated worktree.
