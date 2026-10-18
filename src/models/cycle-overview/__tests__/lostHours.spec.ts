import { describe, expect, it } from 'vitest'

import type { LostHoursKind, LostHoursPeriod } from '../types'
import { describeTrend, improvementOverPrevious } from '../lostHours'

const period = (id: string, hours: number, kind: LostHoursKind): LostHoursPeriod => ({
  id,
  label: `TEST ${id}`,
  hours,
  kind,
})

describe('improvementOverPrevious', () => {
  it('measures the current period against the one before it', () => {
    const periods = [
      period('p1', 100, 'past'),
      period('p2', 80, 'past'),
      period('p3', 60, 'current'),
      period('goal', 40, 'target'),
    ]

    expect(improvementOverPrevious(periods)).toBe(25)
  })

  it('is negative when lost hours grew', () => {
    expect(improvementOverPrevious([period('p1', 60, 'past'), period('p2', 75, 'current')])).toBe(
      -25,
    )
  })

  it('is null when there is no current period', () => {
    expect(improvementOverPrevious([period('p1', 60, 'past'), period('goal', 40, 'target')])).toBe(
      null,
    )
  })

  it('is null when the current period has nothing before it', () => {
    expect(improvementOverPrevious([period('p1', 60, 'current')])).toBe(null)
  })
})

describe('describeTrend', () => {
  it('reports fewer lost hours as good news', () => {
    expect(describeTrend(7.77)).toEqual({
      text: '7.8% lower vs prior period',
      icon: 'trending_down',
      tone: 'positive',
    })
  })

  it('reports more lost hours as bad news', () => {
    expect(describeTrend(-12)).toEqual({
      text: '12.0% higher vs prior period',
      icon: 'trending_up',
      tone: 'negative',
    })
  })

  it('says nothing changed at zero', () => {
    expect(describeTrend(0)).toEqual({ text: 'Unchanged vs prior period', icon: 'trending_flat' })
  })

  it('says there is nothing to compare with when there is no prior period', () => {
    expect(describeTrend(null)).toEqual({
      text: 'No prior period to compare',
      icon: 'trending_flat',
    })
  })
})
