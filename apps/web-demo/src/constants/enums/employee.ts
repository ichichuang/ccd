/** 员工高级表示例 — 部门与在职状态 */

export const EMPLOYEE_DEPARTMENTS = ['工程', '设计', '产品', '运营', '市场'] as const
export type EmployeeDepartment = (typeof EMPLOYEE_DEPARTMENTS)[number]

export type EmployeeWorkStatus = 'active' | 'inactive' | 'pending'

export const EMPLOYEE_WORK_STATUSES: readonly EmployeeWorkStatus[] = [
  'active',
  'inactive',
  'pending',
]

export const EMPLOYEE_STATUS_LABELS: Record<EmployeeWorkStatus, string> = {
  active: '在职',
  inactive: '离职',
  pending: '待入职',
}
