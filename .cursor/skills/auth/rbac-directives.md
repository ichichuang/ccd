# RBAC & v-auth Blueprint

This document covers all patterns for permission-based UI and access control.

---

## The Two Permission Layers

| Layer | Mechanism | Scope |
|---|---|---|
| **Route-level** | `meta.roles` + `meta.auths` in route config | Page access |
| **Element-level** | `v-auth` directive or `useAuth()` composable | Button / widget visibility |

---

## Element-Level Permissions — `v-auth` Directive

Use `v-auth` to conditionally render any interactive element based on the current user's permission list.

### Basic Usage

```vue
<template>
  <!-- Single permission gate -->
  <Button v-auth="['system:user:create']" label="New User" icon="pi pi-plus" />

  <!-- Edit with permission check -->
  <Button v-auth="['system:user:edit']" label="Edit" severity="secondary" />

  <!-- Danger action guard -->
  <Button v-auth="['system:user:delete']" label="Delete" severity="danger" />
</template>
```

### Multiple Permissions (ANY match grants access)

```vue
<template>
  <!-- Visible if user has EITHER permission -->
  <Button
    v-auth="['system:role:edit', 'system:role:manage']"
    label="Manage Roles"
  />

  <!-- Toolbar with mixed guards -->
  <div class="row-start gap-sm">
    <Button v-auth="['system:user:create']" label="Add" />
    <Button v-auth="['system:user:export']" label="Export" severity="secondary" />
    <Button v-auth="['system:user:import']" label="Import" severity="secondary" />
  </div>
</template>
```

### Table Row Actions (Common Pattern)

```vue
<template>
  <DataTable :value="users">
    <Column header="Actions">
      <template #body="{ data }">
        <div class="row-start gap-xs">
          <Button v-auth="['system:user:edit']" icon="edit" text @click="editUser(data)" />
          <Button v-auth="['system:user:delete']" icon="delete" text severity="danger" @click="deleteUser(data.id)" />
        </div>
      </template>
    </Column>
  </DataTable>
</template>
```

---

## Programmatic Permission Checks — `useAuth()`

When permission logic drives conditional rendering or side effects inside `<script setup>`, use the `useAuth()` composable.

```vue
<script setup lang="ts">
const { hasAuth, hasRole } = useAuth()

// ✅ Reactive computed guards
const canCreate = computed(() => hasAuth('system:user:create'))
const canDelete = computed(() => hasAuth('system:user:delete'))
const isAdmin = computed(() => hasRole('admin'))
const canManageRoles = computed(
  () => hasAuth('system:role:edit') || hasAuth('system:role:manage'),
)

// ✅ Guard before performing an action
async function handleDelete(id: string) {
  if (!canDelete.value) {
    window.$toast.warn('You do not have permission to delete users.')
    return
  }
  await deleteUser(id)
}
</script>

<template>
  <!-- Driven by computed from useAuth -->
  <Button v-if="canCreate" label="New User" @click="openCreateDialog" />
  <section v-if="isAdmin" class="col-fill">
    <!-- Admin-only content -->
  </section>
</template>
```

---

## Role vs Permission — When to Use Which

| Scenario | Use |
|---|---|
| Coarse-grained feature section visibility | `hasRole('admin')` |
| Fine-grained button / action control | `hasAuth('module:resource:action')` |
| Template element hiding | `v-auth="['...']"` directive |
| Script-side conditional logic | `useAuth().hasAuth()` computed |

**Permission string convention:** `<module>:<resource>:<action>` (e.g., `system:user:edit`, `report:export:excel`)

---

## Wildcard Super-Admin

When a user holds the `*:*:*` permission, ALL `hasAuth()` calls return `true` and ALL `v-auth` elements are rendered. This is the super-admin bypass — handled automatically by the auth system.

```ts
// Internally, hasAuth checks for wildcard before matching specifics:
// if (permissions.includes('*:*:*')) return true
// return permissions.includes(requiredAuth)
```

You do NOT need to handle this in application code.

---

## Auth Bypass in Development — `AUTH_ENABLED=false`

When `AUTH_ENABLED=false` is set in `.env.development`, all permission checks short-circuit to `true`:
- `v-auth` renders all elements unconditionally
- `hasAuth()` returns `true` for every query
- `hasRole()` returns `true` for every query

This allows frontend development without a live auth backend. **Never set `AUTH_ENABLED=false` in `.env.production`.**

```bash
# .env.development (local only)
VITE_AUTH_ENABLED=false
```

---

## Anti-Patterns (FORBIDDEN)

```vue
<!-- ❌ FORBIDDEN: manual role string check in template -->
<Button v-if="userStore.roles.includes('admin')" label="Delete" />

<!-- ❌ FORBIDDEN: hardcoded permission string comparison outside useAuth -->
<Button v-if="userStore.permissions.some(p => p === 'system:user:edit')" label="Edit" />

<!-- ❌ FORBIDDEN: v-show instead of v-auth (still renders DOM, leaks intent) -->
<Button v-show="isAdmin" label="Delete" />
```

```ts
// ❌ FORBIDDEN: permission check in a Pinia store
// Stores must not make UI visibility decisions

// ❌ FORBIDDEN: router guard checking element-level permissions
// Route guards check route-level meta.roles / meta.auths only
```
