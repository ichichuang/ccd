# Desktop Source Boundary

`apps/desktop/src` owns the dedicated Tauri desktop frontend entry for CCD.

This app may reuse governed workspace packages such as `@ccd/contracts`, `@ccd/core`,
`@ccd/vue-ui`, `@ccd/vue-primevue-adapter`, and `@ccd/vue-app-platform`, but it is
not a copy of `apps/web-demo/src` and must not import browser-app routes, stores,
views, plugins, or app adapters from `apps/web-demo`.

Desktop runtime capabilities belong in `apps/desktop/src/adapters/**` and the
backend boundary belongs in `apps/desktop/src-tauri/**`.
