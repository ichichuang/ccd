import type { V1UserListItemDTO } from '@/api/example/users'
import type { ProTableColumn, ColumnRenderParams } from '@/components/ProTable'
import Tag from 'primevue/tag'
import { DateUtils } from '@/utils/date/dateUtils'

const GENDER_PILL = 'rounded-sm px-sm py-xs text-xs font-semibold shrink-0'

export const serverTableColumns: ProTableColumn<V1UserListItemDTO>[] = [
  {
    id: 'id',
    title: 'ID',
    field: 'id',
    width: '80px',
    align: 'right',
    sortable: true,
  },
  {
    id: 'user',
    title: '用户信息',
    field: 'name',
    minWidth: '240px',
    sortable: true,
    render: ({ row }: ColumnRenderParams<V1UserListItemDTO>) => {
      const name = typeof row.name === 'string' ? row.name.trim() : ''
      const email = typeof row.email === 'string' ? row.email.trim() : ''
      const initial = name.length > 0 ? name.charAt(0).toUpperCase() : '?'
      return (
        <div class="row-start items-center gap-sm min-w-0">
          <div class="center shrink-0 rounded-full bg-primary/10 text-primary font-bold text-sm w-[var(--spacing-2xl)] h-[var(--spacing-2xl)]">
            {initial}
          </div>
          <div class="col-stretch min-w-0 gap-xs">
            <span class="text-sm font-medium text-foreground text-ellipsis-1">
              {name.length > 0 ? name : '—'}
            </span>
            <span class="text-xs text-muted-foreground text-ellipsis-1">
              {email.length > 0 ? email : '—'}
            </span>
          </div>
        </div>
      )
    },
  },
  {
    id: 'age',
    title: '年龄',
    field: 'age',
    width: '100px',
    align: 'center',
    sortable: true,
  },
  {
    id: 'gender',
    title: '性别',
    field: 'gender',
    width: '100px',
    align: 'center',
    render: ({ row }: ColumnRenderParams<V1UserListItemDTO>) => {
      const g = row.gender
      const isFemale = g === 'female'
      const label = isFemale ? '女' : g === 'male' ? '男' : String(g ?? '—')
      return (
        <span
          class={
            isFemale
              ? `bg-accent/15 text-accent ${GENDER_PILL}`
              : g === 'male'
                ? `bg-primary/15 text-primary ${GENDER_PILL}`
                : `bg-muted text-muted-foreground ${GENDER_PILL}`
          }
        >
          {label}
        </span>
      )
    },
  },
  {
    id: 'phone',
    title: '联系电话',
    field: 'phone',
    minWidth: '160px',
    render: ({ row }: ColumnRenderParams<V1UserListItemDTO>) => (
      <span class="text-sm text-foreground text-ellipsis-1">
        {typeof row.phone === 'string' && row.phone.trim() ? row.phone : '—'}
      </span>
    ),
  },
  {
    id: 'status',
    title: '状态',
    field: 'status',
    width: '140px',
    align: 'center',
    sortable: true,
    render: ({ row }: ColumnRenderParams<V1UserListItemDTO>) => {
      const active = row.status === 'active'
      return (
        <div class="row-start items-center gap-sm">
          <span
            class={
              active
                ? 'w-2 h-2 rounded-full bg-success shrink-0'
                : 'w-2 h-2 rounded-full bg-muted-foreground shrink-0'
            }
          />
          <Tag
            value={active ? 'active' : 'inactive'}
            severity={active ? 'success' : 'secondary'}
            class="capitalize"
          />
        </div>
      )
    },
  },
  {
    id: 'createdAt',
    title: '创建时间',
    field: 'createdAt',
    minWidth: '180px',
    sortable: true,
    render: ({ row }: ColumnRenderParams<V1UserListItemDTO>) => {
      const raw = typeof row.createdAt === 'string' ? row.createdAt.trim() : ''
      if (!raw) return <span class="text-sm text-muted-foreground">—</span>
      return (
        <span class="text-sm text-muted-foreground">
          {DateUtils.format(raw, 'YYYY-MM-DD HH:mm')}
        </span>
      )
    },
  },
]
