<script setup lang="ts">
defineOptions({ name: 'UseAuth' })

const { hasRole, hasAuth, hasAllAuths, login, restoreLoginFromToken } = useAuth()
const userStore = useUserStore()

const roleDraft = ref<string | undefined>('admin')
const authSingleDraft = ref<string | undefined>('demo:read')
const authOrDraft = ref<string | undefined>('demo:read,system:user:list')
const authAllDraft = ref<string | undefined>('demo:read')

const parseList = (s: string | undefined): string[] =>
  (s ?? '')
    .split(',')
    .map(x => x.trim())
    .filter(Boolean)

const rolesList = computed(() => parseList(roleDraft.value))
const authOrList = computed(() => parseList(authOrDraft.value))
const authAllList = computed(() => parseList(authAllDraft.value))

const roleCheck = computed(() => (rolesList.value.length ? hasRole(rolesList.value) : false))
const authSingleCheck = computed(() => {
  const v = authSingleDraft.value ?? ''
  return v.trim() ? hasAuth(v) : false
})
const authOrCheck = computed(() => (authOrList.value.length ? hasAuth(authOrList.value) : false))
const authAllCheck = computed(() =>
  authAllList.value.length ? hasAllAuths(authAllList.value) : false
)

const loginUsername = ref<string | undefined>('admin')
const loginPassword = ref<string | undefined>('123456')
const loginError = ref<string | null>(null)
const lastRestoreUser = ref<string | null>(null)

const doLogin = async () => {
  loginError.value = null
  try {
    await login({ username: loginUsername.value ?? '', password: loginPassword.value ?? '' })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    loginError.value = msg
    window.$message?.danger(msg)
  }
}

const doRestore = async () => {
  loginError.value = null
  lastRestoreUser.value = null
  try {
    const user = await restoreLoginFromToken()
    lastRestoreUser.value = user ? user.username : '—'
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    loginError.value = msg
    window.$message?.danger(msg)
  }
}
</script>

<template>
  <div
    class="animate__animated animate__fadeIn col-stretch gap-md"
    data-archetype="A1-toolbar-content"
  >
    <div class="layout-narrow col-stretch gap-md">
      <section class="material-elevated col-stretch gap-md">
        <div class="row-between">
          <div class="col-stretch gap-xs">
            <h2 class="text-lg font-semibold text-foreground m-0">useAuth Demo</h2>
            <p class="text-sm text-muted-foreground m-0">
              hasRole / hasAuth / hasAllAuths 的输入验证 + 登录/恢复登录流程
            </p>
          </div>
          <div class="row-center gap-sm">
            <Tag
              :value="`roles=${userStore.userInfo.roles.length}`"
              severity="secondary"
            />
            <Tag
              :value="`perms=${userStore.userInfo.permissions.length}`"
              severity="secondary"
            />
          </div>
        </div>
        <Divider />

        <div class="col-stretch gap-md">
          <div class="row-between">
            <span class="text-sm text-muted-foreground">Current State</span>
            <Tag
              :value="`roleCheck=${roleCheck}`"
              :severity="roleCheck ? 'success' : 'warn'"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div class="col-stretch gap-sm">
              <div class="text-sm text-muted-foreground">hasRole（OR：命中任意角色）</div>
              <InputText
                v-model="roleDraft"
                placeholder="例：admin,user"
              />
              <div class="row-start flex-wrap gap-sm">
                <Tag
                  :value="`roles=${rolesList.join(', ') || '—'}`"
                  severity="secondary"
                />
                <Tag
                  :value="`hasRole=${roleCheck}`"
                  :severity="roleCheck ? 'success' : 'secondary'"
                />
              </div>
            </div>

            <div class="col-stretch gap-sm">
              <div class="text-sm text-muted-foreground">hasAuth（单权限）</div>
              <InputText
                v-model="authSingleDraft"
                placeholder="例：demo:read"
              />
              <div class="row-start flex-wrap gap-sm">
                <Tag
                  :value="`auth=${authSingleDraft}`"
                  severity="secondary"
                />
                <Tag
                  :value="`hasAuth=${authSingleCheck}`"
                  :severity="authSingleCheck ? 'success' : 'secondary'"
                />
              </div>
            </div>

            <div class="col-stretch gap-sm">
              <div class="text-sm text-muted-foreground">hasAuth（OR：任意命中）</div>
              <InputText
                v-model="authOrDraft"
                placeholder="例：demo:read,system:user:list"
              />
              <div class="row-start flex-wrap gap-sm">
                <Tag
                  :value="`authOr=[${authOrList.join(', ')}]`"
                  severity="secondary"
                />
                <Tag
                  :value="`hasAuth(or)=${authOrCheck}`"
                  :severity="authOrCheck ? 'success' : 'secondary'"
                />
              </div>
            </div>

            <div class="col-stretch gap-sm">
              <div class="text-sm text-muted-foreground">hasAllAuths（AND：全部命中）</div>
              <InputText
                v-model="authAllDraft"
                placeholder="例：demo:read,system:user:list"
              />
              <div class="row-start flex-wrap gap-sm">
                <Tag
                  :value="`authAll=[${authAllList.join(', ')}]`"
                  severity="secondary"
                />
                <Tag
                  :value="`hasAllAuths=${authAllCheck}`"
                  :severity="authAllCheck ? 'success' : 'secondary'"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="material-elevated col-stretch gap-md">
        <div class="row-between">
          <h3 class="text-md font-semibold text-foreground m-0">Action Triggers</h3>
          <span class="text-sm text-muted-foreground">模拟登录 & 恢复登录（mock：admin/user）</span>
        </div>
        <Divider />

        <div class="col-stretch gap-md">
          <div class="col-stretch gap-sm">
            <div class="text-sm text-muted-foreground">
              模拟 Login（admin/123456 或 user/123456）
            </div>
            <div class="row-start flex-wrap gap-sm items-center">
              <InputText
                v-model="loginUsername"
                placeholder="username: admin | user"
              />
              <Password
                v-model="loginPassword"
                placeholder="password: 123456"
                toggle-mask
              />
              <Button
                severity="primary"
                size="small"
                label="login()"
                @click="doLogin"
              />
            </div>
            <div
              v-if="loginError"
              class="text-sm text-danger"
            >
              {{ loginError }}
            </div>
          </div>

          <Divider />

          <div class="col-stretch gap-sm">
            <div class="text-sm text-muted-foreground">恢复登录</div>
            <div class="row-start flex-wrap gap-sm items-center">
              <Button
                severity="secondary"
                size="small"
                label="restoreLoginFromToken()"
                @click="doRestore"
              />
              <Tag
                :value="lastRestoreUser ? `restored=${lastRestoreUser}` : 'restored: —'"
                severity="secondary"
              />
            </div>
            <div class="text-sm text-muted-foreground">
              注：restoreLoginFromToken() 依赖 store.token；login 成功后再点恢复会看到权限计算变化。
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
