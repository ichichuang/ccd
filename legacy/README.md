# Legacy Archive

`legacy/**` is a read-only historical archive of the pre-monorepo root application.

Rules:

- No active package, app, test, build, or governance script may import from `legacy/**`.
- No rollback or branch-lane assumptions should be restored from this archive.
- Any code revived from this archive must be copied into an active workspace package through a reviewed migration, then governed by current boundaries.
