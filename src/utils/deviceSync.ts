/**
 * 设备/断点同步工具（纯函数，不依赖 Pinia）
 * 供 mount 前逻辑（如 sizeEngine.preload）使用，与 stores/modules/device.ts 判定一致
 */
import { BREAKPOINTS, type BreakpointKey } from '@/constants/breakpoints'
import type { DeviceType } from '@/types/systems/device'

/**
 * 根据 UA 与屏幕短边同步计算设备类型（与 device store detectDeviceInfo 一致）
 */
export function getDeviceTypeSync(): DeviceType {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') return 'PC'
  const ua = navigator.userAgent
  const pageW = window.innerWidth
  const pageH = window.innerHeight
  const screenShortSide = Math.min(pageW, pageH)

  const isMobileUA = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
  const isTabletUA = /iPad/i.test(ua) || (isMobileUA && screenShortSide >= 600)

  if (isTabletUA) return 'Tablet'
  if (isMobileUA) return 'Mobile'
  return 'PC'
}

/**
 * 根据视口宽度同步计算断点（与 device store updateBreakpoint 一致）
 */
export function getBreakpointSync(width?: number): BreakpointKey {
  if (typeof window === 'undefined') return 'xs'
  const w = width ?? window.innerWidth
  const bps = Object.entries(BREAKPOINTS).sort((a, b) => b[1] - a[1])
  const match = bps.find(([, val]) => w >= val)
  return (match ? match[0] : 'xs') as BreakpointKey
}
