import type { Ref } from 'vue'
import type { ProTableExposed } from '@/components/ProTable'
import ProTableCrudFormModalBody from '@/components/ProTable/components/ProTableCrudFormModalBody'
import ProTableCrudViewModalBody from '@/components/ProTable/components/ProTableCrudViewModalBody'
import type { DialogOptions } from '@/components/PrimeDialog'
import { useDialog } from '@/hooks/modules/useDialog'
import { useTimeoutFn } from '@vueuse/core'
import type { FormSchema } from '@/components/ProForm'

export type RowId = string | number

export interface ProTableCrudSchemas {
  create: FormSchema
  edit: FormSchema
  view: FormSchema
}

export interface ProTableCrudApis<TRow extends Record<string, unknown>> {
  create: (values: Record<string, unknown>) => Promise<void>
  update: (id: RowId, values: Record<string, unknown>) => Promise<void>
  remove?: (row: TRow) => Promise<void>
}

export interface ProTableCrudMappers<TRow extends Record<string, unknown>> {
  rowToEditValues: (row: TRow) => Record<string, unknown>
  rowToViewValues: (row: TRow) => Record<string, unknown>
  getRowId?: (row: TRow) => RowId
}

type DialogOverrides = Partial<Omit<DialogOptions, 'contentRenderer' | 'footerRenderer'>>

// 本地兜底类型：只用于约束外部传入的 drawerOptions 结构
// 运行时逻辑已改为 useRecordOverlay 的本地 drawerState 引擎
type DrawerOptions = {
  visible: boolean
  contentRenderer?: unknown
  footerRenderer?: unknown
  _instanceId?: string
  [key: string]: unknown
}

type DrawerOverrides = Partial<
  Omit<DrawerOptions, 'contentRenderer' | 'footerRenderer' | 'visible' | '_instanceId'>
>

export interface UseRecordOverlayOptions<TRow extends Record<string, unknown>> {
  tableRef: Ref<ProTableExposed | null>
  title?: string
  schemas: ProTableCrudSchemas
  apis: ProTableCrudApis<TRow>
  mappers: ProTableCrudMappers<TRow>

  dialogOptions?: {
    create?: DialogOverrides
    edit?: DialogOverrides
    view?: DialogOverrides
  }
  drawerOptions?: {
    create?: DrawerOverrides
    edit?: DrawerOverrides
    view?: DrawerOverrides
  }

  beforeSubmit?: (
    values: Record<string, unknown>,
    mode: 'create' | 'edit',
    row?: TRow
  ) => Record<string, unknown> | Promise<Record<string, unknown>>
}

export interface UseRecordOverlayReturn<TRow extends Record<string, unknown>> {
  openCreate: () => void
  openCreateDrawer: () => void
  openEdit: (row: TRow) => void
  openEditDrawer: (row: TRow) => void
  openView: (row: TRow) => void
  openViewDrawer: (row: TRow) => void
  handleDelete: (row: TRow) => Promise<void>
  reloadTable: () => void
  drawerState: {
    visible: boolean
    mode: 'create' | 'edit' | 'view'
    data: {
      values: Record<string, unknown>
      rowId: RowId | null
    } | null
  }
  drawerSubmit: (values: Record<string, unknown>) => Promise<void>
  drawerCancel: () => void
}

type ProTableCrudFormPresentation = 'modal' | 'drawer'

function resolveRowId<TRow extends Record<string, unknown>>(
  row: TRow,
  getRowId: ProTableCrudMappers<TRow>['getRowId']
): RowId {
  if (getRowId) return getRowId(row)
  const id = (row as Record<string, unknown>).id
  if (typeof id === 'string' || typeof id === 'number') return id
  throw new Error('[useRecordOverlay] Pass mappers.getRowId when row.id is not string | number')
}

