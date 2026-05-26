import type { App } from 'vue'
import { vLongPress } from './longPress'
import { vSwipe } from './swipe'
import { vTap } from './tap'

export interface InteractionDirectiveInstallOptions {
  tapName?: string
  swipeName?: string
  longPressName?: string
  tap?: boolean
  swipe?: boolean
  longPress?: boolean
}

export function installInteractionDirectives(
  app: App,
  options: InteractionDirectiveInstallOptions = {}
): void {
  const {
    tapName = 'tap',
    swipeName = 'swipe',
    longPressName = 'long-press',
    tap = true,
    swipe = true,
    longPress = true,
  } = options

  if (tap) {
    app.directive(tapName, vTap)
  }

  if (swipe) {
    app.directive(swipeName, vSwipe)
  }

  if (longPress) {
    app.directive(longPressName, vLongPress)
  }
}
