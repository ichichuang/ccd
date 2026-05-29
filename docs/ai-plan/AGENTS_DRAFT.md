# CCD AI Execution Addendum Draft

> Do not apply this file directly to root `AGENTS.md` unless the operator explicitly approves updating `.ai/protocol/AI.entry.md` and regenerating generated adapters with `pnpm ai:sync`.

## Working agreements

CCD is a self-protecting deterministic multi-runtime platform. Preserve this invariant:

`packages/contracts -> packages/core -> apps/*`

Before implementation, read:

- `AGENTS.md`
- `.ai/runtime/repair_list.md`
- `.ai/runtime/owner_decisions.md`
- `docs/ai-plan/SPEC.md`
- `docs/ai-plan/PLAN.md`
- `docs/ai-plan/STATUS.md`
- `docs/ai-plan/VALIDATION.md`
- `docs/ai-plan/DECISIONS.md`
- `docs/ai-plan/RISK_REGISTER.md`
- `docs/ai-plan/EVIDENCE_POLICY.md`
- `docs/ai-plan/SECURITY_AND_APPROVALS.md`
- `docs/ai-plan/ROLLBACK.md`

## Architecture rules

- `packages/contracts` contains interfaces, DTOs, and cross-runtime contracts only.
- `packages/core` remains runtime-neutral and must not become a frontend utility bucket.
- Runtime APIs belong only in app adapter layers or explicitly allowed app/frontend runtime surfaces.
- Root package remains orchestration-only.
- Internal workspace packages must be consumed through build outputs, not raw source imports.
- Do not add global `@ccd/*` paths to `tsconfig.base.json`.
- Do not weaken governance gates.
- Do not manually edit generated governance outputs.
- Do not replace PrimeVue or alova as a shortcut.
- Do not mix unrelated repair lanes.

## Code style expectations

- Preserve existing behavior unless the active milestone explicitly authorizes behavior change.
- Prefer typed contracts, clear boundaries, composable modules, and maintainable architecture.
- Do not introduce `any` or assertion-driven business logic without a specific boundary justification.
- Avoid broad rewrites.
- Keep app runtime APIs out of shared runtime-neutral packages.
- Keep package exports aligned with build outputs.

## Testing and validation

After each milestone:

- Run the validation commands in `docs/ai-plan/VALIDATION.md`.
- Capture command output under the active `docs/ai-runs/**/command-logs/`.
- Update `docs/ai-plan/STATUS.md`.
- Mark tasks `DONE` only when implementation and validation evidence both exist.

## Documentation and evidence

- Update `docs/ai-plan/STATUS.md` after every milestone and every blocker.
- Record architecture decisions in `DECISIONS.md`.
- Record risks in `RISK_REGISTER.md`.
- Preserve evidence under the active `docs/ai-runs/**` directory.

## Security and approval rules

Stop and ask for approval before:

- destructive shell commands;
- `git reset`, `git clean`, `git rebase`, force push, history rewrite, or branch deletion;
- committing or pushing;
- dependency additions, replacements, or upgrades;
- production configuration changes;
- secrets, credentials, auth flows, payment flows, or deployment settings;
- database migrations or data operations;
- external systems, private APIs, cloud resources, or user accounts;
- broad architectural rewrites not explicitly required by the active milestone.

## Git restrictions

- Do not use `git add .`.
- Do not use `git commit --no-verify`.
- Do not push unless the operator explicitly confirms the target branch and says push is allowed.
- Do not force-add `.ai/runtime/repair_list.md`.
- Stage only files explicitly allowed by the active task.

## Done criteria

A milestone is done only when:

- scope stayed within the milestone;
- acceptance criteria are met;
- validation commands passed or failures are documented as approved exceptions;
- evidence is recorded;
- `STATUS.md` is updated;
- rollback path is known.

## Stop conditions

Stop immediately if:

- validation fails and the cause is not contained;
- generated governance outputs change unexpectedly;
- scope broadens beyond the active milestone;
- runtime APIs leak into `packages/contracts` or `packages/core`;
- dependency changes become necessary without approval;
- evidence is missing or contradictory.
