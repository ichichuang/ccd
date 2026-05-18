# runtime-portable

Portable runtime composition boundary.

This runtime must be built from `@ccd/core` plus portable-owned state only. It must not rely on host-global Codex, config, Node, pnpm, provider, or cache state as its source of truth.

Required topology:

- `portable/runtime`
- `portable/providers`
- `portable/cache`
- `portable/adapters`
- `portable/fingerprints`
- `portable/governance`
- `portable/binaries`
- `portable/workspace`

Standards: offline-capable, migratable, reproducible, isolated, auditable.
