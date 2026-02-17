---
description: 布局自适应规则：PC/Tablet/Mobile、断点、有效显隐、userAdjusted
globs: src/layouts/**/*, src/stores/modules/layout.ts, src/stores/modules/device.ts
---

# 布局自适应规则

当任务涉及布局壳、侧栏显隐、方向、断点收展或 PC/Tablet/Mobile 行为时，必须阅读 `docs/ADAPTIVE_LAYOUT.md` 并遵循自适应系统。本规则总结了关键约束。

## 1. 单一驱动源

- **仅** `LayoutAdmin.runAdaptive()` 驱动布局模式、侧栏收展和有效显隐。
- **禁止**：从 views/components 或其他布局代码调用 `adaptToMobile`、`adaptToTablet`、`adaptPcByOrientation` 或 `adaptPcByBreakpoint`。
- **禁止**：在业务代码中直接设置 `layoutStore.mode` 或 `layoutStore.sidebarCollapse` 以实现"响应式布局"。

## 2. 有效显隐

- 管理壳中的侧栏/面包屑/标签/页脚显隐必须使用 LayoutAdmin 中的 `showSidebarEffective`、`showBreadcrumbEffective`、`showTabsEffective`、`showFooterEffective`。
- **禁止**：绕过这些并在管理壳内的渲染决策中使用 `layoutStore.showSidebar` 等。

## 3. 设置面板

- `SettingsContent.vue`：`isMobile = deviceStore.type === 'Mobile' || deviceStore.isMobileLayout`。
- 仅在这种情况下隐藏"布局模式"和"布局模块显示"；平板大屏和 PC 显示完整选项。

## 4. 用户偏好

- 当 `layoutStore.userAdjusted` 为 true 时，断点逻辑不得覆盖 `sidebarCollapse`（即 `adaptPcByBreakpoint(..., !layoutStore.userAdjusted)`）。
- 用户通过 `toggleSidebarCollapse` / `closeSidebarWithUserMark` 切换侧栏，通过 `markUserAdjusted()` 设置 `userAdjusted`。

## 5. 关键文件

- 决策入口：`src/layouts/modules/LayoutAdmin.tsx`（runAdaptive、showXxxEffective）
- Store 逻辑：`src/stores/modules/layout.ts`（adaptToMobile、adaptToTablet、adaptPcByOrientation、adaptPcByBreakpoint）
- 设备/断点：`src/stores/modules/device.ts`、`src/constants/breakpoints.ts`
- 完整语义：`docs/ADAPTIVE_LAYOUT.md`

## 6. 禁止

- 在设备 Store 之外直接检查 `window.innerWidth` 来实现"移动/平板"布局。
- 在 `runAdaptive` 或布局 Store 适配方法之外添加新的自适应分支，而不更新 `docs/ADAPTIVE_LAYOUT.md`。
