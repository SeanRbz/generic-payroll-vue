import { mount, RouterLinkStub } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import type { CycleHeader } from '@/models/cycle-overview/types'
import CycleOverviewHeader from '../CycleOverviewHeader.vue'

const header: CycleHeader = {
  breadcrumb: ['TEST Area', 'TEST Section', 'TEST Page'],
  title: 'TEST Cycle',
  coverage: 'TEST coverage line',
  statusLabel: 'TEST status',
  statusTone: 'neutral',
}

function mountHeader() {
  return mount(CycleOverviewHeader, {
    props: { header },
    global: { stubs: { RouterLink: RouterLinkStub } },
  })
}

describe('CycleOverviewHeader', () => {
  it('shows the title, coverage line and status', () => {
    const wrapper = mountHeader()

    expect(wrapper.get('h1').text()).toBe('TEST Cycle')
    expect(wrapper.text()).toContain('TEST coverage line')
    expect(wrapper.text()).toContain('TEST status')
  })

  it('marks only the last breadcrumb as the current page', () => {
    const nav = mountHeader().get('nav[aria-label="Breadcrumb"]')

    expect(nav.text()).toContain('TEST Area')
    expect(nav.findAll('[aria-current="page"]')).toHaveLength(1)
    expect(nav.get('[aria-current="page"]').text()).toBe('TEST Page')
  })

  it('links to the batch generator', () => {
    const link = mountHeader().getComponent(RouterLinkStub)

    expect(link.props('to')).toBe('/batch-generator')
    expect(link.text()).toContain('Batch Generator')
  })

  it('keeps the action buttons as plain, inert buttons', () => {
    const buttons = mountHeader().findAll('button')

    expect(buttons).toHaveLength(3)
    expect(buttons[0]?.text()).toContain('Re-run Biometric DTR')
    expect(buttons[1]?.text()).toContain('DTR Form 48 Audit')
    expect(buttons[2]?.text()).toContain('Export Summary PDF')
    expect(buttons.every((button) => button.attributes('type') === 'button')).toBe(true)
  })
})
