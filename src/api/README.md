# API Layer

本目录为接口定义层 SSOT。所有后端请求的类型与方法必须在此定义，再由 `src/hooks/modules/` 中的 composable 调用。

## 结构规范

- 路径：`src/api/<module>/<feature>.ts`
- 仅允许两级，禁止 `src/api/<module>/<subdir>/...`

## 命名规范

- Method builder：`build<Domain><Feature>Method`
- 可选便捷函数：`request<Domain><Feature>`
- 类型：`<Domain><Feature>Req` / `<Domain><Feature>Res` / `<Domain><Feature>DTO`

## 禁止

- `export default`
- 通用导出名（get/list/data/request/config/params）
- fetch/axios（必须使用 Alova / `@/utils/http`）

## 流程

1. 在此创建/扩展 `src/api/<module>/<feature>.ts`
2. 在 `src/hooks/modules/useXxx.ts` 中调用并组织业务状态
3. 页面/组件只消费 composable，不直接调用 API
