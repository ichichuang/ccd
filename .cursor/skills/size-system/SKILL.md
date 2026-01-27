# 尺寸系统 (Size System) — 任务指引

当用户要求**新增尺寸模式**、**修改圆角/间距基数**、**新增布局变量**（如新的高度/宽度类名）、或**排查尺寸/圆角/间距不生效**时，使用本技能。

## 文件角色

| 文件                            | 职责                                                                                                                                                                                                                                   |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/constants/size.ts`         | 尺寸预设唯一数据源。`SIZE_PRESETS`、`DEFAULT_SIZE_NAME`。                                                                                                                                                                              |
| `src/types/systems/size.d.ts`   | 全局类型 `SizeMode`、`SizePreset`、`SizeCssVars`（含 `--container-padding`）、`SizeStoreState`。                                                                                                                                       |
| `src/constants/sizeScale.ts`    | 阶梯倍率表 SSOT：`SIZE_SCALE_KEYS`（xs-5xl，9 级键名数组）、`FONT_SCALE_RATIOS`、`SPACING_SCALE_RATIOS`（xs-5xl，9 级）。                                                                                                              |
| `src/utils/theme/sizeEngine.ts` | `generateSizeVars(preset)` → `SizeCssVars`（使用 `SIZE_SCALE_KEYS` 遍历生成字体/间距阶梯 xs-5xl；含 `--container-padding` = `spacingBase * 5`）；`applySizeTheme(vars)` 写入根元素。                                                   |
| `src/stores/modules/size.ts`    | state 类型 `SizeStoreState`（`sizeName`），getter `currentPreset`，动态 getters（`getGap()`、`getGapl()`、`getPaddingsValue()`、`getFontSizeValue()`、`getFontSizesValue()`，用于图表等业务场景），`setSize(name)`、`init()`，持久化。 |
| `uno.config.ts`                 | `LAYOUT_SIZES`（camelCase）、`createLayoutVariableRules()`、`createSemanticSizeRules()`、`createScaleRules()`（阶梯规则）、`theme.borderRadius`、`theme.spacing`。                                                                     |

## 新增尺寸预设

1. 在 `src/constants/size.ts` 的 `SIZE_PRESETS` 中增加一项，满足 `SizePreset`（name、label、radius、spacingBase、**fontSizeBase**（用于计算字体阶梯 xs-5xl）、sidebarWidth、sidebarCollapsedWidth、headerHeight、breadcrumbHeight、footerHeight、tabsHeight；**不包含 contentHeight**，contentHeight 需在页面中根据布局模式动态计算，如 `calc(100vh - var(--header-height) - var(--footer-height) - var(--tabs-height))`）。
2. 若需改为默认模式，修改 `DEFAULT_SIZE_NAME` 为对应 `SizeMode`。
3. 无需改类型或 engine，store 会通过 `currentPreset` 自动使用新预设；`sizeEngine.ts` 会根据 `fontSizeBase` 与 `spacingBase` 自动生成字体/间距阶梯变量（`--font-size-xs` 到 `--font-size-5xl`、`--spacing-xs` 到 `--spacing-5xl`）。

## 新增布局变量（新类名如 h-xxxHeight）

1. **类型**：在 `src/types/systems/size.d.ts` 的 `SizePreset` 中增加字段（camelCase）；在 `SizeCssVars` 中增加对应 `'--xxx-xxx'`（kebab-case）。
2. **引擎**：在 `src/utils/theme/sizeEngine.ts` 的 `generateSizeVars` 返回值中增加该变量（preset 字段 → `--kebab-case`）。
3. **Uno**：在 `uno.config.ts` 的 `LAYOUT_SIZES` 数组中增加 camelCase 名（与类名一致，如 `w-sidebarWidth` 对应 `sidebarWidth`）。`createLayoutVariableRules()` 会自动把 camelCase 转为 `--kebab-case` 的 CSS 变量。
4. **阶梯规则**：若涉及阶梯类名（如 `fs-xl`、`p-scale-lg`），需同步 `src/constants/sizeScale.ts` 的倍率表（`FONT_SCALE_RATIOS` 或 `SPACING_SCALE_RATIOS`）。

## 排错：尺寸/圆角/间距不生效

按顺序检查：

1. Store 是否在应用入口调用了 `useSizeStore().init()` 或首次 `setSize(sizeName)`。
2. 根元素（`document.documentElement`）上是否有 `--radius`、`--spacing-unit`、**`--container-padding`**、`--sidebar-width`、**`--font-size-xs` 到 `--font-size-5xl`**、**`--spacing-xs` 到 `--spacing-5xl`** 等变量（开发者工具 Computed 或 Styles）。
3. 新增的布局类名是否已加入 `uno.config.ts` 的 `LAYOUT_SIZES`（camelCase 须与类名一致）。
4. `sizeEngine.ts` 的 `generateSizeVars` 是否输出了该变量；`constants/size.ts` 的预设中是否包含对应字段。
