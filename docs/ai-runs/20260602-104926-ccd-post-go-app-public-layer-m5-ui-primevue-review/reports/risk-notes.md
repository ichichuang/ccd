# M5 Risk Notes

## Residual risks

- Generated `components.d.ts` still references PrimeVue modules because the
  owning generator produces global component typings. This is generated-owned,
  not app-authored production source.
- `apps/web-demo/build/resolvers/primevue.ts` still constructs
  `PrimeVueResolver()`. M6 owns build/generator classification.
- App `package.json` still declares PrimeVue dependencies for the concrete web
  runtime; D-A002 forbids manifest changes in this plan.

## Controls

- `pnpm ai:guard -- --format=json` reports no findings.
- `@ccd/vue-ui` tests cover governed UI wrappers and PrimeVue renderer pieces.
- `@ccd/vue-primevue-adapter` build validates typed adapter facades.
- `pnpm build:web-demo` validates the concrete app build.

## No-go items preserved

- No raw PrimeVue production source migration.
- No generated registry manual edit.
- No manifest or lockfile change.
- No guard weakening.