export function useRecordOverlay<TRow extends Record<string, unknown>>(
  options: UseRecordOverlayOptions<TRow>
): UseRecordOverlayReturn<TRow> {
  const { openDialog, closeDialog } = useDialog()

  const baseTitle = options.title ?? '数据'

  const reloadTable = (): void => {
    const proTable = options.tableRef.value
    if (!proTable) return
    const st = proTable.getState()
    if (st.pagination.page !== 1) {
      proTable.setPage(1)
    } else {
      proTable.reload()
    }
  }

  const { start: scheduleReloadAfterModalClose } = useTimeoutFn(
    () => {
      reloadTable()
    },
    300,
    { immediate: false }
  )

  const getRowId = (row: TRow): RowId => resolveRowId(row, options.mappers.getRowId)

  // 本地 Drawer 状态引擎：用于替代全局命令式 Drawer 引擎
  const drawerRowRef = ref<TRow | null>(null)
  const drawerState = reactive<UseRecordOverlayReturn<TRow>['drawerState']>({
    visible: false,
    mode: 'view',
    data: null,
  })

  const openForm = (
    mode: 'create' | 'edit',
    presentation: ProTableCrudFormPresentation,
    row?: TRow
  ): void => {
    const isEdit = mode === 'edit'
    const initialValues = isEdit && row ? options.mappers.rowToEditValues(row) : {}
    const schema = isEdit ? options.schemas.edit : options.schemas.create
    const title = isEdit ? `编辑${baseTitle}` : `新建${baseTitle}`

    const handleSubmit = async (values: Record<string, unknown>): Promise<void> => {
      const finalValues = options.beforeSubmit
        ? await options.beforeSubmit(values, isEdit ? 'edit' : 'create', row)
        : values

      if (isEdit && row) {
        await options.apis.update(getRowId(row), finalValues)
      } else {
        await options.apis.create(finalValues)
      }
    }

    if (presentation === 'modal') {
      const idx = openDialog({
        header: title,
        width: 'min(90vw, 500px)',
        class: 'z-popover',
        ...(isEdit ? options.dialogOptions?.edit : options.dialogOptions?.create),
        // Sticky Footer 强制：Dialog 自带 footer 必须隐藏
        modal: true,
        hideFooter: true,
        contentRenderer: () => (
          <ProTableCrudFormModalBody
            schema={schema}
            initialValues={initialValues}
            onRequestSubmit={async (values: Record<string, unknown>) => {
              await handleSubmit(values)
              closeDialog(idx)
              scheduleReloadAfterModalClose()
            }}
            onCancel={() => closeDialog(idx)}
          />
        ),
      })
      return
    }

    drawerRowRef.value = isEdit && row ? row : null
    drawerState.mode = isEdit ? 'edit' : 'create'
    drawerState.data = {
      values: initialValues,
      rowId: isEdit && row ? getRowId(row) : null,
    }
    drawerState.visible = true
  }

  const openViewPresentation = (row: TRow, presentation: 'modal' | 'drawer'): void => {
    const initialValues = options.mappers.rowToViewValues(row)
    const title = `${baseTitle}详情`

    if (presentation === 'modal') {
      const idx = openDialog({
        header: title,
        width: 'min(90vw, 500px)',
        class: 'z-popover',
        ...options.dialogOptions?.view,
        // Sticky Footer 强制：Dialog 自带 footer 必须隐藏
        modal: true,
        hideFooter: true,
        contentRenderer: () => (
          <ProTableCrudViewModalBody
            schema={options.schemas.view}
            initialValues={initialValues}
            onClose={() => closeDialog(idx)}
          />
        ),
      })
      return
    }

    drawerRowRef.value = null
    drawerState.mode = 'view'
    drawerState.data = {
      values: initialValues,
      rowId: null,
    }
    drawerState.visible = true
  }

  const drawerCancel = (): void => {
    drawerState.visible = false
    drawerState.mode = 'view'
    drawerState.data = null
    drawerRowRef.value = null
  }

  const drawerSubmit = async (values: Record<string, unknown>): Promise<void> => {
    if (!drawerState.data) return

    if (drawerState.mode === 'create') {
      const finalValues = options.beforeSubmit
        ? await options.beforeSubmit(values, 'create', drawerRowRef.value ?? undefined)
        : values
      await options.apis.create(finalValues)
      drawerCancel()
      scheduleReloadAfterModalClose()
      return
    }

    if (drawerState.mode === 'edit') {
      const finalValues = options.beforeSubmit
        ? await options.beforeSubmit(values, 'edit', drawerRowRef.value ?? undefined)
        : values
      const rowId = drawerState.data.rowId
      if (rowId == null) return
      await options.apis.update(rowId, finalValues)
      drawerCancel()
      scheduleReloadAfterModalClose()
      return
    }
  }

  const handleDelete = async (row: TRow): Promise<void> => {
    if (!options.apis.remove) return
    await options.apis.remove(row)
    reloadTable()
  }

  return {
    openCreate: () => openForm('create', 'modal'),
    openCreateDrawer: () => openForm('create', 'drawer'),
    openEdit: (row: TRow) => openForm('edit', 'modal', row),
    openEditDrawer: (row: TRow) => openForm('edit', 'drawer', row),
    openView: (row: TRow) => openViewPresentation(row, 'modal'),
    openViewDrawer: (row: TRow) => openViewPresentation(row, 'drawer'),
    handleDelete,
    reloadTable,
    drawerState,
    drawerSubmit,
    drawerCancel,
  }
}
