# Skill 05：Add Icon（智能选图标）

## Goal

当需求是“添加一个图标/替换一个图标”，在不破坏设计系统的前提下，智能选择并输出可直接使用的 `<Icons name="...">` 方案。

## Pre-check（强制）

- `@docs/PROJECT_PROTOCOL.md`（组件与图标规范）
- `@.cursor/rules/18-components-and-icons.mdc`
- `@docs/UNOCSS_AND_ICONS.md`

## Smart Selection Policy（强制优先级）

1. **Lucide（默认/推荐）**：`i-lucide-*`
2. **MDI（补充）**：`i-mdi-*`
3. **Logos（品牌）**：`i-logos-*`
4. **Custom SVG**：当集合里都没有合适图标时
   - SVG 放 `src/assets/icons/**`
   - 使用 `i-custom:<path-with-dashes>`

## Output（必须输出）

- 推荐的 `<Icons name="..." />` 写法（含 size 建议）
- 若必须新增自定义 SVG：给出应放置的路径与最终 `i-custom:` 名称

## Hard Constraints

- 禁止手写 `<svg>`、外链/base64 图标
- **尺寸**：优先 `xs~5xl`（映射 `fs-*`，联动 SizeStore）；自定义尺寸仅在必要时使用
- **颜色**：
  - 静态颜色：使用语义类（`class="text-primary"`）
  - 动态/主题变量：使用 `color` prop（`color="rgb(var(--primary))"`）
  - 禁止 hex 颜色

## Advanced Features（高级功能）

当需求涉及图标动画、翻转、旋转、缩放时：

- **动画**：`animation="spin|pulse|spin-pulse"`
- **翻转**：`flip="horizontal|vertical|both"`
- **旋转**：`rotate="90"` 或 `rotate={90}`（单位：deg）
- **缩放**：`scale={1.5}`（数字值）

**参考：**

- 类型定义：`src/components/Icons/utils/types.ts`
- 示例页面：`src/views/example/Icons/IconsExample.vue`（访问路径：`/example/icons`）
- 完整文档：`docs/UNOCSS_AND_ICONS.md` §6

## Prompt 模板（复制使用）

```
先阅读 @docs/PROJECT_PROTOCOL.md 与 @docs/UNOCSS_AND_ICONS.md
遵循 @.cursor/rules/18-components-and-icons.mdc

任务：为以下语义选择/添加图标，并给出最终 <Icons /> 写法：
语义：<例如：新增/编辑/删除/刷新/导出/设置/用户/角色/权限/提示/警告>

要求：
- 优先 Lucide，其次 MDI，再 Logos
- 若没有合适 icon，说明应新增 custom SVG（放 src/assets/icons/**）以及最终 i-custom: 名称
```
