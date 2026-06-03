export interface SystemPreferenceThemeState {
  readonly mode: string
  readonly theme: string
  readonly accentColor: string | null
}

export interface SystemPreferenceSizeState {
  readonly size: string
}

export interface SystemPreferenceLayoutState {
  readonly layout: string
  readonly collapsed: boolean
}

export interface SystemPreferences {
  readonly theme: SystemPreferenceThemeState
  readonly size: SystemPreferenceSizeState
  readonly layout: SystemPreferenceLayoutState
  readonly locale?: string
  readonly updatedAt: number
}

export type SystemPreferenceSyncType =
  | 'theme:update'
  | 'size:update'
  | 'layout:update'
  | 'locale:update'
  | 'preferences:update'

export type SystemPreferencePayload = Partial<SystemPreferences> & {
  readonly updatedAt: number
}

export interface SystemPreferenceEnvelope {
  readonly type: SystemPreferenceSyncType
  readonly payload: SystemPreferencePayload
}
