import type { BaseBusinessDTO, UIDesignState } from '@/types/design-state'

/**
 * Mock API DTO for System Metrics
 */
export interface SystemMetricsDTO {
  cpuUsage: number
  memoryLoad: number
  networkTraffic: number
  diskIo: number
  timestamp: string
}

/**
 * Dashboard State Model extending BaseBusinessDTO
 */
export interface DashboardStateModel extends BaseBusinessDTO {
  metrics: SystemMetricsDTO[]
  currentStats: {
    cpu: number
    memory: number
    network: number
    disk: number
  }
}

/**
 * Ultra-premium Dashboard Design State
 */
export const pageState: UIDesignState = {
  intent: 'dashboard',
  context: 'desktop-first',
  archetype: 'A3-stats-grid',
  density: 'comfortable',
  hierarchy: 'data-first',
  emphasis: 'high',
  ctaPolicy: 'minimal',
}
