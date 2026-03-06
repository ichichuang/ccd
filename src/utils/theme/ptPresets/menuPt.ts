/**
 * 菜单组件全局 PassThrough 配置
 *
 * 集中 tieredmenu / panelmenu 的共享 pt，减少各组件重复。
 * action/link 显式注入 transition-colors + duration-scale-md + ease-out-expo，
 * 与 wrapper/图标/文字同节奏过渡，覆盖 PrimeVue 默认 transition。
 */

const MENU_ACTION_TRANSITION =
  'p-0 bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent border-none outline-none transition-colors! duration-scale-md! ease-out-expo!'

export const menuPt = {
  tieredmenu: {
    root: {
      class: 'border border-border rounded-scale-md shadow-float outline-none',
    },
    menu: {
      class: 'bg-card py-padding-xs rounded-scale-md outline-none',
    },
    menuitem: {
      class: 'rounded-scale-sm outline-none',
    },
    content: {
      class: 'rounded-scale-md outline-none',
    },
    action: {
      class: MENU_ACTION_TRANSITION,
    },
  },
  panelmenu: {
    root: {
      class: 'gap-xs outline-none',
    },
    panel: {
      class: 'outline-none',
    },
    header: {
      class: 'outline-none',
    },
    headerContent: {
      class: 'outline-none',
    },
    content: {
      class: 'py-0 px-0 outline-none',
    },
    menu: {
      class: 'gap-xs p-0 m-0 list-none outline-none',
    },
    menuitem: {
      class: 'outline-none',
    },
  },
} as const
