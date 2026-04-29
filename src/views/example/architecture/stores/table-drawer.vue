<script setup lang="ts">
import { castRecord, castValue } from '@/utils/typeCasters'

defineOptions({ name: 'ArchitectureStoreTableDrawer' })

interface SampleRow {
  id: number
  name: string
  role: string
  status: string
  email: string
  department: string
}

const sampleData: SampleRow[] = [
  {
    id: 1,
    name: 'Alice Zhang',
    role: 'admin',
    status: 'active',
    email: 'alice@example.com',
    department: 'Engineering',
  },
  {
    id: 2,
    name: 'Bob Wang',
    role: 'editor',
    status: 'inactive',
    email: 'bob@example.com',
    department: 'Design',
  },
  {
    id: 3,
    name: 'Carol Li',
    role: 'viewer',
    status: 'active',
    email: 'carol@example.com',
    department: 'Product',
  },
]

const tableDrawerStore = useTableDrawerStore()

const selectedRow = computed(() => castValue<SampleRow | null>(tableDrawerStore.selectedRow))

function openRow(row: SampleRow): void {
  tableDrawerStore.openDrawer(castRecord(row))
}

function closeDrawer(): void {
  tableDrawerStore.closeDrawer()
}
</script>

<template>
  <div
    class="col-stretch"
    data-archetype="A4-table-drawer"
  >
    <div class="col-stretch gap-md min-h-0 min-w-0">
      <div class="layout-narrow col-stretch gap-md min-w-0">
        <header class="shrink-0 glass-panel col-stretch gap-md min-w-0">
          <div class="row-between gap-md min-w-0">
            <div class="row-start gap-sm min-w-0 flex-wrap">
              <div class="glass-icon-box shrink-0">
                <Icons
                  name="i-lucide-panel-right"
                  size="xl"
                  class="text-primary"
                />
              </div>
              <div class="col-stretch gap-xs min-w-0">
                <div class="row-start gap-xs min-w-0 flex-wrap">
                  <span class="text-lg font-bold text-foreground text-no-wrap">
                    TableDrawer Store
                  </span>
                  <span
                    class="surface-primary rounded-md px-sm py-xs text-xs font-semibold uppercase"
                  >
                    STORE
                  </span>
                </div>
                <span class="text-sm text-muted-foreground text-ellipsis-1">
                  A4 页面状态管理 — 行点击触发 openDrawer()，关闭按钮调用 closeDrawer()
                </span>
              </div>
            </div>
            <Tag
              :value="tableDrawerStore.drawerVisible ? 'Drawer Open' : 'Drawer Closed'"
              :severity="tableDrawerStore.drawerVisible ? 'success' : 'secondary'"
              class="shrink-0"
            />
          </div>
        </header>

        <section class="material-elevated col-stretch gap-md min-w-0">
          <DataTable
            :value="sampleData"
            selection-mode="single"
            size="small"
            @row-select="e => openRow(e.data)"
          >
            <Column
              field="id"
              header="ID"
            />
            <Column
              field="name"
              header="Name"
            />
            <Column
              field="role"
              header="Role"
            >
              <template #body="{ data }">
                <Tag
                  :value="data.role"
                  :severity="
                    data.role === 'admin' ? 'danger' : data.role === 'editor' ? 'warn' : 'secondary'
                  "
                />
              </template>
            </Column>
            <Column
              field="status"
              header="Status"
            >
              <template #body="{ data }">
                <Tag
                  :value="data.status"
                  :severity="data.status === 'active' ? 'success' : 'secondary'"
                />
              </template>
            </Column>
            <Column
              field="department"
              header="Department"
            />
          </DataTable>

          <p class="text-sm text-muted-foreground m-0">
            点击任意行 →
            <span class="font-mono text-foreground text-xs">
              useTableDrawerStore().openDrawer(row)
            </span>
            → 侧边抽屉展开展示详情。
          </p>
        </section>
      </div>
    </div>

    <Drawer
      v-model:visible="tableDrawerStore.drawerVisible"
      position="right"
      header="Row Detail"
    >
      <div
        v-if="selectedRow"
        class="col-stretch gap-md"
      >
        <div class="col-stretch gap-sm">
          <div class="row-between py-xs border-b border-border">
            <span class="text-sm text-muted-foreground">ID</span>
            <span class="text-sm font-mono text-foreground">{{ selectedRow.id }}</span>
          </div>
          <div class="row-between py-xs border-b border-border">
            <span class="text-sm text-muted-foreground">Name</span>
            <span class="text-sm font-semibold text-foreground">{{ selectedRow.name }}</span>
          </div>
          <div class="row-between py-xs border-b border-border">
            <span class="text-sm text-muted-foreground">Role</span>
            <Tag
              :value="selectedRow.role"
              :severity="
                selectedRow.role === 'admin'
                  ? 'danger'
                  : selectedRow.role === 'editor'
                    ? 'warn'
                    : 'secondary'
              "
            />
          </div>
          <div class="row-between py-xs border-b border-border">
            <span class="text-sm text-muted-foreground">Status</span>
            <Tag
              :value="selectedRow.status"
              :severity="selectedRow.status === 'active' ? 'success' : 'secondary'"
            />
          </div>
          <div class="row-between py-xs border-b border-border">
            <span class="text-sm text-muted-foreground">Email</span>
            <span class="text-sm font-mono text-foreground">{{ selectedRow.email }}</span>
          </div>
          <div class="row-between py-xs">
            <span class="text-sm text-muted-foreground">Department</span>
            <span class="text-sm text-foreground">{{ selectedRow.department }}</span>
          </div>
        </div>

        <Divider />

        <div class="col-stretch gap-xs">
          <span class="text-xs text-muted-foreground font-mono">tableDrawerStore.selectedRow</span>
          <pre class="code-block">{{ JSON.stringify(selectedRow, null, 2) }}</pre>
        </div>

        <Button
          label="Close Drawer"
          severity="secondary"
          @click="closeDrawer"
        />
      </div>
    </Drawer>
  </div>
</template>
