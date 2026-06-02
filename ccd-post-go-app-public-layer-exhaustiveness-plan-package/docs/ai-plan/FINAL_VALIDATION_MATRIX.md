# FINAL VALIDATION MATRIX

| Command                          | Required | Result | Evidence                                                                                                                               |
| -------------------------------- | -------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| git diff --check                 | yes      | PASS   | `docs/ai-runs/20260602-110559-ccd-post-go-app-public-layer-m8-final-validation/command-logs/git-diff-check.log`                        |
| pnpm docs:commands               | yes      | PASS   | `docs/ai-runs/20260602-110559-ccd-post-go-app-public-layer-m8-final-validation/command-logs/pnpm-docs-commands.log`                    |
| pnpm project:doctor              | yes      | PASS   | `docs/ai-runs/20260602-110559-ccd-post-go-app-public-layer-m8-final-validation/command-logs/pnpm-project-doctor.log`                   |
| pnpm ai:doctor                   | yes      | PASS   | `docs/ai-runs/20260602-110559-ccd-post-go-app-public-layer-m8-final-validation/command-logs/pnpm-ai-doctor.log`                        |
| pnpm ai:doctor --open            | yes      | PASS   | `docs/ai-runs/20260602-110559-ccd-post-go-app-public-layer-m8-final-validation/command-logs/pnpm-ai-doctor-open.log`                   |
| pnpm codex:preflight             | yes      | PASS   | `docs/ai-runs/20260602-110559-ccd-post-go-app-public-layer-m8-final-validation/command-logs/pnpm-codex-preflight.log`                  |
| pnpm ci:prepare-internal         | yes      | PASS   | `docs/ai-runs/20260602-110559-ccd-post-go-app-public-layer-m8-final-validation/command-logs/pnpm-ci-prepare-internal.log`              |
| pnpm ci:smoke:packages           | yes      | PASS   | `docs/ai-runs/20260602-110559-ccd-post-go-app-public-layer-m8-final-validation/command-logs/pnpm-ci-smoke-packages.log`                |
| pnpm arch:runtime                | yes      | PASS   | `docs/ai-runs/20260602-110559-ccd-post-go-app-public-layer-m8-final-validation/command-logs/pnpm-arch-runtime.log`                     |
| pnpm arch:boundaries             | yes      | PASS   | `docs/ai-runs/20260602-110559-ccd-post-go-app-public-layer-m8-final-validation/command-logs/pnpm-arch-boundaries.log`                  |
| pnpm api:report                  | yes      | PASS   | `docs/ai-runs/20260602-110559-ccd-post-go-app-public-layer-m8-final-validation/command-logs/pnpm-api-report.log`                       |
| pnpm ai:guard -- --format=json   | yes      | PASS   | `docs/ai-runs/20260602-110559-ccd-post-go-app-public-layer-m8-final-validation/command-logs/pnpm-ai-guard-format-json.log`             |
| pnpm validate:governance         | yes      | PASS   | `docs/ai-runs/20260602-110559-ccd-post-go-app-public-layer-m8-final-validation/command-logs/pnpm-validate-governance.log`              |
| pnpm type-check                  | yes      | PASS   | `docs/ai-runs/20260602-110559-ccd-post-go-app-public-layer-m8-final-validation/command-logs/pnpm-type-check.log`                       |
| pnpm test:run                    | yes      | PASS   | `docs/ai-runs/20260602-110559-ccd-post-go-app-public-layer-m8-final-validation/command-logs/pnpm-test-run.log`                         |
| pnpm --filter @ccd/web-demo test | yes      | PASS   | `docs/ai-runs/20260602-110559-ccd-post-go-app-public-layer-m8-final-validation/command-logs/pnpm-filter-web-demo-test.log`             |
| pnpm build:web-demo              | yes      | PASS   | `docs/ai-runs/20260602-110559-ccd-post-go-app-public-layer-m8-final-validation/command-logs/pnpm-build-web-demo.log`                   |
| auto-imports no diff             | yes      | PASS   | `docs/ai-runs/20260602-110559-ccd-post-go-app-public-layer-m8-final-validation/command-logs/post-web-demo-auto-imports-diff-check.log` |
| pnpm build:desktop               | yes      | PASS   | `docs/ai-runs/20260602-110559-ccd-post-go-app-public-layer-m8-final-validation/command-logs/pnpm-build-desktop.log`                    |
| pnpm drift-check                 | yes      | PASS   | `docs/ai-runs/20260602-110559-ccd-post-go-app-public-layer-m8-final-validation/command-logs/pnpm-drift-check.log`                      |
