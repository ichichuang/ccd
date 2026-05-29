<script setup lang="ts">
defineOptions({ name: 'ExampleProFormReactionsPage' })

import type { FormSchema, FormState, ProFormExpose, ReactionContext } from '@ccd/vue-ui'

const formRef = ref<ProFormExpose | null>(null)

const waitFor = (ms: number): Promise<void> =>
  new Promise(resolve => {
    const { start, stop } = useTimeoutFn(
      () => {
        stop()
        resolve()
      },
      ms,
      { immediate: false }
    )
    start()
  })

// ── 模拟异步数据源 ──────────────────────────────────────────────────

interface CityOption {
  label: string
  value: string
}

const provincesMap: Record<string, CityOption[]> = {
  guangdong: [
    { label: '广州', value: 'guangzhou' },
    { label: '深圳', value: 'shenzhen' },
    { label: '东莞', value: 'dongguan' },
    { label: '佛山', value: 'foshan' },
  ],
  zhejiang: [
    { label: '杭州', value: 'hangzhou' },
    { label: '宁波', value: 'ningbo' },
    { label: '温州', value: 'wenzhou' },
  ],
  beijing: [
    { label: '东城区', value: 'dongcheng' },
    { label: '西城区', value: 'xicheng' },
    { label: '朝阳区', value: 'chaoyang' },
    { label: '海淀区', value: 'haidian' },
  ],
}

const citiesMap: Record<string, CityOption[]> = {
  guangzhou: [
    { label: '天河区', value: 'tianhe' },
    { label: '越秀区', value: 'yuexiu' },
    { label: '番禺区', value: 'panyu' },
  ],
  shenzhen: [
    { label: '南山区', value: 'nanshan' },
    { label: '福田区', value: 'futian' },
    { label: '宝安区', value: 'baoan' },
  ],
  dongguan: [{ label: '莞城区', value: 'guancheng' }],
  foshan: [{ label: '禅城区', value: 'chancheng' }],
  hangzhou: [
    { label: '西湖区', value: 'xihu' },
    { label: '余杭区', value: 'yuhang' },
  ],
  ningbo: [{ label: '海曙区', value: 'haishu' }],
  wenzhou: [{ label: '鹿城区', value: 'lucheng' }],
  dongcheng: [{ label: '东华门', value: 'donghuamen' }],
  xicheng: [{ label: '金融街', value: 'jinrongjie' }],
  chaoyang: [
    { label: '三里屯', value: 'sanlitun' },
    { label: 'CBD', value: 'cbd' },
  ],
  haidian: [
    { label: '中关村', value: 'zhongguancun' },
    { label: '五道口', value: 'wudaokou' },
  ],
}

// ── Schema 定义 ─────────────────────────────────────────────────────

