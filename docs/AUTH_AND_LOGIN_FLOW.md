# 登录与鉴权流程 (Auth & Login Flow)

> 当任务涉及「登录、登出、token、401、路由鉴权、白名单、动态路由」时，必须先阅读本文档并遵循。  
> 本文档是登录/鉴权逻辑的**单一真理来源**，与 `docs/PROJECT_PROTOCOL.md` §10 及 `.cursor/rules/08-auth-login-flow.mdc` 配套使用。

## 1. 配置与开关

| 配置项               | 位置                      | 说明                                              |
| -------------------- | ------------------------- | ------------------------------------------------- |
| `AUTH_ENABLED`       | `src/constants/router.ts` | `VITE_AUTH_ENABLED !== 'false'`，默认开启鉴权     |
| `routeWhitePathList` | `src/constants/router.ts` | 白名单路径：`['/login', '/register', '/example']` |
| `routeWhiteNameList` | `src/constants/router.ts` | 白名单名称：`['Login', 'Register', 'Example']`    |
| `VITE_ROOT_REDIRECT` | `.env.*`                  | 登录成功后的根路径重定向，如 `/dashboard`         |

## 2. 应用启动流程

```
main.ts
  → preload() (sizeEngine 同步注入尺寸变量)
  → setupPlugins(app)
      → setupErrorHandler
      → setupLocales
      → setupStores (Pinia + theme/size/device/locale init)
      → setupPrimeVue / setupScrollbar
      → setupRouter (app.use(router))
      → setupDateUtils / setupEcharts
      → loadingDone()
  → app.mount('#app')
```

**要点**：用户状态由 Pinia persist 从 localStorage 自动恢复（token、userInfo、isLogin）。

## 3. 登录流程（正向）

### 3.1 入口

- 页面：`src/views/login/login.vue`
- 路由：`/login`（`src/router/modules/core.ts`，`meta.parent: 'fullscreen'`）

### 3.2 登录步骤

```
1. 用户填写 username / password，点击提交
2. login.vue 调用 userStore.login({ username, password })
3. userStore.login() → requestUserLoginMock() (src/api/user/login.ts)
4. 成功 → setToken(res.token) → setUserInfo(res.userInfo) → isLogin = true
5. setUserInfo 内部执行 router.push(redirect || VITE_ROOT_REDIRECT)
6. Pinia persist 将 user state 写入 localStorage（加密）
```

### 3.3 登录 API

- 文件：`src/api/user/login.ts`
- 当前实现：`requestUserLoginMock` / `requestCurrentUserMock` 模拟
- 对接后端：保持函数签名，替换为 Alova 请求即可

### 3.4 Token 存储

- user store 使用 `createPiniaEncryptedSerializer()` 加密持久化
- Key：`{VITE_PINIA_PERSIST_KEY_PREFIX}-user`
- 字段：token、safeStorageToken、userInfo、isLogin

## 4. 登出流程

### 4.1 触发位置

| 位置         | 文件                                    | 说明                                                      |
| ------------ | --------------------------------------- | --------------------------------------------------------- |
| 用户点击     | `src/layouts/components/User/index.vue` | `onLogout` → `userStore.logout()`                         |
| HTTP 401     | `src/utils/http/interceptors.ts`        | `handleHttpError` 中调用 `useUserStoreWithOut().logout()` |
| 动态路由失败 | `src/router/utils/permission.ts`        | catch 中调用 `userStore.logout()`                         |

### 4.2 logout 内部逻辑

1. `clearUserInfo()`：清空 state（token、userInfo、isLogin）
2. 清理 localStorage：前缀 `{prefix}-`、`schemaform:`，精确 key `theme-mode`
3. 300ms 后 `window.location.reload()`

### 4.3 存储清理规则

- **前缀匹配**：`{VITE_PINIA_PERSIST_KEY_PREFIX}-`（Pinia persist、schema-form useFormMemory）
- **前缀匹配**：`schemaform:`（schema-form usePersistence）
- **精确匹配**：`theme-mode`（主题模式）

## 5. 路由鉴权守卫链

### 5.1 注册方式

```
router/index.ts
  → registerRouterGuards({ router, routeUtils, staticRoutes, dynamicRouteManager })
  → usePermissionGuard({ router, initDynamicRoutes })
```

