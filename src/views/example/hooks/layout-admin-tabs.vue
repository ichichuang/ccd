<script setup lang="ts">
import { getAdminMenuTree } from '@/router/utils/helper'
import type { ContextMenuAction } from '@/hooks/layout/useAdminTabs'
import { TAB_ICON_SIZE } from '@/constants/layout-menu'

defineOptions({ name: 'LayoutAdminTabs' })

const {
  tabs,
  contextMenu,
  getTabLabel,
  isActive,
  updateActiveTabPosition,
  onTabClick,
  onContextMenu,
  handleContextAction,
} = useAdminTabs()

const permissionStore = usePermissionStore()

type SeedCandidate = { label: string; name?: string; path?: string }

const seedCandidates = computed<SeedCandidate[]>(() => {
  // Use menu tree to pick some leaf nodes that are compatible with tabs.
  const menuTree = getAdminMenuTree()
  const flatten = (items: MenuItem[]): MenuItem[] => {
    const out: MenuItem[] = []
    for (const item of items) {
      out.push(item)
      if (item.children && item.children.length > 0) out.push(...flatten(item.children))
    }
    return out
  }

  const flat = flatten(menuTree)
  const leaves = flat.filter(m => (!m.children || m.children.length === 0) && m.showLink !== false)

  return leaves.slice(0, 12).map(l => ({
    label: l.titleKey ?? l.title,
    name: l.name,
    path: l.path,
  }))
})

const selectedSeedIndices = ref<number[]>([0, 1, 2, 3])

const seedTabs = () => {
  // Prevent duplicate tabs by relying on permissionStore.addTab internal guards.
  selectedSeedIndices.value.forEach(i => {
    const c = seedCandidates.value[i]
    if (!c) return
    if (c.name) permissionStore.addTab(c.name)
    else if (c.path) permissionStore.addTab(c.path)
  })
}

const clearTabs = () => {
  // Keep the current route tab logic out of seed; just clear demo tabs.
  permissionStore.clearTabs()
}

const contextMenuOptions = computed(() => {
  const opts: { action: ContextMenuAction; icon: string; text: string }[] = [
    { action: 'reload', icon: 'i-lucide-refresh-cw', text: 'Reload' },
    { action: 'close', icon: 'i-lucide-x', text: 'Close' },
    { action: 'closeOthers', icon: 'i-lucide-copy-x', text: 'Close Others' },
    { action: 'closeAll', icon: 'i-lucide-trash-2', text: 'Close All' },
  ]
  return opts
})
</script>

