import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { createSchemaValidationResolver } from './schemaResolver'

describe('createSchemaValidationResolver', () => {
  it('converts zod DTO validation failures into ProForm field errors', async () => {
    const resolver = createSchemaValidationResolver<Record<string, unknown>>(
      z.object({
        username: z.string(),
        age: z.number(),
      })
    )

    await expect(
      resolver({
        username: 42,
        age: '18',
      })
    ).resolves.toMatchObject({
      valid: false,
      errors: {
        username: expect.arrayContaining([expect.any(String)]),
        age: expect.arrayContaining([expect.any(String)]),
      },
    })
  })

  it('accepts valid DTO values without adding form errors', async () => {
    const resolver = createSchemaValidationResolver<Record<string, unknown>>(
      z.object({
        username: z.string(),
        age: z.number(),
      })
    )

    await expect(
      resolver({
        username: 'alice',
        age: 18,
      })
    ).resolves.toEqual({
      valid: true,
      errors: {},
    })
  })
})
