# SECURITY_AND_APPROVALS — Agent Safety Policy

## Allowed operations by default

- Reading repository files.
- Creating or updating planning and evidence files.
- Editing source files within the current approved milestone.
- Running non-destructive local validation commands.
- Running read-only Git status and diff commands.
- Adding tests and documentation within scope.

## Operations requiring explicit approval

Stop and ask before:

1. Deleting large file sets or running destructive shell commands.
2. Running `git reset`, `git clean`, `git rebase`, force push, history rewriting, branch deletion, or any destructive Git operation.
3. Committing or pushing changes.
4. Adding, removing, replacing, or upgrading production dependencies.
5. Editing package manifests or lockfiles.
6. Creating new package owners under `packages/**`.
7. Editing production configuration, secrets, credentials, environment files, auth flows, payment flows, or deployment settings.
8. Running database migrations, schema changes, data backfills, or destructive data operations.
9. Starting, stopping, restarting, or reconfiguring production services.
10. Accessing external systems, private APIs, cloud resources, email, messaging tools, or user accounts.
11. Running network-dependent commands that may mutate remote state.
12. Making broad architectural rewrites not explicitly required by the plan.
13. Continuing when validation evidence is missing or contradictory.

## Forbidden operations unless separately approved by the user

- Destructive Git cleanup or history rewrite.
- Manual edits to generated files when an owning generator exists.
- Hidden dependency or lockfile edits.
- Secret exfiltration or logging secrets.
- Production deployment or service mutation.
- Database migrations or data mutation.
- Moving blocked surfaces such as SafeStorage crypto/compression, DateUtils, HTTP runtime adapters, route views, or Pinia stores into public packages without a specific owner decision.

## Secret handling

- Do not print secrets, tokens, cookies, private keys, or credentials.
- Do not open `.env` files unless needed for local validation and approved by the owner.
- Do not copy secrets into evidence files.
- Redact sensitive values in logs.

## Credential handling

No credentialed external action is approved by default. If a command requires login or token access, stop and ask.

## External network access

Use only when required and approved. Prefer local repository validation. For version-specific research, use official sources and record citations in evidence.

## Dependency installation

If dependencies are missing:

1. Check whether installation can be done without changing lockfiles.
2. If lockfile or manifest would change, stop for approval.
3. Record exact command and result if installation is approved.

## Production configuration

Do not edit deployment, production environment, auth, payment, or service configuration in this plan.

## Database operations

No database operations are in scope.

## Deployment operations

No deployment operations are in scope.

## Git operations

Allowed by default:

- `git status --short`
- `git diff --name-only`
- `git diff --stat`
- `git diff`
- `git log` read-only inspection

Not allowed without explicit request:

- `git add`
- `git commit`
- `git push`
- `git reset`
- `git clean`
- `git rebase`
- force push
- branch deletion
- history rewrite

If a commit message is requested, inspect repository conventions first and write it in detailed Simplified Chinese.

## Local machine safety

Avoid commands that delete files, kill processes, modify global machine state, install global packages, or change shell profiles. Use repository-local commands only.

## Sandbox expectations

Do not bypass sandbox, permission prompts, or safety controls. Do not instruct another agent to bypass them.

## Stop-and-ask triggers

Stop immediately if:

- Required approval is missing.
- Validation contradicts expected behavior.
- Evidence cannot be captured.
- A task requires dependency or manifest changes.
- Package owner is unclear.
- A migration would introduce app singleton, DOM, browser, store, router, i18n, logger, or generated-file coupling into a public package.
- The workspace has unrelated changes that could be overwritten.
