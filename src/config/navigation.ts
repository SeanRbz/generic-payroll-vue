export interface NavItem {
  id: string
  label: string
  icon: string
  to: string
  children?: readonly NavItem[]
}

export interface NavGroup {
  id: string
  heading: string
  items: readonly NavItem[]
}

/** The landing page: `/` and unknown paths redirect here. */
export const DEFAULT_ROUTE_PATH = '/cycle-overview'

export const topNavItems: readonly NavItem[] = [
  { id: 'cycle-overview', label: 'Cycle Overview', icon: 'dashboard', to: '/cycle-overview' },
  { id: 'batch-generator', label: 'Batch Generator', icon: 'calculate', to: '/batch-generator' },
  {
    id: 'audit-trail-and-logs',
    label: 'Audit Trail & Logs',
    icon: 'history',
    to: '/audit-trail-and-logs',
  },
]

export const sidebarGroups: readonly NavGroup[] = [
  {
    id: 'disbursement-tools',
    heading: 'Disbursement Tools',
    items: [
      {
        id: 'payroll-calculation',
        label: 'Payroll Calculation',
        icon: 'calculate',
        to: '/batch-generator',
      },
      {
        id: 'employee-records',
        label: 'Employee Masterlist',
        icon: 'badge',
        to: '/employee-records',
      },
      {
        id: 'tax-withholding-tables',
        label: 'BIR Withholding Tax',
        icon: 'receipt_long',
        to: '/tax-withholding-tables',
      },
    ],
  },
  {
    id: 'compliance-reports',
    heading: 'Compliance & Reports',
    items: [
      {
        id: 'general-ledger-export',
        label: 'General Ledger Export',
        icon: 'table_chart',
        to: '/general-ledger-export',
      },
    ],
  },
]

function flatten(items: readonly NavItem[]): NavItem[] {
  return items.flatMap((item) => [item, ...flatten(item.children ?? [])])
}

/** Every navigable path exactly once (the first label wins), used to build the routes. */
export const navRoutes: readonly NavItem[] = (() => {
  const byPath = new Map<string, NavItem>()
  const all = [...flatten(topNavItems), ...sidebarGroups.flatMap((group) => flatten(group.items))]
  for (const item of all) {
    if (!byPath.has(item.to)) byPath.set(item.to, item)
  }
  return [...byPath.values()]
})()

/** The landing page's nav entry. Fails fast: a non-nav default would make the catch-all redirect loop. */
export const defaultNavItem: NavItem = (() => {
  const item = navRoutes.find((entry) => entry.to === DEFAULT_ROUTE_PATH)
  if (!item) throw new Error(`DEFAULT_ROUTE_PATH "${DEFAULT_ROUTE_PATH}" is not a navigation path`)
  return item
})()
