import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import ChartCard from '../ChartCard.vue'

const slots = {
  default: '<p data-test="plot">plot</p>',
  badge: '<span data-test="badge">badge</span>',
  footer: '<p data-test="footer">footer</p>',
  table: '<table><tbody><tr><td>cell</td></tr></tbody></table>',
}

describe('ChartCard', () => {
  it('is a section labelled by its heading', () => {
    const wrapper = mount(ChartCard, { props: { title: 'TEST Chart' } })
    const heading = wrapper.get('h2')

    expect(heading.text()).toBe('TEST Chart')
    expect(heading.attributes('id')).toBeTruthy()
    expect(wrapper.get('section').attributes('aria-labelledby')).toBe(heading.attributes('id'))
  })

  it('shows the subtitle only when one is given', () => {
    const withSubtitle = mount(ChartCard, { props: { title: 'TEST Chart', subtitle: 'TEST line' } })
    const without = mount(ChartCard, { props: { title: 'TEST Chart' } })

    expect(withSubtitle.text()).toContain('TEST line')
    expect(without.find('header p').exists()).toBe(false)
  })

  it('renders the plot, badge and footer slots', () => {
    const wrapper = mount(ChartCard, { props: { title: 'TEST Chart' }, slots })

    expect(wrapper.get('[data-test="plot"]').text()).toBe('plot')
    expect(wrapper.get('header [data-test="badge"]').text()).toBe('badge')
    expect(wrapper.get('[data-test="footer"]').text()).toBe('footer')
  })

  it('keeps the table view behind a closed "View as table" disclosure', () => {
    const wrapper = mount(ChartCard, { props: { title: 'TEST Chart' }, slots })
    const details = wrapper.get('details')

    expect(details.get('summary').text()).toBe('View as table')
    expect(details.find('table').exists()).toBe(true)
    expect(details.attributes('open')).toBeUndefined()
  })

  it('leaves out the footer and the disclosure when their slots are empty', () => {
    const wrapper = mount(ChartCard, { props: { title: 'TEST Chart' }, slots: { default: 'plot' } })

    expect(wrapper.find('details').exists()).toBe(false)
    expect(wrapper.find('[data-test="footer"]').exists()).toBe(false)
  })
})
