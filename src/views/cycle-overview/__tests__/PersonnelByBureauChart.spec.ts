import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import type { BureauHeadcount } from '@/models/cycle-overview/types'
import PersonnelByBureauChart from '../PersonnelByBureauChart.vue'

const bureaus: BureauHeadcount[] = [
  { id: 'a', label: 'TEST Bureau A', regular: 6, cos: 2 },
  { id: 'b', label: 'TEST Bureau B', regular: 2, cos: 0 },
  { id: 'c', label: 'TEST Bureau C', regular: 0, cos: 4 },
]

function mountChart(list: readonly BureauHeadcount[] = bureaus) {
  return mount(PersonnelByBureauChart, { props: { bureaus: list } })
}

function rowOf(wrapper: ReturnType<typeof mountChart>, label: string) {
  const row = wrapper
    .findAll('ul[aria-label="Headcount per bureau"] > li')
    .find((candidate) => candidate.text().includes(label))
  if (!row) throw new Error(`no row for "${label}"`)
  return row
}

describe('PersonnelByBureauChart', () => {
  it('shows each bureau with its total and Regular / COS split', () => {
    const row = rowOf(mountChart(), 'TEST Bureau A')

    expect(row.text()).toContain('8')
    expect(row.text()).toContain('(6 Reg / 2 COS)')
  })

  it('scales the longest bar to the full width and the others in proportion', () => {
    const wrapper = mountChart()
    const width = (label: string) =>
      rowOf(wrapper, label).get('[style*="width"]').attributes('style')

    expect(width('TEST Bureau A')).toContain('width: 100%')
    expect(width('TEST Bureau B')).toContain('width: 25%')
    expect(width('TEST Bureau C')).toContain('width: 50%')
  })

  it('sizes each segment by its count and leaves out empty ones', () => {
    const wrapper = mountChart()
    const segments = (label: string) => rowOf(wrapper, label).findAll('[role="img"]')
    const [regular, cos] = segments('TEST Bureau A')

    expect(regular?.attributes('style')).toContain('flex-grow: 6')
    expect(cos?.attributes('style')).toContain('flex-grow: 2')
    expect(segments('TEST Bureau B')).toHaveLength(1)
    expect(segments('TEST Bureau C')).toHaveLength(1)
  })

  it('rounds only the data end of each bar', () => {
    const [first, last] = rowOf(mountChart(), 'TEST Bureau A').findAll('[role="img"] > div.h-5')

    expect(first?.classes()).not.toContain('rounded-r-lg')
    expect(last?.classes()).toContain('rounded-r-lg')
  })

  it('labels every segment and makes it focusable', () => {
    const segment = rowOf(mountChart(), 'TEST Bureau A').get('[role="img"]')

    expect(segment.attributes('aria-label')).toBe('TEST Bureau A: 6 Plantilla (Regular)')
    expect(segment.attributes('tabindex')).toBe('0')
  })

  it('shows a legend with the totals per series', () => {
    const wrapper = mountChart()
    const legend = wrapper.get('ul[aria-label="Legend"]').text()

    expect(legend).toContain('Plantilla (Regular) · 8')
    expect(legend).toContain('COS / Job Order · 6')
    expect(wrapper.text()).toContain('14 total')
  })

  it('has a table view with the same numbers', () => {
    const rows = mountChart().findAll('details tbody tr')

    expect(rows).toHaveLength(3)
    expect(rows[0]?.findAll('th, td').map((cell) => cell.text())).toEqual([
      'TEST Bureau A',
      '6',
      '2',
      '8',
    ])
  })

  it('copes with no bureaus at all', () => {
    const wrapper = mountChart([])

    expect(wrapper.findAll('ul[aria-label="Headcount per bureau"] > li')).toHaveLength(0)
    expect(wrapper.text()).toContain('0 total')
  })

  it('draws a zero-length bar for a bureau with nobody in it', () => {
    const row = rowOf(
      mountChart([{ id: 'x', label: 'TEST Empty', regular: 0, cos: 0 }]),
      'TEST Empty',
    )

    expect(row.get('[style*="width"]').attributes('style')).toContain('width: 0%')
    expect(row.findAll('[role="img"]')).toHaveLength(0)
  })
})
