---
title_en: UI Governance Migration Plan
title_zh: UI 治理迁移计划
aliases:
  - UI Governance Migration Plan
  - CCD UI Migration Plan
tags:
  - design
  - ui
  - governance
  - migration
tags_zh:
  - 设计
  - UI
  - 治理
  - 迁移
status: published
confidence: 0.95
source_langs:
  - en
  - zh
source_paths:
  - .ai/governance/ui/migration-manifest.json
  - .ai/rules/**
  - .ai/skills/design/**
  - .ai/protocol/**
last_reviewed: '2026-07-11'
wiki_owner: LLM-maintained CCD architecture wiki
---

# UI Governance Migration Plan

P1.5 canonical deliverable derived from the accepted P1.4R2 evidence package. project-ui does not currently exist. P2 has not started. This document records decisions and prerequisites only; it does not authorize implementation, deletion, merge execution, rewrite execution, routing changes, adapter changes, scaffold changes, page-contract implementation, runtime UI changes, or project-ui Skill creation.

## Executive decision

- Verified facts: repository clean at `9fad207b1700615000517a0c5fee1af9661d00f8`; 135 unique assets inventoried.
- Decision: Consolidate scattered UI governance into conceptual project-ui governance surfaces in P2, without rebuilding reusable platform foundations.
- Evidence: accepted P1.4R2 authoritative package and corrected scope register.

## P0 baseline and P1 scope

- P1 baseline: `9fad207b1700615000517a0c5fee1af9661d00f8`.
- P0 accepted parent baseline: `fdb8030a747991b06e2ef8357051601bcb8aa34e`.
- P1 scope: inventory, conflict analysis, disposition matrix design, and canonical artifact creation only.
- P1 non-authorization: no deletion, merge execution, rewrite, retirement, replacement, routing changes, adapter changes, page-contract implementation, scaffold changes, runtime UI changes, or project-ui Skill creation.

## Current UI governance topology

- Governance sources: `.ai/skills/design/**`, `.ai/rules/**`, `.ai/protocol/**`, `.ai/manifests/**`, `wiki/canonical/design/**`.
- Generators: `ai-sync`, `ai-sync-codex`, `generate-ai-protocol-adapters`, `generate-rule-index`, `generate-unocss-ide-data`.
- Validators: `ai-doctor`, `codex-preflight`, `drift-check`.

## Governance scope boundary

- Direct UI governance assets: manifest-scope rules, skills, scaffolds, validators, and UI-specific canonical/generated Wiki pages.
- Cross-cutting governance assets: protocol entrypoints, adapter manifests, skill routing, and security owner decisions.
- Global architecture reports, API snapshots, SBOM, dependency/runtime/workspace graphs, general governance reports, and Wiki health reports remain evidence-only and outside project-ui retirement.
- Reusable package foundations remain preserved; P1 does not authorize their replacement.

## Authority and precedence findings

- Protocol entrypoints (`.ai/protocol/AGENTS.core.md`, `AI.entry.md`, `adapter-manifest.json`, `version.json`) remain canonical and KEEP.
- `.codex/config.toml` and `.github/CODEOWNERS` are security owner-decision surfaces and KEEP.
- Existing UI Skills and rules are MERGE targets for future project-ui references or Machine UI Policy.
- Generated global reports and API snapshots are evidence-only, not manifest candidates.
- Ignored adapter outputs (`AGENTS.md`, `CLAUDE.md`, `.ai/protocol/adapters/claude.md`) are compatibility outputs and KEEP.

## Asset inventory summary

| Metric                         | Count                    |
| ------------------------------ | ------------------------ |
| Total verified assets          | 135                      |
| Manifest assets                | 53                       |
| Evidence-only assets           | 82                       |
| KEEP                           | 28                       |
| MERGE                          | 22                       |
| REWRITE                        | 3                        |
| RETIRE_AFTER_REPLACEMENT       | 0                        |
| Conflicts                      | 12                       |
| Duplicate groups               | 3                        |
| Unique globs                   | 108                      |
| Active unique globs            | 55                       |
| Dead unique globs              | 53                       |
| Glob declaration occurrences   | 177                      |
| Active declaration occurrences | 71                       |
| Dead declaration occurrences   | 106                      |
| Static runtime routes          | 105                      |
| Final runtime route total      | statically indeterminate |
| Validation surfaces            | 18                       |
| Reusable foundations           | 9                        |

## Topic ownership map

- cli-adapters: 9 manifest asset(s)
- generation-sync: 6 manifest asset(s)
- validation: 5 manifest asset(s)
- wiki-documentation: 5 manifest asset(s)
- page-contract: 4 manifest asset(s)
- skill-routing: 3 manifest asset(s)
- unocss: 3 manifest asset(s)
- platform-invariants: 3 manifest asset(s)
- product-ui-profile: 3 manifest asset(s)
- component-priority: 2 manifest asset(s)
- theme-color: 2 manifest asset(s)
- charts: 1 manifest asset(s)
- size-density: 1 manifest asset(s)
- layout-shell: 1 manifest asset(s)
- interaction-states: 1 manifest asset(s)
- motion-animate-lite: 1 manifest asset(s)
- motion-gsap: 1 manifest asset(s)
- motion-general: 1 manifest asset(s)
- page-archetypes: 1 manifest asset(s)
- product-language: 1 manifest asset(s)
- accessibility: 1 manifest asset(s)
- security-permissions: 1 manifest asset(s)
- runtime-boundary: 1 manifest asset(s)

## Consumer and generator map

- `generate-unocss-ide-data` derives `.ai/manifests/unocss-semantic-shortcuts.json` from `packages/unocss-preset/src/shortcuts/semanticShortcuts.ts` (intentional generated projection, KEEP).
- `generate-ai-protocol-adapters` renders `AGENTS.md`, `CLAUDE.md`, and `.ai/protocol/adapters/claude.md` (ignored compatibility outputs, KEEP).
- `generate-rule-index` produces `.ai/manifests/rule-index.json` (REWRITE with corrected monorepo globs).
- `ai-route-view-scaffold` emits views, hooks, and routes; must emit `page.state.ts` (REWRITE).
- `drift-check` validates page-contract drift; must fail when `page.state.ts` is absent (REWRITE).

## Duplicate source findings

- DUP-01: .ai/skills/design/ccd-motion-system/SKILL.md, .ai/skills/design/ccd-gsap-motion/SKILL.md, .ai/skills/design/ccd-animate-lite/SKILL.md — problematic duplication
- DUP-02: .ai/rules/design-system/00-unocss-guardrails.mdc, .ai/manifests/unocss-semantic-shortcuts.json — intentional generated projection
- DUP-03: .ai/rules/design-system/04-design-state-contract.mdc, .ai/skills/design/ccd-page-archetypes/SKILL.md — partial ownership overlap

## Conflict findings

- CONF-01: protocol versus routing mismatch — adapter-manifest.json codex.skillMapping includes ccd-page-archetypes in the design skill chain, but skill-routing.json route ccd-ui-design omits it.
- CONF-02: rule versus scaffold mismatch — 04-design-state-contract.mdc requires every page to declare a sibling page.state.ts UIDesignState contract, but ai-route-view-scaffold.mjs emits only a view, a hook, and a route module.
- CONF-03: rule versus generated manifest mismatch — rule-index.json records old single-root globs (src/\*\*) that generate-rule-index.mjs copied from rule frontmatter, but the generated manifest does not validate that those globs match current tracked files.
- CONF-04: old path versus monorepo path mismatch — 47 unique old single-root patterns (src/**, index.html, vite.config.ts, src-tauri/**, build/**) produce zero or wrong-root matches because source code moved to apps/**/src/\*\*.
- CONF-05: platform invariant versus product profile mixing — Skills mix reusable platform invariants (token usage, spacing, motion safety) with CCD-specific product-profile decisions (Architectural Glass, CCD signature detail).
- CONF-06: motion default versus conditional motion conflict — Generic UI route ccd-ui-design loads both GSAP and animate-lite motion skills by default; governance intends conditional loading (GSAP only for timeline work, animate-lite for route/class transitions).
- CONF-07: contract requirement without consumer — UIDesignState contract exists and is required by rule, but no runtime consumer imports or reads it; page.state.ts files do not exist.
- CONF-08: validation claim without negative fixture — drift-check.mjs claims to validate archetype drift, but it silently continues when a view lacks a sibling page.state.ts, exiting 0 with zero comparisons.
- CONF-09: generated adapter versus cold-start discovery conflict — AI client cold-start files AGENTS.md and CLAUDE.md are generated, ignored outputs. A fresh clone lacks them until ai:sync runs, but ai-doctor and codex-preflight require them.
- CONF-10: rule versus implementation mismatch — GSAP skill forbids login/static-background motion and limits login to Level 1 motion by default, but LoginShell.vue and AuthShaderBackdrop.vue use GSAP timelines for login entrance and background bubble drift.
- CONF-11: duplicate fact source — Both the design-state contract rule and the page-archetypes skill anchor page-level structural decisions, but neither fully owns the other and neither is machine-enforced.
- CONF-12: accessibility requirement without enforcement — Skills require reduced-motion handling and accessibility review, but no rule, lint rule, or test enforces prefers-reduced-motion or aria practices.

