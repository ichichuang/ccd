<script setup lang="ts">
defineOptions({ name: 'UsePermissionRoutes' })

const { fetchRoutes } = usePermissionRoutes()

const routes = ref<BackendRouteConfig[] | null>(null)
const firstFetchMs = ref<number | null>(null)
const secondFetchMs = ref<number | null>(null)
const errorText = ref<string | null>(null)
const loading = ref<boolean>(false)

const runFirst = async () => {
  loading.value = true
  errorText.value = null
  firstFetchMs.value = null
  secondFetchMs.value = null
  routes.value = null
  try {
    const start = performance.now()
    const res = await fetchRoutes()
    const end = performance.now()
    firstFetchMs.value = Math.round(end - start)
    routes.value = res
  } catch (e) {
    errorText.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}

const runSecond = async () => {
  loading.value = true
  errorText.value = null
  try {
    const start = performance.now()
    const res = await fetchRoutes()
    const end = performance.now()
    secondFetchMs.value = Math.round(end - start)
    routes.value = res
  } catch (e) {
    errorText.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}

const routesPreview = computed(() => {
  const list = routes.value ?? []
  return list
    .slice(0, 8)
    .map(r => r.path)
    .join(' / ')
})

onMounted(() => {
  void runFirst()
})
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
            <h2 class="text-lg font-semibold text-foreground m-0">usePermissionRoutes Demo</h2>
            <p class="text-sm text-muted-foreground m-0">
              验证 fetchRoutes 缓存 staleness（5 分钟内有效）
            </p>
          </div>
          <div class="row-center gap-sm">
            <Tag
              :value="loading ? 'loading...' : 'idle'"
              :severity="loading ? 'info' : 'secondary'"
            />
          </div>
        </div>
        <Divider />

        <div class="col-stretch gap-md">
          <div class="row-between">
            <span class="text-sm text-muted-foreground">Current State</span>
            <div class="row-start flex-wrap gap-sm">
              <Tag
                :value="routes ? `routes=${routes.length}` : 'routes=—'"
                severity="secondary"
              />
              <Tag
                :value="firstFetchMs === null ? 'first=—' : `first=${firstFetchMs}ms`"
                severity="info"
              />
              <Tag
                :value="secondFetchMs === null ? 'second=—' : `second=${secondFetchMs}ms`"
                severity="secondary"
              />
            </div>
          </div>

          <div class="col-stretch gap-sm">
            <div class="text-sm text-muted-foreground">routes preview（前 8 个 path）</div>
            <div class="col-stretch p-md bg-muted/30 rounded-md">
              <div class="text-sm text-foreground text-no-wrap">{{ routesPreview || '—' }}</div>
            </div>
          </div>

          <div
            v-if="errorText"
            class="col-stretch gap-xs"
          >
            <div class="text-sm text-muted-foreground">error</div>
            <Tag
              :value="errorText"
              severity="warn"
            />
          </div>
        </div>
      </section>

      <section class="material-elevated col-stretch gap-md">
        <div class="row-between">
          <h3 class="text-md font-semibold text-foreground m-0">Action Triggers</h3>
          <span class="text-sm text-muted-foreground">首次拉取 / 缓存命中拉取</span>
        </div>
        <Divider />

        <div class="col-stretch gap-md">
          <div class="row-start flex-wrap gap-sm">
            <Button
              size="small"
              severity="primary"
              label="首次拉取"
              @click="runFirst"
            />
            <Button
              size="small"
              severity="secondary"
              label="缓存命中拉取"
              :disabled="loading"
              @click="runSecond"
            />
          </div>
          <div class="text-sm text-muted-foreground">
            若缓存命中生效，第二次耗时通常会显著低于第一次（本地
            mock/网络情况可能不同，但逻辑应如此）。
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
