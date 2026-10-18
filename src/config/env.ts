const read = (value: string | undefined, fallback: string): string => value?.trim() || fallback

/**
 * Typed, read-once view of the build-time environment.
 * Every `VITE_*` value ships in the client bundle, so never store secrets in them.
 */
export const env = Object.freeze({
  appTitle: read(import.meta.env.VITE_APP_TITLE, 'Generic Payroll'),
  appVersion: read(import.meta.env.VITE_APP_VERSION, '1.0'),
  appStage: read(import.meta.env.VITE_APP_STAGE, 'PROD'),
  orgName: read(import.meta.env.VITE_ORG_NAME, 'Payroll Generator'),
  orgUnit: read(import.meta.env.VITE_ORG_UNIT, 'Admin & Financial Management'),
  googleClientId: read(import.meta.env.VITE_GOOGLE_CLIENT_ID, ''),
})
