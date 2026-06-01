import type { VNode } from 'vue'
import { CcdInputText as InputText, useField, useFormContext } from '@ccd/vue-ui'

const myColorCustomInput = defineComponent({
  name: 'MyColorCustomInput',
  setup() {
    useFormContext()
    const { value, state, setValue } = useField<string>('myColor')
    const errors = computed(() => state.errors ?? [])

    return (): VNode => (
      <div class="col-stretch gap-xs w-full">
        <InputText
          modelValue={value.value}
          {...{
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'onUpdate:modelValue': (v?: string) => setValue(v ?? ''),
          }}
          disabled={state.disabled}
          class="w-full"
          placeholder='useField("myColor") 双向绑定'
        />
        {errors.value.length ? (
          <div class="text-xs text-danger">{errors.value.join(', ')}</div>
        ) : null}
      </div>
    )
  },
})

export default myColorCustomInput
