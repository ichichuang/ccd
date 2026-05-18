import { afterEach, describe, expect, it, vi } from 'vitest'
import { FormController } from './FormController'
import type { FormSchema } from '../types'

afterEach(() => {
  vi.useRealTimers()
})

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

describe('FormController async options', () => {
  it('does not let stale options overwrite the latest dependency state', async () => {
    vi.useFakeTimers()

    let resolveFirst: (value: Array<{ label: string; value: string }>) => void = () => {}
    let resolveSecond: (value: Array<{ label: string; value: string }>) => void = () => {}

    const first = new Promise<Array<{ label: string; value: string }>>(resolve => {
      resolveFirst = resolve
    })
    const second = new Promise<Array<{ label: string; value: string }>>(resolve => {
      resolveSecond = resolve
    })

    const schema: FormSchema = {
      fields: [
        { name: 'country', component: 'InputText', defaultValue: 'A' },
        {
          name: 'city',
          component: 'Select',
          deps: ['country'],
          options: ({ form }) => (form.country === 'A' ? first : second),
        },
      ],
    }

    const controller = new FormController<{ country?: string; city?: string }>({ schema })

    controller.setFieldsValue({ country: 'A' })
    await vi.advanceTimersByTimeAsync(200)
    controller.setFieldsValue({ country: 'B' })
    await vi.advanceTimersByTimeAsync(200)

    resolveSecond([{ label: 'Berlin', value: 'berlin' }])
    await vi.runAllTicks()
    resolveFirst([{ label: 'Athens', value: 'athens' }])
    await vi.runAllTicks()

    expect(controller.store.getFieldState('city')?.loadedOptions).toEqual([
      { label: 'Berlin', value: 'berlin' },
    ])
  })

  it('does not write async options into fields removed by schema update', async () => {
    vi.useFakeTimers()

    let resolveOptions: (value: Array<{ label: string; value: string }>) => void = () => {}
    const pending = new Promise<Array<{ label: string; value: string }>>(resolve => {
      resolveOptions = resolve
    })

    const controller = new FormController<{ country?: string; city?: string }>({
      schema: {
        fields: [
          { name: 'country', component: 'InputText', defaultValue: 'A' },
          {
            name: 'city',
            component: 'Select',
            deps: ['country'],
            options: () => pending,
          },
        ],
      },
    })

    controller.setFieldsValue({ country: 'B' })
    await vi.advanceTimersByTimeAsync(200)

    controller.updateSchema({
      fields: [{ name: 'country', component: 'InputText' }],
    })

    resolveOptions([{ label: 'Ghost', value: 'ghost' }])
    await vi.runAllTicks()

    expect(controller.store.getFieldState('city')).toBeUndefined()
  })
})
