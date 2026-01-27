# 布局配置系统 (Layout Config System) — 任务指引

当用户要求**新增或修改布局配置项**、**修改布局默认值**（如默认收起侧栏、默认隐藏 tabs）、**调整持久化范围**、或**排查布局状态/刷新恢复异常**时，使用本技能。

## 文件角色

| 文件                                  | 职责                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/types/systems/layout.d.ts`       | 全局类型：`LayoutMode`（选壳）、`AdminLayoutMode`、`LayoutSetting`（显隐、固定、动画等）、`LayoutStoreState`（含 `userAdjusted` 标记）。                                                                                                                                                                                                                                                                                                                                                                                                    |
| `src/constants/layout.ts`             | 布局默认配置唯一来源：`DEFAULT_LAYOUT_SETTING`、`LAYOUT_PERSIST_PICK`（持久化白名单，当前由 DEFAULT 的 key 推导）。                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `src/stores/modules/layout.ts`        | state 类型 `LayoutStoreState`（展开 DEFAULT + `isLoading`、`isPageLoading`、`userAdjusted`）；提供 `adaptToMobile(isMobile, force)`、`adaptToTablet(isTablet, force)` 响应式适配方法（**PC 端 `adaptToMobile(false)` 不做任何修改，完全信任持久化数据**；移动端强制适配：收起侧边栏、垂直布局、隐藏 Tabs）；`userAdjusted` 机制防止自动适配覆盖用户设置；辅助方法 `markUserAdjusted()`、`closeSidebarWithUserMark()`；persist 使用 `LAYOUT_PERSIST_PICK`；提供 `useLayoutStoreWithOut()` 供在 setup 外（如 router guard、useLoading）使用。 |
| `src/layouts/modules/LayoutAdmin.vue` | watch `deviceStore.isMobileLayout` / `isTabletLayout`（`immediate: true`）→ 调用 `adaptToMobile()` / `adaptToTablet()`；平板切换逻辑：进入平板时调用 `adaptToTablet(true)`，退出时由 `adaptToMobile(false)` 处理恢复。                                                                                                                                                                                                                                                                                                                      |

布局 store **无 init**，依赖 Pinia 持久化恢复，与 theme/size 不同。

## 新增一项 LayoutSetting 配置

1. **类型**：在 `src/types/systems/layout.d.ts` 的 `LayoutSetting` 中增加字段及类型。
2. **默认值**：在 `src/constants/layout.ts` 的 `DEFAULT_LAYOUT_SETTING` 中增加该字段的默认值，与 `LayoutSetting` 一致。
3. **持久化**：当前 `LAYOUT_PERSIST_PICK` 由 `Object.keys(DEFAULT_LAYOUT_SETTING)` 推导，新 key 会自动被持久化；若日后改为按需白名单，不需持久化的字段不要放入 `LAYOUT_PERSIST_PICK`。

## 排错：布局状态或持久化异常

1. **状态不生效**：组件内使用 `useLayoutStore()`，在 setup 外（如 router guard、hooks）使用 `useLayoutStoreWithOut()`。
2. **刷新后恢复不对**：检查 persist 的 key 是否正确；`LAYOUT_PERSIST_PICK` 是否包含该字段；是否改过 `DEFAULT_LAYOUT_SETTING` 的 key 导致与已有持久化数据不一致。
3. **响应式适配异常**：检查 `userAdjusted` 是否为 `true`（若为 true，自动适配不会覆盖用户设置，除非 `force = true`）；检查 `LayoutAdmin.vue` 是否 watch `deviceStore.isMobileLayout` / `isTabletLayout`（`immediate: true`）并调用 `adaptToMobile()` / `adaptToTablet()`；确认 PC 端 `adaptToMobile(false)` 不做任何修改（完全信任持久化数据）。
4. 布局 store 无 init，无需检查「是否调用了 init」。
