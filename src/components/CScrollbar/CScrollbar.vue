<script setup lang="ts">
/**
 * CScrollbar - 全局滚动容器组件
 *
 * 基于 OverlayScrollbars，完美融合主题系统和尺寸系统：
 * - 滚动条颜色：使用 --muted / --primary CSS 变量
 * - 滚动条圆角：使用尺寸系统圆角阶梯变量 (如 --radius-md)
 * - 自动适配深色/浅色模式
 *
 * @example
 * <CScrollbar class="h-full">
 *   <div>滚动内容</div>
 * </CScrollbar>
 */
import { ref, watch, computed, type ComputedRef } from 'vue'
import { type OverlayScrollbars } from 'overlayscrollbars'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'
import { useThemeStore } from '@/stores/modules/theme'
import { TRANSITION_SCALE_VALUES } from '@/constants/sizeScale'
import type { ScrollbarProps, OnUpdatedEventListenerArgs } from './utils/types'

const props = withDefaults(defineProps<ScrollbarProps>(), {
  visibility: 'auto',
  defer: true,
  native: false,
})

const emit = defineEmits<{
  (e: 'initialized', instance: OverlayScrollbars): void
  (e: 'updated', instance: OverlayScrollbars, onUpdatedArgs: OnUpdatedEventListenerArgs): void
  (e: 'destroyed', instance: OverlayScrollbars, canceled: boolean): void
  (e: 'scroll', instance: OverlayScrollbars, event: Event): void
}>()

const themeStore = useThemeStore()
const scrollbarRef = ref<InstanceType<typeof OverlayScrollbarsComponent> | null>(null)

/** 根据当前主题模式返回配置 */
const osOptions: ComputedRef<any> = computed(() => {
  const baseOptions = {
    scrollbars: {
      visibility: props.visibility,
      autoHide: props.visibility === 'auto' ? ('leave' as const) : ('never' as const),
      // 与尺寸系统 transition-xl (400ms) 一致
      autoHideDelay: TRANSITION_SCALE_VALUES.xl,
      theme: themeStore.isDark ? 'os-theme-dark' : 'os-theme-light',
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

/** 暴露 scrollTo 方法供外部调用 */
function scrollTo(options: ScrollToOptions) {
  const instance = scrollbarRef.value?.osInstance()
  if (instance) {
    const { scrollOffsetElement } = instance.elements()
    scrollOffsetElement.scrollTo(options)
  }
}

/** 暴露 OverlayScrollbars 实例 */
function getInstance(): OverlayScrollbars | null {
  return scrollbarRef.value?.osInstance() ?? null
}

function update(force?: boolean): boolean {
  return scrollbarRef.value?.osInstance()?.update(force) ?? false
}

function state() {
  return scrollbarRef.value?.osInstance()?.state()
}

function elements() {
  return scrollbarRef.value?.osInstance()?.elements()
}

defineExpose({
  scrollTo,
  getInstance,
  update,
  state,
  elements,
})

// 监听主题变化，更新滚动条主题
watch(
  () => themeStore.isDark,
  isDark => {
    const instance = scrollbarRef.value?.osInstance()
    if (instance) {
      instance.options({
        scrollbars: {
          theme: isDark ? 'os-theme-dark' : 'os-theme-light',
        },
      })
    }
  }
)
</script>

<template>
  <!-- 原生滚动条模式 -->
  <div
    v-if="native"
    class="c-scrollbar-native layout-full overflow-auto"
    :class="$props.class"
  >
    <slot />
  </div>

  <!-- OverlayScrollbars 模式；options 与 PartialOptions 类型定义不完全一致，传参处使用边界层断言 -->
  <OverlayScrollbarsComponent
    v-else
    ref="scrollbarRef"
    :options="osOptions"
    :defer="defer"
    class="c-scrollbar layout-full"
    :class="$props.class"
    @os-initialized="instance => emit('initialized', instance)"
    @os-updated="(instance, args) => emit('updated', instance, args)"
    @os-destroyed="(instance, canceled) => emit('destroyed', instance, canceled)"
    @os-scroll="(instance, event) => emit('scroll', instance, event)"
  >
    <slot />
  </OverlayScrollbarsComponent>
</template>

<style lang="scss">
@use 'overlayscrollbars/overlayscrollbars.css';

/* ============================================
 * CScrollbar 主题样式
 * 完美融合项目主题系统 CSS 变量
 * ============================================ */

.c-scrollbar-native {
  /* 原生滚动条样式 */
  &::-webkit-scrollbar {
    width: var(--spacing-xs);
    height: var(--spacing-xs);
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgb(var(--muted) / 0.5);
    border-radius: var(--radius-md);
    border: calc(var(--spacing-xs) / 2) solid transparent;
    background-clip: content-box;

    &:hover {
      background: rgb(var(--muted) / 0.8);
      background-clip: content-box;
    }
  }
}

/* ============================================
 * OverlayScrollbars 主题覆盖
 * ============================================ */

/* 滚动条轨道 */
.os-scrollbar {
  /* 滚动条宽度/高度 */
  --os-size: var(--spacing-sm);
  /* 滚动条内边距 */
  --os-padding-perpendicular: calc(var(--spacing-xs) / 2);
  --os-padding-axis: calc(var(--spacing-xs) / 2);
  /* 轨道背景色 */
  background: rgb(var(--muted-foreground) / 0.08);
  --os-track-bg-hover: rgb(var(--muted) / 0.12);
  --os-track-bg-active: rgb(var(--muted) / 0.18);
  /* 滑块背景色 */
  --os-handle-bg: rgb(var(--muted-foreground) / 0.2);
  --os-handle-bg-hover: rgb(var(--primary) / 0.6);
  --os-handle-bg-active: rgb(var(--primary) / 0.8);
  /* 滑块圆角 - 使用尺寸系统阶梯变量 */
  --os-handle-border-radius: var(--radius-md);
  /* 滑块最小尺寸 */
  --os-handle-min-size: calc(var(--spacing-lg) * 2);
  /* 滑块最大尺寸 */
  --os-handle-max-size: none;
  /* 滑块垂直方向边距 */
  --os-handle-perpendicular-size: 100%;
  --os-handle-perpendicular-size-hover: 100%;
  --os-handle-perpendicular-size-active: 100%;
  /* 过渡动画 */
  transition: var(--transition-sm) ease-out;
}

/* 深色模式下的调整 */
.os-scrollbar.os-theme-dark {
  --os-handle-bg: rgb(var(--muted-foreground) / 0.2);
  --os-handle-bg-hover: rgb(var(--primary) / 0.75);
  --os-handle-bg-active: rgb(var(--primary) / 0.9);
  --os-track-bg-hover: rgb(var(--muted) / 0.18);
  --os-track-bg-active: rgb(var(--muted) / 0.24);
}

/* 滚动条滑块 */
.os-scrollbar-handle {
  cursor: pointer;
  transition: var(--transition-md) ease-out !important;
}

/* 水平滚动条特殊处理 */
.os-scrollbar-horizontal {
  height: var(--os-size);
}

/* 垂直滚动条特殊处理 */
.os-scrollbar-vertical {
  width: var(--os-size);
}

/* 角落区域 */
.os-scrollbar-corner {
  background: transparent;
}
</style>
