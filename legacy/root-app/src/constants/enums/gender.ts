/** 性别 — 演示表单 / 表格 */

export const GENDER = {
  MALE: 'male',
  FEMALE: 'female',
} as const

export type Gender = (typeof GENDER)[keyof typeof GENDER]

/** 与 form-table-combo 表格徽章一致；外层可再拼 `BADGE` 圆角类 */
export const GENDER_BADGE: Record<string, { label: string; cls: string }> = {
  [GENDER.MALE]: { label: '男', cls: 'bg-info/15 text-info' },
  [GENDER.FEMALE]: { label: '女', cls: 'bg-accent/15 text-accent' },
}

export const GENDER_SELECT_OPTIONS = [
  { label: '男', value: GENDER.MALE },
  { label: '女', value: GENDER.FEMALE },
] as const

export const GENDER_SELECT_OPTIONS_BILINGUAL = [
  { label: '男 / Male', value: GENDER.MALE },
  { label: '女 / Female', value: GENDER.FEMALE },
] as const
