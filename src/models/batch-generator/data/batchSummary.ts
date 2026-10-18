import type { Pagination } from '@/utils/pagination'
import type { BatchSummary } from '@/models/batch-generator/types'

export const batchSummary: BatchSummary = {
  cycleTag: 'CY 2025 Regular Disbursement',
  totalRecords: 148,
  selectedCount: 148,
  readyCount: 142,
  flaggedCount: 6,
  dtrSource: {
    path: 'D:\\Payroll\\2025_05_Period1\\DTR_Batch\\Biometric_TimeCard_Export_May01-15.csv',
    folderLabel: 'D:\\Payroll\\2025_05_Period1\\..',
    rawFilesParsed: 148,
    checksum: 'SHA-256 Validated (e74f..a89)',
  },
}

export const ledgerPagination: Pagination = { page: 1, pageSize: 8, total: 148 }
