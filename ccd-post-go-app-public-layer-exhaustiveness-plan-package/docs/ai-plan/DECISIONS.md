# DECISIONS

## Decision template

- Decision ID:
- Date:
- Status: PROPOSED / APPROVED / REJECTED / DEFERRED / SUPERSEDED
- Context:
- Options:
- Decision:
- Rationale:
- Trade-offs:
- Validation:
- Follow-up:

## D-A001 — App public capability migration policy

Status: APPROVED for this plan.

Decision: all reusable/common capabilities under `apps/**` must be migrated to governed packages when they are cross-app, runtime-neutral, platform-owned, UI-owned, adapter-owned, or build/generator-owned. App-specific runtime shells, route views, app stores, plugin wiring, compatibility facades, generated registries, and concrete browser/desktop integrations may remain in apps only with documented justification and guard coverage.

## D-A002 — Manifest and lockfile changes

Status: NOT APPROVED.

Decision: do not modify package manifests or lockfile unless a later explicit approval records the exact dependency and reason.
