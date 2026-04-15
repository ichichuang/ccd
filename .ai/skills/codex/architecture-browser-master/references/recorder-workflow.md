# Recorder Workflow

## Recommended Stack

1. Use Playwright CRX as the primary browser recorder for day-to-day product flows.
2. Export Python from the recorder.
3. Import the recording into a local flow JSON with `browser_automator.py flow-import`.
4. Replay the imported flow with `browser_automator.py flow-run`.
5. Use traces only when the replay reports a timing or runtime failure that needs deeper evidence.

## Import Once, Replay Many Times

Import a recorder export:

```bash
python3 scripts/browser_automator.py \
  flow-import \
  --recording /absolute/path/to/recording.py \
  --flow-name login-flow
```

Replay the flow through the current Playwright CLI session:

```bash
python3 scripts/browser_automator.py \
  flow-run \
  --flow artifacts/browser/flows/login-flow.json \
  --session login-flow
```

Save and reuse auth state:

```bash
python3 scripts/browser_automator.py \
  flow-run \
  --flow artifacts/browser/flows/login-flow.json \
  --session login-flow \
  --state-out artifacts/browser/login-flow/state.json
```

## Promotion Rules

- Keep exploratory or personal recordings under `artifacts/browser/flows/`.
- Promote a recording into repo scripts only when the same flow becomes a shared regression or onboarding workflow.
- Do not make Codex rediscover a stable browser flow that already exists as an imported JSON flow.

## Trace Usage

- Prefer replay plus `summary.json` first.
- Collect trace and video only when the failure is timing-sensitive, intermittent, or depends on runtime state.
- Use trace review to decide the next code change, not as the default first step.

## Token Discipline

- Read the flow import summary before the raw recording.
- Read browser `summary.json` before screenshots or logs.
- Reuse a named session and saved state instead of replaying the full login path from scratch.
