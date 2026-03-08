<script setup lang="ts">
defineOptions({ name: 'ToolbarContentExampleIndex' })

function handleSave(): void {
  window.$message?.success('设置已保存')
}
</script>

<template>
  <div
    data-archetype="A1-toolbar-content"
    class="flex flex-col h-full overflow-hidden"
  >
    <div
      data-region="toolbar"
      class="shrink-0 flex items-center justify-between gap-lg px-padding-lg py-padding-md border-b-default shadow-soft"
    >
      <span class="fs-sm text-muted-foreground">系统设置</span>
      <Button
        label="保存"
        size="small"
        @click="handleSave"
      />
    </div>

    <div
      data-region="content"
      class="flex-1 min-h-0"
    >
      <CScrollbar class="h-full">
        <div class="p-padding-lg layout-content-narrow">
          <div class="surface-elevated rounded-scale-md p-padding-lg">
            <p class="fs-md text-foreground m-0 mb-margin-md">
              此页面为 A1 Toolbar + Content 标准布局示例。
            </p>
            <p class="fs-sm text-muted-foreground m-0 mb-margin-lg">
              顶部工具栏固定，主内容区使用 CScrollbar
              独立滚动。适用于设置页、说明页等以阅读为主的场景。
            </p>
            <div class="surface-sunken rounded-scale-md p-padding-lg mt-margin-lg">
              <h4 class="fs-sm font-semibold text-foreground m-0 mb-margin-sm">占位设置项</h4>
              <p class="fs-sm text-muted-foreground m-0">
                此处可接入 SchemaForm 或 PrimeVue 表单组件，实现完整的设置表单。
              </p>
            </div>
          </div>
        </div>
      </CScrollbar>
    </div>
  </div>
</template>
