<script setup lang="tsx">
defineOptions({ name: 'ExampleProFormAdvancedPage' })

import type { PropType, VNode } from 'vue'
import type { FormSchema, ProFormExpose } from '@/components/ProForm'
import { useFieldArray, useFormContext } from '@/components/ProForm'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Icons from '@/components/Icons/Icons.vue'

interface ContactItem {
  type: 'email' | 'phone' | 'wechat'
  value: string
}

const CONTACT_TYPE_OPTIONS = [
  { label: '邮箱', value: 'email' as const },
  { label: '手机', value: 'phone' as const },
  { label: '微信', value: 'wechat' as const },
]

// ══════════════════════════════════════════════════════════════════
// Section A: 动态字段数组（slot-based useFieldArray 演示）
// ══════════════════════════════════════════════════════════════════

const arraySchema = reactive<FormSchema>({
  layout: { type: 'grid', gap: 'var(--spacing-md)' },
  fields: [
    {
      name: 'name',
      component: 'input',
      label: '联系人姓名',
      required: true,
      props: { placeholder: '输入联系人姓名' },
    },
    {
      name: 'contacts',
      component: 'input',
      label: '联系方式',
      defaultValue: [{ type: 'email', value: '' }] as ContactItem[],
    },
    {
      name: 'users',
      component: 'input',
      label: '用户列表（useFieldArray 演示）',
      defaultValue: [{ username: '' }] as { username: string }[],
    },
  ],
})

// 本地子组件：显式使用 useFieldArray('users') 渲染动态列表
/* eslint-disable vue/one-component-per-file */
const UsersFieldArray = defineComponent({
  name: 'UsersFieldArray',
  setup() {
    const controller = useFormContext()
    const { fields, append, remove } = useFieldArray<{ username: string }>('users')
    function setItem(index: number, value: { username: string }): void {
      const arr = (controller.getValues().users as { username: string }[]) ?? []
      const next = [...arr]
      next[index] = value
      controller.setFieldsValue({ users: next })
    }
    return { fields, append, remove, setItem }
  },
  render(): VNode {
    const fieldsList = unref(this.fields)

    return (
      <div class="col-stretch gap-sm w-full">
        {fieldsList.map(
          (item: { id: string; value: { username: string }; index: number }, i: number) => (
            <div
              key={item.id}
              class="row-center gap-sm w-full"
            >
              <InputText
                modelValue={(item.value as { username: string }).username}
                {...{
                  'onUpdate:modelValue': (v: string) => this.setItem(i, { username: v }),
                }}
                class="flex-1"
                placeholder="用户名"
              />
              <Button
                severity="danger"
                text
                size="small"
                onClick={() => this.remove(i)}
              >
                删除
              </Button>
            </div>
          )
        )}
        <Button
          label="+ 添加用户"
          severity="secondary"
          size="small"
          class="w-fit"
          onClick={() => this.append({ username: '' })}
        />
      </div>
    )
  },
})

const arraySubmitResult = ref<string>('')

async function onArraySubmit(values: Record<string, unknown>): Promise<void> {
  arraySubmitResult.value = JSON.stringify(values, null, 2)
  window.$toast?.successIn('top-right', '提交成功', '动态字段数组已序列化')
}

// 数组操作辅助（等价于 useFieldArray append/remove/move）
function appendContact(current: ContactItem[], onUpdate: (v: unknown) => void): void {
  onUpdate([...current, { type: 'email' as const, value: '' }])
}

function removeContact(
  current: ContactItem[],
  index: number,
  onUpdate: (v: unknown) => void
): void {
  onUpdate(current.filter((_, i) => i !== index))
}

function moveContact(
  current: ContactItem[],
  from: number,
  to: number,
  onUpdate: (v: unknown) => void
): void {
  if (to < 0 || to >= current.length) return
  const arr = [...current]
  const [item] = arr.splice(from, 1)
  arr.splice(to, 0, item as ContactItem)
  onUpdate(arr)
}

function updateContactField(
  current: ContactItem[],
  index: number,
  key: keyof ContactItem,
  value: string,
  onUpdate: (v: unknown) => void
): void {
  onUpdate(current.map((c, i) => (i === index ? { ...c, [key]: value } : c)))
}

