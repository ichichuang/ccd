let lastAppliedUpdatedAt = 0

export function shouldApplySystemPreferences(updatedAt: number): boolean {
  return updatedAt > lastAppliedUpdatedAt
}

export function markSystemPreferencesApplied(updatedAt: number): void {
  lastAppliedUpdatedAt = Math.max(lastAppliedUpdatedAt, updatedAt)
}

export function resetSystemPreferenceSyncStateForTest(): void {
  lastAppliedUpdatedAt = 0
}
