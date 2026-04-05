<script setup lang="ts">
import type { AnimateName, AnimateSpeed } from '@/components/AnimateWrapper/utils/types'

defineOptions({ name: 'ViewsAnimateWrapper' })

const pageReady = ref<boolean>(true)

// ===== Controller state (user-triggered only) =====
const enterAnim = ref<AnimateName | undefined>('fadeIn')
const leaveAnim = ref<AnimateName | undefined>('fadeOut')
const duration = ref<string | undefined>('0.8s')
const speed = ref<AnimateSpeed>('fast')

const enterAnimResolved = computed<AnimateName>(() => enterAnim.value ?? 'fadeIn')
const leaveAnimResolved = computed<AnimateName>(() => leaveAnim.value ?? 'fadeOut')

// Preview: start hidden to avoid mount-time explosions.
const previewVisible = ref(false)
function togglePreview(): void {
  previewVisible.value = !previewVisible.value
}

// Click trigger: start hidden.
const clickVisible = ref(false)
function triggerClick(): void {
  clickVisible.value = false
  useTimeoutFn(
    () => {
      clickVisible.value = true
    },
    50,
    { immediate: true }
  )
}

// Hover trigger: start hidden, only animate on hover.
const hoverVisible = ref(false)

// Appear demo: wrapper is NOT mounted at all until user clicks.
const appearMounted = ref(false)
const appearVisible = ref(false)
function enableAppearDemo(): void {
  appearMounted.value = true
  appearVisible.value = true
}
function toggleAppearVisible(): void {
  appearVisible.value = !appearVisible.value
}

// ===== Options (enter/leave) =====
const animateOptions: { label: string; value: AnimateName }[] = [
  { label: '淡入（fadeIn）', value: 'fadeIn' },
  { label: '淡出（fadeOut）', value: 'fadeOut' },
  { label: '滑入下（slideInDown）', value: 'slideInDown' },
  { label: '滑出上（slideOutUp）', value: 'slideOutUp' },
  { label: '弹跳进入（bounceIn）', value: 'bounceIn' },
  { label: '弹跳离开（bounceOut）', value: 'bounceOut' },
  { label: '缩放进入（zoomIn）', value: 'zoomIn' },
  { label: '缩放离开（zoomOut）', value: 'zoomOut' },
  { label: '翻转进入（flipInX）', value: 'flipInX' },
  { label: '翻转离开（flipOutX）', value: 'flipOutX' },
  { label: '旋转进入（rotateIn）', value: 'rotateIn' },
  { label: '旋转离开（rotateOut）', value: 'rotateOut' },
]

const speedOptions: { label: string; value: AnimateSpeed }[] = [
  { label: '默认（default）', value: '' },
  { label: '更慢（slower）', value: 'slower' },
  { label: '慢速（slow）', value: 'slow' },
  { label: '快速（fast）', value: 'fast' },
  { label: '更快（faster）', value: 'faster' },
]

// ===== Group stagger demo =====
const groupVisible = ref(false)
const groupStagger = ref<number>(100)

interface GroupItem {
  id: string
  text: string
}

const nextGroupItemId = ref(4)
const groupItems = ref<GroupItem[]>([
  { id: '1', text: '条目 A' },
  { id: '2', text: '条目 B' },
  { id: '3', text: '条目 C' },
])

// Drive visibility by filtering the items — keeps AnimateWrapper mounted so leave animations fire.
const displayedGroupItems = computed<GroupItem[]>(() =>
  groupVisible.value ? groupItems.value : []
)

function addGroupItem(): void {
  const id = String(nextGroupItemId.value++)
  const nextLetter = String.fromCharCode(65 + groupItems.value.length)
  groupItems.value.push({ id, text: `条目 ${nextLetter}` })
}

function removeGroupItem(idx: number): void {
  groupItems.value.splice(idx, 1)
}

