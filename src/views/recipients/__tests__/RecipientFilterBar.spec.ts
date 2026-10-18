import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import type { SelectOption } from '@/types/ui'
import RecipientFilterBar from '../RecipientFilterBar.vue'

const testBureaus: readonly SelectOption[] = [
  { value: 'test-a', label: 'TEST Bureau A' },
  { value: 'test-b', label: 'TEST Bureau B' },
]

describe('RecipientFilterBar', () => {
  it('offers "All Bureaus & Services" first, then the given bureaus', () => {
    const wrapper = mount(RecipientFilterBar, { props: { bureauOptions: testBureaus } })
    const options = wrapper.findAll('option')

    expect(options.map((option) => option.text())).toEqual([
      'All Bureaus & Services',
      'TEST Bureau A',
      'TEST Bureau B',
    ])
    expect(wrapper.get<HTMLSelectElement>('select').element.value).toBe('all')
  })

  it('still offers "All" when no bureaus are given', () => {
    const wrapper = mount(RecipientFilterBar, { props: { bureauOptions: [] } })

    expect(wrapper.findAll('option').map((option) => option.text())).toEqual([
      'All Bureaus & Services',
    ])
  })
})
