# M5-T02 Sync Owner Decision

## Status

- Task status: `DONE`
- Decision status: `DEFERRED`
- Approval ID: `M5-PLAN-SCOPE-EXECUTION-APPROVED`
- Source implementation files changed: none

## Decision

Keep sync runtime app-owned in M5.

The current approved M5 scope permits an owner decision and optional extraction only if it is already approved and has no manifest/package-owner risk. Current evidence shows sync remains coupled to browser transport, VueUse timers, env access, app stores, safeStorage, and system preference runtime. No separate sync owner/package approval exists.

## Options Considered

| Option | Status | Reason |
| --- | --- | --- |
| Keep `apps/web-demo/src/sync/**` app-owned | Selected | Matches current coupling and existing boundary rules. |
| Move transport-agnostic pieces into `@ccd/vue-app-platform/sync` | Deferred | Would define a new package surface and likely require dependency/owner review. |
| Create future `@ccd/vue-sync` package | Deferred | Requires new package creation and manifest changes, both out of M5 scope. |
| Move sync contracts/helpers into `@ccd/contracts` | Rejected for M5 | `@ccd/contracts` is type-only; current candidate helpers are runtime behavior or would create an unapproved sync contract lane. |
| Move browser transport into a package | Rejected | Would pull `BroadcastChannel`, `WebSocket`, env access, and lifecycle state across approved boundaries. |

## Deferred Tasks

- M5-T03: `DEFERRED`; no approved low-risk sync extraction.
- M5-T04: `DEFERRED`; guard/documentation hardening should be reopened only with an approved sync owner or guard-hardening lane.

## Evidence

- Scope report: `m5-plan-scope.md`
- Coupling map: `sync-runtime-coupling-map.md`
- Current sync source inventory: `../command-logs/m5-026-sync-file-inventory.log`
- Current coupling search: `../command-logs/m5-027-sync-coupling-rg.log`
- Package owner evidence: `../command-logs/m5-030-read-package-owner-evidence.log`
- Boundary rule evidence: `../command-logs/m5-035-read-sync-boundary-rules.log`
- Protected manifest diff check: `../command-logs/m5-017-protected-manifest-diff-check.log`

## Escalation Trigger

Reopen only if another app needs sync reuse and the maintainer approves a sync owner lane with dependency, manifest, browser API, and package boundary implications reviewed before implementation.
