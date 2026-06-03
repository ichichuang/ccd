# M6-T02 Build Owner Decision

## Status

- Task status: `DONE`
- Decision status: `DEFERRED`
- Source changes: none
- Runtime behavior changes: none

## Decision

Keep `apps/web-demo` build and Vite configuration app-owned in this plan.

Deferred future options:

- `@ccd/build-config`
- `@ccd/vite-config`
- smaller app-local cleanup inside `apps/web-demo/build/**`

Any package extraction or build cleanup that changes package ownership requires explicit approval before package owner, manifest, dependency, lockfile, production config, or Vite major-migration work.

## M6 Task Outcomes

| Task | Status | Outcome |
| --- | --- | --- |
| M6-T01 | `DONE` | Coupling map refreshed against the current M5-complete state. |
| M6-T02 | `DONE` | D-PL-006 remains `DEFERRED`; build config stays app-owned. |
| M6-T03 | `DEFERRED` | No approved low-risk build cleanup exists under current scope. |
| M6-T04 | `DONE` | Existing drift/guard tooling already checks PrimeVue resolver and generated registry classification. No guard script edit was needed. |

## Evidence

- `build-config-coupling-map.md`
- `../command-logs/m6-009-generated-build-guard-rg.log`
- `../command-logs/m6-required-02-drift-check.log`
- `../command-logs/m6-required-03-ai-guard-json.log`
- `../command-logs/m6-required-05-validate-governance.log`
- `../command-logs/m6-required-06-validate-governance-rerun.log`

## Escalation Trigger

Reopen only for a governed build package lane, Vite major migration lane, or explicit guard-hardening lane. Do not create packages, edit manifests, change lockfiles, manually edit generated files, or alter production config without separate approval.
