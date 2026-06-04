# VALIDATION — Validation Contract

## Core rule

No task or milestone may be marked `DONE` without evidence. A command is not passed unless its output and exit status are captured under the active `docs/ai-runs/**` directory.

## Before starting implementation

1. Inspect available scripts and environment:
   - `node --version`
   - `pnpm --version`
   - `pnpm -w list --depth 0` or repository-approved equivalent
   - inspect `package.json`, `pnpm-workspace.yaml`, app/package manifests, and existing governance docs
2. Capture working tree status without using destructive Git operations:
   - `git status --short`
   - `git diff --name-only`
3. Create active evidence directory:
   - `docs/ai-runs/YYYYMMDD-HHMMSS-ccd-public-layer-repair/`
4. Run baseline validation after command inventory.

Do not run `git reset`, `git clean`, `git rebase`, force push, branch deletion, or any destructive Git command.

## Expected repository validation commands

The exact command set must be confirmed from repository scripts before execution. Expected commands include:

| Command                                          | Purpose                        | Required when                                            |
| ------------------------------------------------ | ------------------------------ | -------------------------------------------------------- |
| `pnpm ci:smoke:packages`                         | Package resolution smoke       | Baseline and final                                       |
| `pnpm type-check`                                | TypeScript validation          | Every source milestone and final                         |
| `pnpm lint:check`                                | Lint validation                | Every source milestone and final                         |
| `pnpm test:run`                                  | Unit/integration tests         | Source milestones and final                              |
| `pnpm --filter @ccd/contracts type-check`        | Contract package type safety   | Contract milestones                                      |
| `pnpm --filter @ccd/contracts test`              | Contract package tests         | Contract milestones                                      |
| `pnpm --filter @ccd/vue-app-platform type-check` | Runtime package type safety    | Route/helper/theme-size milestones                       |
| `pnpm --filter @ccd/vue-app-platform test`       | Runtime package tests          | Route/helper/theme-size milestones                       |
| `pnpm --filter @ccd/web-demo type-check`         | Web app type safety            | App import/runtime changes                               |
| `pnpm build:web-demo`                            | Web app build                  | App/package changes affecting web-demo                   |
| `pnpm build:desktop`                             | Desktop build                  | Package/theme changes affecting desktop                  |
| `pnpm arch:boundaries`                           | Dependency boundary validation | Package boundary changes                                 |
| `pnpm arch:runtime`                              | Runtime leak validation        | Runtime/package changes                                  |
| `pnpm ai:guard -- --format=json`                 | AI architecture guard          | Guarded architecture changes                             |
| `pnpm drift-check`                               | Generated/drift checks         | Generated/governance-affecting changes                   |
| `pnpm validate:governance`                       | Governance validation          | Guard/package/public API changes                         |
| `pnpm validate`                                  | Full repository validation     | Final if environment supports it                         |
| `pnpm e2e:smoke`                                 | Browser smoke regression       | UI/route/theme/layout changes if environment supports it |

If a command is missing, renamed, or environment-blocked, record evidence and use the repository-approved replacement. Do not invent pass results.

## Per-milestone validation

### M0

- Repository script inventory.
- Working tree status.
- Baseline validation commands.
- Candidate inventory evidence.

### M1

- `@ccd/contracts` type-check/test.
- Full app type-check.
- Route type consumer validation.
- No runtime dependency added to `@ccd/contracts`.

### M2

- `@ccd/vue-app-platform` type-check/test if helpers move.
- Targeted route/access/redirect/menu tests.
- Web-demo type-check.
- Security edge cases for safe redirect.

### M3

- Contract type-check.
- App type-check.
- API/DTO consumer tests if present.
- Guard against duplicate ambiguous response contracts.

### M4

- Contract type-check.
- System preference sanitizer/runtime tests.
- App type-check.
- Persisted shape compatibility notes.

### M5

- If decision-only: evidence report and no unauthorized changes.
- If extraction approved: package type-check, app type-check, sync tests, guard validation.

### M6

- If decision-only: evidence report and no unauthorized changes.
- If build changes occur: `pnpm build:web-demo`, drift check, governance validation.

### M7

- Package/app type-check.
- Web-demo and desktop build if theme/size code changes.
- Visual/responsive smoke screenshots if UI output can change.

### M8

- AI guard.
- Governance validation.
- Boundary/runtime validation.
- Drift check.

### M9

- Full final validation matrix.
- All command logs captured.
- Diff summary captured.

### M10

- Documentation consistency review.
- Final artifacts complete.

## Final validation

Final validation should include, unless environment-blocked with evidence:

1. `pnpm ci:smoke:packages`
2. `pnpm type-check`
3. `pnpm lint:check`
4. `pnpm test:run`
5. `pnpm arch:boundaries`
6. `pnpm arch:runtime`
7. `pnpm ai:guard -- --format=json`
8. `pnpm drift-check`
9. `pnpm validate:governance`
10. `pnpm build:web-demo`
11. `pnpm build:desktop`
12. `pnpm validate` if practical and not redundant with captured commands
13. `pnpm e2e:smoke` if route/menu/theme/layout behavior changed and browser dependencies are available

## Browser and device validation

Required only when UI output or route/menu behavior changes:

- Chromium desktop smoke.
- Responsive widths covering mobile/tablet/desktop breakpoints.
- Route access/menu visibility smoke.
- Theme/size first-paint or visual smoke if theme/size code changes.
- Keyboard navigation check for changed menu surfaces.

If Playwright browsers are not installed and installing them would mutate the environment or require network access, stop for approval or mark blocked with evidence.

## Security validation

Required for route/access/redirect changes:

- Safe redirect rejects absolute URLs, protocol-relative URLs, malformed encoding, traversal, backslashes, and unsafe path patterns.
- Role/auth checks preserve current ANY/ALL semantics.
- Menu visibility semantics preserve expected OR behavior for menu auths where applicable.

## Performance validation

Required for theme/size/build/runtime changes:

- No unnecessary new dependencies.
- No bundle/build regression without explanation.
- Theme/size DOM writer does not add repeated style recalculation loops.
- Build output changes are explained.

## What to do when validation fails

1. Preserve the failed command log.
2. Record failure in `STATUS.md`.
3. Identify whether failure is baseline, caused by current milestone, or environment-blocked.
4. Apply the smallest safe fix only if within the current milestone scope.
5. Re-run the failed command and dependent validations.
6. Stop and ask for approval if fix requires dependency, manifest, config, generated manual edit, broad rewrite, or risky operation.

## Evidence requirements

Every validation entry must record:

- Command or method.
- Start/end timestamp if possible.
- Exit status.
- Log path.
- Summary.
- Whether the result is `PASS`, `FAIL`, `BLOCKED`, or `NOT_APPLICABLE`.
