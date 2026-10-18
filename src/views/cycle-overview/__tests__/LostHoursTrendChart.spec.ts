import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import type { LostHoursCategory, LostHoursPeriod } from '@/models/cycle-overview/types'
import LostHoursTrendChart from '../LostHoursTrendChart.vue'

const periods: LostHoursPeriod[] = [
  { id: 'p1', label: 'TEST P1', hours: 100, kind: 'past' },
  { id: 'p2', label: 'TEST P2', hours: 80, kind: 'past' },
  { id: 'p3', label: 'TEST P3', hours: 60, kind: 'current' },
  { id: 'goal', label: 'TEST Goal', hours: 40, kind: 'target' },
]

const breakdown: LostHoursCategory[] = [
  { id: 'a', label: 'TEST Category A', hours: 35.5 },
  { id: 'b', label: 'TEST Category B', hours: 24.5 },
]

function mountChart(list: readonly LostHoursPeriod[] = periods, improvement: number | null = 25) {
  return mount(LostHoursTrendChart, {
    props: { periods: list, breakdown, impact: 1500, improvement },
  })
}

function columnsOf(wrapper: ReturnType<typeof mountChart>) {
  return wrapper.findAll('ul[aria-label="Lost hours per pay period"] > li')
}

describe('LostHoursTrendChart', () => {
  it('draws one column per period, scaled to the tallest', () => {
    const heights = columnsOf(mountChart()).map((column) =>
      column.get('div.absolute').attributes('style'),
    )

    expect(heights).toEqual([
      expect.stringContaining('height: 100%'),
      expect.stringContaining('height: 80%'),
      expect.stringContaining('height: 60%'),
      expect.stringContaining('height: 40%'),
    ])
  })

  it('prints each value on its column with one decimal', () => {
    const [first] = columnsOf(mountChart())

    expect(first?.text()).toContain('100.0')
    expect(first?.text()).toContain('TEST P1')
  })

  it('describes each column, including what kind of period it is', () => {
    const columns = columnsOf(mountChart())

    expect(columns[0]?.attributes('aria-label')).toBe('TEST P1: 100.0 hours (Previous period)')
    expect(columns[2]?.attributes('aria-label')).toBe('TEST P3: 60.0 hours (Current period)')
    expect(columns[3]?.attributes('aria-label')).toBe('TEST Goal: 40.0 hours (Target)')
  })

  it('badges the improvement over the previous period', () => {
    expect(mountChart().text()).toContain('25.0% improvement')
  })

  it('shows no badge when lost hours grew', () => {
    const worse: LostHoursPeriod[] = [
      { id: 'p1', label: 'TEST P1', hours: 60, kind: 'past' },
      { id: 'p2', label: 'TEST P2', hours: 75, kind: 'current' },
    ]

    expect(mountChart(worse, -25).text()).not.toContain('improvement')
  })

  it('shows no badge when lost hours did not change', () => {
    expect(mountChart(periods, 0).text()).not.toContain('improvement')
  })

  it('explains the colours in a legend', () => {
    const items = mountChart()
      .get('ul[aria-label="Legend"]')
      .findAll('li')
      .map((item) => item.text())

    expect(items).toEqual(['Previous period', 'Current period', 'Target'])
  })

  it('breaks the current period down by category and shows the deduction impact', () => {
    const wrapper = mountChart()
    const breakdownText = wrapper.get('dl').text()

    expect(breakdownText).toContain('TEST Category A')
    expect(breakdownText).toContain('35.5 hrs')
    expect(wrapper.text()).toContain('Impact: −₱1,500.00 auto-deducted')
  })

  it('has a table view of the periods and the categories', () => {
    expect(mountChart().findAll('details tbody tr')).toHaveLength(6)
  })

  it('draws flat columns instead of NaN when there are no hours at all', () => {
    const idle: LostHoursPeriod[] = [{ id: 'p1', label: 'TEST P1', hours: 0, kind: 'current' }]
    const [column] = columnsOf(mountChart(idle, null))

    expect(column?.get('div.absolute').attributes('style')).toContain('height: 0%')
  })

  it('draws no columns and no badge when there are no periods', () => {
    const wrapper = mountChart([], null)

    expect(columnsOf(wrapper)).toHaveLength(0)
    expect(wrapper.text()).not.toContain('improvement')
    expect(wrapper.text()).not.toContain('NaN')
  })
})
