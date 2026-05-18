---
name: github-ops
description: 'Repo-aware GitHub automation for PRs, issues, CI, releases, reviews, and .github workflows. Use when a task mentions GitHub, PRs, issues, workflow runs, review comments, release automation, or remote repo operations.'
---

# GitHub Ops

Use the `gh` CLI to interact with GitHub, but start by reading the local repo context so automation matches the actual repository setup.

## Workflow

1. Run `python3 .ai/skills/codex/github-ops/scripts/github_context.py` from the repo root.
2. Inspect `.github/**`, git remotes, and the current branch before acting.
3. Use `gh` for PRs, issues, runs, releases, and API queries.
4. Prefer structured output with `--json` and `--jq`.
5. If the task touches CI or release behavior, inspect matching workflow YAML files before editing or dispatching runs.

## Trigger Examples

- "提交代码并推到 GitHub"
- "看一下这个 PR 的 checks 为什么挂了"
- "处理 review comments"
- "根据 .github/workflows 调整发布流程"
- "帮我创建 issue / release / PR"
- "检查远程仓库和当前分支策略"

## Pull Requests

Check CI status on a PR:

```bash
gh pr checks 55 --repo owner/repo
```

List recent workflow runs:

```bash
gh run list --repo owner/repo --limit 10
```

View a run and see which steps failed:

```bash
gh run view <run-id> --repo owner/repo
```

View logs for failed steps only:

```bash
gh run view <run-id> --repo owner/repo --log-failed
```

## Local Context

Read local repo GitHub context first:

```bash
python3 .ai/skills/codex/github-ops/scripts/github_context.py
```

Typical files to inspect:

- `.github/workflows/*.yml`
- `.github/CODEOWNERS`
- `.github/ISSUE_TEMPLATE/**`
- `.github/PULL_REQUEST_TEMPLATE*`
- `.github/dependabot.yml`

Current CCD governance notes:

- CI architecture enforcement enters through `pnpm governance:gate`.
- GitHub Pages deployment should build `@ccd/web-demo` and upload `apps/web-demo/dist`.
- Critical governance ownership is declared in `.github/CODEOWNERS`.
- Remote workflow metadata may include stale deleted workflow names until GitHub prunes historical workflow records.

## API for Advanced Queries

The `gh api` command is useful for accessing data not available through other subcommands.

Get PR with specific fields:

```bash
gh api repos/owner/repo/pulls/55 --jq '.title, .state, .user.login'
```

## JSON Output

Most commands support `--json` for structured output. You can use `--jq` to filter:

```bash
gh issue list --repo owner/repo --json number,title --jq '.[] | "\(.number): \(.title)"'
```

## Rules

- Prefer `gh` over raw REST calls unless `gh api` is required.
- When not in a git repo, specify `--repo owner/repo` explicitly.
- For PR, CI, release, or Actions tasks, inspect `.github/**` first instead of assuming workflow names.
- For review-comment or requested-change tasks, read the current branch and open PR context before editing code.
- For push, tag, or release tasks, confirm remote names and protected-branch constraints from the local repo state.
- Keep destructive remote actions explicit and reviewable.
