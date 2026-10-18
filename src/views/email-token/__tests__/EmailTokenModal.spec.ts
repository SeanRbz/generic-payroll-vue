import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import { formatTime } from '@/utils/format'
import {
  createFakeSession,
  EXPIRES_AT,
  provideSession,
  SIGNED_IN_AT,
  testAccount,
  type FakeSession,
} from '@/models/email-token/__tests__/fakeSession'
import EmailTokenModal from '../EmailTokenModal.vue'

const mounted: { unmount: () => void }[] = []

function mountModal(session: FakeSession = createFakeSession()) {
  const wrapper = mount(EmailTokenModal, {
    props: { open: true },
    attachTo: document.body,
    global: { stubs: { teleport: true }, provide: provideSession(session) },
  })
  mounted.push(wrapper)
  return wrapper
}

function findButton(wrapper: ReturnType<typeof mountModal>, text: string) {
  const button = wrapper.findAll('button').find((candidate) => candidate.text().includes(text))
  if (!button) throw new Error(`no button containing "${text}"`)
  return button
}

afterEach(() => {
  mounted.splice(0).forEach((wrapper) => wrapper.unmount())
  document.body.innerHTML = ''
  document.body.style.overflow = ''
})

describe('EmailTokenModal: signed out', () => {
  it('starts unconfigured: nothing pre-filled, no verified badge, nothing to save or send', () => {
    const wrapper = mountModal()
    const sender = wrapper.get<HTMLInputElement>('input[type="email"][placeholder^="name@"]')

    expect(sender.element.value).toBe('')
    expect(sender.element.matches(':disabled')).toBe(true)
    expect(wrapper.text()).toContain('Token Status: Not configured')
    expect(wrapper.text()).toContain('Generate Token')
    expect(wrapper.text()).toContain('Last verified: Not verified yet')
    expect(wrapper.text()).not.toContain('Verified Active')
    expect(wrapper.text()).not.toContain('Gmail Send Access')
    expect(findButton(wrapper, 'Save & Verify Token').attributes('disabled')).toBeDefined()
    expect(findButton(wrapper, 'Send Test Dispatch').attributes('disabled')).toBeDefined()
  })

  it('offers a Google sign-in button that starts the sign-in', async () => {
    const session = createFakeSession()
    const wrapper = mountModal(session)

    await findButton(wrapper, 'Sign in with Google').trigger('click')

    expect(session.signIn).toHaveBeenCalledOnce()
  })

  it('lets "Generate Token" start the same sign-in', async () => {
    const session = createFakeSession()
    const wrapper = mountModal(session)

    await findButton(wrapper, 'Generate Token').trigger('click')

    expect(session.signIn).toHaveBeenCalledOnce()
  })

  it('pre-loads Google as soon as the modal opens', () => {
    const session = createFakeSession()
    mountModal(session)

    expect(session.prepare).toHaveBeenCalledOnce()
  })

  it('says so, and blocks sign-in, when no Google client ID is configured', () => {
    const wrapper = mountModal(createFakeSession({ configured: false }))

    expect(wrapper.text()).toContain('Google sign-in is not configured')
    expect(wrapper.text()).toContain('VITE_GOOGLE_CLIENT_ID')
    expect(findButton(wrapper, 'Sign in with Google').attributes('disabled')).toBeDefined()
    expect(findButton(wrapper, 'Generate Token').attributes('disabled')).toBeDefined()
  })

  it('shows a sign-in error as an alert', () => {
    const wrapper = mountModal(
      createFakeSession({ error: 'The Google sign-in window was closed before it finished.' }),
    )

    expect(wrapper.get('[role="alert"]').text()).toContain('window was closed')
  })

  it('shows a busy sign-in while Google is open', () => {
    const wrapper = mountModal(createFakeSession({ status: 'signing-in' }))

    expect(wrapper.text()).toContain('Waiting for Google…')
    expect(findButton(wrapper, 'Waiting for Google…').attributes('disabled')).toBeDefined()
  })
})

