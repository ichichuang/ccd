<script setup lang="tsx">
import type { VxeTableColumn } from '@/components/modules/vxe-table'
import { ref, type ComponentPublicInstance } from 'vue'

// ========================================================================
// 核心修复：使用 ref 回调直接操作 DOM
// 解决了指令跨组件无法解析的问题 (Failed to resolve directive)
// ========================================================================

/**
 * 直接操作 DOM 的工具函数
 * @param el 当前元素 (span)
 * @param options 配置项 { colspan, hidden, styleClass }
 */
const applyMerge = (el: Element | ComponentPublicInstance | null, options: any) => {
  if (!el || !(el instanceof HTMLElement)) {
    return
  }

  const { colspan, hidden, styleClass } = options

  // 向上寻找 PrimeVue 生成的 td 标签
  const td = el.closest('td')
  if (!td) {
    return
  }

  // 1. 隐藏单元格
  if (hidden) {
    td.style.display = 'none'
    return
  }

  // 2. 合并单元格
  if (colspan) {
    td.colSpan = colspan
    td.style.textAlign = 'center'
    td.style.width = 'auto'
  }

  // 3. 应用样式
  if (styleClass) {
    // 清理旧样式
    td.className = td.className.replace(/bg-\S+/g, '')
    styleClass.split(' ').forEach((c: string) => td.classList.add(c))
  }
}

interface OrderRow {
  id: number
  region: string
  customer: string
  category: string
  product: string
  quantity: number
  amount: number
  isSummaryRow?: boolean
}

// ==================== 数据生成 ====================
const createRows = (): OrderRow[] => {
  const rows: OrderRow[] = [
    {
      id: 1,
      region: '华东',
      customer: '上海科技有限公司',
      category: '软件',
      product: '企业管理系统',
      quantity: 3,
      amount: 36000,
    },
    {
      id: 2,
      region: '华东',
      customer: '上海科技有限公司',
      category: '服务',
      product: '实施与培训',
      quantity: 1,
      amount: 8000,
    },
    {
      id: 3,
      region: '华东',
      customer: '杭州创新科技',
      category: '软件',
      product: '数据分析平台',
      quantity: 2,
      amount: 42000,
    },
    {
      id: 4,
      region: '华南',
      customer: '深圳未来科技',
      category: '硬件',
      product: '工业网关设备',
      quantity: 5,
      amount: 55000,
    },
    {
      id: 5,
      region: '华南',
      customer: '广州云端信息',
      category: '服务',
      product: '运维支持服务',
      quantity: 1,
      amount: 12000,
    },
  ]

  const summaryRows: OrderRow[] = []
  const regions = Array.from(new Set(rows.map(row => row.region)))

  regions.forEach(region => {
    const regionRows = rows.filter(row => row.region === region)
    const totalAmount = regionRows.reduce((sum, r) => sum + r.amount, 0)
    const totalQuantity = regionRows.reduce((sum, r) => sum + r.quantity, 0)

    summaryRows.push({
      id: rows.length + summaryRows.length + 1,
      region,
      customer: '大区小计',
      category: '',
      product: '',
      quantity: totalQuantity,
      amount: totalAmount,
      isSummaryRow: true,
    })
  })

  const merged: OrderRow[] = []
  regions.forEach(region => {
    merged.push(
      ...rows.filter(r => r.region === region),
      ...summaryRows.filter(r => r.region === region)
    )
  })

  return merged
}

const tableData = ref<OrderRow[]>(createRows())

