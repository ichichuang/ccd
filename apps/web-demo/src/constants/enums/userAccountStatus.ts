/** 用户账户状态（与示例 API DTO 对齐） */

export const USER_ACCOUNT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const

export type UserAccountStatus = (typeof USER_ACCOUNT_STATUS)[keyof typeof USER_ACCOUNT_STATUS]

export const USER_STATUS_FORM_OPTIONS = [
  { label: '活跃', value: USER_ACCOUNT_STATUS.ACTIVE },
  { label: '未活跃', value: USER_ACCOUNT_STATUS.INACTIVE },
] as const
