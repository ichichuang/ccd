---
description: Layouts system: LayoutMode, AdminLayoutMode, layout shells, extension
globs: src/layouts/**/*.{ts,vue}
---

# Layouts System Rules

> **CRITICAL**
>
> Before making ANY changes to layout wrappers, layout modules, or layout stores, you MUST read and comply with `docs/ai-specs/LAYOUT_ARCHITECTURE.md`.

## 1. Primary Directive

Layout is determined by `route.meta.parent` (LayoutMode); `layouts/index.vue` switches accordingly.
Business code MUST NOT directly reference or switch layout shells.

## 2. Two-Layer Layout Concept

### 2.1 LayoutMode (layer 1: layout shell)

- **admin**: Admin shell (Header + Sidebar/Breadcrumb/Tabs/Content/Footer)
- **fullscreen**: Fullscreen shell (Login, error page, config page, etc.)
- **ratio**: Fixed ratio shell (dashboard, demo); requires `meta.ratio`

Type: `src/types/systems/layout.d.ts` → `LayoutMode`

### 2.2 AdminLayoutMode (layer 2: admin shell structure)

**Only when LayoutMode = admin**, the admin-shell structure is determined by the layout store's **dual-track mode**:

- `preferredMode`: persisted user preference (set by Settings panel only)
- `effectiveMode`: runtime resolution based on device constraints (SSOT for rendering)

- **vertical**: Sidebar on left, no top menu
- **horizontal**: Top menu, no sidebar
- **mix**: Sidebar + top menu

Type: `src/types/systems/layout.d.ts` → `AdminLayoutMode`

## 3. LayoutSetting and Constants

- Definition: `src/types/systems/layout.d.ts` → `LayoutSetting`
- Default: `src/constants/layout.ts` → `DEFAULT_LAYOUT_SETTING`
- Persistence: `src/constants/layout.ts` → `LAYOUT_PERSIST_PICK` (explicit list; do NOT derive dynamically)
- Visibility SSOT: `visibilitySettings[effectiveMode]`; Settings panel binds to `visibilitySettings[preferredMode]` to prevent viewport-resize jumping

> **Forbidden**
>
> - `runAdaptive()` / `adapt*()` MUST NOT mutate `preferredMode`
> - Do NOT implement ad-hoc mode resolution in components; use store `effectiveMode` / `mode`

## 4. Directory and Aliases

- Shells: `src/layouts/modules/`
- Internal components: `src/layouts/components/`
- Layout import: `@&/*` → `src/layouts/components/*`
- **PrimeVue global UI**: Toast, Confirm, Dialog and `window.$toast`/`window.$message` are mounted in `src/layouts/components/AppPrimeVueGlobals.vue`; `App.vue` only references it. Do NOT re-mount or wrap Toast/Message in `App.vue`. Toast style overrides (centered Message, close button) in that component's `<style>` and `docs/ai-specs/TOAST_AND_MESSAGE.md`.

## 5. Explicit Import

`src/layouts` is NOT in Components auto-import; MUST use explicit import.

## 6. Extension Rules

### 6.1 Extend new LayoutMode (new shell)

1. Add new value to `LayoutMode`
2. Support it in `RouteMeta.parent`
3. Create `src/layouts/modules/LayoutXxx.vue` or `LayoutXxx.tsx` (same pattern as existing shells; admin uses .tsx)
4. Add branch and `layoutAnimations` config in `src/layouts/index.vue`

### 6.2 Extend new AdminLayoutMode (admin sub-mode)

1. Add new value to `AdminLayoutMode`
2. Set default in `DEFAULT_LAYOUT_SETTING.preferredMode` (or keep vertical)
3. Implement layout logic in `LayoutAdmin.tsx` (sidebar / top menu / body visibility); MUST follow `docs/ai-specs/LAYOUT_ARCHITECTURE.md` and the existing dual-track rules (do NOT bypass `effectiveMode` / visibility SSOT)

Note: Mobile small viewport forces horizontal (Drawer); tablet is vertical+collapse; PC vertical orientation forces horizontal. See `docs/ai-specs/LAYOUT_ARCHITECTURE.md` (Chapter 2/4).

## 7. Route Config

- `meta.parent`: Set explicitly; defaults to `'admin'` if unset
- `meta.ratio`: Only for ratio shell; defaults to `'16:9'` via `normalizeRatioMetaOnRoutes` if unset

## 8. Forbidden

- Directly referencing layout shells in views/components
- Bypassing `meta.parent` to decide layout
- Defining LayoutSetting defaults outside `DEFAULT_LAYOUT_SETTING`
- Persisting LayoutSetting fields outside layout store
