import type { RecipientStat, RecipientSummary } from '@/models/recipients/types'

export const recipientSummary: RecipientSummary = {
  total: 148,
  govnetVerified: 142,
  externalBackup: 6,
  securityMethod: 'Encrypted PDF (PIN)',
  syncSource: 'HRIS / Active Directory',
  syncedAt: 'today at 08:30 AM',
}

export const recipientStats: readonly RecipientStat[] = [
  {
    id: 'total',
    label: 'Total Configured',
    value: `${recipientSummary.total} Staff`,
    dot: 'primary',
  },
  {
    id: 'govnet',
    label: 'GovNet Verified',
    value: `${recipientSummary.govnetVerified} Accounts`,
    dot: 'success',
  },
  {
    id: 'external',
    label: 'External / Backup',
    value: `${recipientSummary.externalBackup} Personal`,
    dot: 'neutral',
  },
  {
    id: 'security',
    label: 'Security Method',
    value: recipientSummary.securityMethod,
    dot: 'primary',
  },
]
