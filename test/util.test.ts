import { describe, expect, test } from 'bun:test'
import { clamp } from '../src/util'

describe('utils', () => {
  describe('clamp', () => {
    test("doesn't alter integers within the given range", () => {
      expect(clamp(5, { min: 0, max: 10 })).toBe(5)
      expect(clamp(-8, { min: -100, max: 100 })).toBe(-8)
    })

    test('keeps values at the range boundaries', () => {
      expect(clamp(0, { min: 0, max: 10 })).toBe(0)
      expect(clamp(10, { min: 0, max: 10 })).toBe(10)
      expect(clamp(-100, { min: -100, max: 100 })).toBe(-100)
      expect(clamp(100, { min: -100, max: 100 })).toBe(100)
    })

    test('raises values below the minimum', () => {
      expect(clamp(-1, { min: 0, max: 10 })).toBe(0)
      expect(clamp(-101, { min: -100, max: 100 })).toBe(-100)
    })

    test('lowers values above the maximum', () => {
      expect(clamp(11, { min: 0, max: 10 })).toBe(10)
      expect(clamp(101, { min: -100, max: 100 })).toBe(100)
    })

    test('floors floats by default', () => {
      expect(clamp(1.5, { min: 0, max: 2 })).toBe(1)
      expect(clamp(1.999, { min: 0, max: 2 })).toBe(1)
      expect(clamp(-0.3, { min: -2, max: 2 })).toBe(-1)
      expect(clamp(-1.1, { min: -2, max: 2 })).toBe(-2)
    })

    test('floors before applying bounds', () => {
      expect(clamp(10.5, { min: 0, max: 10 })).toBe(10)
      expect(clamp(-10.5, { min: -10, max: 10 })).toBe(-10)
      expect(clamp(1.2, { min: 1.5 })).toBe(1.5)
    })

    test('preserves floats when allowed', () => {
      expect(clamp(1.5, { min: 0, max: 2 }, true)).toBe(1.5)
      expect(clamp(2.5, { min: 0, max: 2 }, true)).toBe(2)
      expect(clamp(-0.5, { min: 0, max: 2 }, true)).toBe(0)
    })

    test('supports one-sided bounds', () => {
      expect(clamp(-1, { min: 0 })).toBe(0)
      expect(clamp(11, { min: 0 })).toBe(11)
      expect(clamp(-1, { max: 10 })).toBe(-1)
      expect(clamp(11, { max: 10 })).toBe(10)
    })

    test('clamps infinite values to the range boundaries', () => {
      expect(clamp(Infinity, { min: 0, max: 10 })).toBe(10)
      expect(clamp(-Infinity, { min: 0, max: 10 })).toBe(0)
    })
  })
})
