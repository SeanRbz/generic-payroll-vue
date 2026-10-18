import { describe, expect, it } from 'vitest'

import {
  DEFAULT_ROUTE_PATH,
  defaultNavItem,
  navRoutes,
  sidebarGroups,
  topNavItems,
} from '../navigation'

describe('navigation config', () => {
  it('lands on the cycle overview, which is a navigation path', () => {
    expect(DEFAULT_ROUTE_PATH).toBe('/cycle-overview')
    expect(navRoutes.map((item) => item.to)).toContain(DEFAULT_ROUTE_PATH)
    expect(defaultNavItem).toMatchObject({ to: DEFAULT_ROUTE_PATH, label: 'Cycle Overview' })
  })

  it('lists each path once even when a tab and a sidebar item share it', () => {
    const paths = navRoutes.map((item) => item.to)
    expect(new Set(paths).size).toBe(paths.length)
    expect(paths.filter((path) => path === '/batch-generator')).toHaveLength(1)
  })

  it('keeps the top tabs and the Disbursement Tools items in the agreed order', () => {
    expect(topNavItems.map((item) => item.label)).toEqual([
      'Cycle Overview',
      'Batch Generator',
      'Audit Trail & Logs',
    ])
    const tools = sidebarGroups.find((group) => group.id === 'disbursement-tools')
    expect(tools?.items.map((item) => item.label)).toEqual([
      'Payroll Calculation',
      'Employee Masterlist',
      'BIR Withholding Tax',
    ])
  })

  it('folds GSIS, Pag-IBIG and PhilHealth into the Employee Masterlist instead of a nav entry', () => {
    const labels = navRoutes.map((item) => item.label)
    expect(labels.some((label) => /GSIS|Pag-IBIG|PhilHealth/i.test(label))).toBe(false)
    expect(navRoutes.some((item) => item.to === '/statutory-deductions')).toBe(false)
  })
})
