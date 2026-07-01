import type { ActivityLevel, Gender, GoalType } from '@/types/auth.types.ts';

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  extra: 1.9,
};

const GOAL_ADJUSTMENTS: Record<GoalType, number> = {
  lose: -500,
  maintain: 0,
  gain: 300,
};

/** Minimum safe daily calories by sex (general wellness guidance). */
export function getMinimumCalorieGoal(gender: Gender): number {
  if (gender === 'male') {
    return 1500;
  }
  return 1200;
}

/**
 * Mifflin-St Jeor BMR.
 * For `other`, uses the average of male and female estimates.
 */
export function calculateBmr(weight: number, height: number, age: number, gender: Gender): number {
  const maleBmr = 10 * weight + 6.25 * height - 5 * age + 5;
  const femaleBmr = 10 * weight + 6.25 * height - 5 * age - 161;

  if (gender === 'male') {
    return maleBmr;
  }

  if (gender === 'female') {
    return femaleBmr;
  }

  return (maleBmr + femaleBmr) / 2;
}

export function calculateTdee(
  weight: number,
  height: number,
  age: number,
  gender: Gender,
  activityLevel: ActivityLevel,
): number {
  return calculateBmr(weight, height, age, gender) * ACTIVITY_MULTIPLIERS[activityLevel];
}

/**
 * Mifflin-St Jeor with activity multiplier, capped deficit/surplus, and sex-aware floor.
 */
export function calculateCalorieGoal(
  weight: number,
  height: number,
  age: number,
  gender: Gender,
  activityLevel: ActivityLevel,
  goalType: GoalType,
): number {
  const tdee = calculateTdee(weight, height, age, gender, activityLevel);
  const minCalories = getMinimumCalorieGoal(gender);

  let adjusted = tdee + GOAL_ADJUSTMENTS[goalType];

  if (goalType === 'lose') {
    const maxDeficit = Math.min(500, tdee * 0.2);
    adjusted = tdee - maxDeficit;
  }

  if (goalType === 'gain') {
    const maxSurplus = Math.min(400, tdee * 0.15);
    adjusted = tdee + maxSurplus;
  }

  return Math.max(minCalories, Math.round(adjusted));
}

export function calculateMacroGoals(calorieGoal: number) {
  const proteinGoal = Math.round((calorieGoal * 0.3) / 4);
  const carbsGoal = Math.round((calorieGoal * 0.45) / 4);
  const fatGoal = Math.round((calorieGoal * 0.25) / 9);

  return { proteinGoal, carbsGoal, fatGoal };
}

/** ~14 g fiber per 1000 kcal (general dietary guidance). */
export function calculateFiberGoal(calorieGoal: number): number {
  return Math.max(20, Math.round((calorieGoal / 1000) * 14));
}