/** 插槽内使用的联系人列表组件：在 script 中提供 contactList 可写计算属性，消除模板中的类型断言 */
const ContactsFieldContent = defineComponent({
  name: 'ContactsFieldContent',
  props: {
    state: { type: Object as PropType<{ value: unknown }>, required: true },
    onUpdate: { type: Function as PropType<(v: unknown) => void>, required: true },
  },
  setup(props) {
    const contactList = computed<ContactItem[]>({
      get: () => (props.state?.value as ContactItem[] | undefined) ?? [],
      set: (newVal: ContactItem[]) => props.onUpdate(newVal),
    })
    return {
      contactList,
      CONTACT_TYPE_OPTIONS,
      updateContactField,
      moveContact,
      removeContact,
      appendContact,
      slotOnUpdate: props.onUpdate,
    }
  },
  render() {
    const { contactList, CONTACT_TYPE_OPTIONS: opts, slotOnUpdate } = this
    const list = contactList as unknown as ContactItem[]
    return (
      <div class="col-stretch gap-sm w-full">
        {list.map((item: ContactItem, index: number) => (
          <div
            key={index}
            class="row-center gap-sm w-full"
          >
            <Select
              modelValue={item.type}
              options={opts}
              optionLabel="label"
              optionValue="value"
              class="w-1/4 shrink-0"
              {...{
                'onUpdate:modelValue': (v?: string) =>
                  this.updateContactField(list, index, 'type', v ?? '', slotOnUpdate),
              }}
            />
            <InputText
              modelValue={item.value}
              class="flex-1"
              placeholder={
                item.type === 'email'
                  ? 'user@example.com'
                  : item.type === 'phone'
                    ? '+86 138...'
                    : '微信号'
              }
              {...{
                'onUpdate:modelValue': (v?: string) =>
                  this.updateContactField(list, index, 'value', v ?? '', slotOnUpdate),
              }}
            />
            <Button
              severity="secondary"
              text
              disabled={index === 0}
              onClick={() => this.moveContact(list, index, index - 1, slotOnUpdate)}
            >
              <Icons
                name="i-lucide-arrow-up"
                size="sm"
              />
            </Button>
            <Button
              severity="secondary"
              text
              disabled={index === list.length - 1}
              onClick={() => this.moveContact(list, index, index + 1, slotOnUpdate)}
            >
              <Icons
                name="i-lucide-arrow-down"
                size="sm"
              />
            </Button>
            <Button
              severity="danger"
              text
              disabled={list.length <= 1}
              onClick={() => this.removeContact(list, index, slotOnUpdate)}
            >
              <Icons
                name="i-lucide-trash-2"
                size="sm"
              />
            </Button>
          </div>
        ))}
        <Button
          label="+ 添加联系方式"
          severity="secondary"
          size="small"
          class="w-fit"
          onClick={() => this.appendContact(list, slotOnUpdate)}
        />
      </div>
    )
  },
})

// ══════════════════════════════════════════════════════════════════
// Section B: persistKey + autoSave — 草稿自动保存
// ══════════════════════════════════════════════════════════════════

const DRAFT_KEY = 'pro-form-advanced-draft-demo'
const { formatDate, now, isInitialized } = useDateUtils()

const draftSchema = reactive<FormSchema>({
  layout: { type: 'grid', gap: 'var(--spacing-md)' },
  fields: [
    {
      name: 'draftTitle',
      component: 'input',
      label: '标题',
      props: { placeholder: '输入内容后刷新页面，草稿会自动恢复' },
    },
    {
      name: 'draftContent',
      component: 'textarea',
      label: '正文',
      props: { placeholder: '正文内容...', rows: 4 },
    },
    {
      name: 'draftCategory',
      component: 'select',
      label: '分类',
      options: [
        { label: '技术', value: 'tech' },
        { label: '产品', value: 'product' },
        { label: '运营', value: 'ops' },
      ],
    },
    {
      name: 'draftPriority',
      component: 'radio',
      label: '优先级',
      defaultValue: 'medium',
      options: [
        { label: '低', value: 'low' },
        { label: '中', value: 'medium' },
        { label: '高', value: 'high' },
      ],
    },
  ],
})

const draftFormRef = ref<ProFormExpose | null>(null)
const draftLastSaved = ref<string>('')
const draftSaveCount = ref<number>(0)
const { pause: pauseDraftCounter, resume: resumeDraftCounter } = useIntervalFn(
  () => {
    const s = localStorage.getItem(DRAFT_KEY)
    if (!s) return
    draftSaveCount.value++
    const current = now()
    if (current && isInitialized.value) {
      draftLastSaved.value = formatDate(current, 'HH:mm:ss')
    }
  },
  1500,
  { immediate: false }
)

onMounted(() => {
  const stored = localStorage.getItem(DRAFT_KEY)
  if (stored) {
    draftLastSaved.value = '（已有草稿）'
  }
  resumeDraftCounter()
})

onUnmounted(() => {
  pauseDraftCounter()
})

async function onDraftSubmit(values: Record<string, unknown>): Promise<void> {
  localStorage.removeItem(DRAFT_KEY)
  draftLastSaved.value = ''
  draftSaveCount.value = 0
  console.log('Draft form submitted:', values)
  window.$toast?.successIn('top-right', '提交成功', '草稿已清除')
}

function clearDraft(): void {
  localStorage.removeItem(DRAFT_KEY)
  draftLastSaved.value = ''
  draftSaveCount.value = 0
  draftFormRef.value?.form?.reset()
  window.$toast?.infoIn('top-right', '草稿已清除', '表单已重置为初始状态')
}
</script>

