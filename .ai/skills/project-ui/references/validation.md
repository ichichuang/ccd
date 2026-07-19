# UI Validation

UI validation governs the current human-executable review sequence, completed P3 machine-policy checks, preserved P4 cold-start contract, terminal P5 routing and synchronization contract, and active P6 strict source-enforcement ratchet. Page Contract validation remains absent.

## Validation Scope

This procedure validates project-ui governance, completed P3 machine-policy artifacts, terminal routing, isolated synchronization, adapter activation, the canonical P5 source-debt baseline, the strict source ratchet, and human UI work. `.ai/skills/project-ui` is the canonical repository source; Codex and Claude copies are noncanonical materializations and must be checked only through isolated targets.

## Architecture Preflight

This section requires agents to apply architecture preflight rules with explicit ownership, current monorepo evidence, accessibility-safe behavior, token-driven styling, and validation before reporting completion.

## Skill Reference Selection

This section requires agents to apply skill reference selection rules with explicit ownership, current monorepo evidence, accessibility-safe behavior, token-driven styling, and validation before reporting completion.

## Token Audit

This section requires agents to apply token audit rules with explicit ownership, current monorepo evidence, accessibility-safe behavior, token-driven styling, and validation before reporting completion.

## Component Ownership Audit

This section requires agents to apply component ownership audit rules with explicit ownership, current monorepo evidence, accessibility-safe behavior, token-driven styling, and validation before reporting completion.

## Layout and Scroll Audit

This section requires agents to apply layout and scroll audit rules with explicit ownership, current monorepo evidence, accessibility-safe behavior, token-driven styling, and validation before reporting completion.

## Responsive Audit

This section requires agents to apply responsive audit rules with explicit ownership, current monorepo evidence, accessibility-safe behavior, token-driven styling, and validation before reporting completion.

## State Matrix Review

This section requires agents to apply state matrix review rules with explicit ownership, current monorepo evidence, accessibility-safe behavior, token-driven styling, and validation before reporting completion.

## Keyboard and Focus Review

This section requires agents to apply keyboard and focus review rules with explicit ownership, current monorepo evidence, accessibility-safe behavior, token-driven styling, and validation before reporting completion.

## Reduced-Motion Review

This section requires agents to apply reduced-motion review rules with explicit ownership, current monorepo evidence, accessibility-safe behavior, token-driven styling, and validation before reporting completion.

## Light and Dark Review

This section requires agents to apply light and dark review rules with explicit ownership, current monorepo evidence, accessibility-safe behavior, token-driven styling, and validation before reporting completion.

## Visual Regression Review

This section requires agents to apply visual regression review rules with explicit ownership, current monorepo evidence, accessibility-safe behavior, token-driven styling, and validation before reporting completion.

## Runtime Behavior Preservation Review

This section requires agents to apply runtime behavior preservation review rules with explicit ownership, current monorepo evidence, accessibility-safe behavior, token-driven styling, and validation before reporting completion.

## Final Diff Review

This section requires agents to apply final diff review rules with explicit ownership, current monorepo evidence, accessibility-safe behavior, token-driven styling, and validation before reporting completion.

## P2 Human Validation

Current P2 validation is human-executable and deterministic. It may include semantic-quality scripts, Prettier checks, governance checks, and manual UI review.

## P3 Machine Policy Boundary

P3 Machine UI Policy implementation is complete at `.ai/governance/policies/ui.json` and is validated by `node .ai/governance/ui/scripts/validate-ui-policy.mjs`. P6 source enforcement is independently validated by `pnpm ui:source:validate` against `.ai/governance/ui/source-baseline.json`; policy or semantic-quality validation alone does not prove ratchet compliance.

## P4 Cold-Start Validation Boundary

P4 AI cold-start validation is owned by `scripts/governance/cold-start-validate.mjs`, `scripts/generate-ai-protocol-adapters.mjs --check`, and isolated client preflights. Fresh-clone AI entrypoints remain available before sync through tracked `AGENTS.md`, `CLAUDE.md`, `.ai/protocol/adapters/claude.md`, and generated protocol outputs. P5 extends this boundary with project-ui routing and materialization; it does not replace the P4 contract.

## P5 Terminal Validation

Run policy and semantic checks with `pnpm ui:policy:validate` and `node .ai/skills/project-ui/scripts/validate-semantic-quality.mjs`. Validate phase selection and routing with `pnpm ai:cold-start:validate`, `pnpm ai:routing:validate`, and the routing validator self-test. Validate the rule index and generated adapters with `pnpm ai:rule-index:check` and `pnpm ai:protocol-adapters:check`.

