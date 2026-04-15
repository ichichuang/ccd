import { describe, expect, it } from 'vitest'
import { FormController } from './FormController'
import type { FormSchema } from '../types'

describe('FormController.updateSchema', () => {
  it('rebuilds field registry and validation engine after schema changes', async () => {
    const initialSchema: FormSchema = {
      fields: [
        {
          name: 'foo',
          component: 'InputText',
        },
      ],
    }

    const nextSchema: FormSchema = {
      fields: [
        {
          name: 'bar',
          component: 'InputText',
          defaultValue: 'next',
          rules: [
            {
              message: 'bar must be ok',
              validator: value => value === 'ok',
            },
          ],
        },
      ],
    }

    const controller = new FormController<{ foo?: string; bar?: string }>({
      schema: initialSchema,
    })

    controller.updateSchema(nextSchema)

    expect(controller.getValues()).toEqual({ bar: 'next' })
    expect(controller.store.getFieldState('foo')).toBeUndefined()

    await expect(controller.validateField('bar')).resolves.toBe(false)
    expect(controller.store.getFieldState('bar')?.errors).toEqual(['bar must be ok'])
  })

  it('preserves retained field values and applies updated submit transforms', () => {
    const initialSchema: FormSchema = {
      fields: [
        {
          name: 'foo',
          component: 'InputText',
          defaultValue: 'initial',
        },
      ],
    }

    const nextSchema: FormSchema = {
      fields: [
        {
          name: 'foo',
          component: 'InputText',
          transform: value => `schema:${String(value ?? '')}`,
        },
        {
          name: 'bar',
          component: 'InputText',
          defaultValue: 'added',
        },
      ],
    }

    const controller = new FormController<{ foo?: string; bar?: string }>({
      schema: initialSchema,
    })

    controller.setFieldsValue({ foo: 'keep' })
    controller.updateSchema(nextSchema)

    expect(controller.getValues()).toEqual({
      foo: 'keep',
      bar: 'added',
    })
    expect(controller.store.getFieldState('foo')?.dirty).toBe(true)
    expect(controller.getSubmitValues()).toEqual({
      foo: 'schema:keep',
      bar: 'added',
    })
  })
})
