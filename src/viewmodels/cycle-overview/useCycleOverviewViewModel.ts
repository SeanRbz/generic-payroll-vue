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

/**
 * Cycle Overview page: the summary cards and the three charts. The chart figures are the very
 * values the cards were built from, so the two can never disagree.
 */
export function useCycleOverviewViewModel() {
  return {
    cycleHeader,
    cycleMetrics,
    bureauHeadcount,
    lostHoursTrend,
    lostHoursBreakdown,
    lostHoursImpact,
    lostHoursImprovement,
    fundAllocations,
    disbursement,
  }
}
