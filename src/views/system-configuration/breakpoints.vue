<script setup lang="ts">
import { BREAKPOINTS, type BreakpointKey } from '@/constants/breakpoints'
import { SIZE_SCALE_KEYS } from '@/constants/sizeScale'
import { useAppElementSize } from '@/hooks/modules/useAppElementSize'

defineOptions({ name: 'BreakpointsSystemPage' })

type ProfileCard = {
  id: string
  initials: string
  name: string
  department: string
  title: string
}

const deviceStore = useDeviceStore()

const sandboxRef = ref<HTMLElement | null>(null)
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
  <div data-archetype="A1-toolbar-content">
    <CScrollbar>
      <div class="layout-narrow">
        <section class="material-elevated col-stretch gap-lg">
          <header class="col-stretch gap-xs mb-md">
            <h1 class="text-2xl font-bold text-foreground m-0 tracking-tight">
              Responsive Engine · Breakpoints Lab
            </h1>
            <p class="text-sm text-muted-foreground m-0">
              SSOT：断点阈值来自 `BREAKPOINTS`；Active 来自 `deviceStore.currentBreakpoint`；Sandbox
              来自容器实际宽度。
            </p>
          </header>

          <!-- Section 1: SSOT ladder -->
          <section class="bg-muted/30 dark:bg-muted/20 border border-border/40 rounded-lg p-md">
            <div class="col-stretch gap-md">
              <div class="row-between gap-md flex-wrap">
                <div class="col-stretch gap-xs">
                  <h2 class="text-lg font-semibold text-foreground m-0">Breakpoint Ruler Bar</h2>
                  <p class="text-xs text-muted-foreground m-0">
                    Active：
                    <span class="font-mono text-foreground">{{ activeDeviceBreakpoint }}</span>
                  </p>
                </div>
                <Tag
                  value="xs..5xl"
                  severity="info"
                />
              </div>

              <div class="flex flex-row items-end gap-xs overflow-x-auto scrollbar-none pb-xs">
                <div
                  v-for="key in SIZE_SCALE_KEYS"
                  :key="key"
                  class="col-center gap-xs shrink-0 min-w-[var(--spacing-4xl)]"
                >
                  <div
                    class="w-full h-[var(--spacing-xs)] rounded-md border border-border/30 bg-muted/20"
                    :class="activeDeviceBreakpoint === key ? 'bg-primary/20 border-primary/30' : ''"
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
            </div>
          </section>

          <!-- Section 2: Resize sandbox -->
          <section class="bg-muted/30 dark:bg-muted/20 border border-border/40 rounded-lg p-md">
            <div class="col-stretch gap-md">
              <div class="row-between gap-md flex-wrap">
                <div class="col-stretch gap-xs">
                  <h2 class="text-lg font-semibold text-foreground m-0">Resizable Sandbox</h2>
                  <p class="text-xs text-muted-foreground m-0">
                    拖拽右边缘改变容器宽度；Sandbox BP：
                    <span class="font-mono text-foreground">{{ sandboxBreakpoint }}</span>
                  </p>
                </div>
              </div>

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
          </section>
        </section>
      </div>
    </CScrollbar>
  </div>
</template>

<style lang="scss" scoped></style>
