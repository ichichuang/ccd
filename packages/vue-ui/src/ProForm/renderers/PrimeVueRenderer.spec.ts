// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, provide } from 'vue'
import { FormController } from '../engine/core/FormController'
import { FORM_CONTROLLER_KEY } from '../engine/constants'
import type { FieldSchema, FormSchema } from '../engine/types'
import PrimeVueRenderer from './PrimeVueRenderer.vue'

function mountRenderer(field: FieldSchema): ReturnType<typeof mount> {
  const schema: FormSchema = { fields: [field] }
  const controller = new FormController({ schema })
  const hostComponent = defineComponent({
    setup() {
      provide(FORM_CONTROLLER_KEY, controller)
      return () => h(PrimeVueRenderer, { field })
    },
  })

  return mount(hostComponent)
}

describe('PrimeVueRenderer unregistered fields', () => {
  it('fails fast in development instead of falling back to native input', () => {
    expect(() =>
      mountRenderer({
        name: 'unknownField',
        component: 'unknown-widget',
      })
    ).toThrow('Register a PrimeVue renderer or provide a custom field slot.')
  })
})
