export const buildFunctionalColors = (primaryColor: {
  color: string
  hover: string
  active: string
  disabled: string
  text: string
  border: string
}): FunctionalColor => {
  return {
    primary: {
      color: primaryColor.color,
      hover: primaryColor.hover,
      active: primaryColor.active,
      disabled: primaryColor.disabled,
      text: primaryColor.text,
      border: primaryColor.border,
    },
    secondary: {
      color: '#000000',
      hover: '#000000',
      active: '#000000',
      disabled: '#000000',
      text: '#000000',
      border: '#000000',
    },
    success: {
      color: '#52c41a',
      hover: '#73d13d',
      active: '#389e0d',
      disabled: '#d9d9d9',
      text: '#f6ffed',
      border: '#52c41a',
    },
    info: {
      color: '#1890ff',
      hover: '#40a9ff',
      active: '#096dd9',
      disabled: '#d9d9d9',
      text: '#e6f7ff',
      border: '#1890ff',
    },
    warn: {
      color: '#faad14',
      hover: '#ffc53d',
      active: '#d48806',
      disabled: '#d9d9d9',
      text: '#fffbe6',
      border: '#faad14',
    },
    help: {
      color: '#000000',
      hover: '#000000',
      active: '#000000',
      disabled: '#000000',
      text: '#000000',
      border: '#000000',
    },
    danger: {
      color: '#f5222d',
      hover: '#ff4d4f',
      active: '#cf1322',
      disabled: '#d9d9d9',
      text: '#fff2f0',
      border: '#f5222d',
    },
    contrast: {
      color: '#000000',
      hover: '#000000',
      active: '#000000',
      disabled: '#000000',
      text: '#000000',
      border: '#000000',
    },
  }
}
