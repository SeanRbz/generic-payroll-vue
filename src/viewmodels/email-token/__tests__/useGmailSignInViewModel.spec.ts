import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, nextTick } from 'vue'

import {
  createFakeSession,
  EXPIRES_AT,
  provideSession,
  testAccount,
  type FakeSession,
} from '@/models/email-token/__tests__/fakeSession'
import { useGmailSignInViewModel } from '../useGmailSignInViewModel'

const mounted: { unmount: () => void }[] = []

/** Runs the ViewModel inside a host component, because it injects the Gmail session. */
function setup(session: FakeSession = createFakeSession()) {
  let vm!: ReturnType<typeof useGmailSignInViewModel>
  const Host = defineComponent({
    setup() {
      vm = useGmailSignInViewModel()
      return () => null
    },
  })
  mounted.push(mount(Host, { global: { provide: provideSession(session) } }))
  return vm
}

afterEach(() => {
  mounted.splice(0).forEach((wrapper) => wrapper.unmount())
})

describe('useGmailSignInViewModel', () => {
  it('starts signed out with no account, initials or error', () => {
    const vm = setup()

    expect(vm.configured).toBe(true)
    expect(vm.status.value).toBe('signed-out')
    expect(vm.isSignedIn.value).toBe(false)
    expect(vm.isSigningIn.value).toBe(false)
    expect(vm.account.value).toBeNull()
    expect(vm.expiresAt.value).toBeNull()
    expect(vm.initials.value).toBe('')
    expect(vm.error.value).toBeNull()
  })

  it('mirrors a missing Google client ID', () => {
    expect(setup(createFakeSession({ configured: false })).configured).toBe(false)
  })

  it('is busy while Google is open', () => {
    expect(setup(createFakeSession({ status: 'signing-in' })).isSigningIn.value).toBe(true)
  })

  it('exposes the signed-in account, its initials and the session expiry', () => {
    const vm = setup(createFakeSession({ status: 'signed-in' }))

    expect(vm.isSignedIn.value).toBe(true)
    expect(vm.account.value).toEqual(testAccount)
    expect(vm.initials.value).toBe('TU')
    expect(vm.expiresAt.value).toBe(EXPIRES_AT)
  })

  it('follows the session as it changes', async () => {
    const session = createFakeSession()
    const vm = setup(session)

    session.account.value = { email: 'other@example.com', name: 'Other Person' }
    session.status.value = 'signed-in'
    session.error.value = 'Google access was denied.'
    await nextTick()

    expect(vm.isSignedIn.value).toBe(true)
    expect(vm.initials.value).toBe('OP')
    expect(vm.error.value).toBe('Google access was denied.')
  })

  it('delegates prepare, sign-in and sign-out to the session', async () => {
    const session = createFakeSession()
    const vm = setup(session)

    await vm.prepare()
    await vm.signIn()
    await vm.signOut()

    expect(session.prepare).toHaveBeenCalledOnce()
    expect(session.signIn).toHaveBeenCalledOnce()
    expect(session.signOut).toHaveBeenCalledOnce()
  })
})
