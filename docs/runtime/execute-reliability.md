# Execute Reliability

CCD treats Codex execution as a governed runtime boundary between project governance and portable topology.

## Validation Matrix

| Mode                           | Command                                                                               | Expected Output                                              |
| ------------------------------ | ------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| no-execute local               | `codex-token --no-execute --json "<task>"`                                            | deterministic routing classification and profile             |
| execute local                  | `pnpm codex:exec -- --task "<task>"`                                                  | deterministic provider, runtime profile, orchestration state |
| execute remote                 | `ACTIVE_CODEX_PROVIDER=remote-moacode pnpm codex:exec -- --task "<task>"`             | remote provider matches configured transport                 |
| execute mobile bridge          | `pnpm codex:execute:doctor -- --task "<task>"`                                        | execution fingerprint includes provider and runtime profile  |
| execute orchestration          | `pnpm orchestration:validate && pnpm codex:execute:doctor`                            | orchestration manifest is present and injectable             |
| execute strict-runtime-profile | `STRICT_RUNTIME_PROFILE=desktop pnpm codex:exec -- --profile desktop --task "<task>"` | strict profile matches active profile                        |
| execute no-cache               | `pnpm codex:exec -- --no-cache --task "<task>"`                                       | stale result cache is bypassed                               |
| execute provider-switch        | `ACTIVE_CODEX_PROVIDER=<provider> pnpm codex:transport:validate`                      | provider and transport are aligned                           |

## Required Determinism

- Routing must classify the same governance/runtime task consistently.
- Provider identity must come from `ACTIVE_CODEX_PROVIDER`.
- Current `remote-moacode` transport is `apirouter` in `/Users/cc/.codex/config.toml`.
- `packy-local` transport is `packyapi`.
- Runtime profile must come from `ACTIVE_RUNTIME_PROFILE` or `STRICT_RUNTIME_PROFILE`.
- Orchestration state must come from `.ai/orchestration/manifest.json`.
- Cache fingerprints must include provider and runtime profile namespace.

## Failure Conditions

- Provider mismatch.
- Transport mismatch.
- Missing runtime profile in strict mode.
- Stale result cache reuse across provider/profile namespaces.
- Missing orchestration manifest.
