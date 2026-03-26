<script setup lang="ts">
defineOptions({ name: 'PrimeVueExampleView' })

interface OptionItem {
  label: string
  value: string
}

interface MemberItem {
  id: string
  name: string
  role: string
  status: string
}

const basicInput = ref<string | undefined>('')
const iconInput = ref<string | undefined>('')
const floatInput = ref<string | undefined>('')
const maskValue = ref('')
const numberValue = ref<number | null>(88)
const passwordValue = ref('')
const textareaValue = ref('')
const selectedCity = ref<string | null>(null)
const selectedTechs = ref<string[]>([])
const selectedMember = ref<MemberItem | null>(null)
const autoValue = ref<string | undefined>('')
const autoItems = ref<OptionItem[]>([])
const checked = ref(true)
const selectedRadio = ref('A')
const enabled = ref(true)
const sliderValue = ref<number | number[]>(40)
const knobValue = ref(56)
const ratingValue = ref(3)
const pickedDate = ref()
const selectButtonValue = ref('day')
const progressValue = ref(62)
const tablePage = ref(0)
const treeSelectionKeys = ref({})
const activeAccordion = ref<string[] | string | null | undefined>(['0'])
const activeTab = ref<string | number>('overview')
const activeStep = ref<string | number>('1')
const dialogVisible = ref(false)
const drawerVisible = ref(false)
const popoverRef = ref()
const menuRef = ref()

const cities: OptionItem[] = [
  { label: '北京', value: 'bj' },
  { label: '上海', value: 'sh' },
  { label: '广州', value: 'gz' },
  { label: '深圳', value: 'sz' },
]

const techs: OptionItem[] = [
  { label: 'Vue', value: 'vue' },
  { label: 'PrimeVue', value: 'primevue' },
  { label: 'UnoCSS', value: 'unocss' },
  { label: 'TypeScript', value: 'typescript' },
]

const members: MemberItem[] = [
  { id: '1', name: '张三', role: '前端', status: '启用' },
  { id: '2', name: '李四', role: '后端', status: '启用' },
  { id: '3', name: '王五', role: '设计', status: '停用' },
  { id: '4', name: '赵六', role: '测试', status: '启用' },
]

const breadcrumbHome = { icon: 'pi pi-home' }
const breadcrumbItems = [{ label: '示例' }, { label: 'PrimeVue 全量' }]

const splitActions = [
  { label: '复制链接', icon: 'pi pi-copy' },
  { label: '导出截图', icon: 'pi pi-image' },
]

const menuItems = [
  { label: '刷新', icon: 'pi pi-refresh' },
  { label: '导出', icon: 'pi pi-download' },
]

const menubarItems = [
  {
    label: '组件',
    icon: 'pi pi-box',
    items: [{ label: '表单' }, { label: '覆盖层' }, { label: '导航' }],
  },
  {
    label: '主题',
    icon: 'pi pi-palette',
    items: [{ label: 'Light' }, { label: 'Dark' }],
  },
]

const treeNodes = [
  {
    key: '0',
    label: 'Frontend',
    children: [
      { key: '0-0', label: 'Vue' },
      { key: '0-1', label: 'PrimeVue' },
    ],
  },
  {
    key: '1',
    label: 'Backend',
    children: [
      { key: '1-0', label: 'Node.js' },
      { key: '1-1', label: 'Alova' },
    ],
  },
]

const searchAuto = (event: { query: string }): void => {
  const query = event.query.toLowerCase()
  autoItems.value = techs.filter(item => item.label.toLowerCase().includes(query))
}

const openMenu = (event: Event): void => {
  menuRef.value?.toggle(event)
}

const openPopover = (event: Event): void => {
  popoverRef.value?.toggle(event)
}

const pulseProgress = (): void => {
  progressValue.value = progressValue.value >= 95 ? 30 : progressValue.value + 15
}
</script>

