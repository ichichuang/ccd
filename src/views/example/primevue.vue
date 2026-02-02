<script setup lang="ts">
import { ref, defineComponent } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import Tooltip from 'primevue/tooltip'
import { useThemeStore } from '@/stores/modules/theme'
import { useThemeSwitch } from '@/hooks/modules/useThemeSwitch'

defineComponent({
  name: 'ExamplePrimeVue',
})

// Services
const toast = useToast()
const confirm = useConfirm()
// 为模板中的 v-tooltip 提供类型和运行时引用
const vTooltip = Tooltip

// Theme Logic
const themeStore = useThemeStore()
const { setThemeWithAnimation, isAnimating } = useThemeSwitch()
const MODE_OPTIONS = [
  { value: 'light', label: 'Light', icon: 'i-lucide-sun' },
  { value: 'dark', label: 'Dark', icon: 'i-lucide-moon' },
  { value: 'auto', label: 'Auto', icon: 'i-lucide-monitor' },
] as const

// Form State
const textValue = ref<string | undefined>('')
const numberValue = ref<number | null>(null)
const textareaValue = ref('')
const passwordValue = ref('')
const selectValue = ref(null)
const multiSelectValue = ref(null)
const cascadeValue = ref(null)
const treeSelectValue = ref(null)
const checkboxValue = ref(false)
const radioValue = ref(null)
const switchValue = ref(false)
const dateValue = ref<Date | Date[] | (Date | null)[] | null | undefined>(null)
const sliderValue = ref<number | number[]>(50)
const ratingValue = ref(3)
const knobValue = ref(60)
const colorValue = ref('1976D2')
const inputChipsValue = ref(['Vue', 'PrimeVue'])
const autoCompleteValue = ref(null)
const filteredItems = ref<any[]>([])
const toggleButtonValue = ref(false)
const selectButtonValue = ref(null)
const listboxValue = ref(null)

// Data Options
const cities = ref([
  { name: 'New York', code: 'NY' },
  { name: 'Rome', code: 'RM' },
  { name: 'London', code: 'LDN' },
  { name: 'Istanbul', code: 'IST' },
  { name: 'Paris', code: 'PRS' },
])
const groupedCities = ref([
  {
    label: 'Germany',
    code: 'DE',
    items: [
      { label: 'Berlin', value: 'Berlin' },
      { label: 'Frankfurt', value: 'Frankfurt' },
    ],
  },
  {
    label: 'USA',
    code: 'US',
    items: [
      { label: 'Chicago', value: 'Chicago' },
      { label: 'Los Angeles', value: 'Los Angeles' },
    ],
  },
])
const cascadeOptions = ref([
  {
    name: 'Australia',
    code: 'AU',
    states: [
      {
        name: 'New South Wales',
        cities: [
          { cname: 'Sydney', code: 'A-SY' },
          { cname: 'Newcastle', code: 'A-NE' },
        ],
      },
    ],
  },
])
const treeNodes = ref([
  {
    key: '0',
    label: 'Documents',
    data: 'Documents Folder',
    icon: 'pi pi-fw pi-inbox',
    children: [
      {
        key: '0-0',
        label: 'Work',
        data: 'Work Folder',
        icon: 'pi pi-fw pi-cog',
        children: [
          {
            key: '0-0-0',
            label: 'Expenses.doc',
            icon: 'pi pi-fw pi-file',
            data: 'Expenses Document',
          },
        ],
      },
      {
        key: '0-1',
        label: 'Home',
        data: 'Home Folder',
        icon: 'pi pi-fw pi-home',
        children: [
          {
            key: '0-1-0',
            label: 'Invoices.txt',
            icon: 'pi pi-fw pi-file',
            data: 'Invoices for this month',
          },
        ],
      },
    ],
  },
])
const selectButtonOptions = ref([
  { name: 'Option 1', value: 1 },
  { name: 'Option 2', value: 2 },
  { name: 'Option 3', value: 3 },
])

// Button & Menu State
const speedDialItems = ref([
  {
    label: 'Add',
    icon: 'pi pi-pencil',
    command: () => toast.add({ severity: 'info', summary: 'Add', detail: 'Data Added' }),
  },
  {
    label: 'Update',
    icon: 'pi pi-refresh',
    command: () => toast.add({ severity: 'success', summary: 'Update', detail: 'Data Updated' }),
  },
  {
    label: 'Delete',
    icon: 'pi pi-trash',
    command: () => toast.add({ severity: 'error', summary: 'Delete', detail: 'Data Deleted' }),
  },
])

const splitButtonItems = [
  { label: 'Update', icon: 'pi pi-refresh' },
  { label: 'Delete', icon: 'pi pi-times' },
  { label: 'Home', icon: 'pi pi-home' },
]

