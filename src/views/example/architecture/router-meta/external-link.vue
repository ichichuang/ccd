<script setup lang="ts">
const route = useRoute()

const linkUrl = computed<string>(() => {
  const url = route.meta?.linkUrl
  return typeof url === 'string' ? url : 'https://vuejs.org'
})

function openLink() {
  window.open(linkUrl.value, '_blank')
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
                    name="i-lucide-external-link"
                    size="xl"
                    class="text-primary"
                  />
                </div>
                <div class="col-stretch gap-xs min-w-0">
                  <div class="row-start gap-xs min-w-0 flex-wrap">
                    <span class="text-lg font-bold text-foreground text-no-wrap">
                      External Link
                    </span>
                    <span
                      class="surface-info rounded-md px-sm py-xs text-xs font-semibold uppercase"
                    >
                      META
                    </span>
                  </div>
                  <span class="text-sm text-muted-foreground text-ellipsis-1">
                    外链示例 — meta.isLink + meta.linkUrl 配置外部链接跳转
                  </span>
                </div>
              </div>
            </div>
          </header>

          <div class="material-elevated col-stretch gap-sm min-w-0">
            <div class="text-md font-medium">本路由 meta 配置</div>
            <p class="text-muted-foreground text-sm">
              meta.isLink = true, meta.linkUrl = 'https://vuejs.org'
            </p>
            <p class="text-muted-foreground text-sm">
              从侧边栏菜单点击「外链示例」时，goToRoute 会识别 isLink 并直接在新标签页打开
              linkUrl，不会进行路由跳转。
            </p>
          </div>

          <div class="glass-card col-stretch gap-sm min-w-0">
            <div class="text-md font-medium">直接访问本页时</div>
            <p class="text-muted-foreground text-sm m-0">
              若通过 URL 直接进入本页，可点击下方按钮打开外链：
            </p>
            <Button
              label="打开 Vue 官网"
              severity="primary"
              @click="openLink"
            />
          </div>
        </div>
      </div>
    </AnimateWrapper>
  </div>
</template>
