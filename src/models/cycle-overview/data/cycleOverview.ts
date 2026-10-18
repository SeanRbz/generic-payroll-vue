import type { Metric } from '@/types/ui'
import { activeCycle } from '@/config/shell'
import { formatNumber } from '@/utils/format'
import type {
  BureauHeadcount,
  CycleHeader,
  FundAllocation,
  LostHoursCategory,
  LostHoursPeriod,
} from '@/models/cycle-overview/types'
import { summarizeDisbursement } from '@/models/cycle-overview/disbursement'
import { describeTrend, improvementOverPrevious } from '@/models/cycle-overview/lostHours'

// Illustrative sample figures: the per-bureau Regular/COS splits, the target hours and the fund
// names are not real data. Every total below is derived from its rows, so the cards and the
// charts can never disagree.

const sum = (values: readonly number[]): number => values.reduce((total, value) => total + value, 0)

export const cycleHeader: CycleHeader = {
  breadcrumb: [
    'Financial Operations',
    'Disbursement Cycles',
    `Cycle Overview (${activeCycle.label})`,
  ],
  title: 'Active Disbursement Cycle',
  coverage:
    'Covering Pay Period: May 1 – 15, 2025 • Land Bank of the Philippines (LBP) Direct ADA Protocol',
  statusLabel: 'Cycle status: In verification / pre-disbursement',
  statusTone: 'success',
}

export const bureauHeadcount: readonly BureauHeadcount[] = [
  { id: 'fmb', label: 'Forest Management Bureau (FMB)', regular: 32, cos: 10 },
  { id: 'bmb', label: 'Biodiversity Management Bureau (BMB)', regular: 30, cos: 8 },
  { id: 'lmb', label: 'Land Management Bureau (LMB)', regular: 24, cos: 8 },
  { id: 'legal', label: 'Legal & Legislative Affairs', regular: 14, cos: 4 },
  { id: 'regional', label: 'NCR Regional / Field Ops', regular: 12, cos: 6 },
]

const regularHeadcount = sum(bureauHeadcount.map((bureau) => bureau.regular))
const cosHeadcount = sum(bureauHeadcount.map((bureau) => bureau.cos))
const totalHeadcount = regularHeadcount + cosHeadcount

export const lostHoursBreakdown: readonly LostHoursCategory[] = [
  { id: 'tardiness', label: 'Tardiness', hours: 82.5 },
  { id: 'undertime', label: 'Undertime', hours: 42 },
  { id: 'unapproved', label: 'Unapproved', hours: 18 },
]

const totalLostHours = sum(lostHoursBreakdown.map((category) => category.hours))

export const lostHoursTrend: readonly LostHoursPeriod[] = [
  { id: 'apr-1', label: 'Apr 1–15', hours: 168, kind: 'past' },
  { id: 'apr-2', label: 'Apr 16–30', hours: 154.5, kind: 'past' },
  { id: 'may-1', label: 'May 1–15', hours: totalLostHours, kind: 'current' },
  { id: 'target', label: 'Target', hours: 120, kind: 'target' },
]

/** Pesos auto-deducted for the current period's lost hours. */
export const lostHoursImpact = 18430

export const grossEarnings = 4120850

export const fundAllocations: readonly FundAllocation[] = [
  {
    id: 'fund-101',
    label: 'Fund 101: Regular Agency Fund',
    description: 'General Fund personnel services',
    amount: 2410450,
  },
  {
    id: 'fund-151',
    label: 'Fund 151: Special Projects / Revolving',
    description: 'FMB project staff & overhead',
    amount: 482000,
  },
]

/** Gross, net and deductions for the cards and the disbursement chart: one derivation for both. */
export const disbursement = summarizeDisbursement(grossEarnings, fundAllocations)
/** Lost-hours change vs the prior period, shared by the card footer and the trend chart badge. */
export const lostHoursImprovement = improvementOverPrevious(lostHoursTrend)
const lostHoursTrendNote = describeTrend(lostHoursImprovement)

export const cycleMetrics: readonly Metric[] = [
  {
    id: 'personnel',
    label: 'Active Personnel',
    icon: 'groups',
    accent: 'primary',
    iconTone: 'primary',
    value: totalHeadcount,
    format: 'count',
    unit: 'staff',
    footer: [{ text: `${regularHeadcount} Plantilla` }, { text: `${cosHeadcount} COS/JO` }],
    footerSeparator: true,
  },
  {
    id: 'lost-hours',
    label: 'Lost Hours / DTR',
    icon: 'schedule',
    accent: 'outline',
    iconTone: 'neutral',
    value: totalLostHours,
    format: 'hours',
    unit: 'hrs logged',
    footer: [lostHoursTrendNote],
  },
  {
    id: 'gross',
    label: 'Total Gross Earnings',
    icon: 'payments',
    accent: 'primary-container',
    iconTone: 'primary',
    value: disbursement.gross,
    format: 'peso',
    footer: [{ text: 'Basic + PERA' }, { text: '+ RATA' }],
    footerSeparator: true,
  },
  {
    id: 'statutory',
    label: 'Statutory & Taxes',
    icon: 'account_balance',
    accent: 'outline',
    iconTone: 'neutral',
    value: disbursement.deductions,
    format: 'peso',
    footer: [{ text: `${formatNumber(disbursement.deductionShare, 1)}% of gross` }],
  },
  {
    id: 'net-payable',
    label: 'Verified Net Payable',
    icon: 'price_check',
    accent: 'secondary',
    iconTone: 'success',
    emphasized: true,
    value: disbursement.net,
    format: 'peso',
    footer: [{ text: 'LBP ADA', tone: 'strong' }, { text: `${totalHeadcount} ready` }],
  },
]
