<script setup lang="ts">
defineOptions({ name: 'ArchitectureRouterMetaHideBreadcrumb' })

const route = useRoute()
const hideBreadcrumb = computed<boolean>(() => route.meta?.hideBreadcrumb === true)
</script>

<template>
  <div class="animate__animated animate__fadeIn col-stretch gap-md">
    <div class="layout-narrow col-stretch gap-md">
      <section class="material-elevated col-stretch gap-md">
        <div class="row-between">
          <div class="col-stretch gap-xs">
            <h2 class="text-lg font-semibold text-foreground m-0">Hide Breadcrumb</h2>
            <p class="text-sm text-muted-foreground m-0">
              meta.hideBreadcrumb — 隐藏当前页顶部的面包屑导航栏
            </p>
          </div>
          <Tag
            :value="hideBreadcrumb ? 'hideBreadcrumb: true' : 'hideBreadcrumb: false'"
            :severity="hideBreadcrumb ? 'warn' : 'secondary'"
          />
        </div>
        <Divider />

        <div class="col-stretch gap-sm">
          <div class="row-between">
            <span class="text-sm text-muted-foreground">Live: route.meta.hideBreadcrumb</span>
            <Tag
              :value="`${hideBreadcrumb}`"
              :severity="hideBreadcrumb ? 'warn' : 'secondary'"
            />
          </div>
          <p class="text-sm text-muted-foreground m-0">
            观察布局顶部面包屑区域 —
            当前页面的面包屑应已被隐藏。对比访问其他示例页面，可以明显看到差异。
          </p>
        </div>
      </section>

      <section class="material-elevated col-stretch gap-md">
        <h3 class="text-md font-semibold text-foreground m-0">Route Config</h3>
        <Divider />
        <pre class="code-block">{{
          JSON.stringify(
            {
              path: '/example/router-meta/hide-breadcrumb',
              name: 'ExampleHideBreadcrumb',
              meta: {
                titleKey: 'router.example.architecture.routerMeta.hideBreadcrumb',
                rank: 3,
                icon: 'i-lucide-navigation',
                hideBreadcrumb: true,
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
              name="i-lucide-monitor"
              size="xs"
              class="text-primary mt-xs shrink-0"
            />
            <p class="text-sm text-muted-foreground m-0">
              全屏内容页 — 面包屑占用垂直空间且导航语义冗余
            </p>
          </div>
          <div class="row-start gap-sm items-start">
            <Icons
              name="i-lucide-bar-chart-2"
              size="xs"
              class="text-primary mt-xs shrink-0"
            />
            <p class="text-sm text-muted-foreground m-0">
              大屏展示 / 数据看板 — 简洁布局优先，去除所有非核心 UI 元素
            </p>
          </div>
          <div class="row-start gap-sm items-start">
            <Icons
              name="i-lucide-link"
              size="xs"
              class="text-primary mt-xs shrink-0"
            />
            <p class="text-sm text-muted-foreground m-0">
              独立嵌入页面 — 自身具有完整导航体系时无需再显示面包屑
            </p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
