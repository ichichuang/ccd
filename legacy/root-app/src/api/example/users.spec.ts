import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ZodType } from 'zod'
import { requestUserCreate, requestUserDelete, requestUserList, requestUserUpdate } from './users'

type MockGet = (url: string, config?: Record<string, unknown>) => Promise<unknown>
type MockMutation = (
  url: string,
  data?: unknown,
  config?: Record<string, unknown>
) => Promise<unknown>

const getMock = vi.fn<MockGet>()
const postMock = vi.fn<MockMutation>()
const putMock = vi.fn<MockMutation>()
const deleteMock = vi.fn<MockMutation>()

vi.mock('@/utils/http/methods', () => ({
  get: (url: string, config?: Record<string, unknown>) => getMock(url, config),
  post: (url: string, data?: unknown, config?: Record<string, unknown>) =>
    postMock(url, data, config),
  put: (url: string, data?: unknown, config?: Record<string, unknown>) =>
    putMock(url, data, config),
  del: (url: string, config?: Record<string, unknown>) => deleteMock(url, undefined, config),
}))

const apiResponse = {
  code: 200,
  message: 'success',
  data: {
    list: [
      {
        id: 1,
        name: 'Test User 1',
        gender: 'female',
        age: 20,
        email: 'user1@example.com',
        phone: '+86 13800138000',
        status: 'inactive' as const,
        createdAt: '2026-05-11T04:40:33.318Z',
      },
    ],
    total: 156,
  },
}

const itemApiResponse = {
  code: 200,
  message: 'success',
  data: apiResponse.data.list[0],
}

describe('requestUserList', () => {
  beforeEach(() => {
    getMock.mockReset()
    postMock.mockReset()
    putMock.mockReset()
    deleteMock.mockReset()
  })

  it('validates the real ApiResponse envelope shape instead of a bare list payload', async () => {
    getMock.mockResolvedValue(apiResponse)

    await requestUserList({ page: 1, limit: 12 })

    const [, config] = getMock.mock.calls[0] ?? []
    const responseSchema = config?.responseSchema as ZodType<unknown>

    expect(responseSchema.safeParse(apiResponse).success).toBe(true)
    expect(responseSchema.safeParse(apiResponse.data).success).toBe(false)
  })

  it('unwraps response.data so ProTable keeps reading list and total at the top level', async () => {
    getMock.mockResolvedValue(apiResponse)

    await expect(requestUserList({ page: 2, limit: 24 })).resolves.toEqual(apiResponse.data)
    expect(getMock).toHaveBeenCalledWith(
      '/api/v1/users',
      expect.objectContaining({
        params: { page: 2, limit: 24 },
      })
    )
  })
})

describe('user mutations', () => {
  beforeEach(() => {
    getMock.mockReset()
    postMock.mockReset()
    putMock.mockReset()
    deleteMock.mockReset()
  })

  it('unwraps create responses from the ApiResponse envelope', async () => {
    postMock.mockResolvedValue(itemApiResponse)

    await expect(
      requestUserCreate({
        name: 'Test User 1',
        gender: 'female',
        age: 20,
      })
    ).resolves.toEqual(itemApiResponse.data)
  })

  it('unwraps update responses from the ApiResponse envelope', async () => {
    putMock.mockResolvedValue(itemApiResponse)

    await expect(
      requestUserUpdate(1, {
        name: 'Test User 1',
      })
    ).resolves.toEqual(itemApiResponse.data)
  })

  it('accepts delete envelopes and normalizes them to void', async () => {
    deleteMock.mockResolvedValue({
      code: 200,
      message: 'success',
      data: null,
    })

    await expect(requestUserDelete(1)).resolves.toBeUndefined()
  })
})
