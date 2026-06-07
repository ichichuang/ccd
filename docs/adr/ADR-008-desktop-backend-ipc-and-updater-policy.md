# ADR-008: Desktop Backend IPC and Updater Policy

## Status

Accepted.

## Context

`apps/desktop` is the Tauri v2 runtime shell. Current desktop work validates the shell, security defaults, frontend adapters, and build path. Future backend commands, updater support, and deep links need explicit security review before they are added.

## Decision

Rust command handlers are added only when a real backend capability is introduced and the command is covered by an audited typed boundary:

- Define the frontend contract first in `packages/contracts` when the capability crosses runtime boundaries.
- Keep all frontend `invoke()` usage inside `apps/desktop/src/adapters/**`.
- Validate frontend payloads before invoking backend commands.
- Register Rust commands only in `apps/desktop/src-tauri/src/**`.
- Return structured Rust-side errors instead of string-only IPC errors for new commands.
- Document command permissions, capability scope, and rollback before exposing the command.

Updater and deep-link configuration stays disabled unless a future task supplies a security model covering trusted update source, signature validation, allowed URL schemes, downgrade behavior, and failure handling.

## Consequences

- The desktop shell can remain minimal until backend functionality is required.
- New IPC work has a contract-first path and does not scatter Tauri APIs through UI code.
- Security-sensitive updater and deep-link features do not appear as incidental configuration drift.

## Rejected Alternatives

- Add placeholder Rust commands without a frontend contract and validation path.
- Return unstructured strings as the only backend error shape for new IPC commands.
- Enable updater or deep links without a written trust and threat model.

## Validation

- `pnpm desktop:security`
- `pnpm --filter @ccd/desktop type-check`
- `pnpm build:desktop`
- `pnpm governance:gate`