<template>
  <div
    class="animate__animated animate__fadeIn col-stretch gap-md"
    data-archetype="A1-toolbar-content"
  >
    <div class="layout-narrow col-stretch gap-md">
      <section class="material-elevated col-stretch gap-md">
        <div class="row-between">
          <div class="col-stretch gap-xs">
            <h2 class="text-lg font-semibold text-foreground m-0">useAdminTabs Demo</h2>
            <div class="text-sm text-muted-foreground">Tabs / Active Indicator / Context Menu</div>
          </div>
          <div class="row-center gap-sm">
            <Tag
              :value="`Tabs: ${tabs.length}`"
              :severity="tabs.length > 0 ? 'success' : 'warn'"
            />
          </div>
        </div>

        <Divider />

        <div class="col-stretch gap-sm">
          <div class="row-between">
            <span class="text-sm text-muted-foreground">Current State</span>
            <Button
              size="small"
              severity="secondary"
              label="重算 Active 指示条"
              @click="updateActiveTabPosition('auto')"
            />
          </div>

          <div class="row-between gap-md">
            <div class="col-stretch gap-xs flex-1">
              <div class="text-sm text-muted-foreground">Context Menu</div>
              <div class="row-start gap-sm items-center">
                <Tag
                  :value="contextMenu.visible ? 'Visible' : 'Hidden'"
                  :severity="contextMenu.visible ? 'info' : 'secondary'"
                />
                <Tag
                  :value="
                    contextMenu.targetPath ? `Target: ${contextMenu.targetPath}` : 'Target: —'
                  "
                  severity="secondary"
                />
              </div>
            </div>
            <div class="col-stretch gap-xs flex-1">
              <div class="text-sm text-muted-foreground">Active Tab</div>
              <div class="row-start gap-sm items-center">
                <Tag
                  :value="
                    tabs.some(t => isActive(t))
                      ? `Active: ${tabs.find(t => isActive(t))?.path ?? '—'}`
                      : 'Active: —'
                  "
                  severity="primary"
                />
              </div>
            </div>
          </div>

          <Divider />

          <div class="col-stretch gap-xs">
            <div class="text-sm text-muted-foreground">Tabs List (右键打开 Context Menu)</div>
            <div class="row-start flex-wrap gap-sm">
              <div
                v-for="tab in tabs"
                :key="tab.path"
                class="material-elevated col-stretch gap-xs p-sm interactive-item"
                :class="isActive(tab) ? 'ring-1 ring-primary/40' : ''"
                @click="onTabClick(tab)"
                @contextmenu.prevent="e => onContextMenu(e, tab)"
              >
                <span class="text-sm font-medium text-foreground text-ellipsis-1">
                  {{ getTabLabel(tab) }}
                </span>
                <span class="text-xs text-muted-foreground text-no-wrap">{{ tab.path }}</span>
                <div class="row-start gap-xs flex-wrap">
                  <Tag
                    v-if="tab.fixed"
                    value="fixed"
                    severity="info"
                  />
                  <Tag
                    v-if="tab.deletable"
                    value="deletable"
                    severity="secondary"
                  />
                  <Tag
                    v-else
                    value="not-deletable"
                    severity="warn"
                  />
                  <Tag
                    v-if="isActive(tab)"
                    value="active"
                    severity="success"
                  />
                </div>
              </div>
            </div>

            <div
              v-if="tabs.length === 0"
              class="text-sm text-muted-foreground"
            >
              当前没有 Tabs。点击下方 “种子化 Tabs” 开始演示。
            </div>
          </div>
        </div>
      </section>

      <section class="material-elevated col-stretch gap-md">
        <div class="row-between">
          <h3 class="text-md font-semibold text-foreground m-0">Action Triggers</h3>
          <div class="row-center gap-sm">
            <Button
              size="small"
              severity="secondary"
              label="清空 Tabs"
              @click="clearTabs"
            />
          </div>
        </div>

        <Divider />

        <div class="col-stretch gap-sm">
          <div class="text-sm text-muted-foreground">种子化选择（前 4 个候选）</div>
          <div class="row-start flex-wrap gap-sm">
            <Tag
              v-for="(c, i) in seedCandidates.slice(0, 4)"
              :key="`${c.path ?? c.name}-${i}`"
              :value="c.label"
              :severity="selectedSeedIndices.includes(i) ? 'primary' : 'secondary'"
            />
          </div>

          <div class="row-start flex-wrap gap-sm">
            <Button
              size="small"
              severity="primary"
              label="种子化 Tabs"
              @click="seedTabs"
            />
            <Button
              size="small"
              severity="secondary"
              label="演示：关闭当前 tab（用 contextMenu 的 close）"
              :disabled="!contextMenu.visible || !contextMenu.targetPath"
              @click="handleContextAction('close')"
            />
          </div>
        </div>

        <Transition
          enter-active-class="transition duration-md ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition duration-md ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="contextMenu.visible"
            class="fixed z-popover min-w-[var(--spacing-3xl)] bg-popover/95 backdrop-blur-md shadow-xl rounded-md p-xs col-stretch gap-xs origin-top-left outline-none"
            :style="{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }"
            @click.stop
          >
            <div
              v-for="opt in contextMenuOptions"
              :key="opt.action"
              class="row-between gap-sm cursor-pointer select-none transition-all duration-md ease-out-expo rounded-sm px-sm py-xs hover:bg-foreground/[0.04] hover:text-foreground"
              role="button"
              tabindex="0"
              @click="handleContextAction(opt.action)"
            >
              <Icons
                :name="opt.icon"
                class="text-muted-foreground! transition-colors duration-md group-hover:text-foreground!"
                :size="TAB_ICON_SIZE"
              />
              <span class="text-sm">{{ opt.text }}</span>
            </div>
            <div class="px-xs py-xxs text-xs text-muted-foreground">
              Tip: 右键任意 Tab 打开菜单；点击外部会自动关闭。
            </div>
          </div>
        </Transition>

        <div class="text-sm text-muted-foreground">
          Context Menu 会在 `onMenuHide()` 时清理；点击其它区域将触发 `closeContextMenu()`。
        </div>
      </section>
    </div>
  </div>
</template>
