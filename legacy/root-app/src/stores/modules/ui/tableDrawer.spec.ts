import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useTableDrawerStore } from './tableDrawer'

describe('useTableDrawerStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('defaults', () => {
    it('drawerVisible is false by default', () => {
      const store = useTableDrawerStore()
      expect(store.drawerVisible).toBe(false)
    })

    it('selectedRow is null by default', () => {
      const store = useTableDrawerStore()
      expect(store.selectedRow).toBeNull()
    })
  })

  describe('openDrawer', () => {
    it('sets drawerVisible to true and stores selectedRow', () => {
      const store = useTableDrawerStore()
      const row = { id: 1, name: 'test' }

      store.openDrawer(row)

      expect(store.drawerVisible).toBe(true)
      expect(store.selectedRow).toEqual(row)
    })

    it('accepts null row', () => {
      const store = useTableDrawerStore()
      store.openDrawer(null)
      expect(store.drawerVisible).toBe(true)
      expect(store.selectedRow).toBeNull()
    })
  })

  describe('closeDrawer', () => {
    it('resets drawerVisible and selectedRow', () => {
      const store = useTableDrawerStore()
      store.openDrawer({ id: 1 })
      expect(store.drawerVisible).toBe(true)

      store.closeDrawer()

      expect(store.drawerVisible).toBe(false)
      expect(store.selectedRow).toBeNull()
    })
  })
})
