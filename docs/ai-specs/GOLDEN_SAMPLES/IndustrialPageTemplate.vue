<!--
  黄金样本：工业级页面布局模板（Admin 路由视图）
  展示正确的 shortcut 组合：panel-base、col-fill、row-y-center、col-stack-*、surface-elevated 等

  核心规则速查：
  - 透明根策略：admin 路由根元素 ONLY use col-fill，禁止任何 bg-* / surface-*
  - panel-base = bg-card rounded-scale-xl shadow-soft p-padding-xl flex flex-col gap-lg
  - panel-base-md = bg-card rounded-scale-lg shadow-soft p-padding-lg flex flex-col gap-md
  - col-fill = flex-1 min-h-0 flex flex-col overflow-hidden
  - row-y-center = flex flex-row items-center（用于水平对齐，替代 flex items-center）
  - col-stack-{xs|sm|md|lg|xl} = flex flex-col gap-{size}（替代 flex flex-col gap-xxx）
  - surface-elevated = bg-card shadow-soft（非根元素的卡片/面板）

  参考：docs/ai-specs/ARCHETYPE_SPEC.md、uno.config.ts shortcuts、CLAUDE.md §4
-->
<script setup lang="ts">
interface ItemData {
  id: number
  title: string
  description: string
  status: 'active' | 'inactive'
  count: number
}

const loading = ref<boolean>(false)
const items = ref<ItemData[]>([])

onMounted(async (): Promise<void> => {
  loading.value = true
  await new Promise<void>(resolve => setTimeout(resolve, 800))
  items.value = [
    {
      id: 1,
      title: '示例项目 A',
      description: '这是一个较长的描述文字，超出容器宽度时会自动截断并显示省略号',
      status: 'active',
      count: 42,
    },
    { id: 2, title: '示例项目 B', description: '另一个描述文字', status: 'inactive', count: 7 },
    { id: 3, title: '示例项目 C', description: '第三个示例条目', status: 'active', count: 128 },
  ]
  loading.value = false
})
</script>

<template>
  <!--
    透明根：admin 路由视图根元素仅用 col-fill（或等价的 h-full flex-1 min-h-0 flex flex-col overflow-hidden）
    FORBIDDEN: bg-card / bg-background / surface-* 在此根元素上
    data-archetype 必须声明，值来自 ARCHETYPE_SPEC.md A1–A5
  -->
  <div
    data-archetype="A2-list-detail"
    class="col-fill"
  >
    <!-- 滚动容器：必须用 CScrollbar，禁止裸 overflow-auto -->
    <CScrollbar>
      <!-- 页面主内容区：使用 layout-content-wide 而非 max-w-7xl / max-w-[xxvw] -->
      <div class="layout-content-wide">
        <!-- ── 页头区域 ── -->
        <!--
          row-y-center = flex flex-row items-center
          禁止写 flex items-center（Rule N-2：flex shortcut 已含 flex，不能并写）
        -->
        <header class="row-y-center gap-md py-padding-md">
          <div class="col-stack-xs">
            <h1 class="fs-2xl font-semibold text-foreground m-0">页面标题</h1>
            <p class="fs-sm text-muted m-0">页面描述，说明当前模块的功能</p>
          </div>
          <!-- ml-auto 将按钮推到右侧 -->
          <Button
            class="ml-auto"
            label="新建"
          />
        </header>

        <!-- ── 统计卡片区 ── -->
        <!--
          panel-base 替代 utility soup：
          FORBIDDEN: bg-card rounded-scale-xl shadow-soft p-padding-xl flex flex-col gap-lg（Rule N-5：> 5 classes）
          CORRECT:   panel-base（展开即为上述 6 个 class 的组合）
        -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-lg mb-padding-lg">
          <div class="panel-base behavior-hover-transition interactive-hover-card">
            <div class="row-y-center gap-sm">
              <Icons
                name="i-lucide-bar-chart-2"
                class="text-primary fs-xl"
              />
              <span class="fs-sm text-muted">总数量</span>
            </div>
            <p class="fs-3xl font-bold text-foreground m-0">1,234</p>
          </div>

          <!-- panel-base-md 用于中等间距的卡片 -->
          <div class="panel-base-md behavior-hover-transition interactive-hover-card">
            <div class="row-y-center gap-sm">
              <Icons
                name="i-lucide-trending-up"
                class="text-success fs-xl"
              />
              <span class="fs-sm text-muted">活跃</span>
            </div>
            <p class="fs-3xl font-bold text-foreground m-0">987</p>
          </div>

          <div class="panel-base-md behavior-hover-transition interactive-hover-card">
            <div class="row-y-center gap-sm">
              <Icons
                name="i-lucide-clock"
                class="text-warn fs-xl"
              />
              <span class="fs-sm text-muted">待处理</span>
            </div>
            <p class="fs-3xl font-bold text-foreground m-0">247</p>
          </div>
        </div>

        <!-- ── 主内容面板 ── -->
        <!--
          surface-elevated（= bg-card + shadow-soft）用于嵌套内容区，非根元素
          col-stack-md 替代 flex flex-col gap-md（Rule N-2 + N-5）
        -->
        <div class="surface-elevated rounded-scale-xl p-padding-xl col-stack-md">
          <!-- 面板头：row-between 替代 flex justify-between items-center -->
          <div class="row-between">
            <h2 class="fs-lg font-medium text-foreground m-0">数据列表</h2>
            <Button
              text
              size="small"
              label="筛选"
            />
          </div>

          <!-- Loading 骨架屏：数据加载中时必须显示 -->
          <div
            v-if="loading"
            class="col-stack-sm"
          >
            <Skeleton height="3rem" />
            <Skeleton height="3rem" />
            <Skeleton height="3rem" />
          </div>

          <!-- 空状态：数据为空时必须显示 EmptyState，禁止空白页面 -->
          <EmptyState
            v-else-if="!items.length"
            icon="i-lucide-inbox"
            :title="$t('emptyState.title')"
            :description="$t('emptyState.description')"
          />

          <!-- 数据列表 -->
          <div
            v-else
            class="col-stack-xs"
          >
            <!--
              列表行：surface-item = 基础背景；behavior-hover-transition = hover 过渡
              row-y-center 替代 flex items-center
              列表行禁止用 interactive-hover-card（-translate-y-1 lift 仅用于卡片）
            -->
            <div
              v-for="item in items"
              :key="item.id"
              class="surface-item row-y-center gap-md p-padding-sm rounded-scale-md behavior-hover-transition hover:bg-foreground/5"
            >
              <!-- flex-1 min-w-0 防止长文本撑破布局 -->
              <div class="col-stack-xs flex-1 min-w-0">
                <!-- text-single-line-ellipsis 防止长标题换行 -->
                <span class="fs-sm font-medium text-foreground text-single-line-ellipsis">
                  {{ item.title }}
                </span>
                <!-- text-muted 用于辅助/次要文字 -->
                <span class="fs-xs text-muted text-single-line-ellipsis">
                  {{ item.description }}
                </span>
              </div>

              <Tag
                :severity="item.status === 'active' ? 'success' : 'secondary'"
                :value="item.status === 'active' ? '活跃' : '停用'"
              />
            </div>
          </div>
        </div>
      </div>
    </CScrollbar>
  </div>
</template>
