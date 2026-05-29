# CCD Architecture Repair Planning Specification

## Problem statement

CCD has completed several P0 stabilization items but still has unresolved P1 architecture boundary work, P2 modernization lanes, P3 UI/test refactors, and P4 deferred strategic decisions. These must be executed through a durable, evidence-driven, milestone-based planning system rather than ad hoc chat instructions.

## Goals

1. Preserve CCD architecture invariants.
2. Close remaining P1 architecture boundary issues.
3. Prepare safe, isolated P2 modernization lanes.
4. Execute P3 UI/test polish only after P1/P2 prerequisites are stable.
5. Keep P4 strategic work deferred until prerequisites and owner approval exist.
6. Require evidence, validation, rollback notes, and status updates for every milestone.
7. Make Codex Desktop execution narrow, reviewable, stoppable, and safe.

## Non-goals

- Rebuild CCD from scratch.
- Create a new GitHub organization or repository.
- Replace PrimeVue with another UI library.
- Replace alova with Axios.
- Introduce TanStack Query without proven server-state complexity.
- Start Vite 8 migration before P1 foundations are stable.
- Upgrade dependencies globally or blindly.
- Weaken `ai:doctor`, `codex:preflight`, `governance:gate`, or architecture guard rules.
- Manually edit generated governance outputs.
- Push changes automatically.

## Stakeholders

- Project owner / operator.
- CCD maintainers.
- Codex Desktop execution agent.
- Human reviewer.
- Future contributors relying on architecture governance.

## Functional requirements

- Maintain a live milestone plan.
- Maintain a live status ledger.
- Track decisions and unresolved owner approvals.
- Track validation evidence.
- Track rollback strategy.
- Track risks and mitigations.
- Require stop-and-ask gates for risky actions.
- Map every remaining repair ledger area into a milestone.
- Keep task status values limited to:
  - `TODO`
  - `IN_PROGRESS`
  - `DONE`
  - `BLOCKED`
  - `NOT_APPLICABLE`
  - `DEFERRED`

## Non-functional requirements

- Conservative scope control.
- Deterministic validation.
- Clear evidence trail.
- Minimal blast radius per milestone.
- No broad rewrites.
- Strong type safety.
- Runtime-neutral contracts/core.
- Reproducible local validation.
- Human-reviewable final state.

## Technical constraints

- `packages/contracts` may contain only interfaces, DTOs, and cross-runtime contracts.
- `packages/core` must remain runtime-neutral.
- App runtime APIs must stay in app adapter layers or explicitly allowed app/runtime surfaces.
- Root remains orchestration-only.
- Internal workspace packages must be consumed through build outputs.
- No global `@ccd/*` aliases in `tsconfig.base.json`.
- No generated governance output hand edits.
- No unrelated lane mixing.

## Compatibility constraints

- Preserve Vue 3, TypeScript, pnpm, Turbo, Vite 7 baseline until an approved Vite 8 isolated lane.
- Keep PrimeVue v4 ecosystem.
- Keep alova request toolkit.
- Keep Pinia, Vue Router, VueUse, Zod, Vitest, Playwright, and Tauri 2 unless a future approved lane says otherwise.

## Performance expectations

- Do not increase startup critical path without evidence.
- Vite and bundle changes require build/bundle evidence.
- UI changes require screenshot or browser evidence.
- HTTP changes must not introduce unnecessary request coupling.

## Security expectations

- No secrets in repository.
- No broad raw storage/network access.
- No weakened auth/session boundaries.
- HTTP changes must preserve token bridge and unauthorized handling.
- Dependency changes require approval and source verification.
- External network/cloud operations require approval.

## Accessibility expectations

For UI milestones:

- Preserve keyboard accessibility.
- Preserve visible focus states.
- Preserve semantic contrast.
- Validate responsive layouts.
- Capture browser evidence for login and component-heavy views where relevant.

## Data and privacy expectations

- Do not add telemetry or external data flows.
- Do not expose tokens or stored sensitive values.
- Do not alter storage encryption/obfuscation behavior without approval.
- No database migrations are in scope unless later discovered and approved.

## External integrations

- GitHub repository.
- GitHub Actions only as validation/governance target unless explicit approval.
- No cloud/deployment system modification by default.

## Dependencies

- No dependency additions/upgrades unless the active dependency or Vite lane is explicitly approved.
- P2 dependency modernization must be lane-specific.

## Acceptance criteria

The planning system is accepted when:

- All planning files exist under `docs/ai-plan/**`.
- An active run directory exists under `docs/ai-runs/**`.
- Every milestone has acceptance criteria, validation, evidence, rollback, and stop conditions.
- `STATUS.md` is initialized.
- `VALIDATION.md` contains baseline, per-milestone, and final validation.
- `SECURITY_AND_APPROVALS.md` captures forbidden and approval-required operations.
- `FINAL_GO_NO_GO.md` and `FINAL_VALIDATION_MATRIX.md` templates exist.

## Definition of done

Final project completion requires:

- P1 architecture boundary milestones are `DONE` or explicitly `DEFERRED` with owner approval.
- P2 modernization lanes are `DONE`, `DEFERRED`, or explicitly isolated for future execution.
- P3 work is `DONE` or `DEFERRED` after prerequisite review.
- P4 work remains `DEFERRED` unless owner approves scope.
- Final validation evidence exists.
- Final go/no-go artifact is complete.
- Working tree status is reported.
- No push occurred unless explicitly approved.
