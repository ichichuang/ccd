# G-02 Repair-Ledger Task Closure Table — Pass 2 (P22)

- Date: 2026-06-01
- Source: `pnpm ai:doctor --open` (78 open) + `.ai/runtime/repair_list.md`
- Lane: P22 G-02 repair-ledger closure pass 2
- Baseline: HEAD `f7a5f44e` (P21a, local), origin/main `9cbdd5cc`
- Result: every open task is externally gated (owner / operator / product) or strategic-deferred with NO completion evidence in M1–P21a. Zero safe closures this pass.

## Legend

- `closure_candidate`: yes only if M1–P21a evidence proves completion AND closure rules 1–8 allow it.
- `proposed_new_status`: kept identical to current open state because none qualify for closure.
- All rows roll up to issue `G-02` (repair-ledger deferred debt). Sub-gate noted in `related_issue`.

## Section 13 — P1 Guard coverage and owner decisions (8 open)

| task_id | task_title | current_status | related_issue | current_classification | evidence_path | closure_candidate | closure_reason | required_action | owner_acceptance_status | proposed_new_status |
|---|---|---|---|---|---|---|---|---|---|---|
| P1-Guard-SFCMacroOrder | Strict SFC macro-order guard | open | G-02 / owner Decision 2 | guard strictness gated | `.ai/runtime/owner_decisions.md` (Decision 2) | no | no guard added; needs owner Decision 2 | owner Decision 2 sign-off | accepted deferred debt (P15) | BLOCKED_BY_OWNER |
| P1-Guard-TypeAssertions | Business `as Type` ban guard | open | G-02 / owner Decision 2+3 | guard strictness + rule contradiction gated | `.ai/runtime/owner_decisions.md` (Decision 2,3) | no | rule matrix item 3 contradiction unresolved | owner Decision 2 + contradiction resolution | accepted deferred debt (P15) | BLOCKED_BY_OWNER |
| P1-Guard-AutoMitt | autoMitt guard | open | G-02 / owner Decision 2 | guard strictness gated | `.ai/runtime/owner_decisions.md` (Decision 2) | no | needs owner Decision 2 | owner Decision 2 sign-off | accepted deferred debt (P15) | BLOCKED_BY_OWNER |
| P1-Guard-ComposableReturnTypes | Composable return-type guard | open | G-02 / owner Decision 2 | guard strictness gated | `.ai/runtime/owner_decisions.md` (Decision 2) | no | needs owner Decision 2 | owner Decision 2 sign-off | accepted deferred debt (P15) | BLOCKED_BY_OWNER |
| P1-Guard-DynamicUnoCSS | Dynamic UnoCSS safelist guard | open | G-02 / owner Decision 2 | guard strictness + safelist gated | `.ai/runtime/owner_decisions.md` (Decision 2) | no | needs owner Decision 2 + approved safelist | owner Decision 2 + safelist scope | accepted deferred debt (P15) | BLOCKED_BY_OWNER |
| P1-Guard-RuleContradictions | Resolve rule contradictions | open | G-02 / owner Decision 3 | architectural consensus gated | `.ai/runtime/owner_decisions.md` (Decision 3) | no | unresolved rule contradictions need consensus | owner Decision 3 sign-off | accepted deferred debt (P15) | BLOCKED_BY_OWNER |
| P1-Guard-DesignTokenCanonical | Canonical design-token rule file | open | G-02 / owner Decision 4 | canonical rule gated | `.ai/runtime/owner_decisions.md` (Decision 4) | no | canonical token/color rule undecided | owner Decision 4 sign-off | accepted deferred debt (P15) | BLOCKED_BY_OWNER |
| P1-Guard-OwnerSignoff | Owner guard signoff | open | G-02 / owner signoff | owner signoff gated | `.ai/runtime/owner_decisions.md` (pending HTTP Decision 6) | no | no owner signoff provided | owner signoff | accepted deferred debt (P15) | BLOCKED_BY_OWNER |

## Section 14 — P2 Vite 8 compatibility lane (8 open)

