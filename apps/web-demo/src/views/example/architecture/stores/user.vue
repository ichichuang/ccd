<script setup lang="ts">
defineOptions({ name: 'ArchitectureStoreUser' })

const userStore = useUserStoreWithOut()

const userInfo = computed(() => userStore.getUserInfo)
const userRoles = computed<string[]>(() => userStore.getUserRoles)
const userPermissions = computed<string[]>(() => userStore.getUserPermissions)
const isLogin = computed(() => userStore.getIsLogin)

const stateJson = computed(() =>
  JSON.stringify(
    {
      isLogin: userStore.getIsLogin,
      token: userStore.getToken ? '[encrypted ✓]' : '—',
      userId: userInfo.value.userId || '—',
      username: userInfo.value.username || '—',
      roles: userInfo.value.roles,
      permissions: userInfo.value.permissions,
    },
    null,
    2
  )
)
</script>

<template>
  <div
    class="col-stretch"
    data-archetype="A2-sidebar-inspector"
  >
    <div class="col-stretch gap-md min-h-0 min-w-0">
      <div class="layout-narrow col-stretch gap-md min-w-0">
        <header class="shrink-0 glass-panel col-stretch gap-md min-w-0">
          <div class="row-between gap-md min-w-0">
            <div class="row-start gap-sm min-w-0 flex-wrap">
              <div class="glass-icon-box shrink-0">
                <Icons
                  name="i-lucide-user"
                  size="xl"
                  class="text-primary"
                />
              </div>
              <div class="col-stretch gap-xs min-w-0">
                <div class="row-start gap-xs min-w-0 flex-wrap">
                  <span class="text-lg font-bold text-foreground text-no-wrap">User Store</span>
                  <span
                    class="surface-primary rounded-md px-sm py-xs text-xs font-semibold uppercase"
                  >
                    STORE
                  </span>
                </div>
                <span class="text-sm text-muted-foreground text-ellipsis-1">
                  当前登录用户状态检查器 — 只读，由 useAuth composable 写入
                </span>
              </div>
            </div>
            <Tag
              :value="isLogin ? 'Logged In' : 'Not Logged In'"
              :severity="isLogin ? 'success' : 'secondary'"
              class="shrink-0"
            />
          </div>
        </header>

        <section class="glass-card col-stretch gap-md min-w-0">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-md min-w-0">
            <div class="col-stretch gap-md min-w-0">
              <div class="col-stretch gap-sm min-w-0">
                <div class="row-between">
                  <span class="text-sm text-muted-foreground">userId</span>
                  <span class="text-sm font-mono text-foreground">
                    {{ userInfo.userId || '—' }}
                  </span>
                </div>
                <div class="row-between">
                  <span class="text-sm text-muted-foreground">username</span>
                  <span class="text-sm font-semibold text-foreground">
                    {{ userInfo.username || '未登录' }}
                  </span>
                </div>
                <div class="row-between">
                  <span class="text-sm text-muted-foreground">email</span>
                  <span class="text-sm font-mono text-foreground">
                    {{ userInfo.email || '—' }}
                  </span>
                </div>
                <div class="row-between">
                  <span class="text-sm text-muted-foreground">phone</span>
                  <span class="text-sm font-mono text-foreground">
                    {{ userInfo.phone || '—' }}
                  </span>
                </div>
              </div>
              <Divider />
              <div class="col-stretch gap-sm min-w-0">
                <span class="text-sm text-muted-foreground">Roles</span>
                <div
                  v-if="userRoles.length"
                  class="row-start flex-wrap gap-xs"
                >
                  <Tag
                    v-for="role in userRoles"
                    :key="role"
                    :value="role"
                    severity="primary"
                  />
                </div>
                <span
                  v-else
                  class="text-xs text-muted-foreground italic"
                >
                  [] — 使用 admin / 123456 登录后查看
                </span>
              </div>
              <div class="col-stretch gap-sm min-w-0">
                <span class="text-sm text-muted-foreground">Permissions</span>
                <div
                  v-if="userPermissions.length"
                  class="row-start flex-wrap gap-xs"
                >
                  <Tag
                    v-for="perm in userPermissions"
                    :key="perm"
                    :value="perm"
                    severity="secondary"
                  />
                </div>
                <span
                  v-else
                  class="text-xs text-muted-foreground italic"
                >
                  [] — 登录后显示权限列表
                </span>
              </div>
            </div>

            <div class="col-stretch gap-sm min-w-0">
              <span class="text-sm text-muted-foreground">Raw Store Snapshot</span>
              <pre class="code-block leading-relaxed">{{ stateJson }}</pre>
            </div>
          </div>
        </section>

        <section class="glass-card col-stretch gap-md min-w-0">
          <div class="row-start gap-xs min-w-0">
            <Icons
              name="i-lucide-git-branch"
              size="sm"
              class="text-muted-foreground"
            />
            <span class="text-sm font-semibold text-foreground text-no-wrap">
              Architecture Note
            </span>
          </div>
          <div class="col-stretch gap-sm min-w-0">
            <div class="code-block text-primary">
              Auth API → useAuth composable → useUserStore (SSOT) → Views
            </div>
            <p class="text-sm text-muted-foreground m-0">
              User Store 仅做状态写入（applyLoginResult / applyRestoredUserInfo）。Token 使用 AES
              加密后持久化。Roles 控制页面访问，Permissions 控制按钮级 v-auth 指令。
            </p>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
