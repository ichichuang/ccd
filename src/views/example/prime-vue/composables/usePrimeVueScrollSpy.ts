/**
 * PrimeVue 示例页 Scroll Spy 与目录导航逻辑
 * 抽取自 prime-vue-page.vue，减少主文件体积
 */
import { useThrottleFn } from '@vueuse/core'
import type { ScrollbarInstance } from '@/components/CScrollbar'

export interface SectionMeta {
  id: string
  indexLabel: string
  label: string
}

export function usePrimeVueScrollSpy(
  scrollbarRef: import('vue').Ref<ScrollbarInstance | null>,
  tocAsideRef: import('vue').Ref<HTMLElement | null>,
  sectionMeta: SectionMeta[]
) {
  const sections: { id: string; label: string }[] = sectionMeta.map(({ id, label }) => ({
    id,
    label,
  }))

  const activeSectionId = ref<string | null>(sections[0]?.id ?? null)
  const isScrolling = ref<boolean>(false)
  let intersectionObserver: IntersectionObserver | null = null

  const tocTreeNodes = computed<{ key: string; label: string }[]>(() =>
    sectionMeta.map(meta => ({
      key: meta.id,
      label: `${meta.indexLabel} ${meta.label}`,
    }))
  )

  const tocSelectionKeys = ref<Record<string, boolean> | undefined>(undefined)

  watch(
    activeSectionId,
    id => {
      if (!id) {
        activeSectionId.value = sections[0]?.id ?? null
        return
      }
      tocSelectionKeys.value = { [id]: true }
      nextTick(scrollTocToActive)
    },
    { immediate: true }
  )

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

  function getScrollElement(): HTMLElement | null {
    const instance = scrollbarRef.value?.getInstance()
    if (!instance) return null
    const { scrollOffsetElement } = instance.elements()
    return scrollOffsetElement
  }

  const SCROLL_OFFSET = 80
  const DETECTION_BUFFER = 50

  function scrollToSection(id: string) {
    isScrolling.value = true
    activeSectionId.value = id

    nextTick(() => {
      const scrollEl = getScrollElement()
      const targetEl = document.getElementById(id)
      if (!scrollEl || !targetEl) {
        isScrolling.value = false
        return
      }

      const scrollRect = scrollEl.getBoundingClientRect()
      const targetRect = targetEl.getBoundingClientRect()
      const currentScrollTop = scrollEl.scrollTop
      const targetOffsetTop = currentScrollTop + targetRect.top - scrollRect.top

      scrollbarRef.value?.scrollTo({
        top: Math.max(0, targetOffsetTop - SCROLL_OFFSET),
        behavior: 'smooth',
      })

      setTimeout(() => {
        isScrolling.value = false
      }, 500)
    })
  }

  function computeActiveSectionFromScroll(): void {
    if (isScrolling.value) return

    const scrollEl = getScrollElement()
    if (!scrollEl) return

    const scrollRect = scrollEl.getBoundingClientRect()
    const scrollTop = scrollEl.scrollTop
    const scrollHeight = scrollEl.scrollHeight
    const clientHeight = scrollEl.clientHeight

    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 5

    if (isAtBottom && sections.length > 0) {
      activeSectionId.value = sections[sections.length - 1].id
      return
    }

    const viewportAnchor = scrollTop + SCROLL_OFFSET + DETECTION_BUFFER

    let containingId: string | null = null
    let fallbackId: string | null = null
    let fallbackTop = -Infinity

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

  const throttledComputeActiveSection = useThrottleFn(computeActiveSectionFromScroll, 80)

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

  function onTocNodeSelect(node: { key?: string }) {
    const key = node.key
    if (typeof key === 'string') {
      scrollToSection(key)
    }
  }

  function onScrollbarInitialized() {
    nextTick(() => {
      initScrollSpy()
      computeActiveSectionFromScroll()
      scrollTocToActive()
    })
  }

  onBeforeUnmount(() => {
    intersectionObserver?.disconnect()
    intersectionObserver = null
  })

  return {
    sections,
    activeSectionId,
    tocTreeNodes,
    tocSelectionKeys,
    scrollToSection,
    onTocNodeSelect,
    onScrollbarInitialized,
    throttledComputeActiveSection,
  }
}
