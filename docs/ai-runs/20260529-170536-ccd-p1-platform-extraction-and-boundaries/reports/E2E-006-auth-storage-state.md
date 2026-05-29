# E2E-006 Authenticated Storage State

Status: DONE

Boundary:
- Added `e2e/helpers/authState.ts` for the shared auth storageState path.
- Updated `e2e/global-setup.ts` to persist authenticated state after login.
- Updated selected authenticated specs to reuse the storageState instead of repeating login.

Validation:
- PASS `pnpm exec playwright test e2e/icons-explorer.spec.ts e2e/global-context-menu-theme-icon.spec.ts e2e/sidebar-route-sync.spec.ts --workers=2`

Evidence:
- `command-logs/E2E-006-*-targeted-auth-storage-state.log`

Residual risk:
- Auth-flow-specific login/logout coverage remains in existing login-oriented E2E specs; this lane only changed tests that require an already authenticated session.
