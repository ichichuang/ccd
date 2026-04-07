/**
 * 菜单组件全局 PassThrough 配置
 *
 * 集中 tieredmenu / panelmenu 的共享 pt，减少各组件重复。
 * action/link 显式注入 transition-colors + duration-md + ease-out-expo，
 * 与 wrapper/图标/文字同节奏过渡，覆盖 PrimeVue 默认 transition。
 */

import { OPTION_TRANSITION_CLASS, OVERLAY_GLASS_COMPACT_CLASS } from './formControlsPt'

const MENU_ACTION_BASE =
  'bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent border-none outline-none'

export const menuPt = {
  tieredmenu: {
    root: {
      class: `${OVERLAY_GLASS_COMPACT_CLASS} shadow-sm dark:shadow-md rounded-md shadow-md dark:shadow-lg outline-none`,
    },
    menu: {
      class: 'bg-transparent rounded-md outline-none',
    },
    menuitem: {
      class: 'rounded-sm outline-none',
    },
    content: {
      class: 'rounded-md outline-none',
    },
    itemContent: {
      class: `${MENU_ACTION_BASE} ${OPTION_TRANSITION_CLASS}`,
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
      class: 'outline-none',
    },
    menu: {
      class: 'gap-xs m-0 list-none outline-none',
    },
    menuitem: {
      class: 'outline-none',
    },
  },
  menu: {
    root: {
      class: OVERLAY_GLASS_COMPACT_CLASS,
    },
    list: {
      class: 'bg-transparent',
    },
    itemContent: {
      class: `${MENU_ACTION_BASE} ${OPTION_TRANSITION_CLASS}`,
    },
  },
  contextmenu: {
    itemContent: {
      class: `${MENU_ACTION_BASE} ${OPTION_TRANSITION_CLASS}`,
    },
  },
} as const
