import type { UserRole } from '@/types/userAccount.types.ts';

export type Gender = 'male' | 'female' | 'other';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'extra';

export type GoalType = 'lose' | 'maintain' | 'gain';

export interface User {
  id: string;
  name: string;
  email?: string;
  photoURL?: string;
}

export interface UserProfile {
  name: string;
  age: number;
  gender: Gender;
  height: number;
  weight: number;
  activityLevel: ActivityLevel;
  goalType: GoalType;
  calorieGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
  fiberGoal: number;
  /** ISO timestamp when user accepted disclaimer + privacy notice */
  consentAcceptedAt?: string;
}

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSigningOut: boolean;
  isAuthReady: boolean;
  error: string | null;
}
