export interface ShellUser {
  name: string
  role: string
}

/** Static session context shown in the app chrome (replace with real session data later). */
export const activeCycle = { label: 'May 2025 • 1st Half' } as const

export const currentUser: ShellUser = {
  name: 'E. Laurel (CPA)',
  role: 'Chief Disbursement Officer',
}

export const serverStatus = {
  node: 'GovNet #04',
  encodingPhase: 'Locked / Review',
} as const
