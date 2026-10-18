import type { AvatarTone, BadgeTone } from '@/types/ui'

export interface AttendanceSummary {
  hours: number
  basis: string
  verified: boolean
  extra: { label: string; positive: boolean }
  tardy: { label: string; flagged: boolean }
  source: { label: string; verified: boolean }
}

export interface StatutoryLine {
  label: string
  /** Numbers render as pesos; strings (policy numbers, remittance notes) render as-is. */
  value: number | string
  muted?: boolean
}

export interface DeductionSegment {
  label: string
  amount: number
}

export interface DeductionLine {
  segments: readonly DeductionSegment[]
  flagged?: boolean
}

export interface LedgerRow {
  id: string
  initials: string
  avatarTone: AvatarTone
  name: string
  grade: string
  gradeTone: BadgeTone
  office: string
  position: string
  attendance: AttendanceSummary
  email: string
  pinRule: string
  statutory: readonly StatutoryLine[]
  deductionTotal: number
  deductionLines: readonly DeductionLine[]
  netPay: number
  netStatus: string
}

export interface DtrSource {
  path: string
  folderLabel: string
  rawFilesParsed: number
  checksum: string
}

export interface BatchSummary {
  cycleTag: string
  totalRecords: number
  selectedCount: number
  readyCount: number
  flaggedCount: number
  /** `null` until a DTR folder has been selected and parsed. */
  dtrSource: DtrSource | null
}

export type StatusFilterId = 'all' | 'ready' | 'flagged'