## Dead and partial glob findings

- Dead unique globs: 53
- Dead declaration occurrences: 106
- All old single-root globs (`src/**`, `src-tauri/**`, `vite.config.ts`) are dead.
- No future-reserved globs remain because no owner decision, protocol, scaffold, or roadmap explicitly reserves them.

## UIDesignState and page contract findings

- `UIDesignState` type exists at `apps/web-demo/src/types/design-state.ts`; no verified runtime consumer.
- `page.state.ts` files: 0.
- `UIDesignState` imports: 0.
- `UIDesignState` runtime reads: 0.
- Scaffold does not generate `page.state.ts`.
- `drift-check` skips views lacking `page.state.ts` (empty-set success risk).
- No negative fixture proves missing-contract failure.

## Scaffold findings

- Current scaffold: `scripts/ai-route-view-scaffold.mjs`.
- Supports kinds: table, form, detail.
- Emits `data-archetype` but not `page.state.ts`.
- Future rewrite must generate compliant page contracts.

## AGENTS and CLAUDE cold-start findings

- `AGENTS.md` and `CLAUDE.md` are ignored compatibility outputs.
- `.ai/protocol/adapters/claude.md` is also ignored.
- Canonical source remains `.ai/protocol/AI.entry.md` and `.ai/protocol/adapter-manifest.json`.
- Cold-start conflict is recorded as CONF-09.

## Route-level scrolling versus region ownership findings

- `AppContainer.vue` wraps routed content with `CScrollbar`.
- No `overflow-auto` on view/layout roots; only `overflow-hidden` clipping.
- No automated test enforces scroll ownership.

## Motion routing findings

- Three motion Skills overlap broadly.
- GSAP is used on login views despite skill restrictions.
- Conditional motion is not machine-enforced.
- Future target: consolidated project-ui interaction-motion reference.

## Platform foundation reuse findings

The following nine reusable foundations must remain unchanged until P2 explicitly authorizes otherwise:

- Semantic color & theme engine at `packages/design-tokens/src/theme-engine` — PRESERVE
- Size & density system at `packages/design-tokens/src/size.ts` — PRESERVE
- Breakpoints & responsive runtime at `packages/design-tokens/src/breakpoints.ts` — PRESERVE
- UnoCSS semantic design engine at `packages/unocss-preset/src/index.ts` — PRESERVE
- Layout shell primitives at `packages/vue-app-platform/src/layoutRuntime.ts` — PRESERVE
- Scroll ownership (CScrollbar) at `packages/vue-ui/src/CScrollbar` — PRESERVE
- Motion adapters at `packages/vue-ui/src/AnimateWrapper` — PRESERVE
- PrimeVue component adapter at `packages/vue-primevue-adapter/src/index.ts` — PRESERVE
- Shared Vue hooks at `packages/vue-hooks/src/index.ts` — PRESERVE

## KEEP assets

