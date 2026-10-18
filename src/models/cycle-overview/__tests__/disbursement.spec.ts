import { describe, expect, it } from 'vitest'

import type { FundAllocation } from '../types'
import { summarizeDisbursement } from '../disbursement'

const funds: FundAllocation[] = [
  { id: 'a', label: 'TEST Fund A', description: 'TEST purpose A', amount: 600 },
  { id: 'b', label: 'TEST Fund B', description: 'TEST purpose B', amount: 200 },
]

describe('summarizeDisbursement', () => {
  it('pays the net out of the funds and treats the rest of gross as deductions', () => {
    expect(summarizeDisbursement(1000, funds)).toEqual({
      gross: 1000,
      net: 800,
      deductions: 200,
      netShare: 80,
      deductionShare: 20,
    })
  })

  it('has no shares when there is nothing to disburse', () => {
    expect(summarizeDisbursement(0, [])).toEqual({
      gross: 0,
      net: 0,
      deductions: 0,
      netShare: 0,
      deductionShare: 0,
    })
  })

  it('has no deductions when the funds cover the whole gross', () => {
    expect(summarizeDisbursement(800, funds)).toMatchObject({
      deductions: 0,
      netShare: 100,
      deductionShare: 0,
    })
  })
})
