/**
 * 将驼峰命名转换为中划线命名
 * @param str 字符串
 * @param start 拼接前缀
 * @param end 拼接后缀
 */
export function toKebabCase(str: string, start: string = '', end: string = ''): string {
  return start + `${str.replace(/([A-Z])/g, '-$1').toLowerCase()}` + end
}
