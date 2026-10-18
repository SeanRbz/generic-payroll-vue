import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import type { LedgerRow } from '@/models/batch-generator/types'
import PayrollLedgerTable from '../PayrollLedgerTable.vue'

function makeRow(overrides: Partial<LedgerRow> = {}): LedgerRow {
  return {
    id: 'TEST-0001',
    initials: 'TA',
    avatarTone: 'primary',
    name: 'Test Alpha',
    grade: 'SG-10',
    gradeTone: 'primary',
    office: 'Test Office',
    position: 'Test Position',
    attendance: {
      hours: 88,
      basis: 'Standard',
      verified: true,
      extra: { label: '+2.0 hrs OT', positive: true },
      tardy: { label: '0 min Tardy', flagged: false },
      source: { label: 'DTR Log #1 (Biometric Confirmed)', verified: true },
    },
    email: 'test.alpha@example.gov.ph',
    pinRule: 'Last 4 TIN',
    statutory: [
      { label: 'GSIS (9%)', value: 1000 },
      { label: 'Policy #', value: '0000000001' },
      { label: 'PhilHealth', value: 500 },
    ],
    deductionTotal: 2500,
    deductionLines: [
      { segments: [{ label: 'BIR W/Tax', amount: 1000 }] },
      {
        segments: [
          { label: 'HDMF', amount: 200 },
          { label: 'Tardy', amount: 300 },
        ],
        flagged: true,
      },
    ],
    netPay: 12345.67,
    netStatus: 'ADA Ready',
    ...overrides,
  }
}

function mountTable(rows: LedgerRow[], selectedCount = rows.length) {
  return mount(PayrollLedgerTable, {
    props: { rows, selectedCount, pagination: { page: 1, pageSize: 8, total: rows.length } },
  })
}

describe('PayrollLedgerTable', () => {
  it('renders one row per record with identity, contact and net pay', () => {
    const wrapper = mountTable([
      makeRow(),
      makeRow({ id: 'TEST-0002', name: 'Test Beta', netPay: 2000, netStatus: 'Check Issued' }),
    ])
    const rows = wrapper.findAll('tbody tr')

    expect(rows).toHaveLength(2)
    expect(rows[0]?.text()).toContain('Test Alpha')
    expect(rows[0]?.text()).toContain('TEST-0001 • Test Office')
    expect(rows[0]?.text()).toContain('test.alpha@example.gov.ph')
    expect(rows[0]?.text()).toContain('₱12,345.67')
    expect(rows[1]?.text()).toContain('Test Beta')
    expect(rows[1]?.text()).toContain('₱2,000.00')
    expect(rows[1]?.text()).toContain('Check Issued')
  })

  it('formats numeric statutory lines as pesos and shows text lines as given', () => {
    const text = mountTable([makeRow()]).get('tbody tr').text()

    expect(text).toContain('GSIS (9%):')
    expect(text).toContain('₱1,000.00')
    expect(text).toContain('0000000001')
    expect(text).toContain('₱500.00')
  })

  it('joins multi-part deduction lines and shows the deduction total', () => {
    const text = mountTable([makeRow()]).get('tbody tr').text()

    expect(text).toContain('₱2,500.00')
    expect(text).toContain('BIR W/Tax: ₱1,000.00')
    expect(text).toContain('HDMF: ₱200.00 • Tardy: ₱300.00')
  })

  it('reports the selection and visible range from its props', () => {
    const text = mountTable([makeRow(), makeRow({ id: 'TEST-0002' })], 1).text()

    expect(text).toContain('Select All (1 Rows Checked)')
    expect(text).toContain('Displaying 1-2 of 2 Employees')
    expect(text).toContain('Page 1 of 1')
  })

  it('shows an empty state instead of rows when there are no records', () => {
    const wrapper = mountTable([])

    expect(wrapper.findAll('tbody tr')).toHaveLength(1)
    expect(wrapper.text()).toContain('No payroll records loaded')
    expect(wrapper.text()).toContain('Select All (0 Rows Checked)')
    expect(wrapper.text()).toContain('Waiting for DTR data')
    expect(wrapper.text()).toContain('Displaying 0-0 of 0 Employees')
  })
})
