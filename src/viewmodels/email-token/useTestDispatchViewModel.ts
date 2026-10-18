import { computed, readonly, shallowRef, watch } from 'vue'

import { isValidEmail } from '@/models/email-token/services/gmailApi'
import type { GmailSession } from '@/models/email-token/gmailSession'
import type { DispatchResult } from '@/models/email-token/types'

/** State for the "Send Test Dispatch" row: recipient, in-flight flag and the last outcome. */
export function useTestDispatchViewModel(session: GmailSession) {
  const recipient = shallowRef('')
  const sending = shallowRef(false)
  const result = shallowRef<DispatchResult | null>(null)

  /** A typed recipient that is not an email address. Empty is not flagged. */
  const recipientInvalid = computed(() => {
    const value = recipient.value.trim()
    return value !== '' && !isValidEmail(value)
  })

  const canSend = computed(
    () => session.isSignedIn.value && !sending.value && isValidEmail(recipient.value.trim()),
  )

  // Default the recipient to the signed-in account, so a first test goes to the sender.
  watch(
    session.account,
    (account) => {
      if (account && recipient.value === '') recipient.value = account.email
    },
    { immediate: true },
  )

  watch(session.isSignedIn, (signedIn) => {
    if (!signedIn) result.value = null
  })

  async function send() {
    if (!canSend.value) return

    const to = recipient.value.trim()
    sending.value = true
    result.value = null
    try {
      await session.sendTestEmail(to)
      result.value = { kind: 'success', text: `Test email sent to ${to}.` }
    } catch (failure) {
      result.value = {
        kind: 'error',
        text: failure instanceof Error ? failure.message : 'The test email could not be sent.',
      }
    } finally {
      sending.value = false
    }
  }

  return {
    recipient,
    recipientInvalid,
    sending: readonly(sending),
    result: readonly(result),
    canSend,
    send,
  }
}
