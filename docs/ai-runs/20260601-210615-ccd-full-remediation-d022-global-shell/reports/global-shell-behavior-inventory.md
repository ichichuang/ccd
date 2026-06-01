# Global Shell Behavior Inventory

## Preserved Surfaces

| Surface | Before | After |
| --- | --- | --- |
| Toast components | `Toast` direct import from `primevue/toast` | `PrimeVueGlobalToast` facade from `@ccd/vue-primevue-adapter` |
| Confirm popup | `ConfirmPopup` direct import | `PrimeVueGlobalConfirmPopup` facade |
| Dynamic dialog | `DynamicDialog` direct import | `PrimeVueGlobalDynamicDialog` facade |
| Toast service | `useToast()` direct call | `usePrimeVueToastService()` facade |
| PrimeVue runtime config | `usePrimeVue()` direct call | `usePrimeVueRuntimeConfig()` facade |
| Global APIs | direct assignment with `createPrimeVueToastApi()` / `createPrimeVueMessageApi()` | `mountPrimeVueGlobalMessageApis()` / `clearPrimeVueGlobalMessageApis()` |
| Toast cleanup | local `removeAllGroups` cast | `clearPrimeVueToastGroups()` |

## Runtime Smoke Evidence

- In-app browser smoke loaded `http://127.0.0.1:8088/`, rendered the login page, observed 6 Toast hosts, and reported 0 console errors.
- Browser plugin read-only evaluation did not expose page expando globals (`window.$toast` / `window.$message`); this was treated as a tool-sandbox limitation rather than product evidence.
- Main-world Playwright smoke loaded the same page and verified:
  - `hasToastApi: true`
  - `hasMessageApi: true`
  - `toastHostCount: 6`
  - `errors: []`

## Screenshots

- `browser-smoke.png`
- `playwright-smoke.png`
