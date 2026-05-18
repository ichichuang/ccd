<script setup lang="ts">
defineOptions({ name: 'AsyncErrorFallback' })

interface AsyncErrorFallbackProps {
  title?: string
  description?: string
}

const props = withDefaults(defineProps<AsyncErrorFallbackProps>(), {
  title: '页面资源加载失败',
  description: '请检查网络连接，或刷新页面重试。',
})

const reloadPage = (): void => {
  window.location.reload()
}
</script>

<template>
  <div class="layout-full col-center p-xl text-center">
    <div class="material-solid col-center gap-md p-xl max-w-[90vw]">
      <Icons
        name="i-lucide-refresh-cw-off"
        size="3xl"
        class="text-danger"
      />
      <div class="col-center gap-xs">
        <p class="text-md font-semibold text-foreground m-0">
          {{ props.title }}
        </p>
        <p class="text-sm text-muted-foreground m-0 max-w-[80vw]">
          {{ props.description }}
        </p>
      </div>
      <Button
        label="刷新页面"
        severity="secondary"
        @click="reloadPage"
      />
    </div>
  </div>
</template>
