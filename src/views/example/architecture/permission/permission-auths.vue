<script setup lang="ts">
defineOptions({ name: 'ExamplePermissionAuths' })

const userStore = useUserStoreWithOut()
const { hasAuth } = useAuth()

const userPermissions = computed<string[]>(() => userStore.getUserPermissions)

/** 本页任一操作按钮所需权限（OR），用于空状态提示 */
const hasAnyPageAuth = computed<boolean>(() =>
  hasAuth(['example:architecture:read', 'example:architecture:write'])
)

const metaAuths: string[] = ['example:architecture:read', 'example:architecture:write']
</script>

<template>
  <div class="p-lg col-stretch gap-md">
    <h2 class="text-xl font-semibold row-start items-center gap-sm">
      <Icons
        name="i-lucide-badge-check"
        size="lg"
        class="text-primary"
      />
      <span>按钮级权限示例（meta.auths + v-auth）</span>
    </h2>

    <div class="material-elevated col-stretch gap-sm">
      <div class="text-md">
        <span class="font-medium">当前用户：</span>
        <span>{{ userStore.getUserInfo.username || '未登录' }}</span>
      </div>
      <div class="text-md">
        <span class="font-medium">当前按钮权限（permissions）：</span>
        <span>{{ userPermissions.join(', ') || '[]' }}</span>
      </div>
      <div class="text-md">
        <span class="font-medium">本路由 meta.auths：</span>
        <span>{{ metaAuths.join(', ') }}</span>
      </div>
    </div>

    <div class="col-stretch gap-sm rounded-md bg-muted p-md shadow-sm dark:shadow-md">
      <div class="text-md font-medium">示例操作按钮（v-auth，与 03-auth-rbac 一致）</div>

      <div class="row-start flex-wrap gap-sm">
        <Button
          v-auth="['example:architecture:read']"
          severity="primary"
          class="px-md"
          label="查看数据（需要 example:architecture:read）"
        />
        <Button
          v-auth="['example:architecture:write']"
          severity="success"
          class="px-md"
          label="编辑数据（需要 example:architecture:write）"
        />
        <span
          v-if="!hasAnyPageAuth"
          class="text-muted-foreground text-sm"
        >
          当前账号没有任何本页按钮权限。
        </span>
      </div>

      <p class="text-muted-foreground text-sm">
        - admin / 123456：permissions = ['*:*:*']，两个按钮都可以看到。
        <br />
        - user / 123456：permissions = ['example:architecture:read']，只能看到「查看数据」按钮。
      </p>
    </div>
  </div>
</template>
