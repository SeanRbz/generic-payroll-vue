import { describe, expect, it } from 'vitest'

import { formatNumber, formatPeso, formatTime, getInitials } from '../format'

describe('formatPeso', () => {
  it('formats amounts with the peso sign, grouping and two decimals', () => {
    expect(formatPeso(69507.56)).toBe('₱69,507.56')
    expect(formatPeso(1248310.2)).toBe('₱1,248,310.20')
    expect(formatPeso(0)).toBe('₱0.00')
  })
})

describe('formatNumber', () => {
  it('groups thousands and honours the requested fraction digits', () => {
    expect(formatNumber(148)).toBe('148')
    expect(formatNumber(12480.5, 1)).toBe('12,480.5')
    expect(formatNumber(88, 1)).toBe('88.0')
  })
})

describe('formatTime', () => {
  it('formats an epoch timestamp as a short wall-clock time', () => {
    expect(formatTime(Date.UTC(2025, 4, 15, 8, 30))).toMatch(/^\d{1,2}:\d{2}\s?[ap]m$/i)
  })
})

describe('getInitials', () => {
  it('uses the first and last word of a name', () => {
    expect(getInitials('Maria Clara Aquino')).toBe('MA')
    expect(getInitials('Juan Dela Cruz')).toBe('JC')
  })

  it('handles a single word, extra spaces and lower case', () => {
    expect(getInitials('madonna')).toBe('M')
    expect(getInitials('  test   user  ')).toBe('TU')
  })

  it('falls back to a placeholder for an empty name', () => {
    expect(getInitials('')).toBe('?')
    expect(getInitials('   ')).toBe('?')
  })
})
