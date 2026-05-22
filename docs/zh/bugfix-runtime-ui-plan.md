# Runtime UI bugfix execution plan

## Scope and constraints

This plan prepares the runtime UI bugfix queue from `main` after Git cleanup.

- Work from `main` with a clean working tree before starting each implementation slice.
- Do not restore any previous stash unless explicitly instructed.
- Keep each task in its own commit using the expected commit message listed below.
- Do not modify CI, Vercel, TypeScript config, governance scripts, or package build scripts for this queue.
- Do not manually edit generated documentation.
- Prefer the existing Vue, PrimeVue, UnoCSS, store, route, and wrapper patterns already present in the repository.
- Validate each implementation slice with targeted checks before committing.

## Task 1: Fix layout loading and route title stability

Expected commit:

```text
fix: stabilize layout loading and route title state
```

Problems to fix:

- Large loading overlay sometimes is not centered.
- Loading overlay sometimes does not cover the intended full area.
- Browser title briefly shows `页面未找到` after refresh.

Execution notes:

- Inspect the layout loading wrapper and route transition path before editing.
- Stabilize the loading overlay containment and centering relative to the intended layout area.
- Stabilize title derivation during refresh so transient not-found route state does not update the browser title.
- Verify refresh behavior on existing admin/demo routes and a not-found route.

Validation:

- Run targeted type/lint checks for touched files where available.
- Run `git diff --check` before committing.

## Task 2: Fix PrimeVue Button and Toast/Message feedback

Expected commit:

```text
fix: stabilize PrimeVue button and message feedback
```

Problems to fix:

- Raised buttons are not visually clear enough in dark mode.
- `window.$message` default placement should be top-center.

Execution notes:

- Inspect the PrimeVue adapter theme/PT preset and message bridge before editing.
- Improve raised button visual contrast in dark mode through the existing PrimeVue/UnoCSS design system rather than hardcoded page-level styles.
- Set the default `window.$message` placement to top-center while preserving explicit caller overrides.
- Verify button variants in light and dark mode and confirm default message placement.

Validation:

- Run targeted type/lint checks for touched files where available.
- Run `git diff --check` before committing.

## Task 3: Add optional CScrollbar scroll memory

Expected commit:

```text
feat: add optional CScrollbar scroll memory
```

Problems to fix:

- `CScrollbar` should optionally remember `scrollTop` and `scrollLeft`.
- Scroll memory must be off by default.
- `LayoutAdmin` route content scroll should enable scroll memory through app-level store state.

Execution notes:

- Inspect the `CScrollbar` wrapper public API and existing app-level store patterns before editing.
- Add an opt-in scroll-memory API without changing default behavior.
- Persist and restore both vertical and horizontal offsets only when the option is enabled.
- Wire `LayoutAdmin` route content scroll memory through app-level store state rather than direct storage access in the view.
- Verify navigation away/back restores route content scroll only where enabled.

Validation:

- Run targeted type/lint checks for touched files where available.
- Run relevant UI or E2E coverage if an existing route-scroll test is available.
- Run `git diff --check` before committing.

## Task 4: Rebuild Icons explorer page

Expected commit:

```text
fix: rebuild icons explorer layout and controls
```

Problems to fix:

- `/example/components/icons` shows no icons or has an unreliable icon list.
- Page layout should not globally scroll.
- Left pane should be a scrollable icon grid.
- Right pane should be a scrollable settings panel.
- Settings controls should actually affect icon preview/grid.

Execution notes:

- Inspect the internal `Icons` wrapper, installed icon collections, and existing explorer page implementation before editing.
- Build the icon list from reliable project-supported sources instead of brittle runtime assumptions.
- Keep the page shell fixed to the available content area and move scrolling into the two panes.
- Ensure settings state is wired to preview/grid rendering and remains type-safe.
- Verify `/example/components/icons` renders icons, prevents global page scrolling, and updates previews when controls change.

Validation:

- Run targeted type/lint checks for touched files where available.
- Run browser verification for the icons explorer page.
- Run `git diff --check` before committing.
