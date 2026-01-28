# HTTP 请求系统 (HTTP Client / API Layer) — 任务指引

当用户要求**请求接口**、**新增/修改 API**、**鉴权/签名/重试/超时**、**请求或响应的特殊处理**、**文件上传**、或你判断需要统一 HTTP 行为时，使用本技能。

本项目的核心请求工具在 `src/utils/http/`，HTTP 配置单一事实来源为 `src/constants/http.ts` 的 `HTTP_CONFIG`。业务 API 定义必须放在 `src/api/**`。

## 关键约束（必须遵守）

- **核心请求工具**：统一使用 `src/utils/http/`（实例、方法封装、拦截器、连接管理、上传管理等）。
- **配置 SSOT**：所有 HTTP 相关配置集中在 `src/constants/http.ts` 的 `HTTP_CONFIG`（timeout、retry、敏感字段、安全开关、上传配置等）。
- **特殊行为入口**：允许开发者在 `src/utils/http/interceptors.ts` 中对“发出请求/收到响应”做定制处理（如 token 注入、签名、敏感字段处理、统一错误包装、重试判定、响应解密/解压等）。不要把横切逻辑散落到 API 文件或页面组件中。
- **API 定义层**：所有业务接口函数必须放在 `src/api/**`（或 `src/api/modules/**`）。API 层只做“函数定义 + 参数/返回类型 + 调用 utils/http”，不要在 API 层重复实现拦截器、鉴权、重试策略。

## 文件角色（提纲级）

| 文件/目录                         | 职责                                                                                    |
| --------------------------------- | --------------------------------------------------------------------------------------- |
| `src/utils/http/index.ts`         | 对外统一出口（业务侧应优先从这里使用 HTTP 能力）。                                      |
| `src/utils/http/instance.ts`      | 创建全局请求实例（读取 `HTTP_CONFIG`，挂载 `beforeRequest` / `responded` 等拦截器）。   |
| `src/utils/http/interceptors.ts`  | 请求/响应拦截器与横切逻辑入口（鉴权、签名、安全字段、错误包装、重试判定、解密解压等）。 |
| `src/utils/http/methods.ts`       | 常用请求方法封装（get/post 等）与缓存/重试等协作能力（如有）。                          |
| `src/utils/http/types.ts`         | 请求/响应类型约定（如有）。                                                             |
| `src/utils/http/connection.ts`    | 连接状态管理与监听（如有）。                                                            |
| `src/utils/http/uploadManager.ts` | 上传/分片上传等能力（如有）。                                                           |
| `src/constants/http.ts`           | `HTTP_CONFIG` 配置 SSOT。                                                               |
| `src/api/**`                      | 业务 API 定义层：仅放接口函数（调用 `src/utils/http`），禁止散落到 views/stores。       |

## 新增一个 API（推荐流程）

1. 在 `src/api/` 或 `src/api/modules/` 下创建对应文件（例如 `src/api/modules/user.ts`）。
2. 在文件内导出 API 函数（命名清晰，例如 `getUserProfile`、`updateUserProfile`）。
3. API 函数内部只做：
   - 入参/出参类型定义（interface 为主）
   - endpoint 与 method 选择
   - 调用 `src/utils/http` 暴露的请求方法/实例
4. token、签名、重试、错误包装、加密字段、响应解密等全局策略统一放在 `src/utils/http/interceptors.ts`。

## 修改全局 HTTP 行为（应改哪里？）

- **超时、重试、敏感字段列表、上传配置** → 改 `src/constants/http.ts`（`HTTP_CONFIG`）。
- **鉴权 header / token 注入** → 改 `src/utils/http/interceptors.ts`（请求拦截）。
- **响应统一错误 / 解密解压 / 安全校验 / 重试判定** → 改 `src/utils/http/interceptors.ts`（响应拦截）。

> 若需求涉及“加密/压缩传输”，优先复用 `@/utils/safeStorage`（例如 `encryptAndCompressSync` / `decompressAndDecryptSync`），不要自己拼 AES/LZ/JSON 流水线。

## 排错（最常见定位）

1. **请求未带 token / 鉴权失败**：优先检查 `src/utils/http/interceptors.ts` 的请求拦截逻辑。
2. **响应解析异常 / 解密失败**：检查 `interceptors.ts` 的响应处理与 `@/utils/safeStorage` 使用方式；确认密钥一致。
3. **超时/重试不符合预期**：检查 `src/constants/http.ts` 的 `HTTP_CONFIG.timeout` / `defaultRetryTimes` / `defaultRetryDelay` 等配置。
