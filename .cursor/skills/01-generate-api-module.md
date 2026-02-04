# Skill 01：Generate API Module（新增接口先落 src/api）

## Goal

当需求涉及“新增接口/对接后端/新增请求”时，先在 **`src/api/<module>/<feature>.ts`** 落地（扁平化两级），再由 hook 使用。

## Inputs（你需要提供）

- **module**：业务域（如 `user` / `dashboard` / `system`）
- **feature**：功能点文件名（如 `login` / `profile` / `list`）
- **HTTP**：method + url（是否需要 `/api` 前缀由后端/代理决定；一般 service 内写相对路径）
- **参数/响应**：若你提供字段结构，则必须补齐 DTO 类型（禁止 any）
- **鉴权**：是否需要 token/header（若项目拦截器已统一处理，则说明“无需额外处理”）

## Pre-check（强制）

先阅读并遵循：

- `@docs/PROJECT_PROTOCOL.md`
- `@.cursor/rules/12-api-layer.mdc`（扁平化 + 禁止 default export + 禁止通用导出名）
- `@.cursor/rules/00-core-architecture.mdc`（禁止 fetch/axios、禁止 any）

## Task（AI 要做什么）

1. 在 `src/api/<module>/<feature>.ts` 中新增/更新该接口定义（不得创建任何三级目录）
2. 在同一个文件里：
   - 先写 DTO Types：`<Domain><Feature>Req/Res/DTO`（例如：`UserLoginReq` / `UserLoginRes`）
   - 再写 Method builder：`build<Domain><Feature>Method(client, ...)`
   - 再写便捷函数（允许）：`request<Domain><Feature>(...)`（内部必须走 Alova/`@/utils/http`）
3. 保证导出命名不污染全局（AutoImport 扫描 `src/api/**/*`）

## Output（必须输出）

- 修改后的 `src/api/<module>/<feature>.ts` 全部内容（或明确说明新增的导出/类型）

## Non-goals（禁止做）

- 禁止在 `views/components` 内新增 URL/请求构建逻辑
- 禁止 `export default`
- 禁止导出通用名字：`get/list/data/request/config/params` 等
- 禁止使用 `fetch/axios`
- 禁止使用 `any`

## Validation Checklist（自检）

- [ ] 文件路径为 `src/api/<module>/<feature>.ts`，没有三级目录
- [ ] 无 `export default`
- [ ] 导出名有域前缀（如 `buildUserLoginMethod` / `requestUserLogin`）
- [ ] DTO 类型为 `UserLoginReq/UserLoginRes`（域前缀 + feature 前缀）
- [ ] 实际请求只使用 Alova（`alovaInstance`/`@/utils/http/*`），无 fetch/axios

## Prompt 模板（复制使用）

```
先阅读 @docs/PROJECT_PROTOCOL.md
遵循 @.cursor/rules/00-core-architecture.mdc 与 @.cursor/rules/12-api-layer.mdc

任务：新增接口（API module）

module = <module>
feature = <feature>

接口：
- method: <GET|POST|PUT|DELETE|PATCH>
- url: <path>

请在 src/api/<module>/<feature>.ts 中：
1) 定义 DTO 类型：<Domain><Feature>Req / <Domain><Feature>Res（例如 UserLoginReq/UserLoginRes）
2) 导出 build<Domain><Feature>Method(client, ...)（返回 Method<T>）
3) 同时导出 request<Domain><Feature>(...) 便捷函数（内部仍必须走 Alova/`@/utils/http`）

禁止：
- export default
- 导出通用名（get/list/data/request/config/params）
```
