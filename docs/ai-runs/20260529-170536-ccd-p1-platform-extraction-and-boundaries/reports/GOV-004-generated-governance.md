# GOV-004 Generated Governance Discipline

Status: DONE

Boundary:
- Refreshed generated governance artifacts only through official commands.
- Updated supply-chain policy to register package-local runtime dependency ownership introduced by extraction.
- Re-ran gate after generated sync protection wrote API/SBOM outputs.

Validation:
- PASS `pnpm governance:refresh`
- PASS `pnpm governance:gate`

Evidence:
- `command-logs/GOV-004-*-governance-refresh-rerun.log`
- `command-logs/GOV-004-*-governance-gate-final-rerun.log`

Residual risk:
- None known.