// Data Components State
const tableData = ref([
  { id: 1, name: 'Product A', category: 'Accessories', quantity: 10, rating: 5, status: 'INSTOCK' },
  { id: 2, name: 'Product B', category: 'Clothing', quantity: 5, rating: 4, status: 'LOWSTOCK' },
  { id: 3, name: 'Product C', category: 'Fitness', quantity: 12, rating: 3, status: 'INSTOCK' },
  {
    id: 4,
    name: 'Product D',
    category: 'Electronics',
    quantity: 0,
    rating: 5,
    status: 'OUTOFSTOCK',
  },
  { id: 5, name: 'Product E', category: 'Accessories', quantity: 60, rating: 4, status: 'INSTOCK' },
])
const pickListValue = ref([
  [
    { label: 'San Francisco', value: 'sf' },
    { label: 'London', value: 'ldn' },
    { label: 'Paris', value: 'prs' },
    { label: 'Istanbul', value: 'ist' },
    { label: 'Berlin', value: 'ber' },
    { label: 'Barcelona', value: 'bar' },
  ],
  [],
])
const orderListValue = ref([
  { label: 'San Francisco', value: 'sf' },
  { label: 'London', value: 'ldn' },
  { label: 'Paris', value: 'prs' },
  { label: 'Istanbul', value: 'ist' },
])
const timelineEvents = ref([
  { status: 'Ordered', date: '15/10/2020 10:30', icon: 'pi pi-shopping-cart', color: '#9C27B0' },
  { status: 'Processing', date: '15/10/2020 14:00', icon: 'pi pi-cog', color: '#673AB7' },
  { status: 'Shipped', date: '15/10/2020 16:15', icon: 'pi pi-envelope', color: '#FF9800' },
  { status: 'Delivered', date: '16/10/2020 10:00', icon: 'pi pi-check', color: '#607D8B' },
])
// Org Chart Data
const organizationData = ref({
  key: '0',
  type: 'person',
  styleClass: 'bg-primary text-primary-foreground rounded-xl p-2',
  data: {
    label: 'CEO',
    name: 'Walter White',
    avatar: 'https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png',
  },
  children: [
    {
      key: '0_0',
      type: 'person',
      styleClass: 'bg-secondary text-secondary-foreground rounded-xl p-2',
      data: {
        label: 'CFO',
        name: 'Saul Goodman',
        avatar: 'https://primefaces.org/cdn/primevue/images/avatar/annafali.png',
      },
    },
    {
      key: '0_1',
      type: 'person',
      styleClass: 'bg-secondary text-secondary-foreground rounded-xl p-2',
      data: {
        label: 'CTO',
        name: 'Jesse Pinkman',
        avatar: 'https://primefaces.org/cdn/primevue/images/avatar/stephenshaw.png',
      },
    },
  ],
})

const searchItems = (event: any) => {
  let query = event.query
  let _filteredItems = []

  for (let i = 0; i < cities.value.length; i++) {
    let item = cities.value[i]
    if (item.name.toLowerCase().indexOf(query.toLowerCase()) === 0) {
      _filteredItems.push(item)
    }
  }

  filteredItems.value = _filteredItems
}

// Menu Data
const menuItems = ref([
  { label: 'Home', icon: 'pi pi-home' },
  { label: 'Features', icon: 'pi pi-star' },
  { label: 'Projects', icon: 'pi pi-search', items: [{ label: 'Core' }, { label: 'Blocks' }] },
  { label: 'Contact', icon: 'pi pi-envelope' },
])
const tieredItems = ref([
  {
    label: 'File',
    icon: 'pi pi-fw pi-file',
    items: [
      { label: 'New', icon: 'pi pi-fw pi-plus' },
      { label: 'Delete', icon: 'pi pi-fw pi-trash' },
      { separator: true },
      { label: 'Export', icon: 'pi pi-fw pi-external-link' },
    ],
  },
  {
    label: 'Edit',
    icon: 'pi pi-fw pi-pencil',
    items: [
      { label: 'Left', icon: 'pi pi-fw pi-align-left' },
      { label: 'Right', icon: 'pi pi-fw pi-align-right' },
      { label: 'Center', icon: 'pi pi-fw pi-align-center' },
      { label: 'Justify', icon: 'pi pi-fw pi-align-justify' },
    ],
  },
  {
    label: 'Users',
    icon: 'pi pi-fw pi-user',
    items: [
      { label: 'New', icon: 'pi pi-fw pi-user-plus' },
      { label: 'Delete', icon: 'pi pi-fw pi-user-minus' },
      {
        label: 'Search',
        icon: 'pi pi-fw pi-users',
        items: [
          {
            label: 'Filter',
            icon: 'pi pi-fw pi-filter',
            items: [{ label: 'Print', icon: 'pi pi-fw pi-print' }],
          },
          { icon: 'pi pi-fw pi-bars', label: 'List' },
        ],
      },
    ],
  },
  { separator: true },
  { label: 'Quit', icon: 'pi pi-fw pi-power-off' },
])
type DockItem = {
  label: string
  icon: string
}

const dockItems = ref<DockItem[]>([
  { label: 'Finder', icon: 'https://primefaces.org/cdn/primevue/images/dock/finder.svg' },
  { label: 'App Store', icon: 'https://primefaces.org/cdn/primevue/images/dock/appstore.svg' },
  { label: 'Photos', icon: 'https://primefaces.org/cdn/primevue/images/dock/photos.svg' },
  { label: 'Trash', icon: 'https://primefaces.org/cdn/primevue/images/dock/trash.png' },
])
const panelMenuItems = ref([
  {
    label: 'Files',
    icon: 'pi pi-fw pi-file',
    items: [
      {
        label: 'Documents',
        icon: 'pi pi-fw pi-file',
        items: [
          { label: 'Work', icon: 'pi pi-fw pi-briefcase' },
          { label: 'Home', icon: 'pi pi-fw pi-home' },
        ],
      },
    ],
  },
  {
    label: 'Cloud',
    icon: 'pi pi-fw pi-cloud',
    items: [
      { label: 'Upload', icon: 'pi pi-fw pi-cloud-upload' },
      { label: 'Download', icon: 'pi pi-fw pi-cloud-download' },
      { label: 'Sync', icon: 'pi pi-fw pi-refresh' },
    ],
  },
  {
    label: 'Devices',
    icon: 'pi pi-fw pi-desktop',
    items: [
      { label: 'Phone', icon: 'pi pi-fw pi-mobile' },
      { label: 'Desktop', icon: 'pi pi-fw pi-desktop' },
      { label: 'Tablet', icon: 'pi pi-fw pi-tablet' },
    ],
  },
])

