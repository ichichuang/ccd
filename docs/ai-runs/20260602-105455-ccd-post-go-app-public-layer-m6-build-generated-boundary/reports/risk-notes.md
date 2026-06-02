# M6 Risk Notes

## Residual risks

- Build utilities remain inside apps because there is no governed build package
  owner.
- Generated registries can drift after owning commands unless normalized and
  checked.
- `apps/web-demo/build/resolvers/primevue.ts` continues to own the build-only
  PrimeVue resolver boundary.

## Controls

- `pnpm drift-check` validates the PrimeVue resolver boundary.
- `pnpm build:web-demo` exercises auto-import/component generation.
- `pnpm exec prettier --write apps/web-demo/src/types/auto-imports.d.ts`
  normalizes build-produced auto-import formatting.
- `pnpm api:report` and `pnpm validate:governance` validate generated
  governance artifacts.
- M7 should record the app-owned build classifications in the final register.

## No-go items preserved

- No manual generated file edits.
- No generated registry commit in M6.
- No new package.
- No manifest or lockfile changes.
- No guard weakening.
