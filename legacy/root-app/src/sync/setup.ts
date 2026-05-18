import {
  setupSystemPreferencesSync,
  type SystemPreferencesSyncOptions,
} from './systemPreferences/runtime'
import { registerSystemPreferenceSync } from './systemPreferences/register'

export function setupSyncSystem(options: SystemPreferencesSyncOptions = {}): void {
  registerSystemPreferenceSync()
  setupSystemPreferencesSync(options)
}
