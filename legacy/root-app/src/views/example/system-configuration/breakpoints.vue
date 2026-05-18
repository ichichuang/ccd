<script setup lang="ts">
import { BREAKPOINTS, type BreakpointKey } from '@/constants/breakpoints'
import { SIZE_SCALE_KEYS } from '@/constants/sizeScale'
import { useAppElementSize } from '@/hooks/modules/useAppElementSize'
import { goToRoute } from '@/router/utils/helper'

defineOptions({ name: 'BreakpointsSystemPage' })

type ProfileCard = {
  id: string
  initials: string
  name: string
  department: string
  title: string
}

const deviceStore = useDeviceStore()

const sandboxRef = useTemplateRef<HTMLElement>('sandboxRef')
const { width: sandboxWidth } = useAppElementSize(sandboxRef, undefined, {
  mode: 'throttle',
  delay: 120,
})

const activeDeviceBreakpoint = computed<BreakpointKey>(() => deviceStore.currentBreakpoint)

function resolveBreakpointByWidth(width: number): BreakpointKey {
  for (let i = SIZE_SCALE_KEYS.length - 1; i >= 0; i--) {
    const key: BreakpointKey = SIZE_SCALE_KEYS[i]
    if (width >= BREAKPOINTS[key]) return key
  }
  return 'xs'
}

const sandboxBreakpoint = computed<BreakpointKey>(() =>
  resolveBreakpointByWidth(sandboxWidth.value || 0)
)

const sandboxWidthRounded = computed<number>(() => Math.round(sandboxWidth.value))

const sandboxGridColsClass = computed<string>(() => {
  const w = sandboxWidth.value
  if (w > 1024) return 'grid-cols-3'
  if (w > 640) return 'grid-cols-2'
  return 'grid-cols-1'
})

const profileCards: readonly ProfileCard[] = [
  { id: 'u1', initials: 'ZW', name: 'Zhang Wei', department: 'Platform', title: 'Tech Lead' },
  { id: 'u2', initials: 'LM', name: 'Li Mei', department: 'UX', title: 'Sr. Designer' },
  { id: 'u3', initials: 'WF', name: 'Wang Fang', department: 'API', title: 'Backend Engineer' },
  { id: 'u4', initials: 'CH', name: 'Chen Hao', department: 'Quality', title: 'QA Lead' },
  { id: 'u5', initials: 'LY', name: 'Liu Yang', department: 'Infra', title: 'DevOps Engineer' },
  { id: 'u6', initials: 'HJ', name: 'Huang Jing', department: 'PMO', title: 'Product Manager' },
]
</script>

