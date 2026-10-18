import { mount, RouterLinkStub } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { cycleHeader, cycleMetrics } from '@/models/cycle-overview/data/cycleOverview'
import CycleOverviewView from '../CycleOverviewView.vue'

function mountView() {
  return mount(CycleOverviewView, { global: { stubs: { RouterLink: RouterLinkStub } } })
}

describe('CycleOverviewView', () => {
  it('shows the cycle title and a link on to the batch generator', () => {
    const wrapper = mountView()

    expect(wrapper.get('h1').text()).toBe(cycleHeader.title)
    expect(wrapper.getComponent(RouterLinkStub).props('to')).toBe('/batch-generator')
  })

  it('shows the five summary cards', () => {
    const section = mountView().get('section[aria-label="Cycle summary"]')

    expect(section.findAll('article')).toHaveLength(cycleMetrics.length)
    for (const metric of cycleMetrics) {
      expect(section.text()).toContain(metric.label)
    }
  })

  it('draws one chart each for persons, lost hours and the payable mix', () => {
    const headings = mountView()
      .findAll('h2')
      .map((heading) => heading.text())

    expect(headings).toEqual(['Personnel by Bureau', 'Lost Hours Trend', 'Disbursement Mix'])
  })
})
