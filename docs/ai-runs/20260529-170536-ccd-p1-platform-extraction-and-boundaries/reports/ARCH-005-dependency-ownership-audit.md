# ARCH-005 Dependency Ownership Audit

Status: DONE

Boundary:
- Audited ownership for dependencies newly required by extracted package code.
- Added package-local runtime dependencies where actual code consumes them.
- Updated `.ai/governance/policies/supply-chain.json` allowlist after `supply:check` identified new package ownership entries.
- Did not upgrade dependency versions.

Validation:
- PASS `pnpm why @vitejs/plugin-vue-jsx @vueuse/core @tanstack/vue-virtual @ccd/design-tokens @ccd/vue-app-platform --recursive`
- PASS `pnpm install --lockfile-only`
- PASS `pnpm supply:check`
- PASS `pnpm governance:gate`

Evidence:
- `command-logs/ARCH-005-20260529-181838-pnpm-why-focused.log`
- `command-logs/GOV-004-*-pnpm-install-lockfile-only.log`
- `command-logs/GOV-004-*-governance-refresh-rerun.log`
- `command-logs/GOV-004-*-governance-gate-final-rerun.log`

Residual risk:
- Root `package.json` still contains historical runtime/frontend dependencies; broad root dependency decommission remains out of this P1 scope without a dedicated approval lane.
