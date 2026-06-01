// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import type { ComponentCustomProperties } from 'vue'
import { describe, expect, it } from 'vitest'
import { CcdInputText, CcdTag } from './index'

const primeVueGlobalProperties = {
  $primevue: { config: {} },
} as unknown as ComponentCustomProperties & Record<string, unknown>

describe('CcdTag', () => {
  it('forwards value and severity props to the underlying PrimeVue Tag', () => {
    const wrapper = mount(CcdTag, {
      props: {
        value: 'width=100',
        severity: 'secondary',
      },
    })

    expect(wrapper.text()).toContain('width=100')
    expect(wrapper.find('.p-tag').exists()).toBe(true)
  })
})

describe('CcdInputText', () => {
  it('forwards modelValue and placeholder props to the underlying PrimeVue InputText', () => {
    const wrapper = mount(CcdInputText, {
      props: {
        modelValue: 'CCD',
        placeholder: 'Name',
      },
      global: {
        config: {
          globalProperties: primeVueGlobalProperties,
        },
      },
    })

    const input = wrapper.get('input')
    const element = input.element as HTMLInputElement

    expect(element.value).toBe('CCD')
    expect(input.attributes('placeholder')).toBe('Name')
    expect(input.classes()).toContain('p-inputtext')
  })
})
