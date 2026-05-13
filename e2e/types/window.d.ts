export {}

declare global {
  interface Window {
    ccdLayoutProbe?: {
      blankSamples: number
      consoleErrors: string[]
      longTasks: number[]
    }
  }
}
