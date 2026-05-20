<script setup lang="ts">
/**
 * CScrollbar - 全局滚动容器组件
 *
 * 基于 OverlayScrollbars，完美融合主题系统和尺寸系统：
 * - 滚动条颜色：中性前景 --foreground（轨道/滑块低透明度叠色；hover/active 略加强）
 * - native 模式：Firefox scrollbar-color + WebKit 伪元素与 OS 模式对齐（含 html.dark）
 * - 滚动条圆角：滑块胶囊形（与轨道宽度联动）+ 轨道圆角
 * - 自动适配深色/浅色模式
 *
 * @example
 * <CScrollbar class="h-full">
 *   <div>滚动内容</div>
 * </CScrollbar>
 */
import { computed, nextTick, onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue'
import type { ComputedRef } from 'vue'
import { usePrimeVue } from 'primevue/config'
import { type Elements, type OverlayScrollbars, type State } from 'overlayscrollbars'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'
import {
  DEFAULT_SCROLLBAR_AUTO_HIDE_DELAY_MS,
  defaultScrollbarProps,
  resolveScrollbarAutoHide,
} from './utils/constants'
import type { ScrollbarProps, OnUpdatedEventListenerArgs } from './utils/types'
import AnimateWrapper from '../AnimateWrapper/AnimateWrapper.vue'
import Icons from '../Icons/Icons.vue'

defineOptions({ name: 'CScrollbar' })

const props = withDefaults(defineProps<ScrollbarProps>(), {
  ...defaultScrollbarProps,
})

const emit = defineEmits<{
  (e: 'initialized', instance: OverlayScrollbars): void
  (e: 'updated', instance: OverlayScrollbars, onUpdatedArgs: OnUpdatedEventListenerArgs): void
  (e: 'destroyed', instance: OverlayScrollbars, canceled: boolean): void
  (e: 'scroll', instance: OverlayScrollbars, event: Event): void
}>()

const primevue = usePrimeVue()
const backToTopAriaLabel = computed(() => primevue.config.locale?.aria?.scrollTop ?? 'Scroll Top')

const backToTopFabStyle = computed(() => ({
  bottom: `${props.backToTopOffsetBottom}px`,
  right: `${props.backToTopOffsetRight}px`,
}))

const nativeScrollRef = useTemplateRef<HTMLDivElement>('nativeScrollRef')
const backToTopVisible = ref(false)
const documentDark = ref(false)

const scrollbarRef = useTemplateRef<InstanceType<typeof OverlayScrollbarsComponent>>('scrollbarRef')
const isDark = computed(() => props.dark ?? documentDark.value)

/** 根据当前主题模式返回配置 */
const osOptions: ComputedRef<Record<string, unknown>> = computed(() => {
  const baseOptions = {
    scrollbars: {
      visibility: props.visibility,
      autoHide: resolveScrollbarAutoHide(props.visibility),
      autoHideDelay: DEFAULT_SCROLLBAR_AUTO_HIDE_DELAY_MS,
      theme: isDark.value ? 'os-theme-dark' : 'os-theme-light',
    },
  }
  // 合并用户传入的 options (简单合并，如果需要深合并可以使用 defu 或 deepmerge，这里假设 options 结构扁平或用于从属配置)
  // OverlayScrollbars 的 options 结构较深，简单解构可能不够。
  // 但考虑到 props.options 通常只覆盖特定字段，这里手动合并 scrollbars 部分。
  if (props.options) {
    return {
      ...baseOptions,
      ...props.options,
      scrollbars: {
        ...baseOptions.scrollbars,
        ...(props.options.scrollbars || {}),
      },
    }
  }
  return baseOptions
})

function syncBackToTopVisibility(scrollEl: HTMLElement) {
  if (!props.backToTop) {
    backToTopVisible.value = false
    return
  }
  backToTopVisible.value = scrollEl.scrollTop > props.backToTopThreshold
}

function handleOsScroll(instance: OverlayScrollbars, event: Event) {
  emit('scroll', instance, event)
  if (props.backToTop) {
    syncBackToTopVisibility(instance.elements().scrollOffsetElement)
  }
}

function handleNativeScroll() {
  const el = nativeScrollRef.value
  if (el) {
    syncBackToTopVisibility(el)
  }
}

function onOsInitialized(instance: OverlayScrollbars) {
  emit('initialized', instance)
  if (props.backToTop) {
    nextTick(() => {
      syncBackToTopVisibility(instance.elements().scrollOffsetElement)
    })
  }
}

function onOsUpdated(instance: OverlayScrollbars, args: OnUpdatedEventListenerArgs) {
  emit('updated', instance, args)
  if (props.backToTop) {
    syncBackToTopVisibility(instance.elements().scrollOffsetElement)
  }
}

/** 暴露 scrollTo 方法供外部调用 */
function scrollTo(options: ScrollToOptions) {
  if (props.native) {
    nativeScrollRef.value?.scrollTo(options)
    return
  }
  const instance = scrollbarRef.value?.osInstance()
  if (instance) {
    const { scrollOffsetElement } = instance.elements()
    scrollOffsetElement.scrollTo(options)
  }
}

function scrollToTop() {
  scrollTo({ top: 0, behavior: 'smooth' })
}

function onBackToTopKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    scrollToTop()
  }
}

