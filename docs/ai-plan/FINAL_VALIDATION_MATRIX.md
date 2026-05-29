# Final Validation Matrix

| Check | Command / method | Last run | Exit code / result | Evidence log | Notes |
|---|---|---:|---:|---|---|
| Local status | `git status --short --untracked-files=all` | 2026-05-29 final refresh | 0 / PASS | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M14-final-20260529-101430-git-status-short-untracked.log` | Dirty state reported; no stage/commit/push performed. |
| AI runtime ignored status | `git status --ignored --short .ai/runtime/repair_list.md .ai/runtime/repair-ledger.json .ai/runtime/owner_decisions.md` | 2026-05-29 final refresh | 0 / PASS | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M14-final-20260529-101457-git-status-ai-runtime-ignored.log` | `repair_list.md` and `repair-ledger.json` are ignored; not force-added. |
| Recent commits | `git log -10 --oneline` | 2026-05-29 final refresh | 0 / PASS | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M14-final-20260529-101456-git-log-10-oneline.log` | History inspected; not modified. |
| Branch | `git branch --show-current` | 2026-05-29 final refresh | 0 / PASS | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M14-final-20260529-101455-git-branch-show-current.log` | Branch remains `main`. |
| Docs command validation | `pnpm docs:commands` | 2026-05-29 final refresh | 0 / PASS | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M14-final-20260529-101451-pnpm-docs-commands.log` | Final documentation command references valid. |
| Install | `pnpm install --frozen-lockfile` | 2026-05-29 10:12 CST | 0 / PASS | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M14-final-20260529-101210-pnpm-install-frozen-lockfile.log` | Lockfile unchanged. |
| Internal prepare | `pnpm ci:prepare-internal` | 2026-05-29 10:12 CST | 0 / PASS | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M14-final-20260529-101220-pnpm-ci-prepare-internal.log` | Internal package dist outputs rebuilt. |
| Package smoke | `pnpm ci:smoke:packages` | 2026-05-29 10:12 CST | 0 / PASS | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M14-final-20260529-101230-pnpm-ci-smoke-packages.log` | Internal package resolution passed. |
| AI doctor | `pnpm ai:doctor` | 2026-05-29 10:12 CST | 0 / PASS | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M14-final-20260529-101240-pnpm-ai-doctor.log` | Token contrast advisory only. |
| AI doctor open ledger | `pnpm ai:doctor --open` | 2026-05-29 final refresh | 0 / PASS, 82 open tasks | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M14-final-20260529-101440-pnpm-ai-doctor-open.log` | Open tasks are explicit BLOCKED/DEFERRED only. |
| Open actionable scan | `rg -n "^- \\[ \\]" .ai/runtime/repair_list.md \| rg -v "BLOCKED\|DEFERRED"` | 2026-05-29 final refresh | 0 / PASS | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M14-final-20260529-101442-open-actionable-unblocked-scan.log` | No unchecked task lacks BLOCKED/DEFERRED evidence marker. |
| Codex preflight | `pnpm codex:preflight` | 2026-05-29 10:12 CST | 0 / PASS | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M14-final-20260529-101250-pnpm-codex-preflight.log` | Preflight passed. |
| Type check | `pnpm type-check` | 2026-05-29 10:13 CST | 0 / PASS | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M14-final-20260529-101300-pnpm-type-check.log` | Workspace type check passed. |
| Lint | `pnpm lint:check` | 2026-05-29 10:13 CST | 0 / PASS with warnings | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M14-final-20260529-101310-pnpm-lint-check.log` | Existing 2 warnings in `packages/vue-hooks/src/createAutoMittHook.spec.ts`. |
| Unit tests | `pnpm test:run` | 2026-05-29 10:20 CST | 0 / PASS | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M14-final-20260529-101320-pnpm-test-run.log` | 67 files / 386 tests passed. |
| Web build | `pnpm build:web-demo` | 2026-05-29 10:20 CST | 0 / PASS | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M14-final-20260529-101330-pnpm-build-web-demo.log` | Build size 4.71 MB. |
| Desktop build | `pnpm build:desktop` | 2026-05-29 10:21 CST | 0 / PASS | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M14-final-20260529-101340-pnpm-build-desktop.log` | Desktop app build passed. |
| Desktop budget | `pnpm budget:desktop` | 2026-05-29 10:21 CST | 0 / PASS | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M14-final-20260529-101350-pnpm-budget-desktop.log` | 495207 bytes <= 2500000 bytes. |
| Governance | `pnpm validate:governance` | 2026-05-29 10:24 CST | 0 / PASS after reruns | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M14-final-20260529-101409-pnpm-validate-governance-generated-sync-rerun.log` | Initial GitHub workflow API attempt failed, direct `gh api` succeeded, generated-sync rerun passed. |
| Full CI build | `pnpm build:ci` | 2026-05-29 10:26 CST | 0 / PASS | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M14-final-20260529-101410-pnpm-build-ci.log` | 12 turbo build tasks successful. |
| Diff check | `git diff --check` | 2026-05-29 final refresh | 0 / PASS | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M14-final-20260529-101420-git-diff-check.log` | Whitespace check passed after final artifact edits. |
| UI screenshots | Manual / browser / Playwright | 2026-05-29 08:09 CST | PARTIAL_BLOCKED | `docs/ai-runs/20260529-070550-ccd-architecture-repair/reports/M8-production-screenshot-metrics.json` | Login/dashboard/chart captured; table-heavy route blocked by `.p-datatable` height `0`. |
| Security review | Manual checklist | 2026-05-29 | PASS_WITH_BLOCKERS | `docs/ai-plan/SECURITY_AND_APPROVALS.md` | No auth-flow or secret changes; HTTP contract work blocked pending approval. |
| Accessibility review | Manual/browser checklist | 2026-05-29 | PARTIAL | `docs/ai-runs/20260529-070550-ccd-architecture-repair/screenshots/` | No broad UI refactor; M8 screenshot set exists, table-heavy route blocked. |
| Performance/bundle | Bundle budget/build reports | 2026-05-29 10:26 CST | PASS | `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M14-final-20260529-101410-pnpm-build-ci.log` | Vite 8/dependency changes were not performed. |

## Skipped checks

| Check | Reason | Approved by |
|---|---|---|
| Vite 8 migration validation | Dependency/toolchain migration requires isolated branch/worktree approval. | Not approved |
| Dependency upgrade validation | Package/lockfile mutation requires explicit per-lane approval. | Not approved |
| Login Diorama implementation validation | Login/auth UX changes require operator approval and stable prerequisites. | Not approved |
| Remote GitHub branch-protection mutation | Remote governance changes require explicit operator approval. | Not approved |