const schema = reactive<FormSchema>({
  layout: { type: 'grid', gap: 'var(--spacing-md)' },
  fields: [
    // ── Card 1: 省 → 市 → 区 三级联动（声明式 Reactions） ──
    {
      type: 'card',
      name: 'group_cascade',
      label: '1. 省 / 市 / 区 三级联动 — reactions: clearValue + 异步 options',
      layout: { type: 'grid', gap: 'var(--spacing-md)' },
      children: [
        {
          name: 'province',
          component: 'select',
          label: '省份',
          required: true,
          span: { xs: 12, sm: 4 },
          props: {
            placeholder: '请选择省份',
            options: [
              { label: '广东省', value: 'guangdong' },
              { label: '浙江省', value: 'zhejiang' },
              { label: '北京市', value: 'beijing' },
            ],
          },
        },
        {
          name: 'city',
          component: 'select',
          label: '城市',
          deps: ['province'],
          span: { xs: 12, sm: 4 },
          reactions: [
            {
              watch: 'province',
              action: 'clearValue',
            },
            {
              watch: 'province',
              action: 'custom',
              effect: (ctx: ReactionContext) => {
                const province = ctx.form.province as string | undefined
                ctx.setFieldProps('city', {
                  placeholder: province ? '加载中...' : '请先选择省份',
                })
              },
            },
          ],
          disabledIf: (ctx: { form: Record<string, unknown> }) => !ctx.form.province,
          options: async (ctx: {
            form: Record<string, unknown>
          }): Promise<{ label: string; value: string }[]> => {
            const province = ctx.form.province as string | undefined
            if (!province) return []
            await waitFor(400)
            return provincesMap[province] ?? []
          },
          props: { placeholder: '请先选择省份' },
        },
        {
          name: 'district',
          component: 'select',
          label: '区县',
          deps: ['city'],
          span: { xs: 12, sm: 4 },
          reactions: [
            {
              watch: 'city',
              action: 'clearValue',
            },
            {
              watch: 'city',
              action: 'custom',
              effect: (ctx: ReactionContext) => {
                const city = ctx.form.city as string | undefined
                ctx.setFieldProps('district', {
                  placeholder: city ? '加载中...' : '请先选择城市',
                })
              },
            },
          ],
          disabledIf: (ctx: { form: Record<string, unknown> }) => !ctx.form.city,
          options: async (ctx: {
            form: Record<string, unknown>
          }): Promise<{ label: string; value: string }[]> => {
            const city = ctx.form.city as string | undefined
            if (!city) return []
            await waitFor(300)
            return citiesMap[city] ?? []
          },
          props: { placeholder: '请先选择城市' },
        },
      ],
    },

    // ── Card 2: hide / show / disable / enable 内置 Actions ──
    {
      type: 'card',
      name: 'group_actions',
      label: '2. 内置动作演示 — hide / show / disable / enable',
      layout: { type: 'grid', gap: 'var(--spacing-md)' },
      children: [
        {
          name: 'deliveryMethod',
          component: 'select',
          label: '配送方式',
          required: true,
          span: { xs: 12, sm: 6 },
          props: {
            placeholder: '请选择配送方式',
            options: [
              { label: '快递配送', value: 'express' },
              { label: '到店自提', value: 'pickup' },
              { label: '无需配送 (虚拟商品)', value: 'none' },
            ],
          },
        },
        {
          name: 'address',
          component: 'input',
          label: '收货地址',
          deps: ['deliveryMethod'],
          span: { xs: 12, sm: 6 },
          reactions: [
            {
              watch: 'deliveryMethod',
              action: 'custom',
              effect: (ctx: ReactionContext) => {
                const method = ctx.form.deliveryMethod as string | undefined
                if (method === 'none') {
                  // 虚拟商品：隐藏地址并清空
                  const state = ctx.getFieldState('address')
                  if (state) {
                    ctx.setFieldValue('address', undefined)
                  }
                }
              },
            },
          ],
          visibleIf: (ctx: { form: Record<string, unknown> }) => ctx.form.deliveryMethod !== 'none',
          disabledIf: (ctx: { form: Record<string, unknown> }) =>
            ctx.form.deliveryMethod === 'pickup',
          props: { placeholder: '请输入收货地址（到店自提时自动禁用）' },
        },
        {
          name: 'pickupStore',
          component: 'select',
          label: '自提门店',
          deps: ['deliveryMethod'],
          span: { xs: 12, sm: 6 },
          reactions: [
            {
              watch: 'deliveryMethod',
              action: 'clearValue',
            },
          ],
          visibleIf: (ctx: { form: Record<string, unknown> }) =>
            ctx.form.deliveryMethod === 'pickup',
          props: {
            placeholder: '请选择门店',
            options: [
              { label: '中关村旗舰店', value: 'store_zgc' },
              { label: '望京 SOHO 店', value: 'store_wj' },
              { label: '国贸店', value: 'store_gm' },
            ],
          },
        },
        {
          name: 'shippingNote',
          component: 'textarea',
          label: '配送备注',
          deps: ['deliveryMethod'],
          span: { xs: 12, sm: 6 },
          reactions: [
            {
              watch: 'deliveryMethod',
              action: 'custom',
              effect: (ctx: ReactionContext) => {
                const method = ctx.form.deliveryMethod as string
                const placeholders: Record<string, string> = {
                  express: '可填写配送时间偏好、放置位置等',
                  pickup: '可填写预计到店时间',
                  none: '无需填写',
                }
                ctx.setFieldProps('shippingNote', {
                  placeholder: placeholders[method] ?? '请输入备注',
                })
              },
            },
          ],
          disabledIf: (ctx: { form: Record<string, unknown> }) =>
            ctx.form.deliveryMethod === 'none',
          props: { placeholder: '请先选择配送方式', rows: 2 },
        },
      ],
    },

    // ── Card 3: 组合型 Reaction — computed + clearValue + setFieldProps ──
    {
      type: 'card',
      name: 'group_combo',
      label: '3. 组合型联动 — 价格计算 + 折扣条件',
      layout: { type: 'grid', gap: 'var(--spacing-md)' },
      children: [
        {
          name: 'productType',
          component: 'select',
          label: '商品类型',
          required: true,
          span: { xs: 12, sm: 4 },
          props: {
            placeholder: '请选择商品类型',
            options: [
              { label: '标准商品', value: 'standard' },
              { label: '定制商品', value: 'custom' },
              { label: '数字内容', value: 'digital' },
            ],
          },
        },
        {
          name: 'quantity',
          component: 'number',
          label: '购买数量',
          span: { xs: 12, sm: 4 },
          props: { min: 1, max: 999, showButtons: true, placeholder: '1 - 999' },
          defaultValue: 1,
        },
        {
          name: 'unitPrice',
          component: 'number',
          label: '单价 (CNY)',
          deps: ['productType'],
          span: { xs: 12, sm: 4 },
          reactions: [
            {
              watch: 'productType',
              action: 'custom',
              effect: (ctx: ReactionContext) => {
                const type = ctx.form.productType as string | undefined
                const prices: Record<string, number> = {
                  standard: 99,
                  custom: 299,
                  digital: 49,
                }
                if (type && prices[type] !== undefined) {
                  ctx.setFieldValue('unitPrice', prices[type])
                }
              },
            },
          ],
          props: { mode: 'currency', currency: 'CNY', locale: 'zh-CN' },
        },
        {
          name: 'totalPrice',
          component: 'number',
          label: '总价 (CNY)',
          deps: ['quantity', 'unitPrice'],
          disabledIf: () => true,
          computed: (ctx: { form: Record<string, unknown> }) => {
            const qty = Number(ctx.form.quantity) || 0
            const price = Number(ctx.form.unitPrice) || 0
            return qty * price
          },
          description: '自动计算：数量 x 单价',
          span: { xs: 12, sm: 6 },
          props: { mode: 'currency', currency: 'CNY', locale: 'zh-CN' },
        },
        {
          name: 'discountCode',
          component: 'input',
          label: '优惠码',
          deps: ['totalPrice'],
          span: { xs: 12, sm: 6 },
          reactions: [
            {
              watch: 'totalPrice',
              action: 'custom',
              effect: (ctx: ReactionContext) => {
                const total = Number(ctx.form.totalPrice) || 0
                ctx.setFieldProps('discountCode', {
                  placeholder:
                    total >= 500
                      ? '满 500 可用优惠码，请输入'
                      : `还差 ¥${500 - total} 可使用优惠码`,
                })
              },
            },
          ],
          disabledIf: (ctx: { form: Record<string, unknown> }) => {
            const total = Number(ctx.form.totalPrice) || 0
            return total < 500
          },
          props: { placeholder: '请先凑够 ¥500' },
        },
      ],
    },
  ],
})

