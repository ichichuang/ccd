import type { ProTableColumn, ColumnRenderParams } from '@/components/ProTable'
import type { DummyUserDTO } from '@/api/example/dummy'

const GENDER_CFG: Record<string, { label: string; cls: string }> = {
  male: { label: '男', cls: 'bg-info/15 text-info' },
  female: { label: '女', cls: 'bg-accent/15 text-accent' },
}

const BADGE = 'rounded-sm px-sm py-xs text-xs font-semibold'

export const serverTableColumns: ProTableColumn<DummyUserDTO>[] = [
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
    // field 指向 firstName，ProTable 排序时会发送 sortBy=firstName 给 API
    field: 'firstName',
    title: '用户',
    minWidth: '200px',
    sortable: true,
    render: ({ row }: ColumnRenderParams<DummyUserDTO>) => (
      <div class="row-start items-center gap-sm">
        <img
          src={row.image}
          alt={row.username}
          class="w-[var(--spacing-xl)] h-[var(--spacing-xl)] rounded-full object-cover shrink-0 shadow-sm"
        />
        <div class="col-stretch gap-xs min-w-0">
          <span class="text-sm font-medium text-foreground text-ellipsis-1">
            {row.firstName} {row.lastName}
          </span>
          <span class="text-xs text-muted-foreground">@{row.username}</span>
        </div>
      </div>
    ),
  },
  {
    id: 'age',
    title: '年龄',
    field: 'age',
    width: '80px',
    align: 'right',
    sortable: true,
  },
  {
    id: 'gender',
    title: '性别',
    field: 'gender',
    width: '88px',
    render: ({ row }: ColumnRenderParams<DummyUserDTO>) => {
      const cfg = GENDER_CFG[row.gender] ?? {
        label: row.gender,
        cls: 'bg-muted/60 text-muted-foreground',
      }
      return <span class={`${cfg.cls} ${BADGE}`}>{cfg.label}</span>
    },
  },
  {
    id: 'email',
    title: '邮箱',
    field: 'email',
    minWidth: '210px',
  },
  {
    id: 'phone',
    title: '电话',
    field: 'phone',
    width: '165px',
  },
  {
    id: 'company',
    title: '公司 / 职位',
    minWidth: '180px',
    render: ({ row }: ColumnRenderParams<DummyUserDTO>) => {
      const company = row.company
      return (
        <div class="col-stretch gap-xs min-w-0">
          <span class="text-sm text-ellipsis-1">{company.name}</span>
          <span class="text-xs text-muted-foreground text-ellipsis-1">
            {company.department} · {company.title}
          </span>
        </div>
      )
    },
  },
  {
    id: 'address',
    title: '所在地',
    width: '160px',
    render: ({ row }: ColumnRenderParams<DummyUserDTO>) => {
      const addr = row.address
      return (
        <span class="text-sm text-muted-foreground">
          {addr.city}, {addr.country}
        </span>
      )
    },
  },
]