| ID                                                   | Path                                                 | Future owner                                                          |
| ---------------------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------- |
| AGENTS_md                                            | AGENTS.md                                            | AGENTS.md (compatibility output)                                      |
| ai_manifests_skill_routing_json                      | .ai/manifests/skill-routing.json                     | .ai/manifests/skill-routing.json (routing owner)                      |
| ai_manifests_skills_lock_json                        | .ai/manifests/skills-lock.json                       | .ai/manifests/skills-lock.json (routing owner)                        |
| ai_manifests_unocss_semantic_shortcuts_json          | .ai/manifests/unocss-semantic-shortcuts.json         | .ai/manifests/unocss-semantic-shortcuts.json (routing owner)          |
| ai_protocol_adapter_manifest_json                    | .ai/protocol/adapter-manifest.json                   | .ai/protocol/adapter-manifest.json (canonical protocol)               |
| ai_protocol_adapters_claude_md                       | .ai/protocol/adapters/claude.md                      | .ai/protocol/adapters/claude.md (compatibility output)                |
| ai_protocol_adapters_codex_md                        | .ai/protocol/adapters/codex.md                       | .ai/protocol/adapters/codex.md (compatibility output)                 |
| ai_protocol_adapters_README_md                       | .ai/protocol/adapters/README.md                      | .ai/protocol/adapters/README.md (compatibility output)                |
| ai_protocol_AGENTS_core_md                           | .ai/protocol/AGENTS.core.md                          | .ai/protocol/AGENTS.core.md (canonical protocol)                      |
| ai_protocol_AI_entry_md                              | .ai/protocol/AI.entry.md                             | .ai/protocol/AI.entry.md (canonical protocol)                         |
| ai_protocol_version_json                             | .ai/protocol/version.json                            | .ai/protocol/version.json (canonical protocol)                        |
| apps_web_demo_src_types_design_state_ts              | apps/web-demo/src/types/design-state.ts              | apps/web-demo/src/types/design-state.ts (schema/contract owner)       |
| CLAUDE_md                                            | CLAUDE.md                                            | CLAUDE.md (compatibility output)                                      |
| codex_config_toml                                    | .codex/config.toml                                   | .codex/config.toml (security owner decision)                          |
| github_CODEOWNERS                                    | .github/CODEOWNERS                                   | .github/CODEOWNERS (security owner decision)                          |
| scripts_ai_doctor_mjs                                | scripts/ai-doctor.mjs                                | scripts/ai-doctor.mjs (validation owner)                              |
| scripts_ai_sync_codex_mjs                            | scripts/ai-sync-codex.mjs                            | scripts/ai-sync-codex.mjs (generator owner)                           |
| scripts_ai_sync_mjs                                  | scripts/ai-sync.mjs                                  | scripts/ai-sync.mjs (generator owner)                                 |
| scripts_codex_preflight_mjs                          | scripts/codex-preflight.mjs                          | scripts/codex-preflight.mjs (validation owner)                        |
| scripts_generate_ai_protocol_adapters_mjs            | scripts/generate-ai-protocol-adapters.mjs            | scripts/generate-ai-protocol-adapters.mjs (generator owner)           |
| scripts_generate_rule_index_mjs                      | scripts/generate-rule-index.mjs                      | scripts/generate-rule-index.mjs (generator owner)                     |
| scripts_generate_unocss_ide_data_mjs                 | scripts/generate-unocss-ide-data.mjs                 | scripts/generate-unocss-ide-data.mjs (generator owner)                |
| scripts_skill_lock_utils_mjs                         | scripts/skill-lock-utils.mjs                         | scripts/skill-lock-utils.mjs (validation owner)                       |
| wiki_canonical_design_animation_governance_md        | wiki/canonical/design/animation-governance.md        | wiki/canonical/design/animation-governance.md (canonical wiki)        |
| wiki_canonical_design_ccd_ai_ui_skill_governance_md  | wiki/canonical/design/ccd-ai-ui-skill-governance.md  | wiki/canonical/design/ccd-ai-ui-skill-governance.md (canonical wiki)  |
| wiki_canonical_design_ccd_product_design_language_md | wiki/canonical/design/ccd-product-design-language.md | wiki/canonical/design/ccd-product-design-language.md (canonical wiki) |
| wiki_generated_web_demo_ui_inventory_md              | wiki/generated/web-demo-ui-inventory.md              | wiki/generated/web-demo-ui-inventory.md (UI-specific inventory)       |
| wiki_indexes_design_index_md                         | wiki/indexes/design-index.md                         | wiki/indexes/design-index.md (canonical index)                        |

## MERGE assets

