<script setup lang="ts">
import { hasAuth } from '@/router/utils/transform'

const userStore = useUserStoreWithOut()

const userPermissions = computed<string[]>(() => userStore.getUserPermissions)

const canRead = computed<boolean>(() => hasAuth('demo:read', userPermissions.value))
const canWrite = computed<boolean>(() => hasAuth('demo:write', userPermissions.value))

const metaAuths: string[] = ['demo:read', 'demo:write']
</script>

<template>
  <div class="p-padding-lg space-y-margin-md">
    <h2 class="fs-xl font-semibold row-y-center gap-sm">
      <Icons
        name="i-lucide-badge-check"
        size="lg"
        class="text-primary"
      />
      <span>按钮级权限示例（meta.auths + hasAuth）</span>
    </h2>

    <div class="component-border rounded-scale p-padding-md space-y-margin-sm bg-card">
      <div class="fs-md">
        <span class="font-medium">当前用户：</span>
        <span>{{ userStore.getUserInfo.username || '未登录' }}</span>
      </div>
      <div class="fs-md">
        <span class="font-medium">当前按钮权限（permissions）：</span>
        <span>{{ userPermissions.join(', ') || '[]' }}</span>
      </div>
      <div class="fs-md">
        <span class="font-medium">本路由 meta.auths：</span>
        <span>{{ metaAuths.join(', ') }}</span>
      </div>
    </div>

    <div class="component-border rounded-scale p-padding-md space-y-margin-sm bg-muted">
      <div class="fs-md font-medium">示例操作按钮（基于权限控制显隐）</div>

      <div class="flex flex-wrap gap-sm">
        <Button
          v-if="canRead"
          severity="primary"
          class="px-padding-md"
          label="查看数据（需要 demo:read）"
        />
        <Button
          v-if="canWrite"
          severity="success"
          class="px-padding-md"
          label="编辑数据（需要 demo:write）"
        />
        <span
          v-if="!canRead && !canWrite"
          class="text-muted-foreground fs-sm"
        >
          当前账号没有任何本页按钮权限。
        </span>
      </div>

      <p class="text-muted-foreground fs-sm">
        - admin / 123456：permissions = ['*:*:*']，两个按钮都可以看到。
        <br />
        - user / 123456：permissions = ['demo:read']，只能看到“查看数据”按钮。
      </p>
    </div>
  </div>
</template>
