import { useLayoutStoreWithOut } from '@/stores/modules/layout'

export const useLoading = () => {
  const loadingStart = () => {
    useLayoutStoreWithOut().setIsLoading(true)
  }

  const loadingDone = () => {
    useLayoutStoreWithOut().setIsLoading(false)
  }

  const pageLoadingStart = () => {
    useLayoutStoreWithOut().setIsPageLoading(true)
  }

  const pageLoadingDone = () => {
    useLayoutStoreWithOut().setIsPageLoading(false)
  }

  return {
    loadingStart,
    loadingDone,
    pageLoadingStart,
    pageLoadingDone,
  }
}