const stepsItems = ref([
  { label: 'Personal' },
  { label: 'Seat' },
  { label: 'Payment' },
  { label: 'Confirmation' },
])

// Overlay/Popup refs
const visibleDialog = ref(false)
const visibleDrawer = ref(false)
const op = ref()
const togglePopover = (event: Event) => {
  op.value.toggle(event)
}
const popupBtn = ref()
const confirmPopup = (event: any) => {
  confirm.require({
    target: event.currentTarget,
    message: 'Are you sure you want to proceed?',
    icon: 'pi pi-exclamation-triangle',
    accept: () =>
      toast.add({
        severity: 'info',
        summary: 'Confirmed',
        detail: 'You have accepted',
        life: 3000,
      }),
    reject: () =>
      toast.add({
        severity: 'error',
        summary: 'Rejected',
        detail: 'You have rejected',
        life: 3000,
      }),
  })
}

const showToast = (severity: 'success' | 'info' | 'warn' | 'error' | 'secondary' | 'contrast') => {
  toast.add({ severity, summary: 'Toast Title', detail: 'This is a toast message', life: 3000 })
}

// Media
const images = ref([
  {
    itemImageSrc: 'https://primefaces.org/cdn/primevue/images/galleria/galleria1.jpg',
    thumbnailImageSrc: 'https://primefaces.org/cdn/primevue/images/galleria/galleria1s.jpg',
    alt: 'Description for Image 1',
    title: 'Title 1',
  },
  {
    itemImageSrc: 'https://primefaces.org/cdn/primevue/images/galleria/galleria2.jpg',
    thumbnailImageSrc: 'https://primefaces.org/cdn/primevue/images/galleria/galleria2s.jpg',
    alt: 'Description for Image 2',
    title: 'Title 2',
  },
  {
    itemImageSrc: 'https://primefaces.org/cdn/primevue/images/galleria/galleria3.jpg',
    thumbnailImageSrc: 'https://primefaces.org/cdn/primevue/images/galleria/galleria3s.jpg',
    alt: 'Description for Image 3',
    title: 'Title 3',
  },
])
const responsiveOptions = ref([
  { breakpoint: '1300px', numVisible: 4 },
  { breakpoint: '575px', numVisible: 1 },
])

