<script setup lang="ts">
import Column from 'primevue/column'
import ColumnGroup from 'primevue/columngroup'
import DataTable from 'primevue/datatable'
import Row from 'primevue/row'
import { ref } from 'vue'

interface OrderRow {
  id: number
  city: string
  customer: string
  product: string
  amount: number
  date: string
}

const orders = ref<OrderRow[]>([
  { id: 1, city: '上海', customer: '张三', product: '笔记本', amount: 3200, date: '2025/01/02' },
  { id: 2, city: '上海', customer: '张三', product: '键盘', amount: 420, date: '2025/01/03' },
  { id: 3, city: '上海', customer: '李四', product: '显示器', amount: 1600, date: '2025/01/05' },
  { id: 4, city: '北京', customer: '王五', product: '主机', amount: 5200, date: '2025/02/10' },
  { id: 5, city: '北京', customer: '王五', product: '鼠标', amount: 280, date: '2025/02/12' },
  { id: 6, city: '深圳', customer: '赵六', product: '耳机', amount: 680, date: '2025/03/01' },
  { id: 7, city: '深圳', customer: '赵六', product: '扩展坞', amount: 430, date: '2025/03/02' },
])

const fmtCurrency = (val: number) => `¥${val.toLocaleString()}`
</script>

<template lang="pug">
.between-col.gap-gapl
  // 行合并示例（rowspan）
  .c-card.p-paddings.rounded-rounded.between-col.gap-gap
    b.fs-appFontSizex 行合并（按城市分组，rowGroupMode="rowspan"）
    .fs-appFontSizes.color-text2 依托 PrimeVue DataTable 的 rowGroupMode="rowspan" 合并相邻组的单元格
    DataTable.w-full(:value='orders', row-group-mode='rowspan', group-rows-by='city')
      Column(field='city', header='城市', style='min-width: 120px')
      Column(field='customer', header='客户', style='min-width: 140px')
      Column(field='product', header='产品', style='min-width: 140px')
      Column(field='amount', header='金额', style='min-width: 120px')
        template(#body='{ data }')
          span {{ fmtCurrency(data.amount) }}
      Column(field='date', header='日期', style='min-width: 140px')

  // 列合并示例（多级表头）
  .c-card.p-paddings.rounded-rounded.between-col.gap-gap
    b.fs-appFontSizex 列合并（多级表头 ColumnGroup）
    .fs-appFontSizes.color-text2 使用 ColumnGroup/Row 定义表头分组，演示列合并
    DataTable.w-full(:value='orders')
      ColumnGroup(type='header')
        Row
          Column.text-center.font-600(header='订单信息', :colspan='3')
          Column.text-center.font-600(header='客户信息', :colspan='2')
        Row
          Column(field='product', header='产品')
          Column(field='amount', header='金额')
            template(#body='{ data }')
              span {{ fmtCurrency(data.amount) }}
          Column(field='date', header='日期')
          Column(field='customer', header='客户')
          Column(field='city', header='城市')
      ColumnGroup(type='footer')
        Row
          Column(:colspan='5')
            template #footer> span.fs-appFontSizes.color-text2 合计行示例（可放统计结果）

  // 说明
  .c-card-accent.between-col.gap-gap.fs-appFontSizes
    b.fs-appFontSizex 使用说明
    .between-col.gap-gap
      span 行合并：设置 DataTable 的 rowGroupMode="rowspan" 并指定 group-rows-by 字段
      span 列合并：使用 ColumnGroup + Row + colspan 构建多级表头
      span 所有样式均使用 UnoCSS 类，无额外样式块
</template>
