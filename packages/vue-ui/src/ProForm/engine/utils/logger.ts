export const PRO_FORM_LOGGER = {
  error(msg: string, ...args: unknown[]) {
    console.error(`[ProForm Error]: ${msg}`, ...args)
  },
  warn(msg: string, ...args: unknown[]) {
    console.warn(`[ProForm Warn]: ${msg}`, ...args)
  },
}
