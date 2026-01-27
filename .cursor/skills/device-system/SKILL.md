# 设备系统 (Device System) — 任务指引

当用户要求**新增断点**、**修改设备检测逻辑**、或**排查响应式不生效**时，使用本技能。

## 文件角色

| 文件                                  | 职责                                                                                                                                                                                                                            |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/types/systems/device.d.ts`       | 全局类型：`DeviceType`、`OsType`、`Orientation`、`DeviceState`（扁平化结构，符合 Pinia 最佳实践）、`BreakpointKey`。                                                                                                            |
| `src/constants/breakpoints.ts`        | 断点定义 SSOT：`BREAKPOINTS`（xs → 5xl，覆盖移动端到 4K）、`BreakpointKey`。                                                                                                                                                    |
| `src/stores/modules/device.ts`        | 设备检测：`detectDeviceInfo()`（UA + Screen + 视口信息）、`init()`（事件监听：resize、orientationchange、pageshow、visibilitychange，防抖 300ms，返回清理函数）、兼容性 Getters（`isMobile`、`isTablet`、`getDefinitely` 等）。 |
| `uno.config.ts`                       | `theme.breakpoints` 从 `BREAKPOINTS` 导入。                                                                                                                                                                                     |
| `src/layouts/modules/LayoutAdmin.vue` | watch `deviceStore.isMobileLayout` / `isTabletLayout` → 触发布局响应式适配。                                                                                                                                                    |

设备 store 在 `src/plugins/modules/stores.ts` 的 setupStores 中调用 `deviceStore.init()`，排错时可先确认该处已执行。

## 新增断点

1. **数据源**：在 `src/constants/breakpoints.ts` 的 `BREAKPOINTS` 中增加新断点（如 `'6xl': '5120px'`）。
2. **类型**：在 `src/types/systems/device.d.ts` 的 `BreakpointKey` 中增加对应 key（如 `'6xl'`）。
3. **Uno**：`uno.config.ts` 的 `theme.breakpoints` 从 `BREAKPOINTS` 导入，会自动包含新断点。

## 排错：响应式不生效

按顺序检查：

1. Store 是否在应用入口调用了 `useDeviceStore().init()`（见 `plugins/modules/stores.ts`）。
2. 事件监听是否正常：`init()` 返回清理函数，确保在组件卸载时调用；防抖 300ms 是否导致延迟。
3. `LayoutAdmin.vue` 是否 watch `deviceStore.isMobileLayout` / `isTabletLayout` 并调用 `adaptToMobile()` / `adaptToTablet()`。
4. `BREAKPOINTS` 与 `uno.config.ts` 的 `theme.breakpoints` 是否一致。
