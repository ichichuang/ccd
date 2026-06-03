# M7 Size DOM Writer Decision

## Scope

Milestone: `M7`

Tasks:

- `M7-T02`
- `M7-T03`

## Decision

Do not extract a size DOM writer in this plan.

Status for optional implementation: `NOT_APPLICABLE`

## Rationale

The candidate writer is not just a generic CSS variable writer in the current app:

- It preserves non-size variables while replacing size/layout/font variables.
- It updates `root.dataset.fontScale`.
- It has a special preload path designed to avoid first-frame FOUC.
- It reads persisted app state before Pinia mounts.
- It depends on app storage keys, safeStorage decoding, app device/breakpoint helpers, and browser pixel ratio.
- Desktop has a separate writer path.

Extracting a package helper might still be possible later, but doing it safely requires an approved source-change lane plus visual/responsive smoke across web-demo and desktop. The current workspace also remains dirty before source implementation, so optional source movement should not proceed.

## Rejected alternatives

- Add `applySizeVars` to `@ccd/vue-app-platform` now.
- Rewrite preload/size application around a new package API.
- Merge desktop and web-demo writers in this milestone.

## Follow-up trigger

Reopen this decision only when all of the following are true:

- Operator approves source implementation in a clean or isolated workspace.
- The package owner explicitly accepts a size DOM writer surface in `@ccd/vue-app-platform`.
- Visual/responsive smoke is available for web-demo and desktop.
- The implementation preserves first-paint preload behavior.

## Evidence

- `reports/theme-size-boundary-review.md`
- `command-logs/m7-theme-size-file-inventory.log`
- `command-logs/m7-theme-size-definitions.log`
