# 布局适配系统 (Adaptive Layout System)

> 当任务涉及「布局壳、侧栏显隐、横竖屏、断点收展、PC/平板/移动端」时，必须先阅读本文档并遵循。  
> 本文档是布局自适应逻辑的**单一真理来源**，与 `docs/PROJECT_PROTOCOL.md` §6.3、§11 及 `.cursor/rules/22-layouts.mdc` 配套使用。

## 0. 目标与原则

- **设备维度**：PC / Tablet / Mobile（`deviceStore.type`，基于 UA）。
- **视口维度**：`isMobileLayout`（width < lg）、`isTabletLayout`、`isPCLayout`（`deviceStore` getters，基于 `BREAKPOINTS.lg`）。
- **PC**：竖屏强制顶栏（horizontal），横屏不覆盖用户/持久化的 mode；侧栏显隐与收展由设置面板 + 断点 + `userAdjusted` 决定。
- **Tablet**：小视口走 `adaptToTablet(true)`（vertical + 收缩），大视口走 `adaptToTablet(false)` + 断点收展；有效显隐在小视口强制隐藏侧栏等。
- **Mobile**：小视口强制顶栏（`adaptToMobile(true)` → horizontal）；大视口恢复侧栏（`adaptToMobile(false)` → vertical）+ 断点收展。
- **用户偏好**：`userAdjusted` 为 true 时，断点逻辑不覆盖 `sidebarCollapse`（`adaptPcByBreakpoint(..., !userAdjusted)`）。

## 1. 核心入口与数据流

### 1.1 决策入口

- **唯一驱动**：`src/layouts/modules/LayoutAdmin.tsx` 中的 `runAdaptive()`。
- **触发时机**：`onMounted` 执行一次；`watch(deviceStore.isMobileLayout, isTabletLayout, isPCLayout, currentBreakpoint, type, orientation)` 变化时再次执行。

### 1.2 runAdaptive 分支逻辑（伪代码）

```
forceByUserPreference = !layoutStore.userAdjusted

if (deviceStore.type === 'PC') {
  layoutStore.adaptPcByOrientation(deviceStore.orientation)
  if (layoutStore.showSidebar)
    layoutStore.adaptPcByBreakpoint(deviceStore.currentBreakpoint, forceByUserPreference)
  return
}

if (deviceStore.type === 'Tablet') {
  if (deviceStore.isMobileLayout)
    layoutStore.adaptToTablet(true, true)
  else {
    layoutStore.adaptToTablet(false, true)
    if (layoutStore.showSidebar)
      layoutStore.adaptPcByBreakpoint(deviceStore.currentBreakpoint, forceByUserPreference)
  }
  return
}

if (deviceStore.isMobileLayout) {
  layoutStore.adaptToMobile(true, true)
  return
}

// Mobile 大视口：恢复侧栏模式，再按断点收展
layoutStore.adaptToMobile(false, true)
if (layoutStore.showSidebar)
  layoutStore.adaptPcByBreakpoint(deviceStore.currentBreakpoint, forceByUserPreference)
```

### 1.3 Layout Store 适配方法语义

| 方法                                     | 作用                                                                         | 调用方                                    |
| ---------------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------- |
| `adaptPcByOrientation(orientation)`      | 仅竖屏 → `mode = 'horizontal'`；横屏不覆盖 mode                              | runAdaptive（PC 分支）                    |
| `adaptPcByBreakpoint(breakpoint, force)` | xs/sm/md 收缩侧栏，lg 及以上展开；`force = !userAdjusted` 时尊重用户手动收展 | runAdaptive（PC / Tablet 宽 / Mobile 宽） |
| `adaptToMobile(isMobile, force)`         | isMobile 为 true → horizontal + 收缩；为 false → vertical（大视口恢复）      | runAdaptive（Mobile 分支）                |
| `adaptToTablet(isTablet, force)`         | isTablet 为 true → vertical + 收缩；为 false 为 no-op                        | runAdaptive（Tablet 分支）                |

### 1.4 有效显隐（展示层）

- **定义位置**：`LayoutAdmin.tsx` 中的 `showSidebarEffective`、`showTabsEffective`、`showBreadcrumbEffective`、`showFooterEffective`。
- **规则**：
  - **PC**：直接使用 `layoutStore.showSidebar` / showTabs / showBreadcrumb / showFooter（不因视口强制隐藏）。
  - **非 PC 且 isMobileLayout**：强制为 `false`（侧栏/面包屑/Tabs/Footer 不渲染）。
  - **非 PC 且 !isMobileLayout**：使用 `layoutStore.showXxx`。
