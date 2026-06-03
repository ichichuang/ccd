# OUTPUT_QUALITY_REQUIREMENTS

The execution output must be:

- Specific enough for a human reviewer to understand every changed area.
- Conservative around risky operations.
- Explicit about validation.
- Explicit about evidence.
- Explicit about stop conditions.
- Adapted to the actual repository stack discovered during M0.
- Free of vague changes such as "improve code" unless decomposed into concrete tasks.
- Free of fake commands, fake conventions, fake test results, or fake evidence.
- Clear about what was inspected before implementation.
- Clear about what required approval.
- Suitable for long-horizon agent execution through the concise Codex Goal prompt.

## Required final response from coding agent

The final response must include:

1. Final go/no-go decision.
2. Summary of implemented changes.
3. Summary of deferred or blocked items.
4. Validation matrix status and evidence directory path.
5. Residual risks.
6. Whether any approval-gated operation was requested or performed.
7. Explicit statement that no commit/push/destructive Git operation was performed unless the user requested it.
