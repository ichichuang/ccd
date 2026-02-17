<script setup lang="ts">
import { ref, computed, nextTick, onBeforeUnmount, watch } from 'vue'
import { useThrottleFn } from '@vueuse/core'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import PvDataTable from 'primevue/datatable'
import Column from 'primevue/column'
import type { ScrollbarInstance } from '@/components/CScrollbar'

// --- 导航锚点（单一数据源，驱动左侧标题与右侧目录树） ---
interface SectionMeta {
  id: string
  /** 目录中的序号前缀，如 1. / 3.1 */
  indexLabel: string
  /** 短标签文案，如 Button / Select / MultiSelect */
  label: string
}

const sectionMeta: SectionMeta[] = [
  { id: 'section-button', indexLabel: '1.', label: 'Button' },
  { id: 'section-input', indexLabel: '2.', label: '输入框' },
  { id: 'section-select', indexLabel: '3.', label: 'Select / MultiSelect' },
  { id: 'section-selectbutton', indexLabel: '3.1', label: 'SelectButton' },
  { id: 'section-autocomplete', indexLabel: '3.2', label: 'AutoComplete / Listbox' },
  { id: 'section-checkbox', indexLabel: '4.', label: 'Checkbox / Radio / ToggleSwitch' },
  { id: 'section-date', indexLabel: '5.', label: 'DatePicker' },
  { id: 'section-slider', indexLabel: '6.', label: 'Slider / Rating' },
  { id: 'section-tag', indexLabel: '7.', label: 'Tag / Badge / Chip' },
  {
    id: 'section-divider',
    indexLabel: '7.1',
    label: 'Divider / InlineMessage / Fieldset',
  },
  { id: 'section-card', indexLabel: '8.', label: 'Card / Panel' },
  { id: 'section-datatable', indexLabel: '9.', label: 'DataTable' },
  { id: 'section-message', indexLabel: '10.', label: 'Message / Toast' },
  { id: 'section-dialog', indexLabel: '11.', label: 'Dialog / ConfirmPopup' },
  { id: 'section-drawer', indexLabel: '11.1', label: 'Drawer / Popover' },
  { id: 'section-menu', indexLabel: '12.', label: 'Menu / Menubar / ContextMenu' },
  { id: 'section-tab-accordion', indexLabel: '12.1', label: 'Tabs / Accordion' },
  { id: 'section-tree', indexLabel: '12.2', label: 'Tree / Paginator' },
  {
    id: 'section-upload',
    indexLabel: '12.3',
    label: 'FileUpload / ProgressSpinner / BlockUI',
  },
  {
    id: 'section-floatlabel',
    indexLabel: '12.4',
    label: 'FloatLabel / ScrollPanel / Splitter',
  },
  { id: 'section-other', indexLabel: '13.', label: 'Breadcrumb / ProgressBar / Skeleton' },
]

// 简化数组供 Scroll Spy 使用（保持现有 id/label 结构）
const sections: { id: string; label: string }[] = sectionMeta.map(({ id, label }) => ({
  id,
  label,
}))

// --- Scroll Spy & 目录导航 ---
const scrollbarRef = ref<ScrollbarInstance | null>(null)
const tocScrollbarRef = ref<ScrollbarInstance | null>(null)
const tocAsideRef = ref<HTMLElement | null>(null)
const activeSectionId = ref<string | null>(sections[0]?.id ?? null) // 默认激活第一项
const isScrolling = ref(false) // 防止点击滚动时触发 scroll spy
let intersectionObserver: IntersectionObserver | null = null

// 右侧目录树数据（使用 PrimeVue Tree）
const tocTreeNodes = computed(() =>
  sectionMeta.map(meta => ({
    key: meta.id,
    label: `${meta.indexLabel} ${meta.label}`,
  }))
)

// 右侧目录树选中状态（与 activeSectionId 联动）
const tocSelectionKeys = ref<Record<string, boolean> | undefined>(undefined)

watch(
  activeSectionId,
  id => {
    if (!id) {
      // 始终保持有激活项，fallback 到第一项
      activeSectionId.value = sections[0]?.id ?? null
      return
    }
    tocSelectionKeys.value = { [id]: true }
    nextTick(scrollTocToActive)
  },
  { immediate: true } // 立即执行，确保初始状态有高亮
)

/**
 * 将右侧目录树中当前高亮项滚入视口，保证高亮项始终可见
 * 当左侧滚动导致高亮变化时，右侧若高亮项在视口外则自动跟随滚动
 */
function scrollTocToActive() {
  const aside = tocAsideRef.value
  if (!aside) return
  const el =
    aside.querySelector<HTMLElement>('.p-treenode[aria-selected="true"]') ??
    aside.querySelector<HTMLElement>('.p-treenode.p-highlight')
  if (el) {
    el.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }
}

/**
 * 获取 CScrollbar 内部的滚动容器元素
 * 这是 Scroll Spy 和 scrollTo 的 root 元素
 */
function getScrollElement(): HTMLElement | null {
  const instance = scrollbarRef.value?.getInstance()
  if (!instance) return null
  const { scrollOffsetElement } = instance.elements()
  return scrollOffsetElement
}

/**
 * 统一的滚动偏移量常量
 * - SCROLL_OFFSET: 点击目录项时，section 顶部距离视口顶部的距离
 * - DETECTION_BUFFER: 额外缓冲，确保检测锚点落在 section 内部而非边界
 *   需要足够大以跳过 card padding + h2 标题 + 间距，确保落在内容区
 */
const SCROLL_OFFSET = 80
const DETECTION_BUFFER = 50

/**
 * 点击目录项 → 滚动到对应 section
 * 使用 CScrollbar 的 scrollTo API，计算精确位置
 */
function scrollToSection(id: string) {
  // 临时禁用 scroll spy，避免滚动过程中频繁更新
  isScrolling.value = true
  activeSectionId.value = id // 立即更新高亮

  nextTick(() => {
    const scrollEl = getScrollElement()
    const targetEl = document.getElementById(id)
    if (!scrollEl || !targetEl) {
      isScrolling.value = false
      return
    }

    // 计算目标 section 相对于滚动容器的位置
    const scrollRect = scrollEl.getBoundingClientRect()
    const targetRect = targetEl.getBoundingClientRect()
    const currentScrollTop = scrollEl.scrollTop
    const targetOffsetTop = currentScrollTop + targetRect.top - scrollRect.top

    // 滚动到目标位置（减去偏移量，避免被顶部遮挡）
    scrollbarRef.value?.scrollTo({
      top: Math.max(0, targetOffsetTop - SCROLL_OFFSET),
      behavior: 'smooth',
    })

    // 滚动动画结束后恢复 scroll spy（smooth 动画通常 300-500ms）
    setTimeout(() => {
      isScrolling.value = false
    }, 500)
  })
}

/**
 * 根据当前滚动位置计算应高亮的 section
 * 检测锚点 = scrollTop + SCROLL_OFFSET + DETECTION_BUFFER
 * 这样点击滚动后，锚点会落在 section 内部，而非边界
 *
 * 特殊处理：当滚动到底部时，优先选择最后一个可见的 section
 */
