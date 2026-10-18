import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import type { RelayProvider } from '@/models/email-token/types'
import RelayProviderSelector from '../RelayProviderSelector.vue'

const base = {
  icon: 'mail',
  protocol: 'Test protocol',
  idleNote: 'Available',
  credentialLabel: 'Test credential',
  credentialHint: 'test hint',
  complianceNote: 'test note',
  transport: 'Test transport',
} as const

const providers: RelayProvider[] = [
  { ...base, id: 'gmail', name: 'Provider One' },
  { ...base, id: 'ms365', name: 'Provider Two' },
  { ...base, id: 'smtp', name: 'Provider Three', disabled: true },
]

function mountSelector(modelValue: 'gmail' | 'ms365' | 'smtp' = 'gmail') {
  return mount(RelayProviderSelector, { props: { modelValue, providers } })
}

describe('RelayProviderSelector', () => {
  it('lists every provider and marks only the selected one active', () => {
    const wrapper = mountSelector('gmail')

    expect(wrapper.findAll('input[type="radio"]')).toHaveLength(3)
    expect(wrapper.get<HTMLInputElement>('input[value="gmail"]').element.checked).toBe(true)
    expect(wrapper.text().match(/Active Provider/g)).toHaveLength(1)
    expect(wrapper.text()).toContain('Provider Two')
  })

  it('emits the new id when another available provider is chosen', async () => {
    const wrapper = mountSelector('gmail')

    await wrapper.get('input[value="ms365"]').setValue()

    expect(wrapper.emitted('update:modelValue')).toEqual([['ms365']])
  })

  it('greys out a disabled provider: unselectable, labelled unavailable, with a tooltip', async () => {
    const wrapper = mountSelector('gmail')
    const radio = wrapper.get<HTMLInputElement>('input[value="smtp"]')
    const card = radio.element.closest('label')

    expect(radio.element.disabled).toBe(true)
    expect(card?.textContent).toContain('Unavailable')
    expect(card?.getAttribute('title')).toBe('Provider Three is not available')
    expect(card?.classList.contains('cursor-not-allowed')).toBe(true)

    await radio.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('does not label enabled providers as unavailable', () => {
    const labels = mountSelector('gmail')
      .findAll('label')
      .filter((label) => !label.text().includes('Provider Three'))

    expect(labels).toHaveLength(2)
    for (const label of labels) {
      expect(label.text()).not.toContain('Unavailable')
      expect(label.attributes('title')).toBeUndefined()
    }
  })
})