| ID                                                          | Path                                                         | Future owner                            | Semantic coverage prerequisite                                                                                                                                                                                                                                                                            |
| ----------------------------------------------------------- | ------------------------------------------------------------ | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ai_rules_components_00_primevue_ecosystem_mdc               | .ai/rules/components/00-primevue-ecosystem.mdc               | project-ui component-priority reference | All unique requirements of current asset must be demonstrably present in the consolidated project-ui component-priority reference before current asset cedes authority. (Preserve PrimeVue ecosystem priority, PassThrough styling invariants, pro-component selection, and ECharts theming constraints.) |
| ai_rules_components_01_primevue_pt_styling_mdc              | .ai/rules/components/01-primevue-pt-styling.mdc              | project-ui component-priority reference | All unique requirements of current asset must be demonstrably present in the consolidated project-ui component-priority reference before current asset cedes authority. (Preserve UI preflight and AI-generation workflow invariants in machine-readable form.)                                           |
| ai_rules_components_02_pro_components_mdc                   | .ai/rules/components/02-pro-components.mdc                   | project-ui component-priority reference | All unique requirements of current asset must be demonstrably present in the consolidated project-ui component-priority reference before current asset cedes authority. (Preserve PrimeVue ecosystem priority, PassThrough styling invariants, pro-component selection, and ECharts theming constraints.) |
| ai_rules_components_03_echarts_theming_mdc                  | .ai/rules/components/03-echarts-theming.mdc                  | project-ui component-priority reference | All unique requirements of current asset must be demonstrably present in the consolidated project-ui component-priority reference before current asset cedes authority. (Preserve .ai/rules/components/03-echarts-theming.mdc governance semantics under project-ui component-priority reference)         |
| ai_rules_core_02_ui_preflight_mdc                           | .ai/rules/core/02-ui-preflight.mdc                           | Machine UI Policy                       | All platform-invariant rules must be expressible as Machine UI Policy checks before current asset cedes authority. (Preserve UI preflight and AI-generation workflow invariants in machine-readable form.)                                                                                                |
| ai_rules_core_10_ai_generation_workflow_mdc                 | .ai/rules/core/10-ai-generation-workflow.mdc                 | Machine UI Policy                       | All platform-invariant rules must be expressible as Machine UI Policy checks before current asset cedes authority. (Preserve UI preflight and AI-generation workflow invariants in machine-readable form.)                                                                                                |
| ai_rules_design_system_00_unocss_guardrails_mdc             | .ai/rules/design-system/00-unocss-guardrails.mdc             | project-ui tokens-unocss reference      | All unique requirements of current asset must be demonstrably present in the consolidated project-ui tokens-unocss reference before current asset cedes authority. (Preserve UnoCSS guardrails, semantic shortcuts, and token-driven usage contracts.)                                                    |
| ai_rules_design_system_01_design_tokens_mdc                 | .ai/rules/design-system/01-design-tokens.mdc                 | project-ui tokens-unocss reference      | All unique requirements of current asset must be demonstrably present in the consolidated project-ui tokens-unocss reference before current asset cedes authority. (Preserve design-token, size-density, and semantic-color usage contracts.)                                                             |
| ai_rules_design_system_02_size_density_system_mdc           | .ai/rules/design-system/02-size-density-system.mdc           | project-ui tokens-unocss reference      | All unique requirements of current asset must be demonstrably present in the consolidated project-ui tokens-unocss reference before current asset cedes authority. (Preserve size-density and spacing-system decisions.)                                                                                  |
| ai_rules_design_system_03_material_system_mdc               | .ai/rules/design-system/03-material-system.mdc               | project-ui product-ui-profile reference | All unique requirements of current asset must be demonstrably present in the consolidated project-ui product-ui-profile reference before current asset cedes authority. (Preserve material-system profile and product-language decisions.)                                                                |
| ai_rules_design_system_04_design_state_contract_mdc         | .ai/rules/design-system/04-design-state-contract.mdc         | Page Contract Schema                    | Page-contract schema must validate all current design-state declarations and page-archetype bindings. (Preserve UIDesignState contract shape and page-archetype binding rules.)                                                                                                                           |
| ai_rules_design_system_05_semantic_color_usage_contract_mdc | .ai/rules/design-system/05-semantic-color-usage-contract.mdc | project-ui tokens-unocss reference      | All unique requirements of current asset must be demonstrably present in the consolidated project-ui tokens-unocss reference before current asset cedes authority. (Preserve design-token, size-density, and semantic-color usage contracts.)                                                             |
| ai_rules_integrations_03_layout_architecture_mdc            | .ai/rules/integrations/03-layout-architecture.mdc            | project-ui layout-scroll reference      | All unique requirements of current asset must be demonstrably present in the consolidated project-ui layout-scroll reference before current asset cedes authority. (Preserve layout-shell and scroll-region ownership rules.)                                                                             |
| ai_rules_integrations_07_interaction_patterns_mdc           | .ai/rules/integrations/07-interaction-patterns.mdc           | project-ui interaction-motion reference | All unique requirements of current asset must be demonstrably present in the consolidated project-ui interaction-motion reference before current asset cedes authority. (Preserve interaction-pattern and motion-routing constraints.)                                                                    |
| ai_skills_design_ccd_animate_lite_SKILL_md                  | .ai/skills/design/ccd-animate-lite/SKILL.md                  | project-ui interaction-motion reference | All unique requirements of current asset must be demonstrably present in the consolidated project-ui interaction-motion reference before current asset cedes authority. (Preserve lightweight animation constraints and skill boundaries.)                                                                |
| ai_skills_design_ccd_gsap_motion_SKILL_md                   | .ai/skills/design/ccd-gsap-motion/SKILL.md                   | project-ui interaction-motion reference | All unique requirements of current asset must be demonstrably present in the consolidated project-ui interaction-motion reference before current asset cedes authority. (Preserve GSAP motion usage restrictions and conditional-routing rules.)                                                          |
| ai_skills_design_ccd_material_system_SKILL_md               | .ai/skills/design/ccd-material-system/SKILL.md               | project-ui product-ui-profile reference | All unique requirements of current asset must be demonstrably present in the consolidated project-ui product-ui-profile reference before current asset cedes authority. (Preserve material-system profile and product-language decisions.)                                                                |
| ai_skills_design_ccd_motion_system_SKILL_md                 | .ai/skills/design/ccd-motion-system/SKILL.md                 | project-ui interaction-motion reference | All unique requirements of current asset must be demonstrably present in the consolidated project-ui interaction-motion reference before current asset cedes authority. (Preserve consolidated motion-system constraints.)                                                                                |
| ai_skills_design_ccd_page_archetypes_SKILL_md               | .ai/skills/design/ccd-page-archetypes/SKILL.md               | project-ui page-archetypes reference    | All unique requirements of current asset must be demonstrably present in the consolidated project-ui page-archetypes reference before current asset cedes authority. (Preserve page-archetype declarations and binding conventions.)                                                                      |
| ai_skills_design_ccd_product_language_SKILL_md              | .ai/skills/design/ccd-product-language/SKILL.md              | project-ui product-language reference   | All unique requirements of current asset must be demonstrably present in the consolidated project-ui product-language reference before current asset cedes authority. (Preserve product-design-language vocabulary and tone constraints.)                                                                 |
| ai_skills_design_ccd_ui_review_gate_SKILL_md                | .ai/skills/design/ccd-ui-review-gate/SKILL.md                | project-ui accessibility reference      | All unique requirements of current asset must be demonstrably present in the consolidated project-ui accessibility reference before current asset cedes authority. (Preserve accessibility review gate criteria and validation checklist.)                                                                |
| ai_skills_design_README_md                                  | .ai/skills/design/README.md                                  | project-ui SKILL entry                  | All unique requirements of current asset must be demonstrably present in the consolidated project-ui SKILL entry before current asset cedes authority. (Preserve material-system profile and product-language decisions.)                                                                                 |

## REWRITE assets

| ID                                 | Path                               | Future owner                                   | Required correction boundary                                                                                                                                                        |
| ---------------------------------- | ---------------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ai_manifests_rule_index_json       | .ai/manifests/rule-index.json      | .ai/manifests/rule-index.json (rewritten)      | Regenerate rule-index.json from current .ai/rules/**/\*.mdc frontmatter; Validate all globs against tracked files in apps/**/src/\*\*; Confirm non-UI rules retain routing coverage |
| scripts_ai_route_view_scaffold_mjs | scripts/ai-route-view-scaffold.mjs | scripts/ai-route-view-scaffold.mjs (rewritten) | Update scaffold template to emit page.state.ts; Add UIDesignState import and default shape; Validate against 04-design-state-contract.mdc                                           |
| scripts_drift_check_mjs            | scripts/drift-check.mjs            | scripts/drift-check.mjs (rewritten)            | Add negative fixture for missing page.state.ts; Exit non-zero when zero comparisons result from missing contracts; Validate against page-contract schema                            |

## RETIRE_AFTER_REPLACEMENT assets

The accepted P1.4R2 disposition matrix contains zero retirement candidates. No assets are assigned `RETIRE_AFTER_REPLACEMENT`.

## Atomic replacement boundaries

