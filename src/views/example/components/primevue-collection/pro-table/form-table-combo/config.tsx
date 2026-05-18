import type { FormSchema } from '@/components/ProForm'
import type { ProTableColumn, ColumnRenderParams } from '@/components/ProTable'
import type { V1UserListItemDTO } from '@/api/example/users'
import {
  GENDER_BADGE,
  GENDER_SELECT_OPTIONS,
  GENDER_SELECT_OPTIONS_BILINGUAL,
  USER_STATUS_FORM_OPTIONS,
} from '@/constants/enums'

const BADGE = 'rounded-sm px-sm py-xs text-xs font-semibold'

/** 顶部检索条：与 GET /api/v1/users 的 `search` / `gender` query 对齐 */
export const searchFormSchema: FormSchema = {
  layout: { type: 'grid', gap: 'var(--spacing-md)' },
  fields: [
    {
      name: 'search',
      component: 'input',
      label: '姓名 / Search',
      span: 6,
      props: { placeholder: '输入关键词…' },
    },
    {
      name: 'gender',
      component: 'select',
      label: '性别 / Gender',
      span: 6,
      props: {
        placeholder: '全部',
        showClear: true,
        options: [...GENDER_SELECT_OPTIONS_BILINGUAL],
      },
    },
  ],
}

/** 新建 / 编辑用户弹窗（仅姓名为必填，其余可选） */
export const userFormSchema: FormSchema = {
  layout: { type: 'grid', gap: 'var(--spacing-md)' },
  fields: [
    {
      name: 'name',
      component: 'input',
      label: '姓名',
      required: true,
      span: 12,
      rules: [
        {
          message: '请输入姓名',
          validator: v => typeof v === 'string' && v.trim().length > 0,
        },
      ],
      props: { placeholder: '姓名' },
    },
    {
      name: 'gender',
      component: 'select',
      label: '性别',
      span: 6,
      options: [...GENDER_SELECT_OPTIONS],
      props: { placeholder: '选择性别', showClear: true },
    },
    {
      name: 'age',
      component: 'number',
      label: '年龄',
      span: 6,
      props: { min: 0, max: 150, showButtons: true },
    },
    {
      name: 'email',
      component: 'input',
      label: '邮箱',
      span: 12,
      props: { placeholder: 'email@example.com' },
    },
    {
      name: 'phone',
      component: 'input',
      label: '电话',
      span: 12,
      props: { placeholder: '手机号或座机' },
    },
  ],
}

/** 用户详情侧栏（只读展示，由 useRecordOverlay.openView/openViewDrawer + ProForm readonly 打开） */
export const userViewFormSchema: FormSchema = {
  layout: { type: 'grid', gap: 'var(--spacing-md)' },
  fields: [
    {
      name: 'id',
      component: 'input',
      label: 'ID',
      span: 6,
      props: { readonly: true },
    },
    {
      name: 'name',
      component: 'input',
      label: '姓名',
      span: 6,
    },
    {
      name: 'gender',
      component: 'select',
      label: '性别',
      span: 6,
      options: [...GENDER_SELECT_OPTIONS],
      props: { placeholder: '—', showClear: false },
    },
    {
      name: 'age',
      component: 'number',
      label: '年龄',
      span: 6,
      props: { min: 0, max: 150, showButtons: false },
    },
    {
      name: 'email',
      component: 'input',
      label: '邮箱',
      span: 12,
    },
    {
      name: 'phone',
      component: 'input',
      label: '电话',
      span: 12,
    },
    {
      name: 'status',
      component: 'select',
      label: '状态',
      span: 12,
      options: [...USER_STATUS_FORM_OPTIONS],
      props: { showClear: false },
    },
    {
      name: 'createdAt',
      component: 'input',
      label: '创建时间',
      span: 12,
      props: { readonly: true },
    },
  ],
}

/**
 * 表格列定义（含末尾操作列）。
 * 操作列的 `render` 在 `TablePanel.vue` 中注入。
 */
export const userColumns: ProTableColumn<V1UserListItemDTO>[] = [
  {
    id: 'id',
    title: 'ID',
    field: 'id',
    width: '64px',
    align: 'right',
    sortable: true,
  },
  {
    id: 'name',
    field: 'name',
    title: '姓名',
    minWidth: '120px',
    sortable: true,
  },
  {
    id: 'age',
    title: '年龄',
    field: 'age',
    minWidth: '88px',
    align: 'right',
    sortable: true,
  },
  {
    id: 'gender',
    title: '性别',
    field: 'gender',
    minWidth: '96px',
    render: ({ row }: ColumnRenderParams<V1UserListItemDTO>) => {
      const genderKey = typeof row.gender === 'string' ? row.gender : ''
      const cfg = GENDER_BADGE[genderKey] ?? {
        label: genderKey || '未知',
        cls: 'bg-muted/60 text-muted-foreground',
      }
      return <span class={`${cfg.cls} ${BADGE}`}>{cfg.label}</span>
    },
  },
  {
    id: 'email',
    title: '邮箱',
    field: 'email',
    minWidth: '200px',
  },
  {
    id: 'phone',
    title: '电话',
    field: 'phone',
    minWidth: '180px',
  },
  {
    id: 'actions',
    title: '操作',
    field: 'actions',
    width: '168px',
    align: 'center',
    pinned: 'right',
    sortable: false,
  },
]
