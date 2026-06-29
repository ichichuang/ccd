import type { ProTableColumn, ProTableColumnGroup } from '../types/column'

export type ColumnGroupPinSection = 'left' | 'center' | 'right'

export interface ResolvedColumnGroupCell {
  key: string
  group: ProTableColumnGroup | null
  colspan: number
  pinSection: ColumnGroupPinSection
  ariaColIndex: number
}

export function getColumnPinSection<T extends Record<string, unknown>>(
  col: ProTableColumn<T>
): ColumnGroupPinSection {
  if (col.pinned === 'left') return 'left'
  if (col.pinned === 'right') return 'right'
  return 'center'
}

function findColumnGroup(
  row: readonly ProTableColumnGroup[],
  columnId: string
): ProTableColumnGroup | null {
  return row.find(group => group.columnIds.includes(columnId)) ?? null
}

function getColumnGroupIdentity<T extends Record<string, unknown>>(
  group: ProTableColumnGroup | null,
  col: ProTableColumn<T>,
  pinSection: ColumnGroupPinSection
): string {
  return `${group?.id ?? `ungrouped-${col.id}`}:${pinSection}`
}

export function resolveColumnGroupRows<T extends Record<string, unknown>>(
  rows: readonly (readonly ProTableColumnGroup[])[],
  columns: readonly ProTableColumn<T>[]
): ResolvedColumnGroupCell[][] {
  return rows
    .map((row, rowIndex) => {
      const cells: ResolvedColumnGroupCell[] = []
      let activeIdentity: string | null = null

      columns.forEach((col, columnIndex) => {
        const pinSection = getColumnPinSection(col)
        const group = findColumnGroup(row, col.id)
        const identity = getColumnGroupIdentity(group, col, pinSection)
        const activeCell = cells[cells.length - 1]

        if (activeCell && activeIdentity === identity) {
          activeCell.colspan += 1
          return
        }

        activeIdentity = identity
        cells.push({
          key: `${rowIndex}-${identity}-${cells.length}`,
          group,
          colspan: 1,
          pinSection,
          ariaColIndex: columnIndex + 1,
        })
      })

      return cells
    })
    .filter(row => row.some(cell => cell.group !== null))
}
