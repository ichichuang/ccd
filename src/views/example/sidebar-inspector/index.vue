<script setup lang="ts">
defineOptions({ name: 'SidebarInspectorExampleIndex' })

interface ProjectItem {
  id: string
  name: string
  status: 'active' | 'archived' | 'draft'
  description: string
  createdAt: string
}

const projectList: ProjectItem[] = [
  {
    id: '1',
    name: 'Dashboard 重构',
    status: 'active',
    description: '仪表盘性能优化与布局升级',
    createdAt: '2025-02-15',
  },
  {
    id: '2',
    name: 'API 网关迁移',
    status: 'active',
    description: '从 Kong 迁移至 Traefik',
    createdAt: '2025-02-10',
  },
  {
    id: '3',
    name: '移动端适配',
    status: 'archived',
    description: '响应式布局与触控优化',
    createdAt: '2025-01-20',
  },
  {
    id: '4',
    name: '权限系统 v2',
    status: 'draft',
    description: 'RBAC 与资源级权限',
    createdAt: '2025-02-25',
  },
  {
    id: '5',
    name: '埋点采集升级',
    status: 'active',
    description: '接入 OpenTelemetry',
    createdAt: '2025-02-18',
  },
]

const selectedProject = ref<ProjectItem | null>(null)

const statusMap: Record<ProjectItem['status'], string> = {
  active: '进行中',
  archived: '已归档',
  draft: '草稿',
}
</script>

<template>
  <div
    data-archetype="A2-sidebar-inspector"
    class="h-full flex overflow-hidden"
  >
    <div
      data-region="main-content"
      class="flex-1 min-h-0 flex flex-col"
    >
      <CScrollbar class="h-full">
        <div class="p-padding-lg">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-padding-md">
            <div
              v-for="item in projectList"
              :key="item.id"
              class="rounded-scale-md component-border p-padding-md cursor-pointer transition-colors hover:bg-muted/50"
              :class="{
                'ring-2 ring-primary bg-primary/5': selectedProject?.id === item.id,
              }"
              @click="selectedProject = item"
            >
              <div class="flex items-center justify-between gap-sm mb-margin-xs">
                <span class="font-medium fs-sm text-foreground truncate">{{ item.name }}</span>
                <span
                  class="shrink-0 px-padding-xs py-padding-2xs rounded fs-xs"
                  :class="{
                    'bg-success/20 text-success': item.status === 'active',
                    'bg-muted text-muted-foreground': item.status === 'archived',
                    'bg-warn/20 text-warn': item.status === 'draft',
                  }"
                >
                  {{ statusMap[item.status] }}
                </span>
              </div>
              <p class="fs-xs text-muted-foreground m-0 line-clamp-2">
                {{ item.description }}
              </p>
            </div>
          </div>
        </div>
      </CScrollbar>
    </div>

    <div
      data-region="inspector"
      class="shrink-0 w-80 border-l-default glass-surface shadow-float flex flex-col"
    >
      <CScrollbar class="h-full">
        <div class="p-padding-lg">
          <template v-if="selectedProject">
            <h3 class="fs-md font-semibold text-foreground m-0 mb-margin-md">
              {{ selectedProject.name }}
            </h3>
            <dl class="flex flex-col gap-sm fs-sm m-0">
              <div class="flex gap-sm">
                <dt class="shrink-0 text-muted-foreground w-20">状态</dt>
                <dd class="m-0 text-foreground">{{ statusMap[selectedProject.status] }}</dd>
              </div>
              <div class="flex gap-sm">
                <dt class="shrink-0 text-muted-foreground w-20">创建时间</dt>
                <dd class="m-0 text-foreground">{{ selectedProject.createdAt }}</dd>
              </div>
              <div class="flex flex-col gap-xs">
                <dt class="text-muted-foreground">描述</dt>
                <dd class="m-0 text-foreground">{{ selectedProject.description }}</dd>
              </div>
            </dl>
          </template>
          <template v-else>
            <EmptyState
              icon="i-lucide-file-question"
              title="请选择一个项目"
              description="在左侧列表点击项目卡片，查看详细信息"
            />
          </template>
        </div>
      </CScrollbar>
    </div>
  </div>
</template>