| task_id | task_title | current_status | related_issue | current_classification | evidence_path | closure_candidate | closure_reason | required_action | owner_acceptance_status | proposed_new_status |
|---|---|---|---|---|---|---|---|---|---|---|
| P2-Vite8-Branch | Isolated Vite 8 branch/worktree | open | G-02 / operator approval | toolchain lane gated | `reports/M9-vite8-approval-gate.md` | no | rule 2: no implementation evidence; no branch created | operator approval for Vite 8 lane | accepted deferred debt (P15) | BLOCKED_BY_OPERATOR |
| P2-Vite8-OptimizeDeps | Migrate optimizeDeps.esbuildOptions | open | G-02 / operator approval | toolchain lane gated | `reports/M9-vite8-approval-gate.md` | no | rule 2: not migrated on main | approved Vite 8 branch | accepted deferred debt (P15) | BLOCKED_BY_OPERATOR |
| P2-Vite8-Oxc | esbuild → Oxc/Rolldown migration | open | G-02 / operator approval | toolchain lane gated | `reports/M9-vite8-approval-gate.md` | no | rule 2: not migrated | approved Vite 8 + dependency lane | accepted deferred debt (P15) | BLOCKED_BY_OPERATOR |
| P2-Vite8-Minify | build.minify esbuild revalidation | open | G-02 / operator approval | toolchain lane gated | `reports/M9-vite8-approval-gate.md` | no | rule 2: unchanged | approved Vite 8 branch | accepted deferred debt (P15) | BLOCKED_BY_OPERATOR |
| P2-Vite8-Chunks | manualChunks/minChunkSize migration | open | G-02 / operator approval | toolchain lane gated | `reports/M9-vite8-approval-gate.md` | no | rule 2: inventory only | approved Vite 8 branch | accepted deferred debt (P15) | BLOCKED_BY_OPERATOR |
| P2-Vite8-ECharts | echarts-treeshake-enhance revalidation | open | G-02 / operator approval | toolchain lane gated | `reports/M9-vite8-approval-gate.md` | no | rule 2: not revalidated under Vite 8 | approved Vite 8 branch | accepted deferred debt (P15) | BLOCKED_BY_OPERATOR |
| P2-Vite8-Compression | vite-plugin-compression decision | open | G-02 / operator approval | toolchain + deploy gated | `reports/M9-vite8-approval-gate.md` | no | rule 2: unchanged; deploy decision pending | approved Vite 8 + deploy decision | accepted deferred debt (P15) | BLOCKED_BY_OPERATOR |
| P2-Vite8-Validation | Vite 8 validation commands | open | G-02 / operator approval | toolchain lane gated | `reports/M9-vite8-approval-gate.md` | no | rule 2: lane not approved, not run | approved Vite 8 branch | accepted deferred debt (P15) | BLOCKED_BY_OPERATOR |

## Section 15 — P2 Dependency modernization lane (7 open)

