import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import type { SelectOption } from '@/types/ui'
import LedgerToolbar from '../LedgerToolbar.vue'

const testBureaus: readonly SelectOption[] = [
  { value: 'test-a', label: 'TEST Bureau A' },
  { value: 'test-b', label: 'TEST Bureau B' },
]

const testEmploymentTypes: readonly SelectOption[] = [
  { value: 'all', label: 'TEST All types' },
  { value: 'test-regular', label: 'TEST Regular' },
]

function mountToolbar(bureauOptions: readonly SelectOption[] = testBureaus) {
  return mount(LedgerToolbar, {
    props: {
      counts: { all: 3, ready: 2, flagged: 1 },
      bureauOptions,
      employmentTypeOptions: testEmploymentTypes,
    },
  })
}

const optionLabels = (wrapper: ReturnType<typeof mountToolbar>, label: string) =>
  wrapper
    .get(`select[aria-label="${label}"]`)
    .findAll('option')
    .map((option) => option.text())

describe('LedgerToolbar', () => {
  it('offers "All Bureaus & Services (All)" first, then the given bureaus', () => {
    expect(optionLabels(mountToolbar(), 'Filter by bureau or service')).toEqual([
      'All Bureaus & Services (All)',
      'TEST Bureau A',
      'TEST Bureau B',
    ])
  })

  it('still offers "All" when no bureaus are given', () => {
    expect(optionLabels(mountToolbar([]), 'Filter by bureau or service')).toEqual([
      'All Bureaus & Services (All)',
    ])
  })

  it('shows the employment types exactly as given', () => {
    expect(optionLabels(mountToolbar(), 'Filter by employment status')).toEqual([
      'TEST All types',
      'TEST Regular',
    ])
  })

  it('labels the readiness filters with their counts', () => {
    const buttons = mountToolbar().get('[aria-label="Filter by readiness"]').findAll('button')

    expect(buttons.map((button) => button.text())).toEqual(['All (3)', 'Ready (2)', 'Flagged (1)'])
  })
})
