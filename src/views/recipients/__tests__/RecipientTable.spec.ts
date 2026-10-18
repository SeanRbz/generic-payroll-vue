import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import type { Recipient } from '@/models/recipients/types'
import RecipientTable from '../RecipientTable.vue'

const verified: Recipient = {
  id: 'TEST-EMP-001',
  name: 'Test Alpha',
  initials: 'TA',
  avatarTone: 'primary',
  email: 'test.alpha@example.gov.ph',
  verification: { label: 'Verified', tone: 'success' },
  bureau: 'Test Bureau',
  pinSecurity: 'TIN Active',
  routing: 'GovNet Primary',
  status: 'Active',
}

const cosVerified: Recipient = {
  ...verified,
  id: 'TEST-COS-001',
  name: 'Test Beta',
  initials: 'TB',
  email: 'test.beta@example.gov.ph',
  verification: { label: 'COS Verified', tone: 'primary' },
  routing: 'Direct GovNet',
}

describe('RecipientTable', () => {
  it('renders one row per recipient with contact, routing and status', () => {
    const rows = mount(RecipientTable, { props: { recipients: [verified, cosVerified] } }).findAll(
      'tbody tr',
    )

    expect(rows).toHaveLength(2)
    expect(rows[0]?.text()).toContain('Test Alpha')
    expect(rows[0]?.text()).toContain('TEST-EMP-001')
    expect(rows[0]?.text()).toContain('test.alpha@example.gov.ph')
    expect(rows[0]?.text()).toContain('Verified')
    expect(rows[0]?.text()).toContain('GovNet Primary')
    expect(rows[0]?.text()).toContain('Active')
    expect(rows[1]?.text()).toContain('COS Verified')
    expect(rows[1]?.text()).toContain('Direct GovNet')
  })

  it('gives each row a labelled selection checkbox', () => {
    const wrapper = mount(RecipientTable, { props: { recipients: [verified] } })

    expect(wrapper.find('input[aria-label="Select Test Alpha"]').exists()).toBe(true)
    expect(wrapper.find('input[aria-label="Select all recipients"]').exists()).toBe(true)
  })

  it('shows an empty state, with the select-all box unchecked, when there are no recipients', () => {
    const wrapper = mount(RecipientTable, { props: { recipients: [] } })

    expect(wrapper.findAll('tbody tr')).toHaveLength(1)
    expect(wrapper.text()).toContain('No recipients loaded')
    expect(
      wrapper.get<HTMLInputElement>('input[aria-label="Select all recipients"]').element.checked,
    ).toBe(false)
  })
})
