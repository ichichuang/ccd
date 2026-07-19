import { deepFreeze } from '../contracts.mjs'

export const NON_SOURCE_DETECTORS = deepFreeze([
  { id: 'ThemePresetValidator', executable: false, ruleIds: ['CCD-UI-013', 'CCD-UI-017', 'CCD-UI-018', 'CCD-UI-019', 'CCD-UI-020', 'CCD-UI-021', 'CCD-UI-022'] },
  { id: 'ProductLanguageReviewer', executable: false, ruleIds: ['CCD-UI-043', 'CCD-UI-044', 'CCD-UI-045', 'CCD-UI-046', 'CCD-UI-047', 'CCD-UI-059', 'CCD-UI-060', 'CCD-UI-061', 'CCD-UI-062'] },
])
