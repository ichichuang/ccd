<script setup lang="ts">
const userStore = useUserStoreWithOut()

const userRoles = computed<string[]>(() => userStore.getUserRoles)
const userPermissions = computed<string[]>(() => userStore.getUserPermissions)
const pageReady = ref<boolean>(true)
</script>

<template>
  <div
    class="col-stretch"
    data-archetype="A1-toolbar-content"
  >
    <AnimateWrapper
      :show="pageReady"
      enter="fadeInUp"
      leave="fadeOut"
    >
      <div class="col-stretch gap-md min-h-0 min-w-0">
        <div class="layout-narrow col-stretch gap-md min-w-0">
          <header class="shrink-0 glass-panel col-stretch gap-md min-w-0">
            <div class="row-between gap-md min-w-0">
              <div class="row-start gap-sm min-w-0 flex-wrap">
                <div class="glass-icon-box shrink-0">
                  <Icons
                    name="i-lucide-shield-check"
                    size="xl"
                    class="text-primary"
                  />
                </div>
                <div class="col-stretch gap-xs min-w-0">
                  <div class="row-start gap-xs min-w-0 flex-wrap">
                    <span class="text-lg font-bold text-foreground text-no-wrap">
                      Page Permission (Roles)
                    </span>
                    <span
                      class="surface-danger rounded-md px-sm py-xs text-xs font-semibold uppercase"
                    >
                      PERMISSION
                    </span>
                  </div>
                  <span class="text-sm text-muted-foreground text-ellipsis-1">
                    页面级权限示例 — meta.roles 控制页面访问，仅指定角色可见
                  </span>
                </div>
              </div>
            </div>
          </header>

          <div class="glass-card col-stretch gap-sm min-w-0">
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

          <div class="glass-card col-stretch gap-xs min-w-0">
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
      </div>
    </AnimateWrapper>
  </div>
</template>
