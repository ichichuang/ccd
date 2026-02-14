# PrimeVue 主题融合 (Theme Integration)

> PrimeVue 组件与项目配色系统、尺寸系统的融合说明。当遇到 Button、Dialog 等组件配色异常时，应优先参考本文档。

## 1. 架构概览

### 1.1 核心文件

| 文件                                 | 职责                                 |
| ------------------------------------ | ------------------------------------ |
| `src/utils/theme/primevue-preset.ts` | PrimeVue 主题预设，Aura 的「适配层」 |
| `src/utils/theme/engine.ts`          | 生成 ThemeCssVars，写入 `:root`      |
| `src/types/systems/theme.d.ts`       | ThemeCssVars 类型定义                |
| `src/constants/theme.ts`             | 主题预设常量                         |

### 1.2 数据流

```
ThemePreset (constants/theme.ts)
    → generateThemeVars (engine.ts)
    → ThemeCssVars 写入 :root
    → primevue-preset.ts 通过 rgb(var(--xxx)) 消费
    → PrimeVue 组件 colorScheme 应用
```

PrimeVue preset 不直接依赖 Aura 的 semantic.json/primitive.json 色值，统一通过 `ThemeCssVars`（`--primary`、`--success-light` 等）引用。

## 2. 颜色适配器 (Color Adapter)

### 2.1 createColorAdapter

将 ThemeCssVars 的 key 转为 `rgb(var(--xxx))` 形式，供 colorScheme 使用：

- `getPrimary`、`getPrimaryForeground`、`getPrimaryHover`、`getPrimaryLight`
- `getSuccess`、`getSuccessForeground`、`getSuccessHover`、`getSuccessLight`
- `getInfo`、`getDestructive`、`getWarn`、`getHelp` 等同理

**重要**：`*-foreground` 用于「实心色块上的文字色」（如白字配红底）；`*-light` 用于「浅色背景 tint」（如 hover 时的淡绿/淡红背景）。

### 2.2 getAdapterKey

将 Aura 的 `(colorType, suffix)` 映射到 adapter 的 getter：

- `''` → 主色（如 getSuccess）
- `'Text'` → foreground（如 getSuccessForeground）
- `'Hover'` / `'Active'` → hover 色（如 getSuccessHover）
- `'Light'` → 浅色背景（如 getSuccessLight）；Secondary/Contrast 无 \*-light 时回退到 getMuted
- `'Border'` → 边框色

## 3. Button 配色规则（重点）

### 3.1 变体与 hover/active 语义

| 变体          | 默认        | Hover / Active 背景          | 说明                              |
| ------------- | ----------- | ---------------------------- | --------------------------------- |
| root (filled) | 实心主色    | get('Hover') / get('Active') | 标准按钮                          |
| text          | 透明        | get('Light')                 | 悬停时显示浅色 tint               |
| text + raised | 白底/卡底   | get('Light')                 | 同上                              |
| outlined      | 透明 + 边框 | get('Light')                 | 悬停时显示浅色 tint，保持文字可见 |
| link          | 透明        | 无背景，仅文字色变化         | -                                 |

### 3.2 关键约定（必读）

1. **text / outlined 的 hover 必须用 `*-light`**
   - `*-foreground` 在 engine 中，对浅色状态色（Success、Info 等）可能为黑色（E.fgLight），若误用作 hover 背景会导致「黑底彩字」。
   - 使用 `get('Light')` 可得到浅色 tint，与 Aura 设计一致。

2. **outlined 不应使用实色填充**
   - 若 hover 背景用 `get('')`（实色），会导致「红底红字」等文字不可读。
   - PrimeVue outlined 变体可能不应用 `hoverColor`，故必须用 `get('Light')` 作为 hover 背景。

3. **修改位置**
   - 所有 Button colorScheme 逻辑在 `initComponentButtonColorSchemeOptionsItems(colors, type)` 中。
   - 修改时需同时更新 `createColorAdapter`（若新增 getter）和 `getAdapterKey`（若新增 suffix）。

### 3.3 示例：正确 vs 错误

```ts
// ✅ 正确：text 变体 hover 用 Light
case 'text':
  return {
    hoverBackground: get('Light'),
    activeBackground: get('Light'),
    color: colorType === 'Secondary' ? get('Text') : get(''),
  }

// ❌ 错误：用 Text（*-foreground）作为 hover 背景 → 黑底彩字
hoverBackground: get('Text'),  // 勿用
```

```ts
// ✅ 正确：outlined 变体 hover 用 Light
case 'outlined':
  return {
    hoverBackground: get('Light'),
    activeBackground: get('Light'),
    hoverColor: get(''),
    activeColor: get(''),
    ...
  }

// ❌ 错误：用实色填充 → 红底红字不可读
hoverBackground: get(''),  // 勿用
```

## 4. 排查指引

当 Button 的 `variant="text"`、`variant="text" raised`、`variant="outlined"` 出现：

- 悬停/按下时背景变为纯黑或纯色
- 文字在悬停/按下时不可见

**检查顺序：**

1. 打开 `src/utils/theme/primevue-preset.ts`
2. 定位 `initComponentButtonColorSchemeOptionsItems` 中对应 type（`text` / `outlined`）
3. 确认 `hoverBackground`、`activeBackground` 使用 `get('Light')` 而非 `get('Text')` 或 `get('')`
4. 若需新增语义（如新的 \*-light），需在 `createColorAdapter` 和 `getAdapterKey` 中补充

## 5. 相关文档

- 配色系统：`docs/PROJECT_PROTOCOL.md` § 6.1
- 主题类型：`src/types/systems/theme.d.ts`
- 主题引擎：`src/utils/theme/engine.ts`
