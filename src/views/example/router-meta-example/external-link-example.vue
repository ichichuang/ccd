<script setup lang="ts">
const route = useRoute()

const linkUrl = computed<string>(() => {
  const url = route.meta?.linkUrl
  return typeof url === 'string' ? url : 'https://vuejs.org'
})

function openLink() {
  window.open(linkUrl.value, '_blank')
}
</script>

<template>
  <div class="p-lg space-y-margin-md">
    <h2 class="text-xl font-semibold row-y-center gap-sm">
      <Icons
        name="i-lucide-external-link"
        size="lg"
        class="text-primary"
      />
      <span>外链示例（meta.isLink + meta.linkUrl）</span>
    </h2>

    <div class="shadow-sm dark:shadow-md rounded-scale p-md space-y-margin-sm">
      <div class="text-md font-medium">本路由 meta 配置</div>
      <p class="text-muted-foreground text-sm">
        meta.isLink = true, meta.linkUrl = 'https://vuejs.org'
      </p>
      <p class="text-muted-foreground text-sm">
        从侧边栏菜单点击「外链示例」时，goToRoute 会识别 isLink 并直接在新标签页打开
        linkUrl，不会进行路由跳转。
      </p>
    </div>

    <div class="shadow-sm dark:shadow-md rounded-scale p-md space-y-margin-sm bg-muted">
      <div class="text-md font-medium">直接访问本页时</div>
      <p class="text-muted-foreground text-sm mb-sm">
        若通过 URL 直接进入本页，可点击下方按钮打开外链：
      </p>
      <Button
        label="打开 Vue 官网"
        severity="primary"
        @click="openLink"
      />
    </div>
  </div>
</template>
