import type { Metric } from '@/types/ui'
import type { Pagination } from '@/utils/pagination'
import type { MasterlistHeader } from '@/models/employee-masterlist/types'

export const masterlistHeader: MasterlistHeader = {
  breadcrumb: ['Financial Operations', 'Personnel Compensation Master', 'Employee Masterlist'],
  registryStatus: 'Registry Synchronized',
  registryTone: 'success',
  ledgerCode: 'GP MSM 201-1',
  ledgerLabel: 'Bureau Master Ledger',
  title: 'Employee Masterlist & Compensation Directory',
  description:
    'Unified repository for employee Plantilla status, government statutory identity numbers (GSIS BP, HDMF Pag-IBIG MID, PhilHealth PIN), and monthly standard salary tranches.',
}

export const masterlistMetrics: readonly Metric[] = [
  {
    id: 'personnel',
    label: 'Total Active Personnel',
    icon: 'groups',
    accent: 'primary',
    iconTone: 'primary',
    value: 148,
    format: 'count',
    note: 'Active Enrolled',
    footer: [{ text: 'Regular Plantilla: 112' }, { text: 'COS / Contractual: 36' }],
    footerSeparator: true,
  },
  {
    id: 'compliance',
    label: 'Statutory Compliance',
    icon: 'verified_user',
    accent: 'secondary',
    iconTone: 'success',
    emphasized: true,
    value: 98.6,
    format: 'percent',
    note: '(146/148)',
    footer: [{ text: 'All GSIS BP, PhilHealth & HDMF MIDs Locked', icon: 'lock' }],
  },
  {
    id: 'gross-commitment',
    label: 'Monthly Gross Commitment',
    icon: 'payments',
    accent: 'primary-container',
    iconTone: 'primary',
    value: 4120850,
    format: 'peso',
    footer: [{ text: 'Average Base ₱27,842.58' }, { text: 'Fund 101' }],
    footerSeparator: true,
  },
  {
    id: 'rate-matrix',
    label: 'Active SSL VI Rate Matrix',
    icon: 'table_view',
    accent: 'outline',
    iconTone: 'neutral',
    value: 'SSL VI',
    format: 'text',
    note: '2025 • Tranche 2',
    footer: [{ text: 'Effective Jan 1, 2025' }, { text: 'EO 64 s. 2024' }],
    footerSeparator: true,
  },
]

export const employeePagination: Pagination = { page: 1, pageSize: 6, total: 148 }
