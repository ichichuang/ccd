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

## 7. RBAC Directives & Composable (Button/Operation-Level Access Control)

The project provides two mechanisms for **runtime permission checks** at the UI layer:

| Mechanism              | File                           | Usage                                             |
| ---------------------- | ------------------------------ | ------------------------------------------------- |
| `v-auth` directive     | `src/directives/auth.ts`       | Declarative, removes DOM element if no permission |
| `useAuth()` composable | `src/hooks/modules/useAuth.ts` | Programmatic, returns `{ hasRole, hasAuth }`      |

### 7.1 When to use which

- **Page-level access** (entire route blocked) → handled by `usePermissionGuard` in `src/router/utils/permission.ts`. Do NOT add `v-auth` to page root wrappers.
- **Button / action-level access** → use `v-auth` directive (preferred for simple show/hide).
- **Conditional rendering with branching logic** (e.g. showing different content based on role) → use `v-if="hasAuth('auth:code')"` via `useAuth()`.

### 7.2 `v-auth` directive usage

```vue
<!-- Removes element from DOM if user lacks 'system:user:create' permission -->
<Button v-auth="'system:user:create'" label="新建用户" />

<!-- Works on any element -->
<div v-auth="'report:export'">
  <Button label="导出报表" />
</div>
```

**FORBIDDEN anti-patterns:**

```vue
<!-- FORBIDDEN: direct store access in template -->
<Button v-if="userStore.userInfo.permissions.includes('system:user:create')" />

<!-- FORBIDDEN: using v-auth on page root (use route guard instead) -->
<div v-auth="'page:access'" class="col-fill">...</div>
```

### 7.3 `useAuth()` composable usage

```vue
<script setup lang="ts">
const { hasRole, hasAuth } = useAuth()
</script>

<template>
  <!-- Conditional rendering with fallback -->
  <Button
    v-if="hasAuth('system:user:edit')"
    label="编辑"
  />
  <span
    v-else
    class="text-muted fs-sm"
  >
    无权限
  </span>

  <!-- Role-based layout branching -->
  <AdminPanel v-if="hasRole(['admin', 'super-admin'])" />
  <ReadonlyPanel v-else />
</template>
```

### 7.4 `meta.roles` and `meta.auths` route config

```typescript
// src/router/modules/system.ts
{
  path: '/system/user',
  component: () => import('@/views/system/user/index.vue'),
  meta: {
    title: '用户管理',
    parent: 'admin',
    rank: 10,
    roles: ['admin'],          // Array of roles that can access this route
    auths: ['system:user:list'], // Array of permission codes (checked by guard)
    keepAlive: false,
  },
}
```

- `meta.roles`: Checked against `userStore.userInfo.roles` — route is blocked if no match.
- `meta.auths`: Fine-grained permission codes — button-level actions typically mirror these codes.
- Both can be combined; the guard checks roles first, then auths.
- FORBIDDEN: hardcoding role/auth strings outside of `src/constants/router.ts` or route config files.
