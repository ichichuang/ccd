<script setup lang="tsx">
import type { RouteRecordName } from 'vue-router'
import TieredMenu from 'primevue/tieredmenu'
import { computed, nextTick, ref, watch, TransitionGroup } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Icons } from '@/components/Icons'
import { goToRoute, type PrimeMenuModelItem } from '@/router/utils/helper'

const props = defineProps<{
  show: boolean
}>()

/** 面包屑一级子项（弹层内展示） */
interface BreadcrumbChildItem {
  path: string
  name?: RouteRecordName
  title: string
  icon?: string
}

/** 面包屑项（含可选子项列表，用于仅目录父级点击弹层） */
type BreadcrumbItemWithChildren = BreadcrumbItem & {
  childItems?: BreadcrumbChildItem[]
}

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
/** 每个带子项的面包屑节点对应一个独立的 TieredMenu 实例，key 使用该节点 path */
const breadcrumbMenuRefs = ref<Map<string, InstanceType<typeof TieredMenu>>>(
  new Map<string, InstanceType<typeof TieredMenu>>()
)
/** 当前展开的下拉对应面包屑项 path，用于展开/收起不同图标 */
const openDropdownPath = ref<string | null>(null)

const setBreadcrumbMenuRef = (key: string, el: InstanceType<typeof TieredMenu> | null): void => {
  const map: Map<string, InstanceType<typeof TieredMenu>> = breadcrumbMenuRefs.value
  if (el) {
    map.set(key, el)
  } else {
    map.delete(key)
  }
}

/** 模板用：Vue ref 回调类型为 ComponentPublicInstance，需收窄到 TieredMenu 实例 */
const bindBreadcrumbMenuRef = (path: string) => (el: unknown) => {
  setBreadcrumbMenuRef(path, el as InstanceType<typeof TieredMenu> | null)
}

/** TieredMenu #item slot 参数类型（PrimeVue 类型与 renderTieredMenuItem 对齐） */
type TieredMenuItemSlotProps = {
  item: PrimeMenuModelItem
  props: { action: Record<string, unknown> }
  hasSubmenu: boolean
}
const renderTieredMenuItemFromSlot = (slotProps: unknown) =>
  renderTieredMenuItem(slotProps as TieredMenuItemSlotProps)

// 路由变化时关闭下拉并清空 model，避免切页后面板残留；配合 key={route.fullPath} 清空 TieredMenu 内部 target 解决回来后再点击错位
watch(
  () => route.fullPath,
  () => {
    const map: Map<string, InstanceType<typeof TieredMenu>> = breadcrumbMenuRefs.value
    map.forEach((menu: InstanceType<typeof TieredMenu>) => {
      menu.hide()
    })
    openDropdownPath.value = null
  }
)

/** 面包屑子项转 PrimeVue TieredMenu model（与 AdminSidebar 一致，仅一层叶子） */
const childItemsToPrimeModel = (childItems: BreadcrumbChildItem[]): PrimeMenuModelItem[] =>
  childItems.map(c => ({
    key: c.path,
    label: c.title,
    icon: c.icon,
    route: {
      path: c.path,
      name: typeof c.name === 'string' ? c.name : undefined,
    },
    level: 0,
  }))

const getPath = (item: BreadcrumbItem) => {
  // 1. If name exists, let router resolve it with current params
  if (item.name) {
    try {
      const resolved = router.resolve({ name: item.name, params: route.params })
      return resolved.href
    } catch (_e) {
      // Fallback if name resolution fails
    }
  }

  // 2. Manual replacement for path string
  let path = item.path
  if (path.includes(':')) {
    Object.keys(route.params).forEach(key => {
      path = path.replace(`:${key}`, route.params[key] as string)
    })
  }
  return path
}

const breadcrumbs = computed(() => {
  const matched = route.matched.filter(
    item =>
      item.meta && (item.meta.title || item.meta.titleKey) && item.meta.hideBreadcrumb !== true
  )

  return matched.map(item => {
    const redirect = typeof item.redirect === 'string' ? item.redirect : undefined
    const allowRedirect = Boolean(item.redirect || item.children.length === 0)

    // 只要该路由记录存在可展示的子路由，就为其生成一层子项列表，
    // 不再受 redirect 限制，以便任意层级的父级面包屑都能弹出下拉。
    const rawChildren = Array.isArray(item.children) ? item.children : []
    const visibleChildren = rawChildren.filter(
      child =>
        child.meta &&
        child.meta.showLink !== false &&
        (child.meta.title != null || child.meta.titleKey != null) &&
        child.meta.hideBreadcrumb !== true
    )

    const childItems: BreadcrumbChildItem[] | undefined =
      visibleChildren.length > 0
        ? visibleChildren
            .sort((a, b) => ((a.meta?.rank as number) ?? 999) - ((b.meta?.rank as number) ?? 999))
            .map(child => ({
              path: child.path,
              name: child.name,
              title: child.meta?.titleKey
                ? t(child.meta.titleKey as string)
                : ((child.meta?.title as string) ?? ''),
              icon: child.meta?.icon,
            }))
        : undefined

    return {
      path: item.path,
      redirect,
      name: item.name,
      allowRedirect,
      title: item.meta.titleKey ? t(item.meta.titleKey as string) : item.meta.title,
      icon: item.meta.icon,
      childItems: childItems?.length ? childItems : undefined,
    } as BreadcrumbItemWithChildren
  })
})

const handleLink = (item: BreadcrumbItem) => {
  const { redirect } = item
  if (redirect) {
    router.push(redirect)
    return
  }
  // Use getPath to resolve dynamic params
  const targetPath = getPath(item)
  router.push(targetPath)
}

