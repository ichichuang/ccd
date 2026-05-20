export type LoginLayoutMode =
  | 'desktopLandscape'
  | 'desktopPortrait'
  | 'tabletLandscape'
  | 'tabletPortrait'
  | 'mobile'

export interface LoginResponsiveState {
  mode: LoginLayoutMode
  compactHeight: boolean
  showFullBrand: boolean
  showCompactBrand: boolean
  showBrandSummary: boolean
  showFeatureCards: boolean
  showArchitectureStrip: boolean
  showQuickRoles: boolean
  compactForm: boolean
}
