import { defineComponent, type PropType } from 'vue'
import { castValue } from '@/utils/typeCasters'
import ColorPickerField from './ColorPickerField'

const colorPickerFieldAdapter = defineComponent({
  name: 'ColorPickerFieldAdapter',
  props: {
    modelValue: { type: castValue<PropType<unknown>>(null), required: true },
    disabled: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    error: { type: Array as PropType<string[] | undefined>, default: undefined },
    loading: { type: Boolean as PropType<boolean | undefined>, default: undefined },
    // eslint-disable-next-line vue/prop-name-casing, @typescript-eslint/naming-convention
    'onUpdate:modelValue': { type: Function as PropType<(v: unknown) => void>, required: true },
  },
  setup(props) {
    return () => (
      <ColorPickerField
        modelValue={String(props.modelValue ?? '')}
        disabled={props.disabled}
        readonly={props.readonly}
        {...{
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'onUpdate:modelValue': (v?: string) => props['onUpdate:modelValue'](v ?? ''),
        }}
      />
    )
  },
})

export default colorPickerFieldAdapter