| ID                                                          | Path                                                         | Boundary                                                 | Consumer migration required | Testable prerequisites                                                                                                                                                              |
| ----------------------------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ai_manifests_rule_index_json                                | .ai/manifests/rule-index.json                                | Rewrite .ai/manifests/rule-index.json in place           | no                          | Confirm non-UI rules retain routing coverage; Regenerate rule-index.json from current .ai/rules/**/\*.mdc frontmatter; Validate all globs against tracked files in apps/**/src/\*\* |
| ai_rules_components_00_primevue_ecosystem_mdc               | .ai/rules/components/00-primevue-ecosystem.mdc               | Consolidate into project-ui component-priority reference | yes                         |
| ai_rules_components_01_primevue_pt_styling_mdc              | .ai/rules/components/01-primevue-pt-styling.mdc              | Consolidate into project-ui component-priority reference | yes                         |
| ai_rules_components_02_pro_components_mdc                   | .ai/rules/components/02-pro-components.mdc                   | Consolidate into project-ui component-priority reference | yes                         |
| ai_rules_components_03_echarts_theming_mdc                  | .ai/rules/components/03-echarts-theming.mdc                  | Consolidate into project-ui component-priority reference | yes                         |
| ai_rules_core_02_ui_preflight_mdc                           | .ai/rules/core/02-ui-preflight.mdc                           | Consolidate into Machine UI Policy                       | yes                         |
| ai_rules_core_10_ai_generation_workflow_mdc                 | .ai/rules/core/10-ai-generation-workflow.mdc                 | Consolidate into Machine UI Policy                       | yes                         |
| ai_rules_design_system_00_unocss_guardrails_mdc             | .ai/rules/design-system/00-unocss-guardrails.mdc             | Consolidate into project-ui tokens-unocss reference      | yes                         |
| ai_rules_design_system_01_design_tokens_mdc                 | .ai/rules/design-system/01-design-tokens.mdc                 | Consolidate into project-ui tokens-unocss reference      | yes                         |
| ai_rules_design_system_02_size_density_system_mdc           | .ai/rules/design-system/02-size-density-system.mdc           | Consolidate into project-ui tokens-unocss reference      | yes                         |
| ai_rules_design_system_03_material_system_mdc               | .ai/rules/design-system/03-material-system.mdc               | Consolidate into project-ui product-ui-profile reference | yes                         |
| ai_rules_design_system_04_design_state_contract_mdc         | .ai/rules/design-system/04-design-state-contract.mdc         | Consolidate into Page Contract Schema                    | yes                         |
| ai_rules_design_system_05_semantic_color_usage_contract_mdc | .ai/rules/design-system/05-semantic-color-usage-contract.mdc | Consolidate into project-ui tokens-unocss reference      | yes                         |
| ai_rules_integrations_03_layout_architecture_mdc            | .ai/rules/integrations/03-layout-architecture.mdc            | Consolidate into project-ui layout-scroll reference      | yes                         |
| ai_rules_integrations_07_interaction_patterns_mdc           | .ai/rules/integrations/07-interaction-patterns.mdc           | Consolidate into project-ui interaction-motion reference | yes                         |
| ai_skills_design_ccd_animate_lite_SKILL_md                  | .ai/skills/design/ccd-animate-lite/SKILL.md                  | Consolidate into project-ui interaction-motion reference | yes                         |
| ai_skills_design_ccd_gsap_motion_SKILL_md                   | .ai/skills/design/ccd-gsap-motion/SKILL.md                   | Consolidate into project-ui interaction-motion reference | yes                         |
| ai_skills_design_ccd_material_system_SKILL_md               | .ai/skills/design/ccd-material-system/SKILL.md               | Consolidate into project-ui product-ui-profile reference | yes                         |
| ai_skills_design_ccd_motion_system_SKILL_md                 | .ai/skills/design/ccd-motion-system/SKILL.md                 | Consolidate into project-ui interaction-motion reference | yes                         |
| ai_skills_design_ccd_page_archetypes_SKILL_md               | .ai/skills/design/ccd-page-archetypes/SKILL.md               | Consolidate into project-ui page-archetypes reference    | yes                         |
| ai_skills_design_ccd_product_language_SKILL_md              | .ai/skills/design/ccd-product-language/SKILL.md              | Consolidate into project-ui product-language reference   | yes                         |
| ai_skills_design_ccd_ui_review_gate_SKILL_md                | .ai/skills/design/ccd-ui-review-gate/SKILL.md                | Consolidate into project-ui accessibility reference      | yes                         |
| ai_skills_design_README_md                                  | .ai/skills/design/README.md                                  | Consolidate into project-ui SKILL entry                  | yes                         |
| scripts_ai_route_view_scaffold_mjs                          | scripts/ai-route-view-scaffold.mjs                           | Rewrite scripts/ai-route-view-scaffold.mjs in place      | no                          | Add UIDesignState import and default shape; Update scaffold template to emit page.state.ts; Validate against 04-design-state-contract.mdc                                           |
| scripts_drift_check_mjs                                     | scripts/drift-check.mjs                                      | Rewrite scripts/drift-check.mjs in place                 | no                          | Add negative fixture for missing page.state.ts; Exit non-zero when zero comparisons result from missing contracts; Validate against page-contract schema                            |

## Explicit P2 prerequisites

- .ai/manifests/rule-index.json: Confirm non-UI rules retain routing coverage; Regenerate rule-index.json from current .ai/rules/**/\*.mdc frontmatter; Validate all globs against tracked files in apps/**/src/\*\*
- scripts/ai-route-view-scaffold.mjs: Add UIDesignState import and default shape; Update scaffold template to emit page.state.ts; Validate against 04-design-state-contract.mdc
- scripts/drift-check.mjs: Add negative fixture for missing page.state.ts; Exit non-zero when zero comparisons result from missing contracts; Validate against page-contract schema

## P1 non-goals

P1 does not authorize deletion, merge execution, rewrite execution, retirement, replacement, routing changes, adapter changes, page-contract implementation, scaffold changes, runtime UI changes, or creation of a project-ui Skill. P1 only records future decisions and prerequisites.

## Validation evidence

- 18 validation surfaces analyzed.
- Governance gate gaps: no negative fixture for page-contract, no scroll-ownership enforcement, no motion-routing enforcement.
- All 20 known findings are recorded in `.ai/governance/ui/migration-manifest.json` under `coverageFindings.knownFindings`.

## P2 handoff

- P1 baseline SHA: `9fad207b1700615000517a0c5fee1af9661d00f8`.
- project-ui Skill does not currently exist.
- P2 has not started.
- Atomic boundaries, prerequisites, conflicts, dead globs, coverage facts, and cold-start facts are recorded in `.ai/governance/ui/migration-manifest.json`.
- P2 execution is not authorized by this plan.
- P2 must not delete or replace API snapshots, architecture reports, SBOM, dependency/runtime graphs, Wiki health reports, global governance reports, or reusable package foundations.

## Appendix A — Evidence-only assets (82 records)

