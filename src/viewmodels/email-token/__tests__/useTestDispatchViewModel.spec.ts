import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import { createFakeSession, testAccount } from '@/models/email-token/__tests__/fakeSession'
import { useTestDispatchViewModel } from '../useTestDispatchViewModel'

describe('useTestDispatchViewModel', () => {
  it('cannot send while signed out, even with a valid recipient', () => {
    const dispatch = useTestDispatchViewModel(createFakeSession())

    dispatch.recipient.value = 'someone@example.com'

    expect(dispatch.canSend.value).toBe(false)
  })

  it('defaults the recipient to the signed-in account', () => {
    const dispatch = useTestDispatchViewModel(createFakeSession({ status: 'signed-in' }))

    expect(dispatch.recipient.value).toBe(testAccount.email)
    expect(dispatch.canSend.value).toBe(true)
  })

  it('fills the recipient after sign-in but never overwrites what the user typed', async () => {
    const session = createFakeSession()
    const dispatch = useTestDispatchViewModel(session)

    session.status.value = 'signed-in'
    session.account.value = testAccount
    await nextTick()
    expect(dispatch.recipient.value).toBe(testAccount.email)

    dispatch.recipient.value = 'typed@example.com'
    session.account.value = { email: 'another@example.com', name: 'Another' }
    await nextTick()
    expect(dispatch.recipient.value).toBe('typed@example.com')
  })

  it('requires a valid recipient', () => {
    const dispatch = useTestDispatchViewModel(createFakeSession({ status: 'signed-in' }))

    dispatch.recipient.value = 'not-an-email'
    expect(dispatch.canSend.value).toBe(false)

    dispatch.recipient.value = 'ok@example.com'
    expect(dispatch.canSend.value).toBe(true)
  })

  it('flags a malformed recipient but not an empty or valid one', () => {
    const dispatch = useTestDispatchViewModel(createFakeSession())

    dispatch.recipient.value = 'not-an-email'
    expect(dispatch.recipientInvalid.value).toBe(true)

    dispatch.recipient.value = '   '
    expect(dispatch.recipientInvalid.value).toBe(false)

    dispatch.recipient.value = '  ok@example.com  '
    expect(dispatch.recipientInvalid.value).toBe(false)
  })

  it('sends to the trimmed recipient and reports success', async () => {
    const session = createFakeSession({ status: 'signed-in' })
    const dispatch = useTestDispatchViewModel(session)
    dispatch.recipient.value = '  ok@example.com  '

    await dispatch.send()

    expect(session.sendTestEmail).toHaveBeenCalledWith('ok@example.com')
    expect(dispatch.result.value).toEqual({
      kind: 'success',
      text: 'Test email sent to ok@example.com.',
    })
    expect(dispatch.sending.value).toBe(false)
  })

  it('reports a failure with the underlying message', async () => {
    const session = createFakeSession({ status: 'signed-in' })
    vi.mocked(session.sendTestEmail).mockRejectedValueOnce(new Error('Google is rate limiting.'))
    const dispatch = useTestDispatchViewModel(session)

    await dispatch.send()

    expect(dispatch.result.value).toEqual({ kind: 'error', text: 'Google is rate limiting.' })
    expect(dispatch.sending.value).toBe(false)
  })

  it('blocks a second send while one is in flight', async () => {
    const session = createFakeSession({ status: 'signed-in' })
    let finish: () => void = () => {}
    vi.mocked(session.sendTestEmail).mockImplementationOnce(
      () => new Promise<void>((resolve) => (finish = resolve)),
    )
    const dispatch = useTestDispatchViewModel(session)

    const first = dispatch.send()
    expect(dispatch.sending.value).toBe(true)
    expect(dispatch.canSend.value).toBe(false)

    await dispatch.send()
    expect(session.sendTestEmail).toHaveBeenCalledTimes(1)

    finish()
    await first
    expect(dispatch.sending.value).toBe(false)
  })

  it('clears the last result when the user signs out', async () => {
    const session = createFakeSession({ status: 'signed-in' })
    const dispatch = useTestDispatchViewModel(session)
    await dispatch.send()
    expect(dispatch.result.value).not.toBeNull()

    session.status.value = 'signed-out'
    await nextTick()

    expect(dispatch.result.value).toBeNull()
  })

  it('does nothing when sending is not allowed', async () => {
    const session = createFakeSession()
    const dispatch = useTestDispatchViewModel(session)

    await dispatch.send()

    expect(session.sendTestEmail).not.toHaveBeenCalled()
    expect(dispatch.result.value).toBeNull()
  })
})
