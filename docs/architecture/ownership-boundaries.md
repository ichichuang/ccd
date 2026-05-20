# Ownership and Boundary Authority

CCD uses workspace ownership rather than archive ownership.

## Active owners

| Area | Owner boundary |
| --- | --- |
| Contracts and public ABI | `packages/contracts` |
| Runtime-neutral platform logic | `packages/core` |
| Browser runtime | `apps/web-demo` |
| Desktop/Tauri runtime | `apps/desktop` |
| Shared design/runtime helpers | `packages/*` public exports |
| Governance | `.ai/**`, `scripts/governance/**`, `scripts/architecture/**` |

## Removed archive policy

The former browser runtime archive is not an active owner boundary and is not present in the working tree. Historical explanations may reference the migration, but active implementation, CI, scripts, and package graphs must use current workspace owners only.
