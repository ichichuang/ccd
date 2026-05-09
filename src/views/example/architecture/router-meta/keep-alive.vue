<script setup lang="ts">
defineOptions({ name: 'ExampleKeepAlive' })

import { DateUtils } from '@/utils/date/dateUtils'

const router = useRouter()
const route = useRoute()

const inputValue = ref('缓存状态测试')
const noteValue = ref('在这里输入任意内容，切换到其他路由后再返回，验证 KeepAlive 是否保留状态。')
const counter = ref(0)
const activatedCount = ref(0)
const deactivatedCount = ref(0)
const mountedAt = ref('')
const keepAliveEnabled = computed<boolean>(() => route.meta?.keepAlive === true)
const debugToken = ref(Math.random().toString(36).slice(2, 10))
const logs = ref<string[]>([])

const pushLog = (message: string) => {
  logs.value.unshift(`${DateUtils.format(DateUtils.now(), 'HH:mm:ss')} · ${message}`)
  if (logs.value.length > 8) {
    logs.value = logs.value.slice(0, 8)
  }
}

onMounted(() => {
  mountedAt.value = DateUtils.format(DateUtils.now(), 'YYYY-MM-DD HH:mm:ss')
  pushLog('onMounted: 组件首次创建')
})

onActivated(() => {
  activatedCount.value += 1
  pushLog(`onActivated: 第 ${activatedCount.value} 次激活`)
})

onDeactivated(() => {
  deactivatedCount.value += 1
  pushLog(`onDeactivated: 第 ${deactivatedCount.value} 次停用`)
})

onUnmounted(() => {
  pushLog('onUnmounted: 组件被销毁（仅缓存失效时触发）')
})

const goTransitionDemo = () => {
  router.push('/example/router-meta/transition-demo')
}

const goRouterMetaIndex = () => {
  router.push('/example/router-meta/index')
}

const resetLocalState = () => {
  inputValue.value = '缓存状态测试'
  noteValue.value = '在这里输入任意内容，切换到其他路由后再返回，验证 KeepAlive 是否保留状态。'
  counter.value = 0
  pushLog('手动重置本地状态')
}
</script>

<template>
  <div
    class="col-stretch"
    data-archetype="A1-toolbar-content"
  >
    <div class="col-stretch gap-md min-h-0 min-w-0">
      <div class="layout-narrow col-stretch gap-md min-w-0">
        <header class="shrink-0 glass-panel col-stretch gap-md min-w-0">
          <div class="row-between gap-md min-w-0">
            <div class="row-start gap-sm min-w-0 flex-wrap">
              <div class="glass-icon-box shrink-0">
                <Icons
                  name="i-lucide-database"
                  size="xl"
                  class="text-primary"
                />
              </div>
              <div class="col-stretch gap-xs min-w-0">
                <div class="row-start gap-xs min-w-0 flex-wrap">
                  <span class="text-lg font-bold text-foreground text-no-wrap">Keep Alive</span>
                  <span class="surface-info rounded-md px-sm py-xs text-xs font-semibold uppercase">
                    META
                  </span>
                </div>
                <span class="text-sm text-muted-foreground text-ellipsis-1">
                  meta.keepAlive — 当前页面在切路由后不会销毁，返回时直接复用缓存实例
                </span>
              </div>
            </div>
            <Tag
              :value="`keepAlive: ${keepAliveEnabled}`"
              :severity="keepAliveEnabled ? 'success' : 'secondary'"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-md min-w-0">
            <div class="col-stretch gap-xs bg-muted rounded-lg p-md min-w-0">
              <span class="text-xs text-muted-foreground">mounted at</span>
              <span class="text-sm font-mono text-foreground">{{ mountedAt || '—' }}</span>
            </div>
            <div class="col-stretch gap-xs bg-muted rounded-lg p-md min-w-0">
              <span class="text-xs text-muted-foreground">activated / deactivated</span>
              <span class="text-sm font-mono text-primary">
                {{ activatedCount }} / {{ deactivatedCount }}
              </span>
            </div>
            <div class="col-stretch gap-xs bg-muted rounded-lg p-md min-w-0">
              <span class="text-xs text-muted-foreground">instance token</span>
              <span class="text-sm font-mono text-foreground">{{ debugToken }}</span>
            </div>
          </div>
        </header>

        <section class="material-elevated col-stretch gap-md min-w-0">
          <h3 class="text-md font-semibold text-foreground m-0">缓存状态演示</h3>
          <p class="text-sm text-muted-foreground m-0">
            修改下方输入内容，点击「跳转到路由过渡示例」，再返回本页。若 KeepAlive
            生效，输入内容、计数器与实例 token 都会保留。
          </p>
          <InputText
            v-model="inputValue"
            placeholder="输入任意文本后切换路由验证缓存"
          />
          <Textarea
            v-model="noteValue"
            rows="3"
          />
          <div class="row-start gap-sm flex-wrap">
            <Button
              label="Counter +1"
              size="small"
              @click="counter += 1"
            />
            <Tag
              :value="`counter: ${counter}`"
              severity="info"
            />
            <Button
              label="重置本地状态"
              size="small"
              variant="outlined"
              @click="resetLocalState"
            />
          </div>
          <div class="row-start gap-sm flex-wrap">
            <Button
              label="跳转到路由过渡示例"
              size="small"
              variant="outlined"
              @click="goTransitionDemo"
            />
            <Button
              label="返回 Router Meta Index"
              size="small"
              variant="outlined"
              @click="goRouterMetaIndex"
            />
          </div>
        </section>

        <section class="material-elevated col-stretch gap-md min-w-0">
          <h3 class="text-md font-semibold text-foreground m-0">Route Config</h3>
          <pre class="code-block">{{
            JSON.stringify(
              {
                path: '/example/router-meta/keep-alive',
                name: 'ExampleKeepAlive',
                meta: {
                  titleKey: 'router.example.architecture.routerMeta.keepAlive',
                  rank: 7,
                  icon: 'i-lucide-database',
                  keepAlive: true,
                },
              },
              null,
              2
            )
          }}</pre>
        </section>

        <section class="material-elevated col-stretch gap-md min-w-0">
          <h3 class="text-md font-semibold text-foreground m-0">生命周期日志</h3>
          <div class="col-stretch gap-xs min-w-0">
            <div
              v-for="line in logs"
              :key="line"
              class="text-xs font-mono text-muted-foreground"
            >
              {{ line }}
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
