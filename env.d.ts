/// <reference types="vite/client" />

/**
 * Typed `import.meta.env`. Every variable is compiled into the client bundle,
 * so NEVER put secrets (SMTP passwords, app tokens) in a `VITE_*` variable.
 */
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_VERSION: string
  readonly VITE_APP_STAGE: string
  readonly VITE_ORG_NAME: string
  readonly VITE_ORG_UNIT: string
  /** Public OAuth client ID (not a secret). Leave blank to disable the Gmail sign-in. */
  readonly VITE_GOOGLE_CLIENT_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
