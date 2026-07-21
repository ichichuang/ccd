# Platform UI Invariants

- Visual constants come from registered tokens, CSS variables, theme presets, or semantic shortcuts.
- Structural CSS owns layout only; it must not smuggle local product styling.
- Prefer CCD UI packages and PrimeVue adapters over parallel component systems.
- Every page and region has one explicit scroll owner.
- Dialogs, drawers, popovers, and menus preserve focus, keyboard, and pointer behavior.
- Light, dark, loading, empty, error, disabled, success, selected, and focus states remain complete.
- Responsive transformations preserve reading order, action priority, and accessibility.
- Motion clarifies cause and state and respects reduced-motion preferences.
- UI-only work preserves routing, data, storage, security, and runtime boundaries.
- Reuse `packages/design-tokens`, `packages/vue-ui`, and `packages/vue-primevue-adapter` before adding abstractions.
