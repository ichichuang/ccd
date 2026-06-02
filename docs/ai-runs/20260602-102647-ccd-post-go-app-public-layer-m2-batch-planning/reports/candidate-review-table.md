# M2 Candidate Review Table

| Candidate | Target package | M2 decision | Source changes for next lane | Tests / validation | Governance impact | Rollback | Behavior risk |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `M3-DESKTOP-THEME` | `@ccd/design-tokens` | `APPROVED_FOR_M3_REVIEW` | Replace duplicated desktop pure CSS var derivation with existing package APIs; keep DOM write in app. | `@ccd/design-tokens` tests, desktop type-check/build, runtime/governance checks. | None planned. | Revert M3 commit. | Low/medium CSS var parity risk. |
| `M3-ROUTE-ACCESS` | `@ccd/vue-app-platform` only if explicit route/menu types exist | `DEFERRED_REVIEW` | No M2 source change; M3 may inspect exact pure subset. | Focused router utility tests if proposed. | None in M2. | Revert future lane commit. | Medium; route/menu shape coupling. |
| `M3-SYSTEM-PREF-GUARDS` | none yet | `DEFERRED_OWNER_DECISION` | No movement until preference payload contract is package-owned. | Existing sync preference tests only if touched later. | Would need contract owner decision. | Revert future decision lane. | Medium; store/API payload drift. |
| `M3-DTO-CONTRACTS` | `@ccd/contracts` for type-only; schema owner unapproved | `DEFERRED_MANIFEST_BOUNDARY` | No movement; Zod schemas stay app-owned. | API/schema tests only if a type-only split is approved. | Schema movement would require manifest decision. | Revert future decision lane. | Medium/high; dependency boundary. |
| `M3-PURE-UTILITY-REVIEW` | `@ccd/vue-app-platform` for isolated pure reducers only | `DEFERRED_REVIEW` | No M2 source change; most router utils remain app-owned. | Focused router/menu tests if touched. | None in M2. | Revert future lane commit. | Medium; Vue Router/import.meta/logger coupling. |
| `M6-BUILD-GENERATOR` | no approved package owner | `CLASSIFY_APP_OWNED_OR_GENERATED` | No package move; preserve build/generator boundaries. | M6 guard/governance/build validation. | No manifest/lockfile change. | Revert future M6 commit. | Low if classification-only. |
| `BLOCK-SAFESTORAGE-CRYPTO` | app-owned | `APP_OWNED_TERMINAL` | No source move. | Existing safeStorage tests if future code touches it. | Existing D-016 preserved. | Not applicable. | High if moved; no movement approved. |
| `BLOCK-SAFESTORAGE-COMPRESSION` | app-owned | `APP_OWNED_TERMINAL` | No source move. | Existing safeStorage tests if future code touches it. | Existing D-019 preserved. | Not applicable. | High if moved; manifest change forbidden. |
| `BLOCK-DATEUTILS` | app-owned | `NOT_SAFE_TO_MOVE` | No source move. | Existing DateUtils/plugin tests if future code touches it. | No package owner/dependency change. | Not applicable. | High due dayjs plugins, locale, timezone, and framework events. |
| `BLOCK-HTTP-RUNTIME` | app runtime adapter | `APP_OWNED_RUNTIME_ADAPTER` | No source move. | HTTP/runtime tests if future code touches it. | Runtime adapter boundary preserved. | Not applicable. | High if moved into runtime-neutral package. |
| `FACADE-THEME-TOKENS` | already package-backed | `APP_COMPATIBILITY_FACADE` | No source move. | Existing facade/package parity tests. | None. | Not applicable. | Low. |
| `FACADE-VUE-HOOKS` | already package-backed | `APP_COMPATIBILITY_FACADE` | No source move. | Existing hook tests if touched. | None. | Not applicable. | Low. |
| `FACADE-VUE-UI` | already package-backed | `APP_COMPATIBILITY_FACADE` | No source move. | Existing UI tests/build if touched. | None. | Not applicable. | Low. |
| `FACADE-CHARTS` | already package-backed | `APP_COMPATIBILITY_FACADE` | No source move. | Existing chart/app tests if touched. | None. | Not applicable. | Low. |
| `GENERATED-PRIMEVUE-REGISTRY` | generator/build owner | `GENERATED_OWNED` | No manual edit. | Owning generator/build validation only. | Generated boundary preserved. | Re-run generator after revert if needed. | Medium if manually edited. |

## Stop Conditions Carried Forward

- Stop before any `package.json`, `pnpm-lock.yaml`, generated registry manual
  edit, destructive git operation, push, or validation failure.
- Stop before moving safeStorage crypto/HMAC/WebCrypto or lz-string ownership.
- Stop before creating a new governed package without explicit approval.
