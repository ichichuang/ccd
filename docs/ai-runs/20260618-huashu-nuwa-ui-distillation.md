# Huashu Nuwa UI Distillation: CCD Architecture Console

Date: 2026-06-18
Scope: `apps/web-demo/src/views/architecture-console/**`

## Source Set

- Apple Human Interface Guidelines: https://developer.apple.com/design/human-interface-guidelines
- Apple HIG Layout: https://developer.apple.com/design/human-interface-guidelines/layout
- Apple HIG Motion: https://developer.apple.com/design/human-interface-guidelines/motion
- Material Design 3 Foundations: https://m3.material.io/foundations
- Material Design 3 Get Started: https://m3.material.io/get-started
- Google Web Vitals: https://web.dev/articles/vitals

## Distilled Framework

This run uses `huashu-nuwa` as a distillation method, not as a celebrity impersonation layer. The distilled model is a public-source design engineering framework:

- Apple lens: clarity first, content hierarchy before chrome, depth only when it explains layering, motion only when it explains continuity.
- Google lens: state completeness, adaptive layouts, accessible contrast, semantic surfaces, and component behavior that remains predictable across modes.
- Front-end engineering lens: stable layout, low interaction latency, no avoidable cumulative shift, source-backed component APIs, and token-driven implementation.
- CCD lens: Architectural Glass, governed data surfaces, deterministic architecture boundaries, PrimeVue/Pro wrappers, UnoCSS semantic tokens, and no decorative overload.

## Applied Design Solution

Page job: governed architecture console.

Primary user: CCD maintainer validating package topology, runtime ownership, and UI/runtime evidence.

Primary action: understand the current architecture state and choose the right validation command.

Information priority:

1. Current page identity and status.
2. Primary metric and secondary metrics.
3. Capability ownership cards.
4. Evidence and commands.
5. Demo-specific surfaces.

UIDesignState:

```ts
{
  intent: 'dashboard',
  context: 'desktop-first',
  archetype: 'A3-stats-grid',
  density: 'comfortable',
  hierarchy: 'data-first',
  emphasis: 'medium',
  ctaPolicy: 'minimal'
}
```

Visual thesis: a governed architecture console where runtime ownership and validation evidence read before demos, using restrained Architectural Glass and a quiet grid field to imply system structure.

Signature detail: one subtle architectural grid field on the console shell, plus consistent icon material containers for recognition.

Implementation plan:

- Reclassify the console shell from `A2-sidebar-inspector` to `A3-stats-grid`.
- Make the first stat card the leading insight on desktop.
- Normalize icon presentation across stat, capability, evidence, route evidence, and command panels.
- Preserve all existing data models, route modules, i18n keys, PrimeVue wrappers, and validation surfaces.

## Validation Plan

- `pnpm --filter @ccd/web-demo type-check`
- `pnpm lint:check`
- `pnpm build:web-demo`
- Playwright screenshot check for `/architecture/topology` in authenticated visual mode.
