# TypeScript & Linting (SSOT)

> **目标读者：AI**。本文档供 AI 在代码生成时参照，涉及类型定义、类型注解、Linting 时必读。

本文档描述 TS 项目引用关系、生成类型文件的纳入方式，以及 ESLint 如何与自动导入协作，确保“ref 不需要 import 也不报错”。

## 1. TS 项目引用（Project References）

- `tsconfig.json` 使用 references：
  - `tsconfig.app.json`（应用/业务代码）
  - `tsconfig.node.json`（构建脚本/配置文件）

目的：

- app 与 node 分离，避免 Vue 解析与类型感知互相干扰
- build/ 能安全地通过 `@` 引用 src 内 SSOT（constants/theme metadata 等）

## 2. tsconfig.app.json（业务侧）

关键点：

- include 明确包含自动生成类型：
  - `src/types/auto-imports.d.ts`
  - `src/types/components.d.ts`
  - `src/types/env.d.ts`
- paths：
  - `@/*` → `src/*`
  - `@!/*` → `src/api/*`
  - `@&/*` → `src/layouts/components/*`
- `vueCompilerOptions.strictTemplates = true`：模板类型更严格

结论：

- 自动导入生成的 `.d.ts` 在 TS 视角是“第一公民”，不会被漏掉

## 3. tsconfig.node.json（构建侧）

关键点：

- include 覆盖：
  - `build/**/*`
  - `vite.config.ts`、`uno.config.ts`、`eslint.config.ts` 等配置
  - `src/constants/**/*.ts`、`src/utils/theme/**/*.ts`（允许 build/uno.config 通过 `@` 引 SSOT）

结论：

- build 侧对 SSOT 的引用是受 TS 项目引用保护的

## 4. ESLint 与自动导入（eslint.config.ts）

关键点：

- 从 `./.eslintrc-auto-import.json` 读取 auto-import globals，并注入到 `languageOptions.globals`
- 忽略自动生成类型文件：
  - `src/types/components.d.ts`
  - `src/types/auto-imports.d.ts`
- 对 Vue 文件使用 `vue-eslint-parser`，并将类型感知 linting 限制在纯 TS 文件，避免 Vue 解析器被 projectService 干扰

结论：

- “ref/computed 等不 import 也能用”不会触发 `no-undef`
- 自动生成的 `.d.ts` 不会被 ESLint 无意义地报错
- **未使用变量**：TS/TSX 启用 `@typescript-eslint/no-unused-vars`（warn）；有意保留的未使用变量或解构用 **`_` 前缀**（`varsIgnorePattern: '^_'`），详见 `docs/BUILD_SYSTEM.md` §2.4。

## 5. TSX/JSX 支持

- `tsconfig.app.json`：`jsx: "preserve"`、`jsxImportSource: "vue"`
- `build/plugins.ts`：`@vitejs/plugin-vue-jsx` 提供 JSX/TSX 编译
- 程序化渲染（render 函数、动态 VNode、slot 内容等）**必须使用 TSX**，**禁止使用 `h()`**
- **决策：** 需要程序化渲染（返回 VNode）时 → 用 TSX，不用 `h()`
- 详见 `docs/PROJECT_PROTOCOL.md` §5.1 与 `.cursor/rules/24-tsx-rendering.mdc`

## 6. Type Annotation Best Practices（类型注解最佳实践）

### 6.1 Mandatory Explicit Types（强制显式类型）

项目完全支持 TypeScript 和 TSX，所有代码必须充分利用类型系统。**所有变量声明必须显式指定类型，禁止依赖类型推断。**

#### 6.1.1 Regular Variables（普通变量）

```ts
// ❌ FORBIDDEN - 依赖类型推断
const value = someFunction()
const items = []
const name = 'test'

// ✅ REQUIRED - 显式类型注解
const value: ReturnType = someFunction()
const items: Item[] = []
const name: string = 'test'
```

#### 6.1.2 Reactive Variables（响应式变量）

**ref:**

```ts
// ❌ FORBIDDEN - 依赖类型推断
const loading = ref(false)
const data = ref(null)
const count = ref(0)

// ✅ REQUIRED - 显式类型参数
const loading = ref<boolean>(false)
const data = ref<UserDTO | null>(null)
const count = ref<number>(0)
```

**computed:**

```ts
// ❌ FORBIDDEN - 依赖类型推断
const result = computed(() => value.value)
const processed = computed(() => processValue(data.value))

// ✅ REQUIRED - 显式类型参数
const result = computed<ProcessedResult>(() => value.value)
const processed = computed<string | undefined>(() => processValue(data.value))
```

**reactive:**

```ts
// ❌ FORBIDDEN - 依赖类型推断
const state = reactive({ count: 0, name: '' })
const form = reactive({ username: '', password: '' })

// ✅ REQUIRED - 显式类型参数
const state = reactive<{ count: number; name: string }>({ count: 0, name: '' })
const form = reactive<LoginForm>({ username: '', password: '' })
```

#### 6.1.3 Function Signatures（函数签名）

```ts
// ❌ FORBIDDEN - 参数和返回值无类型
function process(data) { ... }
const handler = (e) => { ... }
const mapper = (item) => item.id

// ✅ REQUIRED - 显式类型注解
function process(data: ProcessData): ProcessResult { ... }
const handler = (e: Event) => { ... }
const mapper = (item: Item): string => item.id
```

### 6.2 Complex Types（复杂类型）

复杂类型应提取为 `interface` 或 `type` 定义：

- **Prefer `interface`** for object shapes that may be extended
- **Prefer `type`** for unions, intersections, or computed types

```ts
// ✅ Good - 提取为 interface
interface UserForm {
  username: string
  password: string
  email?: string
}
const form = reactive<UserForm>({ username: '', password: '' })

// ✅ Good - 提取为 type
type Status = 'pending' | 'success' | 'error'
const status = ref<Status>('pending')
```

### 6.3 Rationale（理由）

- **Type Safety**: Explicit types catch errors at compile time, not runtime
- **Code Clarity**: Types serve as documentation, making code self-documenting
- **IDE Support**: Better autocomplete and refactoring support
- **Team Collaboration**: Clear contracts between functions and components
- **Refactoring Safety**: TypeScript can safely refactor code when types are explicit

### 6.4 Examples from Golden Samples（黄金样本示例）

参考 `docs/GOLDEN_SAMPLES/useFeatureLogic.ts`：

```ts
// ✅ Correct pattern
export interface UseHttpRequestResult<TData> {
  loading: Ref<boolean>
  data: Ref<TData | undefined>
  error: ComputedRef<HttpRequestError | null>
  send: (...args: unknown[]) => Promise<TData>
}

export function useHttpRequest<TData = unknown>(
  buildMethod: (client: typeof alovaInstance) => Method<HttpAG<TData>>,
  options?: RequestHookConfig<HttpAG<TData>, any>
): UseHttpRequestResult<TData> {
  // ...
}
```
