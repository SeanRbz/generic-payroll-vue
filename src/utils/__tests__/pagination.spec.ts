import { describe, expect, it } from 'vitest'

import { buildPageList, getPageCount, getPageRange } from '../pagination'

describe('getPageCount', () => {
  it('rounds up and never returns less than one page', () => {
    expect(getPageCount(148, 8)).toBe(19)
    expect(getPageCount(16, 8)).toBe(2)
    expect(getPageCount(0, 8)).toBe(1)
  })
})

describe('getPageRange', () => {
  it('returns the 1-based inclusive record range for a page', () => {
    expect(getPageRange(1, 8, 148)).toEqual({ start: 1, end: 8 })
    expect(getPageRange(19, 8, 148)).toEqual({ start: 145, end: 148 })
  })
})

describe('buildPageList', () => {
  it('lists every page when there are only a few', () => {
    expect(buildPageList(1, 3)).toEqual([1, 2, 3])
  })

  it('collapses the tail near the first pages', () => {
    expect(buildPageList(1, 19)).toEqual([1, 2, 3, 'ellipsis', 19])
  })

  it('collapses both sides in the middle', () => {
    expect(buildPageList(10, 19)).toEqual([1, 'ellipsis', 9, 10, 11, 'ellipsis', 19])
  })

  it('collapses the head near the last pages', () => {
    expect(buildPageList(19, 19)).toEqual([1, 'ellipsis', 17, 18, 19])
  })
})
