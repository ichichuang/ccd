export interface LoginResponsiveState {
  isMobile: boolean
  isCompact: boolean
  isTablet: boolean
}

export type LoginFieldName = 'username' | 'password'

export interface LoginCharacterState {
  activeField: LoginFieldName | null
  usernameLength: number
  passwordLength: number
  showPassword: boolean
}