| ID                                                                                                                 | Path                                                                                                                | Classification          | Scope reason                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| ai_execution_execution_fingerprint_json                                                                            | .ai/execution/execution-fingerprint.json                                                                            | implementation-evidence | Implementation or supporting evidence only                                                                                    |
| ai_execution_provider_session_json                                                                                 | .ai/execution/provider-session.json                                                                                 | implementation-evidence | Implementation or supporting evidence only                                                                                    |
| ai_execution_runtime_session_json                                                                                  | .ai/execution/runtime-session.json                                                                                  | implementation-evidence | Implementation or supporting evidence only                                                                                    |
| ai_generated_architecture_snapshot_json                                                                            | .ai/generated/architecture-snapshot.json                                                                            | generated               | Non-UI generated artifact per P1 scope law; evidence-only unless individual file directly owns UI-specific governance policy. |
| ai_generated_governance_report_json                                                                                | .ai/generated/governance-report.json                                                                                | generated               | Non-UI generated artifact per P1 scope law; evidence-only unless individual file directly owns UI-specific governance policy. |
| ai_governance_api_snapshots_ccd_contracts_json                                                                     | .ai/governance/api-snapshots/ccd\_\_contracts.json                                                                  | generated               | API/runtime-boundary governance evidence per P1 scope law; reclassified as evidence-only.                                     |
| ai_governance_api_snapshots_ccd_core_json                                                                          | .ai/governance/api-snapshots/ccd\_\_core.json                                                                       | generated               | API/runtime-boundary governance evidence per P1 scope law; reclassified as evidence-only.                                     |
| ai_governance_api_snapshots_ccd_design_tokens_json                                                                 | .ai/governance/api-snapshots/ccd\_\_design-tokens.json                                                              | generated               | API/runtime-boundary governance evidence per P1 scope law; reclassified as evidence-only.                                     |
| ai_governance_api_snapshots_ccd_desktop_json                                                                       | .ai/governance/api-snapshots/ccd\_\_desktop.json                                                                    | generated               | API/runtime-boundary governance evidence per P1 scope law; reclassified as evidence-only.                                     |
| ai_governance_api_snapshots_ccd_shared_utils_json                                                                  | .ai/governance/api-snapshots/ccd\_\_shared-utils.json                                                               | generated               | API/runtime-boundary governance evidence per P1 scope law; reclassified as evidence-only.                                     |
| ai_governance_api_snapshots_ccd_unocss_preset_json                                                                 | .ai/governance/api-snapshots/ccd\_\_unocss-preset.json                                                              | generated               | API/runtime-boundary governance evidence per P1 scope law; reclassified as evidence-only.                                     |
| ai_governance_api_snapshots_ccd_vue_app_platform_json                                                              | .ai/governance/api-snapshots/ccd\_\_vue-app-platform.json                                                           | generated               | API/runtime-boundary governance evidence per P1 scope law; reclassified as evidence-only.                                     |
| ai_governance_api_snapshots_ccd_vue_charts_json                                                                    | .ai/governance/api-snapshots/ccd\_\_vue-charts.json                                                                 | generated               | API/runtime-boundary governance evidence per P1 scope law; reclassified as evidence-only.                                     |
| ai_governance_api_snapshots_ccd_vue_hooks_json                                                                     | .ai/governance/api-snapshots/ccd\_\_vue-hooks.json                                                                  | generated               | API/runtime-boundary governance evidence per P1 scope law; reclassified as evidence-only.                                     |
| ai_governance_api_snapshots_ccd_vue_primevue_adapter_json                                                          | .ai/governance/api-snapshots/ccd\_\_vue-primevue-adapter.json                                                       | generated               | API/runtime-boundary governance evidence per P1 scope law; reclassified as evidence-only.                                     |
| ai_governance_api_snapshots_ccd_vue_ui_json                                                                        | .ai/governance/api-snapshots/ccd\_\_vue-ui.json                                                                     | generated               | API/runtime-boundary governance evidence per P1 scope law; reclassified as evidence-only.                                     |
| ai_governance_api_snapshots_ccd_web_demo_json                                                                      | .ai/governance/api-snapshots/ccd\_\_web-demo.json                                                                   | generated               | API/runtime-boundary governance evidence per P1 scope law; reclassified as evidence-only.                                     |
| ai_orchestration_manifest_json                                                                                     | .ai/orchestration/manifest.json                                                                                     | implementation-evidence | Implementation or supporting evidence only                                                                                    |
| ai_runtime_governance_snapshots_20260608T131058Z_github_ichichuang_ccd_after_branch_main_json                      | .ai/runtime/governance-snapshots/20260608T131058Z-github-ichichuang-ccd/after-branch-main.json                      | implementation-evidence | Implementation or supporting evidence only                                                                                    |
| ai_runtime_governance_snapshots_20260608T131058Z_github_ichichuang_ccd_after_branch_main_protection_json           | .ai/runtime/governance-snapshots/20260608T131058Z-github-ichichuang-ccd/after-branch-main-protection.json           | implementation-evidence | Implementation or supporting evidence only                                                                                    |
| ai_runtime_governance_snapshots_20260608T131058Z_github_ichichuang_ccd_after_main_check_runs_json                  | .ai/runtime/governance-snapshots/20260608T131058Z-github-ichichuang-ccd/after-main-check-runs.json                  | implementation-evidence | Implementation or supporting evidence only                                                                                    |
| ai_runtime_governance_snapshots_20260608T131058Z_github_ichichuang_ccd_after_ruleset_14718935_json                 | .ai/runtime/governance-snapshots/20260608T131058Z-github-ichichuang-ccd/after-ruleset-14718935.json                 | implementation-evidence | Implementation or supporting evidence only                                                                                    |
| ai_runtime_governance_snapshots_20260608T131058Z_github_ichichuang_ccd_after_rulesets_json                         | .ai/runtime/governance-snapshots/20260608T131058Z-github-ichichuang-ccd/after-rulesets.json                         | implementation-evidence | Implementation or supporting evidence only                                                                                    |
| ai_runtime_governance_snapshots_20260608T131058Z_github_ichichuang_ccd_applied_branch_protection_payload_json      | .ai/runtime/governance-snapshots/20260608T131058Z-github-ichichuang-ccd/applied-branch-protection-payload.json      | implementation-evidence | Implementation or supporting evidence only                                                                                    |
| ai_runtime_governance_snapshots_20260608T131058Z_github_ichichuang_ccd_branch_main_json                            | .ai/runtime/governance-snapshots/20260608T131058Z-github-ichichuang-ccd/branch-main.json                            | implementation-evidence | Implementation or supporting evidence only                                                                                    |
| ai_runtime_governance_snapshots_20260608T131058Z_github_ichichuang_ccd_branch_main_protection_json                 | .ai/runtime/governance-snapshots/20260608T131058Z-github-ichichuang-ccd/branch-main-protection.json                 | implementation-evidence | Implementation or supporting evidence only                                                                                    |
| ai_runtime_governance_snapshots_20260608T131058Z_github_ichichuang_ccd_branch_main_required_status_checks_json     | .ai/runtime/governance-snapshots/20260608T131058Z-github-ichichuang-ccd/branch-main-required-status-checks.json     | implementation-evidence | Implementation or supporting evidence only                                                                                    |
| ai_runtime_governance_snapshots_20260608T131058Z_github_ichichuang_ccd_ci_runs_json                                | .ai/runtime/governance-snapshots/20260608T131058Z-github-ichichuang-ccd/ci-runs.json                                | implementation-evidence | Implementation or supporting evidence only                                                                                    |
| ai_runtime_governance_snapshots_20260608T131058Z_github_ichichuang_ccd_deploy_runs_json                            | .ai/runtime/governance-snapshots/20260608T131058Z-github-ichichuang-ccd/deploy-runs.json                            | implementation-evidence | Implementation or supporting evidence only                                                                                    |
| ai_runtime_governance_snapshots_20260608T131058Z_github_ichichuang_ccd_latest_ci_jobs_json                         | .ai/runtime/governance-snapshots/20260608T131058Z-github-ichichuang-ccd/latest-ci-jobs.json                         | implementation-evidence | Implementation or supporting evidence only                                                                                    |
| ai_runtime_governance_snapshots_20260608T131058Z_github_ichichuang_ccd_latest_deploy_jobs_json                     | .ai/runtime/governance-snapshots/20260608T131058Z-github-ichichuang-ccd/latest-deploy-jobs.json                     | implementation-evidence | Implementation or supporting evidence only                                                                                    |
| ai_runtime_governance_snapshots_20260608T131058Z_github_ichichuang_ccd_local_workflow_job_names_json               | .ai/runtime/governance-snapshots/20260608T131058Z-github-ichichuang-ccd/local-workflow-job-names.json               | implementation-evidence | Implementation or supporting evidence only                                                                                    |
| ai_runtime_governance_snapshots_20260608T131058Z_github_ichichuang_ccd_main_check_runs_json                        | .ai/runtime/governance-snapshots/20260608T131058Z-github-ichichuang-ccd/main-check-runs.json                        | implementation-evidence | Implementation or supporting evidence only                                                                                    |
| ai_runtime_governance_snapshots_20260608T131058Z_github_ichichuang_ccd_mutation_branch_protection_attempt_1_stderr | .ai/runtime/governance-snapshots/20260608T131058Z-github-ichichuang-ccd/mutation-branch-protection-attempt-1.stderr | implementation-evidence | Implementation or supporting evidence only                                                                                    |
| ai_runtime_governance_snapshots_20260608T131058Z_github_ichichuang_ccd_mutation_branch_protection_response_json    | .ai/runtime/governance-snapshots/20260608T131058Z-github-ichichuang-ccd/mutation-branch-protection-response.json    | implementation-evidence | Implementation or supporting evidence only                                                                                    |
| ai_runtime_governance_snapshots_20260608T131058Z_github_ichichuang_ccd_mutation_branch_protection_stderr           | .ai/runtime/governance-snapshots/20260608T131058Z-github-ichichuang-ccd/mutation-branch-protection.stderr           | implementation-evidence | Implementation or supporting evidence only                                                                                    |
| ai_runtime_governance_snapshots_20260608T131058Z_github_ichichuang_ccd_README_snapshot_json                        | .ai/runtime/governance-snapshots/20260608T131058Z-github-ichichuang-ccd/README.snapshot.json                        | implementation-evidence | Implementation or supporting evidence only                                                                                    |
| ai_runtime_governance_snapshots_20260608T131058Z_github_ichichuang_ccd_repo_json                                   | .ai/runtime/governance-snapshots/20260608T131058Z-github-ichichuang-ccd/repo.json                                   | implementation-evidence | Implementation or supporting evidence only                                                                                    |
| ai_runtime_governance_snapshots_20260608T131058Z_github_ichichuang_ccd_rulesets_json                               | .ai/runtime/governance-snapshots/20260608T131058Z-github-ichichuang-ccd/rulesets.json                               | implementation-evidence | Implementation or supporting evidence only                                                                                    |
| ai_runtime_governance_snapshots_20260608T131058Z_github_ichichuang_ccd_workflows_json                              | .ai/runtime/governance-snapshots/20260608T131058Z-github-ichichuang-ccd/workflows.json                              | implementation-evidence | Implementation or supporting evidence only                                                                                    |
| ai_runtime_governance_snapshots_20260610T095053Z_github_ichichuang_ccd_branch_main_json                            | .ai/runtime/governance-snapshots/20260610T095053Z-github-ichichuang-ccd/branch-main.json                            | implementation-evidence | Implementation or supporting evidence only                                                                                    |
| ai_runtime_governance_snapshots_20260610T095053Z_github_ichichuang_ccd_branch_main_protection_json                 | .ai/runtime/governance-snapshots/20260610T095053Z-github-ichichuang-ccd/branch-main-protection.json                 | implementation-evidence | Implementation or supporting evidence only                                                                                    |
| ai_runtime_governance_snapshots_20260610T095053Z_github_ichichuang_ccd_branch_main_required_status_checks_json     | .ai/runtime/governance-snapshots/20260610T095053Z-github-ichichuang-ccd/branch-main-required-status-checks.json     | implementation-evidence | Implementation or supporting evidence only                                                                                    |
| ai_runtime_governance_snapshots_20260610T095053Z_github_ichichuang_ccd_local_workflow_job_names_json               | .ai/runtime/governance-snapshots/20260610T095053Z-github-ichichuang-ccd/local-workflow-job-names.json               | implementation-evidence | Implementation or supporting evidence only                                                                                    |
| ai_runtime_governance_snapshots_20260610T095053Z_github_ichichuang_ccd_README_snapshot_json                        | .ai/runtime/governance-snapshots/20260610T095053Z-github-ichichuang-ccd/README.snapshot.json                        | implementation-evidence | Implementation or supporting evidence only                                                                                    |
| ai_runtime_governance_snapshots_20260610T095053Z_github_ichichuang_ccd_remote_heads_txt                            | .ai/runtime/governance-snapshots/20260610T095053Z-github-ichichuang-ccd/remote-heads.txt                            | implementation-evidence | Implementation or supporting evidence only                                                                                    |
| ai_runtime_governance_snapshots_20260610T095053Z_github_ichichuang_ccd_repo_json                                   | .ai/runtime/governance-snapshots/20260610T095053Z-github-ichichuang-ccd/repo.json                                   | implementation-evidence | Implementation or supporting evidence only                                                                                    |
| ai_runtime_governance_snapshots_20260610T095053Z_github_ichichuang_ccd_ruleset_14718935_json                       | .ai/runtime/governance-snapshots/20260610T095053Z-github-ichichuang-ccd/ruleset-14718935.json                       | implementation-evidence | Implementation or supporting evidence only                                                                                    |
| ai_runtime_governance_snapshots_20260610T095053Z_github_ichichuang_ccd_rulesets_json                               | .ai/runtime/governance-snapshots/20260610T095053Z-github-ichichuang-ccd/rulesets.json                               | implementation-evidence | Implementation or supporting evidence only                                                                                    |
| ai_runtime_governance_snapshots_20260610T095053Z_github_ichichuang_ccd_workflows_json                              | .ai/runtime/governance-snapshots/20260610T095053Z-github-ichichuang-ccd/workflows.json                              | implementation-evidence | Implementation or supporting evidence only                                                                                    |
| ai_runtime_owner_decisions_md                                                                                      | .ai/runtime/owner_decisions.md                                                                                      | implementation-evidence | Implementation or supporting evidence only                                                                                    |
| ai_runtime_profile_desktop_profile_json                                                                            | .ai/runtime-profile/desktop/profile.json                                                                            | implementation-evidence | Implementation or supporting evidence only                                                                                    |
| ai_runtime_profile_local_profile_json                                                                              | .ai/runtime-profile/local/profile.json                                                                              | implementation-evidence | Implementation or supporting evidence only                                                                                    |
| ai_runtime_repair_list_template_md                                                                                 | .ai/runtime/repair_list.template.md                                                                                 | implementation-evidence | Implementation or supporting evidence only                                                                                    |
| ai_runtime_web_demo_ui_rebuild_plan_md                                                                             | .ai/runtime/web-demo-ui-rebuild-plan.md                                                                             | implementation-evidence | Implementation or supporting evidence only                                                                                    |
| github_workflows_ci_yml                                                                                            | .github/workflows/ci.yml                                                                                            | implementation-evidence | Implementation or supporting evidence only                                                                                    |
| github_workflows_deploy_yml                                                                                        | .github/workflows/deploy.yml                                                                                        | implementation-evidence | Implementation or supporting evidence only                                                                                    |
| gitignore                                                                                                          | .gitignore                                                                                                          | implementation-evidence | Implementation or supporting evidence only                                                                                    |
| scripts_ai_architecture_guard_mjs                                                                                  | scripts/ai-architecture-guard.mjs                                                                                   | canonical               | Unexpected candidate per P1 scope law; does not directly require a UI-governance migration decision.                          |
| scripts_migrate_ledger_mjs                                                                                         | scripts/migrate-ledger.mjs                                                                                          | canonical               | Unexpected candidate per P1 scope law; does not directly require a UI-governance migration decision.                          |
| wiki_generated_api_surface_report_json                                                                             | wiki/generated/api-surface-report.json                                                                              | generated               | Non-UI generated artifact per P1 scope law; evidence-only unless individual file directly owns UI-specific governance policy. |
| wiki_generated_api_surface_report_md                                                                               | wiki/generated/api-surface-report.md                                                                                | generated               | Non-UI generated artifact per P1 scope law; evidence-only unless individual file directly owns UI-specific governance policy. |
| wiki_generated_architecture_overview_md                                                                            | wiki/generated/architecture-overview.md                                                                             | generated               | Non-UI generated artifact per P1 scope law; evidence-only unless individual file directly owns UI-specific governance policy. |
| wiki_generated_diagrams_adapter_topology_mmd                                                                       | wiki/generated/diagrams/adapter-topology.mmd                                                                        | generated               | Non-UI generated artifact per P1 scope law; evidence-only unless individual file directly owns UI-specific governance policy. |
| wiki_generated_diagrams_governance_topology_mmd                                                                    | wiki/generated/diagrams/governance-topology.mmd                                                                     | generated               | Non-UI generated artifact per P1 scope law; evidence-only unless individual file directly owns UI-specific governance policy. |
| wiki_generated_diagrams_runtime_topology_mmd                                                                       | wiki/generated/diagrams/runtime-topology.mmd                                                                        | generated               | Non-UI generated artifact per P1 scope law; evidence-only unless individual file directly owns UI-specific governance policy. |
| wiki_generated_governance_report_md                                                                                | wiki/generated/governance-report.md                                                                                 | generated               | Non-UI generated artifact per P1 scope law; evidence-only unless individual file directly owns UI-specific governance policy. |
| wiki_generated_graphs_dependency_graph_json                                                                        | wiki/generated/graphs/dependency-graph.json                                                                         | generated               | Non-UI generated artifact per P1 scope law; evidence-only unless individual file directly owns UI-specific governance policy. |
| wiki_generated_graphs_environment_dependency_graph_mmd                                                             | wiki/generated/graphs/environment-dependency-graph.mmd                                                              | generated               | Non-UI generated artifact per P1 scope law; evidence-only unless individual file directly owns UI-specific governance policy. |
| wiki_generated_graphs_package_dependency_graph_mmd                                                                 | wiki/generated/graphs/package-dependency-graph.mmd                                                                  | generated               | Non-UI generated artifact per P1 scope law; evidence-only unless individual file directly owns UI-specific governance policy. |
| wiki_generated_graphs_package_ownership_graph_mmd                                                                  | wiki/generated/graphs/package-ownership-graph.mmd                                                                   | generated               | Non-UI generated artifact per P1 scope law; evidence-only unless individual file directly owns UI-specific governance policy. |
| wiki_generated_graphs_README_md                                                                                    | wiki/generated/graphs/README.md                                                                                     | generated               | Non-UI generated artifact per P1 scope law; evidence-only unless individual file directly owns UI-specific governance policy. |
| wiki_generated_graphs_runtime_boundary_graph_mmd                                                                   | wiki/generated/graphs/runtime-boundary-graph.mmd                                                                    | generated               | Non-UI generated artifact per P1 scope law; evidence-only unless individual file directly owns UI-specific governance policy. |
| wiki_generated_graphs_runtime_execution_graph_mmd                                                                  | wiki/generated/graphs/runtime-execution-graph.mmd                                                                   | generated               | Non-UI generated artifact per P1 scope law; evidence-only unless individual file directly owns UI-specific governance policy. |
| wiki_generated_graphs_turbo_task_graph_mmd                                                                         | wiki/generated/graphs/turbo-task-graph.mmd                                                                          | generated               | Non-UI generated artifact per P1 scope law; evidence-only unless individual file directly owns UI-specific governance policy. |
| wiki_generated_graphs_workspace_graph_mmd                                                                          | wiki/generated/graphs/workspace-graph.mmd                                                                           | generated               | Non-UI generated artifact per P1 scope law; evidence-only unless individual file directly owns UI-specific governance policy. |
| wiki_generated_low_confidence_pages_md                                                                             | wiki/generated/low-confidence-pages.md                                                                              | generated               | Non-UI generated artifact per P1 scope law; evidence-only unless individual file directly owns UI-specific governance policy. |
| wiki_generated_missing_frontmatter_md                                                                              | wiki/generated/missing-frontmatter.md                                                                               | generated               | Non-UI generated artifact per P1 scope law; evidence-only unless individual file directly owns UI-specific governance policy. |
| wiki_generated_orphan_pages_md                                                                                     | wiki/generated/orphan-pages.md                                                                                      | generated               | Non-UI generated artifact per P1 scope law; evidence-only unless individual file directly owns UI-specific governance policy. |
| wiki_generated_sbom_json                                                                                           | wiki/generated/sbom.json                                                                                            | generated               | Non-UI generated artifact per P1 scope law; evidence-only unless individual file directly owns UI-specific governance policy. |
| wiki_generated_source_coverage_md                                                                                  | wiki/generated/source-coverage.md                                                                                   | generated               | Non-UI generated artifact per P1 scope law; evidence-only unless individual file directly owns UI-specific governance policy. |
| wiki_generated_wiki_validation_summary_md                                                                          | wiki/generated/wiki-validation-summary.md                                                                           | generated               | Non-UI generated artifact per P1 scope law; evidence-only unless individual file directly owns UI-specific governance policy. |