// ==================== 列配置 (使用 ref 回调) ====================
const columns: VxeTableColumn<OrderRow>[] = [
  {
    field: 'region',
    header: '大区',
    width: 120,
    sortable: true,
  },
  {
    field: 'customer',
    header: '客户名称',
    width: 220,
    // 【修改 1】使用 ref={(el) => ...} 替代 v-table-merge
    body: (row: OrderRow) => {
      if (row.isSummaryRow) {
        return (
          <span ref={el => applyMerge(el, { colspan: 4, styleClass: 'bg-surface-100 font-bold' })}>
            {row.customer}
          </span>
        )
      }
      return <span>{row.customer}</span>
    },
  },
  {
    field: 'category',
    header: '类别',
    width: 100,
    // 【修改 2】使用 ref 隐藏
    body: (row: OrderRow) => {
      if (row.isSummaryRow) {
        return <span ref={el => applyMerge(el, { hidden: true })}></span>
      }
      return <span>{row.category}</span>
    },
  },
  {
    field: 'product',
    header: '产品 / 汇总',
    width: 160,
    // 【修改 3】使用 ref 隐藏
    body: (row: OrderRow) => {
      if (row.isSummaryRow) {
        return <span ref={el => applyMerge(el, { hidden: true })}></span>
      }
      return <span>{row.product}</span>
    },
  },
  {
    field: 'quantity',
    header: '数量',
    width: 80,
    // 【修改 4】使用 ref 隐藏
    body: (row: OrderRow) => {
      if (row.isSummaryRow) {
        return <span ref={el => applyMerge(el, { hidden: true })}></span>
      }
      return <span>{row.quantity}</span>
    },
  },
  {
    field: 'amount',
    header: '金额（元）',
    width: 120,
    // 【修改 5】使用 ref 添加样式
    body: (row: OrderRow) => {
      if (row.isSummaryRow) {
        return (
          <span
            class="color-accent100 fs-appFontSizes fw-bold"
            ref={el => applyMerge(el, { styleClass: 'bg-surface-100' })}
          >
            ￥{row.amount.toLocaleString()}
          </span>
        )
      }
      return <span>￥{row.amount.toLocaleString()}</span>
    },
  },
]

const expandedRowGroups = ref<any[]>(['华东', '华南'])

const getGroupCount = (region: string): number => {
  return tableData.value.filter(row => row.region === region).length
}
</script>

<template lang="pug">
.between-col.justify-start.gap-gapl
  // 场景 A
  .between-col.justify-start.gap-gaps.c-border-primary.p-padding
    b.fs-appFontSizex VxeTable 行合并示例（Row Span）
    .fs-appFontSizes 通过 rowGroupMode="rowspan" + groupRowsBy，实现按大区自动合并相邻行。

    .h-400
      VxeTable(
        :data='tableData',
        :columns='columns',
        :pagination='false',
        :sortable='true',
        :scrollable='true',
        row-group-mode='rowspan',
        group-rows-by='region',
        sort-field='region',
        :sort-order='1',
        :show-gridlines='true',
        :striped-rows='true'
      )
        template(#header-left='{ data }')
          .between-start.gap-gap
            span.fs-appFontSizes 共 {{ data?.length ?? 0 }} 条记录（含每个大区小计行）
            span.fs-appFontSizes 当前模式: 行分组 = rowspan

  // 场景 B
  .between-col.justify-start.gap-gaps.c-border-primary.p-padding
    b.fs-appFontSizex VxeTable 行分组 + 列合并示例（Subheader + ColSpan）
    .fs-appFontSizes
      | 使用 JSX ref 回调直接操作 DOM，规避 Vue 指令作用域问题。
      | 实现 colspan 和 display:none 的强制覆盖。

    .h-400
      VxeTable(
        :data='tableData',
        :columns='columns',
        :pagination='false',
        :sortable='true',
        :scrollable='true',
        row-group-mode='subheader',
        group-rows-by='region',
        :expandable-row-groups='true',
        v-model:expanded-row-groups='expandedRowGroups',
        sort-field='region',
        :sort-order='1',
        :show-gridlines='true',
        :striped-rows='true'
      )
        template(#groupheader='{ data }')
          .between.w-full.px-2.py-1.bg-surface-100
            span.fs-appFontSizes.font-bold 大区：{{ data.region }}
            span.fs-appFontSizes.color-text2
              | 本组记录数：{{ getGroupCount(data.region) }}

        template(#header-left='{ data }')
          .between-start.gap-gap
            span.fs-appFontSizes 共 {{ data?.length ?? 0 }} 条记录
            span.fs-appFontSizes 当前模式: 行分组 + DOM 操作合并
</template>

<style lang="scss" scoped>
.h-400 {
  height: 400px;
}
</style>
