// src/types/systems/device.d.ts
import type { BreakpointKey } from '@/constants/breakpoints'

export type DeviceType = 'Mobile' | 'Tablet' | 'PC'
export type OsType = 'Windows' | 'MacOS' | 'Android' | 'iOS' | 'Linux' | 'Unknown'
export type Orientation = 'horizontal' | 'vertical'

/**
 * 设备状态接口 (扁平化结构，符合 Pinia 最佳实践)
 *
 * 注意：旧的 DeviceInfo 全局类型已废弃，统一使用 DeviceState
 */
export interface DeviceState {
  // --- 视口信息 (响应式布局核心) ---
  width: number
  height: number
  currentBreakpoint: BreakpointKey // [修正] 明确使用 BreakpointKey 类型

  // --- 物理设备信息 (UA/Screen 核心) ---
  type: DeviceType
  os: OsType
  orientation: Orientation
  pixelRatio: number

  // --- 屏幕几何 ---
  screenWidth: number
  screenHeight: number
  screenShortSide: number // 原 definitely (短边)
  screenLongSide: number

  // --- 移动端预估 ---
  navHeight: number
  tabHeight: number
}

// 保留旧的 DeviceInfo 类型定义以保持向后兼容（但建议迁移到 DeviceState）
declare global {
  /**
   * @deprecated 已废弃，请使用 DeviceState 替代
   * 保留此类型仅用于向后兼容，新代码请使用 useDeviceStore() 的 state
   */
  interface DeviceInfo {
    type: 'PC' | 'Mobile'
    system: string
    screen: {
      orientation: 'horizontal' | 'vertical'
      deviceWidth: number
      deviceHeight: number
      width: number
      height: number
      definitely: number
      navHeight: number
      tabHeight: number
    }
  }
}
