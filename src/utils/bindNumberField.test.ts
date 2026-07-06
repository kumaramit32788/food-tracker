import { describe, expect, it } from 'vitest';
import {
  coerceNumberValue,
  isPositiveNumber,
  parseNumberInputValue,
  toNumberInputValue,
} from './bindNumberField.ts';

describe('parseNumberInputValue', () => {
  it('returns empty string for cleared input', () => {
    expect(parseNumberInputValue('')).toBe('');
  });

  it('parses valid numbers', () => {
    expect(parseNumberInputValue('250')).toBe(250);
    expect(parseNumberInputValue('1.5')).toBe(1.5);
  });

  it('returns empty string for invalid numbers', () => {
    expect(parseNumberInputValue('abc')).toBe('');
  });
});

describe('toNumberInputValue', () => {
  it('shows blank field for empty form values', () => {
    expect(toNumberInputValue('')).toBe('');
    expect(toNumberInputValue(undefined)).toBe('');
  });

  it('preserves numeric values including zero', () => {
    expect(toNumberInputValue(0)).toBe(0);
    expect(toNumberInputValue(100)).toBe(100);
  });
});

describe('coerceNumberValue', () => {
  it('uses fallback when input is empty', () => {
    expect(coerceNumberValue('')).toBe(0);
    expect(coerceNumberValue('', 1)).toBe(1);
  });
});

describe('isPositiveNumber', () => {
  it('accepts only positive numbers', () => {
    expect(isPositiveNumber(2)).toBe(true);
    expect(isPositiveNumber(0)).toBe(false);
    expect(isPositiveNumber('')).toBe(false);
  });
});
