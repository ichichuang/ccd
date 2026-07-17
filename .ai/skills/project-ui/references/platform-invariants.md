# Platform UI Invariants

These invariants govern every CCD product UI surface. Agents must apply them before product-profile preference, component convenience, or local visual taste, and validation must confirm that each changed surface preserves architecture, accessibility, tokens, scroll ownership, and runtime behavior.

## Scope

These invariants apply to CCD product UI in current apps and shared UI packages. They are permanent rules and outrank replaceable product profiles.

## Visual Constant Ownership

Business UI must not introduce unregistered visual constants. Colors, typography, radii, elevation, z-index, durations, easing, sizes, density, and breakpoints must come from registered tokens, CSS variables, resolvers, theme presets, or approved structural grammar.

## Allowed Structural CSS Grammar

Structural CSS may express containment, grid or flex topology, intrinsic sizing, overflow ownership, and viewport constraints. It must not smuggle product styling through arbitrary units, color literals, local shadows, or local animation constants.

## Token and Breakpoint Boundaries

Tokens and breakpoints are owned by the design-token package, theme engine, UnoCSS semantic shortcuts, and registered variables. Business UI consumes these contracts and must not redefine them locally.

## Component Boundary Integrity

Use approved CCD components, PrimeVue adapters, PrimeVue v4 components, or app-owned shared components according to priority. Do not bypass adapter contracts, auto-import boundaries, resolver behavior, or package ownership.

## Layout and Scroll Ownership

Every page must name its viewport root, regions, and scroll owner. Same-axis nested scrolling requires an explicit reason, and virtualized components must receive stable bounds.

## Overlay and Focus Ownership

Dialogs, drawers, popovers, and menus must isolate overlay backgrounds, trap focus while open, restore focus on close, and keep keyboard and pointer behavior equivalent.

## Theme and State Completeness

Light and dark themes must remain usable. Loading, empty, error, disabled, success, active, selected, and focus states must be complete for each changed surface.

## Accessibility and Input Equivalence

Keyboard access, visible focus, contrast, announcements, accessible names, non-color communication, pointer input, and touch input are mandatory. Responsive transformations must preserve reading order.

## Motion Safety

Motion must clarify cause and state. Decorative motion must not compensate for broken layout, missing hierarchy, low contrast, unclear feedback, or absent reduced-motion behavior.

## Runtime Behavior Preservation

UI-only work must preserve business behavior, routing behavior, HTTP behavior, storage behavior, security behavior, and runtime package boundaries. If runtime behavior changes, the work is no longer UI-only.

## Existing Foundation Reuse

Reuse current foundations before new code: packages/design-tokens, packages/vue-ui, packages/vue-primevue-adapter, PrimeVue v4 through approved boundaries, app route/view owners, and current AppContainer evidence.

## Human and Future Machine Enforcement Boundary

P3 Machine UI Policy implementation is complete at `.ai/governance/policies/ui.json`, with deterministic policy and semantic-quality validation. The source scanner is not implemented, so application-source enforcement remains baseline-only. This reference must not imply active machine source-scanning enforcement.

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
SOURCE_SCANNER_IMPLEMENTED=no
PAGE_CONTRACT_CREATED=no
LEGACY_SKILLS_RETIRED=no
LEGACY_RULES_RETIRED=no
```
