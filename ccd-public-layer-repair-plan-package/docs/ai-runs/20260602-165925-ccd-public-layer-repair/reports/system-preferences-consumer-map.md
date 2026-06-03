# M4-T01 System Preferences Consumer Map

## Status

Task status: `DONE`

This is a read-only audit. No source implementation files were changed.

## Evidence

- `command-logs/m4-system-preferences-consumer-rg.log`
- `command-logs/m4-system-preferences-file-summary.log`
- `command-logs/m4-system-preferences-definitions.log`
- `command-logs/m4-system-preferences-coupling-rg.log`

## Current Definition

`apps/web-demo/src/types/systems/preferences.ts` currently owns both:

- runtime Zod schema: `systemPreferencesSchema`
- inferred and explicit types: `SystemPreferences`, `SystemPreferenceSyncType`, `SystemPreferencePayload`, `SystemPreferenceEnvelope`

## Consumer Groups

| Group | Files | Symbols | Ownership conclusion |
| --- | --- | --- | --- |
| API schema/runtime | `apps/web-demo/src/api/system/preferences.api.ts` | `SystemPreferences`, `systemPreferencesSchema`, Zod | App-owned runtime API/schema boundary. |
| Sync hook | `apps/web-demo/src/hooks/modules/useSystemPreferencesSync.ts` | `SystemPreferences`, `readSystemPreferencesFromStores`, `responseSchema` | App-owned hook tied to user store/auth and API runtime. |
| Sanitizers | `apps/web-demo/src/sync/systemPreferences/guards.ts` | `SystemPreferencePayload`, sanitizer functions | Runtime sanitizer remains app-owned; can import type-only contracts later. |
| Persistence | `apps/web-demo/src/sync/systemPreferences/localPersist.ts` | `SystemPreferences`, `normalizeSystemPreferences`, `sanitizeSystemPreferencePayload` | App-owned safeStorage persistence. |
| Model/store application | `apps/web-demo/src/sync/systemPreferences/model.ts`, `.spec.ts` | `SystemPreferences`, payload/envelope types, store apply functions | App-owned because it imports stores, locales, design tokens, and defaults. |
| Sync registration/runtime | `apps/web-demo/src/sync/systemPreferences/register.ts`, `runtime.ts` | payload/type unions, normalizers, stores, sync transport | App-owned runtime integration. |

## Coupling Findings

System preference runtime currently depends on:

- `zod`
- app stores under `@/stores/modules/system`
- app locales
- app layout constants
- `@ccd/design-tokens` presets/defaults
- app safeStorage
- app sync runtime/registry/socket
- timestamps via `Date.now()`

These dependencies are not suitable for `@ccd/contracts`.

## Type-Only Contract Candidates

Safe candidates for `@ccd/contracts` after source approval:

- `SystemPreferenceThemeState`
- `SystemPreferenceSizeState`
- `SystemPreferenceLayoutState`
- `SystemPreferences`
- `SystemPreferenceSyncType`
- `SystemPreferencePayload`
- `SystemPreferenceEnvelope`

Types should keep values broad where runtime validation is app-owned, for example `mode: string`, `theme: string`, `size: string`, and `layout: string`.

## Acceptance Criteria

- System preference consumers mapped: PASS.
- Type/schema/runtime boundaries distinguished: PASS.
- Zod/schema movement rejected without approval: PASS.
- M4 source implementation remains blocked by workspace approval gate: BLOCKED.
