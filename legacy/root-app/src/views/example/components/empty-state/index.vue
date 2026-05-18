<script setup lang="ts">
import { goBack } from '@/router/utils/helper'

import faceImg from '@/assets/images/face.png'
import avatarImg from '@/assets/images/default-avatar.png'

defineOptions({ name: 'ViewsEmptyState' })

type Mode = 'icon' | 'image'

// Playground mode
const mode = ref<Mode>('icon')

// Common text props (icon mode uses EmptyState directly; image mode uses a custom illustration layout)
const title = ref<string | undefined>('暂无数据')
const description = ref<string | undefined>('请调整筛选条件。')

// Icon mode props (real EmptyState.vue props)
const icon = ref<string>('i-lucide-inbox')
const actionLabel = ref<string | undefined>('刷新')
const useI18nKey = ref<boolean>(false)
const useSlotOverride = ref<boolean>(false)

// Image mode props (illustration only)
const imageChoice = ref<'face' | 'avatar'>('face')
const imageSrc = computed<string>(() => (imageChoice.value === 'face' ? faceImg : avatarImg))

// Footer slot demo
const retryCount = ref<number>(0)
function retry(): void {
  retryCount.value += 1
}

function resetPlayground(): void {
  mode.value = 'icon'
  title.value = '暂无数据'
  description.value = '请调整筛选条件。'
  icon.value = 'i-lucide-inbox'
  actionLabel.value = '刷新'
  useI18nKey.value = false
  useSlotOverride.value = false
  imageChoice.value = 'face'
  retryCount.value = 0
}

// ===== Select options =====
const modeOptions: { label: string; value: Mode }[] = [
  { label: 'Icon 模式', value: 'icon' },
  { label: 'Image 模式', value: 'image' },
]

const iconOptions: { label: string; value: string }[] = [
  { label: '收件箱', value: 'i-lucide-inbox' },
  { label: '搜索', value: 'i-lucide-search' },
  { label: '离线', value: 'i-lucide-wifi-off' },
  { label: '文件不存在', value: 'i-lucide-file-x' },
  { label: '服务器离线', value: 'i-lucide-server-off' },
  { label: '警报', value: 'i-lucide-alert-circle' },
]

const imageOptions: { label: string; value: 'face' | 'avatar' }[] = [
  { label: '笑脸插图', value: 'face' },
  { label: '头像插图', value: 'avatar' },
]

