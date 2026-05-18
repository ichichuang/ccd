/**
 * Mock API gate.
 *
 * Mock data is always available in local dev. Production builds must opt in
 * explicitly for online demos and must turn this off when a real backend is used.
 */
export const DEMO_MOCK_ENABLED =
  import.meta.env.DEV || import.meta.env.VITE_DEMO_MOCK_ENABLED === 'true'
