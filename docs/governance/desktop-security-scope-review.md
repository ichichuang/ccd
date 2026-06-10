# Desktop Security Scope Review

Review date: 2026-06-10.

Scope:

- `apps/desktop/src-tauri/capabilities/default.json`
- `apps/desktop/src-tauri/security-scopes.json`
- `apps/desktop/src-tauri/tauri.conf.json`
- `apps/desktop/src-tauri/Cargo.toml`
- `apps/desktop/src-tauri/src/main.rs`
- `apps/desktop/src/adapters/index.ts`
- `scripts/architecture/desktop-security-rules.mjs`

## Findings

The current desktop security baseline remains least-privilege.

`capabilities/default.json` defines one local `default` capability for the `main` window and has an empty `permissions` array. No Tauri core or plugin permission is granted by default.

`security-scopes.json` sets `defaultDecision` to `deny`. The documented CSP policy allows only bundled app assets plus Tauri IPC bridge sources, denies base URL injection, form posts, frames, object/embed content, inline script, eval, and inline style. The pre-enable checklist requires a concrete desktop use case, plugin dependency, explicit allow/deny scopes, desktop security validation, and a Tauri build before any capability is enabled.

Every planned sensitive surface is disabled with `allow: []` and `deny: ["*"]`:

- filesystem
- shell
- dialog
- clipboard
- updater
- opener
- notification
- http
- external-navigation

`tauri.conf.json` matches the documented CSP policy, keeps `assetProtocol.enable` false with an empty scope, defines one explicit `main` window, disables fullscreen and devtools by default, and keeps window decorations enabled. No updater, deep-link, external-navigation, asset-protocol, shell, filesystem, HTTP, opener, notification, or clipboard capability is enabled.

`Cargo.toml` depends only on `tauri` and `tauri-build` with empty feature arrays. There are no `tauri-plugin-*` crates. `src/main.rs` builds and runs the default Tauri app without registering Rust command handlers.

`apps/desktop/src/adapters/index.ts` is the only current desktop frontend adapter using `@tauri-apps/api/core` `invoke()`. It validates frontend payloads before invoking typed IPC command names from `@ccd/contracts`. Because no Rust command handlers or Tauri permissions are currently registered, these remain contract-first frontend adapter surfaces, not enabled OS capabilities.

## Guard Coverage

`scripts/architecture/desktop-security-rules.mjs` enforces:

- CSP existence and approved source lists.
- CSP documentation parity between `tauri.conf.json` and `security-scopes.json`.
- deny-by-default scope policy for all required surfaces.
- capability locality, default capability presence, and no broad `core:default` permission.
- plugin permission use only after a scoped enabled policy exists.
- explicit window defaults, no default fullscreen, and production devtools disabled.
- disabled asset protocol and denied external navigation.
- JS/Rust plugin dependency checks against the scope policy.

## Deferred Guardrails

The P4 desktop guardrails remain open:

- Rust command handlers must only be added through audited typed IPC boundaries when real backend capabilities are introduced.
- New Rust-side IPC commands must use structured errors.
- Updater and deep-link runtime remain blocked until a desktop trust model is approved.

## Validation

Relevant validation commands:

- `pnpm desktop:security`
- `pnpm desktop:smoke`
- `pnpm build:desktop`
- `cargo check --locked --manifest-path apps/desktop/src-tauri/Cargo.toml`