function computeActiveSectionFromScroll(): void {
  if (isScrolling.value) return

  const scrollEl = getScrollElement()
  if (!scrollEl) return

  const scrollRect = scrollEl.getBoundingClientRect()
  const scrollTop = scrollEl.scrollTop
  const scrollHeight = scrollEl.scrollHeight
  const clientHeight = scrollEl.clientHeight

  // 边缘检测：是否已滚动到底部（允许 5px 误差）
  const isAtBottom = scrollTop + clientHeight >= scrollHeight - 5

  // 如果滚动到底部，直接选择最后一个 section
  if (isAtBottom && sections.length > 0) {
    activeSectionId.value = sections[sections.length - 1].id
    return
  }

  // 检测锚点：偏移量 + 缓冲，确保落在 section 内部
  const viewportAnchor = scrollTop + SCROLL_OFFSET + DETECTION_BUFFER

  let containingId: string | null = null
  let fallbackId: string | null = null
  let fallbackTop = -Infinity // 满足 elTop <= anchor 的最大 elTop

  sections.forEach(section => {
    const el = document.getElementById(section.id)
    if (!el) return

    const rect = el.getBoundingClientRect()
    const elTop = scrollTop + rect.top - scrollRect.top
    const elBottom = elTop + rect.height

    if (viewportAnchor >= elTop && viewportAnchor <= elBottom) {
      containingId = section.id
    }
    if (elTop <= viewportAnchor && elTop >= fallbackTop) {
      fallbackTop = elTop
      fallbackId = section.id
    }
  })

  const targetId = containingId ?? fallbackId
  if (targetId && sections.some(s => s.id === targetId)) {
    activeSectionId.value = targetId
  }
}

// 节流版：用于 @scroll 事件，避免滚动时频繁计算
const throttledComputeActiveSection = useThrottleFn(computeActiveSectionFromScroll, 80)

/**
 * 初始化 Scroll Spy（IntersectionObserver + @scroll 双重保障）
 * - IO 回调：entries 仅含变化元素，不可靠；统一改为遍历所有 section 计算最近一个
 * - @scroll：IO 未跨越 threshold 时不触发，补充 scroll 事件确保慢速滚动也更新
 */
function initScrollSpy() {
  const scrollEl = getScrollElement()
  if (!scrollEl) return

  intersectionObserver = new IntersectionObserver(
    () => {
      computeActiveSectionFromScroll()
    },
    {
      root: scrollEl,
      rootMargin: '-64px 0px -40% 0px',
      threshold: [0, 0.25, 0.5, 0.75, 1],
    }
  )

  sections.forEach(section => {
    const el = document.getElementById(section.id)
    if (el) {
      intersectionObserver!.observe(el)
    }
  })
}

/**
 * 右侧目录树节点选择事件
 * 使用 PrimeVue Tree 的 node-select 事件
 */
function onTocNodeSelect(node: { key?: string }) {
  const key = node.key
  if (typeof key === 'string') {
    scrollToSection(key)
  }
}

/**
 * CScrollbar 初始化完成回调
 * 因 CScrollbar 默认 defer: true，OverlayScrollbars 异步初始化，
 * 必须在 @initialized 后再启动 Scroll Spy，否则 getScrollElement() 为 null
 */
function onScrollbarInitialized() {
  nextTick(() => {
    initScrollSpy()
    computeActiveSectionFromScroll() // 初始高亮当前可见的 section
    scrollTocToActive() // 保证右侧目录高亮项在视口内
  })
}

// --- 生命周期 ---

onBeforeUnmount(() => {
  // 清理 IntersectionObserver
  intersectionObserver?.disconnect()
  intersectionObserver = null
})

// --- Button ---
const loading = ref(false)
function load() {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 2000)
}

// --- Input ---（PrimeVue 部分组件 modelValue 类型含 undefined，此处统一允许）
const inputText = ref<string | undefined>('')
const inputPassword = ref<string | undefined>('')
const textareaVal = ref<string | undefined>('')
const inputNumberVal = ref<number | null>(null)

// --- Select ---
const selectCity = ref<string | null>(null)
const cities = [
  { name: '北京', code: 'bj' },
  { name: '上海', code: 'sh' },
  { name: '广州', code: 'gz' },
]
const multiSelectVal = ref<string[]>([])
const multiOptions = ['Vue', 'React', 'Angular', 'Svelte']

// --- Checkbox / Radio / Toggle ---
const checkboxVal = ref(false)
const checkboxGroup = ref<string[]>([])
const radioVal = ref('')
const toggleVal = ref(false)

// --- DatePicker ---
const dateVal = ref<Date | Date[] | (Date | null)[] | null | undefined>(null)

// --- Slider / Rating ---
const sliderVal = ref<number | number[]>(50)
const sliderRangeVal = ref<number | number[]>([20, 80])
const ratingVal = ref<number | undefined>(3)

// --- DataTable ---
interface Product {
  id: number
  code: string
  name: string
  category: string
  quantity: number
}
const products = ref<Product[]>([
  { id: 1, code: 'P001', name: '产品 A', category: '分类1', quantity: 10 },
  { id: 2, code: 'P002', name: '产品 B', category: '分类2', quantity: 20 },
  { id: 3, code: 'P003', name: '产品 C', category: '分类1', quantity: 15 },
])
const selectedProduct = ref<Product | null>(null)

// --- Dialog ---
const dialogVisible = ref(false)

// --- Toast (useToast) ---
const toast = useToast()
function showToast(severity: 'success' | 'info' | 'warn' | 'danger') {
  const pvSeverity = severity === 'danger' ? 'error' : severity
  toast.add({
    severity: pvSeverity,
    summary:
      severity === 'success'
        ? '成功'
        : severity === 'danger'
          ? '错误'
          : severity === 'warn'
            ? '警告'
            : '信息',
    detail: '这是一条 PrimeVue useToast 消息',
    life: 3000,
  })
}

// --- ConfirmPopup ---
const confirm = useConfirm()
function confirmDelete() {
  confirm.require({
    message: '确定要删除该项吗？',
    header: '删除确认',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: '取消',
    acceptLabel: '删除',
    acceptClass: 'p-button-danger',
    accept: () => {
      toast.add({ severity: 'info', summary: '已确认删除', life: 2000 })
    },
  })
}

// --- Menu ---
const menuItems = ref([
  { label: '新建', icon: 'pi pi-plus' },
  { label: '打开', icon: 'pi pi-folder-open' },
  { label: '保存', icon: 'pi pi-save' },
  { separator: true },
  { label: '退出', icon: 'pi pi-sign-out' },
])
const menuRef = ref()
function toggleMenu(event: Event) {
  menuRef.value?.toggle(event)
}

// --- Tabs (v4 替代 TabView) ---
const activeTab = ref<string | number>('0')

// --- Accordion ---（组件可能 emit undefined，用单绑 + 事件接收）
const activeAccordion = ref<number | number[] | undefined>(0)

