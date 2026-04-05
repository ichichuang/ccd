<script setup lang="ts">
defineOptions({ name: 'ArchitectureRouterMetaHiddenTag' })

const route = useRoute()
const hiddenTag = computed<boolean>(() => route.meta?.hiddenTag === true)
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
                    name="i-lucide-eye-off"
                    size="xl"
                    class="text-primary"
                  />
                </div>
                <div class="col-stretch gap-xs min-w-0">
                  <div class="row-start gap-xs min-w-0 flex-wrap">
                    <span class="text-lg font-bold text-foreground text-no-wrap">Hidden Tag</span>
                    <span
                      class="surface-info rounded-md px-sm py-xs text-xs font-semibold uppercase"
                    >
                      META
                    </span>
                  </div>
                  <span class="text-sm text-muted-foreground text-ellipsis-1">
                    meta.hiddenTag — 访问后不将此页添加到多标签栏
                  </span>
                </div>
              </div>
              <Tag
                :value="hiddenTag ? 'hiddenTag: true' : 'hiddenTag: false'"
                :severity="hiddenTag ? 'warn' : 'secondary'"
              />
            </div>

            <div class="col-stretch gap-sm min-w-0">
              <div class="row-between min-w-0">
                <span class="text-sm text-muted-foreground">Live: route.meta.hiddenTag</span>
                <Tag
                  :value="`${hiddenTag}`"
                  :severity="hiddenTag ? 'warn' : 'secondary'"
                />
              </div>
              <p class="text-sm text-muted-foreground m-0">
                观察顶部标签栏 — 访问本页后应不会产生新标签，这正是
                <code class="code-inline">hiddenTag: true</code>
                的效果。对比访问其他示例页面（如 Theme Store），标签栏会增加，而本页不会。
              </p>
            </div>
          </header>

          <section class="material-elevated col-stretch gap-md min-w-0">
            <h3 class="text-md font-semibold text-foreground m-0">Route Config</h3>
            <pre class="code-block">{{
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

          <section class="material-elevated col-stretch gap-md min-w-0">
            <h3 class="text-md font-semibold text-foreground m-0">适用场景</h3>
            <div class="col-stretch gap-sm min-w-0">
              <div class="row-start gap-sm items-start min-w-0">
                <Icons
                  name="i-lucide-file-text"
                  size="xs"
                  class="text-primary mt-xs shrink-0"
                />
                <p class="text-sm text-muted-foreground m-0">
                  详情页 — 从列表跳转到详情，不应在标签栏单独占位
                </p>
              </div>
              <div class="row-start gap-sm items-start min-w-0">
                <Icons
                  name="i-lucide-layers"
                  size="xs"
                  class="text-primary mt-xs shrink-0"
                />
                <p class="text-sm text-muted-foreground m-0">
                  弹窗内嵌页面 — 过渡性页面，不需要保留标签历史
                </p>
              </div>
              <div class="row-start gap-sm items-start min-w-0">
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
    </AnimateWrapper>
  </div>
</template>
