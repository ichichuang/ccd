<script setup lang="ts">
import { hasAuth } from '@/router/utils/transform'
import { vAuth } from '@/directives/auth'

defineOptions({ name: 'ArchitectureDirectiveAuth' })

const userStore = useUserStoreWithOut()

const userPermissions = computed<string[]>(() => userStore.getUserPermissions)
const userRoles = computed<string[]>(() => userStore.getUserRoles)
const username = computed<string>(() => userStore.getUserInfo.username || '未登录')
const isSuperAdmin = computed<boolean>(() => userPermissions.value.includes('*:*:*'))

// hasAuth() — programmatic counterpart of v-auth
const canDemoRead = computed<boolean>(() => hasAuth('demo:read', userPermissions.value))
const canDemoWrite = computed<boolean>(() => hasAuth('demo:write', userPermissions.value))
const canAdminWrite = computed<boolean>(() => hasAuth('admin:write', userPermissions.value))
</script>

<template>
  <div class="animate__animated animate__fadeIn col-stretch gap-md">
    <div class="layout-narrow col-stretch gap-md">
      <section class="material-elevated col-stretch gap-md">
        <div class="row-between items-center">
          <div class="col-stretch gap-xs">
            <h2 class="text-lg font-semibold text-foreground m-0">v-auth Directive</h2>
            <p class="text-sm text-muted-foreground m-0">
              按钮级权限控制 — 权限不足时元素 display:none（可恢复），响应权限变更
            </p>
          </div>
          <Tag
            :value="username"
            severity="primary"
          />
        </div>
        <Divider />

        <div class="grid grid-cols-2 md:grid-cols-4 gap-md">
          <div class="col-stretch gap-xs bg-muted rounded-lg p-md">
            <span class="text-xs text-muted-foreground">username</span>
            <span class="text-sm font-mono font-bold text-foreground">{{ username }}</span>
          </div>
          <div class="col-stretch gap-xs bg-muted rounded-lg p-md">
            <span class="text-xs text-muted-foreground">roles</span>
            <div class="row-start gap-xs flex-wrap">
              <Tag
                v-for="r in userRoles"
                :key="r"
                :value="r"
                severity="secondary"
              />
              <span
                v-if="userRoles.length === 0"
                class="text-xs text-muted-foreground"
              >
                —
              </span>
            </div>
          </div>
          <div class="col-stretch gap-xs bg-muted rounded-lg p-md md:col-span-2">
            <span class="text-xs text-muted-foreground">permissions</span>
            <div class="row-start gap-xs flex-wrap">
              <Tag
                v-if="isSuperAdmin"
                value="*:*:* (super)"
                severity="danger"
              />
              <Tag
                v-for="p in userPermissions.filter(p => p !== '*:*:*')"
                :key="p"
                :value="p"
                severity="secondary"
              />
              <span
                v-if="userPermissions.length === 0"
                class="text-xs text-muted-foreground"
              >
                —
              </span>
            </div>
          </div>
        </div>
      </section>

      <section class="material-elevated col-stretch gap-md">
        <h3 class="text-md font-semibold text-foreground m-0">Live Demo — v-auth on Buttons</h3>
        <Divider />
        <p class="text-sm text-muted-foreground m-0">
          以下按钮均使用
          <code class="font-mono text-xs text-foreground">v-auth</code>
          指令控制显隐。权限不足时元素不可见（display:none），不影响布局流。
        </p>
        <div class="row-start flex-wrap gap-sm">
          <Button
            v-auth="'demo:read'"
            label="查看数据 (demo:read)"
            severity="primary"
            size="small"
          />
          <Button
            v-auth="'demo:write'"
            label="编辑数据 (demo:write)"
            severity="success"
            size="small"
          />
          <Button
            v-auth="'admin:write'"
            label="管理员写入 (admin:write)"
            severity="danger"
            size="small"
          />
          <Button
            label="无权限限制（始终可见）"
            severity="secondary"
            size="small"
          />
        </div>
        <div class="col-stretch gap-xs bg-muted rounded-lg p-md">
          <span class="text-xs text-muted-foreground">
            hasAuth() — 编程式检查（与 v-auth 等效）
          </span>
          <div class="col-stretch gap-xs">
            <div class="row-between items-center">
              <span class="text-xs font-mono text-foreground">demo:read</span>
              <Tag
                :value="canDemoRead ? '有权限 ✓' : '无权限 ✗'"
                :severity="canDemoRead ? 'success' : 'secondary'"
              />
            </div>
            <div class="row-between items-center">
              <span class="text-xs font-mono text-foreground">demo:write</span>
              <Tag
                :value="canDemoWrite ? '有权限 ✓' : '无权限 ✗'"
                :severity="canDemoWrite ? 'success' : 'secondary'"
              />
            </div>
            <div class="row-between items-center">
              <span class="text-xs font-mono text-foreground">admin:write</span>
              <Tag
                :value="canAdminWrite ? '有权限 ✓' : '无权限 ✗'"
                :severity="canAdminWrite ? 'success' : 'secondary'"
              />
            </div>
          </div>
        </div>
        <p class="text-sm text-muted-foreground m-0">
          登录不同账号可验证权限差异：
          <code class="font-mono text-xs text-foreground">admin / 123456</code>
          拥有
          <code class="font-mono text-xs text-foreground">*:*:*</code>
          超级权限，所有按钮可见；
          <code class="font-mono text-xs text-foreground">user / 123456</code>
          仅有
          <code class="font-mono text-xs text-foreground">demo:read</code>
          ，只能看到第一个按钮。
        </p>
      </section>

      <section class="material-elevated col-stretch gap-md">
        <h3 class="text-md font-semibold text-foreground m-0">Usage</h3>
        <Divider />
        <div class="col-stretch gap-md">
          <div class="col-stretch gap-xs">
            <span class="text-xs font-semibold text-muted-foreground">单个权限</span>
            <pre class="text-xs font-mono text-foreground bg-muted rounded-md p-sm overflow-x-auto">
&lt;Button v-auth="'demo:read'" label="查看" /&gt;</pre
            >
          </div>
          <div class="col-stretch gap-xs">
            <span class="text-xs font-semibold text-muted-foreground">
              数组 OR 逻辑（满足任意一个即可见）
            </span>
            <pre class="text-xs font-mono text-foreground bg-muted rounded-md p-sm overflow-x-auto">
&lt;Button v-auth="['demo:read', 'demo:write']" label="操作" /&gt;</pre
            >
          </div>
          <div class="col-stretch gap-xs">
            <span class="text-xs font-semibold text-muted-foreground">编程式检查</span>
            <pre class="text-xs font-mono text-foreground bg-muted rounded-md p-sm overflow-x-auto">
import { hasAuth } from '@/router/utils/transform'
const canEdit = computed(() => hasAuth('demo:write', userStore.getUserPermissions))</pre
            >
          </div>
        </div>
        <p class="text-sm text-muted-foreground m-0">
          <code class="font-mono text-xs text-foreground">v-auth</code>
          在 mounted + updated 双生命周期响应权限变化。
          <code class="font-mono text-xs text-foreground">*:*:*</code>
          通配符视为超级权限，忽略所有检查。
        </p>
      </section>
    </div>
  </div>
</template>
