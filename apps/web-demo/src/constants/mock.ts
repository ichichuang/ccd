/**
 * Mock API gate.
 *
 * Mock data is always available in local dev. Production builds only enable
 * mock behavior when the deployment explicitly opts in as a public demo.
 */
export const PUBLIC_DEMO_ENABLED = import.meta.env.VITE_PUBLIC_DEMO_ENABLED === 'true'

const LEGACY_DEMO_MOCK_ENABLED =
  !import.meta.env.PROD && import.meta.env.VITE_DEMO_MOCK_ENABLED === 'true'

export const DEMO_MOCK_ENABLED =
  import.meta.env.DEV || PUBLIC_DEMO_ENABLED || LEGACY_DEMO_MOCK_ENABLED
