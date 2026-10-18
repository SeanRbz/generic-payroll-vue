import { percentOf } from '@/utils/chart'
import type { FundAllocation } from './types'

export interface DisbursementSummary {
  gross: number
  /** What the funds pay out: the sum of every allocation. */
  net: number
  /** Everything withheld between gross earnings and net payable (statutory shares and taxes). */
  deductions: number
  netShare: number
  deductionShare: number
}

export function summarizeDisbursement(
  gross: number,
  funds: readonly FundAllocation[],
): DisbursementSummary {
  const net = funds.reduce((total, fund) => total + fund.amount, 0)
  const deductions = gross - net
  return {
    gross,
    net,
    deductions,
    netShare: percentOf(net, gross),
    deductionShare: percentOf(deductions, gross),
  }
}
