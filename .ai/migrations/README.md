# Protocol migrations

This directory stores deterministic protocol migrations keyed by semantic version.

Current policy:

- additive migrations only unless explicitly approved
- migration scripts must be idempotent
- protocol compatibility checks fail before incompatible adapters execute
