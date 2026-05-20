import type { EChartsOption, SetOptionOpts } from 'echarts'

export type EChartsRenderReason = 'init' | 'resize' | 'visible' | 'option'

export interface EChartsRenderInstance {
  resize: (opts?: { width?: number; height?: number }) => void
  setOption: (option: EChartsOption, opts?: boolean | SetOptionOpts) => void
  isDisposed: () => boolean
}

export interface EChartsRenderCoreOptions {
  getElement: () => HTMLElement | null | undefined
  getInstance: () => EChartsRenderInstance | null | undefined
  canRender: () => boolean
  autoResize?: () => boolean
  requestAnimationFrame?: typeof globalThis.requestAnimationFrame
  cancelAnimationFrame?: typeof globalThis.cancelAnimationFrame
}

export interface EChartsPendingOption {
  option: EChartsOption
  opts?: boolean | SetOptionOpts
}

export function createEChartsRenderCore(options: EChartsRenderCoreOptions) {
  const requestFrame = options.requestAnimationFrame ?? globalThis.requestAnimationFrame
  const cancelFrame = options.cancelAnimationFrame ?? globalThis.cancelAnimationFrame
  let resizeRafId = 0
  let pendingOption: EChartsPendingOption | null = null
  let disposed = false

  function getElementSize(): { width: number; height: number } | null {
    const element = options.getElement()
    if (!element) return null
    const rect = element.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return null
    return { width: rect.width, height: rect.height }
  }

  function getSizeOK(): boolean {
    return getElementSize() !== null
  }

  function getReadyInstance(): EChartsRenderInstance | null {
    const instance = options.getInstance()
    if (!instance || instance.isDisposed()) return null
    return instance
  }

  function applyPendingOption(instance: EChartsRenderInstance): void {
    if (!pendingOption) return
    instance.setOption(pendingOption.option, pendingOption.opts)
    pendingOption = null
  }

  function schedule(reason: EChartsRenderReason): void {
    if (disposed) return
    if (reason === 'resize' && options.autoResize?.() === false) return

    cancelFrame(resizeRafId)
    resizeRafId = requestFrame(() => {
      const size = getElementSize()
      if (disposed || !options.canRender() || !size) return
      const instance = getReadyInstance()
      if (!instance) return

      if (options.autoResize?.() !== false) {
        instance.resize(size)
        requestFrame(() => {
          if (disposed || !options.canRender()) return
          const settledSize = getElementSize()
          if (!settledSize) return
          instance.resize(settledSize)
        })
      }
      applyPendingOption(instance)
    })
  }

  function setOption(option: EChartsOption, opts?: boolean | SetOptionOpts): void {
    if (disposed) return
    const instance = getReadyInstance()
    if (!instance || !options.canRender() || !getSizeOK()) {
      pendingOption = { option, opts }
      schedule('option')
      return
    }

    instance.setOption(option, opts)
  }

  function dispose(): void {
    disposed = true
    cancelFrame(resizeRafId)
    pendingOption = null
  }

  return {
    schedule,
    setOption,
    dispose,
    getSizeOK,
  }
}
