---
description: 布局自适应规则：PC/Tablet/Mobile、断点、有效显隐、userAdjusted
globs: src/layouts/**/*, src/stores/modules/layout.ts, src/stores/modules/device.ts
---

# Adaptive Layout Rules

When the task involves layout shell, sidebar visibility, orientation, breakpoint collapse, or PC/Tablet/Mobile behavior, you MUST read `docs/ADAPTIVE_LAYOUT.md` and follow the adaptive system. This rule summarizes the key constraints.

## 1. Single Driver

- **Only** `LayoutAdmin.runAdaptive()` drives layout mode, sidebar collapse, and effective visibility.
- **Forbidden**: Calling `adaptToMobile`, `adaptToTablet`, `adaptPcByOrientation`, or `adaptPcByBreakpoint` from views/components or other layout code.
- **Forbidden**: Setting `layoutStore.mode` or `layoutStore.sidebarCollapse` directly in business code to achieve "responsive layout".

## 2. Effective Visibility

- Sidebar / Breadcrumb / Tabs / Footer visibility in the admin shell MUST use `showSidebarEffective`, `showBreadcrumbEffective`, `showTabsEffective`, `showFooterEffective` from LayoutAdmin.
- **Forbidden**: Bypassing these and using `layoutStore.showSidebar` etc. for rendering decisions inside the admin shell.

## 3. Settings Panel

- `SettingsContent.vue`: `isMobile = deviceStore.type === 'Mobile' || deviceStore.isMobileLayout`.
- Only then hide "布局模式" and "布局模块显示"; tablet large screen and PC show full options.

## 4. User Preference

- When `layoutStore.userAdjusted` is true, breakpoint logic must NOT overwrite `sidebarCollapse` (i.e. `adaptPcByBreakpoint(..., !layoutStore.userAdjusted)`).
- User toggles sidebar via `toggleSidebarCollapse` / `closeSidebarWithUserMark` set `userAdjusted` via `markUserAdjusted()`.

## 5. Key Files

- Decision entry: `src/layouts/modules/LayoutAdmin.tsx` (runAdaptive, showXxxEffective)
- Store logic: `src/stores/modules/layout.ts` (adaptToMobile, adaptToTablet, adaptPcByOrientation, adaptPcByBreakpoint)
- Device/breakpoint: `src/stores/modules/device.ts`, `src/constants/breakpoints.ts`
- Full semantics: `docs/ADAPTIVE_LAYOUT.md`

## 6. Forbidden

- Implementing "mobile/tablet" layout by directly checking `window.innerWidth` outside the device store.
- Adding new adaptive branches outside `runAdaptive` or the layout store adapt methods without updating `docs/ADAPTIVE_LAYOUT.md`.
