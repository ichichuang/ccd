import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import type { FormSchema } from '@/components/ProForm'
import ProForm from '@/components/ProForm/index.vue'
import CScrollbar from '@/components/CScrollbar/CScrollbar.vue'
import { t } from '@/locales'
import Button from 'primevue/button'

export default defineComponent({
  name: 'ProTableCrudViewModalBody',
  props: {
    schema: {
      type: Object as PropType<FormSchema>,
      required: true,
    },
    initialValues: {
      type: Object as PropType<Record<string, unknown>>,
      required: true,
    },
    onClose: {
      type: Function as PropType<() => void>,
      required: true,
    },
  },
  setup(props) {
    return () => (
      <div class="layout-full col-fill min-h-0 col-stretch p-md">
        <CScrollbar class="flex-1 min-h-0">
          <div class="p-md">
            <ProForm
              readonly
              schema={props.schema}
              initialValues={props.initialValues}
            />
          </div>
        </CScrollbar>
        <div class="shrink-0 row-end gap-md p-md">
          <Button
            type="button"
            outlined
            label={t('proForm.drawer.close')}
            onClick={() => props.onClose()}
          />
        </div>
      </div>
    )
  },
})
