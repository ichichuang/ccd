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
- `pnpm governance:gate`

## Deployment Commands

- `pnpm vercel:build`
- `pnpm build:web-demo`

## Deprecated or Forbidden Command References

Do not document or recommend commands that do not exist in `package.json`.

Examples to avoid unless they actually exist:

- `pnpm affected:lint`
- `pnpm affected:test`
- `pnpm affected:typecheck`
- `pnpm affected:build`
- `pnpm arch:check`
- `pnpm arch:check:fast`
- `pnpm arch:check:full`

Only use these if they are present in the current `package.json`.

## Requirement to Check package.json

AI agents must check `package.json` before claiming a command exists.

If a command is missing, do not recommend it.
