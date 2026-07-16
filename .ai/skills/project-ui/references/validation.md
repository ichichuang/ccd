# UI Validation

UI validation governs the current human-executable review sequence and the completed P3 machine-policy artifact checks. Agents must separate these checks from absent application-source scanning, future Page Contract validation, P5 routing validation, and later UI-gate orchestration.

## Validation Scope

This procedure validates project-ui governance, the completed P3 machine-policy artifacts, and human UI work. It separates current policy validation from absent source scanning, page contracts, routing validation, and later UI-gate orchestration.

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

P3 Machine UI Policy implementation is complete at `.ai/governance/policies/ui.json` and is validated by `node .ai/governance/ui/scripts/validate-ui-policy.mjs`. The source scanner is not implemented, so application-source enforcement remains baseline-only. Do not claim source-scanning enforcement from policy or semantic-quality validation.

## P4 Cold-Start Validation Boundary

P4 AI cold-start validation is owned by `scripts/governance/cold-start-validate.mjs`, `scripts/generate-ai-protocol-adapters.mjs --check`, and `pnpm codex:preflight`. Fresh-clone AI entrypoints are available before sync through tracked `AGENTS.md`, `CLAUDE.md`, `.ai/protocol/adapters/claude.md`, and generated protocol outputs; this does not discover, route, synchronize, or adapter-activate project-ui.

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
SOURCE_SCANNER_IMPLEMENTED=no
PAGE_CONTRACT_CREATED=no
PROJECT_UI_DISCOVERED=no
PROJECT_UI_ROUTED=no
PROJECT_UI_SYNCHRONIZED=no
PROJECT_UI_ADAPTER_ACTIVATED=no
P5_STARTED=no
```

## Page Contract Validation Boundary

Future Page Contract validation belongs to the page-contract phase. Current archetypes are planning guidance only.

## P5 Routing Validation Boundary

Future routing validation belongs to P5. Current project-ui remains undiscovered, unrouted, and unsynchronized.

## Later UI Gate Orchestration

A later UI gate may orchestrate these checks after the owning phase creates it. Do not create it in a UI-governance correction.
