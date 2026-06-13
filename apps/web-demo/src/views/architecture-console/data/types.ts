export type ConsoleSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary'

export interface ConsoleStatusItem {
  key: string
  value?: string
  severity: ConsoleSeverity
}

export interface ConsoleStat {
  key: string
  value?: string
  icon: string
}

export interface ConsoleCapability {
  key: string
  icon: string
  bulletCount: number
  sourcePaths?: string[]
}

export interface ConsoleEvidence {
  key: string
  value: string
  sourcePaths?: string[]
}

export interface ConsoleCommand {
  key: string
  command: string
}

export interface ConsolePageModel {
  id: string
  key: string
  status: ConsoleStatusItem[]
  stats: ConsoleStat[]
  capabilities: ConsoleCapability[]
  evidence: ConsoleEvidence[]
  commands: ConsoleCommand[]
}

export interface DashboardCard {
  key: string
  valueKey: string
  icon: string
  severity: Extract<ConsoleSeverity, 'success' | 'info' | 'warn' | 'danger'>
}

export interface DashboardEvidence {
  key: string
  path: string
  icon: string
}

export const baseStatus: ConsoleStatusItem[] = [
  { key: 'topology', value: 'contracts -> core -> apps', severity: 'success' },
  { key: 'runtimeAdapters', severity: 'info' },
  { key: 'p4Guarded', severity: 'warn' },
]

export const packageStats: ConsoleStat[] = [
  { key: 'publicPackages', value: '10', icon: 'i-lucide-package-check' },
  { key: 'apps', value: '2', icon: 'i-lucide-panels-top-left' },
  { key: 'validationGate', value: '1', icon: 'i-lucide-shield-check' },
]