describe('EmailTokenModal: providers and fields', () => {
  it('starts on Gmail with an honest compliance note', () => {
    const wrapper = mountModal()

    expect(
      wrapper.get<HTMLInputElement>('input[type="radio"][value="gmail"]').element.checked,
    ).toBe(true)
    expect(wrapper.text()).toContain('Gmail App Password / Token')
    expect(wrapper.get('aside').text()).toContain('Google OAuth 2.0')
    expect(wrapper.get('aside').text()).toContain('No password or token is stored')
  })

  it('only offers Gmail: MS 365 and Custom SMTP are greyed out and cannot be chosen', async () => {
    const wrapper = mountModal()
    const radio = (id: string) =>
      wrapper.get<HTMLInputElement>(`input[type="radio"][value="${id}"]`)

    expect(radio('gmail').element.disabled).toBe(false)
    expect(radio('ms365').element.disabled).toBe(true)
    expect(radio('smtp').element.disabled).toBe(true)
    expect(wrapper.text()).toContain('Active Provider')
    expect(wrapper.text().match(/Unavailable/g)).toHaveLength(2)

    await radio('ms365').trigger('click')
    expect(radio('gmail').element.checked).toBe(true)
    expect(radio('ms365').element.checked).toBe(false)
  })

  it('greys out the sender and credential fields because they come from the Gmail sign-in', () => {
    const wrapper = mountModal()
    const fields = wrapper.get('fieldset[disabled]')

    expect(fields.classes()).toContain('opacity-60')
    expect(fields.get<HTMLInputElement>('input[type="email"]').element.matches(':disabled')).toBe(
      true,
    )
    expect(
      fields
        .get<HTMLInputElement>('input[autocomplete="new-password"]')
        .element.matches(':disabled'),
    ).toBe(true)
    expect(fields.get<HTMLButtonElement>('button').element.matches(':disabled')).toBe(true)
  })
})

describe('EmailTokenModal: signed in', () => {
  it('shows the signed-in account as the sender and marks the token valid', () => {
    const wrapper = mountModal(createFakeSession({ status: 'signed-in' }))

    expect(
      wrapper.get<HTMLInputElement>('input[type="email"][placeholder^="name@"]').element.value,
    ).toBe(testAccount.email)
    expect(wrapper.text()).toContain('Verified Active')
    expect(wrapper.text()).toContain('Token Status: Valid')
    expect(wrapper.text()).toContain('Gmail Send Access')
    expect(wrapper.text()).toContain(`Session expires at ${formatTime(EXPIRES_AT)}`)
    expect(wrapper.text()).toContain(`Last verified: Today at ${formatTime(SIGNED_IN_AT)}`)
    expect(wrapper.text()).toContain(testAccount.name)
    expect(wrapper.text()).toContain('Regenerate Token')
    expect(wrapper.text()).not.toContain('Sign in with Google')
  })

  it('updates live when the session signs in', async () => {
    const session = createFakeSession()
    const wrapper = mountModal(session)
    expect(wrapper.text()).not.toContain('Verified Active')

    session.account.value = testAccount
    session.signedInAt.value = SIGNED_IN_AT
    session.expiresAt.value = EXPIRES_AT
    session.status.value = 'signed-in'
    await nextTick()

    expect(wrapper.text()).toContain('Verified Active')
    expect(wrapper.text()).toContain('Token Status: Valid')
  })

  it('signs in again from "Regenerate Token" and signs out from the panel', async () => {
    const session = createFakeSession({ status: 'signed-in' })
    const wrapper = mountModal(session)

    await findButton(wrapper, 'Regenerate Token').trigger('click')
    await findButton(wrapper, 'Sign out').trigger('click')

    expect(session.signIn).toHaveBeenCalledOnce()
    expect(session.signOut).toHaveBeenCalledOnce()
  })

  it('sends the test email to the signed-in account by default', async () => {
    const session = createFakeSession({ status: 'signed-in' })
    const wrapper = mountModal(session)

    await findButton(wrapper, 'Send Test Dispatch').trigger('click')
    await flushPromises()

    expect(session.sendTestEmail).toHaveBeenCalledWith(testAccount.email)
    expect(wrapper.get('[role="status"]').text()).toContain(
      `Test email sent to ${testAccount.email}.`,
    )
  })

  it('lets the user test another recipient and shows a failure', async () => {
    const session = createFakeSession({ status: 'signed-in' })
    vi.mocked(session.sendTestEmail).mockRejectedValueOnce(new Error('Google refused the request.'))
    const wrapper = mountModal(session)

    await wrapper.get('input[name="test-recipient-email"]').setValue('other@example.com')
    await findButton(wrapper, 'Send Test Dispatch').trigger('click')
    await flushPromises()

    expect(session.sendTestEmail).toHaveBeenCalledWith('other@example.com')
    expect(wrapper.get('[role="alert"]').text()).toContain('Google refused the request.')
  })

  it('closes from Save & Verify Token once signed in', async () => {
    const wrapper = mountModal(createFakeSession({ status: 'signed-in' }))

    await findButton(wrapper, 'Save & Verify Token').trigger('click')

    expect(wrapper.emitted('update:open')).toEqual([[false]])
  })
})

describe('EmailTokenModal: closing', () => {
  it('emits update:open=false from Cancel', async () => {
    const wrapper = mountModal()

    await findButton(wrapper, 'Cancel').trigger('click')

    expect(wrapper.emitted('update:open')).toEqual([[false]])
  })
})
