# Env & Runtime Behavior (SSOT)

> **目标读者：AI**。本文档供 AI 在代码生成时参照，涉及环境配置、代理、超时时参阅。

本文档描述环境变量（`.env*`）、Vite 注入与运行时行为的**真实约定**。当出现“开发/生产不一致”“代理/超时不生效”时，以此为准。

## 1. 文件分工

- `.env`：所有环境都通用的变量（基础配置、构建开关、超时等）
- `.env.development`：仅开发环境覆盖/新增（如 dev API、proxy 超时、persist key 等）
- `.env.production`：仅生产环境覆盖/新增（如 prod API、drop console 等）

## 2. 关键变量（按职责）

### 2.1 App 基础

- `VITE_PORT`：dev server 端口
- `VITE_ROUTER_MODE`：路由模式（hash/history）
- `VITE_PUBLIC_PATH`：Vite base
- `VITE_ROOT_REDIRECT`：登录后默认跳转
- `VITE_APP_ENV`：`development | production`

### 2.1.1 品牌配置（单一数据源）

项目标题、描述、slogan、作者等统一在 `src/constants/brand.ts` 中维护，不通过 .env。  
修改品牌信息时仅需编辑该文件。HTML meta、Header 布局、页面标题（usePageTitle / permission）、构建信息等均从该文件读取。

### 2.2 API / 超时

- `VITE_API_BASE_URL`：API 根地址（prod 直连；dev 通过 proxy 走 `/api`）
- `VITE_API_TIMEOUT`：客户端请求超时（Alova/fetch adapter）
- `VITE_PROXY_TIMEOUT`：Vite proxy 超时（建议略大于 API_TIMEOUT）

### 2.3 构建优化

- `VITE_BUILD_ANALYZE`：构建分析
- `VITE_BUILD_SOURCEMAP`：sourcemap
- `VITE_COMPRESSION`：`none | gzip | brotli | both`
- `VITE_DROP_DEBUGGER` / `VITE_DROP_CONSOLE`：构建时 esbuild drop
- `VITE_LEGACY`：是否启用 legacy
- `VITE_CDN`：是否启用 CDN（如未来扩展）

### 2.4 持久化与密钥

- `VITE_PINIA_PERSIST_KEY_PREFIX`：Pinia 持久化 key 前缀。Size 的持久化 key 为 `{VITE_PINIA_PERSIST_KEY_PREFIX}-size`，与 `src/constants/size.ts` 的 `SIZE_PERSIST_KEY` 一致；`sizeEngine.preload()` 在应用挂载前会读取该 key 以注入尺寸/根字体变量，避免首帧 FOUC（见 `docs/BUILD_SYSTEM.md` §5.2）。
- `VITE_APP_SECRET`

## 3. 类型转换（wrapperEnv）

配置位置：`build/utils.ts#wrapperEnv`。

- **布尔值**：`'true'/'false'` → boolean（见 booleanKeys 列表）
- **数值**：字符串 → number（见 numberKeys 列表，如 `VITE_PORT`）

注意：这套“转换后的 env”主要用于 **Vite 配置阶段**（`vite.config.ts` 里 `wrapperEnv(loadEnv(...))`）。  
业务代码中 `import.meta.env.*` 仍可能是字符串；若需要严格数值/布尔，建议在业务侧做显式转换或从 constants/配置模块集中处理。

## 4. Dev Proxy 行为（vite.config.ts）

开发环境：`/api` → `target: VITE_API_BASE_URL`，并 rewrite 去掉 `/api` 前缀。  
生产环境：通常直接使用 `VITE_API_BASE_URL`（取决于后端部署与反代策略）。
