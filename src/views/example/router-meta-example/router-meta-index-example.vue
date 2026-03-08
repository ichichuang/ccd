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
</script>

<template>
  <div class="p-padding-lg space-y-margin-md">
    <h2 class="fs-xl font-semibold flex items-center gap-sm">
      <Icons
        name="i-lucide-route"
        size="lg"
        class="text-primary"
      />
      <span>Router Meta 功能示例索引</span>
    </h2>

    <div class="component-border rounded-scale p-padding-md space-y-margin-sm">
      <div class="fs-md font-medium">当前路由 meta.parentPaths（自动注入）</div>
      <p class="text-muted-foreground fs-sm">
        parentPaths 由 addParentPathsToLeafRoutes 自动为叶子路由注入，用于面包屑、菜单展开等。
      </p>
      <div class="fs-sm font-mono text-muted-foreground">
        {{ parentPaths.length ? parentPaths.join(' → ') : '[]' }}
      </div>
    </div>

    <div class="component-border rounded-scale p-padding-md space-y-margin-md bg-muted">
      <div class="fs-md font-medium">各 meta 字段示例入口</div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
        <div
          v-for="item in examples"
          :key="item.name"
          class="component-border rounded-scale p-padding-md bg-card flex flex-col gap-sm"
        >
          <div class="flex items-center gap-sm">
            <Icons
              :name="item.icon"
              size="md"
              class="text-primary"
            />
            <span class="font-medium">
              {{ item.title }}
            </span>
          </div>
          <div class="fs-xs text-muted-foreground font-mono">
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
</template>