// --- Breadcrumb ---
interface BreadcrumbItem {
  label: string
  route?: string
}
const breadcrumbItems = computed<BreadcrumbItem[]>(() => [
  { label: '首页', route: '/' },
  { label: '示例', route: '/example' },
  { label: 'PrimeVue' },
])

// --- ProgressBar ---
const progressVal = ref(60)

// --- SelectButton ---
const selectButtonVal = ref('one')
const selectButtonOptions = [
  { label: '选项一', value: 'one' },
  { label: '选项二', value: 'two' },
  { label: '选项三', value: 'three' },
]

// --- AutoComplete ---
const autoCompleteVal = ref<string | undefined>('')
const autoCompleteSuggestions = ref<string[]>([])
const allSuggestions = ['Apple', 'Apricot', 'Banana', 'Berry', 'Cherry', 'Grape', 'Orange']
function onAutoCompleteSearch(event: { query: string }) {
  const q = event.query.toLowerCase()
  autoCompleteSuggestions.value = allSuggestions.filter(s => s.toLowerCase().includes(q))
}

// --- Listbox ---
const listboxVal = ref<string | null>(null)
const listboxOptions = ['选项 A', '选项 B', '选项 C', '选项 D']

// --- Drawer ---
const drawerVisible = ref(false)

// --- Popover ---
const popoverRef = ref()
function togglePopover(event: Event) {
  popoverRef.value?.toggle(event)
}

// --- ContextMenu ---
const contextMenuRef = ref()
const contextMenuItems = [
  { label: '复制', icon: 'pi pi-copy' },
  { label: '粘贴', icon: 'pi pi-clipboard' },
  { separator: true },
  { label: '删除', icon: 'pi pi-trash', severity: 'danger' as const },
]
function onContextMenu(event: MouseEvent) {
  contextMenuRef.value?.show(event)
}

// --- Tree ---
interface TreeNode {
  key: string
  label: string
  children?: TreeNode[]
}
const treeNodes = ref<TreeNode[]>([
  {
    key: '0',
    label: '根节点',
    children: [
      { key: '0-0', label: '子节点 1' },
      { key: '0-1', label: '子节点 2', children: [{ key: '0-1-0', label: '孙节点' }] },
    ],
  },
])
// Tree selection-keys 类型为 Record<string, unknown>，单选时为 { [key]: true }
const selectedNodeKeys = ref<Record<string, boolean> | undefined>(undefined)

// --- Paginator ---
const paginatorFirst = ref(0)
const paginatorRows = ref(5)
const paginatorTotal = ref(100)
function onPaginatorPage(event: { first: number; rows: number }) {
  paginatorFirst.value = event.first
  paginatorRows.value = event.rows
}

// --- FileUpload ---
function onFileUploadSelect() {
  toast.add({ severity: 'info', summary: '已选择文件', life: 2000 })
}

// --- BlockUI ---
const blockUIVisible = ref(false)

// --- FloatLabel ---
const floatLabelVal = ref<string | undefined>('')
</script>

