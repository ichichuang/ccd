/**
 * 设备/断点同步工具（纯函数，不依赖 Pinia）
 * 供 mount 前逻辑（如 sizeEngine.preload）使用，与 stores/modules/device.ts 判定一致
 */
import {
  BREAKPOINTS,
  TABLET_DETECTION_MIN_SHORT_SIDE,
  type BreakpointKey,
} from '@ccd/design-tokens'
import type { DeviceType, OsType } from '@/types/systems/device'

/** 模块级缓存：断点按阈值降序排列，避免每次调用重复排序 */
const SORTED_BREAKPOINTS: [string, number][] = [...Object.entries(BREAKPOINTS)].sort(
  (a, b) => b[1] - a[1]
)

/**
 * 根据 UA 与屏幕短边同步计算设备类型（与 device store initHardwareInfo 一致）
 * 使用 screen.width/height（物理屏幕尺寸），与 device.ts:initHardwareInfo 对齐
 */
export function getDeviceTypeSync(): DeviceType {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') return 'PC'
  const ua: string = navigator.userAgent
  const screenShortSide: number = Math.min(window.screen.width, window.screen.height)

  const isMobileUA: boolean = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)

  // iPadOS 13+ Safari 会将 UA 混淆为 Macintosh 桌面端，需要用多触点能力来兜底识别
  const isMac: boolean = /Macintosh/i.test(ua)
  const isIPadOS: boolean = isMac && navigator.maxTouchPoints > 1

  const isTabletUA: boolean =
    /iPad/i.test(ua) ||
    isIPadOS ||
    (isMobileUA && screenShortSide >= TABLET_DETECTION_MIN_SHORT_SIDE)

  if (isTabletUA) return 'Tablet'
  if (isMobileUA) return 'Mobile'
  return 'PC'
}

export function getOsTypeSync(): OsType {
  if (typeof navigator === 'undefined') return 'Unknown'
  const ua: string = navigator.userAgent
  const isIPadOS: boolean = /Macintosh/i.test(ua) && navigator.maxTouchPoints > 1

  if (/Windows/i.test(ua)) return 'Windows'
  if (/Android/i.test(ua)) return 'Android'
  if (/iPhone|iPad|iPod/i.test(ua) || isIPadOS) return 'iOS'
  if (/Mac OS|Macintosh/i.test(ua)) return 'MacOS'
  if (/Linux/i.test(ua)) return 'Linux'
  return 'Unknown'
}

/**
 * 根据视口宽度同步计算断点（与 device store updateBreakpoint 一致）
 * 使用模块级缓存的排序结果，避免每次调用创建临时数组
 */
export function getBreakpointSync(width?: number): BreakpointKey {
  if (typeof window === 'undefined') return 'xs'
  const w: number = width ?? window.innerWidth
  const match = SORTED_BREAKPOINTS.find(([, val]) => w >= val)
  return (match ? match[0] : 'xs') as BreakpointKey
}
