// @vitest-environment jsdom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { CcdTag } from './index'

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