/** 暴露 OverlayScrollbars 实例 */
function getInstance(): OverlayScrollbars | null {
  return scrollbarRef.value?.osInstance() ?? null
}

function update(force?: boolean): boolean {
  return scrollbarRef.value?.osInstance()?.update(force) ?? false
}

function state(): State | undefined {
  return scrollbarRef.value?.osInstance()?.state()
}

function elements(): Elements | undefined {
  return scrollbarRef.value?.osInstance()?.elements()
}

// 监听主题变化，更新滚动条主题
watch(
  isDark,
  dark => {
    const instance = scrollbarRef.value?.osInstance()
    if (instance) {
      instance.options({
        scrollbars: {
          theme: dark ? 'os-theme-dark' : 'os-theme-light',
        },
      })
    }
  }
)

watch(
  () => [props.backToTop, props.backToTopThreshold] as const,
  () => {
    if (!props.backToTop) {
      backToTopVisible.value = false
      return
    }
    if (props.native && nativeScrollRef.value) {
      syncBackToTopVisibility(nativeScrollRef.value)
    } else if (!props.native) {
      const inst = scrollbarRef.value?.osInstance()
      if (inst) {
        syncBackToTopVisibility(inst.elements().scrollOffsetElement)
      }
    }
  }
)

function syncDocumentDark() {
  documentDark.value = globalThis.document?.documentElement.classList.contains('dark') ?? false
}

let darkObserver: MutationObserver | undefined

