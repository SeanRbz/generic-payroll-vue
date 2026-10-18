import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, nextTick } from 'vue'

import { formatTime } from '@/utils/format'
import { defaultRelayProvider, relayProviders } from '@/models/email-token/data/relayProviders'
import { SENDER_MAILBOX_TAG } from '@/models/email-token/data/tokenConfig'
import {
  createFakeSession,
  EXPIRES_AT,
  provideSession,
  SIGNED_IN_AT,
  testAccount,
  type FakeSession,
} from '@/models/email-token/__tests__/fakeSession'
import { useEmailTokenViewModel } from '../useEmailTokenViewModel'

const mounted: { unmount: () => void }[] = []

/** Runs the ViewModel inside a host component, because it injects the Gmail session. */
function setup(session: FakeSession = createFakeSession()) {
  let vm!: ReturnType<typeof useEmailTokenViewModel>
  const Host = defineComponent({
    setup() {
      vm = useEmailTokenViewModel()
      return () => null
    },
  })
  mounted.push(mount(Host, { global: { provide: provideSession(session) } }))
  return vm
}

afterEach(() => {
  mounted.splice(0).forEach((wrapper) => wrapper.unmount())
})

describe('useEmailTokenViewModel: providers', () => {
  it('lists the relay providers and starts on the default one', () => {
    const vm = setup()

    expect(vm.relayProviders).toBe(relayProviders)
    expect(vm.selectedProviderId.value).toBe(defaultRelayProvider.id)
    expect(vm.selectedProvider.value).toBe(defaultRelayProvider)
    expect(vm.senderMailboxTag).toBe(SENDER_MAILBOX_TAG)
  })

  it('follows the selected provider id', () => {
    const vm = setup()
    const other = relayProviders.find((provider) => provider.id !== defaultRelayProvider.id)
    if (!other) throw new Error('the fixture needs a second provider')

    vm.selectedProviderId.value = other.id

    expect(vm.selectedProvider.value).toBe(other)
  })
})

describe('useEmailTokenViewModel: signed out', () => {
  it('has no token, no sender and nothing verified', () => {
    const vm = setup()

    expect(vm.isSignedIn.value).toBe(false)
    expect(vm.isSigningIn.value).toBe(false)
    expect(vm.tokenStatus.value).toBeNull()
    expect(vm.senderEmail.value).toBe('')
    expect(vm.lastVerified.value).toBe('Not verified yet')
    expect(vm.canSend.value).toBe(false)
  })

  it('mirrors whether Google sign-in is configured', () => {
    expect(setup(createFakeSession()).configured).toBe(true)
    expect(setup(createFakeSession({ configured: false })).configured).toBe(false)
  })

  it('is busy while Google is open', () => {
    expect(setup(createFakeSession({ status: 'signing-in' })).isSigningIn.value).toBe(true)
  })

  it('regenerates the token by starting the Google sign-in', async () => {
    const session = createFakeSession()
    const vm = setup(session)

    await vm.regenerateToken()

    expect(session.signIn).toHaveBeenCalledOnce()
  })
})

describe('useEmailTokenViewModel: signed in', () => {
  it('reports a valid token, the sender and when it was verified', () => {
    const vm = setup(createFakeSession({ status: 'signed-in' }))

    expect(vm.isSignedIn.value).toBe(true)
    expect(vm.tokenStatus.value).toEqual({
      label: 'Valid',
      handshake: 'Gmail Send Access',
      detail: `Authenticated via Google OAuth 2.0 • Session expires at ${formatTime(EXPIRES_AT)}`,
    })
    expect(vm.senderEmail.value).toBe(testAccount.email)
    expect(vm.lastVerified.value).toBe(`Today at ${formatTime(SIGNED_IN_AT)}`)
  })

  it('updates live when the session signs in and out', async () => {
    const session = createFakeSession()
    const vm = setup(session)

    session.account.value = testAccount
    session.signedInAt.value = SIGNED_IN_AT
    session.expiresAt.value = EXPIRES_AT
    session.status.value = 'signed-in'
    await nextTick()
    expect(vm.tokenStatus.value?.label).toBe('Valid')
    expect(vm.recipient.value).toBe(testAccount.email)

    session.account.value = null
    session.expiresAt.value = null
    session.status.value = 'signed-out'
    await nextTick()
    expect(vm.tokenStatus.value).toBeNull()
    expect(vm.senderEmail.value).toBe('')
  })

  it('sends the test dispatch through the session and flags a malformed recipient', async () => {
    const session = createFakeSession({ status: 'signed-in' })
    const vm = setup(session)

    vm.recipient.value = 'not-an-email'
    expect(vm.recipientInvalid.value).toBe(true)
    expect(vm.canSend.value).toBe(false)

    vm.recipient.value = 'other@example.com'
    await vm.send()
    await flushPromises()

    expect(session.sendTestEmail).toHaveBeenCalledWith('other@example.com')
    expect(vm.result.value).toEqual({
      kind: 'success',
      text: 'Test email sent to other@example.com.',
    })
  })
})