- **用途**：传给 AdminSidebar、AdminBreadcrumbBar、AdminTabsBar、AdminFooterBar 的 `show` 等 props；业务与设置面板不直接改这些有效显隐，只改 store 的 visibilitySettings。

### 1.5 设置面板与移动端

- **文件**：`src/layouts/components/GlobalSetting/SettingsContent.vue`。
- **isMobile**：`deviceStore.type === 'Mobile' || deviceStore.isMobileLayout`。
- **效果**：仅手机或小视口时隐藏「布局模式」与「布局模块显示」；平板大屏（Tablet 且 width ≥ lg）与 PC 展示完整选项。

### 1.6 用户偏好 userAdjusted

- **含义**：用户曾手动收/展侧栏时置为 true（如 `toggleSidebarCollapse`、`closeSidebarWithUserMark` 中调用 `markUserAdjusted()`）。
- **持久化**：在 `LAYOUT_PERSIST_PICK` 中，会持久化到 localStorage。
- **适配时**：`adaptPcByBreakpoint(breakpoint, force)` 的 `force` 传 `!layoutStore.userAdjusted`，即用户已调整则断点逻辑不再覆盖 `sidebarCollapse`。

## 2. 关键文件与类型

| 用途                           | 路径                                                                                                                    |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| 设备/视口/断点                 | `src/stores/modules/device.ts`（type、orientation、currentBreakpoint、isMobileLayout）                                  |
| 布局 mode/侧栏收展/显隐/持久化 | `src/stores/modules/layout.ts`（adaptToMobile、adaptToTablet、adaptPcByOrientation、adaptPcByBreakpoint、userAdjusted） |
| 适配入口与有效显隐             | `src/layouts/modules/LayoutAdmin.tsx`（runAdaptive、showXxxEffective）                                                  |
| 断点常量                       | `src/constants/breakpoints.ts`（BREAKPOINTS，lg=1024）                                                                  |
| 布局常量/持久化字段            | `src/constants/layout.ts`（DEFAULT_LAYOUT_SETTING、LAYOUT_PERSIST_PICK）                                                |
| 设置面板 isMobile              | `src/layouts/components/GlobalSetting/SettingsContent.vue`                                                              |
| 设备类型定义                   | `src/types/systems/device.d.ts`（DeviceState、DeviceType、Orientation）                                                 |
| 布局类型定义                   | `src/types/systems/layout.d.ts`（LayoutSetting、AdminLayoutMode、LayoutVisibilitySetting）                              |

## 3. 禁止项 (Forbidden)

- 在 **views / components / 其他 layout 组件** 中直接调用 `adaptToMobile`、`adaptToTablet`、`adaptPcByOrientation`、`adaptPcByBreakpoint`；适配逻辑仅由 `LayoutAdmin.runAdaptive` 驱动。
- 在业务中直接修改 `layoutStore.mode` 或 `layoutStore.sidebarCollapse` 以实现「响应式布局」；应通过设置面板或上述 adapt 方法（且仅通过 runAdaptive 间接调用）。
- 在展示侧栏/面包屑/Tabs/Footer 时绕过 `showSidebarEffective` 等，直接使用 `layoutStore.showSidebar` 等（在 LayoutAdmin 壳内必须使用有效显隐）。
- 在设置面板以外根据 `window.innerWidth` 自定义「移动端/平板」判定；应使用 `useDeviceStore()` 的 getters（isMobileLayout、isTabletLayout、type）。

## 4. 扩展与修改适配逻辑时

- 修改分支或断点规则：只改 `LayoutAdmin.tsx` 的 `runAdaptive` 或 `src/stores/modules/layout.ts` 的 adapt 方法，并同步更新本文档。
- 新增「有效显隐」：在 LayoutAdmin 中增加 computed，并在传给对应子组件处使用；不得在业务视图里重复实现「小视口隐藏侧栏」等逻辑。
- 新增设备或断点行为：先更新 `deviceStore` / `breakpoints.ts` 与类型定义，再在 runAdaptive 中增加分支，并在本文档中补充说明。
