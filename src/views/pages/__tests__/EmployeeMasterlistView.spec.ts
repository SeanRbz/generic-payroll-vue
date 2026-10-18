import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { employees } from '@/models/employee-masterlist/data/employees'
import {
  employeePagination,
  masterlistHeader,
  masterlistMetrics,
} from '@/models/employee-masterlist/data/masterlistSummary'
import { formatNumber, formatPeso } from '@/utils/format'
import EmployeeMasterlistView from '../EmployeeMasterlistView.vue'

function mountView() {
  return mount(EmployeeMasterlistView)
}

function metric(id: string) {
  const found = masterlistMetrics.find((candidate) => candidate.id === id)
  if (!found) throw new Error(`no metric "${id}"`)
  return found
}

describe('EmployeeMasterlistView', () => {
  it('shows the page title, breadcrumb and the registry status', () => {
    const wrapper = mountView()

    expect(wrapper.get('h1').text()).toBe('Employee Masterlist & Compensation Directory')
    expect(wrapper.get('nav[aria-label="Breadcrumb"]').text()).toContain(
      'Personnel Compensation Master',
    )
    expect(wrapper.get('nav[aria-label="Breadcrumb"] [aria-current="page"]').text()).toBe(
      'Employee Masterlist',
    )
    expect(wrapper.text()).toContain(masterlistHeader.registryStatus)
    expect(wrapper.text()).not.toContain('Awaiting Import')
  })

  it('shows the four overview cards with the sample figures', () => {
    const text = mountView().get('section[aria-label="Workforce summary"]').text()

    expect(text).toContain('Total Active Personnel')
    expect(text).toContain(String(metric('personnel').note))
    expect(text).toContain(formatNumber(Number(metric('personnel').value)))
    expect(text).toContain('Statutory Compliance')
    expect(text).toContain(`${formatNumber(Number(metric('compliance').value), 1)}%`)
    expect(text).toContain(String(metric('compliance').note))
    expect(text).toContain('Monthly Gross Commitment')
    expect(text).toContain(formatPeso(Number(metric('gross-commitment').value)))
  })

  it('keeps the SSL VI rate matrix card, which is a fixed policy label rather than sample data', () => {
    const text = mountView().get('section[aria-label="Workforce summary"]').text()

    expect(text).toContain('Active SSL VI Rate Matrix')
    expect(text).toContain('SSL VI')
    expect(text).toContain('2025 • Tranche 2')
  })

  it('lists the sample employees and pages through the full roster', () => {
    const wrapper = mountView()

    expect(wrapper.findAll('tbody tr')).toHaveLength(employees.length)
    expect(wrapper.text()).not.toContain('No employees loaded')
    expect(wrapper.text()).toContain(
      `Showing 1-${employeePagination.pageSize} of ${formatNumber(employeePagination.total)} employees`,
    )
  })

  it('keeps the statutory guideline cards', () => {
    const wrapper = mountView()

    expect(
      wrapper.get('section[aria-label="Statutory guidelines"]').findAll('article'),
    ).toHaveLength(3)
  })
})
