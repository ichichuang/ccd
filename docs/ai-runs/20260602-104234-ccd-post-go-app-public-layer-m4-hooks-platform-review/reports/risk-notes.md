# M4 Risk Notes

## Post-merge note

This document records the pre-merge execution and closeout state of the public-layer repair and post-GO apps public-layer certification lane. PR #38 has since been merged into `main`. Historical statements such as "ready for human review", "branch remains unmerged", or "do not merge" refer to the execution-time branch state rather than the current `main` branch state. Any residual risks noted here remain future improvement lanes, not blockers to the completed merge.

## Residual risks

- App hook surfaces may continue to look reusable by name, but M4 evidence
  shows their concrete dependencies are app-owned.
- `useProTableUrlSync` still contains small pure query parsing helpers, but
  extracting them alone would create a thin abstraction without a second
  package use case.
- `useDateUtils` remains app-owned because DateUtils itself remains app-owned
  and depends on app initialization and locale/timezone synchronization.

## Controls

- Facade tests validate app directive exports still point to package directives.
- Package tests validate `@ccd/vue-hooks` and `@ccd/vue-app-platform` owner
  surfaces.
- M7 should record these classifications in the final app-owned register.
- An unexpected formatting-only `auto-imports.d.ts` diff was recorded and
  restored because M4 does not own generated registry changes.

## No-go items preserved

- No app router/store/i18n ownership moved.
- No new package API created.
- No manifest or lockfile change.
- No guard weakening.
