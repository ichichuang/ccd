import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { CScrollbar } from '../../CScrollbar'
import { ProForm } from '../../ProForm'
import type { FormSchema, ProFormExpose } from '../../ProForm'
import Button from 'primevue/button'

export default defineComponent({
  name: 'ProTableCrudFormModalBody',
  props: {
    schema: {
      type: Object as PropType<FormSchema>,
      required: true,
    },
    initialValues: {
      type: Object as PropType<Record<string, unknown>>,
      required: true,
    },
    /** 校验通过后的完整提交流程（含 API、关窗、刷新） */
    onRequestSubmit: {
      type: Function as PropType<(values: Record<string, unknown>) => Promise<void>>,
      required: true,
    },
    onCancel: {
      type: Function as PropType<() => void>,
      required: true,
    },
  },
  setup(props) {
    const { t } = useI18n()
    const formRef = ref<ProFormExpose<Record<string, unknown>> | null>(null)
    const submitting = ref(false)

    const handleValidSubmit = async (values: Record<string, unknown>): Promise<void> => {
      try {
        submitting.value = true
        await props.onRequestSubmit(values)
      } finally {
        submitting.value = false
      }
    }

    return () => (
      <div class="layout-full col-fill min-h-0 col-stretch p-md">
        <CScrollbar class="flex-1 min-h-0">
          <div class="p-md">
            <ProForm
              ref={formRef}
              schema={props.schema}
              initialValues={props.initialValues}
              onSubmit={handleValidSubmit}
            />
          </div>
        </CScrollbar>
        <div class="shrink-0 row-end gap-md">
          <Button
            type="button"
            severity="danger"
            outlined
            label={t('proForm.drawer.cancel')}
            disabled={submitting.value}
            onClick={() => props.onCancel()}
          />
          <Button
            type="button"
            severity="primary"
            label={t('proForm.drawer.save')}
            loading={submitting.value}
            disabled={submitting.value}
            onClick={() => void formRef.value?.submit()}
          />
        </div>
      </div>
    )
  },
})
