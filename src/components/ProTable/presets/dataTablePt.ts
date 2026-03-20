const HEADER_CELL_CLASS =
  'py-xs! px-md! text-xs! font-semibold text-muted-foreground uppercase tracking-wider text-left'

const BODY_CELL_CLASS = 'py-sm! px-md!'
const BODY_ROW_BASE = 'behavior-hover-transition'

export interface DataTablePtOptions {
  tableLayout?: 'auto' | 'fixed'
}

// DataTable-level PT (root, rows, structure — NOT cells)
// Cell keys (headerCell, bodyCell) are Column-level in PrimeVue v4 and are silently ignored here.
export function buildDataTablePt(options?: DataTablePtOptions): Record<string, unknown> {
  const tableStyle: Record<string, string> = {}
  if (options?.tableLayout) {
    tableStyle.tableLayout = options.tableLayout
  }

  return {
    root: { class: 'layout-full' },
    tableContainer: { class: 'overflow-auto' },
    table: {
      class: 'w-full border-collapse',
      ...(Object.keys(tableStyle).length > 0 ? { style: tableStyle } : {}),
    },
    headerRow: { class: 'bg-muted/30! border-b-default!' },
    bodyRow: { class: BODY_ROW_BASE },
    emptyMessage: { class: 'hidden' },
    mask: { class: 'hidden' },
  }
}

// Column-level PT (cells — applied to each <Column :pt=...>)
// Spacing only — gridlines & zebra are handled by scoped CSS on <DataTable>.
export function buildColumnPt(): Record<string, unknown> {
  return {
    headerCell: { class: HEADER_CELL_CLASS },
    bodyCell: { class: BODY_CELL_CLASS },
  }
}