| task_id | task_title | current_status | related_issue | current_classification | evidence_path | closure_candidate | closure_reason | required_action | owner_acceptance_status | proposed_new_status |
|---|---|---|---|---|---|---|---|---|---|---|
| P2-Deps-Vueuse | @vueuse/core upgrade lane | open | G-02 / operator approval | dependency lane gated | `reports/M10-dependency-approval-gate.md` | no | rule 2: no upgrade attempted | operator approval for isolated lane | accepted deferred debt (P15) | BLOCKED_BY_OPERATOR |
| P2-Deps-VueTooling | vue-tsc/TS/Vue compiler lane | open | G-02 / operator approval | dependency lane gated | `reports/M10-dependency-approval-gate.md` | no | rule 2: inventory only | operator approval for Vue tooling lane | accepted deferred debt (P15) | BLOCKED_BY_OPERATOR |
| P2-Deps-ESLint | ESLint ecosystem lane | open | G-02 / operator approval | dependency lane gated | `reports/M10-dependency-approval-gate.md` | no | rule 2: no upgrade attempted | operator approval for ESLint lane | accepted deferred debt (P15) | BLOCKED_BY_OPERATOR |
| P2-Deps-PrimeVue | PrimeVue v4 upgrade lane | open | G-02 / operator approval | dependency lane gated | `reports/M10-dependency-approval-gate.md` | no | rule 2: inventory only; v4 API review pending | operator approval + v4 API/adapter review | accepted deferred debt (P15) | BLOCKED_BY_OPERATOR |
| P2-Deps-Alova | alova upgrade lane | open | G-02 / operator approval | dependency lane gated | `reports/M10-dependency-approval-gate.md` | no | rule 2: no upgrade attempted | operator approval + request/adapter lane | accepted deferred debt (P15) | BLOCKED_BY_OPERATOR |
| P2-Deps-Playwright | Playwright upgrade lane | open | G-02 / operator approval | dependency lane gated | `reports/M10-dependency-approval-gate.md` | no | rule 2: no upgrade attempted | operator approval + CI/browser cache review | accepted deferred debt (P15) | BLOCKED_BY_OPERATOR |
| P2-Deps-Validation | Dependency lane validation | open | G-02 / operator approval | dependency lane gated | `reports/M10-dependency-approval-gate.md` | no | rule 2: no lane selected | approved single dependency lane | accepted deferred debt (P15) | BLOCKED_BY_OPERATOR |

## Section 18 — P2 GitHub repository governance (2 open)

| task_id | task_title | current_status | related_issue | current_classification | evidence_path | closure_candidate | closure_reason | required_action | owner_acceptance_status | proposed_new_status |
|---|---|---|---|---|---|---|---|---|---|---|
| P2-GitHub-Codeowners | CODEOWNERS package-level expansion | open | G-02 / operator approval | `.github/**` edit gated | M7 report (D-008) | no | needs operator approval for `.github/**` | operator approval for `.github/**` edits | accepted deferred debt (P15) | BLOCKED_BY_OPERATOR |
| P2-GitHub-Templates | PR/issue template refinement | open | G-02 / operator approval | `.github/**` edit gated | M7 report (D-008) | no | needs operator approval for `.github/**` | operator approval for `.github/**` edits | accepted deferred debt (P15) | BLOCKED_BY_OPERATOR |

## Section 19 — P3 Login Diorama refactor (47 open)

All 47 P3-Login tasks are BLOCKED pending M11 operator approval and prerequisite stability; closure rule 3 forbids closing Login/Product tasks without owner/product decision evidence. Evidence of non-implementation: `docs/ai-runs/20260530-114939-ccd-p3-feature-and-runtime-refactors/`. Each row: `closure_candidate=no`, `owner_acceptance_status=accepted deferred debt (P15)`, `proposed_new_status=BLOCKED_BY_OPERATOR`.

