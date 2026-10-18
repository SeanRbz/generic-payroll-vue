import { computed, shallowRef, type ShallowRef } from 'vue'
import { vi } from 'vitest'

import { gmailSessionKey, type GmailSession, type GmailSessionStatus } from '../gmailSession'
import type { GmailAccount } from '@/models/email-token/services/gmailApi'

export const testAccount: GmailAccount = { email: 'test.user@example.com', name: 'Test User' }
export const SIGNED_IN_AT = Date.UTC(2025, 4, 15, 8, 30)
export const EXPIRES_AT = SIGNED_IN_AT + 3_600_000

export interface FakeSessionOptions {
  configured?: boolean
  status?: GmailSessionStatus
  account?: GmailAccount | null
  error?: string | null
}

/** A session whose state tests can set directly and whose actions are spies. */
export type FakeSession = GmailSession & {
  status: ShallowRef<GmailSessionStatus>
  account: ShallowRef<GmailAccount | null>
  signedInAt: ShallowRef<number | null>
  expiresAt: ShallowRef<number | null>
  error: ShallowRef<string | null>
}

export function createFakeSession(options: FakeSessionOptions = {}): FakeSession {
  const signedIn = options.status === 'signed-in'
  const status = shallowRef<GmailSessionStatus>(options.status ?? 'signed-out')
  const account = shallowRef<GmailAccount | null>(
    options.account ?? (signedIn ? testAccount : null),
  )
  const signedInAt = shallowRef<number | null>(signedIn ? SIGNED_IN_AT : null)
  const expiresAt = shallowRef<number | null>(signedIn ? EXPIRES_AT : null)
  const error = shallowRef<string | null>(options.error ?? null)

  return {
    configured: options.configured ?? true,
    status,
    account,
    signedInAt,
    expiresAt,
    error,
    isSignedIn: computed(() => status.value === 'signed-in'),
    prepare: vi.fn<GmailSession['prepare']>(async () => {}),
    signIn: vi.fn<GmailSession['signIn']>(async () => {}),
    signOut: vi.fn<GmailSession['signOut']>(async () => {}),
    sendTestEmail: vi.fn<GmailSession['sendTestEmail']>(async () => {}),
  }
}

/** Mount option for components that call useGmailSession(). */
export function provideSession(session: GmailSession) {
  return { [gmailSessionKey as symbol]: session }
}
