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
                    name="i-lucide-badge-check"
                    size="xl"
                    class="text-primary"
                  />
                </div>
                <div class="col-stretch gap-xs min-w-0">
                  <div class="row-start gap-xs min-w-0 flex-wrap">
                    <span class="text-lg font-bold text-foreground text-no-wrap">
                      Button Permission (Auths)
                    </span>
                    <span
                      class="surface-danger rounded-md px-sm py-xs text-xs font-semibold uppercase"
                    >
                      PERMISSION
                    </span>
                  </div>
                  <span class="text-sm text-muted-foreground text-ellipsis-1">
                    按钮级权限示例 — meta.auths + v-auth 指令控制按钮可见性
                  </span>
                </div>
              </div>
            </div>
          </header>

          <div class="glass-card col-stretch gap-sm min-w-0">
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

          <div class="glass-card col-stretch gap-sm min-w-0">
            <div class="text-md font-medium">示例操作按钮（v-auth，与 03-auth-rbac 一致）</div>

            <div class="row-start flex-wrap gap-sm min-w-0">
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
              - user / 123456：permissions =
              ['example:architecture:read']，只能看到「查看数据」按钮。
            </p>
          </div>
        </div>
      </div>
    </AnimateWrapper>
  </div>
</template>
