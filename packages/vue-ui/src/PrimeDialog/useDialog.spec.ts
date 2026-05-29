import { afterEach, describe, expect, it, vi } from 'vitest'
import { useDialogCore } from './useDialog'

afterEach(() => {
  useDialogCore().closeAllDialog()
  vi.useRealTimers()
})

describe('useDialogCore', () => {
  it('adds, closes, and removes dialog instances by stable id', () => {
    const dialog = useDialogCore()

    const index = dialog.addDialog({ header: 'Confirm' })
    const opened = dialog.dialogStore.value[index]

    expect(index).toBe(0)
    expect(opened?.visible).toBe(true)
    expect(opened?._instanceId).toBeTruthy()
    expect(opened?.class).toContain('max-h-90vh')

    dialog.closeDialog(index, { command: 'close' })
    expect(dialog.dialogStore.value[index]?.visible).toBe(false)

    dialog.removeDialogByInstanceId(opened?._instanceId ?? '')
    expect(dialog.dialogStore.value).toHaveLength(0)
  })

  it('keeps delayed dialogs hidden until the open delay has elapsed', () => {
    vi.useFakeTimers()
    const dialog = useDialogCore()

    const index = dialog.addDialog({ header: 'Delayed', openDelay: 120 })

    expect(dialog.dialogStore.value[index]?.visible).toBe(false)

    vi.advanceTimersByTime(119)
    expect(dialog.dialogStore.value[index]?.visible).toBe(false)

    vi.advanceTimersByTime(1)
    expect(dialog.dialogStore.value[index]?.visible).toBe(true)
  })
})
