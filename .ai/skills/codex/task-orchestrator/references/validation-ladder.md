# Validation Ladder

Use the narrowest relevant production checks first:

1. Package or app type check.
2. Repository lint.
3. Architecture and runtime boundaries.
4. Web build for web-facing changes.
5. Desktop build for desktop-facing changes.
6. Full workspace validation for cross-cutting changes.

Report commands that could not run and the reason.
