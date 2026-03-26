<script setup lang="ts">
defineOptions({ name: 'ArchitectureRouterMetaHiddenTag' })

const route = useRoute()
const hiddenTag = computed<boolean>(() => route.meta?.hiddenTag === true)
</script>

<template>
  <div class="animate__animated animate__fadeIn col-stretch gap-md">
    <div class="layout-narrow col-stretch gap-md">
      <section class="material-elevated col-stretch gap-md">
        <div class="row-between items-center">
          <div class="col-stretch gap-xs">
            <h2 class="text-lg font-semibold text-foreground m-0">Hidden Tag</h2>
            <p class="text-sm text-muted-foreground m-0">
              meta.hiddenTag — 访问后不将此页添加到多标签栏
            </p>
          </div>
          <Tag
            :value="hiddenTag ? 'hiddenTag: true' : 'hiddenTag: false'"
            :severity="hiddenTag ? 'warn' : 'secondary'"
          />
        </div>
        <Divider />

        <div class="col-stretch gap-sm">
          <div class="row-between items-center">
            <span class="text-sm text-muted-foreground">Live: route.meta.hiddenTag</span>
            <Tag
              :value="`${hiddenTag}`"
              :severity="hiddenTag ? 'warn' : 'secondary'"
            />
          </div>
          <p class="text-sm text-muted-foreground m-0">
            观察顶部标签栏 — 访问本页后应不会产生新标签，这正是
            <code class="font-mono text-xs text-foreground">hiddenTag: true</code>
            的效果。对比访问其他示例页面（如 Theme Store），标签栏会增加，而本页不会。
          </p>
        </div>
      </section>

      <section class="material-elevated col-stretch gap-md">
        <h3 class="text-md font-semibold text-foreground m-0">Route Config</h3>
        <Divider />
        <pre class="text-xs font-mono text-foreground bg-muted rounded-md p-sm overflow-x-auto">{{
          JSON.stringify(
            {
              path: '/example/router-meta/hidden-tag',
              name: 'ExampleHiddenTag',
              meta: {
                titleKey: 'router.example.architecture.routerMeta.hiddenTag',
                rank: 4,
                icon: 'i-lucide-tag',
                hiddenTag: true,
              },
            },
            null,
            2
          )
        }}</pre>
      </section>

      <section class="material-elevated col-stretch gap-md">
        <h3 class="text-md font-semibold text-foreground m-0">适用场景</h3>
        <Divider />
        <div class="col-stretch gap-sm">
          <div class="row-start gap-sm items-start">
            <Icons
              name="i-lucide-file-text"
              size="xs"
              class="text-primary mt-xs shrink-0"
            />
            <p class="text-sm text-muted-foreground m-0">
              详情页 — 从列表跳转到详情，不应在标签栏单独占位
            </p>
          </div>
          <div class="row-start gap-sm items-start">
            <Icons
              name="i-lucide-layers"
              size="xs"
              class="text-primary mt-xs shrink-0"
            />
            <p class="text-sm text-muted-foreground m-0">
              弹窗内嵌页面 — 过渡性页面，不需要保留标签历史
            </p>
          </div>
          <div class="row-start gap-sm items-start">
            <Icons
              name="i-lucide-arrow-right-circle"
              size="xs"
              class="text-primary mt-xs shrink-0"
            />
            <p class="text-sm text-muted-foreground m-0">
              引导流程中间步骤 — 用户不应手动回退到该步骤
            </p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
