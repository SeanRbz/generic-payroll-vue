import { describe, expect, it } from 'vitest'

import {
  bureauHeadcount,
  cycleMetrics,
  fundAllocations,
  lostHoursBreakdown,
  lostHoursTrend,
} from '../cycleOverview'

const sum = (values: readonly number[]) => values.reduce((total, value) => total + value, 0)

function metric(id: string) {
  const found = cycleMetrics.find((candidate) => candidate.id === id)
  if (!found) throw new Error(`no metric "${id}"`)
  return found
}

const value = (id: string) => Number(metric(id).value)

describe('cycle overview sample data', () => {
  it('derives the personnel card from the bureau rows behind the chart', () => {
    expect(value('personnel')).toBe(
      sum(bureauHeadcount.map((bureau) => bureau.regular + bureau.cos)),
    )
  })

  it('derives the lost-hours card from the breakdown and the current period', () => {
    const current = lostHoursTrend.find((period) => period.kind === 'current')

    expect(value('lost-hours')).toBe(sum(lostHoursBreakdown.map((category) => category.hours)))
    expect(value('lost-hours')).toBe(current?.hours)
  })

  it('pays the net out of the funds and leaves the rest of gross as statutory and taxes', () => {
    expect(value('net-payable')).toBe(sum(fundAllocations.map((fund) => fund.amount)))
    expect(value('gross') - value('statutory')).toBe(value('net-payable'))
  })

  it('reports the drop in lost hours as good news on the card', () => {
    expect(metric('lost-hours').footer[0]).toMatchObject({
      icon: 'trending_down',
      tone: 'positive',
    })
  })
})
