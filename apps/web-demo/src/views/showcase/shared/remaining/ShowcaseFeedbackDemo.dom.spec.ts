// @vitest-environment jsdom

import { mount, type DOMWrapper, type VueWrapper } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ShowcaseFeedbackDemo from './ShowcaseFeedbackDemo.vue'

const feedbackMocks = vi.hoisted(() => ({
  openInfoDialog: vi.fn(),
  showSuccessMessage: vi.fn(),
  showSuccessToast: vi.fn(),
  showInfoToast: vi.fn(),
}))

vi.mock('@/adapters/showcaseFeedback.adapter', () => ({
  showcaseFeedbackAdapter: {
    showSuccessMessage: feedbackMocks.showSuccessMessage,
    showSuccessToast: feedbackMocks.showSuccessToast,
    showInfoToast: feedbackMocks.showInfoToast,
  },
}))

const i18n = createI18n({
  legacy: false,
  locale: 'en-US',
  fallbackLocale: 'en-US',
  missingWarn: false,
  fallbackWarn: false,
  messages: {
    'en-US': {
      showcase: {
        remaining: {
          feedback: {
            actionsTitle: 'Feedback actions',
            actionsDescription: 'Trigger all feedback channels.',
            openDialog: 'Open dialog',
            showMessage: 'Show message',
            showToast: 'Show toast',
            dialogTitle: 'Feedback dialog',
            dialogMessage: 'Dialog message',
            messageTitle: 'Message sent',
            messageBody: 'Message body',
            toastTitle: 'Toast sent',
            toastBody: 'Toast body',
            emptyTitle: 'Feedback starts empty',
            emptyDescription: 'Use controls to add events.',
            emptyAction: 'Add empty-state event',
            emptyActionTitle: 'Empty-state action',
            emptyActionBody: 'Empty-state action body',
            logTitle: 'Feedback event log',
            noLogsTitle: 'No feedback yet',
            noLogsDescription: 'Trigger a control to populate this log.',
            dialogOpened: 'Dialog opened',
            messageShown: 'Message shown',
            toastShown: 'Toast shown',
            emptyActionLogged: 'Empty-state action recorded',
          },
        },
      },
    },
  },
})

function getButton(wrapper: VueWrapper, label: string): DOMWrapper<Element> {
  const button = wrapper.findAll('button').find(candidate => candidate.text() === label)
  if (!button) throw new Error(`Missing button: ${label}`)
  return button
}

describe('ShowcaseFeedbackDemo', () => {
  beforeEach(() => {
    feedbackMocks.openInfoDialog.mockClear()
    feedbackMocks.showSuccessMessage.mockClear()
    feedbackMocks.showSuccessToast.mockClear()
    feedbackMocks.showInfoToast.mockClear()
  })

  it('opens dialog, shows message/toast, and records feedback events', async () => {
    const wrapper = mount(ShowcaseFeedbackDemo, {
      global: {
        plugins: [i18n],
        stubs: {
          Button: {
            props: ['label', 'severity', 'outlined'],
            emits: ['click'],
            template: '<button type="button" @click="$emit(\'click\')">{{ label }}</button>',
          },
          CScrollbar: {
            template: '<div class="c-scrollbar-stub"><slot /></div>',
          },
          EmptyState: {
            props: ['icon', 'title', 'description', 'actionLabel'],
            emits: ['action'],
            template:
              '<section class="empty-state-stub"><span>{{ title }}</span><span>{{ description }}</span><button v-if="actionLabel" type="button" @click="$emit(\'action\')">{{ actionLabel }}</button></section>',
          },
          Icons: {
            props: ['name', 'size'],
            template: '<span class="icon-stub" :data-name="name" />',
          },
          ShowcaseFeedbackDialogBridge: {
            template: '<div><slot :open-info-dialog="openInfoDialog" /></div>',
            methods: {
              openInfoDialog: feedbackMocks.openInfoDialog,
            },
          },
          Tag: {
            props: ['value', 'severity'],
            template: '<span class="tag-stub" :data-severity="severity">{{ value }}</span>',
          },
        },
      },
    })

    await getButton(wrapper, 'Open dialog').trigger('click')
    expect(feedbackMocks.openInfoDialog).toHaveBeenCalledWith('Dialog message', 'Feedback dialog')
    expect(wrapper.text()).toContain('Dialog opened')

    await getButton(wrapper, 'Show message').trigger('click')
    expect(feedbackMocks.showSuccessMessage).toHaveBeenCalledWith('Message body', 'Message sent')
    expect(wrapper.text()).toContain('Message shown')

    await getButton(wrapper, 'Show toast').trigger('click')
    expect(feedbackMocks.showSuccessToast).toHaveBeenCalledWith(
      'top-right',
      'Toast sent',
      'Toast body'
    )
    expect(wrapper.text()).toContain('Toast shown')

    await getButton(wrapper, 'Add empty-state event').trigger('click')
    expect(feedbackMocks.showInfoToast).toHaveBeenCalledWith(
      'top-right',
      'Empty-state action',
      'Empty-state action body'
    )
    expect(wrapper.text()).toContain('Empty-state action recorded')
  })
})
