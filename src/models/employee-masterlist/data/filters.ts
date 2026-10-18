import type { SelectOption } from '@/types/ui'

export const classificationOptions: readonly SelectOption[] = [
  { value: 'all', label: 'All Classifications' },
  { value: 'plantilla', label: 'Plantilla / Regular' },
  { value: 'cos', label: 'COS / Job Order' },
  { value: 'casual', label: 'Casual / Co-Terminous' },
]

export const statutoryStatusOptions: readonly SelectOption[] = [
  { value: 'all', label: 'All Statutory Status' },
  { value: 'locked', label: 'IDs Locked' },
  { value: 'pending', label: 'Pending Verification' },
]
