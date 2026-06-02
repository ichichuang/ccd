# ROLLBACK

## Code rollback

Use normal git revert of the specific lane commit. Do not reset or clean without approval.

## Generated output rollback

Re-run the owning generator after reverting source. Verify with `pnpm validate:governance`.

## Documentation rollback

Revert only the affected docs/evidence commit if it contains incorrect facts.

## Validation after rollback

Run the same validation used by the reverted lane plus `git diff --check` and `pnpm docs:commands`.
