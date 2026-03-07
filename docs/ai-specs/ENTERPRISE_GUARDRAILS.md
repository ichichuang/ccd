# Enterprise Architecture Guardrails (Anti-Patterns Prevention)

> **CRITICAL**：本规范为「企业架构护栏」，规定**禁止事项**。与其它规则冲突时，以本规范为准。  
> **适用范围**：`*.ts`、`*.tsx`、`*.vue`。  
> **Cursor/Agent 规则**：`.cursor/rules/09-enterprise-guardrails.mdc`、`.agent/rules/09-enterprise-guardrails.md`。

---

## 1. 边界与依赖违规（Anti-Patterns 1, 2, 10）

- **禁止**：Pinia Store（`src/stores/*`）不得 import `vue-router` 或任何路由工具，应使用依赖注入 `src/infra/router/routeProvider.ts`。
- **禁止**：Pinia Store 不得调用 API 请求函数（如 `api.login()`）。Store 仅负责状态持有，网络请求属于 Composables 或 Services。
- **禁止**：API 模块（`src/api/*`）不得 import Pinia store，应使用依赖注入（如 `src/infra/auth/tokenProvider.ts`）。

## 2. 类型系统稀释（Anti-Pattern 7）

- **禁止**：在业务逻辑、组件或 store 中使用 `any` 或 `as any`。
- **正确**：`any` 仅允许出现在 `src/adapters/`（类型边界）内，并附带 `// eslint-disable-next-line @typescript-eslint/no-explicit-any`。
- **正确**：泛型桥接必须使用 `src/utils/typeCasters.ts` 中的函数（如 `castValue`、`castColumn`），不得使用 `as unknown as Type`。

## 3. 数据不可变性（Anti-Pattern 6）

- **禁止**：对数组或对象参数进行原地修改。
- **禁止**：直接对源数据使用 `array.sort()`、`array.reverse()`、`array.splice()`。
- **正确**：先克隆再变更：`[...array].sort()`、`[...array].splice()`，或 `const newObj = { ...oldObj, key: 'val' }`。

## 4. Vue 组件纯粹性（Anti-Patterns 3, 4, 9, 11）

- **禁止（上帝组件）**：单文件超过 500 行。组件过大时拆分为 `core/`、`features/`、`render/` 等目录。
- **禁止（DOM 操作）**：不得使用 `document.querySelector` 或直接操作 DOM，应使用 Vue 模板 `ref()` 与 `ResizeObserver`。
- **禁止（Watcher 滥用）**：不得用 `watch` 推导状态；可由其它响应式值计算得出的，必须用 `computed()`。`watch` 仅用于外部副作用（如 API 调用、定时触发）。
- **禁止（业务逻辑进 UI）**：避免在 `<script setup>` 内写复杂数据变换，应委托给外部纯函数或 composables。

## 5. 设计系统绕过（Anti-Pattern 8）

- **禁止**：使用硬编码魔法数值（如 `w-[320px]`、`text-[14px]`、`style="margin-top: 15px"`）。
- **正确**：始终使用设计系统中的语义化 UnoCSS 令牌（如 `w-card`、`text-body`、`mt-4`）。

## 6. 单一职责（Anti-Pattern 5）

- **禁止**：向已有的大型工具文件（如 `src/router/utils/common.ts`）追加新职责，应拆分为职责单一、范围更窄的独立文件。
