# CLI Playbook

## Session Naming

- Use semantic names such as `homepage-audit`, `checkout-repair`, or `admin-auth`.
- Reuse the same session only when preserving auth or state is valuable.

## Preferred Patterns

- Open with persistence:
  - `npx -y @playwright/cli -s=homepage-audit open https://example.com --persistent`
- Save storage state:
  - `npx -y @playwright/cli -s=homepage-audit state-save artifacts/browser/homepage-audit/state.json`
- Inspect console and network:
  - `npx -y @playwright/cli -s=homepage-audit console error`
  - `npx -y @playwright/cli -s=homepage-audit network`
- Close or clean up:
  - `npx -y @playwright/cli -s=homepage-audit close`
  - `npx -y @playwright/cli -s=homepage-audit delete-data`

## Token Discipline

- Read `summary.json` first.
- Read screenshots only when the summary names a visual issue.
- Read full console and network dumps only when the issue list points to a specific failure.
