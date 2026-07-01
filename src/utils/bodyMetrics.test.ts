import { describe, expect, it } from 'vitest';
import { calculateBmi, getBmiCategory } from './bodyMetrics.ts';

describe('calculateBmi', () => {
  it('computes BMI from weight and height', () => {
    expect(calculateBmi(70, 170)).toBe(24.2);
  });

  it('returns 0 for invalid input', () => {
    expect(calculateBmi(0, 170)).toBe(0);
  });
});

describe('getBmiCategory', () => {
  it('maps BMI ranges to categories', () => {
    expect(getBmiCategory(17)).toBe('Underweight');
    expect(getBmiCategory(22)).toBe('Normal');
    expect(getBmiCategory(27)).toBe('Overweight');
    expect(getBmiCategory(32)).toBe('Obese');
  });
});
