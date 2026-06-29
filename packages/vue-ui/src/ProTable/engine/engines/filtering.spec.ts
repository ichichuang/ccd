import { describe, expect, it } from 'vitest'
import { applyFilter } from './filtering'
import type { ProTableColumn } from '../types/column'

interface Row extends Record<string, unknown> {
  id: string
  title: string
  owner?: string
  releasedAt?: Date | string | number | null
}

const textColumns: ProTableColumn<Row>[] = [
  { id: 'title', title: 'Title', field: 'title' },
  { id: 'owner', title: 'Owner', field: 'owner' },
]

const dateColumns: ProTableColumn<Row>[] = [
  { id: 'title', title: 'Title', field: 'title' },
  {
    id: 'releasedAt',
    title: 'Released',
    field: 'releasedAt',
    filterable: true,
    filterType: 'date',
  },
]

describe('applyFilter global search', () => {
  it('keeps substring search as the default global-search behavior', () => {
    const rows: Row[] = [
      { id: 'exact', title: 'ProTable filtering foundation' },
      { id: 'fuzzy-only', title: 'Protocol task foundation' },
      { id: 'miss', title: 'Column sorting' },
    ]

    expect(
      applyFilter(rows, { global: 'protable', columns: {} }, textColumns).map(row => row.id)
    ).toEqual(['exact'])
  })

  it('supports opt-in fuzzy global search with ranked matches', () => {
    const rows: Row[] = [
      { id: 'fuzzy-only', title: 'Protocol table foundation' },
      { id: 'exact', title: 'ProTable filtering foundation' },
      { id: 'miss', title: 'Column sorting' },
    ]

    expect(
      applyFilter(rows, { global: 'protable', columns: {} }, textColumns, {
        globalSearchMode: 'fuzzy',
      }).map(row => row.id)
    ).toEqual(['exact', 'fuzzy-only'])
  })
})

describe('applyFilter date column filters', () => {
  it('matches date filters against Date row values by date-only value', () => {
    const rows: Row[] = [
      { id: 'match', title: 'Matched', releasedAt: new Date(2026, 1, 14, 16, 30) },
      { id: 'miss', title: 'Missed', releasedAt: new Date(2026, 1, 15, 9, 0) },
    ]

    expect(
      applyFilter(
        rows,
        { global: '', columns: { releasedAt: new Date(2026, 1, 14) } },
        dateColumns
      ).map(row => row.id)
    ).toEqual(['match'])
  })

  it('matches date filters against ISO date strings', () => {
    const rows: Row[] = [
      { id: 'match', title: 'Matched', releasedAt: '2026-03-08T23:59:59.000Z' },
      { id: 'miss', title: 'Missed', releasedAt: '2026-03-09T00:00:00.000Z' },
    ]

    expect(
      applyFilter(
        rows,
        { global: '', columns: { releasedAt: new Date(2026, 2, 8) } },
        dateColumns
      ).map(row => row.id)
    ).toEqual(['match'])
  })

  it('matches date filters against timestamp row values', () => {
    const matchingTimestamp = new Date(2026, 4, 20, 12, 15).getTime()
    const missedTimestamp = new Date(2026, 4, 21, 8, 0).getTime()
    const rows: Row[] = [
      { id: 'match', title: 'Matched', releasedAt: matchingTimestamp },
      { id: 'miss', title: 'Missed', releasedAt: missedTimestamp },
    ]

    expect(
      applyFilter(
        rows,
        { global: '', columns: { releasedAt: new Date(2026, 4, 20) } },
        dateColumns
      ).map(row => row.id)
    ).toEqual(['match'])
  })

  it('ignores empty and null date filters', () => {
    const rows: Row[] = [
      { id: 'with-date', title: 'With date', releasedAt: '2026-06-01' },
      { id: 'without-date', title: 'Without date', releasedAt: null },
    ]

    expect(
      applyFilter(rows, { global: '', columns: { releasedAt: null } }, dateColumns).map(
        row => row.id
      )
    ).toEqual(['with-date', 'without-date'])
    expect(
      applyFilter(rows, { global: '', columns: { releasedAt: '' } }, dateColumns).map(row => row.id)
    ).toEqual(['with-date', 'without-date'])
  })
})
