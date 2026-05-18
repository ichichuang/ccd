# Runtime Isolation

CCD enforces runtime isolation across three product lines:

- `main` -> web runtime
- `desktop-version` -> desktop runtime
- `main-portable-version` -> portable runtime

## Isolation boundaries

### IPC boundaries

- Desktop IPC stays behind Tauri bridge helpers.
- Web runtime must not import or invoke native IPC contracts.

### Native capability boundaries

- Native shell capabilities belong only to desktop runtime surfaces.
- Shared abstractions must expose runtime-safe fallbacks.

### Filesystem access boundaries

- Filesystem access is desktop-only unless mediated by a portable adapter.
- Web runtime code must remain browser-deployable.

### Shared package constraints

- Shared packages must not depend on desktop-only modules.
- Runtime-specific dependencies must stay inside their product-line boundary.

### Command runtime isolation

- Repo commands must resolve `node` and `pnpm` as binaries in non-interactive shells.
- Shell function wrappers around `node` or `pnpm` are not allowed; command entrypoints must resolve binary bindings.
- Architecture and governance commands start with `pnpm env:doctor` to catch missing binaries, version drift, and orphan shell wrappers.
- Use `bash scripts/env.sh` to verify the project runtime without relying on interactive shell startup.
- Use `bash scripts/exec.sh <command>` when a command must run through the deterministic project runtime.
- `bash scripts/bootstrap-runtime.sh <command>` remains a compatibility alias for the same runtime path.
- Use `pnpm runtime:env:strict` or `pnpm env:doctor:strict-runtime` when you want to fail fast if `mise` is not available.
- Use `pnpm ai-os:doctor` for project-scoped governance plus an opt-in local machine layer.
- Use `pnpm ai-os:doctor:strict-local` only on this AI OS machine; CI must not depend on `/Users/cc/.ai-os`.
- Use `pnpm codex:execute:doctor` and `pnpm codex:transport:validate` before portable runtime isolation work.

Pinned runtime:

- `mise.toml` pins Node `26.1.0` and pnpm `10.28.2`.
- `scripts/env.sh` activates `mise`; no legacy Node version-file fallback is allowed.
- `mise` now owns the Node runtime source locally; pnpm continues to resolve from the existing pinned binary path until the package-manager lane is migrated.
- Machine-level runtime invariants live in `/Users/cc/AI-Research-OS/RUNTIME_FREEZE.md`.

### Runtime-safe abstraction rules

- Runtime checks and fallback behavior must live in a bridge or adapter layer.
- Business modules must consume runtime-safe abstractions, not raw runtime APIs.

## Validation

- `pnpm env:doctor`
- `pnpm runtime:env`
- `pnpm governance:validate`
- `pnpm arch:snapshot`
- `pnpm arch:visualize`
- `pnpm arch:check`
