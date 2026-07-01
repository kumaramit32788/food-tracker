export const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary (little or no exercise)' },
  { value: 'light', label: 'Lightly active (1–3 days/week)' },
  { value: 'moderate', label: 'Moderately active (3–5 days/week)' },
  { value: 'active', label: 'Very active (6–7 days/week)' },
  { value: 'extra', label: 'Extra active (physical job + exercise)' },
] as const;

export const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
] as const;

export const GOAL_TYPES = [
  { value: 'lose', label: 'Lose weight' },
  { value: 'maintain', label: 'Maintain weight' },
  { value: 'gain', label: 'Gain weight' },
] as const;
