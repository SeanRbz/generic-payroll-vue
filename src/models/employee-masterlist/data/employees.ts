import type { EmployeeRecord } from '@/models/employee-masterlist/types'

const plantilla = { label: 'Plantilla', tone: 'success' } as const

export const employees: readonly EmployeeRecord[] = [
  {
    id: 'DTR-2021-0842',
    initials: 'JD',
    avatarTone: 'primary-container',
    name: 'Juan Dela Cruz',
    classification: plantilla,
    position: 'Supervising Forest Management Specialist',
    office: 'Forest Management Bureau',
    grade: 'SG-24 / Step 2',
    gsis: {
      number: '2004918239',
      details: ['Active (9% EE • 12% Gov)', 'Policy: Regular Member'],
    },
    pagibig: {
      number: '1318-4829-1928',
      details: ['Mandatory: ₱200.00/Mo', 'MP2 Savings: ₱2,000.00'],
    },
    philhealth: {
      number: '19-029481920-1',
      details: ['Tier 1 • Formal Economy', 'Status: Premium Current'],
    },
    compensation: { amount: 90640, basis: 'monthly', pera: 2000 },
  },
  {
    id: 'DTR-2018-0112',
    initials: 'MA',
    avatarTone: 'secondary',
    name: 'Maria Clara Aquino',
    classification: plantilla,
    position: 'Senior Ecosystems Management Specialist',
    office: 'Biodiversity Management Bureau',
    grade: 'SG-18 / Step 1',
    gsis: {
      number: '1998471104',
      details: ['Active (9% EE • 12% Gov)', 'Policy: Regular Member'],
    },
    pagibig: {
      number: '1948-2948-5819',
      details: ['Mandatory: ₱200.00/Mo', 'MP2 Savings: Inactive'],
    },
    philhealth: {
      number: '02-394829185-5',
      details: ['Tier 1 • Formal Economy', 'Status: Premium Current'],
    },
    compensation: { amount: 47190, basis: 'monthly', pera: 2000 },
  },
  {
    id: 'DTR-2022-1409',
    initials: 'RM',
    avatarTone: 'soft',
    name: 'Rodrigo Mendoza',
    classification: plantilla,
    position: 'Cartographer II',
    office: 'Land Management Bureau',
    grade: 'SG-15 / Step 1',
    gsis: {
      number: '2020119832',
      details: ['Active (9% EE • 12% Gov)', 'Policy: Regular Member'],
    },
    pagibig: {
      number: '1194-8281-4482',
      details: ['Mandatory: ₱200.00/Mo', 'MP2 Savings: Inactive'],
    },
    philhealth: {
      number: '14-084928194-4',
      details: ['Tier 1 • Formal Economy', 'Status: Premium Current'],
    },
    compensation: { amount: 36620, basis: 'monthly', pera: 2000 },
  },
  {
    id: 'DTR-2016-0043',
    initials: 'GB',
    avatarTone: 'primary',
    name: 'Atty. Gabriel Bautista',
    classification: plantilla,
    position: 'Attorney IV • Legal Division',
    office: 'Legal Affairs Service',
    grade: 'SG-23 / Step 1',
    gsis: {
      number: '2016330198',
      details: ['Active (9% EE • 12% Gov)', 'Policy: Regular Member'],
    },
    pagibig: {
      number: '1385-9918-1128',
      details: ['Mandatory: ₱200.00/Mo', 'MP2 Savings: ₱5,000.00'],
    },
    philhealth: {
      number: '21-049287498-8',
      details: ['Tier 1 • Formal Economy', 'Status: Premium Current'],
    },
    compensation: { amount: 88020, basis: 'monthly', pera: 2000 },
  },
  {
    id: 'DTR-COS-2023-019',
    initials: 'CT',
    avatarTone: 'muted',
    name: 'Catherine Tan',
    classification: { label: 'COS / Job Order', tone: 'primary' },
    position: 'Forest Protection Officer (Patrol Lead)',
    office: 'Regional Office VII • Operations',
    grade: 'COS Daily Tier 2',
    gsis: {
      number: 'Exempt (COS)',
      details: ["No Gov't GSIS Premium Match", 'SSS Self-Employed Active'],
      muted: true,
    },
    pagibig: {
      number: '1382-8841-9921',
      details: ['Mandatory: ₱100.00/Mo', 'Voluntary Contribution'],
    },
    philhealth: {
      number: '08-273948153-3',
      details: ['Individual Payer', 'Status: Verified Direct'],
    },
    compensation: { amount: 1125, basis: 'daily', pera: null },
  },
  {
    id: 'DTR-2015-0988',
    initials: 'ES',
    avatarTone: 'soft',
    name: 'Eduardo Santos',
    classification: plantilla,
    position: 'Administrative Officer V (Budget Officer)',
    office: 'Financial Management Service',
    grade: 'SG-18 / Step 1',
    gsis: {
      number: '1997321008',
      details: ['Active (9% EE • 12% Gov)', 'Policy: Regular Member'],
    },
    pagibig: {
      number: '1082-3391-4481',
      details: ['Mandatory: ₱200.00/Mo', 'MP2 Savings: ₱1,000.00'],
    },
    philhealth: {
      number: '12-594829183-4',
      details: ['Tier 1 • Formal Economy', 'Status: Premium Current'],
    },
    compensation: { amount: 47190, basis: 'monthly', pera: 2000 },
  },
]
