import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import type { TokenStatus } from '@/models/email-token/types'
import TokenStatusCard from '../TokenStatusCard.vue'

const valid: TokenStatus = {
  label: 'Valid',
  handshake: 'Gmail Send Access',
  detail: 'Authenticated via Google OAuth 2.0 • Session expires at 9:30 am',
}

function mountCard(status: TokenStatus | null, extra: { busy?: boolean; disabled?: boolean } = {}) {
  return mount(TokenStatusCard, { props: { status, ...extra } })
}

describe('TokenStatusCard', () => {
  it('shows an unconfigured card with a Generate action when there is no token', () => {
    const wrapper = mountCard(null)

    expect(wrapper.text()).toContain('Token Status: Not configured')
    expect(wrapper.text()).toContain('Sign in with Google to authorize payslip dispatch')
    expect(wrapper.text()).not.toContain('Gmail Send Access')
    expect(wrapper.get('button').text()).toContain('Generate Token')
    expect(wrapper.get('button').text()).not.toContain('Regenerate')
  })

  it('shows a valid token with its handshake badge and detail', () => {
    const wrapper = mountCard(valid)

    expect(wrapper.text()).toContain('Token Status: Valid')
    expect(wrapper.text()).toContain('Gmail Send Access')
    expect(wrapper.text()).toContain('Session expires at 9:30 am')
    expect(wrapper.get('button').text()).toContain('Regenerate Token')
  })

  it('emits regenerate when the button is clicked', async () => {
    const wrapper = mountCard(valid)

    await wrapper.get('button').trigger('click')

    expect(wrapper.emitted('regenerate')).toHaveLength(1)
  })

  it('shows a busy, disabled button while Google is open', () => {
    const wrapper = mountCard(valid, { busy: true })

    expect(wrapper.get('button').text()).toContain('Waiting for Google…')
    expect(wrapper.get('button').attributes('disabled')).toBeDefined()
  })

  it('can be disabled from outside', async () => {
    const wrapper = mountCard(null, { disabled: true })

    expect(wrapper.get('button').attributes('disabled')).toBeDefined()
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('regenerate')).toBeUndefined()
  })
})
