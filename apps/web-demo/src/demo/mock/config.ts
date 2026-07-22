/**
 * Explicit opt-in for the isolated authentication and dynamic-route demo boundary.
 * Development and production both use real APIs unless the value is exactly `true`.
 */
export const DEMO_MOCK_ENABLED = import.meta.env.VITE_DEMO_MOCK_ENABLED === 'true'
