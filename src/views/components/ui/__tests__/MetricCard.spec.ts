import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import MetricCard from '../MetricCard.vue'
import type { Metric } from '@/types/ui'

const base = {
  id: 'test',
  label: 'Test metric',
  icon: 'badge',
  accent: 'primary',
  iconTone: 'primary',
  footer: [],
} as const

function valueOf(metric: Metric) {
  return mount(MetricCard, { props: { metric } }).get('p span').text()
}

describe('MetricCard', () => {
  it('formats each numeric format', () => {
    expect(valueOf({ ...base, format: 'count', value: 148 })).toBe('148')
    expect(valueOf({ ...base, format: 'hours', value: 12480.5 })).toBe('12,480.5')
    expect(valueOf({ ...base, format: 'peso', value: 4120850 })).toBe('₱4,120,850.00')
    expect(valueOf({ ...base, format: 'percent', value: 98.6 })).toBe('98.6%')
  })

  it('renders text values as given', () => {
    expect(valueOf({ ...base, format: 'text', value: 'SSL VI' })).toBe('SSL VI')
  })

  it('shows the unit and note beside the value', () => {
    const wrapper = mount(MetricCard, {
      props: {
        metric: { ...base, format: 'count', value: 148, unit: 'hrs', note: '100% matched' },
      },
    })
    expect(wrapper.text()).toContain('hrs')
    expect(wrapper.text()).toContain('100% matched')
  })

  it('puts a separator between footer items only when asked to', () => {
    const footer = [{ text: 'Regular: 112' }, { text: 'COS: 36' }]
    const plain = mount(MetricCard, {
      props: { metric: { ...base, format: 'count', value: 1, footer } },
    })
    const separated = mount(MetricCard, {
      props: { metric: { ...base, format: 'count', value: 1, footer, footerSeparator: true } },
    })

    expect(plain.text()).not.toContain('•')
    expect(separated.text()).toContain('•')
  })

  it('renders a footer icon only when one is provided', () => {
    const wrapper = mount(MetricCard, {
      props: {
        metric: {
          ...base,
          format: 'count',
          value: 1,
          footer: [{ text: 'Locked', icon: 'lock' }, { text: 'Plain' }],
        },
      },
    })
    const icons = wrapper.findAll('.material-symbols-outlined').map((icon) => icon.text())

    expect(icons).toContain('lock')
    expect(wrapper.text()).toContain('Plain')
  })
})
