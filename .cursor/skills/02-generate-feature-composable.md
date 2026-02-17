# Skill 02：Generate Feature Composable（业务 Hook）

## Goal

基于已有 API module（`src/api/<module>/<feature>.ts`），生成/更新对应业务 Hook（`src/hooks/modules/useXxx.ts`），统一输出 `loading/data/error/send`，并按需要补充分页/筛选等业务状态。

## Inputs

- API module 路径：`src/api/<module>/<feature>.ts`
- 期望 Hook 名：例如 `useUserLogin` / `useUserList`
- 业务状态：是否需要分页（page/pageSize/total）、筛选条件、刷新、缓存策略等

## Pre-check（强制）

先阅读并遵循：

- `@docs/PROJECT_PROTOCOL.md`
- `@docs/GOLDEN_SAMPLES/useFeatureLogic.ts`（结构/风格参考）
- `@.cursor/rules/10-logic-layer.mdc`
- `@.cursor/rules/15-utils-and-hooks-first.mdc`

## Golden Sample 说明

`docs/GOLDEN_SAMPLES/useFeatureLogic.ts` 是 `useHttpRequest` 的封装，提供 **loading/data/error/send** 的返回结构参考。
本 Skill 要求生成的 Hook 应：

1. 从 `src/api/<module>/<feature>.ts` 导入 `buildXxxMethod`
2. 以 `useHttpRequest(buildXxxMethod)` 形式调用
3. 返回与 useHttpRequest 一致的结构（loading/data/error/send）

## Task

1. 在 `src/hooks/modules/useXxx.ts` 中实现：
   - 使用 `useHttpRequest`（来自 `@/hooks/modules/useHttpRequest`）
   - 调用 API module 导出的 `build<Domain><Feature>Method`（优先）或 `request<Domain><Feature>`（次选）
2. 暴露统一返回结构（建议与黄金样本一致）：`loading/data/error/send`
3. 若涉及分页/筛选：同时暴露 `params`（ref/reactive）与 `reset/refresh` 等方法
4. 复用已有工具（date/ids/lodashes/mitt 等），禁止重复造轮子

## Output

- 目标 Hook 文件 `src/hooks/modules/useXxx.ts` 的完整内容

## Non-goals

- 不写 UI（不改 template/class）
- 不在 Hook 内硬编码 URL（URL/Method 构建必须在 API module）

## Validation

- [ ] 使用 `useHttpRequest`
- [ ] API 来自 `src/api/<module>/<feature>.ts`（而不是 views/components）
- [ ] 返回至少包含 `loading/data/error/send`
- [ ] 无 fetch/axios
- [ ] 无 any
- [ ] 所有变量都有显式类型注解（包括 ref/computed/reactive）
  - [ ] `const loading = ref<boolean>(false)` 而非 `const loading = ref(false)`
  - [ ] `const data = ref<DataType | null>(null)` 而非 `const data = ref(null)`
  - [ ] `const result = computed<ResultType>(() => ...)` 而非 `const result = computed(() => ...)`
  - [ ] `const items: Item[] = []` 而非 `const items = []`
  - [ ] 函数参数和返回值都有显式类型：`function process(data: ProcessData): ProcessResult`

## Prompt 模板（复制使用）

```
先阅读 @docs/PROJECT_PROTOCOL.md
参考 @docs/GOLDEN_SAMPLES/useFeatureLogic.ts
遵循 @.cursor/rules/10-logic-layer.mdc 与 @.cursor/rules/15-utils-and-hooks-first.mdc

任务：为以下 API module 生成业务 Hook（不写 UI）
- API: @src/api/<module>/<feature>.ts
- Hook: src/hooks/modules/use<Xxx>.ts（命名为 use<Domain><Feature>，例如 useUserLogin）

要求：
1) 必须用 useHttpRequest
2) 调用 API module 的 build<Domain><Feature>Method（优先）或 request<Domain><Feature>（次选）
3) 返回 loading/data/error/send，并按需补充分页/筛选状态与 refresh/reset 方法
4) 禁止 fetch/axios；禁止 any；禁止在 Hook 内硬编码 URL
```
