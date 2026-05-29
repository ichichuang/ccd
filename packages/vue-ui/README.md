# @ccd/vue-ui

`@ccd/vue-ui` owns CCD-facing Vue UI components and wrappers.

## Public API policy

- Public exports must use CCD-owned component, prop, event, and utility names.
- PrimeVue, OverlayScrollbars, or other vendor components may be used internally when they are wrapped behind a CCD component boundary.
- Do not raw re-export vendor components or vendor runtime types from this package public entry.
- Type-only vendor exposure requires an explicit local policy note and must not force app code to import the vendor package.
- Apps should import reusable UI through `@ccd/vue-ui`; PrimeVue direct imports stay limited to adapter/bootstrap/showcase exceptions approved by architecture policy.

`CcdPrimeControls` is a transitional wrapper set for audited layout and desktop shell usage. It forwards attrs and slots to PrimeVue internally while keeping the exported component identities CCD-owned. During this transition the wrappers retain type-only compatibility with the underlying PrimeVue prop surface so existing app call sites compile while importing only `Ccd*` names from `@ccd/vue-ui`.
