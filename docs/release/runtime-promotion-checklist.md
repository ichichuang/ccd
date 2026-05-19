# Runtime Promotion Checklist

- [ ] `pnpm runtime:summary` records Node, pnpm, Turbo, mise, workspace root, and fingerprint.
- [ ] `pnpm validate:release` passes.
- [ ] `pnpm arch:runtime` confirms root and legacy remain non-runtime.
- [ ] `pnpm arch:graphs` regenerates deterministic graph outputs.
- [ ] `pnpm api:report` confirms public API compatibility.
- [ ] `pnpm supply:check` passes.
- [ ] Release artifact originates only from `apps/web-demo/dist`.
- [ ] Root remains orchestration-only.
- [ ] `legacy/root-app` remains archive-only and outside workspace, CI, and package references.
- [ ] Rollback target and artifact checksum are recorded in `docs/generated/release/release-audit-report.json`.
