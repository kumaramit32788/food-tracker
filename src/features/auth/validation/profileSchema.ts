import { z } from 'zod';
import type { Gender } from '@/types/auth.types.ts';
import { getMinimumCalorieGoal } from '@/utils/calculateCalorieGoal.ts';

const profileFieldsSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be under 50 characters'),
  age: z.number().min(13, 'You must be at least 13 years old').max(100, 'Enter a valid age'),
  gender: z.enum(['male', 'female', 'other']),
  height: z.number().min(100, 'Height must be at least 100 cm').max(250, 'Height must be under 250 cm'),
  weight: z.number().min(30, 'Weight must be at least 30 kg').max(300, 'Weight must be under 300 kg'),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'extra']),
  goalType: z.enum(['lose', 'maintain', 'gain']),
  calorieGoal: z.number().min(1000).max(6000),
  proteinGoal: z.number().min(20, 'Minimum protein goal is 20 g').max(400, 'Maximum protein goal is 400 g'),
  carbsGoal: z.number().min(50, 'Minimum carbs goal is 50 g').max(800, 'Maximum carbs goal is 800 g'),
  fatGoal: z.number().min(20, 'Minimum fat goal is 20 g').max(300, 'Maximum fat goal is 300 g'),
  fiberGoal: z.number().min(15, 'Minimum fiber goal is 15 g').max(80, 'Maximum fiber goal is 80 g'),
});

type ProfileFields = z.infer<typeof profileFieldsSchema>;

function applyCalorieFloor(data: ProfileFields, ctx: z.RefinementCtx) {
  const minCalories = getMinimumCalorieGoal(data.gender as Gender);
  if (data.calorieGoal < minCalories) {
    ctx.addIssue({
      code: 'custom',
      message: `Calorie goal should be at least ${minCalories} kcal for your profile`,
      path: ['calorieGoal'],
    });
  }
}

export const profileUpdateSchema = profileFieldsSchema
  .extend({
    acceptedDisclaimer: z.boolean().optional(),
    acceptedPrivacy: z.boolean().optional(),
  })
  .superRefine(applyCalorieFloor);

export const profileSchema = profileFieldsSchema
  .extend({
    acceptedDisclaimer: z.boolean(),
    acceptedPrivacy: z.boolean(),
  })
  .superRefine(applyCalorieFloor)
  .superRefine((data, ctx) => {
    if (!data.acceptedDisclaimer) {
      ctx.addIssue({
        code: 'custom',
        message: 'You must accept the wellness disclaimer to continue',
        path: ['acceptedDisclaimer'],
      });
    }
    if (!data.acceptedPrivacy) {
      ctx.addIssue({
        code: 'custom',
        message: 'You must accept the privacy notice to continue',
        path: ['acceptedPrivacy'],
      });
    }
  });

export type ProfileFormValues = z.infer<typeof profileSchema>;
export type ProfileUpdateFormValues = z.infer<typeof profileUpdateSchema>;