function resetGroupItems(): void {
  nextGroupItemId.value = 4
  groupItems.value = [
    { id: '1', text: '条目 A' },
    { id: '2', text: '条目 B' },
    { id: '3', text: '条目 C' },
  ]
}
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
                    name="i-lucide-wand-2"
                    size="xl"
                    class="text-primary"
                  />
                </div>
                <div class="col-stretch gap-xs min-w-0">
                  <div class="row-start gap-xs min-w-0 flex-wrap">
                    <span class="text-lg font-bold text-foreground text-no-wrap">
                      AnimateWrapper
                    </span>
                    <span
                      class="surface-primary rounded-md px-sm py-xs text-xs font-semibold uppercase"
                    >
                      COMPONENT
                    </span>
                  </div>
                  <span class="text-sm text-muted-foreground text-ellipsis-1">
                    受控状态触发进入/离开动画，并通过 `overflow-hidden`
                    容器防止动画外溢重叠破坏布局。
                  </span>
                </div>
              </div>
            </div>
          </header>

          <!-- Interactive Controller -->
          <section class="material-elevated col-stretch gap-lg min-w-0">
            <h2 class="text-lg font-semibold text-foreground">交互式控制器</h2>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-lg">
              <div class="col-stretch gap-md min-w-0">
                <h3 class="text-base font-semibold text-foreground">动画参数</h3>

                <div class="col-stretch gap-sm min-w-0">
                  <label class="text-sm font-semibold text-foreground">进入动画</label>
                  <Select
                    v-model="enterAnim"
                    :options="animateOptions"
                    option-label="label"
                    option-value="value"
                    class="w-full"
                  />
                </div>

                <div class="col-stretch gap-sm min-w-0">
                  <label class="text-sm font-semibold text-foreground">离开动画</label>
                  <Select
                    v-model="leaveAnim"
                    :options="animateOptions"
                    option-label="label"
                    option-value="value"
                    class="w-full"
                  />
                </div>

                <div class="col-stretch gap-sm min-w-0">
                  <label class="text-sm font-semibold text-foreground">持续时间</label>
                  <InputText
                    v-model="duration"
                    placeholder="例如：0.5s 或 500ms"
                    class="w-full"
                  />
                </div>

                <div class="col-stretch gap-sm min-w-0">
                  <label class="text-sm font-semibold text-foreground">速度修饰</label>
                  <Select
                    v-model="speed"
                    :options="speedOptions"
                    option-label="label"
                    option-value="value"
                    class="w-full"
                  />
                </div>

                <div class="row-start gap-sm min-w-0">
                  <Button
                    label="切换实时预览"
                    severity="secondary"
                    @click="togglePreview"
                  />
                </div>
              </div>

              <!-- Live Preview -->
              <div class="col-stretch gap-md min-w-0">
                <h3 class="text-base font-semibold text-foreground">实时预览</h3>
                <!-- demo-well 内含 overflow-hidden，防止 slide/zoom 外溢 -->
                <div class="demo-well col-center min-h-[200px] relative">
                  <AnimateWrapper
                    :show="previewVisible"
                    :enter="enterAnimResolved"
                    :leave="leaveAnimResolved"
                    :duration="duration"
                    :speed="speed"
                    :appear="false"
                  >
                    <Card class="material-elevated w-full">
                      <template #content>
                        <div class="col-center gap-md min-w-0">
                          <Icons
                            name="i-lucide-sparkles"
                            size="xl"
                            class="text-primary"
                          />
                          <p class="text-sm font-semibold text-foreground m-0">
                            示例文案（受控触发）
                          </p>
                        </div>
                      </template>
                    </Card>
                  </AnimateWrapper>
                  <div class="absolute inset-0 z-content col-center pointer-events-none">
                    <AnimateWrapper
                      :show="!previewVisible"
                      enter="fadeIn"
                      leave="fadeOut"
                      duration="0.25s"
                      speed="fast"
                      :appear="false"
                    >
                      <p class="text-sm text-muted-foreground select-none m-0">
                        点击"切换实时预览"查看效果
                      </p>
                    </AnimateWrapper>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Trigger Demos -->
          <section class="material-elevated col-stretch gap-lg min-w-0">
            <h2 class="text-lg font-semibold text-foreground">触发演示</h2>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-md">
              <!-- Appear -->
              <div class="col-stretch gap-sm min-w-0">
                <h3 class="text-base font-semibold text-foreground">挂载后出现（appear）</h3>
                <p class="text-xs text-muted-foreground m-0">
                  初始不挂载，点击后首次挂载并播放进入动画。
                </p>

                <div class="demo-well col-center min-h-[180px] gap-md">
                  <div
                    v-if="!appearMounted"
                    class="col-center gap-sm min-w-0"
                  >
                    <Button
                      label="启用挂载动画"
                      severity="secondary"
                      @click="enableAppearDemo"
                    />
                  </div>

                  <div
                    v-else
                    class="col-center gap-md w-full min-w-0"
                  >
                    <AnimateWrapper
                      :show="appearVisible"
                      enter="slideInDown"
                      leave="slideOutUp"
                      duration="0.6s"
                      speed="fast"
                      :appear="true"
                    >
                      <Card class="material-elevated w-full">
                        <template #content>
                          <div class="col-center gap-sm min-w-0">
                            <Icons
                              name="i-lucide-rocket"
                              size="xl"
                              class="text-primary"
                            />
                            <p class="text-xs font-semibold text-foreground m-0">已挂载！</p>
                          </div>
                        </template>
                      </Card>
                    </AnimateWrapper>

                    <Button
                      :label="appearVisible ? '切换离开动画' : '切换进入动画'"
                      severity="secondary"
                      @click="toggleAppearVisible"
                    />
                  </div>
                </div>
              </div>

              <!-- Click trigger -->
              <div class="col-stretch gap-sm min-w-0">
                <h3 class="text-base font-semibold text-foreground">点击触发</h3>
                <p class="text-xs text-muted-foreground m-0">按钮切换 show 状态以重新播放动画。</p>

                <div class="demo-well col-center min-h-[160px] gap-md relative">
                  <AnimateWrapper
                    :show="clickVisible"
                    enter="bounceIn"
                    leave="bounceOut"
                    duration="0.6s"
                    speed="fast"
                    :appear="false"
                  >
                    <Tag
                      value="点击我！"
                      severity="success"
                      class="text-sm"
                    />
                  </AnimateWrapper>
                  <div class="absolute inset-0 z-content col-center pointer-events-none">
                    <AnimateWrapper
                      :show="!clickVisible"
                      enter="fadeIn"
                      leave="fadeOut"
                      duration="0.25s"
                      speed="fast"
                      :appear="false"
                    >
                      <p class="text-xs text-muted-foreground select-none m-0">点击下方按钮触发</p>
                    </AnimateWrapper>
                  </div>
                </div>

                <Button
                  label="触发动画"
                  severity="secondary"
                  @click="triggerClick"
                />
              </div>

              <!-- Hover trigger -->
              <div class="col-stretch gap-sm min-w-0">
                <h3 class="text-base font-semibold text-foreground">悬停触发</h3>
                <p class="text-xs text-muted-foreground m-0">
                  鼠标进入/离开时切换 show 状态触发动画。
                </p>

                <div
                  class="demo-well col-center min-h-[160px] gap-md cursor-pointer transition-all duration-sm relative"
                  @mouseenter="hoverVisible = true"
                  @mouseleave="hoverVisible = false"
                >
                  <AnimateWrapper
                    :show="hoverVisible"
                    enter="zoomIn"
                    leave="zoomOut"
                    duration="0.4s"
                    speed="fast"
                    :appear="false"
                  >
                    <div class="col-center gap-sm min-w-0">
                      <Icons
                        name="i-lucide-sparkles"
                        size="2xl"
                        class="text-primary"
                      />
                      <p class="text-xs font-semibold text-foreground m-0">悬停我！</p>
                    </div>
                  </AnimateWrapper>
                  <div class="absolute inset-0 z-content col-center pointer-events-none">
                    <AnimateWrapper
                      :show="!hoverVisible"
                      enter="fadeIn"
                      leave="fadeOut"
                      duration="0.2s"
                      speed="fast"
                      :appear="false"
                    >
                      <p class="text-xs text-muted-foreground select-none m-0">悬停此区域</p>
                    </AnimateWrapper>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Group Stagger Demo -->
          <section class="material-elevated col-stretch gap-lg min-w-0">
            <h2 class="text-lg font-semibold text-foreground">组模式（group=true 错位）</h2>
            <p class="text-sm text-muted-foreground m-0">
              通过添加/删除条目触发队列错位动画；切换"显示条目"即可观察整组的错位进入与错位离开。 在
              `group && stagger` 下，最终动画延迟由 `index * stagger` 决定，并覆盖
              `delay/enterDelay/leaveDelay` 的结果。
            </p>

            <div class="col-stretch gap-md min-w-0">
              <div class="row-between gap-sm flex-wrap min-w-0">
                <div class="row-center gap-sm min-w-0">
                  <ToggleSwitch v-model="groupVisible" />
                  <p class="text-sm font-semibold text-foreground m-0">显示条目</p>
                </div>

                <div class="row-center gap-sm min-w-0">
                  <Button
                    severity="success"
                    size="small"
                    label="添加条目"
                    :disabled="!groupVisible"
                    @click="addGroupItem"
                  />
                  <Button
                    severity="secondary"
                    size="small"
                    label="重置"
                    :disabled="!groupVisible"
                    @click="resetGroupItems"
                  />
                </div>
              </div>

              <div class="demo-well col-stretch gap-sm p-md min-h-[120px] relative min-w-0">
                <!-- TransitionGroup 通过 v-for 的增删触发 enter/leave；在 group 模式下 show 不是控制项 -->
                <AnimateWrapper
                  enter="slideInLeft"
                  leave="slideOutRight"
                  duration="0.5s"
                  speed="fast"
                  group
                  :stagger="groupStagger"
                  :appear="false"
                >
                  <div
                    v-for="(item, idx) in displayedGroupItems"
                    :key="item.id"
                    class="row-between gap-sm p-sm border border-border rounded-lg bg-card min-w-0"
                  >
                    <div class="col-start gap-xs min-w-0">
                      <p class="text-sm font-semibold text-foreground m-0">{{ item.text }}</p>
                      <p class="text-xs text-muted-foreground m-0">错位条目 {{ idx + 1 }}</p>
                    </div>

                    <Button
                      icon="i-lucide-trash-2"
                      severity="danger"
                      text
                      rounded
                      size="small"
                      :disabled="!groupVisible"
                      @click="removeGroupItem(idx)"
                    />
                  </div>
                </AnimateWrapper>

                <div class="absolute inset-0 z-content col-center pointer-events-none p-md">
                  <AnimateWrapper
                    :show="!groupVisible"
                    enter="fadeIn"
                    leave="fadeOut"
                    duration="0.25s"
                    speed="fast"
                    :appear="false"
                  >
                    <p class="text-sm text-muted-foreground m-0">
                      条目已隐藏。切换"显示条目"查看。
                    </p>
                  </AnimateWrapper>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AnimateWrapper>
  </div>
</template>
