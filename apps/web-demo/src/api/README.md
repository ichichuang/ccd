# API Layer

本目录为接口定义层 SSOT。所有后端请求的类型与方法必须在此定义，再由 `src/hooks/modules/` 中的 composable 调用。

## 结构规范

- 路径：`src/api/<domain>/<domain>.api.ts`、`src/api/<domain>/<domain>.dto.ts`（按业务领域划分）
- 仅允许两级，禁止 `src/api/<module>/<subdir>/...`
- 领域内：接口方法放在 `.api.ts`，类型/DTO 放在 `.dto.ts`

## 命名规范

- Method builder：`build<Domain><Feature>Method`
- 可选便捷函数：`request<Domain><Feature>`，只能用于 one-shot action 或既有组件 contract 需要 Promise executor 的场景。
- 类型：`<Domain><Feature>Req` / `<Domain><Feature>Res` / `<Domain><Feature>DTO`

## 调用模型

- Server-state、需要 `loading/error/cache/dedupe`、或需要组件生命周期绑定的接口：优先导出 Method builder，并在 hook/component 中经 `useHttpRequest` 调用。
- Imperative one-shot action：可以导出 `request<Domain><Feature>` 便捷函数，但必须在注释中说明使用场景，并继续走 `@/utils/http`。
- 演示认证与动态路由数据只能位于 `src/demo/mock/**`，API 模块必须依据显式边界选择演示实现或真实 Alova 请求。

## 禁止

- `export default`
- 通用导出名（get/list/data/request/config/params）
- fetch/axios（必须使用 Alova / `@/utils/http`）

## 流程

1. 在此创建/扩展 `src/api/<module>/<feature>.ts`
2. 在 `src/hooks/modules/useXxx.ts` 中调用并组织业务状态
3. 页面/组件只消费 composable，不直接调用 API
