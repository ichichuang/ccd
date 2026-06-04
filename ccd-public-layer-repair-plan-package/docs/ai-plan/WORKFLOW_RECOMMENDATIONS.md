# WORKFLOW_RECOMMENDATIONS — Worktree, Automation, Skills, Plugins, CLI, SDK, and Subagents

## Decision matrix

| Mode/tool        | Use when                                                                              | Do not use when                                                            | Recommendation for this project                                                                                                |
| ---------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Local thread     | Task is small, low risk, and single-file.                                             | Package boundaries, broad validation, or long-horizon evidence are needed. | Not preferred for full repair. Useful only for one-off review questions.                                                       |
| Worktree         | Isolation, risky changes, background work, or parallel lanes are useful.              | Operator cannot manage multiple trees or workspace is already isolated.    | Recommended. Use an isolated worktree for implementation after approval.                                                       |
| Codex Goal mode  | One durable objective has clear milestones, validation, evidence, and stop condition. | Task is exploratory with no acceptance criteria.                           | Recommended. This plan is structured for Goal mode.                                                                            |
| Automations      | Recurring checks, polling, scheduled maintenance, reminders, or heartbeats.           | One-time repair work.                                                      | Not needed for this repair.                                                                                                    |
| Skills           | Reusable workflow is needed across many tasks.                                        | A plan file is sufficient.                                                 | Optional only if the team already has repo-governance or validation skills. Not required.                                      |
| Plugins/MCP      | External apps, MCP servers, or installable workflow bundles are required.             | Local repository work is sufficient.                                       | Not required. Do not add plugins just to extend runtime.                                                                       |
| CLI              | Scripted, repeatable local validation or CI orchestration is useful.                  | Manual-only review is sufficient.                                          | Use existing pnpm scripts and shell logging. Codex CLI is optional.                                                            |
| SDK              | Programmatic orchestration or custom automation is needed.                            | Standard agent + scripts are enough.                                       | Not needed.                                                                                                                    |
| Subagents        | Work can be parallelized into independent research or implementation streams.         | Shared files and decisions create merge conflicts.                         | Optional for research only: route contract audit, API/DTO audit, build/sync owner audit. Use one implementer for code changes. |
| CI orchestration | Repository has reliable CI and remote execution is approved.                          | External access or credentials are not approved.                           | Use local validation first. Remote CI requires approval.                                                                       |

## Specific recommendation

Use one isolated worktree and one Codex Goal-mode execution. Use subagents only for parallel discovery if the operator wants faster M0 inventory, but merge through a single implementation agent to avoid conflicting package boundary changes.

Do not use automations, plugins, SDK, or external MCP tools unless a future owner explicitly requires external integration.

## Suggested agent workflow

1. Operator creates or approves isolated worktree.
2. Agent reads `AGENTS.md` and all `docs/ai-plan/**` files.
3. Agent creates active evidence directory.
4. Agent executes M0 and stops for first architecture checkpoint.
5. Agent proceeds M1-M4 for high-value fixes.
6. Agent records M5/M6 owner decisions; implementation only with approval.
7. Agent performs M7 only if low-risk and approved by evidence.
8. Agent hardens guards in M8.
9. Agent runs final validation in M9.
10. Agent produces final artifacts in M10 and stops.
