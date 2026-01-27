# 主题配色系统 (Theme / Color System) — 任务指引

当用户要求**新增主题预设**、**新增语义色**（如新的状态色或 sidebar 衍生色）、**新增/修改主题切换动画模式（View Transition Multi-mode）**、或**排查主题/深色模式/切换动画不生效**时，使用本技能。

## 文件角色

| 文件                                            | 职责                                                                                                                                                                                                                                                                                                                                                              |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/constants/theme.ts`                        | 主题预设唯一数据源。`THEME_PRESETS`、`DEFAULT_THEME_NAME`。                                                                                                                                                                                                                                                                                                       |
| `src/types/systems/theme.d.ts`                  | 全局类型 `ThemeMode`、`ThemePreset`、`ThemeCssVars`。CSS 变量值须为 RGB 三通道串。                                                                                                                                                                                                                                                                                |
| `src/utils/theme/colors.ts`                     | 纯函数：`normalizeHex`、`hexToRgb`、`adjustBrightness`、`isDarkColor`、**`mixHex(color1, color2, weight): string`**（两色按权重线性混合，用于 accent 与 light 变体）。                                                                                                                                                                                            |
| `src/utils/theme/engine.ts`                     | `generateThemeVars(preset, isDark)` 生成 `ThemeCssVars`；`applyTheme(vars)` 写入根元素。可调参数统一在 **`THEME_ENGINE`** 常量对象中；背景使用 **backgroundDark / backgroundLight**（未提供时用引擎默认）；accent 未提供时由引擎用 primary + neutral 混合回退；destructive、warn、success 及其 **hover、light、light-foreground** 由引擎计算并写入对应 CSS 变量。 |
| `src/stores/modules/theme.ts`                   | 状态 `mode`、`themeName`，`refreshTheme()` 直接调用 `generateThemeVars(preset, isDark)`（不再克隆或 delete preset.background），`init()`，持久化。                                                                                                                                                                                                                |
| `src/utils/theme/transitions.ts`                | **主题切换策略工具（只做计算/读值/返回配置）**：`calculateCircleRadius()`、`calculateDiamondRadius()`、`getBackgroundColor(cssVar)`（读取根元素 CSS 变量 RGB 并转 Hex）、`getTransitionConfig(mode, event)`（返回 `{ duration, easing, overlay? }`）。禁止在此文件修改 `documentElement` 的 `class/dataset/style` 或创建/移除 DOM。                               |
| `src/hooks/modules/useThemeSwitch.ts`           | **主题切换执行器（View Transition + 协议注入 + 清理）**：设置/清理 `data-transition`；注入/清理 `--transition-x/y/radius`；写入/清理 `--bg100-old/new`；按 `overlay` 选项创建/清理 `.theme-fade-overlay`；不支持 `startViewTransition` 时降级为直接切换。                                                                                                         |
| `src/assets/styles/theme/transitions.scss`      | 主题切换样式入口：聚合所有 mode；定义 `::view-transition-old/new(root)` 的背景快照与分层；定义 `.theme-fade-overlay` 基础样式；提供 `@supports not (view-transition-name: root)` 降级。                                                                                                                                                                           |
| `src/assets/styles/theme/modes/*.scss`          | **动画执行层（CSS-driven）**：每个模式用 `[data-transition='<mode>']` 选择器实现动画（circle/implosion 依赖 `--transition-x/y/radius`；其余可为静态 keyframes）。                                                                                                                                                                                                 |
| `src/assets/styles/custom.scss` / `src/main.ts` | 全局样式入口链路：`main.ts` 引入 `custom.scss`，间接引入 `theme/transitions.scss`。                                                                                                                                                                                                                                                                               |
| `src/plugins/modules/stores.ts`                 | store 初始化：调用 `themeStore.init()`，确保 `auto` 模式监听系统暗黑并刷新。                                                                                                                                                                                                                                                                                      |
| `uno.config.ts`                                 | `theme.colors` 全部使用 `rgb(var(--xxx) / <alpha-value>)`，变量名与 `ThemeCssVars` 一一对应。动态类名展示配色时需在 **`themeDemoSafelist`** 中声明该类名（如 `bg-warn`、`bg-warn-hover`、`text-sidebar-primary-foreground`）。                                                                                                                                    |

主题 store 在 `src/plugins/modules/stores.ts` 的 setupStores 中调用 `themeStore.init()`，排错时可先确认该处已执行。

## 新增主题预设

1. 在 `src/constants/theme.ts` 的 `THEME_PRESETS` 中增加一项，满足 `ThemePreset`（name、label、primary；可选 **backgroundDark**、**backgroundLight**、neutral、accent、warn、success）。
2. 若需改为默认主题，修改 `DEFAULT_THEME_NAME`。
3. 无需改类型或 engine，store 在 `refreshTheme()` 中会直接传 preset 给 `generateThemeVars(preset, isDark)`，由引擎根据 isDark 使用 backgroundDark / backgroundLight。

## 新增语义色（新 CSS 变量与 Uno 类名）

1. **类型**：在 `src/types/systems/theme.d.ts` 的 `ThemeCssVars` 中增加键（如 `'--warn-hover': string`）。
2. **引擎**：在 `src/utils/theme/engine.ts` 的 `generateThemeVars` 返回值中增加该变量，值须为 RGB 三通道串（通过 `hexToRgb(...)`、`mixHex(...)` 或 `adjustBrightness(...)` 等计算）；如需新可调参数，在 **`THEME_ENGINE`** 中增加。
3. **Uno**：在 `uno.config.ts` 的 `theme.colors` 中增加对应映射（如 `warn: { hover: 'rgb(var(--warn-hover) / <alpha-value>)' }`），与 `ThemeCssVars` 键名一致。
4. 若主题页或 elsewhere 用**动态类名**（如 `bg-${name}`）展示该色，需在 **`themeDemoSafelist`** 中加入该类名（如 `bg-warn-hover`），否则 Uno 可能不生成。

## 主题切换（View Transition Multi-mode）

### 核心约束（必须遵守）

- **CSS-driven**：动画执行只能写在 `src/assets/styles/theme/modes/*.scss`（以及聚合入口 `src/assets/styles/theme/transitions.scss`）。
- **工具边界**：`src/utils/theme/transitions.ts` 只做“计算/读背景色/返回配置”，不得操控 DOM 动画与状态。
- **执行器唯一性**：`src/hooks/modules/useThemeSwitch.ts` 是唯一允许注入/清理下列协议的地方：
  - `data-transition`
  - `--transition-x` / `--transition-y` / `--transition-radius`
  - `--bg100-old` / `--bg100-new`
  - `.theme-fade-overlay`

### 新增一个过渡模式（例如新增 `wipe`）

1. **类型**：在 `src/types/systems/theme.d.ts` 扩展 `ThemeTransitionMode` union（新增 `'wipe'`）。
2. **策略**：在 `src/utils/theme/transitions.ts` 的 `getTransitionConfig()` 增加 `'wipe'` 分支（设置 `duration/easing`，按需给 `overlay`）。
3. **样式**：
   - 新增 `src/assets/styles/theme/modes/wipe.scss`，用 `[data-transition='wipe']` 定义 `::view-transition-new(root)` / `::view-transition-old(root)` 的动画。
   - 在 `src/assets/styles/theme/transitions.scss` 中 `@use './modes/wipe';` 聚合。
4. **Hook**：一般无需改 `useThemeSwitch`（除非新模式需要额外协议变量；默认只依赖 `data-transition` 与 `--bg100-old/new` 即可）。
5. **Store**：如需默认模式，改 `src/stores/modules/theme.ts` 的 `transitionMode` 初始值；`setTransitionMode()` 不触发 `refreshTheme()`（保持只更新模式）。

### 排错：动画不生效 / 闪白 / 残留遮罩

按顺序检查：

1. **入口链路**：`src/main.ts` 是否引入 `src/assets/styles/custom.scss`，且 `custom.scss` 已 `@use '@/assets/styles/theme/transitions.scss';`。
2. **协议是否写入**：切换时根元素是否出现 `data-transition="<mode>"`；是否写入 `--bg100-old/new`；circle/implosion 是否写入 `--transition-x/y/radius`。
3. **是否清理**：动画结束后是否移除 `data-transition`、`--bg100-old/new`、`--transition-x/y/radius`；`.theme-fade-overlay` 是否被移除。
4. **浏览器支持**：若不支持 `document.startViewTransition`，应降级为直接切换（不会有 mode 动画）。
5. **闪白**：检查 `src/assets/styles/theme/transitions.scss` 的 `::view-transition-old/new(root)` 是否使用 `var(--bg100-old/new)`，并确保 Hook 在切换过程中写入这两个变量。

## 排错：主题/深色模式不生效

按顺序检查：

1. Store 是否在应用入口调用了 `useThemeStore().init()`（见 `plugins/modules/stores.ts`）。
2. 根元素（`document.documentElement`）上是否有 `--primary`、`--background`、**`--warn`**、**`--success`**、**`--accent-hover`**、**`--destructive-light`** 等变量（开发者工具 Computed 或 Styles）。
3. `engine.ts` 的 `generateThemeVars` 是否输出了该变量；深色模式是否传入正确的 `isDark`（来自 store.mode 与系统偏好）；是否用 **`THEME_ENGINE`** 与 **`mixHex`** 正确生成背景、accent 回退及 hover/light 系列。
4. `uno.config.ts` 的 `theme.colors` 是否引用同名变量（如 `--primary` → `primary.DEFAULT`）；若为动态类名，是否已加入 `themeDemoSafelist`。
