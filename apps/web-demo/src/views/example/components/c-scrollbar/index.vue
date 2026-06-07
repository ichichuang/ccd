<script setup lang="ts">
import type { ScrollbarInstance, ScrollbarVisibility } from '@ccd/vue-ui'
import {
  levelToSeverity,
  logRowBg,
  mockLogs,
  mockMembers,
  mockNotifications,
  statusDotClass,
  visibilityOptions,
} from './demoData'

defineOptions({ name: 'ScrollbarSystemPage' })

const COPY_TOAST_GROUP = 'tr' as const

const themeStore = useThemeStore()
const { isDark } = useThemeSwitch()

const visibility = ref<ScrollbarVisibility>('auto')
const deferInit = ref<boolean>(true)
const backToTopThreshold = ref<number>(220)
const backToTopOffsetBottom = ref<number>(24)
const backToTopOffsetRight = ref<number>(24)

const overlayScrollbarRef = ref<ScrollbarInstance | null>(null)
const overlayInitialized = ref<boolean>(false)
const overlayUpdatedCount = ref<number>(0)
const lastScrollTarget = ref<'top' | 'middle' | 'bottom' | null>(null)
const lastScrollTop = ref<number>(0)

const visibilityToken = computed<string>(() => `visibility='${visibility.value}'`)
const deferToken = computed<string>(() => `defer=${deferInit.value ? 'true' : 'false'}`)
const backToTopToken = computed<string>(
  () => `back-to-top=true threshold=${backToTopThreshold.value}`
)
const backToTopComparatorToken = computed<string>(
  () => `native=[false|true] back-to-top=true threshold=${backToTopThreshold.value}`
)

async function copyText(text: string, label: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)
    window.$toast?.add({
      severity: 'success',
      summary: '已复制',
      detail: `类名: ${text} (${label})`,
      life: 2000,
      group: COPY_TOAST_GROUP,
    })
  } catch {
    window.$toast?.add({
      severity: 'error',
      summary: '复制失败',
      detail: '请检查剪贴板权限',
      life: 2000,
      group: COPY_TOAST_GROUP,
    })
  }
}

function readOverlayMaxTop(instanceElements: unknown): number {
  if (!instanceElements || typeof instanceElements !== 'object') return 0
  const elementsRecord = instanceElements as Record<string, unknown>
  const viewport = elementsRecord.viewport
  if (!viewport || typeof viewport !== 'object') return 0
  const viewportRecord = viewport as Record<string, unknown>
  const scrollHeight =
    typeof viewportRecord.scrollHeight === 'number' ? viewportRecord.scrollHeight : 0
  const clientHeight =
    typeof viewportRecord.clientHeight === 'number' ? viewportRecord.clientHeight : 0
  return Math.max(0, scrollHeight - clientHeight)
}

function computeTargetTop(target: 'top' | 'middle' | 'bottom', maxTop: number): number {
  if (target === 'top') return 0
  if (target === 'middle') return maxTop / 2
  return maxTop
}

function scrollOverlayTo(target: 'top' | 'middle' | 'bottom'): void {
  const instance = overlayScrollbarRef.value?.getInstance()
  if (!instance) return
  const elementsUnknown: unknown = instance.elements()
  const maxTop = readOverlayMaxTop(elementsUnknown)
  const top = computeTargetTop(target, maxTop)
  overlayScrollbarRef.value?.scrollTo({ top })
  lastScrollTarget.value = target
  lastScrollTop.value = top
}

