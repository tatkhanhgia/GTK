import { describe, it, expect } from 'vitest'
import { cn, formatPrice, slugify, readingTimeLabel, formatDate } from '@/lib/utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('a', 'b')).toBe('a b')
  })

  it('handles conditional classes', () => {
    expect(cn('a', false && 'b', 'c')).toBe('a c')
  })

  it('deduplicates conflicting tailwind classes', () => {
    // tailwind-merge keeps last conflicting class
    const result = cn('p-2', 'p-4')
    expect(result).toBe('p-4')
  })
})

describe('formatPrice', () => {
  it('formats USD price from cents', () => {
    const result = formatPrice(999, 'USD', 'en')
    expect(result).toContain('9.99')
  })

  it('formats VND price whole number', () => {
    const result = formatPrice(250000, 'VND', 'vi')
    expect(result).toContain('250')
  })

  it('formats VND with currency symbol', () => {
    const result = formatPrice(100000, 'VND', 'vi')
    // VND result should contain the currency symbol ₫
    expect(result).toContain('₫')
  })
})

describe('readingTimeLabel', () => {
  it('returns Vietnamese label', () => {
    expect(readingTimeLabel(5, 'vi')).toBe('5 phút đọc')
  })

  it('returns English label', () => {
    expect(readingTimeLabel(3, 'en')).toBe('3 min read')
  })

  it('defaults to Vietnamese', () => {
    expect(readingTimeLabel(2)).toBe('2 phút đọc')
  })
})

describe('formatDate', () => {
  it('returns formatted date containing year in Vietnamese', () => {
    const result = formatDate('2025-01-15', 'vi')
    expect(result).toContain('2025')
  })

  it('returns formatted date containing year in English', () => {
    const result = formatDate('2025-01-15', 'en')
    expect(result).toContain('2025')
  })

  it('accepts a Date object', () => {
    const result = formatDate(new Date('2024-06-01'), 'en')
    expect(result).toContain('2024')
  })
})

describe('slugify', () => {
  it('converts spaces to hyphens', () => {
    expect(slugify('hello world')).toBe('hello-world')
  })

  it('handles uppercase', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })

  it('removes special characters', () => {
    expect(slugify('hello! world?')).toBe('hello-world')
  })

  it('collapses multiple hyphens', () => {
    expect(slugify('hello   world')).toBe('hello-world')
  })

  it('strips accents', () => {
    // Vietnamese-style diacritics are stripped via NFD normalisation
    expect(slugify('café')).toBe('cafe')
  })
})
