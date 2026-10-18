import type { SelectOption } from '@/types/ui'

/** Bureaus and services shared by the ledger and directory filters. Each screen adds its own "All" option. */
export const bureauOptions: readonly SelectOption[] = [
  { value: 'fmb', label: 'Forest Management Bureau (FMB)' },
  { value: 'bmb', label: 'Biodiversity Management Bureau (BMB)' },
  { value: 'emb', label: 'Environmental Management Bureau (EMB)' },
  { value: 'lmb', label: 'Land Management Bureau (LMB)' },
  { value: 'co', label: 'Central Office - Admin & Finance' },
  { value: 'r7', label: 'Regional Office VII' },
]