function toggleDark(next: boolean): void {
  themeStore.setMode(next ? 'dark' : 'light')
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
                  name="i-lucide-scroll"
                  size="xl"
                  class="text-primary"
                />
              </div>
              <div class="col-stretch gap-xs min-w-0">
                <div class="row-start gap-xs min-w-0 flex-wrap">
                  <span class="text-lg font-bold text-foreground text-no-wrap">CScrollbar</span>
                  <span
                    class="surface-primary rounded-md px-sm py-xs text-xs font-semibold uppercase"
                  >
                    COMPONENT
                  </span>
                </div>
                <span class="text-sm text-muted-foreground text-ellipsis-1">
                  Native 与 OverlayScrollbars 的统一展陈页：可视化对比、程序化滚动、Nested 独立性。
                </span>
              </div>
            </div>
          </div>
          <div class="text-xs text-muted-foreground row-start gap-xs flex-wrap min-w-0">
            <span>快捷参数：</span>
            <Button
              label="visibility"
              text
              size="small"
              class="p-0 h-auto underline decoration-primary/40 underline-offset-2"
              @click="copyText(visibilityToken, 'CScrollbar visibility prop')"
            />
            <span class="font-mono text-foreground">{{ visibilityToken }}</span>
            <span class="text-muted-foreground/40">·</span>
            <Button
              label="defer"
              text
              size="small"
              class="p-0 h-auto underline decoration-primary/40 underline-offset-2"
              @click="copyText(deferToken, 'CScrollbar defer prop')"
            />
            <span class="font-mono text-foreground">{{ deferToken }}</span>
          </div>
        </header>

        <section class="material-elevated col-stretch gap-lg min-w-0">
          <div class="col-stretch gap-xs">
            <h2 class="text-lg font-semibold text-foreground m-0">
              Section 1 · Controls + Comparator
            </h2>
            <p class="text-xs text-muted-foreground m-0">
              先配置 Overlay 行为，再观察 Native 与 Overlay 的滚动和视觉差异。
            </p>
          </div>

          <div class="demo-well col-stretch gap-md min-w-0">
            <div class="row-between items-end gap-md flex-wrap">
              <div class="col-stretch gap-xs">
                <span class="text-sm font-semibold text-foreground">Comparator Controls</span>
                <span class="text-xs text-muted-foreground">
                  Visibility / Defer 仅影响 Overlay，Native 仍由浏览器和系统控制。
                </span>
              </div>
              <div class="row-end gap-lg flex-wrap">
                <div class="col-stretch gap-xs">
                  <label class="text-xs text-muted-foreground">Visibility</label>
                  <Select
                    v-model="visibility"
                    :options="visibilityOptions"
                    option-label="label"
                    option-value="value"
                    class="w-full"
                  />
                </div>
                <div class="col-stretch gap-xs">
                  <label class="text-xs text-muted-foreground">Defer init</label>
                  <ToggleSwitch
                    :model-value="deferInit"
                    @update:model-value="(v: boolean) => (deferInit = v)"
                  />
                </div>
                <div class="col-stretch gap-xs">
                  <label class="text-xs text-muted-foreground">Dark mode</label>
                  <ToggleSwitch
                    :model-value="isDark"
                    @update:model-value="(v: boolean) => toggleDark(v)"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div class="demo-well col-stretch">
              <div class="row-between border-b border-border/30 px-sm py-xs">
                <div class="row-start gap-xs items-center">
                  <Icons
                    name="i-lucide-terminal"
                    size="sm"
                    class="text-muted-foreground"
                  />
                  <span class="text-sm font-semibold text-foreground">Native Scrollbar</span>
                </div>
                <div class="row-end gap-sm">
                  <Tag
                    value="System Logs"
                    severity="secondary"
                  />
                  <Button
                    text
                    size="small"
                    label="copy"
                    class="p-0 h-auto text-muted-foreground/40 hover:text-primary"
                    @click="copyText('native=true', 'CScrollbar native prop')"
                  />
                </div>
              </div>
              <div class="demo-stage p-sm h-40vh">
                <CScrollbar
                  :native="true"
                  :visibility="visibility"
                  :defer="deferInit"
                >
                  <div class="col-stretch gap-xs p-xs">
                    <div
                      v-for="entry in mockLogs"
                      :key="`native-log-${entry.id}`"
                      class="interactive-item row-start gap-sm items-start rounded-md px-xs py-xs"
                      :class="logRowBg(entry.level)"
                    >
                      <span
                        class="text-xs font-mono text-muted-foreground shrink-0 w-[var(--spacing-4xl)] pt-xs"
                      >
                        {{ entry.timestamp }}
                      </span>
                      <Tag
                        :value="entry.level.toUpperCase()"
                        :severity="levelToSeverity(entry.level)"
                        class="shrink-0 text-xs"
                      />
                      <div class="col-stretch gap-xs min-w-0">
                        <span class="text-xs font-semibold text-foreground">
                          {{ entry.source }}
                        </span>
                        <span class="text-xs text-muted-foreground text-ellipsis-1">
                          {{ entry.message }}
                        </span>
                      </div>
                    </div>
                  </div>
                </CScrollbar>
              </div>
            </div>

            <div class="demo-well col-stretch">
              <div class="row-between border-b border-border/30 px-sm py-xs">
                <div class="row-start gap-xs items-center">
                  <Icons
                    name="i-lucide-users"
                    size="sm"
                    class="text-muted-foreground"
                  />
                  <span class="text-sm font-semibold text-foreground">Overlay Scrollbar</span>
                </div>
                <div class="row-end gap-sm">
                  <Tag
                    value="Team Members"
                    severity="info"
                  />
                  <Button
                    text
                    size="small"
                    label="copy"
                    class="p-0 h-auto text-muted-foreground/40 hover:text-primary"
                    @click="copyText('native=false', 'CScrollbar native prop')"
                  />
                </div>
              </div>
              <div class="demo-stage p-sm h-40vh">
                <CScrollbar
                  ref="overlayScrollbarRef"
                  :native="false"
                  :visibility="visibility"
                  :defer="deferInit"
                  @initialized="() => (overlayInitialized = true)"
                  @updated="() => (overlayUpdatedCount += 1)"
                >
                  <div class="col-stretch gap-xs p-xs">
                    <div
                      v-for="member in mockMembers"
                      :key="`member-${member.id}`"
                      class="interactive-item rounded-md px-sm py-xs row-between gap-sm"
                    >
                      <div class="row-start gap-sm items-center min-w-0">
                        <div class="relative shrink-0">
                          <Avatar
                            :label="member.initials"
                            shape="circle"
                          />
                          <span
                            class="absolute bottom-0 right-0 w-[var(--spacing-sm)] h-[var(--spacing-sm)] rounded-full border-2 border-card"
                            :class="statusDotClass(member.status)"
                          />
                        </div>
                        <div class="col-stretch gap-xs min-w-0">
                          <span class="text-sm font-semibold text-foreground text-ellipsis-1">
                            {{ member.name }}
                          </span>
                          <span class="text-xs text-muted-foreground">{{ member.role }}</span>
                        </div>
                      </div>
                      <Tag
                        :value="member.department"
                        severity="secondary"
                        rounded
                        class="shrink-0"
                      />
                    </div>
                  </div>
                </CScrollbar>
              </div>
            </div>
          </div>
        </section>

        <section class="material-elevated col-stretch gap-lg min-w-0">
          <div class="col-stretch gap-xs">
            <h2 class="text-lg font-semibold text-foreground m-0">
              Section 2 · Programmatic Scroll + Status
            </h2>
            <p class="text-xs text-muted-foreground m-0">
              使用统一按钮控制 Overlay 滚动位置，并实时观察实例状态与目标偏移。
            </p>
          </div>
          <div class="demo-well col-stretch gap-sm min-w-0">
            <div class="row-between gap-md flex-wrap">
              <div class="col-stretch gap-xs">
                <span class="text-sm font-semibold text-foreground">Scroll To · Overlay</span>
                <span class="text-xs text-muted-foreground">
                  Top / Middle / End 程序化滚动控制。
                </span>
              </div>
              <div class="row-end gap-xs">
                <Button
                  label="↑ Top"
                  size="small"
                  :outlined="lastScrollTarget !== 'top'"
                  :severity="lastScrollTarget === 'top' ? 'primary' : 'secondary'"
                  @click="scrollOverlayTo('top')"
                />
                <Button
                  label="↕ Mid"
                  size="small"
                  :outlined="lastScrollTarget !== 'middle'"
                  :severity="lastScrollTarget === 'middle' ? 'primary' : 'secondary'"
                  @click="scrollOverlayTo('middle')"
                />
                <Button
                  label="↓ End"
                  size="small"
                  :outlined="lastScrollTarget !== 'bottom'"
                  :severity="lastScrollTarget === 'bottom' ? 'primary' : 'secondary'"
                  @click="scrollOverlayTo('bottom')"
                />
              </div>
            </div>
            <div class="demo-stage p-sm col-stretch gap-xs">
              <div class="row-between gap-md flex-wrap">
                <span class="text-xs text-muted-foreground">
                  Overlay status:
                  <span class="font-mono text-foreground">
                    {{ overlayInitialized ? 'ready' : 'initializing' }}
                  </span>
                  <span class="text-muted-foreground/40 mx-xs">·</span>
                  updates:
                  <span class="font-mono text-foreground">{{ overlayUpdatedCount }}</span>
                </span>
                <span class="text-xs text-muted-foreground">
                  target:
                  <span class="font-mono text-foreground">{{ lastScrollTarget ?? '—' }}</span>
                  <span class="text-muted-foreground/40 mx-xs">·</span>
                  scrollTop:
                  <span class="font-mono text-foreground">{{ Math.round(lastScrollTop) }}</span>
                </span>
              </div>
            </div>
          </div>

          <div class="demo-well col-stretch gap-sm min-w-0">
            <div class="row-between gap-md flex-wrap">
              <div class="col-stretch gap-xs">
                <span class="text-sm font-semibold text-foreground">Back To Top Demo</span>
                <span class="text-xs text-muted-foreground">
                  向下滚动超过阈值后显示回顶按钮，点击后平滑回到顶部。下面同时展示 Overlay 与
                  Native。
                </span>
              </div>
              <Button
                text
                size="small"
                label="copy"
                class="p-0 h-auto text-muted-foreground/40 hover:text-foreground"
                @click="copyText(backToTopComparatorToken, 'CScrollbar backToTop comparator props')"
              />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div class="demo-stage p-sm h-40vh col-stretch gap-xs">
                <div class="row-between gap-sm">
                  <span class="text-xs font-semibold text-foreground">Overlay mode</span>
                  <Button
                    text
                    size="small"
                    label="copy"
                    class="p-0 h-auto text-muted-foreground/40 hover:text-foreground"
                    @click="copyText(backToTopToken, 'Overlay backToTop props')"
                  />
                </div>
                <CScrollbar
                  :native="false"
                  :visibility="visibility"
                  :defer="deferInit"
                  :back-to-top="true"
                  :back-to-top-threshold="backToTopThreshold"
                  :back-to-top-offset-bottom="backToTopOffsetBottom"
                  :back-to-top-offset-right="backToTopOffsetRight"
                >
                  <div class="col-stretch gap-xs p-xs">
                    <div
                      v-for="entry in mockLogs.slice(0, 30)"
                      :key="`backtop-overlay-log-${entry.id}`"
                      class="interactive-item row-start gap-sm items-start rounded-md px-xs py-xs"
                      :class="logRowBg(entry.level)"
                    >
                      <span
                        class="text-xs font-mono text-muted-foreground shrink-0 w-[var(--spacing-4xl)]"
                      >
                        {{ entry.timestamp }}
                      </span>
                      <div class="col-stretch gap-xs min-w-0">
                        <span class="text-xs font-semibold text-foreground">
                          {{ entry.source }}
                        </span>
                        <span class="text-xs text-muted-foreground text-ellipsis-1">
                          {{ entry.message }}
                        </span>
                      </div>
                    </div>
                  </div>
                </CScrollbar>
              </div>

              <div class="demo-stage p-sm h-40vh col-stretch gap-xs">
                <div class="row-between gap-sm">
                  <span class="text-xs font-semibold text-foreground">Native mode</span>
                  <Button
                    text
                    size="small"
                    label="copy"
                    class="p-0 h-auto text-muted-foreground/40 hover:text-foreground"
                    @click="copyText(`${backToTopToken} native=true`, 'Native backToTop props')"
                  />
                </div>
                <CScrollbar
                  :native="true"
                  :visibility="visibility"
                  :defer="deferInit"
                  :back-to-top="true"
                  :back-to-top-threshold="backToTopThreshold"
                  :back-to-top-offset-bottom="backToTopOffsetBottom"
                  :back-to-top-offset-right="backToTopOffsetRight"
                >
                  <div class="col-stretch gap-xs p-xs">
                    <div
                      v-for="entry in mockLogs.slice(0, 30)"
                      :key="`backtop-native-log-${entry.id}`"
                      class="interactive-item row-start gap-sm items-start rounded-md px-xs py-xs"
                      :class="logRowBg(entry.level)"
                    >
                      <span
                        class="text-xs font-mono text-muted-foreground shrink-0 w-[var(--spacing-4xl)]"
                      >
                        {{ entry.timestamp }}
                      </span>
                      <div class="col-stretch gap-xs min-w-0">
                        <span class="text-xs font-semibold text-foreground">
                          {{ entry.source }}
                        </span>
                        <span class="text-xs text-muted-foreground text-ellipsis-1">
                          {{ entry.message }}
                        </span>
                      </div>
                    </div>
                  </div>
                </CScrollbar>
              </div>
            </div>
          </div>
        </section>

        <section class="material-elevated col-stretch gap-lg min-w-0">
          <div class="col-stretch gap-xs">
            <h2 class="text-lg font-semibold text-foreground m-0">
              Section 3 · Nested Scrollbars + Behavior Notes
            </h2>
            <p class="text-xs text-muted-foreground m-0">
              父子容器均使用 Overlay，验证 thumb 独立性、自动隐藏与主题响应行为（轨道/滑块采用
              `--foreground` 透明度中性色，不与品牌主色绑定）。
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div class="col-stretch gap-sm">
              <div class="row-between">
                <span class="text-sm font-semibold text-foreground">Parent CScrollbar</span>
                <Button
                  text
                  size="small"
                  label="copy"
                  class="p-0 h-auto text-muted-foreground/40 hover:text-primary"
                  @click="copyText('CScrollbar', 'component name')"
                />
              </div>
              <div class="demo-well col-stretch">
                <div class="demo-stage p-sm h-40vh">
                  <CScrollbar
                    :native="false"
                    visibility="visible"
                    :defer="deferInit"
                  >
                    <div class="col-stretch gap-xs p-xs">
                      <div
                        v-for="notif in mockNotifications"
                        :key="`notif-${notif.id}`"
                        class="interactive-item rounded-md px-sm py-xs row-start gap-sm items-start"
                      >
                        <div class="relative shrink-0 mt-xs">
                          <Icons
                            :name="notif.icon"
                            size="sm"
                            :class="notif.unread ? 'text-primary' : 'text-muted-foreground'"
                          />
                          <span
                            v-if="notif.unread"
                            class="absolute -top-1 -right-1 w-[var(--spacing-xs)] h-[var(--spacing-xs)] rounded-full bg-primary"
                          />
                        </div>
                        <div class="col-stretch gap-xs min-w-0">
                          <div class="row-between items-start gap-sm">
                            <span
                              class="text-xs font-semibold"
                              :class="notif.unread ? 'text-primary' : 'text-foreground'"
                            >
                              {{ notif.title }}
                            </span>
                            <span class="text-xs text-muted-foreground text-no-wrap shrink-0">
                              {{ notif.timeAgo }}
                            </span>
                          </div>
                          <span class="text-xs text-muted-foreground text-ellipsis-1">
                            {{ notif.body }}
                          </span>
                        </div>
                      </div>

                      <div class="demo-well col-stretch gap-xs mt-xs">
                        <div class="row-between">
                          <span class="text-xs font-semibold text-muted-foreground">
                            Child container
                          </span>
                          <Tag
                            value="Inner handle"
                            severity="secondary"
                          />
                        </div>
                        <div class="demo-stage p-xs h-40vh">
                          <CScrollbar
                            :native="false"
                            visibility="auto"
                            :defer="deferInit"
                          >
                            <div class="col-stretch gap-xs p-xs">
                              <div
                                v-for="member in mockMembers.slice(0, 20)"
                                :key="`child-member-${member.id}`"
                                class="interactive-item rounded-md px-xs py-xs row-start gap-xs items-center border border-border/20 bg-background/30"
                              >
                                <span class="text-xs font-mono text-muted-foreground shrink-0">
                                  {{ member.initials }}
                                </span>
                                <span class="text-xs text-foreground text-ellipsis-1">
                                  {{ member.name }}
                                </span>
                                <span
                                  class="w-[var(--spacing-xs)] h-[var(--spacing-xs)] rounded-full shrink-0 ml-auto"
                                  :class="statusDotClass(member.status)"
                                />
                              </div>
                            </div>
                          </CScrollbar>
                        </div>
                      </div>
                    </div>
                  </CScrollbar>
                </div>
              </div>
            </div>

            <div class="col-stretch gap-sm">
              <div class="row-between">
                <span class="text-sm font-semibold text-foreground">Behavior Notes</span>
                <Button
                  text
                  size="small"
                  label="autoHide='leave'"
                  class="p-0 h-auto text-xs text-muted-foreground/40 hover:text-primary"
                  @click="copyText('autoHide: leave', 'OverlayScrollbars autoHide mode')"
                />
              </div>
              <div class="demo-well col-stretch gap-sm min-w-0">
                <div class="demo-stage p-md col-stretch gap-sm">
                  <div class="row-start gap-sm items-start">
                    <span class="text-xs font-mono text-muted-foreground shrink-0 mt-xs">01</span>
                    <span class="text-xs text-muted-foreground">
                      <span class="font-semibold text-foreground">Overlay auto-hide：</span>
                      `visibility=auto` 时，thumb 在鼠标移开后自动淡出。
                    </span>
                  </div>
                  <div class="row-start gap-sm items-start">
                    <span class="text-xs font-mono text-muted-foreground shrink-0 mt-xs">02</span>
                    <span class="text-xs text-muted-foreground">
                      <span class="font-semibold text-foreground">Native 对比基准：</span>
                      Native 行为由浏览器与系统实现决定，不受该参数控制。
                    </span>
                  </div>
                  <div class="row-start gap-sm items-start">
                    <span class="text-xs font-mono text-muted-foreground shrink-0 mt-xs">03</span>
                    <span class="text-xs text-muted-foreground">
                      <span class="font-semibold text-foreground">主题响应：</span>
                      Overlay 基于 `--foreground` 透明度中性色，深浅模式切换后 thumb 自动匹配。
                    </span>
                  </div>
                  <div class="row-start gap-sm items-start">
                    <span class="text-xs font-mono text-muted-foreground shrink-0 mt-xs">04</span>
                    <span class="text-xs text-muted-foreground">
                      <span class="font-semibold text-foreground">Nested 独立性：</span>
                      父子容器持有独立实例，滚动与 thumb 渲染互不干扰。
                    </span>
                  </div>
                  <div class="row-start gap-sm items-start">
                    <span class="text-xs font-mono text-muted-foreground shrink-0 mt-xs">05</span>
                    <span class="text-xs text-muted-foreground">
                      <span class="font-semibold text-foreground">Scroll To API：</span>
                      使用 `scrollTo({ top })` 可精确控制 Overlay 滚动位置。
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
