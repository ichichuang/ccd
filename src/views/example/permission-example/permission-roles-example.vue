<script setup lang="ts">
const userStore = useUserStoreWithOut()

const userRoles = computed<string[]>(() => userStore.getUserRoles)
const userPermissions = computed<string[]>(() => userStore.getUserPermissions)
</script>

<template>
  <div class="p-lg col-stretch gap-md">
    <h2 class="text-xl font-semibold row-start items-center gap-sm">
      <Icons
        name="i-lucide-shield-check"
        size="lg"
        class="text-primary"
      />
      <span>页面级权限示例（meta.roles）</span>
    </h2>

    <div class="material-elevated col-stretch gap-sm">
      <div class="text-md">
        <span class="font-medium">当前登录用户：</span>
        <span>{{ userStore.getUserInfo.username || '未登录' }}</span>
      </div>
      <div class="text-md">
        <span class="font-medium">当前角色（roles）：</span>
        <span>{{ userRoles.join(', ') || '[]' }}</span>
      </div>
      <div class="text-md">
        <span class="font-medium">当前按钮权限（permissions）：</span>
        <span>{{ userPermissions.join(', ') || '[]' }}</span>
      </div>
    </div>

    <div class="col-stretch gap-xs rounded-md bg-muted p-md shadow-sm dark:shadow-md">
      <div class="text-md font-medium">本路由 meta.roles = ['admin']</div>
      <p class="text-muted-foreground text-sm">
        - 使用账号
        <span>admin / 123456</span>
        登录：可以正常访问本页面。
        <br />
        - 使用账号
        <span>user / 123456</span>
        登录：根据全局路由守卫与菜单过滤逻辑，本页面会被隐藏或跳转到无权限页面。
      </p>
    </div>
  </div>
</template>
