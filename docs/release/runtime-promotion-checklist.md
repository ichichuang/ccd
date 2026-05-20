# Runtime Promotion Checklist

- [ ] `pnpm runtime:summary` records Node, pnpm, Turbo, mise, workspace root, and fingerprint.
- [ ] `pnpm validate:release` passes.
- [ ] `pnpm arch:runtime` confirms root remains non-runtime and no removed runtime archive is recreated.
- [ ] `pnpm arch:graphs` regenerates deterministic graph outputs.
- [ ] `pnpm api:report` confirms public API compatibility.
- [ ] `pnpm supply:check` passes.
- [ ] Release artifact originates only from `apps/web-demo/dist`.
- [ ] Root remains orchestration-only.
- [ ] No workspace, CI, package, or generated report references a removed runtime archive directory.
- [ ] Rollback target and artifact checksum are recorded in `docs/generated/release/release-audit-report.json`.
