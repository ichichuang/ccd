# Troubleshooting Contract

## Diagnose the First Failing Command

Do not make broad changes before identifying the first failing command.

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
