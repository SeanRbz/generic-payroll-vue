import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import { formatNumber, formatPeso, formatTime } from '@/utils/format'
import { batchSummary } from '@/models/batch-generator/data/batchSummary'
import { ledgerRows } from '@/models/batch-generator/data/ledgerRows'
import { metrics } from '@/models/batch-generator/data/metrics'
import {
  createFakeSession,
  EXPIRES_AT,
  provideSession,
  type FakeSession,
} from '@/models/email-token/__tests__/fakeSession'
import { recipientSummary } from '@/models/recipients/data/recipientStats'
import BatchGeneratorView from '../BatchGeneratorView.vue'

const mounted: { unmount: () => void }[] = []

function mountView(session: FakeSession = createFakeSession()) {
  const wrapper = mount(BatchGeneratorView, {
    attachTo: document.body,
    global: { stubs: { teleport: true }, provide: provideSession(session) },
  })
  mounted.push(wrapper)
  return wrapper
}

function findButton(wrapper: ReturnType<typeof mountView>, text: string) {
  const button = wrapper.findAll('button').find((candidate) => candidate.text().includes(text))
  if (!button) throw new Error(`no button containing "${text}"`)
  return button
}

function dialogTitle(wrapper: ReturnType<typeof mountView>) {
  const dialog = wrapper.find('[role="dialog"]')
  if (!dialog.exists()) return undefined
  return document.getElementById(dialog.attributes('aria-labelledby') ?? '')?.textContent?.trim()
}

afterEach(() => {
  mounted.splice(0).forEach((wrapper) => wrapper.unmount())
  document.body.innerHTML = ''
  document.body.style.overflow = ''
})

describe('BatchGeneratorView', () => {
  it('renders the sample batch: ledger rows, DTR source, summary figures and a ready dispatch bar', () => {
    const wrapper = mountView()
    const net = metrics.find((metric) => metric.id === 'net-disbursement')
    if (!net) throw new Error('no net-disbursement metric')

    expect(wrapper.findAll('tbody tr')).toHaveLength(ledgerRows.length)
    expect(wrapper.text()).not.toContain('No payroll records loaded')
    expect(wrapper.text()).not.toContain('No source loaded')
    expect(wrapper.text()).toContain(
      `${formatNumber(batchSummary.dtrSource?.rawFilesParsed ?? 0)} Raw Files Parsed`,
    )
    expect(wrapper.get('section[aria-label="Batch summary"]').text()).toContain(
      formatPeso(Number(net.value)),
    )
    expect(wrapper.text()).toContain(`${formatNumber(batchSummary.selectedCount)} Records Selected`)
    expect(wrapper.text()).toContain('Batch Verified')
    expect(findButton(wrapper, 'Start Dispatch').attributes('disabled')).toBeUndefined()
  })

  it('keeps both modals closed until requested', () => {
    expect(mountView().find('[role="dialog"]').exists()).toBe(false)
  })

  it('opens and cancels the email token modal from the toolbar', async () => {
    const wrapper = mountView()

    await findButton(wrapper, 'Email Token').trigger('click')
    expect(dialogTitle(wrapper)).toBe('Email Token Configuration')
    expect(wrapper.get('[role="dialog"]').text()).toContain('Token Status: Not configured')

    await findButton(wrapper, 'Cancel').trigger('click')
    await nextTick()
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
  })

  it('opens and closes the recipient directory modal with the sample roster', async () => {
    const wrapper = mountView()

    await findButton(wrapper, 'Staff Configured').trigger('click')
    expect(dialogTitle(wrapper)).toBe('Recipient Directory & Staff List')
    expect(wrapper.get('[role="dialog"]').text()).not.toContain('No recipients loaded')
    expect(wrapper.get('[role="dialog"]').text()).toContain(
      `${recipientSummary.total} Recipients Loaded`,
    )

    await wrapper.get('button[aria-label="Close dialog"]').trigger('click')
    await nextTick()
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
  })
})

describe('BatchGeneratorView: email token tile follows the Gmail session', () => {
  it('asks the user to sign in when Google is configured but nobody is signed in', () => {
    expect(findButton(mountView(), 'Email Token').text()).toContain('Not signed in')
  })

  it('says not configured when there is no Google client ID', () => {
    const wrapper = mountView(createFakeSession({ configured: false }))
    expect(findButton(wrapper, 'Email Token').text()).toContain('Not configured')
  })

  it('shows the token as valid, with its expiry, once signed in', async () => {
    const session = createFakeSession()
    const wrapper = mountView(session)

    session.status.value = 'signed-in'
    session.expiresAt.value = EXPIRES_AT
    await nextTick()

    expect(findButton(wrapper, 'Email Token').text()).toContain(
      `Token Valid • Expires ${formatTime(EXPIRES_AT)}`,
    )
  })
})