<template>
  <div
    data-archetype="A1-toolbar-content"
    class="col-fill"
  >
    <!-- Toolbar: Hero Header (Transparent Root Policy: Inherit canvas) -->
    <header class="shrink-0 border-b-default border-primary/20">
      <div class="layout-container py-sm row-center gap-md">
        <div class="p-md bg-primary/10 rounded-lg shrink-0">
          <Icons
            name="i-lucide-list-plus"
            class="text-primary text-2xl"
          />
        </div>
        <div class="col-stretch gap-xs">
          <h1 class="text-2xl font-bold text-foreground m-0">ProForm 动态数组与高级扩展</h1>
          <p class="text-muted-foreground text-sm m-0">
            演示
            <code>useFieldArray</code>
            动态字段列表（append / remove / move）与
            <code>persistKey + autoSave</code>
            草稿自动保存。
          </p>
        </div>
      </div>
    </header>
    <div
      class="shrink-0 px-md py-xs text-xs text-muted-foreground border-b-default border-border/15"
    >
      覆盖能力：useFieldArray（append/remove/move）、具名插槽字段接管、persistKey + autoSave
      草稿恢复。
    </div>

    <!-- Scrollable content -->
    <CScrollbar class="col-fill">
      <div class="layout-container py-md col-stretch gap-xl pb-xl">
        <!-- Section A: 动态字段数组 -->
        <section class="material-elevated col-stretch gap-lg">
          <div class="row-center gap-sm border-b-default pb-sm mb-sm">
            <Icons
              name="i-lucide-list-plus"
              class="text-primary"
            />
            <span class="font-semibold text-foreground uppercase tracking-wider">
              useFieldArray — 动态字段数组
            </span>
          </div>

          <div class="col-stretch gap-md">
            <div class="border-b-default pb-sm mb-sm">
              <p class="text-muted-foreground text-sm m-0">
                通过
                <code>append / remove / move</code>
                动态管理联系方式列表。字段渲染通过
                <code>#field-contacts</code>
                具名插槽实现。
              </p>
            </div>

            <ProForm
              :schema="arraySchema"
              :initial-values="{ name: '', contacts: [{ type: 'email', value: '' }] }"
              @submit="onArraySubmit"
            >
              <template #field-contacts="{ state: fieldState, onUpdate: onFieldUpdate }">
                <ContactsFieldContent
                  :state="fieldState"
                  :on-update="onFieldUpdate"
                />
              </template>

              <template #field-users>
                <UsersFieldArray />
              </template>

              <template #footer="{ submit, formState: slotFormState }">
                <div class="row-end gap-sm pt-md border-t-default border-border/15 mt-md">
                  <Button
                    label="提交数据"
                    icon="i-lucide-send"
                    :loading="slotFormState.submitting"
                    @click="submit"
                  />
                </div>
              </template>
            </ProForm>

            <div
              v-if="arraySubmitResult"
              class="bg-muted rounded-md p-md border-default border-border/40"
            >
              <div class="text-xs font-bold text-muted-foreground uppercase mb-xs">
                Submit Result:
              </div>
              <pre class="m-0 whitespace-pre-wrap break-words text-xs text-muted-foreground">{{
                arraySubmitResult
              }}</pre>
            </div>
          </div>
        </section>

        <!-- Section B: persistKey + autoSave -->
        <section class="material-elevated col-stretch gap-lg">
          <div class="row-between gap-sm border-b-default pb-sm mb-sm">
            <div class="row-center gap-sm">
              <Icons
                name="i-lucide-save"
                class="text-success"
              />
              <span class="font-semibold text-foreground uppercase tracking-wider">
                persistKey + autoSave — 草稿自动保存
              </span>
            </div>
            <div
              v-if="draftLastSaved"
              class="bg-success/10 text-success rounded-md px-sm py-0.5 row-center gap-xs text-xs"
            >
              <Icons
                name="i-lucide-check-circle"
                size="xs"
              />
              <span>已保存 {{ draftLastSaved }} ({{ draftSaveCount }}次)</span>
            </div>
            <div
              v-else
              class="bg-muted/30 text-muted-foreground rounded-md px-sm py-0.5 row-center gap-xs text-xs"
            >
              <Icons
                name="i-lucide-cloud"
                size="xs"
              />
              <span class="italic">修改后自动保存</span>
            </div>
          </div>

          <div class="col-stretch gap-md">
            <div class="border-b-default pb-sm mb-sm">
              <p class="text-muted-foreground text-sm m-0">
                变更自动写入
                <code>localStorage</code>
                。刷新页面后草稿自愈。
              </p>
            </div>

            <ProForm
              ref="draftFormRef"
              :schema="draftSchema"
              :persist-key="DRAFT_KEY"
              :auto-save="true"
              @submit="onDraftSubmit"
            >
              <template #footer="{ submit, formState }">
                <div class="row-end gap-sm pt-md border-t-default border-border/15 mt-md">
                  <Button
                    label="重置并清除"
                    severity="secondary"
                    variant="text"
                    :disabled="formState.submitting"
                    @click="clearDraft"
                  />
                  <Button
                    label="提交并清除草稿"
                    icon="i-lucide-cloud-upload"
                    :loading="formState.submitting"
                    @click="submit"
                  />
                </div>
              </template>
            </ProForm>
          </div>
        </section>
      </div>
    </CScrollbar>
  </div>
</template>
