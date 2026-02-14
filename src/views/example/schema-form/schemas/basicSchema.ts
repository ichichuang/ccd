import type { Schema } from '@/components/schema-form'

export const basicSchema: Schema = {
  gap: 24,
  layout: {
    cols: 2,
    labelWidth: 120,
  },
  columns: [
    // --- 文本类 ---
    {
      field: 'text',
      label: 'InputText',
      component: 'InputText',
      props: { placeholder: '请输入文本' },
    },
    {
      field: 'password',
      label: 'Password',
      component: 'Password',
      props: { feedback: false, toggleMask: true },
    },
    {
      field: 'textarea',
      label: 'Textarea',
      component: 'Textarea',
      props: { rows: 3, autoResize: true },
      layout: { cols: 2 },
    },
    {
      field: 'mask',
      label: 'InputMask',
      component: 'InputMask',
      props: { mask: '99-999999', slotChar: '-', placeholder: '99-999999' },
    },

    // --- 数字类 ---
    {
      field: 'number',
      label: 'InputNumber',
      component: 'InputNumber',
      props: { showButtons: true, min: 0, max: 100 },
    },
    {
      field: 'slider',
      label: 'Slider',
      component: 'Slider',
      props: { min: 0, max: 100, step: 10 },
      // Slider 通常需要占满一行或者配合 Grid 使用，这里简单演示
    },
    {
      field: 'rating',
      label: 'Rating',
      component: 'Rating',
      props: { stars: 5, cancel: false },
    },

    // --- 选择类（单选）---
    {
      field: 'select',
      label: '选择器',
      component: 'Select',
      props: {
        options: [
          { label: '选项 A', value: 'a' },
          { label: '选项 B', value: 'b' },
          { label: '选项 C', value: 'c' },
        ],
        placeholder: '请选择',
      },
    },
    {
      field: 'radio',
      label: '单选按钮',
      component: 'RadioButton',
      props: {
        options: [
          { label: '是', value: true },
          { label: '否', value: false },
        ],
      },
    },
    {
      field: 'selectButton',
      label: '选择按钮',
      component: 'SelectButton',
      props: {
        options: [
          { label: '左', value: 'left' },
          { label: '中', value: 'center' },
          { label: '右', value: 'right' },
        ],
      },
    },

    // --- 选择类（多选）---
    {
      field: 'multiselect',
      label: '多选器',
      component: 'MultiSelect',
      props: {
        options: [
          { label: '北京', value: 'beijing' },
          { label: '上海', value: 'shanghai' },
          { label: '广州', value: 'guangzhou' },
        ],
        placeholder: '请选择城市',
        display: 'chip',
      },
      layout: { cols: 2 },
    },
    {
      field: 'listbox',
      label: '列表框',
      component: 'Listbox',
      props: {
        options: [
          { label: '项目 1', value: 1 },
          { label: '项目 2', value: 2 },
          { label: '项目 3', value: 3 },
        ],
        multiple: true,
        style: { width: '100%' },
      },
    },

    // --- 级联/树 ---
    {
      field: 'cascade',
      label: '级联选择',
      component: 'CascadeSelect',
      props: {
        options: [
          {
            name: '澳大利亚',
            code: 'AU',
            states: [
              {
                name: '新南威尔士',
                cities: [
                  { cname: '悉尼', code: 'A-SY' },
                  { cname: '纽卡斯尔', code: 'A-NE' },
                ],
              },
              {
                name: '昆士兰',
                cities: [
                  { cname: '布里斯班', code: 'A-BR' },
                  { cname: '汤斯维尔', code: 'A-TO' },
                ],
              },
            ],
          },
        ],
        optionLabel: 'cname',
        optionGroupLabel: 'name',
        optionGroupChildren: ['states', 'cities'],
        placeholder: '选择城市',
      },
    },
    {
      field: 'treeSelect',
      label: '树形选择',
      component: 'TreeSelect',
      props: {
        options: [
          {
            key: '0',
            label: '文档',
            data: '文档文件夹',
            children: [
              {
                key: '0-0',
                label: '工作',
                data: '工作文件夹',
                children: [
                  {
                    key: '0-0-0',
                    label: '费用.doc',
                    icon: 'pi pi-fw pi-file',
                    data: '费用文档',
                  },
                  {
                    key: '0-0-1',
                    label: '简历.doc',
                    icon: 'pi pi-fw pi-file',
                    data: '简历文档',
                  },
                ],
              },
            ],
          },
        ],
        placeholder: '选择文件',
      },
    },

    // --- 自动完成 ---
    {
      field: 'autocomplete',
      label: '自动完成',
      component: 'AutoComplete',
      props: {
        suggestions: ['苹果', '香蕉', '樱桃', '日期', '接骨木'], // Mock simple suggestions
        dropdown: true,
        placeholder: '输入并搜索',
      },
    },

    // --- 开关类 ---
    {
      field: 'checkbox',
      label: '复选框',
      component: 'Checkbox',
      props: { binary: true, label: '我接受条款' },
    },
    {
      field: 'switch',
      label: '开关',
      component: 'ToggleSwitch',
    },
    {
      field: 'toggleButton',
      label: '切换按钮',
      component: 'ToggleButton',
      props: { onLabel: '开', offLabel: '关', onIcon: 'pi pi-check', offIcon: 'pi pi-times' },
    },

    // --- 日期/颜色 ---
    {
      field: 'date',
      label: '日期选择器',
      component: 'DatePicker',
      props: { showIcon: true, showButtonBar: true },
    },
    {
      field: 'color',
      label: '颜色选择器',
      component: 'ColorPicker',
    },

    // --- 组合 ---
    {
      field: 'inputGroup',
      label: '输入组',
      // InputGroup
      component: 'InputGroup',
      props: {
        // InputGroup 通常作为 Wrapper，这里假设它应该包裹 InputText 之类的。
        // 但由于 componentMap 中 InputGroup 是 WrappedInputGroup.vue，
        // 我们需要确认 WrappedInputGroup 是否支持通过 props 传递 children 或 schema。
        // 暂时先解除 hidden，观察效果。 如果 componentMap 中 InputGroup 确实存在。
        // 根据 componentMap, InputGroup -> WrappedInputGroup.vue
        placeholder: '输入组测试',
      },
      // hidden: true, // Unhide to test
    },

    // --- 自定义 ---
    // Custom 组件通常需要 render 函数或 slot，在 JSON schema 中不便展示，将在 Custom 示例中单独展示
  ],
}
