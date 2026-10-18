import type { AvatarTone, BadgeTone } from '@/types/ui'

export interface Recipient {
  id: string
  name: string
  initials: string
  avatarTone: AvatarTone
  email: string
  verification: { label: string; tone: BadgeTone }
  bureau: string
  pinSecurity: string
  routing: string
  status: string
}

export interface RecipientStat {
  id: string
  label: string
  value: string
  dot: 'primary' | 'success' | 'neutral'
}

export interface RecipientSummary {
  total: number
  govnetVerified: number
  externalBackup: number
  securityMethod: string
  syncSource: string
  /** `null` until the directory has been synchronized or imported. */
  syncedAt: string | null
}
