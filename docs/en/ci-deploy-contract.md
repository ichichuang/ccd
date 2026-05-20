# CI / Deploy Contract

## GitHub Actions Is the Quality Gate

GitHub Actions validates architecture, metadata, generated artifacts, tests, lint, typecheck, and build correctness.

## Vercel Is the Deployment Build

Vercel is configured to run:

```bash
pnpm vercel:build
```

Do not replace this with `pnpm build:ci`.

## GitHub Pages Deployment

GitHub Pages deploys the `web-demo` static build.

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
