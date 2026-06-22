// @vitest-environment jsdom

import { mount, type VueWrapper } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { describe, expect, it } from 'vitest'
import ProFormDemoShell from './ProFormDemoShell.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'en-US',
  fallbackLocale: 'en-US',
  missingWarn: false,
  fallbackWarn: false,
  messages: {
    'en-US': {
      showcase: {
        shell: {
          heroActions: 'Showcase actions',
          source: {
            title: 'Source',
            description: 'Implementation evidence.',
            empty: 'No source path is registered.',
          },
          related: {
            title: 'Related pages',
            description: 'Nearby showcase routes.',
          },
          technical: {
            title: 'Technical notes',
          },
          demoLevels: {
            complete: 'Complete',
            preview: 'Preview',
          },
        },
        pages: {
          'components-pro-form-validation': {
            eyebrow: 'Form',
            title: 'Validation',
            description: 'Validation route description.',
            try: 'Try validation rules',
          },
        },
        proForm: {
          badges: {
            proFormOnly: 'ProForm wrapper',
          },
          modes: {
            validation: {
              label: 'Validation',
              demo: 'Validation demo.',
            },
          },
          toolbar: {
            title: 'Form actions',
            description: 'Validate, inspect, submit, and run draft controls.',
          },
          form: {
            title: 'Schema-driven form',
            description: 'The ProForm wrapper owns fields and submit handling.',
          },
          feedback: {
            title: 'Local feedback',
            description: 'State, values, submit result, and event records stay visible.',
          },
          controls: {
            validate: 'Validate',
            getValues: 'Get values',
            getFormState: 'Get form state',
            submitApi: 'Call submit',
            submit: 'Submit request',
          },
          actions: {
            ready: 'Ready for form actions.',
            invalid: 'Validation found missing or incomplete fields.',
            valuesRead: 'Values were read.',
            stateRead: 'State was read.',
            submitCalled: 'Submit method called.',
          },
          submitState: {
            title: 'Submit result preview',
            shortTitle: 'Submit state',
            description: 'Compare result feedback.',
            forceError: 'Use error result',
            idle: 'Idle',
            submitting: 'Submitting',
            success: 'Success',
            error: 'Error',
          },
          state: {
            title: 'Form state',
            empty: 'Form state has not been read yet.',
            valid: 'Valid',
            invalid: 'Invalid',
            summary:
              'Dirty {dirty}, valid {valid}, submitting {submitting}, error fields {errors}.',
          },
          values: {
            title: 'Current values',
            empty: 'Values have not been read yet.',
            none: 'none',
            summary: 'Current populated fields: {fields}.',
          },
          booleans: {
            yes: 'yes',
            no: 'no',
          },
          events: {
            title: 'Event log',
            description: 'Recent form events.',
            emptyTitle: 'No form events yet',
            empty: 'Interact with the form to record events here.',
            validate: 'validate: {detail}',
            values: 'getValues: {detail}',
            state: 'getFormState valid: {detail}',
            submitApi: 'submit method: {detail}',
            submit: 'submit: {detail}',
          },
          features: {
            schemaBasics: {
              title: 'Schema describes the form',
              description: 'Schema copy.',
              tag: 'Schema',
            },
            validation: {
              title: 'Validation is visible',
              description: 'Validation copy.',
              tag: 'Validation',
            },
            conditionalLogic: {
              title: 'Fields appear when useful',
              description: 'Conditional copy.',
              tag: 'Conditions',
            },
            localFeedback: {
              title: 'Feedback stays on the page',
              description: 'Feedback copy.',
              tag: 'Feedback',
            },
          },
          technical: {
            validationResolver: {
              title: 'Resolver contract',
              description: 'Resolver copy.',
            },
            exposedApis: {
              title: 'Exposed API controls',
              description: 'API copy.',
            },
          },
        },
      },
    },
  },
})

function mountValidationShell(): VueWrapper {
  return mount(ProFormDemoShell, {
    global: {
      plugins: [i18n],
      stubs: {
        Button: {
          props: ['label', 'icon', 'severity', 'outlined', 'size', 'loading'],
          emits: ['click'],
          template: '<button type="button" @click="$emit(\'click\')">{{ label }}</button>',
        },
        CScrollbar: {
          template: '<div class="c-scrollbar-stub"><slot /></div>',
        },
        EmptyState: {
          props: ['icon', 'title', 'description', 'actionLabel'],
          template:
            '<section class="empty-state-stub"><span>{{ title }}</span><span>{{ description }}</span><span>{{ actionLabel }}</span></section>',
        },
        Icons: {
          props: ['name', 'size'],
          template: '<span class="icon-stub" :data-name="name" />',
        },
        ProForm: {
          props: ['schema', 'initialValues', 'resolver', 'persistKey', 'autoSave', 'validateOn'],
          emits: ['submit'],
          data() {
            return {
              form: {
                setFieldsValue: () => undefined,
              },
            }
          },
          methods: {
            validate() {
              return Promise.resolve(false)
            },
            getValues() {
              return {
                requestName: '',
                ownerTeam: 'product',
              }
            },
            getFormState() {
              return {
                dirty: true,
                valid: false,
                submitting: false,
                errors: {
                  requestName: ['Required'],
                },
              }
            },
            submit() {
              this.$emit('submit', {
                requestName: 'Demo',
                ownerTeam: 'product',
              })
              return Promise.resolve()
            },
          },
          template:
            '<section class="pro-form-stub"><span>Request name</span><slot /><slot name="footer" :form-state="{ valid: false, submitting: false }" :submit="submit" /></section>',
        },
        RouterLink: {
          props: ['to'],
          template: '<a class="router-link-stub" :href="to"><slot /></a>',
        },
        Tag: {
          props: ['value', 'severity'],
          template: '<span class="tag-stub" :data-severity="severity">{{ value }}</span>',
        },
        ToggleSwitch: {
          props: ['modelValue'],
          template: '<span class="toggle-stub" />',
        },
      },
    },
    props: {
      id: 'components-pro-form-validation',
      mode: 'validation',
    },
  })
}

describe('ProFormDemoShell visual foundation', () => {
  it('renders the migrated toolbar, form section, feedback cards, and source evidence', () => {
    const wrapper = mountValidationShell()

    expect(wrapper.text()).toContain('Form actions')
    expect(wrapper.text()).toContain('Ready for form actions.')
    expect(wrapper.text()).toContain('Validate')
    expect(wrapper.text()).toContain('Schema-driven form')
    expect(wrapper.find('.pro-form-stub').exists()).toBe(true)
    expect(wrapper.text()).toContain('Local feedback')
    expect(wrapper.text()).toContain('Current values')
    expect(wrapper.text()).toContain(
      'apps/web-demo/src/views/showcase/components/pro-form/shared/ProFormDemoShell.vue'
    )
  })

  it('keeps core form actions wired to the shell feedback area', async () => {
    const wrapper = mountValidationShell()
    const validateButton = wrapper.findAll('button').find(button => button.text() === 'Validate')

    if (!validateButton) throw new Error('Missing Validate button')

    await validateButton.trigger('click')

    expect(wrapper.text()).toContain('Validation found missing or incomplete fields.')
  })
})
