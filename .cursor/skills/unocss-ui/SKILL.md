# UnoCSS UI 落地指引（优先类名，必要时 SCSS 兜底）

当你在 CCD 项目中开发/修改 UI（`.vue` / `.tsx`）并需要写样式时，严格遵守本技能：**优先使用 `uno.config.ts` 已定义的语义类与尺寸/断点管线**；仅在 UnoCSS 无法覆盖的特殊效果时才写 `<style scoped lang="scss">`，且 SCSS 必须用**层级嵌套**便于维护。

## 适用范围（何时使用）

- **页面 / 组件 UI**：所有 `src/views/**`、`src/components/**` 下的 `.vue` / `.tsx`
- **系统配置类页面**：主题、尺寸、断点模拟、布局预览等
- **任何会写 CSS/SCSS 的改动**

## 最高优先级原则（必须）

1. **语义类优先**：颜色/背景/文本/边框/阴影/圆角/间距/布局全部用 UnoCSS 语义类与尺寸类。
2. **系统数据源优先**：断点/主题/尺寸等必须引用架构内部配置（如 `BREAKPOINTS`、主题/尺寸引擎变量），不得页面内硬编码。
3. **SCSS 仅兜底**：只有 UnoCSS 无法实现时才写 scoped SCSS，并用嵌套层级写法。

## UnoCSS（语义类）使用规范

### 颜色/背景/文本（只允许语义类）

- 页面/容器：
  - `bg-background`：页面底色
  - `bg-card`：卡片/面板背景
- 文本：
  - `text-foreground`：主文本
  - `text-muted-foreground`：弱化文本
- 边框：
  - `border-border`：语义边框色
- 主色/交互：
  - `bg-primary`、`text-primary-foreground`
  - 透明度：使用 `/`（如 `bg-primary/15`、`bg-background/80`）

> 禁止：`#fff`、`rgba(...)`、`bg-#fff`、`text-#333`、`bg-blue-500` 等硬编码或非语义色（除非该类明确由 `uno.config.ts` 语义映射提供）。

### 尺寸/圆角/间距（只允许系统类/变量）

优先使用由尺寸系统生成的语义类（示例，具体以项目 `uno.config.ts` 为准）：

- 圆角：`rounded-lg`（映射 `var(--radius)`）
- 间距：`p-padding`、`gap-unit`（映射 `--spacing-unit`）
- 布局变量：`w-sidebarWidth`、`h-headerHeight` 等（映射 layout size vars）

> 禁止在 UI 层写死尺寸值（如 `padding: 20px`、`border-radius: 12px`、`width: 240px`），除非是**可视化调试工具**需要动态宽度（例如断点模拟器的 `width: ${currentWidth}px`）。

### 断点（必须使用 BREAKPOINTS / Uno breakpoints）

- 断点 SSOT：`src/constants/breakpoints.ts` 的 `BREAKPOINTS`
- UnoCSS `theme.breakpoints`：从 `BREAKPOINTS` 导入（由工程侧维护）

> 规则：组件内做响应式判断时，必须使用 `BREAKPOINTS.xxx`；不得写 `1024/1280` 等魔法数。

## 何时允许使用 `<style scoped lang="scss">`（严格兜底）

仅以下场景可使用 SCSS（满足其一即可）：

- **表单控件/原生 range** 等需要浏览器私有伪元素（如 `::-webkit-slider-thumb`）
- **复杂动效**：无法用 UnoCSS 类表达（关键帧、ViewTransition 以外的特殊动画）
- **复杂几何/裁剪**：`clip-path`、mask、滤镜组合等
- **第三方组件深层覆盖**：必须用选择器精确命中且无法通过 class 传递

其他所有常规样式（颜色、间距、排版、阴影、hover、transition）都应由 UnoCSS 类完成。

## SCSS 写法要求（必须“发挥 SCSS 优势”）

### 核心要求

- **层级嵌套**：以容器类作为根（建议 `class="..."` + `data-role` 或明确的根 class），内部按结构嵌套
- **避免散弹选择器**：禁止全局标签选择器污染（如 `div {}`、`* {}`）
- **复用语义变量**：优先 `var(--color-xxx)`、`var(--radius)`、`var(--spacing-unit)` 等系统变量
- **可维护性优先**：选择器不要超过 3 层，必要时用注释分区

### 推荐模板（复制即用）

以下模板用于“必须写 SCSS 的特殊控件”：

```scss
/* scoped + scss：仅写 UnoCSS 无法覆盖的部分 */
.your-component-root {
  /* 结构层级 */
  .control {
    /* 仅写必要的浏览器伪元素/特性 */
    input[type='range'] {
      -webkit-appearance: none;
      appearance: none;
    }

    /* WebKit */
    input[type='range']::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      border-radius: 9999px;
      background: var(--color-primary);
      border: 2px solid var(--color-background);
      cursor: pointer;
    }

    /* Firefox */
    input[type='range']::-moz-range-thumb {
      border-radius: 9999px;
      background: var(--color-primary);
      border: 2px solid var(--color-background);
      cursor: pointer;
    }
  }
}
```

> 注意：样式里只做“UnoCSS 做不到的事”，其余都放在模板类名里完成。

## 提交前自检清单（必过）

- [ ] 是否所有颜色都使用了语义类（`bg-card/text-foreground/border-border/...`）或语义变量？
- [ ] 是否没有硬编码断点/尺寸魔法数（除可视化模拟器等明确“动态宽度”场景）？
- [ ] 是否优先使用了 `BREAKPOINTS`、size/theme 管线提供的类名/变量？
- [ ] 若写了 SCSS：是否仅用于兜底场景？是否采用了嵌套层级？是否复用了语义变量？

## 相关文件（定位）

- Uno 配置：`uno.config.ts`
- 断点 SSOT：`src/constants/breakpoints.ts`
- 主题 SSOT/引擎：`src/constants/theme.ts`、`src/utils/theme/engine.ts`、`src/stores/modules/theme.ts`
- 尺寸 SSOT/引擎：`src/constants/size.ts`、`src/utils/theme/sizeEngine.ts`、`src/stores/modules/size.ts`
