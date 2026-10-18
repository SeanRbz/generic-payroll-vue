import { computed, shallowRef } from 'vue'

import { defaultRelayProvider, relayProviders } from '@/models/email-token/data/relayProviders'
import { SENDER_MAILBOX_TAG } from '@/models/email-token/data/tokenConfig'
import { useGmailSession } from '@/models/email-token/gmailSession'
import type { RelayProviderId, TokenStatus } from '@/models/email-token/types'
import { formatTime } from '@/utils/format'
import { useTestDispatchViewModel } from './useTestDispatchViewModel'

/** Email Token Configuration modal: relay provider, token status and the test dispatch row. */
export function useEmailTokenViewModel() {
  const session = useGmailSession()
  const { status, account, signedInAt, expiresAt, isSignedIn } = session
  const { recipient, recipientInvalid, sending, result, canSend, send } =
    useTestDispatchViewModel(session)

  const selectedProviderId = shallowRef<RelayProviderId>(defaultRelayProvider.id)
  const selectedProvider = computed(
    () =>
      relayProviders.find((provider) => provider.id === selectedProviderId.value) ??
      defaultRelayProvider,
  )

  /** The sender comes from the Gmail sign-in; empty while signed out. */
  const senderEmail = computed(() => account.value?.email ?? '')

  /** A sign-in is open at Google. */
  const isSigningIn = computed(() => status.value === 'signing-in')

  const tokenStatus = computed<TokenStatus | null>(() => {
    if (!isSignedIn.value || expiresAt.value === null) return null
    return {
      label: 'Valid',
      handshake: 'Gmail Send Access',
      detail: `Authenticated via Google OAuth 2.0 • Session expires at ${formatTime(expiresAt.value)}`,
    }
  })

  const lastVerified = computed(() =>
    signedInAt.value === null ? 'Not verified yet' : `Today at ${formatTime(signedInAt.value)}`,
  )

  /** "Generate / Regenerate Token" re-runs the Google sign-in: the live session is the token. */
  function regenerateToken() {
    return session.signIn()
  }

  return {
    configured: session.configured,
    isSignedIn,
    isSigningIn,
    relayProviders,
    selectedProviderId,
    selectedProvider,
    senderEmail,
    senderMailboxTag: SENDER_MAILBOX_TAG,
    tokenStatus,
    lastVerified,
    regenerateToken,
    recipient,
    recipientInvalid,
    sending,
    result,
    canSend,
    send,
  }
}
