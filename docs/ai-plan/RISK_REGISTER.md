# CCD Architecture Repair Risk Register

| Risk ID | Description | Probability | Impact | Detection signal | Mitigation | Owner / responsible role | Status | Residual risk | Escalation trigger |
|---|---|---:|---:|---|---|---|---|---|---|
| R-001 | Local ahead 7 stack not fully validated after latest commit | Medium | High | post-7 checkpoint missing/fails | M0-T3 checkpoint passed after doc-command wording fix and generated sync rerun | Operator/Codex | MITIGATED | Low | Future baseline failure |
| R-002 | Direct edit to generated `AGENTS.md` causes `ai:doctor` failure | Medium | High | stale generated adapter | Do not edit root `AGENTS.md` by default | Codex | OPEN | Low | `AGENTS.md` diff appears |
| R-003 | Scope mixing across Bridge/ProTable/UI/HTTP/Vite/deps | High | High | diff touches unrelated lanes | One milestone at a time; strict allowlist | Codex | OPEN | Medium | unrelated files in diff |
| R-004 | Runtime APIs leak into contracts/core | Medium | High | imports of browser/fetch/router/storage in shared packages | `arch:runtime`, manual import audit | Codex | OPEN | Medium | runtime import detected |
| R-005 | Guard rule added before policy creates broad false positives | Medium | High | `ai:guard` fails widely | audit/policy/owner signoff first | Architect | OPEN | Medium | many violations |
| R-006 | HTTP contract migration changes auth/session behavior | Medium | High | request/auth tests fail; login breaks | inventory first; preserve bridges | Codex | OPEN | Medium | auth flow diff required |
| R-007 | ProTable typing changes alter runtime table behavior | Medium | Medium | UI smoke or tests fail | type-only changes preferred | Codex | OPEN | Low | runtime template changes |
| R-008 | UI boundary refactor breaks PrimeVue theme/services | Medium | High | visual/component failures | adapter policy and focused tests | Codex | OPEN | Medium | app plugin changes fail |
| R-009 | Vite 8 migration breaks build/plugin assumptions | High | High | build/e2e/bundle failures | inventory completed; migration blocked until isolated worktree and official-doc review are approved | Codex | BLOCKED | High | Vite lane approved |
| R-010 | Dependency modernization creates peer/toolchain conflicts | High | High | install/type/build failures | outdated inventory captured; upgrades blocked until one approved lane exists | Codex | BLOCKED | High | dependency lane approved |
| R-011 | CSS/token validation blocked by table-heavy layout debt unrelated to the M8 pxtorem patch | Medium | High | `P2-CSS-Validation` table screenshot blocked; `.p-datatable` height `0`; e2e snapshot and scroll-memory failures | M8 A/B classified pxtorem patch as non-causal; handle as separate ProTable/AppContainer layout lane | Reviewer | OPEN | High | Operator approves layout repair lane |
| R-012 | Login Diorama changes auth UX inadvertently | Medium | High | login interaction smoke fails | M11 blocked until explicit approval and prerequisite stability; preserve ProForm/submit flow when approved | Codex | BLOCKED | Medium | M11 approved |
| R-013 | Generated governance outputs edited manually | Medium | High | diff includes docs/generated or .ai/generated | stop and report | Codex | OPEN | Low | generated diff appears |
| R-014 | Missing evidence causes unverifiable DONE status | Medium | High | task marked DONE without logs | evidence policy enforced | Reviewer | OPEN | Medium | missing command logs |
| R-015 | Git operation violates constraints | Low | High | `git add .`, push, reset, clean, rebase | approval policy | Codex | OPEN | Low | forbidden command needed |
| R-016 | GitHub governance requires remote settings | Medium | Medium | branch protection not inspectable locally | document only unless approved | Operator | DEFERRED | Medium | remote config change requested |
| R-017 | Schedule expands due hidden test debt | Medium | Medium | validation failures unrelated to active lane | stop, classify, new lane | Codex | OPEN | Medium | repeated unrelated failures |
| R-018 | External source facts become stale | Medium | Medium | version docs mismatch local lockfile | cite official sources per lane | Codex | OPEN | Low | dependency/Vite lane starts |
| R-019 | Planning package copied into wrong repository location | Low | Medium | docs paths missing or duplicated | verify repo root and file tree | Codex | OPEN | Low | unexpected file structure |
| R-020 | Operator starts implementation before M0 evidence exists | Medium | High | no active run directory/logs | Codex prompt requires M0 first | Operator/Codex | OPEN | Medium | implementation files change first |
| R-021 | Final decision misread as clean GO despite explicit blockers | Medium | High | BLOCKED/DEFERRED tasks remain in `pnpm ai:doctor --open` | Final artifacts mark `NO_GO` and list blockers B-003 through B-011 | Operator/Codex | OPEN | High | Operator asks to merge/release without resolving blockers |
