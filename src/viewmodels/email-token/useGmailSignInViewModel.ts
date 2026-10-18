import { computed } from 'vue'

import { useGmailSession } from '@/models/email-token/gmailSession'
import { getInitials } from '@/utils/format'

/** Gmail sign-in panel: who is signed in, whether sign-in can run, and the sign-in commands. */
export function useGmailSignInViewModel() {
  const session = useGmailSession()
  const { status, account, expiresAt, error, isSignedIn } = session

  /** A sign-in is open at Google. */
  const isSigningIn = computed(() => status.value === 'signing-in')

  const initials = computed(() => (account.value ? getInitials(account.value.name) : ''))

  return {
    configured: session.configured,
    status,
    account,
    expiresAt,
    error,
    isSignedIn,
    isSigningIn,
    initials,
    signIn: session.signIn,
    signOut: session.signOut,
    prepare: session.prepare,
  }
}
