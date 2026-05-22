import CScrollbar from './CScrollbar.vue'

export * from './utils/types'
export {
  DEFAULT_BACK_TO_TOP_OFFSET_PX,
  DEFAULT_BACK_TO_TOP_THRESHOLD,
  DEFAULT_SCROLLBAR_AUTO_HIDE_DELAY_MS,
  DEFAULT_SCROLLBAR_MEMORY_THROTTLE_MS,
  defaultScrollbarProps,
  resolveScrollbarAutoHide,
} from './utils/constants'
export { scrollbarMemoryProviderKey } from './utils/memory'
export { CScrollbar }

export default CScrollbar
