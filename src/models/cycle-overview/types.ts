import type { BadgeTone } from '@/types/ui'

export interface CycleHeader {
  breadcrumb: readonly string[]
  title: string
  coverage: string
  statusLabel: string
  statusTone: BadgeTone
}

/** Headcount of one bureau, split by employment type. */
export interface BureauHeadcount {
  id: string
  label: string
  /** Plantilla (regular) employees. */
  regular: number
  /** Contract of Service / Job Order workers. */
  cos: number
}

export type LostHoursKind = 'past' | 'current' | 'target'

export interface LostHoursPeriod {
  id: string
  label: string
  hours: number
  kind: LostHoursKind
}

export interface LostHoursCategory {
  id: string
  label: string
  hours: number
}

/** One fund that pays out part of the net payable. */
export interface FundAllocation {
  id: string
  label: string
  description: string
  amount: number
}
