# P1 D-016 Decision Table

| option_id | target_owner | allowed_dependencies | forbidden_dependencies | runtime_class | API_surface_impact | package_manifest_impact | security_risk | compatibility_facade_required | validation_required | rollback_plan | recommendation | approval_status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| A | `apps/web-demo/src/utils/safeStorage/crypto.ts` | app logger, `crypto-es`, Web Crypto via app runtime, `@ccd/shared-utils` pure codec | `packages/core`, contracts implementation, browser globals in shared packages | app runtime | none for crypto | none | medium (honest client obfuscation) | keep `@/utils/safeStorage` facade | web-demo safeStorage tests, arch:runtime | revert facade edits only | **APPROVED** | **APPROVED 2026-06-01** |
| B | contracts types + app adapter | type-only contracts | Web Crypto in contracts | contracts + app | expands if contracts grow | none expected | low if type-only | app facade required | contracts build, api:report | revert contract + adapter | deferred | REJECTED for crypto movement |
| C | `@ccd/core` orchestration | `@ccd/contracts` only | browser/crypto-es | runtime-neutral | core API expands | none | high | app injection required | core build, multi-runtime tests | revert core API | not recommended | REJECTED |
| D | `@ccd/shared-utils` pure helpers only | pure functions | crypto, logger, env | runtime-neutral utility | shared-utils may expand | possible export only | low for non-crypto | optional facade | shared-utils tests | revert helper export | JSON codec only (M7 done) | PARTIAL (non-crypto only) |
| E | defer crypto; extract non-crypto first | shared-utils + app facade | crypto movement | mixed | small | none unless new export | lowest | yes | M7 validation | revert helper/facade | sequence note only | SUPERSEDED by Option A approval |

## Outcome

- `D-016`: APPROVED Option A
- `B-07`: DONE (app-owned terminal boundary; not a pending migration)