<template>
  <div
    class="col-stretch"
    data-archetype="A1-toolbar-content"
  >
    <AnimateWrapper enter="fadeInUp">
      <div class="col-stretch gap-md min-h-0 min-w-0">
        <div class="layout-narrow col-stretch gap-md min-w-0">
          <!-- Page header -->
          <header class="shrink-0 glass-panel col-stretch gap-md min-w-0">
            <div class="row-between gap-md min-w-0">
              <div class="col-between min-w-0 flex-1 gap-xs">
                <div class="flex flex-row flex-wrap items-center justify-start gap-sm min-w-0">
                  <div class="glass-icon-box shrink-0">
                    <Icons
                      name="i-lucide-monitor-smartphone"
                      size="xl"
                      class="text-primary"
                    />
                  </div>
                  <div class="flex flex-row flex-wrap items-center justify-start gap-xs min-w-0">
                    <span class="text-lg font-bold text-foreground text-no-wrap">
                      Responsive Engine · Breakpoints Lab
                    </span>
                    <span
                      class="surface-info rounded-md px-sm py-xs text-xs font-semibold uppercase"
                    >
                      Lab
                    </span>
                  </div>
                </div>
                <p class="col-start-2 m-0 text-sm text-muted-foreground">
                  SSOT：断点阈值来自 `BREAKPOINTS`；Active 来自
                  `deviceStore.currentBreakpoint`；Sandbox 来自容器实际宽度。
                </p>
              </div>
              <div class="row-end gap-xs shrink-0 flex-wrap">
                <Button
                  text
                  size="small"
                  label="→ 主题"
                  class="p-0 h-auto text-xs"
                  @click="goToRoute('ExampleSystemConfigurationTheme')"
                />
                <Button
                  text
                  size="small"
                  label="→ 尺寸"
                  class="p-0 h-auto text-xs"
                  @click="goToRoute('ExampleSystemConfigurationSize')"
                />
                <Button
                  text
                  size="small"
                  label="→ 布局"
                  class="p-0 h-auto text-xs"
                  @click="goToRoute('ExampleSystemConfigurationLayout')"
                />
                <Button
                  text
                  size="small"
                  label="→ UnoCSS"
                  class="p-0 h-auto text-xs"
                  @click="goToRoute('ExampleSystemConfigurationUnocss')"
                />
              </div>
            </div>
          </header>

          <!-- Section 1: Ruler -->
          <section class="col-stretch gap-md">
            <div class="row-between gap-sm min-w-0 shrink-0">
              <div class="col-between min-w-0 flex-1 gap-xs">
                <div class="flex flex-row items-center justify-start gap-xs min-w-0">
                  <Icons
                    name="i-lucide-ruler"
                    class="shrink-0 text-muted-foreground"
                  />
                  <h2 class="m-0 min-w-0 text-lg font-semibold text-ellipsis-1">
                    Breakpoint Ruler Bar
                  </h2>
                </div>
                <p class="m-0 min-w-0 text-xs text-muted-foreground">
                  各档断点阈值与当前 Active 状态对照
                </p>
              </div>
              <Tag
                value="xs..5xl"
                severity="info"
              />
            </div>
            <div class="glass-card rounded-xl p-md col-stretch gap-md">
              <div
                class="rounded-xl bg-muted/25 dark:bg-muted/40 border border-border/40 p-md col-stretch gap-md"
              >
                <p class="text-xs text-muted-foreground m-0">
                  Active：
                  <span class="font-mono text-foreground">{{ activeDeviceBreakpoint }}</span>
                </p>

                <CScrollbar class="w-full min-w-0 !h-auto max-h-[var(--spacing-5xl)] pb-xs">
                  <div class="row-start items-end gap-xs min-w-max">
                    <div
                      v-for="key in SIZE_SCALE_KEYS"
                      :key="key"
                      class="col-center gap-xs shrink-0 min-w-[var(--spacing-4xl)]"
                    >
                      <div
                        class="w-full h-[var(--spacing-xs)] rounded-md border border-border/30 bg-muted/20"
                        :class="
                          activeDeviceBreakpoint === key ? 'bg-primary/20 border-primary/30' : ''
                        "
                      />
                      <Tag
                        :value="key"
                        :severity="activeDeviceBreakpoint === key ? 'info' : 'secondary'"
                      />
                      <span class="text-xs text-muted-foreground font-mono">
                        {{ BREAKPOINTS[key] }}px
                      </span>
                    </div>
                  </div>
                </CScrollbar>
              </div>
            </div>
          </section>

          <!-- Section 2: Sandbox -->
          <section class="col-stretch gap-md">
            <div class="row-between gap-sm min-w-0 shrink-0">
              <div class="col-between min-w-0 flex-1 gap-xs">
                <div class="flex flex-row items-center justify-start gap-xs min-w-0">
                  <Icons
                    name="i-lucide-move-horizontal"
                    class="shrink-0 text-muted-foreground"
                  />
                  <h2 class="m-0 min-w-0 text-lg font-semibold text-ellipsis-1">
                    Resizable Sandbox
                  </h2>
                </div>
                <p class="m-0 min-w-0 text-xs text-muted-foreground">
                  拖拽右边缘改变容器宽度；Sandbox BP 随宽度解析
                </p>
              </div>
            </div>
            <div class="glass-card rounded-xl p-md col-stretch gap-md">
              <div
                class="rounded-xl bg-muted/25 dark:bg-muted/40 border border-border/40 p-md col-stretch gap-md"
              >
                <p class="text-xs text-muted-foreground m-0">
                  拖拽右边缘改变容器宽度；Sandbox BP：
                  <span class="font-mono text-foreground">{{ sandboxBreakpoint }}</span>
                </p>

                <div
                  ref="sandboxRef"
                  class="resize-x overflow-hidden max-w-full min-w-[320px] w-sidebarWidth rounded-lg bg-background/40 border border-border/30 p-md"
                >
                  <div class="row-between gap-md flex-wrap">
                    <div class="row-start gap-xs">
                      <Tag
                        value="Sandbox"
                        severity="secondary"
                      />
                      <Tag
                        :value="sandboxBreakpoint"
                        severity="info"
                      />
                    </div>
                    <span class="text-xs text-muted-foreground font-mono shrink-0">
                      width: {{ sandboxWidthRounded }}px
                    </span>
                  </div>

                  <div
                    class="grid gap-md"
                    :class="sandboxGridColsClass"
                  >
                    <div
                      v-for="card in profileCards"
                      :key="card.id"
                      class="interactive-item rounded-lg bg-background/40 border border-border/30 p-md col-stretch gap-xs"
                    >
                      <div class="row-between gap-md">
                        <div class="row-start gap-sm min-w-0">
                          <Avatar
                            :label="card.initials"
                            shape="circle"
                          />
                          <div class="col-stretch gap-xs min-w-0">
                            <span class="text-sm font-semibold text-foreground text-ellipsis-1">
                              {{ card.name }}
                            </span>
                            <span class="text-xs text-muted-foreground text-ellipsis-1">
                              {{ card.department }}
                            </span>
                          </div>
                        </div>
                        <Tag
                          :value="card.title"
                          severity="info"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AnimateWrapper>
  </div>
</template>

<style lang="scss" scoped></style>
