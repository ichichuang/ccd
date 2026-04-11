/** 表单校验 — 正则与演示文案（示例页与 ProForm 演示共用） */

export const REGEX_USERNAME = /^[a-zA-Z0-9_]+$/
export const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const REGEX_HAS_UPPERCASE = /[A-Z]/
export const REGEX_HAS_LOWERCASE = /[a-z]/
export const REGEX_HAS_DIGIT = /[0-9]/

export const validationMessage = {
  username_required: '用户名不能为空',
  username_length: '用户名长度 3-20 字符',
  username_pattern: '只允许字母、数字和下划线',
  email_required: '邮箱不能为空',
  email_invalid: '请输入合法的邮箱地址',
  password_required: '密码不能为空',
  password_min_length: '密码至少 8 位',
  password_complexity: '密码需包含大写字母、小写字母和数字',
  confirm_password_required: '请确认密码',
  password_mismatch: '两次输入的密码不一致',
  email_async_invalid: '请输入合法邮箱',
  email_taken: '该邮箱已注册（模拟 API 检查）',
  username_taken: '该用户名已被占用（模拟 API 检查）',
} as const

/** 异步唯一性演示：视为已注册的用户名 */
export const RESERVED_USERNAMES = ['admin', 'root', 'superuser', 'test'] as const

/** 异步唯一性演示：视为已注册的邮箱 */
export const RESERVED_REGISTERED_EMAILS = ['admin@example.com', 'root@example.com'] as const
