import type { Schema, EvalCtx, FormValues } from '@/components/SchemaForm'

export const dynamicSchema: Schema = {
  gap: 24,
  layout: {
    cols: 2,
    labelWidth: 140,
  },
  columns: [
    // --- 联动可见性 ---
    {
      field: 'role',
      label: '角色选择',
      component: 'Select',
      props: {
        options: [
          { label: '用户', value: 'user' },
          { label: '管理员', value: 'admin' },
          { label: '其他', value: 'other' },
        ],
        placeholder: '请选择角色',
      },
    },
    {
      field: 'adminCode',
      label: '管理员密钥',
      component: 'Password',
      props: { feedback: false },
      // 依赖 role 字段
      dependsOn: ['role'],
      // 只有当 role === 'admin' 时可见
      visible: (ctx: EvalCtx) => ctx.values.role === 'admin',
      rules: 'required',
      help: '选择“管理员”时显示',
    },
    {
      field: 'otherReason',
      label: '其他原因',
      component: 'InputText',
      dependsOn: ['role'],
      // 只有当 role === 'other' 时可见
      visible: (ctx: EvalCtx) => ctx.values.role === 'other',
      help: '选择“其他”时显示',
    },

    // --- 联动禁用 ---
    {
      field: 'enableEdit',
      label: '启用编辑',
      component: 'ToggleSwitch',
      defaultValue: false,
    },
    {
      field: 'editableField',
      label: '受控字段',
      component: 'InputText',
      dependsOn: ['enableEdit'],
      // 当 enableEdit 为 false 时禁用
      disabled: (ctx: EvalCtx) => !ctx.values.enableEdit,
      placeholder: '打开开关以编辑',
    },

    // --- 联动只读 ---
    {
      field: 'lockStatus',
      label: '锁定状态',
      component: 'Checkbox',
      props: { binary: true, label: '锁定下方输入框' },
    },
    {
      field: 'readonlyField',
      label: '只读字段',
      component: 'InputText',
      defaultValue: '我是只读内容',
      dependsOn: ['lockStatus'],
      // 当 lockStatus 为 true 时只读
      readonly: (ctx: EvalCtx) => !!ctx.values.lockStatus,
    },

    // --- 选项动态加载（模拟） ---
    // 实际场景通常通过 props.options 传入异步函数或 computed，SchemaForm 内部暂未完全接管 options 的响应式更新，
    // 但可以通过 dependsOn 触发重渲染，配合组件自身的动态 props。
    // 这里演示 dependsOn 触发重新计算 props (如果支持) 或组件内部逻辑。
    // SchemaForm v4+ 设计中，props 可以是静态对象。若需动态 options，建议在 Custom 组件中处理，或等待 SchemaForm 增强。
    // 下面演示 visible 控制不同 options 的组件显示（作为一种 workaround）
    {
      field: 'country',
      label: '国家',
      component: 'Select',
      props: {
        options: [
          { label: '中国', value: 'cn' },
          { label: '美国', value: 'us' },
        ],
      },
    },
    {
      field: 'city',
      label: '城市 (CN)',
      component: 'Select',
      dependsOn: ['country'],
      visible: (ctx: EvalCtx) => ctx.values.country === 'cn',
      props: {
        options: [
          { label: '北京', value: 'bj' },
          { label: '上海', value: 'sh' },
        ],
      },
      layout: { cols: 1 },
    },
    {
      field: 'city_us', // 注意：不同字段名，绑定到同一个 form value 需要处理（这里简化为不同字段）
      label: '城市 (US)',
      component: 'Select',
      dependsOn: ['country'],
      visible: (ctx: EvalCtx) => ctx.values.country === 'us',
      props: {
        options: [
          { label: '纽约', value: 'ny' },
          { label: '洛杉矶', value: 'la' },
        ],
      },
      layout: { cols: 1 },
    },
    // 显示控制（Schema 仅支持 visible 函数式，用 visible 表示“有工作”时显示）
    {
      field: 'company',
      label: '公司名称 (依赖 "有工作")',
      component: 'InputText',
      props: { placeholder: 'Where do you work?' },
      visible: (ctx: EvalCtx) => !!ctx.values.hasJob,
      dependsOn: ['hasJob'],
    },
    {
      field: 'role',
      label: '职位 (依赖 "有工作")',
      component: 'InputText',
      visible: (ctx: EvalCtx) => !!ctx.values.hasJob,
      dependsOn: ['hasJob'],
    },

    // 禁用控制
    {
      field: 'editable',
      label: '启用编辑 (控制下方禁用)',
      component: 'Checkbox',
      props: { binary: true },
      defaultValue: true,
    },
    {
      field: 'notes',
      label: '备注 (依赖 "启用编辑")',
      component: 'Textarea',
      disabled: (ctx: EvalCtx) => !ctx.values.editable,
      dependsOn: ['editable'],
    },

    // 计算属性 / 联动值
    // Price / Quantity -> Total
    {
      field: 'price',
      label: '单价',
      component: 'InputNumber',
      defaultValue: 10,
      layout: { span: 4 },
    },
    {
      field: 'quantity',
      label: '数量',
      component: 'InputNumber',
      defaultValue: 2,
      layout: { span: 4 },
    },
    {
      field: 'total',
      label: '总价 (自动计算)',
      component: 'InputNumber',
      layout: { span: 4 },
      readonly: true,
    },

    // 级联加载 (Mock)
    {
      field: 'country',
      label: '国家',
      component: 'Select',
      props: {
        options: [
          { label: '美国', value: 'us' },
          { label: '中国', value: 'cn' },
        ],
      },
      layout: { span: 6 },
    },
    {
      field: 'city',
      label: '城市 (依赖 "国家")',
      component: 'Select',
      layout: { span: 6 },
      dependsOn: ['country'],
      // 动态 options
      props: {
        options: async (values: FormValues) => {
          if (!values.country) return []
          await new Promise(r => setTimeout(r, 500)) // mock api
          if (values.country === 'us') {
            return [
              { label: '纽约', value: 'ny' },
              { label: '旧金山', value: 'sf' },
            ]
          } else if (values.country === 'cn') {
            return [
              { label: '北京', value: 'bj' },
              { label: '上海', value: 'sh' },
            ]
          }
          return []
        },
      },
    },
  ],
}
