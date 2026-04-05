<script setup lang="ts">
import { goToRoute } from '@/router/utils/helper'

const route = useRoute()

const parentPaths = computed<string[]>(() => {
  const paths = route.meta?.parentPaths
  return Array.isArray(paths) ? paths : []
})

interface MetaExampleItem {
  title: string
  metaFields: string
  path: string
  name: string
  icon: string
}

const examples: MetaExampleItem[] = [
  {
    title: '外链示例',
    metaFields: 'isLink, linkUrl',
    path: '/example/router-meta/external-link',
    name: 'ExampleExternalLink',
    icon: 'i-lucide-external-link',
  },
  {
    title: '隐藏面包屑',
    metaFields: 'hideBreadcrumb',
    path: '/example/router-meta/hide-breadcrumb',
    name: 'ExampleHideBreadcrumb',
    icon: 'i-lucide-navigation',
  },
  {
    title: '隐藏标签页',
    metaFields: 'hiddenTag',
    path: '/example/router-meta/hidden-tag',
    name: 'ExampleHiddenTag',
    icon: 'i-lucide-tag',
  },
  {
    title: '比例布局 (16:9)',
    metaFields: 'parent: ratio, ratio',
    path: '/example/router-meta/ratio-demo',
    name: 'ExampleRatioDemo',
    icon: 'i-lucide-ratio',
  },
  {
    title: '窗口复用',
    metaFields: 'parent: fullscreen, reuseWindow',
    path: '/example/router-meta/reuse-window',
    name: 'ExampleReuseWindow',
    icon: 'i-lucide-app-window',
  },
  {
    title: '路由过渡动画',
    metaFields: 'transition',
    path: '/example/router-meta/transition-demo',
    name: 'ExampleTransitionDemo',
    icon: 'i-lucide-sparkles',
  },
]

function navigateTo(item: MetaExampleItem) {
  goToRoute(item.name, undefined, undefined, false)
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
                    name="i-lucide-route"
                    size="xl"
                    class="text-primary"
                  />
                </div>
                <div class="col-stretch gap-xs min-w-0">
                  <div class="row-start gap-xs min-w-0 flex-wrap">
                    <span class="text-lg font-bold text-foreground text-no-wrap">
                      Router Meta Index
                    </span>
                    <span
                      class="surface-info rounded-md px-sm py-xs text-xs font-semibold uppercase"
                    >
                      META
                    </span>
                  </div>
                  <span class="text-sm text-muted-foreground text-ellipsis-1">
                    路由 Meta 功能示例索引 — 浏览所有 meta 字段的实际效果演示
                  </span>
                </div>
              </div>
            </div>
          </header>

          <div class="glass-card col-stretch gap-sm min-w-0">
            <div class="text-md font-medium">当前路由 meta.parentPaths（自动注入）</div>
            <p class="text-muted-foreground text-sm">
              parentPaths 由 addParentPathsToLeafRoutes 自动为叶子路由注入，用于面包屑、菜单展开等。
            </p>
            <div class="text-sm font-mono text-muted-foreground">
              {{ parentPaths.length ? parentPaths.join(' → ') : '[]' }}
            </div>
          </div>

          <div class="glass-card col-stretch gap-md min-w-0">
            <div class="text-md font-medium">各 meta 字段示例入口</div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md min-w-0">
              <div
                v-for="item in examples"
                :key="item.name"
                class="material-elevated col-stretch gap-sm min-w-0"
              >
                <div class="row-start items-center gap-sm min-w-0">
                  <Icons
                    :name="item.icon"
                    size="md"
                    class="text-primary"
                  />
                  <span class="font-medium">
                    {{ item.title }}
                  </span>
                </div>
                <div class="text-xs text-muted-foreground font-mono">
                  {{ item.metaFields }}
                </div>
                <Button
                  label="进入示例"
                  size="small"
                  variant="outlined"
                  @click="navigateTo(item)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnimateWrapper>
  </div>
</template>
