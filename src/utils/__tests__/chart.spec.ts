import { describe, expect, it } from 'vitest'

import { percentOf, percentReduction } from '../chart'

describe('percentOf', () => {
  it('returns the value as a share of the maximum', () => {
    expect(percentOf(25, 100)).toBe(25)
    expect(percentOf(42, 42)).toBe(100)
  })

  it('clamps to the 0-100 range', () => {
    expect(percentOf(150, 100)).toBe(100)
    expect(percentOf(-5, 100)).toBe(0)
  })

  it('is 0 when there is no scale or the value is not a number', () => {
    expect(percentOf(10, 0)).toBe(0)
    expect(percentOf(10, -1)).toBe(0)
    expect(percentOf(Number.NaN, 100)).toBe(0)
    expect(percentOf(10, Number.NaN)).toBe(0)
  })
})

describe('percentReduction', () => {
  it('is the drop from the previous value as a share of it', () => {
    expect(percentReduction(200, 150)).toBe(25)
  })

  it('is negative when the value grew', () => {
    expect(percentReduction(100, 125)).toBe(-25)
  })

  it('is 0 without a usable previous value', () => {
    expect(percentReduction(0, 10)).toBe(0)
    expect(percentReduction(Number.NaN, 10)).toBe(0)
    expect(percentReduction(10, Number.NaN)).toBe(0)
  })
})
