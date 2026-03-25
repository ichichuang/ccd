<script setup lang="ts">
import { buildAlignmentColumns } from './columns'
import type { AlignmentRow } from './columns'

defineOptions({ name: 'ExampleProTableAlignmentPage' })

const NAMES = ['张伟', '王芳', '李娜', '刘洋', '陈静', '杨帆', '赵磊', '黄梅'] as const

const STATUSES: AlignmentRow['status'][] = ['active', 'inactive', 'pending']

function makeData(): AlignmentRow[] {
  return NAMES.map((name, index) => ({
    id: index + 1,
    name,
    status: STATUSES[index % STATUSES.length] ?? 'pending',
    salary: 9000 + index * 1200,
  }))
}

const tableData = ref<AlignmentRow[]>(makeData())

const tableContainerRef = ref<HTMLElement | null>(null)
const tableContainerHeight = ref<number | undefined>(undefined)

const leftColumns = computed(() => buildAlignmentColumns('left', 'left'))
const centerColumns = computed(() => buildAlignmentColumns('center', 'center'))
const rightColumns = computed(() => buildAlignmentColumns('right', 'right'))

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
      <h1 class="text-xl font-bold text-foreground">ProTable 列对齐示例</h1>
      <p class="text-xs text-muted-foreground">
        使用 Tabs 分别展示左/中/右对齐，并可分别控制“表头内容对齐”和“表格内容对齐”。
      </p>
    </section>

    <section class="flex-1">
      <Tabs
        value="0"
        class="layout-full"
      >
        <TabList>
          <Tab value="0">左对齐</Tab>
          <Tab value="1">居中对齐</Tab>
          <Tab value="2">右对齐</Tab>
        </TabList>

        <TabPanels>
          <TabPanel value="0">
            <section
              ref="tableContainerRef"
              class="layout-full"
            >
              <template v-if="tableContainerHeight && tableContainerHeight > 0">
                <div
                  class="material-elevated col-fill"
                  :style="{ height: tableContainerHeight + 'px' }"
                >
                  <div class="col-fill">
                    <ProTable
                      :columns="leftColumns"
                      :data="tableData"
                      row-key="id"
                      height-mode="fill"
                    />
                  </div>
                </div>
              </template>
            </section>
          </TabPanel>

          <TabPanel value="1">
            <template v-if="tableContainerHeight && tableContainerHeight > 0">
              <div
                class="material-elevated col-fill"
                :style="{ height: tableContainerHeight + 'px' }"
              >
                <div class="col-fill">
                  <ProTable
                    :columns="centerColumns"
                    :data="tableData"
                    row-key="id"
                    height-mode="fill"
                  />
                </div>
              </div>
            </template>
          </TabPanel>

          <TabPanel value="2">
            <template v-if="tableContainerHeight && tableContainerHeight > 0">
              <div
                class="material-elevated col-fill"
                :style="{ height: tableContainerHeight + 'px' }"
              >
                <div class="col-fill">
                  <ProTable
                    :columns="rightColumns"
                    :data="tableData"
                    row-key="id"
                    height-mode="fill"
                  />
                </div>
              </div>
            </template>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </section>
  </div>
</template>
