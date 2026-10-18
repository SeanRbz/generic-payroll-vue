import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick } from 'vue'

import { formatTime } from '@/utils/format'
import { batchSummary, ledgerPagination } from '@/models/batch-generator/data/batchSummary'
import { employmentTypeOptions } from '@/models/batch-generator/data/filters'
import { ledgerRows } from '@/models/batch-generator/data/ledgerRows'
import { metrics } from '@/models/batch-generator/data/metrics'
import {
  createFakeSession,
  EXPIRES_AT,
  provideSession,
  type FakeSession,
} from '@/models/email-token/__tests__/fakeSession'
import { bureauOptions } from '@/models/shared/organization'
import { useBatchGeneratorViewModel } from '../useBatchGeneratorViewModel'

type ViewModel = ReturnType<typeof useBatchGeneratorViewModel>

const mounted: { unmount: () => void }[] = []

/** Runs the ViewModel inside a host component, the way a page would, with a fake session. */
function setup(session: FakeSession = createFakeSession()) {
  let vm: ViewModel | undefined
  const Host = defineComponent({
    setup() {
      vm = useBatchGeneratorViewModel()
      return () => null
    },
  })
  mounted.push(mount(Host, { global: { provide: provideSession(session) } }))
  if (!vm) throw new Error('the host did not run the ViewModel')
  return vm
}

const SUMMARY_MODULE = '@/models/batch-generator/data/batchSummary'

afterEach(() => {
  mounted.splice(0).forEach((wrapper) => wrapper.unmount())
  vi.doUnmock(SUMMARY_MODULE)
  vi.resetModules()
})

describe('useBatchGeneratorViewModel', () => {
  it('hands the page the batch fixtures as they are', () => {
    const vm = setup()

    expect(vm.batchSummary).toBe(batchSummary)
    expect(vm.metrics).toBe(metrics)
    expect(vm.ledgerRows).toBe(ledgerRows)
    expect(vm.ledgerPagination).toBe(ledgerPagination)
  })

  it('hands the ledger toolbar its filter options', () => {
    const vm = setup()

    expect(vm.bureauOptions).toBe(bureauOptions)
    expect(vm.employmentTypeOptions).toBe(employmentTypeOptions)
  })

  it('counts the readiness filters from the batch summary', () => {
    expect(setup().statusCounts.value).toEqual({
      all: batchSummary.totalRecords,
      ready: batchSummary.readyCount,
      flagged: batchSummary.flaggedCount,
    })
  })

  it('labels the folder tile with the parsed DTR folder', () => {
    expect(setup().folderLabel.value).toBe(
      batchSummary.dtrSource?.folderLabel ?? 'No folder selected',
    )
  })

  it('falls back to "No folder selected" when no DTR source is loaded', async () => {
    vi.resetModules()
    vi.doMock(SUMMARY_MODULE, async (importOriginal) => {
      const actual =
        await importOriginal<typeof import('@/models/batch-generator/data/batchSummary')>()
      return { ...actual, batchSummary: { ...actual.batchSummary, dtrSource: null } }
    })
    // Fresh copies of both, so the session key the fake provides is the one the ViewModel injects.
    const fake = await import('@/models/email-token/__tests__/fakeSession')
    const { useBatchGeneratorViewModel: useFreshViewModel } =
      await import('../useBatchGeneratorViewModel')

    let vm: ViewModel | undefined
    const Host = defineComponent({
      setup() {
        vm = useFreshViewModel()
        return () => null
      },
    })
    mounted.push(
      mount(Host, { global: { provide: fake.provideSession(fake.createFakeSession()) } }),
    )

    expect(vm?.folderLabel.value).toBe('No folder selected')
  })
})

describe('useBatchGeneratorViewModel: email token tile', () => {
  it('asks the user to sign in when Google is configured but nobody is signed in', () => {
    const vm = setup()

    expect(vm.isSignedIn.value).toBe(false)
    expect(vm.tokenStatusLabel.value).toBe('Not signed in')
  })

  it('says not configured when there is no Google client ID', () => {
    expect(setup(createFakeSession({ configured: false })).tokenStatusLabel.value).toBe(
      'Not configured',
    )
  })

  it('shows the token as valid, with its expiry, while signed in, and drops it on sign-out', async () => {
    const session = createFakeSession()
    const vm = setup(session)

    session.status.value = 'signed-in'
    session.expiresAt.value = EXPIRES_AT
    await nextTick()

    expect(vm.isSignedIn.value).toBe(true)
    expect(vm.tokenStatusLabel.value).toBe(`Token Valid • Expires ${formatTime(EXPIRES_AT)}`)

    session.status.value = 'signed-out'
    session.expiresAt.value = null
    await nextTick()

    expect(vm.isSignedIn.value).toBe(false)
    expect(vm.tokenStatusLabel.value).toBe('Not signed in')
  })

  it('never calls Google on its own', () => {
    const session = createFakeSession()
    setup(session)

    expect(session.prepare).not.toHaveBeenCalled()
    expect(session.signIn).not.toHaveBeenCalled()
    expect(session.signOut).not.toHaveBeenCalled()
    expect(session.sendTestEmail).not.toHaveBeenCalled()
  })
})

describe('useBatchGeneratorViewModel: modals', () => {
  it('starts with both modals closed', () => {
    const vm = setup()

    expect(vm.isEmailTokenOpen.value).toBe(false)
    expect(vm.isRecipientsOpen.value).toBe(false)
  })

  it('opens the email token modal on its own', () => {
    const vm = setup()

    vm.openEmailToken()

    expect(vm.isEmailTokenOpen.value).toBe(true)
    expect(vm.isRecipientsOpen.value).toBe(false)
  })

  it('opens the recipient directory on its own', () => {
    const vm = setup()

    vm.openRecipients()

    expect(vm.isRecipientsOpen.value).toBe(true)
    expect(vm.isEmailTokenOpen.value).toBe(false)
  })
})