Synchronization acceptance must use temporary isolated targets. Run `pnpm ai:sync:codex:check -- --target-root <temporary-root>/codex/skills`, `pnpm ai:sync:claude:check -- --project-root <temporary-root>/claude-project`, and the combined `pnpm ai:sync:skills:check` form with both isolated roots. The canonical source and Skills lock must remain current, repeated combined synchronization must be byte-identical, and real client targets must remain untouched.

## P6 Terminal Source Validation

Run `pnpm ui:source:validate`, the scanner and standalone validator self-tests, and `node .ai/governance/ui/scripts/scan-ui-source.mjs --ref f8acb7fbbfef0c681affb74e08336ec8bc72bca0 --check-baseline --format json`. The canonical baseline contains 393 accepted historical findings across 554 governed P5 files. Those findings are debt inventory, not proof of compliance; new fingerprints, count increases, moved debt, stale entries, removed files, and unapproved count decreases are rejected.

## Lifecycle State

```text
P3_COMPLETE=yes
MACHINE_UI_POLICY_COMPLETE=yes
MACHINE_UI_POLICY_PRESENT=yes
POLICY_SCHEMAS_PRESENT=yes
PRODUCT_UI_PROFILE_PRESENT=yes
EXCEPTION_REGISTRY_PRESENT=yes
EXCEPTION_COUNT=0
POLICY_FIXTURES_PRESENT=yes
POLICY_VALIDATOR_PRESENT=yes
P4_STARTED=yes
P4_COMPLETE=yes
COLD_START_ATOMIC_REPLACEMENT_COMPLETE=yes
AGENTS_TRACKED=yes
CLAUDE_TRACKED=yes
CLAUDE_ADAPTER_TRACKED=yes
ADAPTER_MANIFEST_COLD_START_COMPLETE=yes
ADAPTER_GENERATION_DETERMINISTIC=yes
AI_SYNC_IDEMPOTENT=yes
FRESH_CLONE_ENTRYPOINTS_PASS=yes
P5_STARTED=yes
P5_COMPLETE=yes
PROJECT_UI_DISCOVERED=yes
PROJECT_UI_ROUTED=yes
PROJECT_UI_SYNCHRONIZED=yes
PROJECT_UI_ADAPTER_ACTIVATED=yes
PROJECT_UI_LOCKED=yes
PROJECT_UI_CODEX_SYNC_CONTRACT_COMPLETE=yes
PROJECT_UI_CLAUDE_SYNC_CONTRACT_COMPLETE=yes
SKILL_ROUTING_MANIFEST_CURRENT=yes
ROUTING_SCOPE_REGISTRY_COMPLETE=yes
SKILLS_LOCK_CURRENT=yes
RULE_INDEX_CURRENT=yes
NODE_PYTHON_ROUTER_PARITY=yes
GENERIC_UI_ROUTES_TO_PROJECT_UI=yes
MOTION_ROUTING_CONDITIONAL=yes
NON_UI_ROUTING_PRESERVED=yes
ADAPTER_PROJECT_UI_MAPPING_COMPLETE=yes
CODEX_ADAPTER_PROJECT_UI_ACTIVE=yes
CLAUDE_ADAPTER_PROJECT_UI_ACTIVE=yes
SOURCE_SCANNER_IMPLEMENTED=yes
PAGE_CONTRACT_CREATED=no
LEGACY_SKILLS_RETIRED=no
LEGACY_RULES_RETIRED=no
SOURCE_ENFORCEMENT_ACTIVE=yes
```

## Page Contract Validation Boundary

Page Contract validation belongs to a later page-contract phase. Current archetypes remain planning guidance only.

## P5 Routing Validation Boundary

P5 routing validation is active. Node is the primary router, Python is the fallback parity implementation, generic UI routes to project-ui, non-UI work remains isolated, and motion Skills activate only from explicit engine evidence.

## Current Governance Gate Orchestration

`scripts/governance/gate.mjs` invokes `pnpm ui:source:validate` exactly once. The standalone validator owns both preterminal and terminal scanner-state validation. No other Gate, AI Doctor, preflight, cold-start, or routing scanner invocation is permitted. Isolated Codex and Claude targets are the acceptance boundary; real client materializations are noncanonical and remain untouched.
