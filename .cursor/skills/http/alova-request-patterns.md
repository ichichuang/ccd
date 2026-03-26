# Alova HTTP Request Blueprint

This document is the canonical reference for writing API integrations in this project. Follow it exactly.

---

## The Two-Step Pattern

Every API integration consists of exactly two artifacts: a **method builder** in `src/api/` and a **`useHttpRequest` call** in a composable or component.

---

## Step 1 — Define Method Builders in `src/api/`

File location: `src/api/<module>/<feature>.ts` (2-level max, no deeper)

```ts
// src/api/system/user.ts

// 1. Define DTO types — always explicit, never `any`
export interface SystemUserListReq {
  pageNo: number
  pageSize: number
  keyword?: string
  status?: 'active' | 'inactive'
}

export interface SystemUserDTO {
  id: string
  username: string
  email: string
  roles: string[]
  status: 'active' | 'inactive'
  createdAt: string
}

export interface SystemUserListRes {
  total: number
  records: SystemUserDTO[]
}

export interface SystemUserCreateReq {
  username: string
  email: string
  roleIds: string[]
}

// 2. Define method builders — one per endpoint, named precisely
export const buildSystemUserListMethod = (
  client: typeof alovaInstance,
  params: SystemUserListReq,
) => client.Get<SystemUserListRes>('/api/system/user/list', { params })

export const buildSystemUserDetailMethod = (
  client: typeof alovaInstance,
  id: string,
) => client.Get<SystemUserDTO>(`/api/system/user/${id}`)

export const buildSystemUserCreateMethod = (
  client: typeof alovaInstance,
  data: SystemUserCreateReq,
) => client.Post<SystemUserDTO>('/api/system/user', data)

export const buildSystemUserDeleteMethod = (
  client: typeof alovaInstance,
  id: string,
) => client.Delete<void>(`/api/system/user/${id}`)
```

**Rules:**
- Default exports are FORBIDDEN — only named exports
- Generic names (`get`, `post`, `list`, `request`) are FORBIDDEN
- DTO type naming convention: `<Domain><Feature>Req`, `<Domain><Feature>Res`, `<Domain><Feature>DTO`
- Import alias: use `@!/system/user` (maps to `src/api/system/user`)

---

## Step 2 — Consume via `useHttpRequest` in a Composable

Wrapping in a dedicated composable is strongly preferred over calling `useHttpRequest` directly in a component. This keeps components thin and logic reusable.

```ts
// src/hooks/modules/useSystemUserList.ts
import type { SystemUserListReq, SystemUserListRes } from '@!/system/user'
import { buildSystemUserListMethod } from '@!/system/user'

export function useSystemUserList() {
  // Reactive params — mutations trigger automatic refetch (if immediate: true)
  const params = reactive<SystemUserListReq>({
    pageNo: 1,
    pageSize: 20,
    keyword: '',
  })

  const { loading, data, error, send } = useHttpRequest<SystemUserListRes>(
    () => buildSystemUserListMethod(alovaInstance, params),
    {
      immediate: false,    // Don't auto-fetch on mount — call send() manually
      globalLoading: true, // Show global NProgress bar during this request
    },
  )

  function changePage(page: number) {
    params.pageNo = page
    send()
  }

  function search(keyword: string) {
    params.keyword = keyword
    params.pageNo = 1
    send()
  }

  return { loading, data, error, params, send, changePage, search }
}
```

```ts
// src/hooks/modules/useSystemUserCreate.ts
import type { SystemUserCreateReq } from '@!/system/user'
import { buildSystemUserCreateMethod } from '@!/system/user'

export function useSystemUserCreate() {
  const { loading, send } = useHttpRequest(
    (data: SystemUserCreateReq) => buildSystemUserCreateMethod(alovaInstance, data),
    { immediate: false },
  )

  async function createUser(data: SystemUserCreateReq): Promise<boolean> {
    try {
      await send(data)
      window.$toast.success('User created successfully')
      return true
    }
    catch (e) {
      // HttpRequestError is already handled by interceptor toast
      // Only catch here for control flow (e.g., keep dialog open on failure)
      return false
    }
  }

  return { loading, createUser }
}
```

---

## Step 3 — Use in a Component

```vue
<!-- src/views/system/user/index.vue -->
<script setup lang="ts">
const { loading, data, params, send, changePage, search } = useSystemUserList()
const { loading: creating, createUser } = useSystemUserCreate()

onMounted(send)
</script>

<template>
  <div class="col-fill">
    <DataTable
      :value="data?.records"
      :loading="loading"
      :total-records="data?.total"
      @page="e => changePage(e.page + 1)"
    />
  </div>
</template>
```

---

## `useHttpRequest` Options Reference

| Option | Type | Default | Description |
|---|---|---|---|
| `immediate` | `boolean` | `true` | Auto-fetch on composable init |
| `globalLoading` | `boolean` | `false` | Integrate with NProgress global bar |
| `retry` | `number` | `0` | Retry count on network error (NOT on 4xx) |
| `debounce` | `number` | `0` | Debounce delay in ms for rapid calls |

---

## Error Handling Contract

`useHttpRequest` normalizes all errors to `HttpRequestError`. Global interceptors already display toast messages for common HTTP errors (401, 403, 500). Only handle errors locally when you need control flow:

```ts
import type { HttpRequestError } from '@/utils/http/types'

const { error } = useHttpRequest(...)

watchEffect(() => {
  if (error.value) {
    const httpErr = error.value as HttpRequestError
    // httpErr.code — HTTP status or business error code
    // httpErr.message — already localized by interceptor
    // httpErr.data — raw response body if needed
  }
})
```

**FORBIDDEN:** Manual 401 handling, token refresh calls, retry loops for auth errors. The `TokenRefreshCoordinator` handles all of this silently.
