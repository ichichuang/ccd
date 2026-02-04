# Skill 06：Assemble UI Handoff（交接 Antigravity 画 UI）

## Goal

当 Cursor 已完成 API/Hook 逻辑后，生成一段“可直接复制给 Antigravity”的 UI 指令，让 Antigravity 只做 template/class/pt（不改业务逻辑），并严格遵循设计系统。

## Inputs

- 逻辑文件路径（例如：`src/hooks/modules/useUserList.ts`）
- 目标组件路径（例如：`src/views/user/UserList.vue` 或 `src/components/UserList.vue`）
- 需要使用的 PrimeVue 组件（例如 DataTable/Dialog/Form）

## Pre-check（强制）

- `@docs/PROJECT_PROTOCOL.md`
- `@docs/ANTIGRAVITY_UI_RULES.md`
- `@docs/GOLDEN_SAMPLES/UIComponent.vue`

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
5) PrimeVue：交互组件优先用 PrimeVue（DataTable/Dialog/Input/Button 等），并用 class/pt 统一风格
```
