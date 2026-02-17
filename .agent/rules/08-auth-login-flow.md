---
description: 登录/鉴权流程约束 — 任务涉及 login/logout/token/401/路由守卫 时必须遵循
globs: src/**/*.{ts,vue}
alwaysApply: false
---

# 登录与鉴权流程（必须遵循）

当任务涉及 **登录、登出、token、401、路由鉴权、白名单、动态路由** 时，必须先阅读 `docs/AUTH_AND_LOGIN_FLOW.md` 并遵循以下规则。

## 1. 登录逻辑

- 登录入口：`src/views/login/login.vue` 调用 `userStore.login()`
- 登录 API：`src/api/user/login.ts`（`requestUserLoginMock` / `requestCurrentUserMock`）
- 禁止：在 views/components 中直接写登录请求；必须通过 user store 的 login action

## 2. 登出逻辑

- 唯一出口：`userStore.logout()`（`src/stores/modules/user.ts`）
- 触发点：User 组件、interceptors 401、permission guard 动态路由失败
- 禁止：在业务代码中自建退出逻辑或直接清理 token；必须调用 `userStore.logout()`

## 3. 401 处理

- 仅在一处处理：`src/utils/http/interceptors.ts` 的 `handleHttpError`
- 401 时：`AUTH_ENABLED` 则调用 `useUserStoreWithOut().logout()`
- 禁止：在业务组件或其它拦截器中重复实现 401 → logout 逻辑

## 4. 路由守卫

- 全局守卫：仅在 `src/router/utils/permission.ts` 的 `usePermissionGuard` 中定义
- 注册入口：`src/router/utils/guards.ts` 的 `registerRouterGuards`
- 禁止：在 views/components/hooks 中注册新的全局 beforeEach/afterEach

## 5. 白名单与开关

- 白名单、AUTH_ENABLED：`src/constants/router.ts`
- 修改白名单或鉴权开关时，只改此文件；禁止在其它地方硬编码路径列表

## 6. 存储清理（logout 时）

- logout 会清理：`{prefix}-*`、`schemaform:*`、`theme-mode`
- 新增需在登出时清理的 localStorage key 时，在 `user.ts` 的 logout 中扩展 `prefixKeys` 或 `exactKeys`
