# Layout and Scroll Ownership

Layout and scroll ownership governs viewport roots, route roots, page roots, regions, and scroll surfaces. Agents must name owners before editing and validate desktop, tablet, mobile, overlay, virtualized, and restoration behavior.

## Ownership Model

Layout starts with ownership: viewport root, route root, page root, regions, and scroll owners. Every changed surface must name those owners before implementation.

## Document and Route Viewport

The document viewport and route viewport must be bounded. A route must not depend on accidental body scrolling when an app container owns the viewport.

## Page Root Responsibilities

This section requires agents to apply page root responsibilities rules with explicit ownership, current monorepo evidence, accessibility-safe behavior, token-driven styling, and validation before reporting completion.

## Region Responsibilities

This section requires agents to apply region responsibilities rules with explicit ownership, current monorepo evidence, accessibility-safe behavior, token-driven styling, and validation before reporting completion.

## Explicit Scroll Owners

This section requires agents to apply explicit scroll owners rules with explicit ownership, current monorepo evidence, accessibility-safe behavior, token-driven styling, and validation before reporting completion.

## Same-Axis Nesting

Same-axis nested scrolling is prohibited unless a component such as a virtualized table owns an internal scroll surface and the page root remains stable.

## Virtualized Component Ownership

This section requires agents to apply virtualized component ownership rules with explicit ownership, current monorepo evidence, accessibility-safe behavior, token-driven styling, and validation before reporting completion.

## Desktop Multi-Region Layouts

This section requires agents to apply desktop multi-region layouts rules with explicit ownership, current monorepo evidence, accessibility-safe behavior, token-driven styling, and validation before reporting completion.

## Tablet Transformation

This section requires agents to apply tablet transformation rules with explicit ownership, current monorepo evidence, accessibility-safe behavior, token-driven styling, and validation before reporting completion.

## Mobile Primary Scroll Ownership

This section requires agents to apply mobile primary scroll ownership rules with explicit ownership, current monorepo evidence, accessibility-safe behavior, token-driven styling, and validation before reporting completion.

## Dialog and Drawer Isolation

This section requires agents to apply dialog and drawer isolation rules with explicit ownership, current monorepo evidence, accessibility-safe behavior, token-driven styling, and validation before reporting completion.

## Fullscreen and Immersive Surfaces

This section requires agents to apply fullscreen and immersive surfaces rules with explicit ownership, current monorepo evidence, accessibility-safe behavior, token-driven styling, and validation before reporting completion.

## Scroll Restoration

This section requires agents to apply scroll restoration rules with explicit ownership, current monorepo evidence, accessibility-safe behavior, token-driven styling, and validation before reporting completion.

## Current AppContainer Evidence

Current AppContainer evidence is `apps/web-demo/src/layouts/components/AppContainer.vue`. Treat it as implementation evidence, not authorization for runtime layout migration.

`packages/vue-app-platform/src/layoutRuntime.ts` is current implementation evidence for application layout-runtime behavior. UI work must inspect and preserve its app-shell, viewport, region, and scroll responsibilities before changing related behavior; page-local logic must not duplicate or replace that responsibility. P2C does not modify AppContainer or route scrolling, and later layout migration remains separately governed.

## Follow-up layout boundary

Follow-up layout work may change app containers or route scrolling only under explicit runtime scope. This reference records governance, not migration.