// ===== Resolved values (EmptyState requires title as string) =====
const resolvedTitle = computed<string>(() => title.value ?? '暂无数据')
const resolvedDescription = computed<string>(() => description.value ?? '')
const resolvedActionLabel = computed<string>(() => actionLabel.value ?? '')
const titleKey = computed<string | undefined>(() =>
  useI18nKey.value ? 'emptyState.noData' : undefined
)
const descriptionKey = computed<string | undefined>(() =>
  useI18nKey.value ? 'emptyState.noSearchResultDesc' : undefined
)
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
                  name="i-lucide-inbox"
                  size="xl"
                  class="text-primary"
                />
              </div>
              <div class="col-stretch gap-xs min-w-0">
                <div class="row-start gap-xs min-w-0 flex-wrap">
                  <span class="text-lg font-bold text-foreground text-no-wrap">Empty State</span>
                  <span
                    class="surface-primary rounded-md px-sm py-xs text-xs font-semibold uppercase"
                  >
                    COMPONENT
                  </span>
                </div>
                <span class="text-sm text-muted-foreground text-ellipsis-1">
                  Playground 切换 Icon 模式与 Image 模式，并展示 PrimeVue `Card` 的 footer slot
                  按钮注入。
                </span>
              </div>
            </div>
          </div>
        </header>

        <!-- Playground -->
        <section class="material-elevated col-stretch gap-lg min-w-0">
          <h2 class="text-lg font-semibold text-foreground">Playground</h2>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-lg">
            <div class="col-stretch gap-md min-w-0">
              <h3 class="text-base font-semibold text-foreground">控件</h3>

              <div class="col-stretch gap-sm min-w-0">
                <label class="text-sm font-semibold text-foreground">显示模式</label>
                <Select
                  v-model="mode"
                  :options="modeOptions"
                  option-label="label"
                  option-value="value"
                  class="w-full"
                />
              </div>

              <div class="col-stretch gap-sm min-w-0">
                <label class="text-sm font-semibold text-foreground">标题</label>
                <InputText
                  v-model="title"
                  placeholder="请输入标题"
                  class="w-full"
                />
              </div>

              <div class="col-stretch gap-sm min-w-0">
                <label class="text-sm font-semibold text-foreground">描述</label>
                <InputText
                  v-model="description"
                  placeholder="请输入描述（可选）"
                  class="w-full"
                />
              </div>

              <div
                v-if="mode === 'icon'"
                class="col-stretch gap-sm min-w-0"
              >
                <label class="text-sm font-semibold text-foreground">图标</label>
                <Select
                  v-model="icon"
                  :options="iconOptions"
                  option-label="label"
                  option-value="value"
                  class="w-full"
                />
              </div>

              <div
                v-if="mode === 'icon'"
                class="col-stretch gap-sm min-w-0"
              >
                <label class="text-sm font-semibold text-foreground">按钮文案</label>
                <InputText
                  v-model="actionLabel"
                  placeholder="例如：刷新"
                  class="w-full"
                />
              </div>

              <div
                v-if="mode === 'icon'"
                class="col-stretch gap-sm min-w-0"
              >
                <label class="text-sm font-semibold text-foreground">动作事件</label>
                <p class="text-sm text-muted-foreground m-0">
                  点击按钮将触发 EmptyState 的 `action` 事件，由父组件决定导航或业务行为。
                </p>
              </div>

              <div
                v-if="mode === 'icon'"
                class="col-stretch gap-sm min-w-0"
              >
                <label class="text-sm font-semibold text-foreground">标题来源</label>
                <div class="row-start gap-sm min-w-0">
                  <Button
                    label="纯文本 Props"
                    size="small"
                    :severity="useI18nKey ? 'secondary' : 'primary'"
                    @click="useI18nKey = false"
                  />
                  <Button
                    label="i18n Key"
                    size="small"
                    :severity="useI18nKey ? 'primary' : 'secondary'"
                    @click="useI18nKey = true"
                  />
                </div>
              </div>

              <div
                v-if="mode === 'icon'"
                class="col-stretch gap-sm min-w-0"
              >
                <label class="text-sm font-semibold text-foreground">渲染优先级演示</label>
                <div class="row-start gap-sm min-w-0">
                  <Button
                    label="默认渲染"
                    size="small"
                    :severity="useSlotOverride ? 'secondary' : 'primary'"
                    @click="useSlotOverride = false"
                  />
                  <Button
                    label="启用 Slots 覆盖"
                    size="small"
                    :severity="useSlotOverride ? 'primary' : 'secondary'"
                    @click="useSlotOverride = true"
                  />
                </div>
              </div>

              <div
                v-else
                class="col-stretch gap-sm min-w-0"
              >
                <label class="text-sm font-semibold text-foreground">插画选择</label>
                <Select
                  v-model="imageChoice"
                  :options="imageOptions"
                  option-label="label"
                  option-value="value"
                  class="w-full"
                />
              </div>

              <div class="row-start gap-sm min-w-0">
                <Button
                  label="恢复默认"
                  severity="secondary"
                  @click="resetPlayground"
                />
              </div>
            </div>

            <div class="col-stretch gap-md min-w-0">
              <h3 class="text-base font-semibold text-foreground">实时预览</h3>

              <Card class="material-elevated overflow-hidden">
                <template #content>
                  <div
                    v-if="mode === 'icon'"
                    class="col-stretch gap-md min-w-0"
                  >
                    <EmptyState
                      :icon="icon"
                      :title-key="titleKey"
                      :description-key="descriptionKey"
                      :title="resolvedTitle"
                      :description="resolvedDescription"
                      :action-label="resolvedActionLabel"
                      @action="retry"
                    >
                      <template
                        v-if="useSlotOverride"
                        #icon
                      >
                        <Icons
                          name="i-lucide-sparkles"
                          size="5xl"
                          class="text-primary opacity-80"
                        />
                      </template>

                      <template
                        v-if="useSlotOverride"
                        #title
                      >
                        <p class="text-md font-semibold text-foreground m-0">
                          Slot 标题（优先级最高）
                        </p>
                      </template>

                      <template
                        v-if="useSlotOverride"
                        #description
                      >
                        <p class="text-sm text-muted-foreground m-0">
                          当前演示顺序：插槽内容 > i18n Key > 纯文本属性。
                        </p>
                      </template>

                      <template
                        v-if="useSlotOverride"
                        #action
                      >
                        <Button
                          :label="`Slot Retry（${retryCount}）`"
                          severity="secondary"
                          class="mt-md"
                          @click="retry()"
                        />
                      </template>
                    </EmptyState>
                  </div>

                  <div
                    v-else
                    class="col-center gap-md py-2xl px-lg text-center min-w-0"
                  >
                    <Image
                      :src="imageSrc"
                      class="w-full"
                    />
                    <p class="text-md font-semibold text-foreground m-0">
                      {{ resolvedTitle }}
                    </p>
                    <p
                      v-if="resolvedDescription"
                      class="text-sm text-muted-foreground m-0"
                    >
                      {{ resolvedDescription }}
                    </p>
                  </div>
                </template>

                <!-- Slot injection demo -->
                <template #footer>
                  <div class="row-between gap-sm flex-wrap min-w-0">
                    <Button
                      label="Go Back"
                      severity="secondary"
                      @click="goBack()"
                    />
                    <Button
                      label="Retry（{{ retryCount }}）"
                      severity="primary"
                      @click="retry()"
                    />
                  </div>
                </template>
              </Card>
            </div>
          </div>
        </section>

        <!-- Common Scenarios -->
        <section class="material-elevated col-stretch gap-lg min-w-0">
          <h2 class="text-lg font-semibold text-foreground">Common Scenarios</h2>
          <p class="text-sm text-muted-foreground m-0">
            3 个典型用法：无数据、404/错误、无搜索结果（不同 icon / 插画）。
          </p>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
            <!-- No Data -->
            <Card class="material-elevated overflow-hidden">
              <template #content>
                <EmptyState
                  icon="i-lucide-inbox"
                  title="暂无记录"
                  description="目前还没有可展示的数据，请先添加内容。"
                />
              </template>
            </Card>

            <!-- 404 / Error -->
            <Card class="material-elevated overflow-hidden">
              <template #content>
                <div class="col-center gap-md py-2xl px-lg text-center min-w-0">
                  <Image
                    :src="avatarImg"
                    class="w-full"
                  />
                  <p class="text-md font-semibold text-foreground m-0">页面未找到</p>
                  <p class="text-sm text-muted-foreground m-0">你要访问的资源不存在。</p>
                </div>
              </template>

              <template #footer>
                <div class="row-end gap-sm min-w-0">
                  <Button
                    label="Go Back"
                    severity="secondary"
                    @click="goBack()"
                  />
                </div>
              </template>
            </Card>

            <!-- No Search Results -->
            <Card class="material-elevated overflow-hidden">
              <template #content>
                <EmptyState
                  icon="i-lucide-search"
                  title="没有搜索结果"
                  description="没有找到与查询条件匹配的内容。"
                />
              </template>
            </Card>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
