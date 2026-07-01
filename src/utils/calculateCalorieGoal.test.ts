import { describe, expect, it } from 'vitest';
import {
  calculateBmr,
  calculateCalorieGoal,
  calculateFiberGoal,
  calculateMacroGoals,
  calculateTdee,
  getMinimumCalorieGoal,
} from './calculateCalorieGoal.ts';

describe('getMinimumCalorieGoal', () => {
  it('uses sex-aware calorie floors', () => {
    expect(getMinimumCalorieGoal('male')).toBe(1500);
    expect(getMinimumCalorieGoal('female')).toBe(1200);
    expect(getMinimumCalorieGoal('other')).toBe(1200);
  });
});

describe('calculateBmr', () => {
  it('uses male formula for male', () => {
    expect(calculateBmr(70, 170, 30, 'male')).toBe(1617.5);
  });

  it('uses female formula for female', () => {
    expect(calculateBmr(60, 165, 28, 'female')).toBe(1330.25);
  });

  it('averages male and female BMR for other', () => {
    const male = calculateBmr(70, 170, 30, 'male');
    const female = calculateBmr(70, 170, 30, 'female');
    expect(calculateBmr(70, 170, 30, 'other')).toBeCloseTo((male + female) / 2, 5);
  });
});

describe('calculateCalorieGoal', () => {
  it('never drops below minimum for aggressive weight loss', () => {
    const goal = calculateCalorieGoal(45, 155, 22, 'female', 'sedentary', 'lose');
    expect(goal).toBeGreaterThanOrEqual(1200);
  });

  it('caps deficit for male maintain vs lose', () => {
    const maintain = calculateCalorieGoal(80, 180, 35, 'male', 'moderate', 'maintain');
    const lose = calculateCalorieGoal(80, 180, 35, 'male', 'moderate', 'lose');
    expect(lose).toBeLessThan(maintain);
    expect(lose).toBeGreaterThanOrEqual(1500);
  });
});

describe('calculateMacroGoals', () => {
  it('splits macros from calorie goal', () => {
    const macros = calculateMacroGoals(2000);
    expect(macros.proteinGoal).toBe(150);
    expect(macros.carbsGoal).toBe(225);
    expect(macros.fatGoal).toBe(56);
  });
});

describe('calculateFiberGoal', () => {
  it('scales with calories with a 20g floor', () => {
    expect(calculateFiberGoal(2000)).toBe(28);
    expect(calculateFiberGoal(1200)).toBe(20);
  });
});

describe('calculateTdee', () => {
  it('applies activity multiplier', () => {
    const bmr = calculateBmr(70, 170, 30, 'male');
    expect(calculateTdee(70, 170, 30, 'male', 'sedentary')).toBeCloseTo(bmr * 1.2, 5);
  });
});