const formState = computed<FormState<Record<string, unknown>>>(() => {
  return (
    formRef.value?.getFormState() ?? {
      values: {},
      errors: {},
      touched: {},
      dirty: false,
      valid: true,
      submitting: false,
    }
  )
})

const valuesJson = computed<string>(() => {
  return JSON.stringify(formState.value.values, null, 2)
})

async function onSubmit(values: Record<string, unknown>): Promise<void> {
  console.log('ProForm Reactions Submit Values:', values)
  window.$toast?.successIn('top-right', '提交成功', '已在控制台输出序列化后的 values')
}
</script>

<template>
  <div
    data-archetype="A1-toolbar-content"
    class="flex flex-col"
  >
    <header class="shrink-0 glass-panel col-stretch gap-md min-w-0">
      <div class="row-between gap-md min-w-0">
        <div class="row-start gap-sm min-w-0 flex-wrap">
          <div class="glass-icon-box shrink-0">
            <Icons
              name="i-lucide-link"
              size="xl"
              class="text-primary"
            />
          </div>
          <div class="col-stretch gap-xs min-w-0">
            <div class="row-start gap-xs min-w-0 flex-wrap">
              <span class="text-lg font-bold text-foreground text-no-wrap">
                ProForm Reactions 声明式联动
              </span>
              <span class="surface-success rounded-md px-sm py-xs text-xs font-semibold uppercase">
                PRO-FORM
              </span>
            </div>
            <span class="text-sm text-muted-foreground text-ellipsis-1">
              通过 reactions API 实现跨字段声明式联动：clearValue 自动清空、hide/show
              显隐切换、disable/enable 禁用切换、custom 自定义 effect。无需手写 computed 副作用。
            </span>
          </div>
        </div>
      </div>
    </header>

    <div class="flex-1 min-h-0">
      <div class="row-start items-start gap-lg layout-full min-h-0">
        <div class="flex-1 min-w-0 h-full">
          <CScrollbar class="layout-full">
            <div class="layout-container py-md col-stretch gap-xl pb-xl">
              <section class="material-elevated col-stretch gap-lg">
                <div class="row-center gap-sm pb-sm mb-sm">
                  <Icons
                    name="i-lucide-link"
                    class="text-primary"
                  />
                  <div class="col-stretch gap-xs">
                    <span class="text-md font-semibold text-foreground uppercase tracking-tight">
                      声明式联动引擎演示
                    </span>
                    <span class="text-xs text-muted-foreground">
                      三级联动（省/市/区）、配送方式驱动显隐/禁用、组合计算+条件解锁。
                    </span>
                  </div>
                </div>

                <ProForm
                  ref="formRef"
                  :schema="schema"
                  validate-on="change"
                  @submit="onSubmit"
                >
                  <template #footer="{ formState: slotFormState, submit }">
                    <div class="row-end gap-sm pt-md border-border/15 mt-md">
                      <Button
                        label="提交订单"
                        icon="i-lucide-check"
                        :loading="slotFormState.submitting"
                        @click="submit"
                      />
                    </div>
                  </template>
                </ProForm>
              </section>

              <!-- Mobile debug panel -->
              <section class="material-elevated col-stretch gap-lg xl:hidden">
                <div class="row-center gap-sm mb-sm">
                  <Icons
                    name="i-lucide-database"
                    class="text-primary"
                  />
                  <span class="text-sm font-semibold text-foreground uppercase">实时 Values</span>
                </div>
                <div
                  class="bg-muted rounded-md p-md border-default border-border/40 text-muted-foreground"
                >
                  <pre class="code-preview">{{ valuesJson }}</pre>
                </div>
              </section>
            </div>
          </CScrollbar>
        </div>

        <div
          class="hidden xl:block layout-sidepanel shrink-0 h-full border-l-default border-border/20"
        >
          <div class="layout-full col-stretch">
            <div class="shrink-0 px-md py-sm border-border/20 row-center gap-sm">
              <Icons
                name="i-lucide-braces"
                size="sm"
                class="text-accent"
              />
              <span class="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Calculated Form State
              </span>
            </div>
            <CScrollbar class="flex-1 min-h-0 bg-muted px-md py-sm">
              <pre class="code-preview text-muted-foreground leading-relaxed">{{ valuesJson }}</pre>
            </CScrollbar>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
