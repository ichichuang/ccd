# CCD Validation Contract

## Before implementation

Required baseline:

1. `git status --short --untracked-files=all`
2. `git log -10 --oneline`
3. `git branch --show-current`
4. `git diff --check`

Required post-7 checkpoint before risky implementation:

1. `pnpm install --frozen-lockfile`
2. `pnpm ci:prepare-internal`
3. `pnpm ci:smoke:packages`
4. `pnpm ai:doctor`
5. `pnpm codex:preflight`
6. `pnpm type-check`
7. `pnpm lint:check`
8. `pnpm test:run`
9. `pnpm build:web-demo`
10. `pnpm build:desktop`
11. `pnpm budget:desktop`
12. `pnpm validate:governance`
13. `pnpm build:ci`
14. `git diff --check`
15. `git status --short --untracked-files=all`

If baseline or post-7 checkpoint fails, stop and record `BLOCKED`.

## Per-milestone validation

### M0

- `git status --short --untracked-files=all`
- `git log -10 --oneline`
- `git branch --show-current`
- `git diff --check`
- file presence inspection

### M1

- `pnpm --filter @ccd/web-demo type-check`
- focused ProForm tests after inspecting exact test names
- `pnpm ci:prepare-internal`
- `pnpm build:shared-config`
- `pnpm build:ci` if Turbo/package metadata changes

### M2

- focused shared-utils tests
- `pnpm type-check`
- `pnpm test:run` if helper behavior changes

### M3

- `pnpm --filter @ccd/web-demo type-check`
- focused ProTable tests/smoke after inspection
- `pnpm api:report` if API surface changes

### M4

- `pnpm api:report`
- `pnpm arch:boundaries`
- `pnpm type-check`
- focused UI smoke tests
- screenshots if UI behavior changes
- `pnpm ai:guard` if guard changes

### M5

- `pnpm arch:runtime`
- `pnpm api:report`
- targeted request-layer tests
- `pnpm type-check`
- `pnpm test:run` if HTTP runtime behavior changes

### M6

- `pnpm ai:guard`
- `pnpm ai:doctor`
- `pnpm codex:preflight`
- `pnpm lint:check`
- `pnpm governance:gate` if governance/rules touched

### M7

- `pnpm governance:gate`
- `pnpm docs:commands` if command docs touched
- `pnpm project:doctor` if project metadata touched
- `pnpm governance:github-workflows` if workflows touched

### M8

- `pnpm build:web-demo`
- targeted screenshots for `/login`, dashboard, table-heavy views, chart-heavy views
- `pnpm type-check`
- `pnpm lint:check`

### M9

Only after explicit approval:

- `pnpm build:ci`
- `pnpm vercel:build`
- `pnpm e2e:qa`
- bundle budget checks
- source citations for Vite migration facts

### M10

Only after explicit approval:

- `pnpm deps:outdated`
- lane-specific targeted checks
- final `pnpm validate` or full baseline after approval

### M11

Only after explicit approval:

- targeted eslint for login files
- `pnpm --filter @ccd/web-demo type-check`
- governance checks if imports/boundaries touched
- browser screenshots: light/dark desktop, tablet, mobile
- interaction smoke

### M12

- focused tests
- `pnpm lint:check`
- `pnpm type-check`
- `pnpm build:web-demo`
- `pnpm check` only after confirming exact repo command

### M13

- human review
- `git diff --check` if docs changed

### M14

- full post-7/final validation baseline

## Final validation

Run:

```bash
pnpm install --frozen-lockfile
pnpm ci:prepare-internal
pnpm ci:smoke:packages
pnpm ai:doctor
pnpm codex:preflight
pnpm type-check
pnpm lint:check
pnpm test:run
pnpm build:web-demo
pnpm build:desktop
pnpm budget:desktop
pnpm validate:governance
pnpm build:ci
git diff --check
git status --short --untracked-files=all
```

## Evidence proving validation passed

Each validation must record:

- command run;
- timestamp;
- exit code;
- summarized output;
- full output log path;
- changed-file summary;
- generated drift handling;
- skipped or not-applicable checks with reason.

## Failed validation handling

When validation fails:

1. Stop implementation.
2. Save full command log.
3. Update `STATUS.md`.
4. Mark affected task `BLOCKED`.
5. Identify whether failure is caused by current milestone.
6. Do not broaden scope.
7. Ask operator before proceeding if the fix requires a new lane.

## Browser/device matrix for UI work

Minimum:

- Desktop: 1440px or project default desktop width.
- Tablet: 768–1023px.
- Mobile: <768px.
- Light and dark modes for login.
- Safe-area spacing where relevant.
- Keyboard focus check for form controls.
- Screenshot evidence for before/after when practical.

## Security checks

Required when HTTP/auth/storage/runtime changes:

- no secrets in diff;
- no raw storage/network outside approved adapters;
- no weakened auth bridge;
- no production config changes;
- no new dependency without approval;
- no generated governance output hand edits.
