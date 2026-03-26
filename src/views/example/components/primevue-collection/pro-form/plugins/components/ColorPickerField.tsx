import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import InputText from 'primevue/inputtext'

export default defineComponent({
  name: 'ColorPickerField',
  props: {
    modelValue: {
      type: [String, Number] as PropType<string | number | undefined>,
      default: '',
    },
    disabled: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const color = computed({
      get: () => String(props.modelValue ?? ''),
      set: (v: string) => emit('update:modelValue', v),
    })
    return () => (
      <div class="row-y-center gap-sm w-full">
        <input
          type="color"
          value={color.value}
          disabled={props.disabled || props.readonly}
          class="h-[var(--spacing-xl)] w-[var(--spacing-2xl)] cursor-pointer rounded-sm border-0 bg-transparent"
          onInput={(e: Event) => {
            const el = e.target
            if (el instanceof HTMLInputElement) color.value = el.value
          }}
        />
        <InputText
          v-model={color.value}
          disabled={props.disabled}
          readonly={props.readonly}
          class="flex-1"
          placeholder="#000000"
        />
      </div>
    )
  },
})
