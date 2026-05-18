# Core Branch Policy

CCD branch policy keeps one shared core governance system with two runtime lanes:

- `main` is the default core branch and shared governance baseline.
- `desktop-version` is the only active desktop runtime lane.
- `main-portable-version` is the only active portable runtime lane.
- No other local or remote branches are governance sources.

## Current Model

```text
main
  -> shared governance and Web runtime baseline
  -> desktop-version composition
  -> main-portable-version composition
```

## Product Line Matrix

| Branch                  | Runtime Role       | Purpose                                                                  | Stability                 |
| ----------------------- | ------------------ | ------------------------------------------------------------------------ | ------------------------- |
| `main`                  | Core + Web runtime | Shared governance, architecture, docs, and browser-first product runtime | Stable protected baseline |
| `desktop-version`       | Desktop runtime    | Tauri v2 shell, IPC, native capabilities, updater, desktop transport     | Active runtime lane       |
| `main-portable-version` | Portable runtime   | Clean portable scaffold with isolated provider/cache/governance state    | Active template lane      |

## Strict Minimal Branch Policy

Keep only the default core branch plus active runtime lanes:

- `main`
- `desktop-version`
- `main-portable-version`

Do not recreate retired experiment branches or use them as merge baselines. Branch-specific work must either land on its owning runtime lane or be promoted into `main` only when it is runtime-neutral core policy.

## Core-First Rule

Runtime-neutral contracts land in core first; runtime branches compose those contracts.

Allowed on `main`:

- shared `.ai/**` governance
- shared docs and governance scripts
- Web runtime/app composition
- contracts used by desktop and portable runtimes

Not allowed on `main`:

- direct Tauri shell logic
- portable host-state assumptions
- branch-specific governance forks
- demo code masquerading as core runtime policy

## Cleanup Policy

- Keep documentation and governance aligned to the three active branches only.
- Remove references to inactive branches unless they are explicitly marked historical.
- Prefer shared core contracts over branch-local policy duplication.

## Runtime Lane Rules

### `desktop-version`

Owns Tauri adapters, native filesystem/shell bridges, desktop IPC, updater metadata, and desktop capability drift checks.

### `main-portable-version`

Owns host-independent portable runtime topology, portable provider state, portable cache/governance/fingerprint state, and demo/business cleanup.

## Related Documents

- [Runtime Isolation](../runtime/runtime-isolation.md)
- [Desktop Runtime](../runtime/desktop-runtime.md)
- [Portable Runtime](../runtime/portable-runtime.md)
