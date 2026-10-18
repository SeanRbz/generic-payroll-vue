import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import type { SelectOption } from '@/types/ui'
import MasterlistToolbar from '../MasterlistToolbar.vue'

const testBureaus: readonly SelectOption[] = [{ value: 'test-a', label: 'TEST Bureau A' }]

const testClassifications: readonly SelectOption[] = [
  { value: 'all', label: 'TEST All classifications' },
  { value: 'test-plantilla', label: 'TEST Plantilla' },
]

const testStatutoryStatuses: readonly SelectOption[] = [
  { value: 'all', label: 'TEST All statuses' },
  { value: 'test-complete', label: 'TEST Complete' },
]

function mountToolbar(bureauOptions: readonly SelectOption[] = testBureaus) {
  return mount(MasterlistToolbar, {
    props: {
      bureauOptions,
      classificationOptions: testClassifications,
      statutoryStatusOptions: testStatutoryStatuses,
    },
  })
}

const optionLabels = (wrapper: ReturnType<typeof mountToolbar>, label: string) =>
  wrapper
    .get(`select[aria-label="${label}"]`)
    .findAll('option')
    .map((option) => option.text())

describe('MasterlistToolbar', () => {
  it('offers "All Bureaus & Services" first, then the given bureaus', () => {
    expect(optionLabels(mountToolbar(), 'Filter by bureau or service')).toEqual([
      'All Bureaus & Services',
      'TEST Bureau A',
    ])
  })

  it('still offers "All" when no bureaus are given', () => {
    expect(optionLabels(mountToolbar([]), 'Filter by bureau or service')).toEqual([
      'All Bureaus & Services',
    ])
  })

  it('puts each option list in its own select', () => {
    const wrapper = mountToolbar()

    expect(optionLabels(wrapper, 'Filter by classification')).toEqual([
      'TEST All classifications',
      'TEST Plantilla',
    ])
    expect(optionLabels(wrapper, 'Filter by statutory status')).toEqual([
      'TEST All statuses',
      'TEST Complete',
    ])
  })
})