| task_id | task_title | current_status | related_issue | required_action |
|---|---|---|---|---|
| P3-Login-Rules | login rules preflight | open | G-02 / M11 operator approval | M11 operator approval + prerequisites |
| P3-Login-Context | login implementation context | open | G-02 / M11 operator approval | M11 operator approval + prerequisites |
| P3-Login-PrimeVue | login PrimeVue API verification | open | G-02 / M11 operator approval | M11 operator approval + prerequisites |
| P3-Login-Constraints | login implementation constraints | open | G-02 / M11 operator approval | M11 operator approval + prerequisites |
| P3-Login-Layout | diorama layout | open | G-02 / M11 operator approval | M11 operator approval + prerequisites |
| P3-Login-Composition | brand/layout composition | open | G-02 / M11 operator approval | M11 operator approval + prerequisites |
| P3-Login-Password | password shell | open | G-02 / M11 operator approval | M11 operator approval + prerequisites |
| P3-Login-Depth | dark-mode elevation | open | G-02 / M11 operator approval | M11 operator approval + prerequisites |
| P3-Login-VisualNoise | visual hierarchy | open | G-02 / M11 operator approval | M11 operator approval + prerequisites |
| P3-Login-Shell | panel shell | open | G-02 / M11 operator approval | M11 operator approval + prerequisites |
| P3-Login-Grid | panel grid | open | G-02 / M11 operator approval | M11 operator approval + prerequisites |
| P3-Login-FormZone | form zone | open | G-02 / M11 operator approval | M11 operator approval + prerequisites |
| P3-Login-StageZone | character stage zone | open | G-02 / M11 operator approval | M11 operator approval + prerequisites |
| P3-Login-Breakout | character breakout positioning | open | G-02 / M11 operator approval | M11 operator approval + prerequisites |
| P3-Login-TopControls | top controls | open | G-02 / M11 operator approval | M11 operator approval + prerequisites |
| P3-Login-BottomLinks | bottom links | open | G-02 / M11 operator approval | M11 operator approval + prerequisites |
| P3-Login-ProForm | ProForm integration | open | G-02 / M11 operator approval | M11 operator approval + prerequisites |
| P3-Login-Presets | demo account presets | open | G-02 / M11 operator approval | M11 operator approval + prerequisites |
| P3-Login-Username | username focus wiring | open | G-02 / M11 operator approval | M11 operator approval + prerequisites |
| P3-Login-PasswordState | password reaction state | open | G-02 / M11 operator approval | M11 operator approval + prerequisites |
| P3-Login-PasswordShell | password shell rebuild | open | G-02 / M11 operator approval | M11 operator approval + prerequisites |
| P3-Login-Submit | submit flow | open | G-02 / M11 operator approval | M11 operator approval + prerequisites |
| P3-Login-Feedback | login failure feedback | open | G-02 / M11 operator approval | M11 operator approval + prerequisites |
| P3-Login-Reuse | AnimatedCharacters reuse | open | G-02 / M11 operator approval | M11 operator approval + prerequisites |
| P3-Login-Scaling | character stage scaling | open | G-02 / M11 operator approval | M11 operator approval + prerequisites |
| P3-Login-Floor | stage floor/shadow | open | G-02 / M11 operator approval | M11 operator approval + prerequisites |
| P3-Login-Overflow | overflow behavior | open | G-02 / M11 operator approval | M11 operator approval + prerequisites |
| P3-Login-ReducedMotion | motion behavior | open | G-02 / M11 operator approval | M11 operator approval + prerequisites |
| P3-Login-Tokens | login token usage | open | G-02 / M11 operator approval | M11 operator approval + prerequisites |
| P3-Login-Sizing | login sizing | open | G-02 / M11 operator approval | M11 operator approval + prerequisites |
| P3-Login-Shortcuts | UnoCSS shortcuts | open | G-02 / M11 operator approval | M11 operator approval + prerequisites |
| P3-Login-Borders | border utilities | open | G-02 / M11 operator approval | M11 operator approval + prerequisites |
| P3-Login-ZIndex | z-index strategy | open | G-02 / M11 operator approval | M11 operator approval + prerequisites |
| P3-Login-RuleOf7 | login template utilities | open | G-02 / M11 operator approval | M11 operator approval + prerequisites |
| P3-Login-Deep | `:deep(.p-*)` selectors | open | G-02 / M11 operator approval | M11 operator approval + prerequisites |
| P3-Login-Desktop | desktop diorama layout | open | G-02 / M11 operator approval | M11 operator approval + prerequisites |
| P3-Login-Tablet | tablet layout | open | G-02 / M11 operator approval | M11 operator approval + prerequisites |
| P3-Login-Mobile | mobile layout | open | G-02 / M11 operator approval | M11 operator approval + prerequisites |
| P3-Login-MobileGrid | mobile grid behavior | open | G-02 / M11 operator approval | M11 operator approval + prerequisites |
| P3-Login-SafeArea | safe-area behavior | open | G-02 / M11 operator approval | M11 operator approval + prerequisites |
| P3-Login-Static | focused eslint | open | G-02 / M11 operator approval | M11 operator approval + prerequisites |
| P3-Login-Type | login-specific type validation | open | G-02 / M11 operator approval | M11 operator approval + prerequisites |
| P3-Login-Governance | imports/boundaries/adapters | open | G-02 / M11 operator approval | M11 operator approval + prerequisites |
| P3-Login-Browser | Login Diorama screenshots | open | G-02 / M11 operator approval | M11 operator approval + prerequisites |
| P3-Login-Responsive | responsive Diorama validation | open | G-02 / M11 operator approval | M11 operator approval + prerequisites |
| P3-Login-Interaction | interaction validation | open | G-02 / M11 operator approval | M11 operator approval + prerequisites |
| P3-Login-Regression | password-shell regression | open | G-02 / M11 operator approval | M11 operator approval + prerequisites |

