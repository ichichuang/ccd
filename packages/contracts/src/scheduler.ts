export interface ScheduledTask {
  cancel(): void
}

export interface Scheduler {
  delay(callback: () => void, milliseconds: number): ScheduledTask
  interval(callback: () => void, milliseconds: number): ScheduledTask
}
