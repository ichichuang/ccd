---
name: architecture-browser-master
description: Drive browser validation and debugging with Playwright CLI and a local Python wrapper. Use when Codex needs to open a site, preserve browser context, inspect console or network failures, collect screenshots and traces, reproduce UI bugs, validate visual changes, or run low-token browser repair loops.
---

# Architecture Browser Master

## Overview

Prefer Playwright CLI for browser work and keep Codex at the orchestration layer. Push repetitive browser operations into `scripts/browser_automator.py` so the model sees compact JSON summaries instead of repeated DOM snapshots.

## Quick Start

- Inspect a page and persist auth state:
  - `python3 scripts/browser_automator.py inspect --url https://example.com --session home-audit`
- Import a Playwright CRX or codegen Python export into a reusable local flow:
  - `python3 scripts/browser_automator.py flow-import --recording /tmp/login.py --flow-name login-flow`
- Replay an imported flow through Playwright CLI with the same session and saved state:
  - `python3 scripts/browser_automator.py flow-run --flow artifacts/browser/flows/login-flow.json --session login-flow`
- Open DevTools, collect console or network logs, and retry once on failure:
  - `python3 scripts/browser_automator.py repair --url https://example.com --session home-audit --show-devtools`
- Reuse a saved storage state:
  - `python3 scripts/browser_automator.py inspect --url https://example.com --session auth-check --state-in artifacts/auth/state.json`

## Workflow

1. Create or reuse a named Playwright CLI session.
2. Prefer persistent profiles or storage-state files for login reuse.
3. When you already recorded a stable UI flow in Playwright CRX, export Python once and import it with `flow-import`.
4. Replay imported flows with `flow-run` before asking Codex to rediscover the same browser steps.
5. Run `inspect` first when there is no recording yet or when you need fresh evidence.
6. Switch to `repair` only when the first pass reports a hard failure, console error, or broken navigation.
7. Read `summary.json` before loading any large artifact. Only inspect screenshots or logs when the summary points to a concrete issue.

## Rules

- Prefer `scripts/browser_automator.py` over ad hoc multi-step CLI command chains.
- Prefer Playwright CLI over browser MCP unless OAuth or a third-party SaaS constraint blocks the CLI route.
- Prefer Playwright CRX as the day-to-day recorder for real browser interactions, then import the exported Python into local flow JSON.
- Keep browser sessions semantic: `home-audit`, `checkout-regression`, `admin-auth`.
- Save storage state when the flow is likely to be rerun.
- Treat imported flows as local automation assets: record once, replay many times, and only promote them into repo scripts when they become shared team workflows.
- Keep the browser artifact surface small: summary first, screenshot second, raw console or network dumps last.
- Use `--show-devtools` only when interactive inspection adds value.
- Use `repair` for bounded retry loops only. Do not invent product behavior changes inside the browser; stop once the issue is reproducible and explain the failing signal.

## Modes

- `inspect`: Open, collect state, capture artifacts, and write a compact summary.
- `repair`: Retry once, reload once, optionally execute a provided repair snippet, then write before and after summaries.
- `state-save`: Save storage state for future runs.
- `state-load`: Restore storage state before navigation.
- `flow-import`: Convert a Playwright CRX or codegen Python export into replayable local flow JSON.
- `flow-run`: Reuse a local flow JSON through the current Playwright CLI session, with screenshots, logs, trace, and optional state save.
- `cleanup`: Close the session and optionally delete persistent profile data.

## References

- Read `references/cli-playbook.md` for command patterns and session naming.
- Read `references/debug-checklist.md` when a flow needs traces, videos, or a repair loop.
- Read `references/recorder-workflow.md` when importing CRX recordings or designing low-token replay loops.

## Output Contract

- Write artifacts under `artifacts/browser/<session>/` unless the task provides a better location.
- Emit `summary.json` with the issue list, paths, and retry outcomes.
- Surface only the minimum evidence needed for the next coding step.
