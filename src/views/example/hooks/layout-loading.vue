<script setup lang="ts">
defineOptions({ name: 'LayoutLoading' })

const { withLoading, withPageLoading } = useLoading()

const layoutStore = useLayoutStoreWithOut()
const { loadingCount, pageLoadingCount, isLoading, isPageLoading } = storeToRefs(layoutStore)

const waitFor = (ms: number): Promise<void> =>
  new Promise(resolve => {
    const { start, stop } = useTimeoutFn(
      () => {
        stop()
        resolve()
      },
      ms,
      { immediate: false }
    )
    start()
  })

const triggerGlobalLoading = async () => {
  await withLoading(async () => {
    await waitFor(2000)
  })
}

const triggerPageLoading = async () => {
  await withPageLoading(async () => {
    await waitFor(1500)
  })
}

const runConcurrent = async () => {
  await Promise.all([
    withLoading(async () => {
      await waitFor(2000)
    }),
    withLoading(async () => {
      await waitFor(1000)
    }),
  ])
}

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
                    name="i-lucide-loader-2"
                    size="xl"
                    class="text-primary"
                  />
                </div>
                <div class="col-stretch gap-xs min-w-0">
                  <div class="row-start gap-xs min-w-0 flex-wrap">
                    <span class="text-lg font-bold text-foreground text-no-wrap">useLoading</span>
                    <span
                      class="surface-success rounded-md px-sm py-xs text-xs font-semibold uppercase"
                    >
                      HOOK
                    </span>
                  </div>
                  <span class="text-sm text-muted-foreground text-ellipsis-1">
                    全局 loadingCount 与内容区 pageLoadingCount 并发安全展示
                  </span>
                </div>
              </div>
              <div class="row-center gap-sm min-w-0">
                <Tag
                  :value="isLoading ? 'Global: ON' : 'Global: OFF'"
                  :severity="isLoading ? 'success' : 'secondary'"
                />
                <Tag
                  :value="isPageLoading ? 'Page: ON' : 'Page: OFF'"
                  :severity="isPageLoading ? 'info' : 'secondary'"
                />
              </div>
            </div>

            <div class="col-stretch gap-md min-w-0">
              <div class="row-between min-w-0">
                <span class="text-sm text-muted-foreground">Current State</span>
                <div class="row-start flex-wrap gap-sm min-w-0">
                  <Tag
                    :value="`loadingCount: ${loadingCount}`"
                    severity="secondary"
                  />
                  <Tag
                    :value="`pageLoadingCount: ${pageLoadingCount}`"
                    severity="secondary"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-md min-w-0">
                <div class="col-stretch gap-sm min-w-0">
                  <h3 class="text-md font-semibold text-foreground m-0">全局 Loading</h3>
                  <p class="text-sm text-muted-foreground m-0">
                    触发 `withLoading()` 会对 `layoutStore.loadingCount` +1，结束时自动
                    -1，并在并发下正确保持计数。
                  </p>
                </div>
                <div class="col-stretch gap-sm min-w-0">
                  <h3 class="text-md font-semibold text-foreground m-0">页面 Loading</h3>
                  <p class="text-sm text-muted-foreground m-0">
                    触发 `withPageLoading()` 只覆盖 LayoutAdmin 内容区，对应
                    `layoutStore.pageLoadingCount`。
                  </p>
                </div>
              </div>
            </div>
          </header>

          <section class="material-elevated col-stretch gap-md min-w-0">
            <div class="row-between min-w-0">
              <h3 class="text-md font-semibold text-foreground m-0">Action Triggers</h3>
              <span class="text-sm text-muted-foreground">点击按钮触发对应 loading 状态</span>
            </div>

            <div class="col-stretch gap-md min-w-0">
              <div class="row-start flex-wrap gap-sm min-w-0">
                <Button
                  severity="secondary"
                  icon="i-lucide-loader-2"
                  label="触发全局 Loading（2s）"
                  @click="triggerGlobalLoading"
                />
                <Button
                  severity="secondary"
                  icon="i-lucide-layout"
                  label="触发页面 Loading（1.5s）"
                  @click="triggerPageLoading"
                />
              </div>

              <div class="row-start flex-wrap gap-sm min-w-0">
                <Button
                  severity="primary"
                  icon="i-lucide-sigma"
                  label="并发演示：两个全局 loading 同时触发"
                  @click="runConcurrent"
                />
              </div>

              <div class="text-sm text-muted-foreground">
                演示点：并发场景下，你应该能看到 `loadingCount` 在中途仍保持大于 0，且最后归零。
              </div>
            </div>
          </section>
        </div>
      </div>
    </AnimateWrapper>
  </div>
</template>
