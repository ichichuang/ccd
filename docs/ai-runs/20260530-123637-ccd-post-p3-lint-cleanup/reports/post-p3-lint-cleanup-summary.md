# CCD Post-P3 Lint Cleanup Summary

## Scope

- Target: `packages/vue-hooks/src/createAutoMittHook.spec.ts`
- Objective: remove the existing `vue/one-component-per-file` warnings without weakening lint rules, without reintroducing Vue hyperscript rendering, and with TSX render/return output for the test harness.
- Canonical rule targets: `.ai/rules/core/02-ui-preflight.mdc`, `.ai/rules/core/02-core-engineering.mdc`, `.ai/rules/core/07-vue-auto-imports.mdc`, `.ai/rules/components/02-pro-components.mdc`, `.ai/skills/core/vue/SKILL.md`, `.ai/skills/core/vueuse-functions/references/createTemplatePromise.md`.
- Explicitly untouched: dependencies, Vite/Vitest config, GitHub remote, Login Diorama, HTTP contracts, P4, app runtime behavior, generated adapters, and architecture boundaries.

## Bug

- The staged post-P3 cleanup correctly collapsed two inline spec-local component definitions into one harness, but it imported the Vue `h` helper and rendered through that helper.
- That fixed the `vue/one-component-per-file` symptom while violating CCD's auto-import and Vue/TSX rendering norms.
- The follow-up template-backed harness removes the `h` regression, but it still does not satisfy the strict TSX render/return requirement.

## Current State

- Replaced the Vue `h` helper usage with one template-backed typed harness component in the existing `.spec.ts` surface.
- Kept Vue imports type-only in the spec.
- Kept the hook calls inside Vue setup context so `onUnmounted()` behavior remains covered by the same assertions.
- Codified the no-hyperscript and auto-import rules in canonical AI rule/skill surfaces.
- Ran official `pnpm ai:sync:codex`; generated drift is limited to `.ai/manifests/skills-lock.json` plus local Codex skill materialization under `/Users/cc/.codex/skills/**`.
- TSX compliance is not complete. Current evidence shows `.spec.ts` cannot parse TSX, `.spec.tsx` is not included by the existing Vitest config, and `packages/vue-hooks` tsc has no JSX compiler option. The requested scope forbids changing Vite, Vitest, tsconfig, or dependencies.

## Validation

| Command | Result | Evidence |
| --- | --- | --- |
| `pnpm ai:sync:codex` | PASS, exit 0; skill lock synchronized | `command-logs/10-pnpm-ai-sync-codex.log` |
| `pnpm --filter @ccd/vue-hooks build` | PASS, exit 0 | `command-logs/11-pnpm-filter-vue-hooks-build.log` |
| `pnpm lint:check` | PASS, exit 0; previous warnings stay removed | `command-logs/12-pnpm-lint-check.log` |
| `pnpm test:run` | PASS, exit 0; 72 files / 411 tests | `command-logs/13-pnpm-test-run.log` |
| `pnpm type-check` | PASS, exit 0; 22/22 Turbo tasks successful | `command-logs/14-pnpm-type-check.log` |
| `pnpm docs:commands` | PASS, exit 0; 134 docs scanned | `command-logs/15-pnpm-docs-commands.log` |
| `pnpm ai:doctor` | PASS, exit 0 | `command-logs/16-pnpm-ai-doctor.log` |
| `pnpm codex:preflight` | PASS, exit 0 | `command-logs/17-pnpm-codex-preflight.log` |
| `pnpm validate:governance` | PASS, exit 0; governance gate passed | `command-logs/18-pnpm-validate-governance.log` |
| Forbidden Vue helper scan | PASS, no matches | `command-logs/19-rg-no-h-vue.log` |
| `git diff --check` | PASS, exit 0 | `command-logs/20-git-diff-check.log` |
| `git status --short --untracked-files=all` | PASS, exit 0; final dirty set captured | `command-logs/21-git-status-short-untracked.log` |

## Status And Risk

- Current lint risk from `packages/vue-hooks/src/createAutoMittHook.spec.ts` is resolved.
- CCD Vue/TSX auto-import and no-hyperscript norms are now encoded in canonical rule/skill files.
- Strict TSX test-harness compliance remains blocked by existing tooling scope. Completing it requires an approved scoped tooling change or a pre-existing `.tsx` test/build path.
- Non-failing pre-existing test warnings and token contrast advisories remain visible in validation logs.
- Broader approval-gated blockers documented in `docs/ai-plan/STATUS.md` remain unchanged.
