# Skill 06：Assemble UI Handoff（交接 Antigravity 画 UI）

## Goal

当 Cursor 已完成 API/Hook 逻辑后，生成一段“可直接复制给 Antigravity”的 UI 指令，让 Antigravity 只做 template/class/pt（不改业务逻辑），并严格遵循设计系统。

## Inputs

- 逻辑文件路径（例如：`src/hooks/modules/useUserList.ts`）
- 目标组件路径（例如：`src/views/user/UserList.vue` 或 `src/components/UserList.vue`）
- 需要使用的组件（例如 DataTable（表格）/Dialog/Form）

## Pre-check（强制）

- `@docs/PROJECT_PROTOCOL.md`
- `@docs/ANTIGRAVITY_UI_RULES.md`
- `@docs/GOLDEN_SAMPLES/UIComponent.vue`
- `@.cursor/rules/20-ui-styling.mdc`（UnoCSS/配色/尺寸/布局语义类）
- 若涉及**数据表格**（列表、分页、排序、导出）：须阅读 `@docs/DataTable_COMPONENT.md`

## Output（必须输出）

- 一段完整的 Antigravity Prompt（只输出 prompt 文本，不输出代码）

## Prompt 模板（复制使用）

> 将下面整段复制到 Antigravity。

```
先阅读 @docs/PROJECT_PROTOCOL.md 与 @docs/ANTIGRAVITY_UI_RULES.md
并对照 @docs/GOLDEN_SAMPLES/UIComponent.vue 的风格。

任务：基于已有逻辑文件组装 UI（只改 template/class/pt，不改业务逻辑）

输入逻辑：
- @<logic-file>

输出组件：
- <component-path>

要求（CRITICAL）：
1) 只允许改 <template> 与 class / PrimeVue pt；保持所有 v-model、@click、methods、状态命名不变
2) 必须优先复用项目组件：Icons/CScrollbar/UseEcharts（按需使用）
3) UnoCSS Only：禁止写硬编码 px/hex；颜色/尺寸/断点/布局变量都用语义类（uno.config.ts）
4) Mobile First：必须在 375px 下可用，再用 md:/lg: 扩展
5) 表格：交互式数据表格 MUST 用 DataTable（见 docs/DataTable_COMPONENT.md）；其他交互组件用 PrimeVue（Dialog/Input/Button 等），class/pt 统一风格
6) 非组件环境通知：若需在拦截器、全局错误处理等处显示提示，使用 window.$toast / window.$message，见 docs/TOAST_AND_MESSAGE.md；$message 为居中纯提示（正中央、无关闭按钮），$toast 可按位置显示、带关闭按钮
7) 布局/侧栏/响应式：遵循 docs/ADAPTIVE_LAYOUT.md，不直接改 mode/sidebarCollapse，使用有效显隐（showXxxEffective）
8) Vue模板语法：禁止在 <template> 中使用 TypeScript 语法（如 `as`、类型注解 `:`、泛型 `<>`）；必须在 <script setup> 中定义好类型，模板中直接使用变量
```
