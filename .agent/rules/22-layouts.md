---
description: Layouts system: LayoutMode, AdminLayoutMode, layout shells, extension; Scope and Non-negotiables
globs: src/layouts/**/*.{ts,vue}
alwaysApply: false
---

# Layouts Rule (Must Read Spec)

<CRITICAL>
Before making ANY changes to layout wrappers, layout modules, or layout stores, you MUST read and comply with `docs/ai-specs/LAYOUT_ARCHITECTURE.md`.
</CRITICAL>

## Scope

- `src/layouts/**`
- `src/stores/modules/layout.ts`
- `src/stores/modules/device.ts`
- Any router code that changes `route.meta.parent` behaviors (`LayoutMode`)

## Non-negotiables (Quick Reminders)

- **Business pivot for wide desktop is xl (1280px). lg (1024px) is considered a narrow fallback zone.** Do NOT treat lg as wide screen; effectiveMode and sidebar collapse use xl as the expand threshold. See `docs/ai-specs/ADAPTIVE_LAYOUT.md` §0.1.
- Dual-track mode is mandatory: `preferredMode` (user preference) vs `effectiveMode` (runtime resolution).
- `runAdaptive()` / `adapt*()` MUST NOT mutate `preferredMode`.
- Visibility SSOT is `visibilitySettings[effectiveMode]`, while Settings panel binds to `visibilitySettings[preferredMode]`.
- Mobile Drawer is UI behavior; state is `mobileDrawerOpen` (runtime-only). Drawer activates when `(deviceStore.type === 'Mobile' OR currentBreakpoint is xs or sm)` and mode is horizontal. **xs and sm MUST trigger the Drawer**; do NOT document Drawer as "Mobile only".

# Layouts System Rules

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

Modes:

- **vertical**: Sidebar on left, no top menu
- **horizontal**: Top menu, no sidebar
- **mix**: Sidebar + top menu

Type: `src/types/systems/layout.d.ts` → `AdminLayoutMode`

## 3. LayoutSetting and Constants

- Definition: `src/types/systems/layout.d.ts` → `LayoutSetting`
- Default: `src/constants/layout.ts` → `DEFAULT_LAYOUT_SETTING`
- Persistence: `LAYOUT_PERSIST_PICK` derived from `DEFAULT_LAYOUT_SETTING`
- New fields: add only in `DEFAULT_LAYOUT_SETTING`

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
2. Set default in `DEFAULT_LAYOUT_SETTING.mode` (or keep vertical)
3. Implement layout logic in `LayoutAdmin.tsx` (sidebar / top menu / body visibility); MUST follow `docs/ai-specs/ADAPTIVE_LAYOUT.md`, do NOT bypass runAdaptive or effective visibility

Note: **Drawer Zone** (xs, sm, or Mobile) → Drawer; **Top Menu Fallback** (md, lg) → top menu; **Wide Zone** (≥ xl) → respect preferredMode / Tablet sidebar. Logo: always in Drawer Zone and on Tablet; hidden on PC in md/lg only. See `docs/ai-specs/ADAPTIVE_LAYOUT.md` §0.1.

## 7. Route Config

- `meta.parent`: Set explicitly; defaults to `'admin'` if unset
- `meta.ratio`: Only for ratio shell; defaults to `'16:9'` via `normalizeRatioMetaOnRoutes` if unset

## 8. Forbidden

- Directly referencing layout shells in views/components
- Bypassing `meta.parent` to decide layout
- Defining LayoutSetting defaults outside `DEFAULT_LAYOUT_SETTING`
- Persisting LayoutSetting fields outside layout store

## 9. Transparent Root Policy (Admin Layout Only)

**Scope:** Route views under `meta.parent === 'admin'` (LayoutAdmin shell).

**Rule:** The root container of a route view MUST NOT set background classes (`bg-card`, `bg-background`, `bg-surface-ground`, `bg-surface-elevated`, or `surface-*` shortcuts) on its top-level wrapper. The layout engine (`LayoutAdmin`) already provides the premium canvas background (`bg-card` with inset shadow) for the main content area.

**Requirements:**

- Root: Use `col-fill` (or `h-full flex flex-col overflow-hidden`) **without** `bg-*` or `surface-*`.
- Toolbars/Headers: Do NOT add background colors. Let them inherit the canvas color. Use subtle borders (`border-b-default`) if separation is needed.
- Text colors: Inherit by default (`text-foreground`, `text-muted-foreground`).
- Internal components: Use `surface-elevated`, `glass-surface`, or `shadow-soft` **only** on actual data cards, panels, and widgets **inside** the transparent page.
