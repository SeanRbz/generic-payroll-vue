import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { formatTime } from '@/utils/format'
import {
  createFakeSession,
  EXPIRES_AT,
  provideSession,
  testAccount,
  type FakeSession,
} from '@/models/email-token/__tests__/fakeSession'
import GmailSignInPanel from '../GmailSignInPanel.vue'

function mountPanel(session: FakeSession) {
  return mount(GmailSignInPanel, { global: { provide: provideSession(session) } })
}

describe('GmailSignInPanel', () => {
  it('pre-loads Google when it appears', () => {
    const session = createFakeSession()
    mountPanel(session)

    expect(session.prepare).toHaveBeenCalledOnce()
  })

  it('invites the user to sign in and starts the flow on click', async () => {
    const session = createFakeSession()
    const wrapper = mountPanel(session)
    const button = wrapper.get('button')

    expect(wrapper.text()).toContain('Sign in to authorize payslip dispatch')
    expect(wrapper.text()).toContain('Sender and credential come from the Gmail sign-in.')
    expect(button.text()).toBe('Sign in with Google')
    expect(button.attributes('disabled')).toBeUndefined()

    await button.trigger('click')
    expect(session.signIn).toHaveBeenCalledOnce()
  })

  it('explains how to enable sign-in when no client ID is configured', () => {
    const wrapper = mountPanel(createFakeSession({ configured: false }))

    expect(wrapper.text()).toContain('Google sign-in is not configured')
    expect(wrapper.text()).toContain('VITE_GOOGLE_CLIENT_ID')
    expect(wrapper.get('button').attributes('disabled')).toBeDefined()
  })

  it('shows a busy, disabled button while Google is open', () => {
    const wrapper = mountPanel(createFakeSession({ status: 'signing-in' }))
    const button = wrapper.get('button')

    expect(button.text()).toContain('Waiting for Google…')
    expect(button.attributes('disabled')).toBeDefined()
  })

  it('shows the signed-in account, its expiry and a sign-out button', async () => {
    const session = createFakeSession({ status: 'signed-in' })
    const wrapper = mountPanel(session)

    expect(wrapper.text()).toContain(testAccount.name)
    expect(wrapper.text()).toContain(testAccount.email)
    expect(wrapper.text()).toContain(`session expires ${formatTime(EXPIRES_AT)}`)
    expect(wrapper.text()).toContain('TU')
    expect(wrapper.text()).not.toContain('Sign in with Google')

    await wrapper.get('button').trigger('click')
    expect(session.signOut).toHaveBeenCalledOnce()
  })

  it('shows an error as an alert and still lets the user retry', () => {
    const wrapper = mountPanel(createFakeSession({ error: 'Google access was denied.' }))

    expect(wrapper.get('[role="alert"]').text()).toContain('Google access was denied.')
    expect(wrapper.get('button').attributes('disabled')).toBeUndefined()
  })

  it('shows no alert when there is no error', () => {
    expect(mountPanel(createFakeSession()).find('[role="alert"]').exists()).toBe(false)
  })
})
