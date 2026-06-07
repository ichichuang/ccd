# Web Demo Source Boundary

`apps/web-demo/src` owns the browser `web-demo` application shell for CCD.

This app owns browser routes, stores, views, app-level plugin wiring, HTTP/browser
adapters, compatibility facades, and the governed `/example/**` route surface. It
may reuse governed workspace packages, but it must not import desktop runtime code
from `apps/desktop/src` or Tauri backend code from `apps/desktop/src-tauri`.

Shared or reusable monorepo capabilities belong in governed `packages/*` exports,
not in cross-app imports between `apps/web-demo` and `apps/desktop`.
