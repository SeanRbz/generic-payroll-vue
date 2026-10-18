import { afterEach, describe, expect, it, vi } from 'vitest'

import { recipientStats, recipientSummary } from '@/models/recipients/data/recipientStats'
import { recipients } from '@/models/recipients/data/recipients'
import { bureauOptions } from '@/models/shared/organization'
import type { Recipient, RecipientSummary } from '@/models/recipients/types'
import { useRecipientDirectoryViewModel } from '../useRecipientDirectoryViewModel'

const STATS_MODULE = '@/models/recipients/data/recipientStats'
const ROSTER_MODULE = '@/models/recipients/data/recipients'

const testRecipient: Recipient = {
  id: 'TEST-EMP-001',
  name: 'Test Alpha',
  initials: 'TA',
  avatarTone: 'primary',
  email: 'test.alpha@example.gov.ph',
  verification: { label: 'Verified', tone: 'success' },
  bureau: 'Test Bureau',
  pinSecurity: 'TIN Active',
  routing: 'GovNet Primary',
  status: 'Active',
}

const testSummary: RecipientSummary = {
  total: 3,
  govnetVerified: 2,
  externalBackup: 1,
  securityMethod: 'TEST method',
  syncSource: 'TEST source',
  syncedAt: 'TEST time',
}

/** Loads the ViewModel against stand-in fixtures, to cover both the loaded and empty captions. */
async function loadWith(summary: RecipientSummary, roster: readonly Recipient[]) {
  vi.resetModules()
  vi.doMock(STATS_MODULE, () => ({ recipientSummary: summary, recipientStats: [] }))
  vi.doMock(ROSTER_MODULE, () => ({ recipients: roster }))
  const viewModel = await import('../useRecipientDirectoryViewModel')
  return viewModel.useRecipientDirectoryViewModel()
}

afterEach(() => {
  vi.doUnmock(STATS_MODULE)
  vi.doUnmock(ROSTER_MODULE)
  vi.resetModules()
})

describe('useRecipientDirectoryViewModel', () => {
  it('exposes the roster, its stats and summary, and the bureau filter options', () => {
    const vm = useRecipientDirectoryViewModel()

    expect(vm.recipients).toBe(recipients)
    expect(vm.stats).toBe(recipientStats)
    expect(vm.summary).toBe(recipientSummary)
    expect(vm.bureauOptions).toBe(bureauOptions)
  })

  it('counts the loaded and shown recipients in the badge and footer', () => {
    const vm = useRecipientDirectoryViewModel()

    expect(vm.badgeText.value).toMatch(new RegExp(`^${recipientSummary.total} Recipients Loaded`))
    expect(vm.footerText.value).toMatch(
      new RegExp(`^Showing ${recipients.length} of ${recipientSummary.total} recipients • `),
    )
  })

  it('marks a loaded, synchronized directory as verified', async () => {
    const vm = await loadWith(testSummary, [testRecipient])

    expect(vm.badgeTone.value).toBe('success')
    expect(vm.badgeText.value).toBe(`${testSummary.total} Recipients Loaded • Batch Verified`)
    expect(vm.footerText.value).toBe(
      `Showing 1 of ${testSummary.total} recipients • Last synchronized from TEST source TEST time`,
    )
  })

  it('reads as empty and unsynchronized when nothing is loaded', async () => {
    const vm = await loadWith({ ...testSummary, total: 0, syncedAt: null }, [])

    expect(vm.badgeTone.value).toBe('neutral')
    expect(vm.badgeText.value).toBe('0 Recipients Loaded')
    expect(vm.footerText.value).toBe('Showing 0 of 0 recipients • Not yet synchronized')
  })
})
