# Debug Checklist

## First Pass

1. Open the page with a named session.
2. Capture title, URL, ready state, console logs, network logs, and a screenshot.
3. Save storage state if login or setup was required.

## Repair Loop

1. Retry once with the same session.
2. Reload once if the page is partially loaded.
3. Open DevTools only when interactive signals matter.
4. Record a trace when the failure is timing-sensitive.
5. Stop after the issue is reproducible and explain the evidence.

## Red Flags

- Console errors containing `TypeError`, `ReferenceError`, or hydration failures.
- Network logs with `4xx` or `5xx`.
- Ready state stuck before `complete`.
- Repeated redirects or blank-page screenshots.
