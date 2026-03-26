<script setup lang="ts">
defineOptions({ name: 'LayoutNprogress' })

const {
  startProgress,
  doneProgress,
  setProgress,
  incProgress,
  removeProgress,
  getCurrentProgress,
  isProgressRunning,
} = useNprogress()

const loadingState = ref<{
  running: boolean
  progress: number | null
}>({
  running: false,
  progress: null,
})

const refresh = () => {
  loadingState.value = {
    running: isProgressRunning.value,
    progress: getCurrentProgress(),
  }
}

const start = () => {
  startProgress()
  refresh()
}

const done = () => {
  doneProgress()
  refresh()
}

const setTo = (v: number) => {
  setProgress(v)
  refresh()
}

const inc = () => {
  incProgress(0.1)
  refresh()
}

const remove = () => {
  removeProgress()
  refresh()
}

onMounted(() => {
  refresh()
})
</script>

<template>
  <div
    class="animate__animated animate__fadeIn col-stretch gap-md"
    data-archetype="A1-toolbar-content"
  >
    <div class="layout-narrow col-stretch gap-md">
      <section class="material-elevated col-stretch gap-md">
        <div class="row-between items-center">
          <div class="col-stretch gap-xs">
            <h2 class="text-lg font-semibold text-foreground m-0">useNprogress Demo</h2>
            <p class="text-sm text-muted-foreground m-0">
              NProgress 状态查询 + 启动/完成/设置/自增演示
            </p>
          </div>
          <div class="row-center gap-sm">
            <Tag
              :value="loadingState.running ? 'Running' : 'Idle'"
              :severity="loadingState.running ? 'success' : 'secondary'"
            />
            <Tag
              :value="
                loadingState.progress === null
                  ? 'progress: —'
                  : `progress: ${loadingState.progress}`
              "
              severity="secondary"
            />
          </div>
        </div>

        <Divider />

        <div class="col-stretch gap-md">
          <div class="row-between items-center">
            <span class="text-sm text-muted-foreground">Current State</span>
            <div class="row-start flex-wrap gap-sm">
              <Tag
                :value="loadingState.progress === null ? '未开始' : '已开始/进行中'"
                :severity="loadingState.progress === null ? 'secondary' : 'info'"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div class="col-stretch gap-sm">
              <h3 class="text-md font-semibold text-foreground m-0">Action Triggers</h3>
              <div class="row-start flex-wrap gap-sm">
                <Button
                  size="small"
                  severity="primary"
                  label="Start"
                  icon="i-lucide-play"
                  @click="start"
                />
                <Button
                  size="small"
                  severity="secondary"
                  label="Done"
                  icon="i-lucide-check"
                  @click="done"
                />
                <Button
                  size="small"
                  severity="secondary"
                  label="Remove"
                  icon="i-lucide-x"
                  @click="remove"
                />
              </div>
              <div class="row-start flex-wrap gap-sm">
                <Button
                  size="small"
                  severity="secondary"
                  label="Set 0.2"
                  @click="setTo(0.2)"
                />
                <Button
                  size="small"
                  severity="secondary"
                  label="Set 0.5"
                  @click="setTo(0.5)"
                />
                <Button
                  size="small"
                  severity="secondary"
                  label="Set 0.8"
                  @click="setTo(0.8)"
                />
                <Button
                  size="small"
                  severity="secondary"
                  label="Inc +0.1"
                  @click="inc"
                />
              </div>
              <div class="text-sm text-muted-foreground">
                提示：点 Start 后，页面顶部会出现进度条；Done/Remove 会清理。
              </div>
            </div>

            <div class="col-stretch gap-sm">
              <h3 class="text-md font-semibold text-foreground m-0">Quick Checks</h3>
              <div class="col-stretch gap-xs">
                <div class="row-between">
                  <span class="text-sm text-muted-foreground">isProgressRunning</span>
                  <Tag
                    :value="loadingState.running ? 'true' : 'false'"
                    :severity="loadingState.running ? 'success' : 'secondary'"
                  />
                </div>
                <div class="row-between">
                  <span class="text-sm text-muted-foreground">getCurrentProgress()</span>
                  <span class="text-sm text-foreground font-medium">
                    {{ loadingState.progress === null ? '—' : loadingState.progress }}
                  </span>
                </div>
              </div>
              <div class="text-sm text-muted-foreground">
                演示策略：每次按钮点击后调用 `refresh()`，确保 Vue 能同步读取 NProgress 状态。
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
