import type { AvatarTone, BadgeTone } from '@/types/ui'

export interface MasterlistHeader {
  breadcrumb: readonly string[]
  registryStatus: string
  registryTone: BadgeTone
  ledgerCode: string
  ledgerLabel: string
  title: string
  description: string
}

export interface StatutoryAccount {
  /** Government-issued identifier (GSIS BP no., Pag-IBIG MID, PhilHealth PIN). */
  number: string
  details: readonly string[]
  /** Dimmed styling for accounts that do not apply, e.g. GSIS for COS workers. */
  muted?: boolean
}

export interface EmployeeRecord {
  id: string
  initials: string
  avatarTone: AvatarTone
  name: string
  classification: { label: string; tone: BadgeTone }
  position: string
  office: string
  grade: string
  gsis: StatutoryAccount
  pagibig: StatutoryAccount
  philhealth: StatutoryAccount
  compensation: {
    amount: number
    basis: 'monthly' | 'daily'
    /** Personnel Economic Relief Allowance; null when the worker is not entitled to it. */
    pera: number | null
  }
}

export interface Guideline {
  id: string
  icon: string
  tone: 'primary' | 'success' | 'neutral'
  title: string
  body: string
}
