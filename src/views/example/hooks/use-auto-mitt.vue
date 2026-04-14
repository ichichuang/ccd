<script setup lang="ts">
defineOptions({ name: 'UseAutoMitt' })

const { emit } = useAutoMitt()

const showSubscriber = ref<boolean>(true)
const receivedCount = ref<number>(0)
const lastPayload = ref<string>('—')

const localeDraft = ref<string | undefined>('zh-CN')
const timezoneDraft = ref<string | undefined>('Asia/Shanghai')

const triggerLocale = () => {
  emit('localeChange', localeDraft.value ?? '')
}

const triggerTimezone = () => {
  emit('timezoneChange', timezoneDraft.value ?? '')
}

const Subscriber = defineComponent({
  name: 'Subscriber',
  setup() {
    const { on } = useAutoMitt()

    on('localeChange', payload => {
      receivedCount.value += 1
      lastPayload.value = `localeChange: ${payload}`
    })

    on('timezoneChange', payload => {
      receivedCount.value += 1
      lastPayload.value = `timezoneChange: ${payload}`
    })

    return () => null
  },
})
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
                  name="i-lucide-radio"
                  size="xl"
                  class="text-primary"
                />
              </div>
              <div class="col-stretch gap-xs min-w-0">
                <div class="row-start gap-xs min-w-0 flex-wrap">
                  <span class="text-lg font-bold text-foreground text-no-wrap">useAutoMitt</span>
                  <span
                    class="surface-success rounded-md px-sm py-xs text-xs font-semibold uppercase"
                  >
                    HOOK
                  </span>
                </div>
                <span class="text-sm text-muted-foreground text-ellipsis-1">
                  订阅自动在 onUnmounted 清理；切换子组件验证不会继续接收事件
                </span>
              </div>
            </div>
            <div class="row-center gap-sm min-w-0">
              <Tag
                :value="`subscribed=${showSubscriber}`"
                :severity="showSubscriber ? 'success' : 'secondary'"
              />
              <Tag
                :value="`receivedCount=${receivedCount}`"
                severity="secondary"
              />
            </div>
          </div>

          <div class="col-stretch gap-md min-w-0">
            <div class="row-between min-w-0">
              <span class="text-sm text-muted-foreground">Current State</span>
              <Tag
                :value="lastPayload"
                severity="info"
              />
            </div>

            <div class="col-stretch gap-sm min-w-0">
              <div class="text-sm text-muted-foreground">Subscriber（条件渲染）</div>
              <ToggleSwitch v-model="showSubscriber" />
            </div>
          </div>
        </header>

        <section class="material-elevated col-stretch gap-md min-w-0">
          <div class="row-between min-w-0">
            <h3 class="text-md font-semibold text-foreground m-0">Action Triggers</h3>
            <span class="text-sm text-muted-foreground">emit localeChange / timezoneChange</span>
          </div>

          <div class="col-stretch gap-md min-w-0">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-md min-w-0">
              <div class="col-stretch gap-sm min-w-0">
                <div class="text-sm text-muted-foreground">localeChange</div>
                <InputText
                  v-model="localeDraft"
                  placeholder="zh-CN"
                />
                <Button
                  severity="primary"
                  size="small"
                  label="emit localeChange"
                  @click="triggerLocale"
                />
              </div>

              <div class="col-stretch gap-sm min-w-0">
                <div class="text-sm text-muted-foreground">timezoneChange</div>
                <InputText
                  v-model="timezoneDraft"
                  placeholder="Asia/Shanghai"
                />
                <Button
                  severity="primary"
                  size="small"
                  label="emit timezoneChange"
                  @click="triggerTimezone"
                />
              </div>
            </div>

            <div class="text-sm text-muted-foreground">
              验证方式：先打开 Subscriber -> 点击 emit 看到 receivedCount 增加；关闭 Subscriber ->
              再点击 emit 你不应再看到 receivedCount 增加。
            </div>
          </div>
        </section>

        <Subscriber v-if="showSubscriber" />
      </div>
    </div>
  </div>
</template>
