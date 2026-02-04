# Skill 04：Refactor to Composable（抽离逻辑到 hooks）

## Goal

当组件/页面中的业务逻辑开始膨胀（例如 >10 行、可复用、多处使用），把它抽离到 `src/hooks/modules/useXxx.ts`，保持 UI 层干净。

## Pre-check（强制）

- `@docs/PROJECT_PROTOCOL.md`
- `@.cursor/rules/10-logic-layer.mdc`
- `@.cursor/rules/15-utils-and-hooks-first.mdc`

## Task

1. 识别可抽离逻辑（请求、数据处理、转换、事件订阅、尺寸监听等）
2. 在 `src/hooks/modules/useXxx.ts` 新建/更新 composable
3. 页面/组件只保留绑定（state/method 映射），不保留实现细节

## Hard Constraints

- 请求必须通过 `src/api/**` + `useHttpRequest`
- 工具优先复用 `src/utils/*`（ids/lodashes/date/mitt 等）
- 禁止 any、禁止 fetch/axios

## Prompt 模板（复制使用）

```
先阅读 @docs/PROJECT_PROTOCOL.md
遵循 @.cursor/rules/10-logic-layer.mdc 与 @.cursor/rules/15-utils-and-hooks-first.mdc

任务：将以下文件中的业务逻辑抽离到 composable（保持 UI 不变）
- 来源文件：@<path>
- 目标：src/hooks/modules/use<Xxx>.ts

要求：
- 抽离后 <template> 与 class 不变
- 逻辑层遵循 useHttpRequest + src/api 规则
- 优先复用 src/utils 工具函数
```
