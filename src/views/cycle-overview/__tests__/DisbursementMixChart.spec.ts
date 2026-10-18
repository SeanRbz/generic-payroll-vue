import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { formatPeso } from '@/utils/format'
import type { DisbursementSummary } from '@/models/cycle-overview/disbursement'
import type { FundAllocation } from '@/models/cycle-overview/types'
import DisbursementMixChart from '../DisbursementMixChart.vue'

const funds: FundAllocation[] = [
  { id: 'a', label: 'TEST Fund A', description: 'TEST purpose A', amount: 600 },
  { id: 'b', label: 'TEST Fund B', description: 'TEST purpose B', amount: 200 },
]

/** TEST gross of 1,000 paid out by the two funds above (800 net, 200 withheld). */
const summary: DisbursementSummary = {
  gross: 1000,
  net: 800,
  deductions: 200,
  netShare: 80,
  deductionShare: 20,
}

/** TEST gross that the two funds above cover in full. */
const fullyFunded: DisbursementSummary = {
  gross: 800,
  net: 800,
  deductions: 0,
  netShare: 100,
  deductionShare: 0,
}

const nothing: DisbursementSummary = {
  gross: 0,
  net: 0,
  deductions: 0,
  netShare: 0,
  deductionShare: 0,
}

function mountChart(split: DisbursementSummary = summary) {
  return mount(DisbursementMixChart, { props: { summary: split, funds } })
}

describe('DisbursementMixChart', () => {
  it('leads with the gross inflow', () => {
    expect(mountChart().text()).toContain(`${formatPeso(1000)} (100%)`)
  })

  it('splits the bar into net pay and deductions in proportion', () => {
    const [net, deductions] = mountChart().findAll('[role="img"]')

    expect(net?.attributes('aria-label')).toBe('Net pay: ₱800.00 (80.0% of gross)')
    expect(net?.attributes('style')).toContain('flex-grow: 800')
    expect(deductions?.attributes('aria-label')).toBe('Deductions: ₱200.00 (20.0% of gross)')
    expect(deductions?.attributes('style')).toContain('flex-grow: 200')
  })

  it('rounds only the end of the bar', () => {
    const [first, last] = mountChart().findAll('[role="img"] > div.h-6')

    expect(first?.classes()).not.toContain('rounded-r-lg')
    expect(last?.classes()).toContain('rounded-r-lg')
  })

  it('shows a legend with each share', () => {
    const legend = mountChart().get('ul[aria-label="Legend"]').text()

    expect(legend).toContain('Net pay · 80.0%')
    expect(legend).toContain('Deductions · 20.0%')
  })

  it('lists each fund with its amount, share of the net and a meter', () => {
    const [first] = mountChart().findAll('ul[aria-label="Net payable by fund"] > li')

    expect(first?.text()).toContain('TEST Fund A')
    expect(first?.text()).toContain('TEST purpose A')
    expect(first?.text()).toContain('₱600.00')
    expect(first?.text()).toContain('75.0% of net')
    expect(first?.get('div.h-full').attributes('style')).toContain('width: 75%')
  })

  it('drops the deductions segment when the funds cover the whole gross', () => {
    const wrapper = mountChart(fullyFunded)

    expect(wrapper.findAll('[role="img"]')).toHaveLength(1)
    expect(wrapper.text()).not.toContain('Deductions')
  })

  it('has a table view of the gross, its split and the funds', () => {
    expect(mountChart().findAll('details tbody tr')).toHaveLength(5)
  })

  it('shows no segments and no NaN when there is nothing to disburse', () => {
    const wrapper = mount(DisbursementMixChart, { props: { summary: nothing, funds: [] } })

    expect(wrapper.findAll('[role="img"]')).toHaveLength(0)
    expect(wrapper.text()).not.toContain('NaN')
    expect(wrapper.text()).toContain(`${formatPeso(0)} (100%)`)
  })
})
