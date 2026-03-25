<script setup lang="ts">
import { employeeColumns } from './columns'
import type { EmployeeRow } from './columns'

defineOptions({ name: 'ExampleProTablePlaygroundPage' })

const DEPARTMENTS = ['工程', '设计', '产品', '运营'] as const
const STATUSES = ['active', 'inactive', 'pending'] as const

function makeMockData(): EmployeeRow[] {
  const names = [
    '张伟',
    '王芳',
    '李娜',
    '刘洋',
    '陈静',
    '杨帆',
    '赵磊',
    '黄梅',
    '周明',
    '吴丹',
    '徐刚',
    '孙悦',
    '马超',
    '朱琳',
    '胡浩',
    '林雪',
    '何欣',
    '郭峰',
    '高敏',
    '谢涛',
    '罗健',
    '梁晨',
    '宋杰',
    '唐颖',
    '许磊',
    '韩冰',
    '冯婷',
    '邓阳',
    '曹薇',
    '彭强',
    '蒋文',
    '苏航',
    '沈欢',
    '卢彬',
    '姜超',
  ]
  return names.map((name, i) => ({
    id: i + 1,
    name,
    department: DEPARTMENTS[i % DEPARTMENTS.length] as string,
    status: STATUSES[i % STATUSES.length] as 'active' | 'inactive' | 'pending',
    salary: 8000 + (i % 5) * 3000 + Math.floor((i * 17) % 2000),
    joinedAt: `202${Math.floor(i / 12)}-${String((i % 12) + 1).padStart(2, '0')}-01`,
  }))
}

const mockData = ref<EmployeeRow[]>(makeMockData())

function rowClassName(row: EmployeeRow): string {
  return row.status === 'inactive' ? 'opacity-60' : ''
}

const tableContainerRef = ref<HTMLElement | null>(null)
const tableContainerHeight = ref<number | undefined>(undefined)
onMounted(() => {
  tableContainerHeight.value = tableContainerRef.value?.clientHeight ?? 0
})
</script>

<template>
  <div
    data-archetype="A1-toolbar-content"
    class="col-fill gap-md"
  >
    <section class="p-sm md:p-md col-stretch gap-sm">
      <h1 class="text-xl font-bold text-foreground">ProTable Playground（Tabs Showcase）</h1>
      <p class="text-xs text-muted-foreground">
        默认基础 · 外观与网格 · 行状态与交互 · 单选机制 · 多选机制 · 工具栏与搜索 · 加载状态
      </p>
    </section>
    <section class="flex-1">
      <Tabs
        value="0"
        class="layout-full"
      >
        <TabList>
          <Tab value="0">默认基础</Tab>
          <Tab value="1">外观与网格</Tab>
          <Tab value="2">行状态与交互</Tab>
          <Tab value="3">单选机制</Tab>
          <Tab value="4">多选机制</Tab>
          <Tab value="5">工具栏与搜索</Tab>
          <Tab value="6">加载状态</Tab>
        </TabList>

        <TabPanels>
          <TabPanel value="0">
            <section
              ref="tableContainerRef"
              class="layout-full"
            >
              <template v-if="tableContainerHeight && tableContainerHeight > 0">
                <div
                  class="material-elevated"
                  :style="{ height: tableContainerHeight + 'px' }"
                >
                  <ProTable
                    :columns="employeeColumns"
                    :data="mockData"
                    row-key="id"
                  />
                </div>
              </template>
            </section>
          </TabPanel>

          <TabPanel value="1">
            <template v-if="tableContainerHeight && tableContainerHeight > 0">
              <div
                class="material-elevated"
                :style="{ height: tableContainerHeight + 'px' }"
              >
                <ProTable
                  :columns="employeeColumns"
                  :data="mockData"
                  row-key="id"
                  :striped-rows="true"
                  :show-horizontal-lines="true"
                  :show-vertical-lines="true"
                />
              </div>
            </template>
          </TabPanel>

          <TabPanel value="2">
            <template v-if="tableContainerHeight && tableContainerHeight > 0">
              <div
                class="material-elevated"
                :style="{ height: tableContainerHeight + 'px' }"
              >
                <ProTable
                  :columns="employeeColumns"
                  :data="mockData"
                  row-key="id"
                  :row-hover="true"
                  :row-class-name="rowClassName"
                />
              </div>
            </template>
          </TabPanel>

          <TabPanel value="3">
            <template v-if="tableContainerHeight && tableContainerHeight > 0">
              <div
                class="material-elevated"
                :style="{ height: tableContainerHeight + 'px' }"
              >
                <ProTable
                  :columns="employeeColumns"
                  :data="mockData"
                  row-key="id"
                  selectable="single"
                />
              </div>
            </template>
          </TabPanel>

          <TabPanel value="4">
            <template v-if="tableContainerHeight && tableContainerHeight > 0">
              <div
                class="material-elevated"
                :style="{ height: tableContainerHeight + 'px' }"
              >
                <ProTable
                  :columns="employeeColumns"
                  :data="mockData"
                  row-key="id"
                  selectable="checkbox"
                  selection-pinned="left"
                />
              </div>
            </template>
          </TabPanel>

          <TabPanel value="5">
            <template v-if="tableContainerHeight && tableContainerHeight > 0">
              <div
                class="material-elevated"
                :style="{ height: tableContainerHeight + 'px' }"
              >
                <ProTable
                  :columns="employeeColumns"
                  :data="mockData"
                  row-key="id"
                  title="员工列表"
                  :show-toolbar="true"
                  :global-filter="true"
                />
              </div>
            </template>
          </TabPanel>

          <TabPanel value="6">
            <template v-if="tableContainerHeight && tableContainerHeight > 0">
              <div
                class="material-elevated"
                :style="{ height: tableContainerHeight + 'px' }"
              >
                <ProTable
                  :columns="employeeColumns"
                  :data="mockData"
                  row-key="id"
                  :loading="true"
                />
              </div>
            </template>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </section>
  </div>
</template>
