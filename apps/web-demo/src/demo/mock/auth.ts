import { parseZodHttpPayload } from '@/adapters/http.adapter'
import {
  loginParamsSchema,
  loginResultSchema,
  userInfoSchema,
  type LoginParams,
  type LoginResult,
  type UserInfo,
} from '@/types/dto/auth.dto'
import { ErrorType, HttpRequestError } from '@/utils/http/errors'

export const DEMO_AUTH_ERROR_CODES = {
  invalidCredentials: 'DEMO_AUTH_INVALID_CREDENTIALS',
  unknownUser: 'DEMO_AUTH_UNKNOWN_USER',
  tokenMissing: 'DEMO_AUTH_TOKEN_MISSING',
  tokenInvalid: 'DEMO_AUTH_TOKEN_INVALID',
} as const

export type DemoAuthErrorCode =
  (typeof DEMO_AUTH_ERROR_CODES)[keyof typeof DEMO_AUTH_ERROR_CODES]

class DemoAuthError extends HttpRequestError {
  constructor(
    public readonly demoCode: DemoAuthErrorCode,
    message: string
  ) {
    super(message, ErrorType.AUTH, 401, 'Unauthorized', { demoCode }, false)
    this.name = 'DemoAuthError'
  }
}

interface DemoUserRecord {
  userId: string
  password: string
  roles: string[]
  permissions: string[]
}

const DEMO_USERS: Record<string, DemoUserRecord> = {
  admin: {
    userId: '1',
    password: '123456',
    roles: ['admin'],
    permissions: ['*:*:*'],
  },
  user: {
    userId: '2',
    password: '123456',
    roles: ['user'],
    permissions: ['example:architecture:read'],
  },
}

const DEMO_TOKEN_PREFIX = 'ccd-demo-token-'

function toDemoUserInfo(username: string, record: DemoUserRecord): UserInfo {
  return parseZodHttpPayload(userInfoSchema, {
    userId: record.userId,
    username,
    roles: record.roles,
    permissions: record.permissions,
  })
}

export function requestDemoAuthLogin(payload: LoginParams): Promise<LoginResult> {
  const credentials = parseZodHttpPayload(loginParamsSchema, payload)
  const record = DEMO_USERS[credentials.username]

  if (!record) {
    throw new DemoAuthError(
      DEMO_AUTH_ERROR_CODES.unknownUser,
      `Unsupported demo account: ${credentials.username}`
    )
  }
  if (credentials.password !== record.password) {
    throw new DemoAuthError(
      DEMO_AUTH_ERROR_CODES.invalidCredentials,
      'Invalid demo credentials'
    )
  }

  return Promise.resolve(
    parseZodHttpPayload(loginResultSchema, {
      token: `${DEMO_TOKEN_PREFIX}${record.userId}`,
      userInfo: toDemoUserInfo(credentials.username, record),
    })
  )
}

export function requestDemoAuthCurrentUser(token: string): Promise<UserInfo> {
  if (!token) {
    throw new DemoAuthError(DEMO_AUTH_ERROR_CODES.tokenMissing, 'No demo token provided')
  }
  if (!token.startsWith(DEMO_TOKEN_PREFIX)) {
    throw new DemoAuthError(DEMO_AUTH_ERROR_CODES.tokenInvalid, 'Invalid demo token format')
  }

  const userId = token.slice(DEMO_TOKEN_PREFIX.length)
  const entry = Object.entries(DEMO_USERS).find(([, record]) => record.userId === userId)
  if (!entry) {
    throw new DemoAuthError(DEMO_AUTH_ERROR_CODES.tokenInvalid, 'Unknown demo token user')
  }

  const [username, record] = entry
  return Promise.resolve(toDemoUserInfo(username, record))
}
