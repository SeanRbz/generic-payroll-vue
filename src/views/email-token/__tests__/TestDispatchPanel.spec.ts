import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import type { DispatchResult } from '@/models/email-token/types'
import TestDispatchPanel from '../TestDispatchPanel.vue'

interface PanelOptions {
  modelValue?: string
  canSend?: boolean
  sending?: boolean
  result?: DispatchResult | null
  invalid?: boolean
}

function mountPanel({
  modelValue = 'a@example.com',
  canSend = true,
  sending = false,
  result = null,
  invalid = false,
}: PanelOptions = {}) {
  return mount(TestDispatchPanel, {
    props: { modelValue, transport: 'Test transport', canSend, sending, result, invalid },
  })
}

describe('TestDispatchPanel', () => {
  it('shows the transport the test goes through', () => {
    expect(mountPanel().text()).toContain('Test transport')
  })

  it('emits send when the button is clicked and sending is allowed', async () => {
    const wrapper = mountPanel()

    await wrapper.get('button').trigger('click')

    expect(wrapper.emitted('send')).toHaveLength(1)
  })

  it('disables the button and ignores Enter when sending is not allowed', async () => {
    const wrapper = mountPanel({ canSend: false })

    expect(wrapper.get('button').attributes('disabled')).toBeDefined()
    await wrapper.get('input').trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('send')).toBeUndefined()
  })

  it('sends on Enter from the recipient field when allowed', async () => {
    const wrapper = mountPanel()

    await wrapper.get('input').trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('send')).toHaveLength(1)
  })

  it('reports the typed recipient through v-model', async () => {
    const wrapper = mountPanel()

    await wrapper.get('input').setValue('b@example.com')

    expect(wrapper.emitted('update:modelValue')).toEqual([['b@example.com']])
  })

  it('marks the recipient field invalid only when told to', () => {
    const ariaInvalid = (invalid: boolean) =>
      mountPanel({ modelValue: 'not-an-email', invalid }).get('input').attributes('aria-invalid')

    expect(ariaInvalid(true)).toBe('true')
    expect(ariaInvalid(false)).toBe('false')
  })

  it('shows a busy label while sending', () => {
    const wrapper = mountPanel({ sending: true, canSend: false })

    expect(wrapper.get('button').text()).toContain('Sending…')
  })

  it('announces a success as a status and a failure as an alert', () => {
    const success = mountPanel({
      result: { kind: 'success', text: 'Test email sent to a@example.com.' },
    })
    expect(success.get('[role="status"]').text()).toContain('Test email sent')
    expect(success.find('[role="alert"]').exists()).toBe(false)

    const failure = mountPanel({ result: { kind: 'error', text: 'Google refused the request.' } })
    expect(failure.get('[role="alert"]').text()).toContain('Google refused the request.')
    expect(failure.find('[role="status"]').exists()).toBe(false)
  })

  it('shows no message before anything has been sent', () => {
    const wrapper = mountPanel()

    expect(wrapper.find('[role="status"]').exists()).toBe(false)
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })
})
