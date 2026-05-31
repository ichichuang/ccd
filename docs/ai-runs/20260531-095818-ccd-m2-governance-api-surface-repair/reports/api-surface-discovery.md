# API Surface Discovery

## Baseline Discovery Table

| package_name | package_path | package_json_exports | topology_publicApi | topology_layer | expected_in_api_surface_report | present_in_api_surface_md | present_in_api_surface_json | discovery_source | mismatch_type | required_change | related_issue_ids |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `@ccd/contracts` | `packages/contracts` | `.` | true | contracts | true | true | true | topology publicApi plus package exports | NO_ACTION | none | D-01, E-06, D-10 |
| `@ccd/core` | `packages/core` | `.` | true | core | true | true | true | topology publicApi plus package exports | NO_ACTION | none | A-01, D-10 |
| `@ccd/design-tokens` | `packages/design-tokens` | `.`, `./theme-engine` | true | frontend-platform | true | true | true | topology publicApi plus package exports | NO_ACTION | none | B-03, B-04, F-04 |
| `@ccd/shared-utils` | `packages/shared-utils` | `.` | true | frontend-platform | true | true | true | topology publicApi plus package exports | NO_ACTION | none | B-05, B-06, B-08 |
| `@ccd/unocss-preset` | `packages/unocss-preset` | `.`, `./browser`, `./safelist`, `./theme` | true | frontend-platform | true | true | true | topology publicApi plus package exports | NO_ACTION | none | C-04 |
| `@ccd/vue-hooks` | `packages/vue-hooks` | `.` | true | frontend-platform | true | true | true | topology publicApi plus package exports | NO_ACTION | none | B-01, E-02 |
| `@ccd/vue-app-platform` | `packages/vue-app-platform` | `.` | true | frontend-platform | true | false | false | topology publicApi plus package exports | API_DISCOVERY_OMISSION | add to API policy, use topology-driven API discovery, regenerate API report and snapshot | B-03, B-04, D-04, E-03 |
| `@ccd/vue-ui` | `packages/vue-ui` | `.`, `./style.css` | true | frontend-platform | true | true | true | topology publicApi plus package exports | NO_ACTION | none | B-02, D-08, D-11, E-04 |
| `@ccd/vue-primevue-adapter` | `packages/vue-primevue-adapter` | `.` | true | frontend-platform | true | true | true | topology publicApi plus package exports | NO_ACTION | none | C-06 |
| `@ccd/vue-charts` | `packages/vue-charts` | `.` | true | frontend-platform | true | true | true | topology publicApi plus package exports | NO_ACTION | none | E-07, F-01 |

## Post-Change Discovery Table

| package_name | package_path | package_json_exports | topology_publicApi | topology_layer | expected_in_api_surface_report | present_in_api_surface_md | present_in_api_surface_json | discovery_source | mismatch_type | required_change | related_issue_ids |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `@ccd/contracts` | `packages/contracts` | `.` | true | contracts | true | true | true | topology publicApi plus package exports | NO_ACTION | none | D-01, E-06, D-10 |
| `@ccd/core` | `packages/core` | `.` | true | core | true | true | true | topology publicApi plus package exports | NO_ACTION | none | A-01, D-10 |
| `@ccd/design-tokens` | `packages/design-tokens` | `.`, `./theme-engine` | true | frontend-platform | true | true | true | topology publicApi plus package exports | NO_ACTION | none | B-03, B-04, F-04 |
| `@ccd/shared-utils` | `packages/shared-utils` | `.` | true | frontend-platform | true | true | true | topology publicApi plus package exports | NO_ACTION | none | B-05, B-06, B-08 |
| `@ccd/unocss-preset` | `packages/unocss-preset` | `.`, `./browser`, `./safelist`, `./theme` | true | frontend-platform | true | true | true | topology publicApi plus package exports | NO_ACTION | none | C-04 |
| `@ccd/vue-hooks` | `packages/vue-hooks` | `.` | true | frontend-platform | true | true | true | topology publicApi plus package exports | NO_ACTION | none | B-01, E-02 |
| `@ccd/vue-app-platform` | `packages/vue-app-platform` | `.` | true | frontend-platform | true | true | true | topology publicApi plus package exports | NO_ACTION | none | B-03, B-04, D-04, E-03 |
| `@ccd/vue-ui` | `packages/vue-ui` | `.`, `./style.css` | true | frontend-platform | true | true | true | topology publicApi plus package exports | NO_ACTION | none | B-02, D-08, D-11, E-04 |
| `@ccd/vue-primevue-adapter` | `packages/vue-primevue-adapter` | `.` | true | frontend-platform | true | true | true | topology publicApi plus package exports | NO_ACTION | none | C-06 |
| `@ccd/vue-charts` | `packages/vue-charts` | `.` | true | frontend-platform | true | true | true | topology publicApi plus package exports | NO_ACTION | none | E-07, F-01 |

## Evidence

- Baseline policy/report mismatch: `command-logs/analysis-topology-public-api-vs-report-before.tsv`
- Post-change policy/report alignment: `command-logs/analysis-topology-public-api-vs-report-after.tsv`
- Baseline report grep: `command-logs/analysis-rg-vue-app-platform-api-surface-md-before.log`, `command-logs/analysis-rg-vue-app-platform-api-surface-json-before.log`
- Post-change report grep: `command-logs/analysis-rg-vue-app-platform-api-surface-md-after.log`, `command-logs/analysis-rg-vue-app-platform-api-surface-json-after.log`
- Generated command: `command-logs/after-pnpm-api-report.log`
