import { onUnmounted } from 'vue'

type EventMap = Record<string | symbol, unknown>

type EmitterLike<Events extends EventMap> = {
  on<T extends keyof Events>(type: T, handler: (event: Events[T]) => void): void
  off<T extends keyof Events>(type: T, handler?: (event: Events[T]) => void): void
}

type UseAutoMittReturn<Events extends EventMap> = {
  on<T extends keyof Events>(type: T, handler: (event: Events[T]) => void): void
  off<T extends keyof Events>(type: T, handler?: (event: Events[T]) => void): void
}

export function createAutoMittHook<Events extends EventMap>(emitter: EmitterLike<Events>) {
  return function useAutoMitt(): UseAutoMittReturn<Events> {
    type Subscription = {
      type: keyof Events
      handler: (event: Events[keyof Events]) => void
    }

    const subscriptions: Subscription[] = []

    onUnmounted(() => {
      subscriptions.forEach(({ type, handler }) => emitter.off(type, handler))
      subscriptions.length = 0
    })

    return {
      on<T extends keyof Events>(type: T, handler: (event: Events[T]) => void) {
        emitter.on(type, handler)
        subscriptions.push({
          type,
          handler: handler as (event: Events[keyof Events]) => void,
        })
      },
      off<T extends keyof Events>(type: T, handler?: (event: Events[T]) => void) {
        emitter.off(type, handler)
      },
    }
  }
}
