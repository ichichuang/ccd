import PrimeButton from 'primevue/button'
import PrimeDrawer from 'primevue/drawer'
import PrimeInputText from 'primevue/inputtext'
import PrimePanelMenu from 'primevue/panelmenu'
import PrimePopover from 'primevue/popover'
import PrimeSelect from 'primevue/select'
import PrimeSelectButton from 'primevue/selectbutton'
import PrimeTag from 'primevue/tag'
import PrimeTieredMenu from 'primevue/tieredmenu'
import PrimeToggleSwitch from 'primevue/toggleswitch'
import { defineComponent, h, ref, type Component } from 'vue'

interface PrimeControlForwarding {
  methods?: readonly string[]
  properties?: readonly string[]
}

function createCcdPrimeControl<TComponent extends Component>(
  name: string,
  component: TComponent,
  forwarding: PrimeControlForwarding = {}
): TComponent {
  const wrapped = defineComponent({
    name,
    inheritAttrs: false,
    setup(_props, { attrs, expose, slots }) {
      const innerRef = ref<Record<PropertyKey, unknown> | null>(null)
      const exposed: Record<string, unknown> = {}

      for (const method of forwarding.methods ?? []) {
        exposed[method] = (...args: unknown[]) => {
          const value = innerRef.value?.[method]
          if (typeof value !== 'function') return undefined
          return value.apply(innerRef.value, args)
        }
      }

      for (const property of forwarding.properties ?? []) {
        Object.defineProperty(exposed, property, {
          configurable: true,
          enumerable: true,
          get() {
            return innerRef.value?.[property]
          },
          set(value: unknown) {
            if (innerRef.value) {
              innerRef.value[property] = value
            }
          },
        })
      }

      expose(exposed)

      return () => h(component, { ...attrs, ref: innerRef }, slots)
    },
  })

  return wrapped as unknown as TComponent
}

const ccdButton = createCcdPrimeControl('CcdButton', PrimeButton)
const ccdDrawer = createCcdPrimeControl('CcdDrawer', PrimeDrawer)
const ccdInputText = createCcdPrimeControl('CcdInputText', PrimeInputText)
const ccdPanelMenu = createCcdPrimeControl('CcdPanelMenu', PrimePanelMenu)
const ccdPopover = createCcdPrimeControl('CcdPopover', PrimePopover, {
  methods: ['toggle', 'show', 'hide'],
})
const ccdSelect = createCcdPrimeControl('CcdSelect', PrimeSelect)
const ccdSelectButton = createCcdPrimeControl('CcdSelectButton', PrimeSelectButton)
const ccdTag = createCcdPrimeControl('CcdTag', PrimeTag)
const ccdTieredMenu = createCcdPrimeControl('CcdTieredMenu', PrimeTieredMenu, {
  methods: ['toggle', 'show', 'hide'],
  properties: ['container', 'target'],
})
const ccdToggleSwitch = createCcdPrimeControl('CcdToggleSwitch', PrimeToggleSwitch)

export {
  ccdButton as CcdButton,
  ccdDrawer as CcdDrawer,
  ccdInputText as CcdInputText,
  ccdPanelMenu as CcdPanelMenu,
  ccdPopover as CcdPopover,
  ccdSelect as CcdSelect,
  ccdSelectButton as CcdSelectButton,
  ccdTag as CcdTag,
  ccdTieredMenu as CcdTieredMenu,
  ccdToggleSwitch as CcdToggleSwitch,
}
