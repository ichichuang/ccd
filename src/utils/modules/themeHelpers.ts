import { darkThemeOptions, lightThemeOptions } from '@/constants/modules/theme'

export const getThemeOptions: GetThemeOptions = isDark => {
  return isDark ? darkThemeOptions : lightThemeOptions
}

export const getThemeByValue: GetThemeByValue = (value, isDark) => {
  const options = getThemeOptions(isDark)
  return options.find(item => item.value === value)
}

export const getDefaultTheme: GetDefaultTheme = isDark => {
  const options = getThemeOptions(isDark)
  return options[0]
}
