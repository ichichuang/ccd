# CCD Security and Approval Policy

## Allowed operations

Allowed without extra approval:

- read files;
- run repository inspection commands;
- run validation commands from `VALIDATION.md`;
- create/update `docs/ai-plan/**`;
- create/update active `docs/ai-runs/**`;
- edit source files within the active approved milestone;
- restore known unrelated generated drift after inspection and reporting.

## Operations requiring approval

Stop and ask before:

- deleting large file sets;
- destructive shell commands;
- `git reset`;
- `git clean`;
- `git rebase`;
- force push;
- history rewriting;
- branch deletion;
- committing;
- pushing;
- dependency additions, replacements, or upgrades;
- production configuration changes;
- secrets, credentials, env files;
- auth flow changes;
- deployment settings;
- database migrations or data operations;
- external systems, private APIs, cloud resources;
- broad architectural rewrite;
- editing `.ai/protocol/AI.entry.md` to alter generated `AGENTS.md`;
- force-adding `.ai/runtime/repair_list.md`.

## Forbidden operations

Forbidden unless the operator explicitly overrides with precise instruction:

- `git add .`
- `git commit --no-verify`
- push without target branch confirmation
- manual edits to `docs/generated/**`
- manual edits to `.ai/generated/**`
- manual edits to `.ai/governance/api-snapshots/**`
- weakening governance gates
- replacing PrimeVue/alova as a shortcut
- mixing unrelated repair lanes
- starting multiple implementation tracks
- claiming validation passed without evidence

## Secret handling

- Do not print secrets.
- Do not commit secrets.
- Do not inspect private credentials unless explicitly required and approved.
- Do not modify `.env` or credential files without approval.

## Credential handling

If credentials appear in logs or diffs:

1. Stop.
2. Do not copy them into evidence files.
3. Report that sensitive content was detected.
4. Ask operator for redaction instructions.

## External network access

Allowed only for:

- package install using existing lockfile;
- official documentation research when version/security/tooling facts are needed;
- standard test/browser install commands already in repository scripts.

Anything else requires approval.

## Dependency installation

- `pnpm install --frozen-lockfile` is allowed.
- Dependency upgrades require approval.
- New dependencies require approval and rationale.

## Production configuration

Do not edit production config, deployment settings, or service configuration without approval.

## Database operations

No database operations are currently in scope. If discovered, stop.

## Deployment operations

No deployment operations are in scope. Do not start, stop, restart, reconfigure, or deploy production services.

## Git operations

Allowed:

- `git status`
- `git diff`
- `git diff --check`
- `git log`
- `git branch --show-current`

Require approval:

- staging;
- committing;
- pushing;
- branch creation/deletion;
- reset/clean/rebase.

## Local machine safety

- Do not run destructive file-system commands.
- Do not remove large directories.
- Do not alter user-level configuration.
- Do not alter global package manager state unless explicitly approved.

## Sandbox expectations

Do not bypass sandbox, approval, or safety controls.

## Stop-and-ask triggers

Stop when:

- validation fails;
- evidence missing;
- dependency change required;
- generated governance drift unexpected;
- scope expands;
- risky git command required;
- external system access required;
- runtime neutrality cannot be proven.
