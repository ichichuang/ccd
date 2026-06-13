import { describe, expect, it } from 'vitest'
import { createCustomPreset } from './primevuePreset'

type MaskBackgroundEntry = {
  path: string
  background: string
}

function collectMaskBackgrounds(value: unknown, path: string[] = []): MaskBackgroundEntry[] {
  if (value === null || typeof value !== 'object') return []

  const record = value as Record<string, unknown>
  const entries: MaskBackgroundEntry[] = []
  const mask = record.mask

  if (mask !== null && typeof mask === 'object') {
    const background = (mask as Record<string, unknown>).background
    if (typeof background === 'string') {
      entries.push({
        path: [...path, 'mask', 'background'].join('.'),
        background,
      })
    }
  }

  for (const [key, child] of Object.entries(record)) {
    entries.push(...collectMaskBackgrounds(child, [...path, key]))
  }

  return entries
}

describe('PrimeVue custom preset overlay masks', () => {
  it('preserves mode-aware black overlay masks instead of muted gray masks', () => {
    const preset = createCustomPreset({ sizeName: 'comfortable' })
    const maskBackgrounds = collectMaskBackgrounds(preset)
    const byPath = new Map(maskBackgrounds.map(entry => [entry.path, entry.background]))

    expect(byPath.get('semantic.colorScheme.light.mask.background')).toBe('rgba(0,0,0,0.4)')
    expect(byPath.get('semantic.colorScheme.dark.mask.background')).toBe('rgba(0,0,0,0.6)')
    expect(maskBackgrounds).not.toContainEqual(
      expect.objectContaining({
        background: expect.stringContaining('muted-foreground'),
      })
    )
  })
})

describe('PrimeVue custom preset tabs', () => {
  it('uses a translucent primary surface with primary text for active tabs', () => {
    const preset = createCustomPreset({ sizeName: 'comfortable' }) as {
      components?: {
        tabs?: {
          tab?: {
            activeBackground?: string
            activeColor?: string
            hoverBackground?: string
            hoverColor?: string
          }
        }
        tabmenu?: {
          item?: {
            activeBackground?: string
            activeBorderColor?: string
            activeColor?: string
          }
        }
      }
    }

    expect(preset.components?.tabs?.tab).toMatchObject({
      activeBackground: 'rgb(var(--primary) / 0.14)',
      activeColor: 'rgb(var(--primary))',
      hoverBackground: 'rgb(var(--primary) / 0.08)',
      hoverColor: 'rgb(var(--primary))',
    })
    expect(preset.components?.tabmenu?.item).toMatchObject({
      activeBackground: 'rgb(var(--primary) / 0.14)',
      activeBorderColor: 'rgb(var(--primary))',
      activeColor: 'rgb(var(--primary))',
    })
  })
})