const onUpload = () => {
  toast.add({ severity: 'info', summary: 'Success', detail: 'File Uploaded', life: 3000 })
}
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden bg-background">
    <!-- Sticky Header with Theme Switcher -->
    <header
      class="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur px-6 py-4 flex items-center justify-between"
    >
      <div>
        <h1 class="text-2xl font-bold text-foreground">PrimeVue Showcase</h1>
        <p class="text-sm text-muted-foreground">Comprehensive component demonstration</p>
      </div>
      <div class="flex items-center gap-2 rounded-full border border-border bg-card p-1 shadow-sm">
        <button
          v-for="opt in MODE_OPTIONS"
          :key="opt.value"
          class="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all"
          :class="
            themeStore.mode === opt.value
              ? 'bg-primary text-primary-foreground shadow'
              : 'text-muted-foreground hover:text-foreground'
          "
          :disabled="isAnimating"
          @click="e => setThemeWithAnimation(opt.value, e)"
        >
          <i :class="[opt.icon, 'w-3.5 h-3.5']" />
          {{ opt.label }}
        </button>
      </div>
    </header>

    <CScrollbar>
      <div class="p-6 max-w-7xl mx-auto w-full space-y-12">
        <!-- 1. Form Inputs -->
        <section class="space-y-6">
          <div class="flex items-center gap-2 text-primary border-b border-border pb-2">
            <i class="pi pi-check-square text-xl"></i>
            <h2 class="text-xl font-semibold">1. Form Inputs</h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <!-- Text Inputs Group -->
            <div class="space-y-4">
              <span class="text-sm font-medium text-muted-foreground uppercase tracking-wider"
                >Text Inputs</span
              >

              <div class="space-y-4 p-4 border border-border rounded-xl bg-card/50">
                <InputText
                  v-model="textValue"
                  placeholder="Standard Input"
                  class="w-full"
                />
                <InputText
                  v-model="textValue"
                  disabled
                  placeholder="Disabled Input"
                  class="w-full"
                />
                <InputText
                  v-model="textValue"
                  invalid
                  placeholder="Invalid Input"
                  class="w-full"
                />

                <IconField>
                  <InputIcon class="pi pi-search" />
                  <InputText
                    v-model="textValue"
                    placeholder="With Icon (Left)"
                    class="w-full"
                  />
                </IconField>

                <IconField>
                  <InputText
                    v-model="textValue"
                    placeholder="With Icon (Right)"
                    class="w-full"
                  />
                  <InputIcon class="pi pi-user" />
                </IconField>

                <FloatLabel>
                  <InputText
                    id="username"
                    v-model="textValue"
                    class="w-full"
                  />
                  <label for="username">Float Label</label>
                </FloatLabel>

                <InputGroup>
                  <InputGroupAddon>
                    <i class="pi pi-user"></i>
                  </InputGroupAddon>
                  <InputText placeholder="Username" />
                </InputGroup>

                <InputGroup>
                  <InputGroupAddon>$</InputGroupAddon>
                  <InputNumber placeholder="Price" />
                  <InputGroupAddon>.00</InputGroupAddon>
                </InputGroup>
              </div>
            </div>

            <!-- Selection Group -->
            <div class="space-y-4">
              <span class="text-sm font-medium text-muted-foreground uppercase tracking-wider"
                >Selection Inputs</span
              >

              <div class="space-y-4 p-4 border border-border rounded-xl bg-card/50">
                <Select
                  v-model="selectValue"
                  :options="cities"
                  option-label="name"
                  placeholder="Select City"
                  class="w-full"
                />
                <MultiSelect
                  v-model="multiSelectValue"
                  :options="cities"
                  option-label="name"
                  placeholder="Multi Select"
                  class="w-full"
                />

                <div class="grid grid-cols-2 gap-2">
                  <CascadeSelect
                    v-model="cascadeValue"
                    :options="cascadeOptions"
                    option-label="cname"
                    option-group-label="name"
                    :option-group-children="['states', 'cities']"
                    placeholder="Cascade"
                    class="w-full"
                  />
                  <TreeSelect
                    v-model="treeSelectValue"
                    :options="treeNodes"
                    placeholder="Tree Select"
                    class="w-full"
                  />
                </div>

                <AutoComplete
                  v-model="autoCompleteValue"
                  :suggestions="filteredItems"
                  option-label="name"
                  placeholder="Auto Complete"
                  class="w-full"
                  dropdown
                  @complete="searchItems"
                />

                <InputChips
                  v-model="inputChipsValue"
                  separator=","
                  placeholder="Input Chips (Enter)"
                  class="w-full"
                />
              </div>
            </div>

            <!-- Masks & Pickers -->
            <div class="space-y-4">
              <span class="text-sm font-medium text-muted-foreground uppercase tracking-wider"
                >Masks & Pickers</span
              >

              <div class="space-y-4 p-4 border border-border rounded-xl bg-card/50">
                <InputNumber
                  v-model="numberValue"
                  show-buttons
                  mode="currency"
                  currency="USD"
                  placeholder="Price"
                  class="w-full"
                />
                <Password
                  v-model="passwordValue"
                  toggle-mask
                  placeholder="Password"
                  class="w-full"
                  :feedback="true"
                />

                <DatePicker
                  v-model="dateValue"
                  show-icon
                  fluid
                  icon-display="input"
                  placeholder="Select Date"
                  class="w-full"
                />

                <div class="flex items-center gap-4">
                  <ColorPicker v-model="colorValue" />
                  <span class="text-sm font-mono text-muted-foreground">#{{ colorValue }}</span>
                </div>

                <Slider
                  v-model="sliderValue"
                  class="w-full mt-2"
                />

                <div class="flex items-center justify-between">
                  <Rating v-model="ratingValue" />
                  <Knob
                    v-model="knobValue"
                    :size="50"
                  />
                </div>
              </div>
            </div>

            <!-- Checks & Radios -->
            <div class="space-y-4">
              <span class="text-sm font-medium text-muted-foreground uppercase tracking-wider"
                >Checks, Radios & Switches</span
              >

              <div class="grid grid-cols-2 gap-4 p-4 border border-border rounded-xl bg-card/50">
                <div class="space-y-3">
                  <div class="flex items-center gap-2">
                    <Checkbox
                      v-model="checkboxValue"
                      :binary="true"
                      input-id="check1"
                    />
                    <label for="check1">Checkbox</label>
                  </div>
                  <div class="flex items-center gap-2">
                    <RadioButton
                      v-model="radioValue"
                      input-id="radio1"
                      value="Option 1"
                    />
                    <label for="radio1">Radio 1</label>
                  </div>
                  <div class="flex items-center gap-2">
                    <RadioButton
                      v-model="radioValue"
                      input-id="radio2"
                      value="Option 2"
                    />
                    <label for="radio2">Radio 2</label>
                  </div>
                </div>

                <div class="space-y-3">
                  <div class="flex items-center gap-2">
                    <ToggleSwitch v-model="switchValue" />
                    <span>Switch</span>
                  </div>
                  <ToggleButton
                    v-model="toggleButtonValue"
                    on-label="Locked"
                    off-label="Unlocked"
                    on-icon="pi pi-lock"
                    off-icon="pi pi-lock-open"
                    class="w-full"
                    v-bind="{ 'aria-label': 'Do you confirm' }"
                  />
                </div>

                <div class="col-span-2">
                  <SelectButton
                    v-model="selectButtonValue"
                    :options="selectButtonOptions"
                    option-label="name"
                    class="w-full"
                  />
                </div>
              </div>
            </div>

            <!-- Rich Input -->
            <div class="space-y-4 md:col-span-2 lg:col-span-2">
              <span class="text-sm font-medium text-muted-foreground uppercase tracking-wider"
                >Rich Text & List Box</span
              >
              <div class="grid grid-cols-2 gap-4 p-4 border border-border rounded-xl bg-card/50">
                <Textarea
                  v-model="textareaValue"
                  rows="5"
                  placeholder="Textarea"
                  class="w-full h-full"
                />
                <Listbox
                  v-model="listboxValue"
                  :options="cities"
                  option-label="name"
                  class="w-full"
                  list-style="height: 120px"
                />
              </div>
            </div>
          </div>
        </section>

        <!-- 2. Buttons -->
        <section class="space-y-6">
          <div class="flex items-center gap-2 text-primary border-b border-border pb-2">
            <i class="pi pi-box text-xl"></i>
            <h2 class="text-xl font-semibold">2. Buttons</h2>
          </div>

          <div class="grid grid-cols-1 gap-6">
            <!-- Basic Severities -->
            <div class="card space-y-3">
              <span class="font-medium block text-sm text-muted-foreground uppercase tracking-wider"
                >Severities</span
              >
              <div class="flex flex-wrap gap-2">
                <Button
                  label="Primary"
                  severity="primary"
                />
                <Button
                  label="Secondary"
                  severity="secondary"
                />
                <Button
                  label="Success"
                  severity="success"
                />
                <Button
                  label="Info"
                  severity="info"
                />
                <Button
                  label="Warn"
                  severity="warn"
                />
                <Button
                  label="Danger"
                  severity="danger"
                />
                <Button
                  label="Contrast"
                  severity="contrast"
                />
              </div>
            </div>

            <!-- Variants -->
            <div class="card space-y-3">
              <span class="font-medium block text-sm text-muted-foreground uppercase tracking-wider"
                >Variants (Outlined / Text / Icon)</span
              >
              <div class="flex flex-wrap gap-2">
                <Button
                  label="Outlined"
                  severity="primary"
                  variant="outlined"
                />
                <Button
                  label="Text"
                  severity="primary"
                  variant="text"
                />
                <Button
                  label="Link"
                  severity="primary"
                  variant="link"
                />
                <Button
                  icon="pi pi-check"
                  aria-label="Filter"
                />
                <Button
                  label="Icon Left"
                  icon="pi pi-check"
                />
                <Button
                  label="Icon Right"
                  icon="pi pi-check"
                  icon-pos="right"
                />
                <Button
                  label="Loading"
                  loading
                />
                <Button
                  label="Raised"
                  raised
                />
                <Button
                  label="Rounded"
                  rounded
                />
              </div>
            </div>

            <!-- Groups & Complex Buttons -->
            <div class="card space-y-3">
              <span class="font-medium block text-sm text-muted-foreground uppercase tracking-wider"
                >Groups & Complex</span
              >
              <div class="flex flex-wrap gap-4 items-center h-20">
                <!-- Added height for SpeedDial absolute positioning demo if needed, but here relative -->
                <ButtonGroup>
                  <Button
                    label="Save"
                    icon="pi pi-check"
                  />
                  <Button
                    label="Delete"
                    icon="pi pi-trash"
                    severity="danger"
                  />
                  <Button
                    icon="pi pi-times"
                    severity="danger"
                  />
                </ButtonGroup>

                <SplitButton
                  label="Save"
                  icon="pi pi-plus"
                  :model="splitButtonItems"
                />

                <div class="relative w-12 h-12">
                  <!-- SpeedDial usually needs fixed/absolute. Mocking relative here for demo -->
                  <SpeedDial
                    :model="speedDialItems"
                    direction="right"
                    style="position: absolute; top: 0; left: 0"
                    :radius="80"
                    type="semi-circle"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 3. Data -->
        <section class="space-y-6">
          <div class="flex items-center gap-2 text-primary border-b border-border pb-2">
            <i class="pi pi-list text-xl"></i>
            <h2 class="text-xl font-semibold">3. Data</h2>
          </div>

          <div class="space-y-8">
            <!-- DataTable -->
            <div class="card">
              <span
                class="font-medium block mb-4 text-sm text-muted-foreground uppercase tracking-wider"
                >DataTable</span
              >
              <DataTable
                :value="tableData"
                table-style="min-width: 50rem"
                removable-sort
                paginator
                :rows="5"
                :rows-per-page-options="[5, 10, 20]"
              >
                <Column
                  field="name"
                  header="Name"
                  sortable
                ></Column>
                <Column
                  field="category"
                  header="Category"
                  sortable
                ></Column>
                <Column
                  field="quantity"
                  header="Quantity"
                  sortable
                ></Column>
                <Column
                  field="rating"
                  header="Rating"
                  sortable
                >
                  <template #body="slotProps">
                    <Rating
                      :model-value="slotProps.data.rating"
                      readonly
                    />
                  </template>
                </Column>
                <Column header="Status">
                  <template #body="slotProps">
                    <Tag
                      :value="slotProps.data.status"
                      :severity="
                        slotProps.data.status === 'INSTOCK'
                          ? 'success'
                          : slotProps.data.status === 'LOWSTOCK'
                            ? 'warn'
                            : 'danger'
                      "
                    />
                  </template>
                </Column>
              </DataTable>
            </div>

            <!-- DataView & PickList -->
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div class="card space-y-3">
                <span
                  class="font-medium block text-sm text-muted-foreground uppercase tracking-wider"
                  >PickList</span
                >
                <PickList
                  v-model="pickListValue"
                  data-key="value"
                  breakpoint="1400px"
                  scroll-height="200px"
                >
                  <template #sourceheader> Available </template>
                  <template #targetheader> Selected </template>
                  <template #item="slotProps">
                    <div class="flex flex-wrap p-2 align-items-center gap-3">
                      <span class="font-bold">{{ slotProps.item.label }}</span>
                    </div>
                  </template>
                </PickList>
              </div>

              <div class="card space-y-3">
                <span
                  class="font-medium block text-sm text-muted-foreground uppercase tracking-wider"
                >
                  OrderList
                </span>
                <OrderList
                  v-model="orderListValue"
                  list-style="height:auto"
                  data-key="value"
                >
                  <template #header> Cities </template>
                  <template #option="slotProps">
                    <div class="flex align-items-center p-2 w-full flex-wrap">
                      <span class="font-bold">{{ slotProps.option.label }}</span>
                    </div>
                  </template>
                </OrderList>
              </div>
            </div>

            <!-- Tree & Timeline -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div class="card">
                <span
                  class="font-medium block mb-4 text-sm text-muted-foreground uppercase tracking-wider"
                  >Tree</span
                >
                <Tree
                  :value="treeNodes"
                  class="w-full md:w-30rem"
                />
              </div>

              <div class="card">
                <span
                  class="font-medium block mb-4 text-sm text-muted-foreground uppercase tracking-wider"
                  >Timeline</span
                >
                <Timeline :value="timelineEvents">
                  <template #opposite="slotProps">
                    <small class="text-muted-foreground">{{ slotProps.item.date }}</small>
                  </template>
                  <template #content="slotProps">
                    <span class="text-foreground">{{ slotProps.item.status }}</span>
                  </template>
                </Timeline>
              </div>
            </div>

            <!-- Org Chart -->
            <div class="card overflow-x-auto">
              <span
                class="font-medium block mb-4 text-sm text-muted-foreground uppercase tracking-wider"
                >Organization Chart</span
              >
              <OrganizationChart
                :value="organizationData"
                collapsible
              >
                <template #person="slotProps">
                  <div class="flex flex-col">
                    <div class="flex flex-col items-center">
                      <img
                        :src="slotProps.node.data.avatar"
                        class="mb-3 w-12 h-12 rounded-full"
                      />
                      <span class="font-bold mb-2">{{ slotProps.node.data.name }}</span>
                      <span>{{ slotProps.node.data.label }}</span>
                    </div>
                  </div>
                </template>
              </OrganizationChart>
            </div>
          </div>
        </section>

        <!-- 4. Panels -->
        <section class="space-y-6">
          <div class="flex items-center gap-2 text-primary border-b border-border pb-2">
            <i class="pi pi-clone text-xl"></i>
            <h2 class="text-xl font-semibold">4. Panels</h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Card -->
            <Card>
              <template #title>Card Title</template>
              <template #subtitle>Card Subtitle</template>
              <template #content>
                <p class="m-0">Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>
              </template>
              <template #footer>
                <div class="flex gap-4 mt-1">
                  <Button
                    label="Cancel"
                    severity="secondary"
                    outlined
                    class="w-full"
                  />
                  <Button
                    label="Save"
                    class="w-full"
                  />
                </div>
              </template>
            </Card>

            <!-- Panel & Fieldset -->
            <div class="space-y-6">
              <Panel
                header="Panel Header"
                toggleable
              >
                <p class="m-0">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
              </Panel>
              <Fieldset
                legend="Fieldset"
                toggleable
              >
                <p class="m-0">Content inside a fieldset.</p>
              </Fieldset>
            </div>

            <!-- Accordion -->
            <Accordion value="0">
              <AccordionPanel value="0">
                <AccordionHeader>Accordion 1</AccordionHeader>
                <AccordionContent>
                  <p class="m-0">Content for Accordion 1</p>
                </AccordionContent>
              </AccordionPanel>
              <AccordionPanel value="1">
                <AccordionHeader>Accordion 2</AccordionHeader>
                <AccordionContent>
                  <p class="m-0">Content for Accordion 2</p>
                </AccordionContent>
              </AccordionPanel>
            </Accordion>

            <!-- Tabs -->
            <div class="card md:col-span-2">
              <Tabs value="0">
                <TabList>
                  <Tab value="0">Header I</Tab>
                  <Tab value="1">Header II</Tab>
                  <Tab value="2">Header III</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel value="0">
                    <p class="m-0">Content I</p>
                  </TabPanel>
                  <TabPanel value="1">
                    <p class="m-0">Content II</p>
                  </TabPanel>
                  <TabPanel value="2">
                    <p class="m-0">Content III</p>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </div>

            <!-- Splitter & Toolbar -->
            <div class="md:col-span-2 space-y-6">
              <Splitter
                style="height: 200px"
                class="mb-5"
              >
                <SplitterPanel class="flex align-items-center justify-content-center p-4">
                  Panel 1
                </SplitterPanel>
                <SplitterPanel class="flex align-items-center justify-content-center p-4">
                  Panel 2
                </SplitterPanel>
              </Splitter>

              <Toolbar>
                <template #start>
                  <Button
                    icon="pi pi-plus"
                    class="mr-2"
                    severity="secondary"
                    text
                  />
                  <Button
                    icon="pi pi-print"
                    class="mr-2"
                    severity="secondary"
                    text
                  />
                  <Button
                    icon="pi pi-upload"
                    severity="secondary"
                    text
                  />
                </template>
                <template #center>
                  <IconField>
                    <InputIcon>
                      <i class="pi pi-search" />
                    </InputIcon>
                    <InputText placeholder="Search" />
                  </IconField>
                </template>
                <template #end>
                  <SplitButton
                    label="Save"
                    icon="pi pi-check"
                    :model="splitButtonItems"
                  ></SplitButton
                ></template>
              </Toolbar>
            </div>
          </div>
        </section>

        <!-- 5. Overlays -->
        <section class="space-y-6">
          <div class="flex items-center gap-2 text-primary border-b border-border pb-2">
            <i class="pi pi-window-maximize text-xl"></i>
            <h2 class="text-xl font-semibold">5. Overlays</h2>
          </div>

          <div class="flex flex-wrap gap-4 card">
            <Button
              label="Show Dialog"
              icon="pi pi-external-link"
              @click="visibleDialog = true"
            />
            <Dialog
              v-model:visible="visibleDialog"
              modal
              header="Header"
              :style="{ width: '50rem' }"
            >
              <p class="mb-5">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
              <div class="flex justify-end gap-2">
                <Button
                  type="button"
                  label="Cancel"
                  severity="secondary"
                  @click="visibleDialog = false"
                ></Button>
                <Button
                  type="button"
                  label="Save"
                  @click="visibleDialog = false"
                ></Button>
              </div>
            </Dialog>

            <Button
              label="Show Drawer"
              icon="pi pi-arrow-left"
              @click="visibleDrawer = true"
            />
            <Drawer
              v-model:visible="visibleDrawer"
              header="Drawer"
            >
              <p>Lorem ipsum dolor sit amet.</p>
            </Drawer>

            <Button
              label="Show Popover"
              icon="pi pi-info-circle"
              @click="togglePopover"
            />
            <Popover ref="op">
              <div class="flex flex-col gap-4 w-[25rem]">
                <div>
                  <span class="font-medium block mb-2">Popover Content</span>
                  <InputText class="w-full mb-2" />
                  <Button
                    label="Save"
                    class="w-full"
                  />
                </div>
              </div>
            </Popover>

            <Button
              ref="popupBtn"
              label="Confirm Popup"
              @click="confirmPopup($event)"
            />
            <ConfirmPopup></ConfirmPopup>

            <Button
              v-tooltip="'This is a tooltip!'"
              label="Tooltip"
              severity="secondary"
            />
          </div>
        </section>

        <!-- 6. File -->
        <section class="space-y-6">
          <div class="flex items-center gap-2 text-primary border-b border-border pb-2">
            <i class="pi pi-upload text-xl"></i>
            <h2 class="text-xl font-semibold">6. File</h2>
          </div>
          <div class="card">
            <FileUpload
              name="demo[]"
              url="/api/upload"
              :multiple="true"
              accept="image/*"
              :max-file-size="1000000"
            >
              <template #empty>
                <span>Drag and drop files to here to upload. (Demo)</span>
              </template>
            </FileUpload>
          </div>
        </section>

        <!-- 7. Menu -->
        <section class="space-y-6">
          <div class="flex items-center gap-2 text-primary border-b border-border pb-2">
            <i class="pi pi-bars text-xl"></i>
            <h2 class="text-xl font-semibold">7. Menu</h2>
          </div>
          <div class="space-y-8">
            <div class="card space-y-4">
              <span class="font-medium block text-sm text-muted-foreground uppercase tracking-wider"
                >Menubar & Breadcrumb</span
              >
              <Menubar :model="menuItems" />
              <Breadcrumb
                :model="[{ label: 'Home' }, { label: 'Category' }, { label: 'Detail' }]"
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="card space-y-4">
                <span
                  class="font-medium block text-sm text-muted-foreground uppercase tracking-wider"
                  >Steps</span
                >
                <Steps
                  :model="stepsItems"
                  :active-step="1"
                />
              </div>
              <div class="card space-y-4">
                <span
                  class="font-medium block text-sm text-muted-foreground uppercase tracking-wider"
                  >TabMenu</span
                >
                <TabMenu :model="menuItems" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="card flex justify-center">
                <Menu :model="menuItems" />
              </div>
              <div class="card flex justify-center">
                <TieredMenu :model="tieredItems" />
              </div>
              <div class="card flex justify-center">
                <PanelMenu
                  :model="panelMenuItems"
                  class="w-full md:w-20rem"
                />
              </div>
            </div>

            <div
              class="card h-[200px] relative overflow-hidden bg-muted/20 rounded-xl flex items-end justify-center"
            >
              <span class="absolute top-2 left-2 text-sm text-muted-foreground">Dock Demo</span>
              <Dock
                :model="dockItems"
                position="bottom"
              />
            </div>
          </div>
        </section>

        <!-- 9. Messages -->
        <section class="space-y-6">
          <div class="flex items-center gap-2 text-primary border-b border-border pb-2">
            <i class="pi pi-bell text-xl"></i>
            <h2 class="text-xl font-semibold">9. Messages</h2>
          </div>
          <div class="card space-y-6">
            <div class="flex flex-wrap gap-2">
              <Button
                label="Success"
                severity="success"
                @click="showToast('success')"
              />
              <Button
                label="Info"
                severity="info"
                @click="showToast('info')"
              />
              <Button
                label="Warn"
                severity="warn"
                @click="showToast('warn')"
              />
              <Button
                label="Error"
                severity="danger"
                @click="showToast('error')"
              />
              <Button
                label="Secondary"
                severity="secondary"
                @click="showToast('secondary')"
              />
              <Button
                label="Contrast"
                severity="contrast"
                @click="showToast('contrast')"
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Message severity="success">Success Message</Message>
                <Message severity="info">Info Message</Message>
                <Message severity="warn">Warn Message</Message>
                <Message severity="error">Error Message</Message>
                <Message severity="secondary">Secondary Message</Message>
                <Message severity="contrast">Contrast Message</Message>
              </div>
              <div class="space-y-2">
                <InlineMessage severity="success">Inline Success</InlineMessage>
                <InlineMessage severity="info">Inline Info</InlineMessage>
                <InlineMessage severity="warn">Inline Warn</InlineMessage>
                <InlineMessage severity="error">Inline Error</InlineMessage>
                <InlineMessage severity="secondary">Inline Secondary</InlineMessage>
                <InlineMessage severity="contrast">Inline Contrast</InlineMessage>
              </div>
            </div>
          </div>
        </section>

        <!-- 10. Media -->
        <section class="space-y-6">
          <div class="flex items-center gap-2 text-primary border-b border-border pb-2">
            <i class="pi pi-images text-xl"></i>
            <h2 class="text-xl font-semibold">10. Media</h2>
          </div>
          <div class="grid grid-cols-1 gap-6">
            <div class="card space-y-4">
              <span class="font-medium block text-sm text-muted-foreground uppercase tracking-wider"
                >Galleria</span
              >
              <Galleria
                :value="images"
                :responsive-options="responsiveOptions"
                :num-visible="5"
                container-style="max-width: 640px"
                circular
                :auto-play="true"
                :transition-interval="2000"
              >
                <template #item="slotProps">
                  <img
                    :src="slotProps.item.itemImageSrc"
                    :alt="slotProps.item.alt"
                    style="width: 100%; display: block"
                  />
                </template>
                <template #thumbnail="slotProps">
                  <img
                    :src="slotProps.item.thumbnailImageSrc"
                    :alt="slotProps.item.alt"
                    style="display: block"
                  />
                </template>
              </Galleria>
            </div>

            <div class="card">
              <span
                class="font-medium block text-sm text-muted-foreground uppercase tracking-wider mb-4"
                >Avatar Group</span
              >
              <AvatarGroup>
                <Avatar
                  image="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png"
                  size="large"
                  shape="circle"
                />
                <Avatar
                  image="https://primefaces.org/cdn/primevue/images/avatar/asiyajavayant.png"
                  size="large"
                  shape="circle"
                />
                <Avatar
                  image="https://primefaces.org/cdn/primevue/images/avatar/onyamalimba.png"
                  size="large"
                  shape="circle"
                />
                <Avatar
                  label="+2"
                  shape="circle"
                  size="large"
                  :style="{ 'background-color': '#9c27b0', color: '#ffffff' }"
                />
              </AvatarGroup>
            </div>
          </div>
        </section>

        <!-- 11. Misc -->
        <section class="space-y-6">
          <div class="flex items-center gap-2 text-primary border-b border-border pb-2">
            <i class="pi pi-cog text-xl"></i>
            <h2 class="text-xl font-semibold">11. Misc</h2>
          </div>
          <div class="card space-y-6">
            <div class="flex flex-wrap gap-2 align-items-end">
              <Tag value="Primary" />
              <Tag
                severity="success"
                value="Success"
              />
              <Tag
                severity="warn"
                value="Warn"
                rounded
              />
              <Badge value="2" />
              <Badge
                value="10+"
                severity="danger"
              />
              <Chip
                label="Chip"
                icon="pi pi-apple"
              />
            </div>

            <div class="space-y-3">
              <span class="font-medium block text-sm text-muted-foreground uppercase tracking-wider"
                >Loading</span
              >
              <ProgressBar
                mode="indeterminate"
                style="height: 6px"
              ></ProgressBar>
              <div class="flex gap-2">
                <Skeleton
                  shape="circle"
                  size="4rem"
                />
                <div class="flex-1 space-y-2">
                  <Skeleton width="100%" />
                  <Skeleton width="75%" />
                </div>
              </div>
            </div>

            <div class="space-y-3">
              <span class="font-medium block text-sm text-muted-foreground uppercase tracking-wider"
                >ScrollTop (Scroll down to see)</span
              >
              <ScrollTop
                target="parent"
                :threshold="100"
                class="custom-scrolltop"
                icon="pi pi-arrow-up"
              />
            </div>
          </div>
        </section>
      </div>
    </CScrollbar>
  </div>
</template>

<style scoped>
.card {
  @apply p-4 border border-border rounded-lg bg-card text-card-foreground shadow-sm;
}
</style>
