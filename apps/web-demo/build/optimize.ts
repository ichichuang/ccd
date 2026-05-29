/**
 * 依赖预构建配置
 * 数据来源：build/optimize.ts（BUILD_SYSTEM.md §1.2）
 * Vite 启动时会将 include 里的模块预编译为 ESM 并缓存到 node_modules/.vite
 *
 * PrimeVue 子路径 SSOT：与 componentMap + SchemaForm wrappers 严格对齐
 * - componentMap: src/components/SchemaForm/components/componentMap.ts
 * - wrappers: WrappedAutoComplete, WrappedColorPicker, WrappedDatePicker 等
 * 精简前必须 grep 确认无引用；禁止删除 componentMap 中使用的子路径
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
  'crypto-es', // AES/SHA/PBKDF2 等子模块较多，预构建减少 dev 模式 ESM 请求数

  // PrimeVue 表单库
  '@primevue/forms',

  // PrimeVue app shell / overlay services
  'primevue/config',
  'primevue/confirmationservice',
  'primevue/dialogservice',
  'primevue/toastservice',
  'primevue/tooltip',
  'primevue/useconfirm',
  'primevue/usetoast',

  // PrimeVue 子路径组件 (SchemaForm componentMap、auto-import 及首屏 E2E 路径使用)
  'primevue/accordion',
  'primevue/accordioncontent',
  'primevue/accordionheader',
  'primevue/accordionpanel',
  'primevue/autocomplete',
  'primevue/avatar',
  'primevue/badge',
  'primevue/breadcrumb',
  'primevue/button',
  'primevue/buttongroup',
  'primevue/card',
  'primevue/cascadeselect',
  'primevue/checkbox',
  'primevue/chip',
  'primevue/column',
  'primevue/colorpicker',
  'primevue/confirmpopup',
  'primevue/datatable',
  'primevue/datepicker',
  'primevue/dialog',
  'primevue/divider',
  'primevue/drawer',
  'primevue/fieldset',
  'primevue/fileupload',
  'primevue/floatlabel',
  'primevue/iconfield',
  'primevue/image',
  'primevue/inlinemessage',
  'primevue/inputicon',
  'primevue/inputgroup',
  'primevue/inputgroupaddon',
  'primevue/inputmask',
  'primevue/inputnumber',
  'primevue/inputtext',
  'primevue/knob',
  'primevue/listbox',
  'primevue/menu',
  'primevue/message',
  'primevue/multiselect',
  'primevue/paginator',
  'primevue/panel',
  'primevue/panelmenu',
  'primevue/password',
  'primevue/popover',
  'primevue/progressbar',
  'primevue/progressspinner',
  'primevue/radiobutton',
  'primevue/radiobuttongroup',
  'primevue/rating',
  'primevue/select',
  'primevue/selectbutton',
  'primevue/skeleton',
  'primevue/slider',
  'primevue/splitbutton',
  'primevue/splitter',
  'primevue/splitterpanel',
  'primevue/step',
  'primevue/steplist',
  'primevue/steppanel',
  'primevue/steppanels',
  'primevue/stepper',
  'primevue/tab',
  'primevue/tablist',
  'primevue/tabpanel',
  'primevue/tabpanels',
  'primevue/tabs',
  'primevue/tag',
  'primevue/textarea',
  'primevue/togglebutton',
  'primevue/toggleswitch',
  'primevue/tieredmenu',
  'primevue/treeselect',
]

/**
 * 在预构建中强制排除的依赖项
 * 通常用于含有 .wasm 文件或使用了非标准 ESM 导出的库
 */
export const exclude = []
