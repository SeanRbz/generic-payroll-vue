import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import PagerNav from '../PagerNav.vue'

function mountPager(page: number, pageCount: number) {
  return mount(PagerNav, { props: { page, pageCount, label: 'Test pager' } })
}

describe('PagerNav', () => {
  it('is a labelled navigation landmark', () => {
    expect(mountPager(1, 19).get('nav').attributes('aria-label')).toBe('Test pager')
  })

  it('marks the current page and collapses the rest', () => {
    const wrapper = mountPager(1, 19)

    expect(wrapper.get('button[aria-current="page"]').text()).toBe('1')
    expect(wrapper.findAll('button[aria-label^="Page "]').map((b) => b.text())).toEqual([
      '1',
      '2',
      '3',
      '19',
    ])
    expect(wrapper.text()).toContain('...')
  })

  it('disables first and previous on the first page only', () => {
    const wrapper = mountPager(1, 19)

    expect(wrapper.get('button[aria-label="First page"]').attributes('disabled')).toBeDefined()
    expect(wrapper.get('button[aria-label="Previous page"]').attributes('disabled')).toBeDefined()
    expect(wrapper.get('button[aria-label="Next page"]').attributes('disabled')).toBeUndefined()
    expect(wrapper.get('button[aria-label="Last page"]').attributes('disabled')).toBeUndefined()
  })

  it('disables next and last on the last page only', () => {
    const wrapper = mountPager(19, 19)

    expect(wrapper.get('button[aria-label="Next page"]').attributes('disabled')).toBeDefined()
    expect(wrapper.get('button[aria-label="Last page"]').attributes('disabled')).toBeDefined()
    expect(wrapper.get('button[aria-label="First page"]').attributes('disabled')).toBeUndefined()
  })
})
