# Execution Mode Decision Matrix

| Mechanism | General rule | CCD recommendation |
|---|---|---|
| Local thread | Use for small, low-risk single-lane work | Use for planning review and small P1 analysis |
| Worktree | Use for isolation, risky changes, or parallel-safe experiments | Use for Vite 8, dependency lanes, and Login Diorama; do not run parallel implementation tracks |
| Goal mode | Use when there is one durable objective with a clear stop condition | Use after planning files exist |
| Automations | Use for recurring checks, polling, reminders, scheduled maintenance | Not needed |
| Skills | Use when a reusable workflow is needed | Read existing CCD skills if relevant; do not add new skills unless a recurring workflow emerges |
| Plugins | Use for external apps, MCP servers, or installable workflow bundles | Not needed by default; browser/screenshot capability may be useful for Login UI validation |
| CLI | Use for repeatable local validation | Required for pnpm/git validation |
| SDK | Use for programmatic orchestration | Not needed |
| Subagents | Use only for genuinely parallelizable research/implementation streams | Not recommended; Codex Desktop is the only execution layer |

## CCD-specific recommendation

- Use Codex Goal mode.
- First run planning materialization only.
- Then run implementation one milestone at a time.
- Use worktree only for M9, M10, or M11 after explicit approval.
- Do not use automations/subagents for this program.
- Do not use plugins unless UI screenshot/browser validation requires them.
