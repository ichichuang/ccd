---
description: Auth/login flow constraints — MUST follow when task involves login/logout/token/401/route guards
globs: src/**/*.{ts,vue}
alwaysApply: false
---

# Auth & Login Flow (Must Follow)

When the task involves **login, logout, token, 401, route guards, whitelist, or dynamic routes**, you MUST read `docs/ai-specs/AUTH_AND_LOGIN_FLOW.md` first and follow these rules.

## 1. Login Logic

- Entry point: `src/views/login/login.vue` calls `userStore.login()`
- Login API: `src/api/user/login.ts` (`requestUserLoginMock` / `requestCurrentUserMock`)
- FORBIDDEN: Writing login requests directly in views/components; MUST go through user store's login action

## 2. Logout Logic

- Single exit: `userStore.logout()` (`src/stores/modules/user.ts`)
- Trigger points: User component, interceptors 401, permission guard on dynamic route failure
- FORBIDDEN: Custom logout logic or direct token cleanup in business code; MUST call `userStore.logout()`

## 3. 401 Handling

- Single place only: `handleHttpError` in `src/utils/http/interceptors.ts`
- On 401: If `AUTH_ENABLED`, call `useUserStoreWithOut().logout()`
- FORBIDDEN: Duplicating 401 → logout logic in business components or other interceptors

## 4. Route Guards

- Global guards: Defined only in `usePermissionGuard` in `src/router/utils/permission.ts`
- Registration: `registerRouterGuards` in `src/router/utils/guards.ts`
- FORBIDDEN: Registering new global beforeEach/afterEach in views/components/hooks

## 5. Whitelist and Switch

- Whitelist and AUTH_ENABLED: `src/constants/router.ts`
- When changing whitelist or auth switch: edit only this file; FORBIDDEN to hardcode path lists elsewhere

## 6. Storage Cleanup (on logout)

- logout clears: `{prefix}-*`, `schemaform:*`, `theme-mode`
- When adding new localStorage keys to clear on logout: extend `prefixKeys` or `exactKeys` in `user.ts` logout
