# Project Control Center

`project.config.json` is the single manual source of truth for CCD project metadata.

Change these values only in `project.config.json`:

- product package name, display name, desktop title, description, author, homepage, license, desktop identifier, and keywords
- release version
- governance policy version and governance phase

Do not edit generated outputs under `docs/generated/**` or `.ai/generated/**` manually. Generated reports must be refreshed only by existing governance scripts.

After editing `project.config.json`, run:

```bash
pnpm project:sync
```

Verify metadata alignment with:

```bash
pnpm project:doctor
```

Before committing, run:

```bash
pnpm governance:gate
```

Before release, run:

```bash
pnpm validate
```

## One-click workflow

Normal daily use is:

```bash
pnpm ccd:doctor
pnpm ccd:fix
pnpm ccd:ship -- "feat: describe change"
```

- `ccd:doctor` only checks project config, metadata alignment, and git status.
- `ccd:fix` repairs metadata, refreshes generated governance outputs, formats, normalizes generated whitespace, and validates without committing.
- `pnpm ccd:ship -- "message"` is idempotent: it runs the full repair pipeline, stages all current changes, runs staged linting only when there are committable changes, checks commitlint, and commits through Husky. If everything is already committed and the working tree is clean, it exits successfully without creating a new commit.
- Use `pnpm ccd:ship -- --allow-empty "chore: trigger automation"` or `pnpm ccd:ship -- --allow-empty --message "chore: trigger automation"` only when an intentional empty commit is needed. Normal users should not need `--allow-empty`.
- Commit messages are sanitized to avoid trailing full stop failures such as `feat: AI.` becoming `feat: AI`.
- Husky and commitlint remain active. `ccd:ship` does not use `--no-verify`.
- Generated files are refreshed by governance scripts and normalized deterministically; do not edit `docs/generated/**` or `.ai/generated/**` manually.
