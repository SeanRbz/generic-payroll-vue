import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import type { EmployeeRecord } from '@/models/employee-masterlist/types'
import EmployeeTable from '../EmployeeTable.vue'

const plantilla: EmployeeRecord = {
  id: 'TEST-EMP-001',
  initials: 'TP',
  avatarTone: 'primary',
  name: 'Test Plantilla',
  classification: { label: 'Plantilla', tone: 'success' },
  position: 'Test Specialist',
  office: 'Test Bureau',
  grade: 'SG-18 / Step 1',
  gsis: { number: '1111111111', details: ['Active (9% EE • 12% Gov)', 'Policy: Regular Member'] },
  pagibig: { number: '1111-1111-1111', details: ['Mandatory: ₱200.00/Mo'] },
  philhealth: { number: '11-111111111-1', details: ['Tier 1 • Formal Economy'] },
  compensation: { amount: 50000, basis: 'monthly', pera: 2000 },
}

const cos: EmployeeRecord = {
  id: 'TEST-COS-001',
  initials: 'TC',
  avatarTone: 'muted',
  name: 'Test Contractual',
  classification: { label: 'COS / Job Order', tone: 'primary' },
  position: 'Test Officer',
  office: 'Test Regional Office',
  grade: 'COS Daily Tier 2',
  gsis: { number: 'Exempt (COS)', details: ["No Gov't GSIS Premium Match"], muted: true },
  pagibig: { number: '2222-2222-2222', details: ['Mandatory: ₱100.00/Mo'] },
  philhealth: { number: '22-222222222-2', details: ['Individual Payer'] },
  compensation: { amount: 1000, basis: 'daily', pera: null },
}

function mountTable(employees: EmployeeRecord[], total = employees.length) {
  return mount(EmployeeTable, {
    props: { employees, pagination: { page: 1, pageSize: 6, total } },
  })
}

describe('EmployeeTable', () => {
  it('lists each employee with their three statutory identities', () => {
    const rows = mountTable([plantilla, cos]).findAll('tbody tr')

    expect(rows).toHaveLength(2)
    const first = rows[0]?.text() ?? ''
    expect(first).toContain('Test Plantilla')
    expect(first).toContain('TEST-EMP-001')
    expect(first).toContain('Test Bureau')
    expect(first).toContain('SG-18 / Step 1')
    expect(first).toContain('1111111111')
    expect(first).toContain('1111-1111-1111')
    expect(first).toContain('11-111111111-1')
  })

  it('shows a plantilla salary as a monthly basic with PERA', () => {
    const first = mountTable([plantilla]).get('tbody tr').text()

    expect(first).toContain('₱50,000.00')
    expect(first).toContain('Monthly Basic')
    expect(first).toContain('PERA: +₱2,000.00')
  })

  it('treats a COS worker as GSIS-exempt, on a daily rate, without PERA', () => {
    const row = mountTable([cos]).get('tbody tr').text()

    expect(row).toContain('COS / Job Order')
    expect(row).toContain('Exempt (COS)')
    expect(row).toContain('₱1,000.00')
    expect(row).toContain('Daily Rate')
    expect(row).toContain('Non-PERA')
    expect(row).not.toContain('PERA: +')
  })

  it('gives every row quick edit, audit history and detail actions', () => {
    const row = mountTable([plantilla]).get('tbody tr')

    expect(row.find('button[aria-label="Quick edit Test Plantilla"]').exists()).toBe(true)
    expect(row.find('button[aria-label="Audit history for Test Plantilla"]').exists()).toBe(true)
    expect(row.find('button[aria-label="View details for Test Plantilla"]').exists()).toBe(true)
  })

  it('reports the visible range and total from its pagination prop', () => {
    expect(mountTable([plantilla, cos], 148).text()).toContain('Showing 1-6 of 148 employees')
  })

  it('shows an empty state and a zero range when there are no employees', () => {
    const wrapper = mountTable([])

    expect(wrapper.findAll('tbody tr')).toHaveLength(1)
    expect(wrapper.text()).toContain('No employees loaded')
    expect(wrapper.text()).toContain('Showing 0-0 of 0 employees')
  })
})
