import { describe, expect, it } from 'vitest'

import {
  bureauHeadcount,
  cycleHeader,
  cycleMetrics,
  disbursement,
  fundAllocations,
  lostHoursBreakdown,
  lostHoursImpact,
  lostHoursImprovement,
  lostHoursTrend,
} from '@/models/cycle-overview/data/cycleOverview'
import { describeTrend } from '@/models/cycle-overview/lostHours'
import { useCycleOverviewViewModel } from '../useCycleOverviewViewModel'

const sum = (values: readonly number[]) => values.reduce((total, value) => total + value, 0)

function metric(id: string) {
  const found = cycleMetrics.find((candidate) => candidate.id === id)
  if (!found) throw new Error(`no metric "${id}"`)
  return found
}

const value = (id: string) => Number(metric(id).value)

describe('useCycleOverviewViewModel', () => {
  it('hands the page the cycle fixtures as they are', () => {
    const vm = useCycleOverviewViewModel()

    expect(vm.cycleHeader).toBe(cycleHeader)
    expect(vm.cycleMetrics).toBe(cycleMetrics)
    expect(vm.bureauHeadcount).toBe(bureauHeadcount)
    expect(vm.lostHoursTrend).toBe(lostHoursTrend)
    expect(vm.lostHoursBreakdown).toBe(lostHoursBreakdown)
    expect(vm.lostHoursImpact).toBe(lostHoursImpact)
    expect(vm.fundAllocations).toBe(fundAllocations)
    expect(vm.disbursement).toBe(disbursement)
    expect(vm.lostHoursImprovement).toBe(lostHoursImprovement)
  })

  it('gives the disbursement chart the same gross, deductions and net as the cards', () => {
    const { disbursement } = useCycleOverviewViewModel()

    expect(disbursement.gross).toBe(value('gross'))
    expect(disbursement.deductions).toBe(value('statutory'))
    expect(disbursement.net).toBe(value('net-payable'))
  })

  it('pays the chart net out of the funds it lists', () => {
    const { disbursement } = useCycleOverviewViewModel()

    expect(disbursement.net).toBe(sum(fundAllocations.map((fund) => fund.amount)))
    expect(disbursement.netShare + disbursement.deductionShare).toBeCloseTo(100)
  })

  it('badges the same lost-hours trend that the card reports', () => {
    const { lostHoursImprovement } = useCycleOverviewViewModel()

    expect(lostHoursImprovement).not.toBeNull()
    expect(describeTrend(lostHoursImprovement)).toEqual(metric('lost-hours').footer[0])
  })
})
