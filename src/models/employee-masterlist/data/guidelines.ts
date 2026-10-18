import type { Guideline } from '@/models/employee-masterlist/types'

export const guidelines: readonly Guideline[] = [
  {
    id: 'gsis',
    icon: 'shield',
    tone: 'primary',
    title: 'GSIS R.A. 8291 Guidelines',
    body: 'Mandatory 9% employee share and 12% government share, computed on the monthly basic salary of regular plantilla positions.',
  },
  {
    id: 'hdmf',
    icon: 'home_work',
    tone: 'success',
    title: 'HDMF Circular No. 460',
    body: 'Monthly fund salary ceiling of ₱10,000.00, with ₱200.00 each from employee and employer. Voluntary MP2 savings are enrolled separately.',
  },
  {
    id: 'philhealth',
    icon: 'health_and_safety',
    tone: 'neutral',
    title: 'PhilHealth UHC Law (R.A. 11223)',
    body: '5.0% premium shared equally by employee and employer, on a monthly basic salary floor of ₱10,000.00 and a ceiling of ₱100,000.00.',
  },
]