## Section 21 — P4 Deferred strategic work (6 open)

| task_id | task_title | current_status | related_issue | current_classification | evidence_path | closure_candidate | closure_reason | required_action | owner_acceptance_status | proposed_new_status |
|---|---|---|---|---|---|---|---|---|---|---|
| P4-NewOrganization-Deferred | New org/repo split | open | G-02 / strategic deferred | strategic deferred (rule 5/7) | repair_list §21 | no | governance/architecture blockers unresolved | owner strategic decision | accepted deferred debt (P15) | ACCEPTED_DEFERRED_DEBT |
| P4-Starter-Deferred | ccd-vue-starter | open | G-02 / strategic deferred | strategic deferred | repair_list §21 | no | package boundary stability + owner approval incomplete | owner approval after boundary stability | accepted deferred debt (P15) | ACTIONABLE_FUTURE_LANE |
| P4-DesignSystem-Deferred | design-system repo split | open | G-02 / strategic deferred | strategic deferred | repair_list §21 | no | UI primitive + adapter boundary prerequisites incomplete | prerequisites + owner approval | accepted deferred debt (P15) | ACTIONABLE_FUTURE_LANE |
| P4-RekaUI-Deferred | Reka UI evaluation | open | G-02 / strategic deferred | strategic deferred | repair_list §21 | no | no approved headless primitive gap lane | approved primitive gap lane | accepted deferred debt (P15) | ACTIONABLE_FUTURE_LANE |
| P4-TanStackQuery-Deferred | TanStack Query evaluation | open | G-02 / strategic deferred | strategic deferred | repair_list §21 | no | alova complexity not exceeded | server-state complexity trigger | accepted deferred debt (P15) | ACTIONABLE_FUTURE_LANE |
| P4-DesktopDriftCI | Desktop drift CI enforcement | open | G-02 / owner sign-off | owner sign-off gated | repair_list §21 | no | owner sign-off on enforcement scope pending | owner sign-off | accepted deferred debt (P15) | BLOCKED_BY_OWNER |

## Roll-up

| group | open tasks | closure candidates | proposed new status |
|---|---|---|---|
| P1-Guard | 8 | 0 | BLOCKED_BY_OWNER |
| P2-Vite8 | 8 | 0 | BLOCKED_BY_OPERATOR |
| P2-Deps | 7 | 0 | BLOCKED_BY_OPERATOR |
| P2-GitHub | 2 | 0 | BLOCKED_BY_OPERATOR |
| P3-Login | 47 | 0 | BLOCKED_BY_OPERATOR |
| P4-Deferred | 6 | 0 | 5 ACTIONABLE_FUTURE_LANE/ACCEPTED_DEFERRED_DEBT + 1 BLOCKED_BY_OWNER |
| **Total** | **78** | **0** | — |

## Conclusion

Zero tasks satisfy closure rules 1–8 with M1–P21a evidence:
- Rule 1: none are already satisfied by existing evidence (every open row explicitly records "not changed / not implemented / not attempted").
- Rule 2: all Vite8/dependency tasks lack implementation evidence.
- Rule 3: all Login tasks lack owner/product decision evidence (M11 still pending).
- Rules 5–7: P4 strategic + P1-Guard owner-decision tasks remain accepted deferred debt.

P18 already closed the only two evidence-backed stale rows (P1-HttpContract-Contracts, P2-Vite8-Progress). No further stale or duplicate rows remain. → **P22_NO_SAFE_LEDGER_CLOSURE**.
