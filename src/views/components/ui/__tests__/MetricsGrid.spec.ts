import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import MetricsGrid from '../MetricsGrid.vue'
import type { Metric } from '@/types/ui'

const metrics: Metric[] = [
  {
    id: 'one',
    label: 'TEST One',
    icon: 'badge',
    accent: 'primary',
    iconTone: 'primary',
    value: 1,
    format: 'count',
    footer: [],
  },
  {
    id: 'two',
    label: 'TEST Two',
    icon: 'payments',
    accent: 'secondary',
    iconTone: 'success',
    value: 2,
    format: 'count',
    footer: [],
  },
]

describe('MetricsGrid', () => {
  it('renders a card per metric inside a labelled section', () => {
    const wrapper = mount(MetricsGrid, { props: { metrics, label: 'TEST summary' } })

    expect(wrapper.get('section').attributes('aria-label')).toBe('TEST summary')
    expect(wrapper.findAll('article')).toHaveLength(2)
  })

  it('sits four across on wide screens by default', () => {
    const classes = mount(MetricsGrid, { props: { metrics, label: 'TEST summary' } })
      .get('section')
      .classes()

    expect(classes).toContain('lg:grid-cols-4')
    expect(classes).not.toContain('2xl:grid-cols-5')
  })

  it('sits five across only on the widest screens when asked to, three across before that', () => {
    const classes = mount(MetricsGrid, { props: { metrics, label: 'TEST summary', columns: 5 } })
      .get('section')
      .classes()

    expect(classes).toContain('2xl:grid-cols-5')
    expect(classes).toContain('lg:grid-cols-3')
    expect(classes).not.toContain('lg:grid-cols-4')
  })
})
