/**
 * 设备/断点同步工具（纯函数，不依赖 Pinia）
 * 供 mount 前逻辑（如 sizeEngine.preload）使用，与 stores/modules/device.ts 判定一致
 */
import {
  type BreakpointKey,
  resolveBreakpointFromWidth,
  resolveDeviceTypeFromInputs,
  resolveOsTypeFromUserAgent,
} from '@ccd/design-tokens'
import type { DeviceType, OsType } from '@/types/systems/device'

/**
 * 根据 UA 与屏幕短边同步计算设备类型（与 device store initHardwareInfo 一致）
 * 使用 screen.width/height（物理屏幕尺寸），与 device.ts:initHardwareInfo 对齐
 */
export function getDeviceTypeSync(): DeviceType {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') return 'PC'
  return resolveDeviceTypeFromInputs({
    userAgent: navigator.userAgent,
    maxTouchPoints: navigator.maxTouchPoints ?? 0,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
  })
}

export function getOsTypeSync(): OsType {
  if (typeof navigator === 'undefined') return 'Unknown'
  return resolveOsTypeFromUserAgent(navigator.userAgent, navigator.maxTouchPoints ?? 0)
}

/**
 * 根据视口宽度同步计算断点（与 device store updateBreakpoint 一致）
 * 使用模块级缓存的排序结果，避免每次调用创建临时数组
 */
export function getBreakpointSync(width?: number): BreakpointKey {
  if (typeof window === 'undefined') return 'xs'
  const w: number = width ?? window.innerWidth
  return resolveBreakpointFromWidth(w)
}
