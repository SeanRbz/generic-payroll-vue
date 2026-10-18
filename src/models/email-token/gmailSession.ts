import { computed, inject, shallowRef, type InjectionKey, type Ref } from 'vue'

import { env } from '@/config/env'
import {
  buildTestMessage,
  fetchProfile,
  GmailApiError,
  sendMessage,
  type GmailAccount,
  type OutgoingMessage,
} from '@/models/email-token/services/gmailApi'
import {
  GOOGLE_SCOPES,
  loadGoogleIdentity,
  requestAccessToken,
  revokeAccessToken,
  type GoogleToken,
} from '@/models/email-token/services/googleIdentity'

export type GmailSessionStatus = 'signed-out' | 'signing-in' | 'signed-in'

export interface GmailSession {
  /** False when no Google client ID is configured, so sign-in cannot work. */
  readonly configured: boolean
  readonly status: Readonly<Ref<GmailSessionStatus>>
  readonly account: Readonly<Ref<GmailAccount | null>>
  readonly signedInAt: Readonly<Ref<number | null>>
  readonly expiresAt: Readonly<Ref<number | null>>
  readonly error: Readonly<Ref<string | null>>
  readonly isSignedIn: Readonly<Ref<boolean>>
  /** Pre-loads Google's script so the later click can open the popup immediately. */
  prepare: () => Promise<void>
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  /** Sends the fixed connectivity-check message. Rejects with a user-readable message. */
  sendTestEmail: (to: string) => Promise<void>
}

export interface GmailSessionDeps {
  clientId: string
  load: () => Promise<void>
  requestToken: (clientId: string, scopes: readonly string[]) => Promise<GoogleToken>
  revoke: (accessToken: string) => Promise<void>
  fetchProfile: (accessToken: string) => Promise<GmailAccount>
  sendMessage: (accessToken: string, message: OutgoingMessage) => Promise<{ id: string }>
  now: () => number
}

export const gmailSessionKey: InjectionKey<GmailSession> = Symbol('gmail-session')

function createDefaultDeps(): GmailSessionDeps {
  return {
    clientId: env.googleClientId,
    load: loadGoogleIdentity,
    requestToken: requestAccessToken,
    revoke: revokeAccessToken,
    fetchProfile: (accessToken) => fetchProfile(accessToken),
    sendMessage: (accessToken, message) => sendMessage(accessToken, message),
    now: () => Date.now(),
  }
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.'
}

/**
 * Gmail sign-in state. The access token lives only in this closure: it is never exposed,
 * persisted, or logged, and it is dropped on sign-out, expiry, or page reload.
 */
export function createGmailSession(deps: GmailSessionDeps = createDefaultDeps()): GmailSession {
  const status = shallowRef<GmailSessionStatus>('signed-out')
  const account = shallowRef<GmailAccount | null>(null)
  const signedInAt = shallowRef<number | null>(null)
  const expiresAt = shallowRef<number | null>(null)
  const error = shallowRef<string | null>(null)
  const isSignedIn = computed(() => status.value === 'signed-in')
  const configured = deps.clientId !== ''

  let accessToken: string | null = null
  let expiryTimer: ReturnType<typeof setTimeout> | undefined

  function clear() {
    accessToken = null
    clearTimeout(expiryTimer)
    expiryTimer = undefined
    account.value = null
    signedInAt.value = null
    expiresAt.value = null
    status.value = 'signed-out'
  }

  function startSession(token: GoogleToken, profile: GmailAccount) {
    const lifetimeMs = token.expiresInSeconds * 1000
    const now = deps.now()
    accessToken = token.accessToken
    account.value = profile
    signedInAt.value = now
    expiresAt.value = now + lifetimeMs
    status.value = 'signed-in'

    clearTimeout(expiryTimer)
    expiryTimer = setTimeout(() => {
      clear()
      error.value = 'Your Google session expired. Sign in again.'
    }, lifetimeMs)
  }

  async function prepare() {
    if (!configured) return
    try {
      await deps.load()
    } catch (failure) {
      error.value = messageOf(failure)
    }
  }

  async function signIn() {
    if (!configured) {
      error.value = 'Google sign-in is not configured.'
      return
    }
    if (status.value === 'signing-in') return

    const previousToken = accessToken
    const previousStatus = status.value
    error.value = null
    status.value = 'signing-in'

    let obtained: string | null = null
    try {
      await deps.load()
      const token = await deps.requestToken(deps.clientId, GOOGLE_SCOPES)
      obtained = token.accessToken
      const profile = await deps.fetchProfile(token.accessToken)
      startSession(token, profile)
      obtained = null
      if (previousToken) void deps.revoke(previousToken).catch(() => undefined)
    } catch (failure) {
      error.value = messageOf(failure)
      status.value = previousStatus
      if (obtained) void deps.revoke(obtained).catch(() => undefined)
    }
  }

  async function signOut() {
    const token = accessToken
    clear()
    error.value = null
    if (token) await deps.revoke(token).catch(() => undefined)
  }

  async function sendTestEmail(to: string) {
    if (!accessToken) throw new Error('Sign in with Google before sending a test email.')

    try {
      await deps.sendMessage(accessToken, buildTestMessage(to, new Date(deps.now())))
    } catch (failure) {
      if (failure instanceof GmailApiError && failure.status === 401) {
        clear()
        error.value = failure.message
      }
      throw failure
    }
  }

  return {
    configured,
    status,
    account,
    signedInAt,
    expiresAt,
    error,
    isSignedIn,
    prepare,
    signIn,
    signOut,
    sendTestEmail,
  }
}

export function useGmailSession(): GmailSession {
  const session = inject(gmailSessionKey, null)
  if (!session) {
    throw new Error('useGmailSession() needs gmailSessionKey to be provided (see App.vue).')
  }
  return session
}
