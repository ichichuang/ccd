import type { Schema, FieldRenderCtx } from '@/components/schema-form'
import { Button } from 'primevue'

export const customSchema: Schema = {
  gap: 24,
  layout: {
    cols: 2,
    labelWidth: 120,
  },
  columns: [
    {
      field: 'customRender',
      label: '自定义渲染',
      component: 'Custom',
      layout: { cols: 2 },
      props: {
        render: (ctx: FieldRenderCtx) => (
          <div class="flex items-center gap-sm component-border rounded-scale p-padding-sm">
            <span>当前值: {(ctx.values.customRender as string) ?? '空'}</span>
            <Button
              label="设置为：Hello"
              size="small"
              onClick={() => ctx.setValue('Hello')}
            />
            <Button
              label="设置为：World"
              size="small"
              severity="secondary"
              onClick={() => ctx.setValue('World')}
            />
          </div>
        ),
      },
      help: '通过 props.render 自定义渲染函数',
    },
    {
      field: 'customComponent',
      label: '复合组件 (示例)',
      component: 'Custom',
      layout: { cols: 2 },
      props: {
        render: (ctx: FieldRenderCtx) => {
          const val = (ctx.values.customComponent as { lat: number; lng: number }) ?? {
            lat: 0,
            lng: 0,
          }
          return (
            <div class="flex gap-sm">
              <div class="flex items-center gap-xs">
                <span>Lat:</span>
                <input
                  type="number"
                  class="component-border rounded-scale px-padding-sm py-padding-xs min-w-[var(--spacing-3xl)]"
                  value={val.lat}
                  onInput={(e: Event) => {
                    const newLat = Number((e.target as HTMLInputElement).value)
                    ctx.setValue({ ...val, lat: newLat })
                  }}
                />
              </div>
              <div class="flex items-center gap-xs">
                <span>Lng:</span>
                <input
                  type="number"
                  class="component-border rounded-scale px-padding-sm py-padding-xs min-w-[var(--spacing-3xl)]"
                  value={val.lng}
                  onInput={(e: Event) => {
                    const newLng = Number((e.target as HTMLInputElement).value)
                    ctx.setValue({ ...val, lng: newLng })
                  }}
                />
              </div>
            </div>
          )
        },
      },
      help: '自定义渲染复合输入控件',
    },
  ],
}
