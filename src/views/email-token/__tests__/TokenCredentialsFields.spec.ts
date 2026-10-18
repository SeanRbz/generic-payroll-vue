import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import type { RelayProvider } from '@/models/email-token/types'
import TokenCredentialsFields from '../TokenCredentialsFields.vue'

const manual: RelayProvider = {
  id: 'smtp',
  name: 'Test Relay',
  icon: 'dns',
  protocol: 'Test protocol',
  idleNote: 'Available',
  credentialLabel: 'Test Password / Token',
  credentialHint: 'test secret',
  complianceNote: 'test note',
  transport: 'Test transport',
}

const signIn: RelayProvider = { ...manual, usesSignIn: true }

function mountFields(provider: RelayProvider, senderEmail = '') {
  return mount(TokenCredentialsFields, {
    props: { provider, senderEmail, senderMailboxTag: 'Test Mailbox' },
  })
}

describe('TokenCredentialsFields', () => {
  it("shows the provider's credential label and hint next to the sender field", () => {
    const wrapper = mountFields(manual)

    expect(wrapper.text()).toContain('Sender Email Address')
    expect(wrapper.text()).toContain('Test Mailbox')
    expect(wrapper.text()).toContain('Test Password / Token')
    expect(wrapper.text()).toContain('test secret')
  })

  it('shows the sender email it is given', () => {
    const wrapper = mountFields(signIn, 'sender@example.com')

    expect(wrapper.get<HTMLInputElement>('input[type="email"]').element.value).toBe(
      'sender@example.com',
    )
  })

  it('keeps the fields editable when the provider needs manual credentials', () => {
    const wrapper = mountFields(manual)

    expect(wrapper.get('fieldset').attributes('disabled')).toBeUndefined()
    expect(wrapper.get('fieldset').classes()).not.toContain('opacity-60')
    expect(
      wrapper.get<HTMLInputElement>('input[autocomplete="new-password"]').attributes('placeholder'),
    ).toBe('Paste app password')
  })

  it('reveals and hides the credential field content', async () => {
    const wrapper = mountFields(manual)
    const secret = wrapper.get<HTMLInputElement>('input[autocomplete="new-password"]')
    const toggle = wrapper.get('button[aria-pressed]')

    expect(secret.element.type).toBe('password')
    expect(toggle.attributes('aria-label')).toBe('Show credential')

    await toggle.trigger('click')
    expect(secret.element.type).toBe('text')
    expect(toggle.attributes('aria-label')).toBe('Hide credential')

    await toggle.trigger('click')
    expect(secret.element.type).toBe('password')
  })

  it('greys out every manual control when the provider signs in on the frontend', () => {
    const wrapper = mountFields(signIn)
    const fieldset = wrapper.get('fieldset')

    expect(fieldset.attributes('disabled')).toBeDefined()
    expect(fieldset.classes()).toContain('opacity-60')
    expect(wrapper.get<HTMLInputElement>('input[type="email"]').element.matches(':disabled')).toBe(
      true,
    )
    expect(wrapper.get<HTMLButtonElement>('button').element.matches(':disabled')).toBe(true)
    expect(
      wrapper.get<HTMLInputElement>('input[autocomplete="new-password"]').attributes('placeholder'),
    ).toBe('Managed by Google sign-in')
  })
})
