# Troubleshooting Contract

## Diagnosis Order

1. Identify the first failing command.
2. Read the relevant contract before fixing.
3. Fix the root cause, not the symptom.
4. Validate the fix with the same command.
5. Run `pnpm docs:commands` if the fix touches documentation.

## Diagnose the First Failing Command

Do not make broad changes before identifying the first failing command.

## Documentation Drift

If `pnpm docs:commands` fails:

1. Find the broken reference in the reported file and line.
2. Check `package.json` for the correct script name.
3. Fix the documentation, not the script.
4. Do not manually edit `docs/generated/**` — regenerate instead.

## Never Re-add Global @ccd/\* Paths to tsconfig.base.json

This masks package boundaries and invalidates build assumptions.

## Do Not Make Vercel Run build:ci

Fix the deployment configuration instead.

## Do Not Weaken Governance

Do not remove or bypass governance gates to make CI pass.

## Do Not Bypass Husky

Commits must remain compatible with Husky and commitlint.

## Do Not Force Push

Force pushing is forbidden unless explicitly requested by the human operator.

## Generated Output Drift

If governance reports or API snapshots are stale:

1. Run `pnpm governance:refresh`.
2. Run `pnpm governance:gate`.
3. Do not manually edit generated files.
