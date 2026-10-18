export type RelayProviderId = 'gmail' | 'ms365' | 'smtp'

export interface RelayProvider {
  id: RelayProviderId
  name: string
  icon: string
  protocol: string
  /** Third line of the provider card while it is not the selected one. */
  idleNote: string
  credentialLabel: string
  credentialHint: string
  complianceNote: string
  /** Short transport description for the test-dispatch panel, e.g. "Gmail API • HTTPS". */
  transport: string
  /** Greyed out and not selectable: the provider is not offered. */
  disabled?: boolean
  /** Sender and credential come from the frontend sign-in, so the manual fields are greyed out. */
  usesSignIn?: boolean
}

export interface TokenStatus {
  label: string
  handshake: string
  detail: string
}

/** Outcome of the last "Send Test Dispatch". */
export interface DispatchResult {
  kind: 'success' | 'error'
  text: string
}
