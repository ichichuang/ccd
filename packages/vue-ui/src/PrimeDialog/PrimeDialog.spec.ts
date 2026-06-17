// @vitest-environment jsdom
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import PrimeDialog from './PrimeDialog.vue'

const primeDialogSource = readFileSync(
  resolve(process.cwd(), 'packages/vue-ui/src/PrimeDialog/PrimeDialog.vue'),
  'utf8'
)

vi.mock('primevue/dialog', async () => {
  const { defineComponent, h } = await import('vue')

  return {
    default: defineComponent({
      name: 'PrimeDialogStub',
      props: {
        appendTo: { type: String, default: undefined },
        breakpoints: { type: Object, default: undefined },
        class: { type: [String, Object, Array], default: undefined },
        closable: { type: Boolean, default: undefined },
        closeOnEscape: { type: Boolean, default: undefined },
        dismissableMask: { type: Boolean, default: undefined },
        draggable: { type: Boolean, default: undefined },
        header: { type: String, default: undefined },
        keepInViewport: { type: Boolean, default: undefined },
        maximizable: { type: Boolean, default: undefined },
        modal: { type: Boolean, default: undefined },
        position: { type: String, default: undefined },
        pt: { type: Object, default: undefined },
        style: { type: Object, default: undefined },
        visible: { type: Boolean, default: undefined },
      },
      setup(props, { slots }) {
        return () => {
          const pt = props.pt && typeof props.pt === 'object' ? props.pt : undefined
          const mask = pt?.mask
          const root = pt?.root
          const rootClass =
            root && typeof root === 'object' && 'class' in root ? String(root.class ?? '') : ''
          const maskClass =
            mask && typeof mask === 'object' && 'class' in mask ? String(mask.class ?? '') : ''

          return h(
            'div',
            {
              class: 'prime-dialog-stub',
              'data-dialog-class': rootClass,
              'data-mask-class': maskClass,
            },
            slots.default?.()
          )
        }
      },
    }),
  }
})

describe('PrimeDialog', () => {
  it('keeps the default full-screen mask darkened without backdrop filters', () => {
    const wrapper = mount(PrimeDialog, {
      props: {
        dialogStore: [
          {
            header: 'Validation',
            hideFooter: true,
            visible: true,
          },
        ],
      },
    })

    const maskClass = wrapper.get('.prime-dialog-stub').attributes('data-mask-class') ?? ''

    expect(maskClass).toContain('ccd-dialog-mask')
    expect(maskClass).not.toContain('transition-opacity')
    expect(maskClass).not.toContain('duration-md')
    expect(maskClass).not.toContain('ease-smooth')
    expect(maskClass).not.toContain('p-overlay-mask-enter-from')
    expect(maskClass).not.toContain('p-overlay-mask-enter-to')
    expect(maskClass).not.toContain('p-overlay-mask-leave-from')
    expect(maskClass).not.toContain('p-overlay-mask-leave-to')
    expect(maskClass).not.toContain('p-overlay-mask-leave-active')
    expect(maskClass).not.toContain('bg-background')
    expect(maskClass).not.toContain('backdrop-blur')
    expect(maskClass).not.toContain('backdrop-filter')

    expect(primeDialogSource).toContain('.ccd-dialog-mask.p-overlay-mask-enter-active')
    expect(primeDialogSource).toContain('.ccd-dialog-mask.p-overlay-mask-leave-active')
    expect(primeDialogSource).toContain('@keyframes ccd-dialog-mask-enter')
    expect(primeDialogSource).toContain('@keyframes ccd-dialog-mask-leave')
  })

  it('uses a solid card surface for the default dialog panel', () => {
    const wrapper = mount(PrimeDialog, {
      props: {
        dialogStore: [
          {
            header: 'Validation',
            hideFooter: true,
            visible: true,
          },
        ],
      },
    })

    const dialogClass = wrapper.get('.prime-dialog-stub').attributes('data-dialog-class') ?? ''

    expect(dialogClass).toContain('ccd-dialog-panel')
    expect(dialogClass).not.toContain('glass-panel')
    expect(dialogClass).not.toContain('backdrop-blur')
    expect(dialogClass).not.toContain('will-change-transform')
  })
})
