import { describe, expect, it } from 'vitest'
import {
  ALERT_LEVEL_VALUE_ENUM,
  EMPLOYEE_DEPARTMENTS,
  EMPLOYEE_STATUS_LABELS,
  EMPLOYEE_WORK_STATUSES,
  GENDER,
  GENDER_BADGE,
  GENDER_SELECT_OPTIONS,
  NODE_STATE_VALUE_ENUM,
  ORDER_STATUS_VALUE_ENUM,
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_CLASS,
  PRODUCT_CATEGORY_FILTER_OPTIONS,
  PRODUCT_STATUS_DISPLAY,
  TASK_BOARD_STATUS_DISPLAY,
  TASK_PRIORITY_CLASS,
  TRANSACTION_LEDGER_STATUS_CLASS,
  TRANSACTION_LEDGER_STATUS_LABEL,
  USER_ACCOUNT_STATUS,
  USER_STATUS_FORM_OPTIONS,
} from './enums'

function expectSameKeys(actual: Record<string, unknown>, expected: readonly string[]): void {
  expect(Object.keys(actual).sort()).toEqual([...expected].sort())
}

describe('business enum constants', () => {
  it('keeps status enum maps complete', () => {
    expectSameKeys(ORDER_STATUS_VALUE_ENUM, ['completed', 'processing', 'cancelled'])
    expectSameKeys(PRODUCT_STATUS_DISPLAY, ['available', 'low', 'sold_out'])
    expectSameKeys(TASK_PRIORITY_CLASS, ['high', 'medium', 'low'])
    expectSameKeys(TASK_BOARD_STATUS_DISPLAY, ['done', 'active', 'todo'])
    expectSameKeys(TRANSACTION_LEDGER_STATUS_LABEL, ['pending', 'success', 'failed'])
    expectSameKeys(TRANSACTION_LEDGER_STATUS_CLASS, ['pending', 'success', 'failed'])
    expectSameKeys(ALERT_LEVEL_VALUE_ENUM, ['critical', 'warning', 'info'])
    expectSameKeys(NODE_STATE_VALUE_ENUM, ['online', 'degraded', 'offline'])
  })

  it('keeps option lists aligned with source enums', () => {
    expect(EMPLOYEE_DEPARTMENTS).toEqual(['工程', '设计', '产品', '运营', '市场'])
    expectSameKeys(EMPLOYEE_STATUS_LABELS, EMPLOYEE_WORK_STATUSES)
    expectSameKeys(PRODUCT_CATEGORY_CLASS, PRODUCT_CATEGORIES)
    expect(PRODUCT_CATEGORY_FILTER_OPTIONS.map(option => option.value)).toEqual(PRODUCT_CATEGORIES)

    expectSameKeys(GENDER_BADGE, Object.values(GENDER))
    expect(GENDER_SELECT_OPTIONS.map(option => option.value)).toEqual(Object.values(GENDER))

    expect(USER_STATUS_FORM_OPTIONS.map(option => option.value)).toEqual(
      Object.values(USER_ACCOUNT_STATUS)
    )
  })

  it('uses semantic display classes rather than raw palette classes', () => {
    const classValues = [
      ...Object.values(GENDER_BADGE).map(item => item.cls),
      ...Object.values(PRODUCT_CATEGORY_CLASS),
      ...Object.values(PRODUCT_STATUS_DISPLAY).map(item => item.cls),
      ...Object.values(TASK_PRIORITY_CLASS),
      ...Object.values(TASK_BOARD_STATUS_DISPLAY).map(item => item.cls),
      ...Object.values(TRANSACTION_LEDGER_STATUS_CLASS),
    ]

    for (const cls of classValues) {
      expect(cls).not.toMatch(/\b(?:text|bg)-(?:red|green|blue|gray|slate|orange|purple)-/)
    }
  })
})
