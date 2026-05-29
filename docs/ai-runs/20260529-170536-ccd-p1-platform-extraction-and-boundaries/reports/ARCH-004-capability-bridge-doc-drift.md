# ARCH-004 Capability Bridge Doc Drift

Status: DONE

Boundary:
- Verified `createCapabilityBridge` remains owned by `packages/shared-utils`.
- Verified package root export remains in `packages/shared-utils/src/index.ts`.
- Current architecture docs no longer list `createCapabilityBridge` as an app-local candidate.

Validation:
- PASS `pnpm api:report`
- PASS docs command validation through `pnpm governance:gate`

Evidence:
- `command-logs/ARCH-004-20260529-181816-pnpm-api-report.log`
- `command-logs/GOV-004-*-governance-gate-final-rerun.log`

Residual risk:
- None known.