<template>
  <!-- 最外层：全屏 Flex 容器 (80% / 20%) -->
  <div class="h-full w-full flex overflow-hidden bg-background">
    <!-- 左侧：主内容 (80%) -->
    <div class="w-[80%] h-full flex flex-col min-w-0">
      <CScrollbar
        ref="scrollbarRef"
        class="h-full"
        @initialized="onScrollbarInitialized"
        @scroll="throttledComputeActiveSection"
      >
        <div class="p-padding-lg w-full max-w-[80vw] mx-auto flex flex-col gap-xl">
          <!-- 1. Button -->
          <section
            :id="sections[0].id"
            class="scroll-mt-gap-lg"
          >
            <div
              class="bg-card component-border rounded-scale-md shadow-sm p-padding-lg flex flex-col gap-md transition-all duration-scale-md hover:shadow-md"
            >
              <h2 class="fs-xl font-semibold text-foreground flex items-center gap-sm m-0">
                {{ sectionMeta[0].indexLabel }} {{ sectionMeta[0].label }}
              </h2>
              <div class="flex flex-wrap items-center gap-md">
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
                  label="Info"
                  severity="info"
                />
                <Button
                  label="Warn"
                  severity="warn"
                />
                <Button
                  label="Help"
                  severity="help"
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
              <div class="flex flex-wrap items-center gap-md">
                <Button
                  label="Primary"
                  raised
                />
                <Button
                  label="Secondary"
                  severity="secondary"
                  raised
                />
                <Button
                  label="Success"
                  severity="success"
                  raised
                />
                <Button
                  label="Info"
                  severity="info"
                  raised
                />
                <Button
                  label="Warn"
                  severity="warn"
                  raised
                />
                <Button
                  label="Help"
                  severity="help"
                  raised
                />
                <Button
                  label="Danger"
                  severity="danger"
                  raised
                />
                <Button
                  label="Contrast"
                  severity="contrast"
                  raised
                />
              </div>
              <div class="flex flex-wrap items-center gap-md">
                <Button
                  label="Primary"
                  rounded
                />
                <Button
                  label="Secondary"
                  severity="secondary"
                  rounded
                />
                <Button
                  label="Success"
                  severity="success"
                  rounded
                />
                <Button
                  label="Info"
                  severity="info"
                  rounded
                />
                <Button
                  label="Warn"
                  severity="warn"
                  rounded
                />
                <Button
                  label="Help"
                  severity="help"
                  rounded
                />
                <Button
                  label="Danger"
                  severity="danger"
                  rounded
                />
                <Button
                  label="Contrast"
                  severity="contrast"
                  rounded
                />
              </div>
              <div class="flex flex-wrap items-center gap-md">
                <Button
                  label="Primary"
                  variant="text"
                />
                <Button
                  label="Secondary"
                  severity="secondary"
                  variant="text"
                />
                <Button
                  label="Success"
                  severity="success"
                  variant="text"
                />
                <Button
                  label="Info"
                  severity="info"
                  variant="text"
                />
                <Button
                  label="Warn"
                  severity="warn"
                  variant="text"
                />
                <Button
                  label="Help"
                  severity="help"
                  variant="text"
                />
                <Button
                  label="Danger"
                  severity="danger"
                  variant="text"
                />
                <Button
                  label="Contrast"
                  severity="contrast"
                  variant="text"
                />
              </div>
              <div class="flex flex-wrap items-center gap-md">
                <Button
                  label="Primary"
                  variant="text"
                  raised
                />
                <Button
                  label="Secondary"
                  severity="secondary"
                  variant="text"
                  raised
                />
                <Button
                  label="Success"
                  severity="success"
                  variant="text"
                  raised
                />
                <Button
                  label="Info"
                  severity="info"
                  variant="text"
                  raised
                />
                <Button
                  label="Warn"
                  severity="warn"
                  variant="text"
                  raised
                />
                <Button
                  label="Help"
                  severity="help"
                  variant="text"
                  raised
                />
                <Button
                  label="Danger"
                  severity="danger"
                  variant="text"
                  raised
                />
                <Button
                  label="Contrast"
                  severity="contrast"
                  variant="text"
                  raised
                />
              </div>
              <div class="flex flex-wrap items-center gap-md">
                <Button
                  label="Primary"
                  variant="outlined"
                />
                <Button
                  label="Secondary"
                  severity="secondary"
                  variant="outlined"
                />
                <Button
                  label="Success"
                  severity="success"
                  variant="outlined"
                />
                <Button
                  label="Info"
                  severity="info"
                  variant="outlined"
                />
                <Button
                  label="Warn"
                  severity="warn"
                  variant="outlined"
                />
                <Button
                  label="Help"
                  severity="help"
                  variant="outlined"
                />
                <Button
                  label="Danger"
                  severity="danger"
                  variant="outlined"
                />
                <Button
                  label="Contrast"
                  severity="contrast"
                  variant="outlined"
                />
              </div>
              <div class="flex flex-wrap items-center gap-md">
                <Button
                  icon="pi pi-check"
                  aria-label="Filter"
                />
                <Button
                  icon="pi pi-bookmark"
                  severity="secondary"
                  aria-label="Bookmark"
                />
                <Button
                  icon="pi pi-search"
                  severity="success"
                  aria-label="Search"
                />
                <Button
                  icon="pi pi-user"
                  severity="info"
                  aria-label="User"
                />
                <Button
                  icon="pi pi-bell"
                  severity="warn"
                  aria-label="Notification"
                />
                <Button
                  icon="pi pi-heart"
                  severity="help"
                  aria-label="Favorite"
                />
                <Button
                  icon="pi pi-times"
                  severity="danger"
                  aria-label="Cancel"
                />
                <Button
                  icon="pi pi-star"
                  severity="contrast"
                  aria-label="Star"
                />
              </div>
              <div class="flex flex-wrap items-center gap-md">
                <Button label="Basic" />
                <Button
                  label="带图标"
                  icon="pi pi-check"
                />
                <Button
                  label="图标在右"
                  icon="pi pi-arrow-right"
                  icon-pos="right"
                />
                <Button
                  label="Loading"
                  icon="pi pi-search"
                  :loading="loading"
                  @click="load"
                />
                <Button
                  label="Link 风格"
                  variant="link"
                />
                <Button
                  label="Disabled"
                  disabled
                />
              </div>
              <div class="flex flex-wrap items-center gap-sm">
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
              </div>
              <div class="flex flex-wrap items-center gap-sm">
                <Button
                  label="Raised"
                  raised
                />
                <Button
                  label="Rounded"
                  rounded
                />
                <Button
                  label="Text"
                  variant="text"
                />
                <Button
                  label="Outlined"
                  variant="outlined"
                />
              </div>
              <div class="flex flex-wrap items-center gap-sm">
                <Button
                  icon="pi pi-check"
                  aria-label="确定"
                />
                <Button
                  icon="pi pi-times"
                  severity="danger"
                  rounded
                  aria-label="关闭"
                />
                <Button
                  label="Badge"
                  badge="2"
                />
                <Button
                  label="Small"
                  size="small"
                />
                <Button
                  label="Large"
                  size="large"
                />
              </div>
              <div class="flex flex-wrap items-center gap-sm">
                <ButtonGroup>
                  <Button
                    label="保存"
                    icon="pi pi-check"
                  />
                  <Button
                    label="删除"
                    icon="pi pi-trash"
                    severity="danger"
                  />
                  <Button
                    label="取消"
                    icon="pi pi-times"
                    severity="secondary"
                  />
                </ButtonGroup>
              </div>
            </div>
          </section>

          <!-- 2. 输入框 -->
          <section
            :id="sections[1].id"
            class="scroll-mt-gap-lg"
          >
            <div
              class="bg-card component-border rounded-scale-md shadow-sm p-padding-lg flex flex-col gap-md transition-all duration-scale-md hover:shadow-md"
            >
              <h2 class="fs-xl font-semibold text-foreground flex items-center gap-sm m-0">
                {{ sectionMeta[1].indexLabel }} {{ sectionMeta[1].label }}
              </h2>
              <div class="flex flex-col gap-md max-w-md">
                <div class="flex flex-col gap-xs">
                  <label
                    for="input-text"
                    class="text-foreground fs-sm"
                    >InputText</label
                  >
                  <InputText
                    id="input-text"
                    v-model="inputText"
                    type="text"
                    placeholder="请输入"
                  />
                </div>
                <div class="flex flex-col gap-xs">
                  <label
                    for="input-pwd"
                    class="text-foreground fs-sm"
                    >Password</label
                  >
                  <Password
                    id="input-pwd"
                    v-model="inputPassword"
                    placeholder="密码"
                    :feedback="false"
                    toggle-mask
                  />
                </div>
                <div class="flex flex-col gap-xs">
                  <label
                    for="input-textarea"
                    class="text-foreground fs-sm"
                    >Textarea</label
                  >
                  <Textarea
                    id="input-textarea"
                    v-model="textareaVal"
                    rows="3"
                    placeholder="多行文本"
                  />
                </div>
                <div class="flex flex-col gap-xs">
                  <label
                    for="input-num"
                    class="text-foreground fs-sm"
                    >InputNumber</label
                  >
                  <InputNumber
                    v-model="inputNumberVal"
                    :min="0"
                    :max="100"
                    show-buttons
                  />
                </div>
                <div class="flex flex-wrap gap-sm">
                  <InputText
                    v-model="inputText"
                    size="small"
                    placeholder="Small"
                    class="flex-1 min-w-0"
                  />
                  <InputText
                    v-model="inputText"
                    placeholder="Normal"
                    class="flex-1 min-w-0"
                  />
                  <InputText
                    v-model="inputText"
                    size="large"
                    placeholder="Large"
                    class="flex-1 min-w-0"
                  />
                </div>
                <InputText
                  v-model="inputText"
                  fluid
                  placeholder="Fluid 占满宽度"
                />
                <InputText
                  v-model="inputText"
                  variant="filled"
                  placeholder="Filled 变体"
                />
                <InputText
                  v-model="inputText"
                  disabled
                  placeholder="Disabled"
                />
                <InputText
                  v-model="inputText"
                  invalid
                  placeholder="Invalid 校验状态"
                />
              </div>
            </div>
          </section>

          <!-- 3. Select / MultiSelect -->
          <section
            :id="sections[2].id"
            class="scroll-mt-gap-lg"
          >
            <div
              class="bg-card component-border rounded-scale-md shadow-sm p-padding-lg flex flex-col gap-md transition-all duration-scale-md hover:shadow-md"
            >
              <h2 class="fs-xl font-semibold text-foreground flex items-center gap-sm m-0">
                {{ sectionMeta[2].indexLabel }} {{ sectionMeta[2].label }}
              </h2>
              <div class="flex flex-wrap gap-lg">
                <div class="flex flex-col gap-xs min-w-[var(--spacing-4xl)]">
                  <label class="text-foreground fs-sm">Select 单选</label>
                  <Select
                    v-model="selectCity"
                    :options="cities"
                    option-label="name"
                    option-value="code"
                    placeholder="选择城市"
                    show-clear
                  />
                </div>
                <div class="flex flex-col gap-xs min-w-[var(--spacing-5xl)]">
                  <label class="text-foreground fs-sm">MultiSelect</label>
                  <MultiSelect
                    v-model="multiSelectVal"
                    :options="multiOptions"
                    placeholder="多选"
                    :max-selected-labels="2"
                    show-clear
                  />
                </div>
              </div>
            </div>
          </section>

          <!-- 3.1 SelectButton -->
          <section
            :id="sections[3].id"
            class="scroll-mt-gap-lg"
          >
            <div
              class="bg-card component-border rounded-scale-md shadow-sm p-padding-lg flex flex-col gap-md transition-all duration-scale-md hover:shadow-md"
            >
              <h2 class="fs-xl font-semibold text-foreground flex items-center gap-sm m-0">
                {{ sectionMeta[3].indexLabel }} {{ sectionMeta[3].label }}
              </h2>
              <div class="flex flex-wrap gap-md">
                <SelectButton
                  v-model="selectButtonVal"
                  :options="selectButtonOptions"
                  option-label="label"
                  option-value="value"
                />
                <SelectButton
                  v-model="selectButtonVal"
                  :options="selectButtonOptions"
                  option-label="label"
                  option-value="value"
                  multiple
                />
              </div>
            </div>
          </section>

          <!-- 3.2 AutoComplete / Listbox -->
          <section
            :id="sections[4].id"
            class="scroll-mt-gap-lg"
          >
            <div
              class="bg-card component-border rounded-scale-md shadow-sm p-padding-lg flex flex-col gap-md transition-all duration-scale-md hover:shadow-md"
            >
              <h2 class="fs-xl font-semibold text-foreground flex items-center gap-sm m-0">
                {{ sectionMeta[4].indexLabel }} {{ sectionMeta[4].label }}
              </h2>
              <div class="flex flex-wrap gap-lg">
                <div class="flex flex-col gap-xs min-w-[var(--spacing-5xl)]">
                  <label class="text-foreground fs-sm">AutoComplete</label>
                  <AutoComplete
                    v-model="autoCompleteVal"
                    placeholder="输入搜索"
                    :suggestions="autoCompleteSuggestions"
                    @complete="onAutoCompleteSearch"
                  />
                </div>
                <div class="flex flex-col gap-xs min-w-[var(--spacing-4xl)]">
                  <label class="text-foreground fs-sm">Listbox</label>
                  <Listbox
                    v-model="listboxVal"
                    :options="listboxOptions"
                    class="w-full"
                  />
                </div>
              </div>
            </div>
          </section>

          <!-- 4. Checkbox / Radio / ToggleSwitch -->
          <section
            :id="sections[5].id"
            class="scroll-mt-gap-lg"
          >
            <div
              class="bg-card component-border rounded-scale-md shadow-sm p-padding-lg flex flex-col gap-md transition-all duration-scale-md hover:shadow-md"
            >
              <h2 class="fs-xl font-semibold text-foreground flex items-center gap-sm m-0">
                {{ sectionMeta[5].indexLabel }} {{ sectionMeta[5].label }}
              </h2>
              <div class="flex flex-wrap gap-xl">
                <div class="flex flex-col gap-sm">
                  <div class="flex items-center gap-sm">
                    <Checkbox
                      v-model="checkboxVal"
                      input-id="cb1"
                      :binary="true"
                    />
                    <label
                      for="cb1"
                      class="text-foreground"
                      >Checkbox 二元</label
                    >
                  </div>
                  <div class="flex flex-col gap-xs">
                    <span class="text-foreground fs-sm">Checkbox 多选组</span>
                    <div class="flex flex-wrap gap-md">
                      <div class="flex items-center gap-xs">
                        <Checkbox
                          v-model="checkboxGroup"
                          input-id="cb-vue"
                          value="Vue"
                        />
                        <label for="cb-vue">Vue</label>
                      </div>
                      <div class="flex items-center gap-xs">
                        <Checkbox
                          v-model="checkboxGroup"
                          input-id="cb-react"
                          value="React"
                        />
                        <label for="cb-react">React</label>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex flex-col gap-sm">
                  <span class="text-foreground fs-sm">RadioButton</span>
                  <div class="flex flex-wrap gap-md">
                    <div class="flex items-center gap-xs">
                      <RadioButton
                        v-model="radioVal"
                        input-id="r1"
                        value="A"
                      />
                      <label for="r1">A</label>
                    </div>
                    <div class="flex items-center gap-xs">
                      <RadioButton
                        v-model="radioVal"
                        input-id="r2"
                        value="B"
                      />
                      <label for="r2">B</label>
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-sm">
                  <ToggleSwitch
                    v-model="toggleVal"
                    input-id="sw1"
                  />
                  <label
                    for="sw1"
                    class="text-foreground"
                    >ToggleSwitch</label
                  >
                </div>
              </div>
            </div>
          </section>

          <!-- 5. DatePicker -->
          <section
            :id="sections[6].id"
            class="scroll-mt-gap-lg"
          >
            <div
              class="bg-card component-border rounded-scale-md shadow-sm p-padding-lg flex flex-col gap-md transition-all duration-scale-md hover:shadow-md"
            >
              <h2 class="fs-xl font-semibold text-foreground flex items-center gap-sm m-0">
                {{ sectionMeta[6].indexLabel }} {{ sectionMeta[6].label }}
              </h2>
              <div class="flex flex-wrap gap-md">
                <div class="flex flex-col gap-xs">
                  <label class="text-foreground fs-sm">日期</label>
                  <DatePicker
                    v-model="dateVal"
                    date-format="yy-mm-dd"
                    placeholder="选择日期"
                    show-icon
                  />
                  <DatePicker
                    v-model="dateVal"
                    date-format="yy-mm-dd"
                    show-time
                    hour-format="24"
                    placeholder="日期+时间"
                    show-icon
                  />
                </div>
              </div>
            </div>
          </section>

          <!-- 6. Slider / Rating -->
          <section
            :id="sections[7].id"
            class="scroll-mt-gap-lg"
          >
            <div
              class="bg-card component-border rounded-scale-md shadow-sm p-padding-lg flex flex-col gap-md transition-all duration-scale-md hover:shadow-md"
            >
              <h2 class="fs-xl font-semibold text-foreground flex items-center gap-sm m-0">
                {{ sectionMeta[7].indexLabel }} {{ sectionMeta[7].label }}
              </h2>
              <div class="flex flex-wrap gap-xl max-w-md">
                <div class="flex flex-col gap-xs flex-1 min-w-0">
                  <label class="text-foreground fs-sm">Slider: {{ sliderVal }}</label>
                  <Slider
                    v-model="sliderVal"
                    :min="0"
                    :max="100"
                  />
                </div>
                <div class="flex flex-col gap-xs flex-1 min-w-0">
                  <label class="text-foreground fs-sm">Slider Range: {{ sliderRangeVal }}</label>
                  <Slider
                    v-model="sliderRangeVal"
                    :min="0"
                    :max="100"
                    range
                  />
                </div>
                <div class="flex flex-col gap-xs">
                  <label class="text-foreground fs-sm">Rating</label>
                  <Rating v-model="ratingVal" />
                </div>
              </div>
            </div>
          </section>

          <!-- 7. Tag / Badge / Chip -->
          <section
            :id="sections[8].id"
            class="scroll-mt-gap-lg"
          >
            <div
              class="bg-card component-border rounded-scale-md shadow-sm p-padding-lg flex flex-col gap-md transition-all duration-scale-md hover:shadow-md"
            >
              <h2 class="fs-xl font-semibold text-foreground flex items-center gap-sm m-0">
                {{ sectionMeta[8].indexLabel }} {{ sectionMeta[8].label }}
              </h2>
              <div class="flex flex-wrap items-center gap-md">
                <Tag value="Primary" />
                <Tag
                  value="Success"
                  severity="success"
                />
                <Tag
                  value="Info"
                  severity="info"
                />
                <Tag
                  value="Warn"
                  severity="warn"
                />
                <Tag
                  value="Danger"
                  severity="danger"
                />
                <Tag
                  value="Secondary"
                  severity="secondary"
                />
                <Badge value="9" />
                <Badge
                  value="99+"
                  severity="danger"
                />
                <Chip
                  label="可删除 Chip"
                  removable
                />
                <Chip
                  label="带图标"
                  icon="pi pi-vue"
                />
              </div>
            </div>
          </section>

          <!-- 7.1 Divider / InlineMessage / Fieldset -->
          <section
            :id="sections[9].id"
            class="scroll-mt-gap-lg"
          >
            <div
              class="bg-card component-border rounded-scale-md shadow-sm p-padding-lg flex flex-col gap-md transition-all duration-scale-md hover:shadow-md"
            >
              <h2 class="fs-xl font-semibold text-foreground flex items-center gap-sm m-0">
                {{ sectionMeta[9].indexLabel }} {{ sectionMeta[9].label }}
              </h2>
              <div class="flex flex-col gap-md">
                <div class="flex items-center gap-sm">
                  <span class="text-foreground fs-sm">左侧</span>
                  <Divider layout="vertical" />
                  <span class="text-foreground fs-sm">右侧</span>
                </div>
                <Divider align="center">
                  <span class="text-muted-foreground fs-sm">分割线文字</span>
                </Divider>
                <div class="max-w-md">
                  <InlineMessage severity="info">InlineMessage 内联提示</InlineMessage>
                </div>
                <Fieldset
                  legend="Fieldset 图例"
                  class="max-w-md"
                  toggleable
                >
                  <p class="text-muted-foreground fs-sm m-0">可折叠的 Fieldset 内容区域。</p>
                </Fieldset>
              </div>
            </div>
          </section>

          <!-- 8. Card / Panel -->
          <section
            :id="sections[10].id"
            class="scroll-mt-gap-lg"
          >
            <div
              class="bg-card component-border rounded-scale-md shadow-sm p-padding-lg flex flex-col gap-md transition-all duration-scale-md hover:shadow-md"
            >
              <h2 class="fs-xl font-semibold text-foreground flex items-center gap-sm m-0">
                {{ sectionMeta[10].indexLabel }} {{ sectionMeta[10].label }}
              </h2>
              <div class="flex flex-wrap gap-lg">
                <Card class="flex-1 min-w-[var(--spacing-5xl)] max-w-[80vw]">
                  <template #title>Card 标题</template>
                  <template #subtitle>副标题</template>
                  <template #content>
                    <p class="text-muted-foreground fs-sm m-0">
                      卡片内容区域，可使用默认 slot 或自定义。
                    </p>
                  </template>
                  <template #footer>
                    <div class="flex gap-sm">
                      <Button
                        label="确定"
                        size="small"
                      />
                      <Button
                        label="取消"
                        severity="secondary"
                        size="small"
                        variant="outlined"
                      />
                    </div>
                  </template>
                </Card>
                <Panel
                  header="Panel 可折叠"
                  class="flex-1 min-w-[var(--spacing-5xl)] max-w-[80vw]"
                  toggleable
                >
                  <p class="text-muted-foreground fs-sm m-0">Panel 内容，点击标题可折叠/展开。</p>
                </Panel>
              </div>
            </div>
          </section>

          <!-- 9. DataTable -->
          <section
            :id="sections[11].id"
            class="scroll-mt-gap-lg"
          >
            <div
              class="bg-card component-border rounded-scale-md shadow-sm p-padding-lg flex flex-col gap-md transition-all duration-scale-md hover:shadow-md"
            >
              <h2 class="fs-xl font-semibold text-foreground flex items-center gap-sm m-0">
                {{ sectionMeta[11].indexLabel }} {{ sectionMeta[11].label }}
              </h2>
              <PvDataTable
                v-model:selection="selectedProduct"
                :value="products"
                data-key="id"
                selection-mode="single"
                paginator
                :rows="2"
                :rows-per-page-options="[2, 5, 10]"
                table-style="min-width: var(--spacing-5xl)"
                class="w-full max-w-[60vw]"
              >
                <Column
                  selection-mode="single"
                  header-style="width: var(--spacing-2xl)"
                />
                <Column
                  field="code"
                  header="Code"
                  sortable
                />
                <Column
                  field="name"
                  header="Name"
                  sortable
                />
                <Column
                  field="category"
                  header="Category"
                />
                <Column
                  field="quantity"
                  header="Quantity"
                />
              </PvDataTable>
              <p class="text-muted-foreground fs-sm">
                已选: {{ selectedProduct ? selectedProduct.name : '无' }}
              </p>
            </div>
          </section>

          <!-- 10. Message / Toast -->
          <section
            :id="sections[12].id"
            class="scroll-mt-gap-lg"
          >
            <div
              class="bg-card component-border rounded-scale-md shadow-sm p-padding-lg flex flex-col gap-md transition-all duration-scale-md hover:shadow-md"
            >
              <h2 class="fs-xl font-semibold text-foreground flex items-center gap-sm m-0">
                {{ sectionMeta[12].indexLabel }} {{ sectionMeta[12].label }}
              </h2>
              <div class="flex flex-col gap-md w-full max-w-[60vw]">
                <Message
                  severity="info"
                  :closable="true"
                  >Info Message，可关闭</Message
                >
                <Message severity="success">Success Message</Message>
                <Message severity="warn">Warn Message</Message>
                <Message severity="error">Danger Message</Message>
                <Message
                  severity="secondary"
                  variant="simple"
                  >Simple 变体 Message</Message
                >
                <div class="flex flex-wrap gap-sm">
                  <Button
                    label="Toast Success"
                    severity="success"
                    size="small"
                    @click="showToast('success')"
                  />
                  <Button
                    label="Toast Info"
                    severity="info"
                    size="small"
                    @click="showToast('info')"
                  />
                  <Button
                    label="Toast Warn"
                    severity="warn"
                    size="small"
                    @click="showToast('warn')"
                  />
                  <Button
                    label="Toast Danger"
                    severity="danger"
                    size="small"
                    @click="showToast('danger')"
                  />
                </div>
              </div>
            </div>
          </section>

          <!-- 11. Dialog / ConfirmPopup -->
          <section
            :id="sections[13].id"
            class="scroll-mt-gap-lg"
          >
            <div
              class="bg-card component-border rounded-scale-md shadow-sm p-padding-lg flex flex-col gap-md transition-all duration-scale-md hover:shadow-md"
            >
              <h2 class="fs-xl font-semibold text-foreground flex items-center gap-sm m-0">
                {{ sectionMeta[13].indexLabel }} {{ sectionMeta[13].label }}
              </h2>
              <p class="text-muted-foreground fs-sm">
                业务中自定义弹窗/确认请使用
                <code class="px-padding-xs rounded-scale-md bg-muted">useDialog()</code> /
                <code class="px-padding-xs rounded-scale-md bg-muted">window.$toast</code>。
              </p>
              <div class="flex flex-wrap gap-sm">
                <Button
                  label="打开 Dialog"
                  @click="dialogVisible = true"
                />
                <Button
                  label="ConfirmPopup 确认"
                  severity="danger"
                  @click="confirmDelete"
                />
              </div>
              <Dialog
                v-model:visible="dialogVisible"
                header="示例 Dialog"
                modal
                draggable
                :style="{ width: 'var(--dialog-settings-width)' }"
                :pt="{
                  root: { class: 'rounded-scale-md' },
                  content: { class: 'pt-0' },
                }"
                @hide="dialogVisible = false"
              >
                <p class="text-muted-foreground fs-sm m-0">
                  Dialog 内容。可设置 modal、draggable、maximizable 等。
                </p>
                <template #footer>
                  <Button
                    label="关闭"
                    severity="secondary"
                    @click="dialogVisible = false"
                  />
                </template>
              </Dialog>
              <ConfirmPopup />
            </div>
          </section>

          <!-- 11.1 Drawer / Popover -->
          <section
            :id="sections[14].id"
            class="scroll-mt-gap-lg"
          >
            <div
              class="bg-card component-border rounded-scale-md shadow-sm p-padding-lg flex flex-col gap-md transition-all duration-scale-md hover:shadow-md"
            >
              <h2 class="fs-xl font-semibold text-foreground flex items-center gap-sm m-0">
                {{ sectionMeta[14].indexLabel }} {{ sectionMeta[14].label }}
              </h2>
              <div class="flex flex-wrap gap-md">
                <Button
                  label="打开 Drawer"
                  @click="drawerVisible = true"
                />
                <Button
                  label="打开 Popover"
                  @click="togglePopover"
                />
                <Popover ref="popoverRef">
                  <div class="flex flex-col gap-sm p-padding-md max-w-xs">
                    <span class="fs-sm font-semibold text-foreground">Popover 内容</span>
                    <p class="text-muted-foreground fs-sm m-0">自定义浮层内容。</p>
                  </div>
                </Popover>
              </div>
              <Drawer
                v-model:visible="drawerVisible"
                position="right"
                header="Drawer 标题"
                class="w-full max-w-sm"
              >
                <p class="text-muted-foreground fs-sm m-0">侧边抽屉内容，可从右滑出。</p>
              </Drawer>
            </div>
          </section>

          <!-- 12. Menu / Menubar / ContextMenu -->
          <section
            :id="sections[15].id"
            class="scroll-mt-gap-lg"
          >
            <div
              class="bg-card component-border rounded-scale-md shadow-sm p-padding-lg flex flex-col gap-md transition-all duration-scale-md hover:shadow-md"
            >
              <h2 class="fs-xl font-semibold text-foreground flex items-center gap-sm m-0">
                {{ sectionMeta[15].indexLabel }} {{ sectionMeta[15].label }}
              </h2>
              <div class="flex flex-col gap-lg">
                <div class="flex flex-wrap items-center gap-md">
                  <Button
                    label="打开 Menu"
                    icon="pi pi-bars"
                    @click="toggleMenu"
                  />
                  <Menu
                    ref="menuRef"
                    :model="menuItems"
                    popup
                  />
                  <Menubar
                    :model="menuItems"
                    class="flex-1 min-w-0 max-w-[60vw]"
                  />
                </div>
                <div>
                  <p class="text-muted-foreground fs-sm mb-padding-xs">
                    右键点击下方区域打开 ContextMenu：
                  </p>
                  <div
                    class="border border-border border-dashed rounded-scale-md p-padding-xl text-center text-muted-foreground fs-sm"
                    @contextmenu="onContextMenu"
                  >
                    右键此处
                  </div>
                  <ContextMenu
                    ref="contextMenuRef"
                    :model="contextMenuItems"
                  />
                </div>
              </div>
            </div>
          </section>

          <!-- 12.1 Tabs / Accordion (v4 使用 Tabs 替代 TabView) -->
          <section
            :id="sections[16].id"
            class="scroll-mt-gap-lg"
          >
            <div
              class="bg-card component-border rounded-scale-md shadow-sm p-padding-lg flex flex-col gap-md transition-all duration-scale-md hover:shadow-md"
            >
              <h2 class="fs-xl font-semibold text-foreground flex items-center gap-sm m-0">
                {{ sectionMeta[16].indexLabel }} {{ sectionMeta[16].label }}
              </h2>
              <div class="flex flex-wrap gap-xl">
                <div class="flex-1 min-w-0 max-w-[60vw]">
                  <Tabs v-model:value="activeTab">
                    <TabList>
                      <Tab value="0">Tab 1</Tab>
                      <Tab value="1">Tab 2</Tab>
                      <Tab value="2">Tab 3</Tab>
                    </TabList>
                    <TabPanels>
                      <TabPanel value="0">
                        <p class="text-muted-foreground fs-sm">Tab 1 内容</p>
                      </TabPanel>
                      <TabPanel value="1">
                        <p class="text-muted-foreground fs-sm">Tab 2 内容</p>
                      </TabPanel>
                      <TabPanel value="2">
                        <p class="text-muted-foreground fs-sm">Tab 3 内容</p>
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </div>
                <div class="flex-1 min-w-0 max-w-[60vw]">
                  <Accordion
                    :active-index="activeAccordion ?? 0"
                    @update:active-index="
                      (v: number | number[] | undefined) => (activeAccordion = v)
                    "
                  >
                    <AccordionPanel value="0">
                      <AccordionHeader>Accordion 1</AccordionHeader>
                      <AccordionContent>
                        <p class="text-muted-foreground fs-sm m-0">手风琴内容 1</p>
                      </AccordionContent>
                    </AccordionPanel>
                    <AccordionPanel value="1">
                      <AccordionHeader>Accordion 2</AccordionHeader>
                      <AccordionContent>
                        <p class="text-muted-foreground fs-sm m-0">手风琴内容 2</p>
                      </AccordionContent>
                    </AccordionPanel>
                  </Accordion>
                </div>
              </div>
            </div>
          </section>

          <!-- 12.2 Tree / Paginator -->
          <section
            :id="sections[17].id"
            class="scroll-mt-gap-lg"
          >
            <div
              class="bg-card component-border rounded-scale-md shadow-sm p-padding-lg flex flex-col gap-md transition-all duration-scale-md hover:shadow-md"
            >
              <h2 class="fs-xl font-semibold text-foreground flex items-center gap-sm m-0">
                {{ sectionMeta[17].indexLabel }} {{ sectionMeta[17].label }}
              </h2>
              <div class="flex flex-wrap gap-xl">
                <div class="flex flex-col gap-xs max-w-xs">
                  <label class="text-foreground fs-sm">Tree</label>
                  <Tree
                    v-model:selection-keys="selectedNodeKeys"
                    :value="treeNodes"
                    selection-mode="single"
                    class="w-full"
                  />
                </div>
                <div class="flex flex-col gap-xs">
                  <label class="text-foreground fs-sm">Paginator 独立分页</label>
                  <Paginator
                    :first="paginatorFirst"
                    :rows="paginatorRows"
                    :total-records="paginatorTotal"
                    :rows-per-page-options="[5, 10, 20]"
                    @page="onPaginatorPage"
                  />
                </div>
              </div>
            </div>
          </section>

          <!-- 12.3 FileUpload / ProgressSpinner / BlockUI -->
          <section
            :id="sections[18].id"
            class="scroll-mt-gap-lg"
          >
            <div
              class="bg-card component-border rounded-scale-md shadow-sm p-padding-lg flex flex-col gap-md transition-all duration-scale-md hover:shadow-md"
            >
              <h2 class="fs-xl font-semibold text-foreground flex items-center gap-sm m-0">
                {{ sectionMeta[18].indexLabel }} {{ sectionMeta[18].label }}
              </h2>
              <div class="flex flex-wrap gap-lg items-start">
                <div class="flex flex-col gap-xs">
                  <label class="text-foreground fs-sm">FileUpload</label>
                  <FileUpload
                    mode="basic"
                    choose-label="选择文件"
                    @select="onFileUploadSelect"
                  />
                </div>
                <div class="flex flex-col gap-sm">
                  <span class="text-foreground fs-sm">ProgressSpinner</span>
                  <ProgressSpinner class="w-[var(--spacing-2xl)] h-[var(--spacing-2xl)]" />
                </div>
                <div class="flex flex-col gap-sm relative">
                  <Button
                    label="切换 BlockUI"
                    @click="blockUIVisible = !blockUIVisible"
                  />
                  <div class="component-border rounded-scale-md p-padding-lg min-h-24 relative">
                    <p class="text-muted-foreground fs-sm m-0">被 BlockUI 遮罩的区域</p>
                    <BlockUI :blocked="blockUIVisible" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 12.4 FloatLabel / ScrollPanel / Splitter -->
          <section
            :id="sections[19].id"
            class="scroll-mt-gap-lg"
          >
            <div
              class="bg-card component-border rounded-scale-md shadow-sm p-padding-lg flex flex-col gap-md transition-all duration-scale-md hover:shadow-md"
            >
              <h2 class="fs-xl font-semibold text-foreground flex items-center gap-sm m-0">
                {{ sectionMeta[19].indexLabel }} {{ sectionMeta[19].label }}
              </h2>
              <div class="flex flex-col gap-lg">
                <div class="max-w-xs">
                  <FloatLabel>
                    <InputText
                      id="float-input"
                      v-model="floatLabelVal"
                      class="w-full"
                    />
                    <label for="float-input">FloatLabel</label>
                  </FloatLabel>
                </div>
                <div class="max-w-md max-h-48 component-border rounded-scale-md overflow-hidden">
                  <ScrollPanel class="w-full h-[var(--spacing-5xl)]">
                    <div class="p-padding-md flex flex-col gap-sm">
                      <p class="text-muted-foreground fs-sm m-0">ScrollPanel 可滚动内容区域。</p>
                      <p class="text-muted-foreground fs-sm m-0">多行内容...</p>
                      <p class="text-muted-foreground fs-sm m-0">多行内容...</p>
                    </div>
                  </ScrollPanel>
                </div>
                <Splitter class="max-w-lg">
                  <SplitterPanel
                    :size="50"
                    :min-size="20"
                    >左侧面板</SplitterPanel
                  >
                  <SplitterPanel
                    :size="50"
                    :min-size="20"
                    >右侧面板</SplitterPanel
                  >
                </Splitter>
              </div>
            </div>
          </section>

          <!-- 13. Breadcrumb / ProgressBar / Skeleton -->
          <section
            :id="sections[20].id"
            class="scroll-mt-gap-lg"
          >
            <div
              class="bg-card component-border rounded-scale-md shadow-sm p-padding-lg flex flex-col gap-md transition-all duration-scale-md hover:shadow-md"
            >
              <h2 class="fs-xl font-semibold text-foreground flex items-center gap-sm m-0">
                {{ sectionMeta[20].indexLabel }} {{ sectionMeta[20].label }}
              </h2>
              <div class="flex flex-col gap-lg">
                <Breadcrumb :model="breadcrumbItems" />
                <div class="flex flex-col gap-xs max-w-md">
                  <label class="text-foreground fs-sm">ProgressBar: {{ progressVal }}%</label>
                  <ProgressBar :value="progressVal" />
                  <ProgressBar
                    mode="indeterminate"
                    class="mt-2"
                  />
                </div>
                <div class="flex flex-col gap-sm max-w-xs">
                  <span class="text-foreground fs-sm">Skeleton 占位</span>
                  <Skeleton
                    width="100%"
                    height="var(--spacing-xl)"
                  />
                  <Skeleton
                    width="80%"
                    height="var(--spacing-xl)"
                  />
                  <Skeleton
                    width="60%"
                    height="var(--spacing-xl)"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </CScrollbar>
    </div>

    <!-- 右侧：目录树 (20%) -->
    <aside
      ref="tocAsideRef"
      class="w-[20%] h-full flex flex-col min-w-0 border-l border-border bg-card hidden lg:flex"
    >
      <!-- 目录标题 -->
      <div class="p-padding-md border-b-default bg-card backdrop-blur-sm">
        <h2 class="fs-md font-bold text-foreground uppercase tracking-wider">目录</h2>
      </div>

      <CScrollbar
        ref="tocScrollbarRef"
        class="flex-1 min-h-0"
      >
        <div class="p-padding-sm">
          <!-- 右侧目录树：使用 PrimeVue Tree -->
          <Tree
            v-model:selection-keys="tocSelectionKeys"
            :value="tocTreeNodes"
            selection-mode="single"
            class="w-full border-none p-0 fs-sm"
            :pt="{
              root: { class: 'bg-transparent' },
              content: {
                class:
                  'rounded-scale-md hover:bg-accent transition-colors duration-scale-sm cursor-pointer',
              },
              label: {
                class:
                  'text-muted-foreground hover:text-foreground transition-colors duration-scale-sm',
              },
            }"
            @node-select="onTocNodeSelect"
          />
        </div>
      </CScrollbar>
    </aside>
  </div>
</template>

<style lang="scss" scoped></style>
