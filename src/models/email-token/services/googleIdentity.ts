/**
 * Google Identity Services (token model), loaded on demand.
 * The access token is returned to the caller and is never stored here.
 */

export const GMAIL_SEND_SCOPE = 'https://www.googleapis.com/auth/gmail.send'

/** Identity scopes read the account email and name; Gmail send-only is the single mail permission. */
export const GOOGLE_SCOPES: readonly string[] = [
  'openid',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  GMAIL_SEND_SCOPE,
]

const GIS_SRC = 'https://accounts.google.com/gsi/client'

export interface GoogleToken {
  accessToken: string
  expiresInSeconds: number
}

export class GoogleSignInError extends Error {
  readonly code: string

  constructor(code: string, message: string) {
    super(message)
    this.name = 'GoogleSignInError'
    this.code = code
  }
}

interface TokenResponse {
  access_token: string
  expires_in: number | string
  scope: string
  error?: string
  error_description?: string
}

interface TokenClient {
  requestAccessToken: (overrideConfig?: { prompt?: string }) => void
}

interface TokenClientConfig {
  client_id: string
  scope: string
  callback: (response: TokenResponse) => void
  error_callback?: (error: { type: string; message?: string }) => void
}

interface GoogleOAuth2 {
  initTokenClient: (config: TokenClientConfig) => TokenClient
  hasGrantedAllScopes: (response: TokenResponse, ...scopes: string[]) => boolean
  revoke: (accessToken: string, done?: () => void) => void
}

declare global {
  interface Window {
    google?: { accounts?: { oauth2?: GoogleOAuth2 } }
  }
}

const ERROR_MESSAGES: Record<string, string> = {
  popup_closed: 'The Google sign-in window was closed before it finished.',
  popup_failed_to_open:
    'The browser blocked the Google sign-in window. Allow pop-ups for this site and try again.',
  access_denied: 'Google access was denied.',
}

function messageFor(code: string, description?: string): string {
  return ERROR_MESSAGES[code] ?? description ?? 'Google sign-in failed. Please try again.'
}

function oauth2(): GoogleOAuth2 | undefined {
  return window.google?.accounts?.oauth2
}

let pendingLoad: Promise<void> | null = null

/** Loads Google's sign-in script once. Call it before the click so the popup is not blocked. */
export function loadGoogleIdentity(): Promise<void> {
  if (oauth2()) return Promise.resolve()

  pendingLoad ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = GIS_SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      pendingLoad = null
      script.remove()
      reject(
        new GoogleSignInError(
          'load-failed',
          'Could not load Google sign-in. Check your internet connection and try again.',
        ),
      )
    }
    document.head.appendChild(script)
  })

  return pendingLoad
}

/** Opens Google's account chooser and resolves with a short-lived access token. */
export function requestAccessToken(
  clientId: string,
  scopes: readonly string[],
): Promise<GoogleToken> {
  return new Promise<GoogleToken>((resolve, reject) => {
    const google = oauth2()
    if (!google) {
      reject(
        new GoogleSignInError(
          'not-loaded',
          'Google sign-in has not loaded yet. Try again in a moment.',
        ),
      )
      return
    }

    const client = google.initTokenClient({
      client_id: clientId,
      scope: scopes.join(' '),
      callback: (response) => {
        if (response.error) {
          reject(
            new GoogleSignInError(
              response.error,
              messageFor(response.error, response.error_description),
            ),
          )
        } else if (!google.hasGrantedAllScopes(response, GMAIL_SEND_SCOPE)) {
          reject(
            new GoogleSignInError(
              'scope-denied',
              'Gmail send permission was not granted. Sign in again and allow it.',
            ),
          )
        } else {
          resolve({
            accessToken: response.access_token,
            expiresInSeconds: Number(response.expires_in),
          })
        }
      },
      error_callback: (error) => reject(new GoogleSignInError(error.type, messageFor(error.type))),
    })

    // Always show the account chooser so a shared workstation never reuses someone's account.
    client.requestAccessToken({ prompt: 'select_account' })
  })
}

/** Revokes the token at Google. Resolves even when Google's script never loaded. */
export function revokeAccessToken(accessToken: string): Promise<void> {
  return new Promise<void>((resolve) => {
    const google = oauth2()
    if (!google) {
      resolve()
      return
    }
    google.revoke(accessToken, () => resolve())
  })
}
