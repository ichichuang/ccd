// @vitest-environment jsdom

import { readFileSync } from 'node:fs'
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
            stageTitle: 'Feedback demo stage',
            stageDescription: 'Shared feedback surface.',
            actionsTitle: 'Feedback actions',
            actionsDescription: 'Trigger all feedback channels.',
            toolbarTitle: 'Feedback type controls',
            toolbarDescription: 'Run each feedback channel.',
            stageCardTitle: 'Overlay and feedback channels',
            stageCardDescription: 'Contracts stay visible.',
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
            logDescription: 'Newest events appear first.',
            noLogsTitle: 'No feedback yet',
            noLogsDescription: 'Trigger a control to populate this log.',
            dialogOpened: 'Dialog opened',
            messageShown: 'Message shown',
            toastShown: 'Toast shown',
            emptyActionLogged: 'Empty-state action recorded',
            contractTitle: 'Local feedback contract',
            contractDescription: 'Events stay local while facades own overlays.',
            dialogContractTitle: 'Dialog bridge',
            dialogContractDescription: 'Dialog bridge copy.',
            messageContractTitle: 'Message facade',
            messageContractDescription: 'Message facade copy.',
            toastContractTitle: 'Toast facade',
            toastContractDescription: 'Toast facade copy.',
          },
          tags: {
            technical: 'Technical',
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

function mountDemo(): VueWrapper {
  return mount(ShowcaseFeedbackDemo, {
    global: {
      plugins: [i18n],
      stubs: {
        Button: {
          props: ['label', 'severity', 'outlined', 'icon', 'pt'],
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
}

describe('ShowcaseFeedbackDemo', () => {
  beforeEach(() => {
    feedbackMocks.openInfoDialog.mockClear()
    feedbackMocks.showSuccessMessage.mockClear()
    feedbackMocks.showSuccessToast.mockClear()
    feedbackMocks.showInfoToast.mockClear()
  })

  it('renders the Phase 2C feedback structure with shared showcase primitives', () => {
    const wrapper = mountDemo()

    expect(wrapper.get('[data-testid="showcase-feedback-demo"]').text()).toContain(
      'Feedback demo stage'
    )
    expect(wrapper.get('[data-testid="showcase-feedback-action-toolbar"]').text()).toContain(
      'Feedback type controls'
    )
    expect(wrapper.get('[data-testid="showcase-feedback-stage"]').text()).toContain(
      'Overlay and feedback channels'
    )
    expect(wrapper.get('[data-testid="showcase-feedback-log"]').text()).toContain(
      'Feedback event log'
    )
    expect(wrapper.get('[data-testid="showcase-feedback-log-empty"]').text()).toContain(
      'No feedback yet'
    )
    expect(wrapper.get('[data-testid="showcase-feedback-contract"]').text()).toContain(
      'Local feedback contract'
    )
  })

  it('opens dialog, shows message/toast, and records feedback events', async () => {
    const wrapper = mountDemo()

    await getButton(wrapper, 'Add empty-state event').trigger('click')
    expect(feedbackMocks.showInfoToast).toHaveBeenCalledWith(
      'top-right',
      'Empty-state action',
      'Empty-state action body'
    )
    expect(wrapper.text()).toContain('Empty-state action recorded')

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
  })

  it('keeps changed feedback sources free of hardcoded colors and inline styles', () => {
    const changedFeedbackFiles = [
      'apps/web-demo/src/views/showcase/shared/remaining/ShowcaseFeedbackDemo.vue',
      'e2e/phase2c-feedback-ui.spec.ts',
    ]
    const hardcodedColorPattern =
      /#[0-9a-fA-F]{3,8}\b|\b(?:rgb|rgba|hsl|hsla)\(|\b(?:bg|text|border)-(?:white|black|gray|slate|red|blue|green|yellow|orange|purple|neutral|zinc|stone)(?:\b|-)/
    const inlineStylePattern = /\b:?style=/

    const violations = changedFeedbackFiles.flatMap(file => {
      const source = readFileSync(file, 'utf8')
      return [
        hardcodedColorPattern.test(source) ? `${file}: hardcoded color` : null,
        inlineStylePattern.test(source) ? `${file}: inline style` : null,
      ].filter((entry): entry is string => Boolean(entry))
    })

    expect(violations).toEqual([])
  })
})