const handleFolderClick = (item: BreadcrumbItemWithChildren, e: MouseEvent) => {
  if (!item.childItems?.length) {
    handleLink(item)
    return
  }

  const map: Map<string, InstanceType<typeof TieredMenu>> = breadcrumbMenuRefs.value
  const menuRef: InstanceType<typeof TieredMenu> | undefined = map.get(item.path)
  if (!menuRef) {
    return
  }

  // 若当前点击的正是已打开的面包屑项，则关闭对应面板并返回（toggle 行为）
  if (openDropdownPath.value === item.path) {
    menuRef.hide()
    openDropdownPath.value = null
    return
  }

  // 先关闭其他已经打开的面板，保证同一时间仅有一个弹层
  map.forEach((ref: InstanceType<typeof TieredMenu>, key: string) => {
    if (key !== item.path) {
      ref.hide()
    }
  })

  openDropdownPath.value = item.path
  nextTick(() => {
    menuRef.toggle(e)
  })
}

/** 下拉项渲染（与 AdminSidebar renderTieredMenuItem 一致） */
const renderTieredMenuItem = ({
  item,
  props: slotProps,
  hasSubmenu,
}: {
  item: PrimeMenuModelItem
  props: { action: Record<string, unknown> }
  hasSubmenu: boolean
}) => {
  const action = slotProps.action as Record<string, unknown> & {
    class?: string
    onClick?: (ev: Event) => void
  }
  const actionClass = typeof action?.class === 'string' ? action.class : ''
  const mergedClass = `flex items-center gap-sm w-full text-current ${actionClass}`.trim()
  const handleClick = (ev: Event) => {
    if (item.route?.path) {
      ev.preventDefault()
      goToRoute(item.route?.name ?? item.route?.path, undefined, undefined, false)
    }
    if (typeof action?.onClick === 'function') action.onClick(ev)
  }
  return (
    <a
      {...action}
      class={mergedClass}
      onClick={handleClick}
    >
      {item.icon && (
        <Icons
          name={item.icon}
          size="xs"
          class="shrink-0 text-current"
        />
      )}
      <span class="truncate flex-1 text-current">{item.label}</span>
      {hasSubmenu && (
        <Icons
          name="i-lucide-chevron-right"
          size="xs"
          class="text-current ml-auto"
        />
      )}
    </a>
  )
}

const onBreadcrumbClick = (item: BreadcrumbItemWithChildren, isLast: boolean, e: MouseEvent) => {
  if (isLast) return
  if (item.childItems?.length) {
    e.preventDefault()
    e.stopPropagation()
    handleFolderClick(item, e)
  } else {
    handleLink(item)
  }
}
</script>

<template>
  <div
    v-if="show"
    class="admin-breadcrumb w-full h-breadcrumbHeight flex items-center px-padding-md overflow-hidden"
  >
    <div class="flex items-center fs-sm text-muted-foreground whitespace-nowrap">
      <TransitionGroup name="breadcrumb">
        <div
          v-for="(item, index) in breadcrumbs"
          :key="item.path"
          class="flex items-center"
        >
          <!-- Breadcrumb Item -->
          <span
            :class="[
              'transition-colors duration-scale-lg flex items-center gap-xs',
              index === breadcrumbs.length - 1
                ? 'text-foreground font-medium cursor-default'
                : 'cursor-pointer hover:text-primary',
            ]"
            @click="e => onBreadcrumbClick(item, index === breadcrumbs.length - 1, e)"
          >
            <Icons
              v-if="item.icon"
              :name="item.icon"
              class="text-current! shrink-0!"
              size="sm"
            />
            <span>{{ item.title }}</span>
            <Icons
              v-if="item.childItems?.length"
              :name="
                openDropdownPath === item.path
                  ? 'i-lucide-panel-bottom-close'
                  : 'i-lucide-panel-bottom-open'
              "
              :class="
                openDropdownPath === item.path
                  ? 'text-primary! ml-margin-xs'
                  : 'text-current! ml-margin-xs'
              "
              size="sm"
            />
          </span>

          <!-- Separator -->
          <Icons
            v-if="index !== breadcrumbs.length - 1"
            name="i-lucide-chevron-right"
            class="mx-margin-sm text-muted-foreground/50"
            size="lg"
          />

          <!-- 为当前面包屑节点挂载独立的 TieredMenu 实例（仅当存在子项时） -->
          <TieredMenu
            v-if="item.childItems?.length"
            :ref="bindBreadcrumbMenuRef(item.path)"
            :model="childItemsToPrimeModel(item.childItems)"
            append-to="body"
            popup
            :pt="{
              root: { class: 'border border-sidebar-border rounded-scale-md' },
              menu: { class: 'bg-sidebar py-padding-xs rounded-scale-md' },
              menuitem: { class: 'rounded-scale-sm' },
              content: {
                class:
                  'rounded-scale-sm text-sidebar-foreground transition-colors duration-scale-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent/80 active:text-sidebar-accent-foreground',
              },
            }"
            @hide="
              () => {
                if (openDropdownPath === item.path) openDropdownPath = null
              }
            "
          >
            <template #item="slotProps">
              <component :is="() => renderTieredMenuItemFromSlot(slotProps)" />
            </template>
          </TieredMenu>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.breadcrumb-enter-active {
  transition: all var(--transition-xl) ease-out;
}
.breadcrumb-leave-active {
  transition: all var(--transition-lg) ease-in;
  position: absolute;
}
.breadcrumb-enter-from {
  opacity: 0;
  transform: translateX(var(--spacing-md));
}
.breadcrumb-leave-to {
  opacity: 0;
  transform: translateX(var(--spacing-sm));
}
.breadcrumb-move {
  transition: all var(--transition-xl) ease;
}
</style>
