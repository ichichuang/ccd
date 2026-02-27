---
description: Adaptive layout rules: PC/Tablet/Mobile, breakpoints, effective visibility, userAdjusted
globs: src/layouts/**/*, src/stores/modules/layout.ts, src/stores/modules/device.ts
---

# Adaptive Layout Rules

When a task involves layout shell, sidebar visibility, orientation, breakpoint collapse, or PC/Tablet/Mobile behavior, you MUST read `docs/ai-specs/ADAPTIVE_LAYOUT.md` and follow the adaptive system. This rule summarizes key constraints.

## 1. Single Driver

- **Only** `LayoutAdmin.runAdaptive()` drives layout mode, sidebar collapse, and effective visibility.
- **FORBIDDEN**: Calling `adaptToMobile`, `adaptToTablet`, `adaptPcByOrientation`, or `adaptPcByBreakpoint` from views/components or other layout code.
- **FORBIDDEN**: Directly setting `layoutStore.mode` or `layoutStore.sidebarCollapse` in business code to achieve "responsive layout".

## 2. Effective Visibility

- Managing sidebar/breadcrumb/tabs/footer visibility in the shell MUST use LayoutAdmin's `showSidebarEffective`, `showBreadcrumbEffective`, `showTabsEffective`, `showFooterEffective`.
- **FORBIDDEN**: Bypassing these and using `layoutStore.showSidebar` etc. in render decisions inside the admin shell.

## 3. Settings Panel

- `SettingsContent.vue`: `isMobile = deviceStore.type === 'Mobile' || deviceStore.isMobileLayout`.
- Only in that case hide "Layout Mode" and "Layout Module Visibility"; show full options on tablet large screen and PC.

## 4. User Preference

- When `layoutStore.userAdjusted` is true, breakpoint logic MUST NOT override `sidebarCollapse` (i.e. `adaptPcByBreakpoint(..., !layoutStore.userAdjusted)`).
- User toggles sidebar via `toggleSidebarCollapse` / `closeSidebarWithUserMark`; `markUserAdjusted()` sets `userAdjusted`.

## 5. Key Files

- Entry: `src/layouts/modules/LayoutAdmin.tsx` (runAdaptive, showXxxEffective)
- Store logic: `src/stores/modules/layout.ts` (adaptToMobile, adaptToTablet, adaptPcByOrientation, adaptPcByBreakpoint)
- Device/breakpoints: `src/stores/modules/device.ts`, `src/constants/breakpoints.ts`
- Full semantics: `docs/ai-specs/ADAPTIVE_LAYOUT.md`

## 6. Forbidden

- Checking `window.innerWidth` directly outside the device store to implement "mobile/tablet" layout.
- Adding new adaptive branches without updating `runAdaptive` or layout store adapt methods, and without updating `docs/ai-specs/ADAPTIVE_LAYOUT.md`.
