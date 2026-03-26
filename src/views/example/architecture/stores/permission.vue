<script setup lang="ts">
defineOptions({ name: 'ArchitectureStorePermission' })

const permStore = usePermissionStore()

const tabs = computed(() => permStore.getTabs)
const windowsCount = computed(() => permStore.windows.length)
const isDynamicLoaded = computed(() => permStore.getIsDynamicRoutesLoaded)

const drawerVisible = ref(false)
const selectedTab = ref<TabItem | null>(null)

function onRowSelect(event: { data: TabItem }): void {
  selectedTab.value = event.data
  drawerVisible.value = true
}
</script>

<template>
  <div
    class="animate__animated animate__fadeIn col-stretch gap-md"
    data-archetype="A4-table-drawer"
  >
    <div class="layout-narrow col-stretch gap-md">
      <section class="material-elevated col-stretch gap-md">
        <div class="row-between">
          <div class="col-stretch gap-xs">
            <h2 class="text-lg font-semibold text-foreground m-0">Permission Store</h2>
            <p class="text-sm text-muted-foreground m-0">
              当前 tabs[] 与 windows[] 状态检查器 — 点击行查看详情
            </p>
          </div>
          <div class="row-center gap-sm">
            <Tag
              :value="`tabs: ${tabs.length}`"
              severity="primary"
            />
            <Tag
              :value="`windows: ${windowsCount}`"
              severity="secondary"
            />
            <Tag
              :value="isDynamicLoaded ? 'Routes Loaded' : 'Not Loaded'"
              :severity="isDynamicLoaded ? 'success' : 'warn'"
            />
          </div>
        </div>
        <Divider />

        <DataTable
          :value="tabs"
          selection-mode="single"
          :rows="10"
          size="small"
          @row-select="onRowSelect"
        >
          <template #empty>
            <div class="center p-md text-muted-foreground text-sm">
              暂无标签页数据 — 请先浏览其他页面，标签页将自动注册到 Store
            </div>
          </template>
          <Column
            field="name"
            header="Route Name"
          />
          <Column
            field="path"
            header="Path"
          />
          <Column
            field="active"
            header="Active"
          >
            <template #body="{ data }">
              <Tag
                :value="data.active ? 'Active' : '—'"
                :severity="data.active ? 'success' : 'secondary'"
              />
            </template>
          </Column>
          <Column
            field="fixed"
            header="Fixed"
          >
            <template #body="{ data }">
              <Tag
                :value="data.fixed ? 'Fixed' : '—'"
                :severity="data.fixed ? 'warn' : 'secondary'"
              />
            </template>
          </Column>
          <Column
            field="deletable"
            header="Deletable"
          >
            <template #body="{ data }">
              <Tag
                :value="data.deletable ? 'Yes' : 'No'"
                :severity="data.deletable ? 'secondary' : 'danger'"
              />
            </template>
          </Column>
        </DataTable>
      </section>
    </div>

    <Drawer
      v-model:visible="drawerVisible"
      position="right"
      header="Tab Detail"
    >
      <div
        v-if="selectedTab"
        class="col-stretch gap-md"
      >
        <div class="col-stretch gap-sm">
          <div class="row-between py-xs border-b border-border">
            <span class="text-sm text-muted-foreground">Route Name</span>
            <span class="text-sm font-mono text-foreground">{{ selectedTab.name }}</span>
          </div>
          <div class="row-between py-xs border-b border-border">
            <span class="text-sm text-muted-foreground">Path</span>
            <span class="text-sm font-mono text-foreground">{{ selectedTab.path }}</span>
          </div>
          <div class="row-between py-xs border-b border-border">
            <span class="text-sm text-muted-foreground">Label</span>
            <span class="text-sm text-foreground">
              {{ selectedTab.label || selectedTab.title || '—' }}
            </span>
          </div>
          <div class="row-between py-xs border-b border-border">
            <span class="text-sm text-muted-foreground">Active</span>
            <Tag
              :value="`${selectedTab.active}`"
              :severity="selectedTab.active ? 'success' : 'secondary'"
            />
          </div>
          <div class="row-between py-xs border-b border-border">
            <span class="text-sm text-muted-foreground">Fixed</span>
            <Tag
              :value="`${selectedTab.fixed}`"
              :severity="selectedTab.fixed ? 'warn' : 'secondary'"
            />
          </div>
          <div class="row-between py-xs">
            <span class="text-sm text-muted-foreground">Deletable</span>
            <Tag
              :value="`${selectedTab.deletable}`"
              :severity="selectedTab.deletable ? 'secondary' : 'danger'"
            />
          </div>
        </div>
        <Button
          label="Close"
          severity="secondary"
          @click="drawerVisible = false"
        />
      </div>
    </Drawer>
  </div>
</template>