### 5.2 beforeEach 逻辑

```
1. startProgress() + pageLoadingStart() + updatePageTitle(to)
2. 若 !AUTH_ENABLED → next() 放行
3. 若 AUTH_ENABLED：
   - 已登录 (isLogin)：
     - to.path === '/login' → next({ path: '/' })
     - 若 isDynamicRoutesLoaded → next()
     - 否则：loadingStart() → initDynamicRoutes() → 成功 next(redirect) / 失败 logout
   - 未登录：
     - whiteList.includes(to.path) → next()
     - 否则 → next(`/login?redirect=${to.path}`)
```

### 5.3 afterEach 逻辑

- doneProgress、updatePageTitle、safeClearPageLoading
- 若当前导航调用了 loadingStart → loadingDone
- admin 布局下 addTab、updateTabActive

## 6. 动态路由初始化

### 6.1 initDynamicRoutes

- 文件：`src/router/utils/guards.ts`
- 调用时机：permission guard 中，首次需要动态路由时

```
1. permissionStore.setStaticRoutes([...staticRoutes, ...rootRedirect])
2. rawRoutes = await permissionStore.fetchDynamicRoutes()
3. asyncRoutes = processAsyncRoutes(rawRoutes)
4. dynamicRouteManager.addRoutes([...asyncRoutes, ...rootRedirect])
5. routeUtils.updateRouteUtils(completeRoutes)
```

### 6.2 fetchDynamicRoutes

- 文件：`src/stores/modules/permission.ts`
- 当前：返回空数组（可扩展为真实 API）
- 失败且无缓存时 throw，触发 logout

## 7. HTTP 请求鉴权

### 7.1 请求拦截（beforeRequest）

- 文件：`src/utils/http/interceptors.ts`
- 逻辑：`AUTH_ENABLED` 且有 token 时，添加 `Authorization: Bearer ${token}`

### 7.2 响应错误（401）

- `handleHttpError` 中 status 401
- `AUTH_ENABLED` 时调用 `useUserStoreWithOut().logout()`
- 显示未授权提示（$message / $toast）

## 8. 路由工具链与 Store 映射

| 文件                               | 职责                                                                  |
| ---------------------------------- | --------------------------------------------------------------------- |
| `src/constants/router.ts`          | 白名单、AUTH_ENABLED、rootRedirect、错误页                            |
| `src/router/index.ts`              | 创建 router、dynamicRouteManager、注册 guards                         |
| `src/router/utils/guards.ts`       | `registerRouterGuards`、initDynamicRoutes                             |
| `src/router/utils/permission.ts`   | `usePermissionGuard`（before/after 守卫）                             |
| `src/router/utils/common.ts`       | `processAsyncRoutes`、`filterNoPermissionTree`、`createRouteUtils` 等 |
| `src/stores/modules/user.ts`       | token、userInfo、isLogin、login/logout/clearUserInfo                  |
| `src/stores/modules/permission.ts` | staticRoutes、dynamicRoutes、tabs、fetchDynamicRoutes                 |

## 9. 流程图概览

```
应用启动 → Pinia 恢复 user state
    │
    ▼
首次路由导航 → beforeEach
    ├─ !AUTH_ENABLED → next()
    ├─ 已登录: /login → next('/')；动态路由已加载 → next()；未加载 → initDynamicRoutes
    └─ 未登录: 白名单 → next()；否则 → next(`/login?redirect=${to.path}`)
    │
    ▼
登录页 submit → userStore.login() → setToken + setUserInfo → router.push
    │
    ▼
后续请求：beforeRequest 注入 Authorization
    401 → handleHttpError → logout → reload
    │
    ▼
退出：User 组件 / 401 / 动态路由失败 → userStore.logout() → 清理 localStorage → reload
```

## 10. 注意事项

1. **restoreLoginFromToken**：在 user store 中定义，当前未被调用；登录态由 Pinia persist 恢复，如需与后端校验可在此扩展。
2. **动态路由**：`fetchDynamicRoutes` 目前返回空数组，可改为调用真实 API（如 `getAuthRoutes()`）。
3. **白名单**：`/login`、`/register`、`/example` 无需登录即可访问。
