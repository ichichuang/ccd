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

Current enforcement is human governance plus deterministic semantic-quality checks. P3 Machine UI Policy does not exist, and this reference must not imply machine enforcement until P3 creates it.
