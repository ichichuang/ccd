export interface DataTablePtOptions {
  tableLayout?: 'auto' | 'fixed'
}

// DataTable-level PT only: keep structure, leave cell rendering/styling to PrimeVue theme.
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
    headerRow: {
      class: 'border-b-solid border-b-px border-border',
    },
    emptyMessage: { class: 'hidden' },
    mask: { class: 'hidden' },
  }
}
