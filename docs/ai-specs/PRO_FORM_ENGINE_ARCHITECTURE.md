## ProForm Engine Architecture (V1.0)

This document targets **ProForm maintainers**. It describes the shipped V1.0 architecture (Phases 200-209): the key decisions, constraints, and boundaries.
It is not a future roadmap; it is a description of the **implemented system**.

### 1) Boundary: Headless Engine vs Renderer (Non-negotiable)

- `src/components/ProForm/engine/**`: headless engine core. Must not depend on PrimeVue/DOM.
- `src/components/ProForm/renderers/**`: renderer adapter layer (PrimeVue). UI dependencies are allowed here, but it must not leak into the engine core.

### 2) Context Architecture: `constants.ts` + `useFormContext<TValues>()`

Vue `provide/inject` cannot carry generic information at runtime, so `FormController<TValues>` will suffer generic erasure across the component tree.

V1.0 uses a context design where **keys provide identity only, and types are recovered at the access point**:

- `src/components/ProForm/engine/constants.ts` provides the only identity channel:
  - `FORM_CONTROLLER_KEY: InjectionKey<unknown>`
- `src/components/ProForm/engine/hooks/useFormContext.ts` is the only allowed entry to recover the strong type:
  - `useFormContext<TValues>(): FormController<TValues>`
  - This centralization prevents scattered `inject(...) as ...` assertions.

Conclusion: `InjectionKey<unknown>` is an intentional architectural choice to resist generic erasure, not a legacy defect.
View-layer code must obtain the strongly typed controller only via `useFormContext<TValues>()`.

### 3) SSOT Design: `engine/config.ts` as the single source of truth

`src/components/ProForm/engine/config.ts` centralizes and exports all defaults/fallbacks:

- `PRO_FORM_LAYOUT_DEFAULTS`: e.g. `gridSpan`, `responsiveFallbackWidth`
- `PRO_FORM_TIMING_DEFAULTS`: e.g. `validationDebounceMs`, `asyncOptionsDebounceMs`, `autoSaveDebounceMs`
- `PRO_FORM_COMPONENT_DEFAULTS`: e.g. `emptyTextFallback`, `sliderDefaultRange`
- `PRO_FORM_TEXT_DEFAULTS`: i18n keys only (e.g. `booleanTrueKey`/`booleanFalseKey`, `tabPrefixKey`, etc.)

V1.0 hard constraints:

- No hardcoded magic numbers in schema/renderer/view (span, debounce, fallback width, etc.)
- No fixed-language fallback strings (e.g. 'yes'/'no')
- No hardcoded currency/locale tokens (e.g. 'CNY')

Rationale: defaults must be traceable and centrally tunable (SSOT). Localization is decided by i18n and browser-native Intl at runtime, not by static strings.

### 4) Lifecycle: `teardown()` is owned by `useForm.ts` and `FormController.ts`

V1.0 pulls creation/teardown ownership back into the engine layer:

- `useForm.ts` binds form instance lifecycle (initialization, unmount cleanup)
- `FormController.ts` ensures `teardown()` idempotency and resource cleanup (subscriptions, async queues, draft persistence, validation jobs, etc.)

View-layer rules:

- Do not manually assemble or invoke custom teardown flows.
- Do not maintain a parallel state machine in views (values/errors/submitting/validation debounce) to replace the engine.

### 5) Maintainer Checklist (Regression guardrail)

- Adding any default/fallback? → Put it in `engine/config.ts` and import it at the usage site.
- Adding any context dependency? → Use InjectionKeys from `engine/constants.ts`; access must go through `useFormContext<TValues>()`.
- Need to emit errors/warnings? → Use `PRO_FORM_LOGGER` from `engine/utils/logger.ts` (the usage site may alias it to `ProFormLogger`).
