/**
 * DS-SURFACE-01 — Light-theme surface hierarchy contract (ALL presets).
 *
 * Guards the regression where a preset's light surfaces (`--background`, `--card`,
 * `--muted`, `--popover`) collapse into effectively identical near-white values,
 * leaving panels/cards/wells/popovers with no visual separation.
 *
 * Objective contract, enforced for EVERY preset (no subjective preference):
 *   - card !== muted (no collapse);
 *   - card/popover clearly raised above the page background (Euclidean >= 8);
 *   - muted a distinct step from card (>= 3) and from the page (>= 5);
 *   - popover follows card (documented alias) but is therefore also raised;
 *   - foreground contrast holds: text-level (card/popover/background) >= 4.5,
 *     subtle (muted) >= 3.0 — matching theme-engine/validate.ts levels.
 *   - dark mode keeps its (already-correct) card/background separation.
 *
 * Thresholds are calibrated so the design system's existing deliberately-distinct
 * presets (royal-amethyst/emerald-forest/midnight-deep-sea/industrial-tech, whose
 * card<->muted deltas are ~4.5-5.7) pass with margin, while any byte-identical
 * collapse (delta 0) fails. Separation uses sRGB Euclidean distance; contrast uses
 * the same WCAG sRGB method as scripts/validate-token-contrast.ts.
 */
import { describe, expect, it } from 'vitest'
import type { ThemeCssVars } from '../types.js'
import { generateThemeVars } from './index.js'
import { DEFAULT_THEME_NAME, THEME_PRESETS } from '../theme.js'

type Rgb = [number, number, number]

function parseChannels(value: string): Rgb {
  const channels = value.trim().split(/\s+/).map(Number)
  if (channels.length !== 3 || channels.some(c => !Number.isFinite(c) || c < 0 || c > 255)) {
    throw new Error(`Invalid "R G B" channel string: ${JSON.stringify(value)}`)
  }
  return [channels[0], channels[1], channels[2]]
}

function surfaceDistance(a: string, b: string): number {
  const [ar, ag, ab] = parseChannels(a)
  const [br, bg, bb] = parseChannels(b)
  return Math.sqrt((ar - br) ** 2 + (ag - bg) ** 2 + (ab - bb) ** 2)
}

function toLinear(channel: number): number {
  const v = channel / 255
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}
function luminance([r, g, b]: Rgb): number {
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}
function contrast(a: string, b: string): number {
  const la = luminance(parseChannels(a))
  const lb = luminance(parseChannels(b))
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

// Objective thresholds (sRGB Euclidean for separation; WCAG ratio for contrast).
const MIN_CARD_MUTED = 3 // card vs muted: perceptibly distinct (not effectively identical)
const MIN_CARD_BG = 8 // card/popover clearly raised above the page
const MIN_MUTED_BG = 5 // muted (wells) distinct from the page
const MIN_DARK_SEP = 6 // dark card vs background must stay separated
const DEFAULT_CARD_MUTED = 6 // stronger guard for the active default preset

function diag(name: string, v: ThemeCssVars): string {
  return `[${name}] bg=${v['--background']} card=${v['--card']} muted=${v['--muted']} popover=${v['--popover']} border=${v['--border']}`
}

describe('DS-SURFACE-01 light surface hierarchy (all presets)', () => {
  it('exposes the active default preset', () => {
    expect(
      THEME_PRESETS.some(p => p.name === DEFAULT_THEME_NAME),
      `DEFAULT_THEME_NAME "${DEFAULT_THEME_NAME}" must be a real preset`
    ).toBe(true)
  })

  for (const preset of THEME_PRESETS) {
    describe(preset.name, () => {
      it('light: card/muted/background/popover are visually distinct surfaces', () => {
        const v = generateThemeVars(preset, false)
        const d = diag(preset.name, v)
        const cardMuted = surfaceDistance(v['--card'], v['--muted'])
        const cardBg = surfaceDistance(v['--card'], v['--background'])
        const mutedBg = surfaceDistance(v['--muted'], v['--background'])

        expect(v['--card'], `${d} :: card must not equal muted`).not.toBe(v['--muted'])
        expect(
          cardMuted,
          `${d} :: card↔muted=${cardMuted.toFixed(1)} (min ${MIN_CARD_MUTED})`
        ).toBeGreaterThanOrEqual(MIN_CARD_MUTED)
        expect(
          cardBg,
          `${d} :: card↔background=${cardBg.toFixed(1)} (min ${MIN_CARD_BG})`
        ).toBeGreaterThanOrEqual(MIN_CARD_BG)
        expect(
          mutedBg,
          `${d} :: muted↔background=${mutedBg.toFixed(1)} (min ${MIN_MUTED_BG})`
        ).toBeGreaterThanOrEqual(MIN_MUTED_BG)
        // popover follows card by design (raised surface), not a new collapse.
        expect(v['--popover'], `${d} :: popover should alias card`).toBe(v['--card'])
      })

      it('light: foreground contrast stays within WCAG token levels', () => {
        const v = generateThemeVars(preset, false)
        const d = diag(preset.name, v)
        const cardC = contrast(v['--card'], v['--card-foreground'])
        const popC = contrast(v['--popover'], v['--popover-foreground'])
        const bgC = contrast(v['--background'], v['--foreground'])
        const mutedC = contrast(v['--muted'], v['--muted-foreground'])
        expect(cardC, `${d} :: card/cardFg=${cardC.toFixed(2)} (>=4.5)`).toBeGreaterThanOrEqual(4.5)
        expect(popC, `${d} :: popover/popoverFg=${popC.toFixed(2)} (>=4.5)`).toBeGreaterThanOrEqual(
          4.5
        )
        expect(
          bgC,
          `${d} :: background/foreground=${bgC.toFixed(2)} (>=4.5)`
        ).toBeGreaterThanOrEqual(4.5)
        expect(
          mutedC,
          `${d} :: muted/mutedFg=${mutedC.toFixed(2)} (>=3.0 subtle)`
        ).toBeGreaterThanOrEqual(3.0)
      })

      it('dark: card/background separation and card contrast intact', () => {
        const v = generateThemeVars(preset, true)
        const sep = surfaceDistance(v['--card'], v['--background'])
        expect(v['--card'], `[${preset.name}] dark card must not equal background`).not.toBe(
          v['--background']
        )
        expect(
          sep,
          `[${preset.name}] dark card↔background=${sep.toFixed(1)} (min ${MIN_DARK_SEP})`
        ).toBeGreaterThanOrEqual(MIN_DARK_SEP)
        expect(contrast(v['--card'], v['--card-foreground'])).toBeGreaterThanOrEqual(4.5)
      })
    })
  }

  it(`default preset (${DEFAULT_THEME_NAME}) keeps a strong card↔muted separation`, () => {
    const preset = THEME_PRESETS.find(p => p.name === DEFAULT_THEME_NAME)!
    const v = generateThemeVars(preset, false)
    const cardMuted = surfaceDistance(v['--card'], v['--muted'])
    expect(
      cardMuted,
      `${diag(DEFAULT_THEME_NAME, v)} :: default card↔muted=${cardMuted.toFixed(1)} (min ${DEFAULT_CARD_MUTED})`
    ).toBeGreaterThanOrEqual(DEFAULT_CARD_MUTED)
  })
})