<template>
  <div class="layout-container col-stretch gap-md">
    <section class="material-elevated col-stretch gap-md">
      <h2 class="text-lg font-semibold text-foreground">PrimeVue v4 全量官方组件示例</h2>
      <p class="text-sm text-muted-foreground">
        当前页面仅展示 PrimeVue 官方组件，不包含你指定的内部封装组件。
      </p>
    </section>

    <section class="material-elevated col-stretch gap-md">
      <h3 class="text-base font-semibold text-foreground">Button Family</h3>
      <div class="row-start gap-sm flex-wrap">
        <Button label="Primary" />
        <Button
          label="Secondary"
          severity="secondary"
        />
        <Button
          label="Success"
          severity="success"
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
          label="Outlined"
          variant="outlined"
        />
        <Button
          label="Text"
          variant="text"
        />
        <Button
          icon="pi pi-heart"
          rounded
        />
        <SplitButton
          label="SplitButton"
          :model="splitActions"
        />
        <ButtonGroup>
          <Button label="Left" />
          <Button label="Center" />
          <Button label="Right" />
        </ButtonGroup>
      </div>
    </section>

    <section class="material-elevated col-stretch gap-md">
      <h3 class="text-base font-semibold text-foreground">Form Components</h3>
      <div class="row-start gap-sm flex-wrap">
        <InputText
          v-model="basicInput"
          placeholder="InputText"
        />
        <IconField>
          <InputIcon class="pi pi-search" />
          <InputText
            v-model="iconInput"
            placeholder="IconField + InputIcon"
          />
        </IconField>
        <FloatLabel>
          <InputText
            id="float_input"
            v-model="floatInput"
          />
          <label for="float_input">FloatLabel</label>
        </FloatLabel>
        <InputMask
          v-model="maskValue"
          mask="999-999"
          placeholder="InputMask"
        />
        <InputNumber
          v-model="numberValue"
          show-buttons
          placeholder="InputNumber"
        />
        <Password
          v-model="passwordValue"
          toggle-mask
          placeholder="Password"
        />
        <Textarea
          v-model="textareaValue"
          auto-resize
          rows="2"
          placeholder="Textarea"
        />
        <Select
          v-model="selectedCity"
          :options="cities"
          option-label="label"
          option-value="value"
          placeholder="Select"
        />
        <MultiSelect
          v-model="selectedTechs"
          :options="techs"
          option-label="label"
          option-value="value"
          placeholder="MultiSelect"
        />
        <Listbox
          v-model="selectedMember"
          :options="members"
          option-label="name"
          class="w-[220px]"
        />
        <AutoComplete
          v-model="autoValue"
          :suggestions="autoItems"
          option-label="label"
          dropdown
          placeholder="AutoComplete"
          @complete="searchAuto"
        />
      </div>
      <div class="row-start gap-md flex-wrap">
        <div class="row-start gap-xs">
          <Checkbox
            v-model="checked"
            binary
          />
          <span class="text-sm text-foreground">Checkbox</span>
        </div>
        <div class="row-start gap-xs">
          <RadioButton
            v-model="selectedRadio"
            input-id="radio_a"
            value="A"
          />
          <label
            for="radio_a"
            class="text-sm text-foreground"
          >
            Radio A
          </label>
        </div>
        <ToggleSwitch v-model="enabled" />
        <Slider
          v-model="sliderValue"
          class="w-[200px]"
        />
        <Knob v-model="knobValue" />
        <Rating v-model="ratingValue" />
        <DatePicker
          v-model="pickedDate"
          show-icon
          placeholder="DatePicker"
        />
        <SelectButton
          v-model="selectButtonValue"
          :options="[
            { label: 'Day', value: 'day' },
            { label: 'Week', value: 'week' },
            { label: 'Month', value: 'month' },
          ]"
          option-label="label"
          option-value="value"
        />
        <FileUpload
          mode="basic"
          choose-label="FileUpload"
        />
      </div>
    </section>

    <section class="material-elevated col-stretch gap-md">
      <h3 class="text-base font-semibold text-foreground">Data & Feedback</h3>
      <div class="row-start gap-sm flex-wrap">
        <Badge value="8" />
        <Tag value="Tag" />
        <Avatar
          label="A"
          shape="circle"
        />
        <Chip
          label="Chip"
          icon="pi pi-tag"
        />
        <Message severity="success">Message 组件</Message>
        <InlineMessage severity="info">InlineMessage 组件</InlineMessage>
      </div>
      <div class="col-stretch gap-sm">
        <ProgressBar :value="progressValue" />
        <div class="row-start gap-sm">
          <Button
            label="推进进度"
            @click="pulseProgress"
          />
          <ProgressSpinner
            style="width: 40px; height: 40px"
            stroke-width="6"
          />
        </div>
      </div>
      <div class="row-start gap-sm flex-wrap">
        <Skeleton
          width="120px"
          height="20px"
        />
        <Skeleton
          width="240px"
          height="48px"
        />
      </div>
    </section>

    <section class="material-elevated col-stretch gap-md">
      <h3 class="text-base font-semibold text-foreground">DataTable / Tree / Paginator</h3>
      <DataTable
        :value="members"
        data-key="id"
        class="w-full"
      >
        <Column
          field="name"
          header="姓名"
        />
        <Column
          field="role"
          header="角色"
        />
        <Column
          field="status"
          header="状态"
        />
      </DataTable>
      <Tree
        v-model:selection-keys="treeSelectionKeys"
        :value="treeNodes"
        selection-mode="single"
      />
      <Paginator
        v-model:first="tablePage"
        :rows="2"
        :total-records="20"
      />
    </section>

    <section class="material-elevated col-stretch gap-md">
      <h3 class="text-base font-semibold text-foreground">Navigation / Menu</h3>
      <Breadcrumb
        :home="breadcrumbHome"
        :model="breadcrumbItems"
      />
      <Menubar :model="menubarItems" />
      <div class="row-start gap-sm">
        <Button
          label="Menu 弹出"
          @click="openMenu"
        />
        <Menu
          ref="menuRef"
          :model="menuItems"
          popup
        />
      </div>
    </section>

    <section class="material-elevated col-stretch gap-md">
      <h3 class="text-base font-semibold text-foreground">Panel / Container</h3>
      <Card>
        <template #title>Card</template>
        <template #content>Card 组件内容展示。</template>
      </Card>
      <Panel header="Panel">Panel 内容区域。</Panel>
      <Fieldset legend="Fieldset">Fieldset 内容区域。</Fieldset>
      <Divider />
      <Accordion
        v-model:value="activeAccordion"
        multiple
      >
        <AccordionPanel value="0">
          <AccordionHeader>Accordion 1</AccordionHeader>
          <AccordionContent>AccordionContent 1</AccordionContent>
        </AccordionPanel>
        <AccordionPanel value="1">
          <AccordionHeader>Accordion 2</AccordionHeader>
          <AccordionContent>AccordionContent 2</AccordionContent>
        </AccordionPanel>
      </Accordion>
      <Tabs v-model:value="activeTab">
        <TabList>
          <Tab value="overview">Overview</Tab>
          <Tab value="tokens">Tokens</Tab>
        </TabList>
        <TabPanels>
          <TabPanel value="overview">TabPanel Overview</TabPanel>
          <TabPanel value="tokens">TabPanel Tokens</TabPanel>
        </TabPanels>
      </Tabs>
      <Stepper v-model:value="activeStep">
        <StepList>
          <Step value="1">Step 1</Step>
          <Step value="2">Step 2</Step>
        </StepList>
        <StepPanels>
          <StepPanel value="1">StepPanel 1</StepPanel>
          <StepPanel value="2">StepPanel 2</StepPanel>
        </StepPanels>
      </Stepper>
      <Splitter style="height: 140px">
        <SplitterPanel>SplitterPanel Left</SplitterPanel>
        <SplitterPanel>SplitterPanel Right</SplitterPanel>
      </Splitter>
    </section>

    <section class="material-elevated col-stretch gap-md">
      <h3 class="text-base font-semibold text-foreground">Overlay Components</h3>
      <div class="row-start gap-sm flex-wrap">
        <Button
          label="Dialog"
          @click="dialogVisible = true"
        />
        <Button
          label="Drawer"
          @click="drawerVisible = true"
        />
        <Button
          label="Popover"
          @click="openPopover"
        />
        <Button label="ConfirmPopup 触发" />
      </div>
      <Dialog
        v-model:visible="dialogVisible"
        modal
        header="Dialog 示例"
        :style="{ width: '420px' }"
      >
        这是 Dialog 内容区域。
      </Dialog>
      <Drawer
        v-model:visible="drawerVisible"
        header="Drawer 示例"
        position="right"
      >
        这是 Drawer 内容区域。
      </Drawer>
      <Popover ref="popoverRef">
        <div class="col-stretch gap-xs">
          <span class="text-sm text-foreground">Popover 内容</span>
          <span class="text-xs text-muted-foreground">用于轻量悬浮说明</span>
        </div>
      </Popover>
      <ConfirmPopup />
    </section>
  </div>
</template>