onMounted(() => {
  syncDocumentDark()
  if (props.dark === undefined && globalThis.document?.documentElement) {
    darkObserver = new MutationObserver(syncDocumentDark)
    darkObserver.observe(globalThis.document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
  }
  nextTick(() => {
    if (!props.backToTop) return
    if (props.native && nativeScrollRef.value) {
      syncBackToTopVisibility(nativeScrollRef.value)
    }
  })
})

onUnmounted(() => {
  darkObserver?.disconnect()
})

defineExpose({
  scrollTo,
  getInstance,
  update,
  state,
  elements,
})
</script>

<template>
  <div class="relative layout-full min-h-0">
    <!-- 原生滚动条模式 -->
    <div
      v-if="native"
      ref="nativeScrollRef"
      class="c-scrollbar-native layout-full overflow-auto !bg-transparent"
      :class="$props.class"
      @scroll="handleNativeScroll"
    >
      <slot />
    </div>

    <!-- OverlayScrollbars 模式；options 与 PartialOptions 类型定义不完全一致，传参处使用边界层断言 -->
    <OverlayScrollbarsComponent
      v-else
      ref="scrollbarRef"
      :options="osOptions"
      :defer="defer"
      class="c-scrollbar layout-full !bg-transparent"
      :class="$props.class"
      @os-initialized="onOsInitialized"
      @os-updated="onOsUpdated"
      @os-destroyed="(instance, canceled) => emit('destroyed', instance, canceled)"
      @os-scroll="handleOsScroll"
    >
      <slot />
    </OverlayScrollbarsComponent>

    <!-- 位于滚动视口外层定位层；omitLayoutFull 避免内层 layout-full 全屏遮挡滚动 -->
    <AnimateWrapper
      v-if="backToTop"
      :show="backToTopVisible"
      omit-layout-full
      enter="zoomIn"
      leave="zoomOut"
      speed="fast"
      :appear="true"
      class="center absolute z-content"
      :style="backToTopFabStyle"
    >
      <div
        role="button"
        tabindex="0"
        class="center cursor-pointer rounded-full p-sm border border-primary/25 bg-primary text-primary-foreground transition-all duration-md hover:bg-primary-hover active:scale-95"
        :aria-label="backToTopAriaLabel"
        @click="scrollToTop"
        @keydown="onBackToTopKeydown"
      >
        <Icons
          name="i-lucide-circle-arrow-up"
          size="xl"
        />
      </div>
    </AnimateWrapper>
  </div>
</template>

<style lang="scss">
@use 'overlayscrollbars/overlayscrollbars.css';

/* ============================================
 * OverlayScrollbars 主题覆盖
 * ============================================ */

/* Optical tunnel: library defaults must not paint an opaque scroll viewport */
.c-scrollbar.os-host,
.c-scrollbar .os-viewport,
.c-scrollbar .os-content,
.c-scrollbar .os-content-glue {
  background: transparent !important;
}

/* 仅作用于本组件实例，避免污染页面内其它 OverlayScrollbars */
.c-scrollbar .os-scrollbar {
  --os-size: var(--spacing-sm);
  --os-padding-perpendicular: calc(var(--spacing-xs) / 2);
  --os-padding-axis: calc(var(--spacing-xs) / 2);

  /* 轨道：中性前景低透明铺底，避免品牌色侵入 */
  background: rgb(var(--foreground) / 4%);

  --os-track-bg-hover: rgb(var(--foreground) / 7%);
  --os-track-bg-active: rgb(var(--foreground) / 10%);

  /* 滑块：使用中性色阶，降低主题品牌耦合 */
  --os-handle-bg: rgb(var(--foreground) / 16%);
  --os-handle-bg-hover: rgb(var(--foreground) / 28%);
  --os-handle-bg-active: rgb(var(--foreground) / 36%);
  --os-handle-border-radius: calc(var(--os-size) / 2);
  --os-handle-min-size: calc(var(--spacing-lg) * 2);
  --os-handle-max-size: none;
  --os-handle-perpendicular-size: 100%;
  --os-handle-perpendicular-size-hover: 100%;
  --os-handle-perpendicular-size-active: 100%;

  transition: var(--transition-md) ease-out;
}

.c-scrollbar .os-scrollbar.os-theme-dark {
  background: rgb(var(--foreground) / 6%);

  --os-handle-bg: rgb(var(--foreground) / 14%);
  --os-handle-bg-hover: rgb(var(--foreground) / 24%);
  --os-handle-bg-active: rgb(var(--foreground) / 34%);
  --os-track-bg-hover: rgb(var(--foreground) / 9%);
  --os-track-bg-active: rgb(var(--foreground) / 14%);
}

.c-scrollbar .os-scrollbar-handle {
  cursor: pointer;
  transition:
    var(--transition-md) ease-out,
    box-shadow var(--transition-md) ease-out !important;
  box-shadow: none;
}

.c-scrollbar .os-scrollbar-handle:hover,
.c-scrollbar .os-scrollbar-handle:active {
  box-shadow: 0 0 0 1px rgb(var(--foreground) / 22%);
}

.c-scrollbar .os-scrollbar-horizontal {
  height: var(--os-size);
  border-radius: var(--radius-lg);
}

.c-scrollbar .os-scrollbar-vertical {
  width: var(--os-size);
  border-radius: var(--radius-lg);
}

.c-scrollbar .os-scrollbar-corner {
  background: transparent;
}

/* native 模式：与 Overlay 分支一致的中性色系 */
.c-scrollbar-native {
  scrollbar-gutter: stable;
  scrollbar-width: thin;
  scrollbar-color: rgb(var(--foreground) / 16%) rgb(var(--foreground) / 4%);
}

.c-scrollbar-native::-webkit-scrollbar {
  width: var(--spacing-sm);
  height: var(--spacing-sm);
}

.c-scrollbar-native::-webkit-scrollbar-track {
  background: rgb(var(--foreground) / 4%);
  border-radius: var(--radius-lg);
}

.c-scrollbar-native::-webkit-scrollbar-thumb {
  background: rgb(var(--foreground) / 16%);
  border-radius: calc(var(--spacing-sm) / 2);
  box-shadow: none;
  transition:
    background var(--transition-md) ease-out,
    box-shadow var(--transition-md) ease-out;
}

.c-scrollbar-native::-webkit-scrollbar-thumb:hover {
  background: rgb(var(--foreground) / 28%);
  box-shadow: 0 0 0 1px rgb(var(--foreground) / 22%);
}

.c-scrollbar-native::-webkit-scrollbar-thumb:active {
  background: rgb(var(--foreground) / 36%);
}

html.dark .c-scrollbar-native {
  scrollbar-color: rgb(var(--foreground) / 14%) rgb(var(--foreground) / 6%);
}

html.dark .c-scrollbar-native::-webkit-scrollbar-track {
  background: rgb(var(--foreground) / 6%);
}

html.dark .c-scrollbar-native::-webkit-scrollbar-thumb {
  background: rgb(var(--foreground) / 14%);
}

html.dark .c-scrollbar-native::-webkit-scrollbar-thumb:hover {
  background: rgb(var(--foreground) / 24%);
  box-shadow: 0 0 0 1px rgb(var(--foreground) / 24%);
}

html.dark .c-scrollbar-native::-webkit-scrollbar-thumb:active {
  background: rgb(var(--foreground) / 34%);
}
</style>
