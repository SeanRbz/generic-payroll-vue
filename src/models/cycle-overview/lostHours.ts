import type { MetricFooterItem } from '@/types/ui'
import { percentReduction } from '@/utils/chart'
import { formatNumber } from '@/utils/format'
import type { LostHoursPeriod } from './types'

/** How much the current period improved on the one before it (%); null when either is missing. */
export function improvementOverPrevious(periods: readonly LostHoursPeriod[]): number | null {
  const index = periods.findIndex((period) => period.kind === 'current')
  const current = periods[index]
  const previous = periods[index - 1]
  if (!current || !previous) return null
  return percentReduction(previous.hours, current.hours)
}

/** Footer note for the lost-hours card: fewer lost hours than the previous period is good news. */
export function describeTrend(improvement: number | null): MetricFooterItem {
  if (improvement === null) return { text: 'No prior period to compare', icon: 'trending_flat' }
  if (improvement === 0) return { text: 'Unchanged vs prior period', icon: 'trending_flat' }

  const size = `${formatNumber(Math.abs(improvement), 1)}%`
  return improvement > 0
    ? { text: `${size} lower vs prior period`, icon: 'trending_down', tone: 'positive' }
    : { text: `${size} higher vs prior period`, icon: 'trending_up', tone: 'negative' }
}
