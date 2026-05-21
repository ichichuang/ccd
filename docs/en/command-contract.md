# Command Contract

## Canonical Commands

Before documenting or invoking any command, confirm it exists in `package.json`.

Preferred canonical commands:

- `pnpm project:doctor`
- `pnpm ccd:fix`
- `pnpm ccd:ship -- "type: message"`
- `pnpm governance:refresh`
- `pnpm governance:gate`
- `pnpm build:ci`
- `pnpm vercel:build`
- `pnpm e2e:qa`
- `pnpm ci:prepare-internal`
- `pnpm ci:smoke:packages`

## Daily Commands

- `pnpm project:doctor`
- `pnpm ccd:doctor`
- `pnpm ccd:fix`
- `pnpm ccd:ship -- "type: message"`

## CI Commands

- `pnpm build:ci`
- `pnpm ci:prepare-internal`
- `pnpm ci:smoke:packages`
- `pnpm docs:commands`
- `pnpm governance:gate`

## Deployment Commands

- `pnpm vercel:build`
- `pnpm build:web-demo`

## Deprecated or Forbidden Command References

Do not document or recommend commands that do not exist in `package.json`.

<!-- doc-commands: ignore-start -->

Examples to avoid unless they actually exist:

- `pnpm affected:lint`
- `pnpm affected:test`
- `pnpm affected:typecheck`
- `pnpm affected:build`
- `pnpm arch:check`
- `pnpm arch:check:fast`
- `pnpm arch:check:full`
<!-- doc-commands: ignore-end -->

Only use these if they are present in the current `package.json`.

## Requirement to Check package.json

AI agents must check `package.json` before claiming a command exists.

If a command is missing, do not recommend it.

## Documentation Preflight

Before editing any documentation that references commands:

1. Read `package.json` and confirm every documented command exists in `scripts`.
2. Run `pnpm docs:commands` to scan for broken references.
3. Do not invent command names.
4. Do not document commands that do not exist in the current `package.json`.

## Automated Command Validation

`pnpm docs:commands` scans all Markdown documentation for `pnpm` command references and fails when a referenced root package script does not exist in `package.json`.

This guard prevents invented command drift. It runs automatically as part of `pnpm governance:gate`.

Always run `pnpm docs:commands` after editing documentation that contains `pnpm` command references.
