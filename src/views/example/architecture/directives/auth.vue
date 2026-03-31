<script setup lang="ts">
defineOptions({ name: 'ArchitectureDirectiveAuth' })

const userStore = useUserStoreWithOut()
const { hasAuth } = useAuth()

const userPermissions = computed<string[]>(() => userStore.getUserPermissions)
const userRoles = computed<string[]>(() => userStore.getUserRoles)
const username = computed<string>(() => userStore.getUserInfo.username || '未登录')
const isSuperAdmin = computed<boolean>(() => userPermissions.value.includes('*:*:*'))

/** 编程式检查 — 与 v-auth / hasAuthCodes 同一套规则（OR、*:*:*）；权限码均为 module:feature:action */
const canArchRead = computed<boolean>(() => hasAuth('example:architecture:read'))
const canArchWrite = computed<boolean>(() => hasAuth('example:architecture:write'))
const canArchAdmin = computed<boolean>(() => hasAuth('example:architecture:admin'))
</script>

<template>
  <div class="animate__animated animate__fadeIn col-stretch gap-md">
    <div class="layout-narrow col-stretch gap-md">
      <section class="material-elevated col-stretch gap-md">
        <div class="row-between">
          <div class="col-stretch gap-xs">
            <h2 class="text-lg font-semibold text-foreground m-0">v-auth Directive</h2>
            <p class="text-sm text-muted-foreground m-0">
              按钮级权限：默认无权限时
              <code class="code-inline">display:none</code>
              ；使用
              <code class="code-inline">v-auth.disable</code>
              时无权限保持占位并禁用交互。与
              <code class="code-inline">useAuth().hasAuth</code>
              /
              <code class="code-inline">hasAuthCodes</code>
              规则一致（OR、
              <code class="code-inline">*:*:*</code>
              ）。
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
          以下按钮使用
          <code class="code-inline">v-auth</code>
          控制显隐：无权限时
          <code class="code-inline">display:none</code>
          （不占交互焦点，布局槽位可因不可见而收紧）。
        </p>
        <div class="row-start flex-wrap gap-sm">
          <Button
            v-auth="'example:architecture:read'"
            label="查看数据 (example:architecture:read)"
            severity="primary"
            size="small"
          />
          <Button
            v-auth="'example:architecture:write'"
            label="编辑数据 (example:architecture:write)"
            severity="success"
            size="small"
          />
          <Button
            v-auth="'example:architecture:admin'"
            label="管理员写入 (example:architecture:admin)"
            severity="danger"
            size="small"
          />
          <Button
            label="无权限限制（始终可见）"
            severity="secondary"
            size="small"
          />
        </div>

        <Divider />

        <h3 class="text-md font-semibold text-foreground m-0">
          Live Demo — v-auth.disable（无权限时禁用，仍占位）
        </h3>
        <p class="text-sm text-muted-foreground m-0">
          适合工具栏「看得见但不可点」的黄金范式；TSX 场景请对
          <code class="code-inline">Button</code>
          使用
          <code class="code-inline">:disabled</code>
          与
          <code class="code-inline">!hasAuth(...)</code>
          组合
          <code class="code-inline">config.tsx</code>
          ）。
        </p>
        <div class="row-start flex-wrap gap-sm">
          <Button
            v-auth.disable="'example:architecture:create'"
            label="新建 (example:architecture:create)"
            severity="primary"
            size="small"
          />
          <Button
            v-auth.disable="['example:architecture:edit', 'example:architecture:write']"
            label="编辑 OR (edit | write)"
            severity="success"
            size="small"
          />
        </div>

        <div class="col-stretch gap-xs bg-muted rounded-lg p-md">
          <span class="text-xs text-muted-foreground">
            useAuth().hasAuth() — 编程式检查（与 v-auth / hasAuthCodes 等效）
          </span>
          <div class="col-stretch gap-xs">
            <div class="row-between">
              <span class="text-xs font-mono text-foreground">example:architecture:read</span>
              <Tag
                :value="canArchRead ? '有权限 ✓' : '无权限 ✗'"
                :severity="canArchRead ? 'success' : 'secondary'"
              />
            </div>
            <div class="row-between">
              <span class="text-xs font-mono text-foreground">example:architecture:write</span>
              <Tag
                :value="canArchWrite ? '有权限 ✓' : '无权限 ✗'"
                :severity="canArchWrite ? 'success' : 'secondary'"
              />
            </div>
            <div class="row-between">
              <span class="text-xs font-mono text-foreground">example:architecture:admin</span>
              <Tag
                :value="canArchAdmin ? '有权限 ✓' : '无权限 ✗'"
                :severity="canArchAdmin ? 'success' : 'secondary'"
              />
            </div>
          </div>
        </div>
        <p class="text-sm text-muted-foreground m-0">
          登录不同账号可验证权限差异：
          <code class="code-inline">admin / 123456</code>
          拥有
          <code class="code-inline">*:*:*</code>
          超级权限，所有按钮可见；
          <code class="code-inline">user / 123456</code>
          仅有
          <code class="code-inline">example:architecture:read</code>
          ，只能看到第一个按钮。
        </p>
      </section>

      <section class="material-elevated col-stretch gap-md">
        <h3 class="text-md font-semibold text-foreground m-0">Usage</h3>
        <Divider />
        <div class="col-stretch gap-md">
          <div class="col-stretch gap-xs">
            <span class="text-xs font-semibold text-muted-foreground">单个权限</span>
            <pre class="code-block">
&lt;Button v-auth="'example:architecture:read'" label="查看" /&gt;</pre
            >
          </div>
          <div class="col-stretch gap-xs">
            <span class="text-xs font-semibold text-muted-foreground">
              数组 OR 逻辑（满足任意一个即可见）
            </span>
            <pre class="code-block">
&lt;Button v-auth="['example:architecture:read', 'example:architecture:write']" label="操作" /&gt;</pre
            >
          </div>
          <div class="col-stretch gap-xs">
            <span class="text-xs font-semibold text-muted-foreground">无权限时禁用（占位）</span>
            <pre class="code-block">
&lt;Button v-auth.disable="'example:architecture:create'" label="新建" /&gt;</pre
            >
          </div>
          <div class="col-stretch gap-xs">
            <span class="text-xs font-semibold text-muted-foreground">
              编程式检查（setup / TSX）
            </span>
            <pre class="code-block">
const { hasAuth } = useAuth()
const canEdit = computed(() => hasAuth('example:architecture:write'))</pre
            >
          </div>
          <div class="col-stretch gap-xs">
            <span class="text-xs font-semibold text-muted-foreground">指令实现层（非 setup）</span>
            <pre class="code-block">import { hasAuthCodes } from '@/hooks/modules/useAuth'</pre>
          </div>
        </div>
        <p class="text-sm text-muted-foreground m-0">
          <code class="code-inline">v-auth</code>
          在 mounted + updated 双生命周期响应权限变化。
          <code class="code-inline">*:*:*</code>
          通配符视为超级权限，忽略所有检查。
        </p>
      </section>
    </div>
  </div>
</template>
