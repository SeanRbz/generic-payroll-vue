import type { SelectOption } from '@/types/ui'

export const employmentTypeOptions: readonly SelectOption[] = [
  { value: 'all', label: 'Status: Permanent & COS' },
  { value: 'permanent', label: 'Plantilla / Permanent' },
  { value: 'cos', label: 'Contract of Service (COS)' },
  { value: 'casual', label: 'Casual / Co-Terminous' },
]
