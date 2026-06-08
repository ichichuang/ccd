# CI / Deploy Contract

## GitHub Actions Is the Quality Gate

GitHub Actions validates architecture, metadata, generated artifacts, tests, lint, typecheck, build correctness, browser QA, and desktop smoke coverage.

Desktop CI coverage is repo-local workflow validation only. Remote branch protection and required-check settings remain operator-gated.

## Vercel Is the Deployment Build

Vercel is configured to run:

```bash
pnpm vercel:build
```

Do not replace this with `pnpm build:ci`.

## GitHub Pages Deployment

GitHub Pages deploys the browser `web-demo` application static build.

The deployment build uses:

```bash
pnpm build:web-demo
```

with:

```text
VITE_PUBLIC_PATH=/ccd/
```

## build:ci vs vercel:build

- `pnpm build:ci` is the CI validation build.
- `pnpm vercel:build` is the deployment build.

They are not interchangeable.

## Failure Classification

- If GitHub Actions fails, treat it as a quality gate failure.
- If Vercel fails while GitHub Actions passes, inspect the Vercel build command first.
- If generated artifact sync fails, regenerate and revalidate before committing.
