/**
 * 依赖预构建配置
 * Vite 启动时会将下面 include 里的模块编译成 ESM 格式并缓存到 node_modules/.vite 文件夹
 */
export const include = [
  // 核心框架 (Vite 通常能自动识别，但显式列出可防止某些边缘情况)
  'vue',
  'vue-router',
  'pinia',
  'alova',
  '@vueuse/core',

  // 工具库 (强烈建议保留)
  'dayjs',
  'lodash-es', // 关键：lodash-es 文件极多，预构建能显著减少 dev 请求数
  'yup',

  // 图表库
  'echarts',
  'vue-echarts',

  // PrimeVue 表单库
  '@primevue/forms',

  // PrimeVue 子路径组件 (SchemaForm componentMap 及 wrappers 使用)
  'primevue/autocomplete',
  'primevue/button',
  'primevue/cascadeselect',
  'primevue/checkbox',
  'primevue/colorpicker',
  'primevue/datepicker',
  'primevue/inputgroup',
  'primevue/inputgroupaddon',
  'primevue/inputmask',
  'primevue/inputnumber',
  'primevue/inputtext',
  'primevue/listbox',
  'primevue/multiselect',
  'primevue/password',
  'primevue/progressspinner',
  'primevue/radiobutton',
  'primevue/radiobuttongroup',
  'primevue/rating',
  'primevue/select',
  'primevue/selectbutton',
  'primevue/slider',
  'primevue/textarea',
  'primevue/togglebutton',
  'primevue/toggleswitch',
  'primevue/treeselect',
]

/**
 * 在预构建中强制排除的依赖项
 * 通常用于含有 .wasm 文件或使用了非标准 ESM 导出的库
 */
export const exclude = []
