import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Controller, useForm, useWatch, type Resolver } from 'react-hook-form';
import { MedicalDisclaimer, PrivacyNotice } from '@/components/legal';
import { UserAvatar } from '@/components/common/UserAvatar';
import { ACTIVITY_LEVELS, GENDERS, GOAL_TYPES } from '@/constants/auth.ts';
import { useAuth } from '@/features/auth/hooks/useAuth.ts';
import {
  profileSchema,
  profileUpdateSchema,
  type ProfileFormInput,
  type ProfileFormValues,
} from '@/features/auth/validation/profileSchema.ts';
import { bindNumberField } from '@/utils/bindNumberField.ts';
import type { ActivityLevel, Gender, GoalType, UserProfile } from '@/types/auth.types.ts';
import {
  calculateCalorieGoal,
  calculateFiberGoal,
  calculateMacroGoals,
} from '@/utils/calculateCalorieGoal.ts';
import { calculateBmi, getBmiCategory } from '@/utils/bodyMetrics.ts';

interface ProfileFormProps {
  /** `page` = full setup/update screen; `embedded` = inside Settings */
  variant?: 'page' | 'embedded';
}

const EMPTY_PROFILE_FORM: ProfileFormInput = {
  name: '',
  age: '',
  gender: '',
  height: '',
  weight: '',
  activityLevel: '',
  goalType: '',
  calorieGoal: '',
  proteinGoal: '',
  carbsGoal: '',
  fatGoal: '',
  fiberGoal: '',
  acceptedDisclaimer: false,
  acceptedPrivacy: false,
};

function buildDefaultValues(
  profile: UserProfile | null | undefined,
  isFirstSetup: boolean,
): ProfileFormInput {
  if (isFirstSetup || !profile) {
    return EMPTY_PROFILE_FORM;
  }

  const hasConsent = Boolean(profile.consentAcceptedAt);

  return {
    name: profile.name,
    age: profile.age,
    gender: profile.gender,
    height: profile.height,
    weight: profile.weight,
    activityLevel: profile.activityLevel,
    goalType: profile.goalType,
    calorieGoal: profile.calorieGoal,
    proteinGoal: profile.proteinGoal,
    carbsGoal: profile.carbsGoal,
    fatGoal: profile.fatGoal,
    fiberGoal: profile.fiberGoal,
    acceptedDisclaimer: hasConsent,
    acceptedPrivacy: hasConsent,
  };
}

export function ProfileForm({ variant = 'page' }: ProfileFormProps) {
  const { user, profile, saveProfile, isLoading, error, dismissError } = useAuth();

  const isFirstSetup = !profile;
  const isEmbedded = variant === 'embedded';

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormInput, unknown, ProfileFormValues>({
    resolver: zodResolver(
      isFirstSetup ? profileSchema : profileUpdateSchema,
    ) as unknown as Resolver<ProfileFormInput, unknown, ProfileFormValues>,
    defaultValues: buildDefaultValues(profile, isFirstSetup),
  });

  useEffect(() => {
    reset(buildDefaultValues(profile, isFirstSetup));
  }, [
    profile?.name,
    profile?.age,
    profile?.gender,
    profile?.height,
    profile?.weight,
    profile?.activityLevel,
    profile?.goalType,
    profile?.calorieGoal,
    profile?.proteinGoal,
    profile?.carbsGoal,
    profile?.fatGoal,
    profile?.fiberGoal,
    profile?.consentAcceptedAt,
    isFirstSetup,
    reset,
    profile,
  ]);

  const [saveSuccess, setSaveSuccess] = useState(false);

  const watchedFields = useWatch({
    control,
    name: ['age', 'gender', 'height', 'weight', 'activityLevel', 'goalType'],
  });

  const [age, gender, height, weight, activityLevel, goalType] = watchedFields;

  useEffect(() => {
    if (
      age === '' ||
      height === '' ||
      weight === '' ||
      gender === '' ||
      activityLevel === '' ||
      goalType === ''
    ) {
      return;
    }

    const calorieGoal = calculateCalorieGoal(
      Number(weight),
      Number(height),
      Number(age),
      gender as Gender,
      activityLevel as ActivityLevel,
      goalType as GoalType,
    );
    const macros = calculateMacroGoals(calorieGoal);
    const fiberGoal = calculateFiberGoal(calorieGoal);

    setValue('calorieGoal', calorieGoal, { shouldValidate: true });
    setValue('proteinGoal', macros.proteinGoal, { shouldValidate: true });
    setValue('carbsGoal', macros.carbsGoal, { shouldValidate: true });
    setValue('fatGoal', macros.fatGoal, { shouldValidate: true });
    setValue('fiberGoal', fiberGoal, { shouldValidate: true });
  }, [age, gender, height, weight, activityLevel, goalType, setValue]);

  const bmi =
    weight !== '' && height !== '' ? calculateBmi(Number(weight), Number(height)) : 0;

  const onSubmit = async (values: ProfileFormValues) => {
    dismissError();
    const profileData: UserProfile = {
      name: values.name,
      age: values.age,
      gender: values.gender as Gender,
      height: values.height,
      weight: values.weight,
      activityLevel: values.activityLevel as ActivityLevel,
      goalType: values.goalType as GoalType,
      calorieGoal: values.calorieGoal,
      proteinGoal: values.proteinGoal,
      carbsGoal: values.carbsGoal,
      fatGoal: values.fatGoal,
      fiberGoal: values.fiberGoal,
      consentAcceptedAt:
        'acceptedDisclaimer' in values &&
        values.acceptedDisclaimer &&
        values.acceptedPrivacy
          ? (profile?.consentAcceptedAt ?? new Date().toISOString())
          : profile?.consentAcceptedAt,
    };

    const saved = await saveProfile(profileData, { redirect: !isEmbedded });
    if (saved && isEmbedded) {
      setSaveSuccess(true);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={3}>
        {!isEmbedded && (
          <Box>
            <Typography variant="h5" gutterBottom>
              {isFirstSetup ? 'Complete your profile' : 'Update your profile'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
            {isFirstSetup
              ? 'Tell us about yourself to calculate your daily nutrition targets.'
              : 'Update your details and daily nutrition targets'}
            </Typography>
          </Box>
        )}

        {saveSuccess && (
          <Alert severity="success" onClose={() => setSaveSuccess(false)}>
            Profile saved successfully.
          </Alert>
        )}

        {error && (
          <Alert severity="error" onClose={dismissError}>
            {error}
          </Alert>
        )}

        {isFirstSetup && (
          <Stack spacing={2}>
            <MedicalDisclaimer />
            <PrivacyNotice />
            <Controller
              name="acceptedDisclaimer"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox checked={field.value} onChange={field.onChange} />}
                  label="I understand NutriTrack is for personal wellness only and not medical advice"
                />
              )}
            />
            <Controller
              name="acceptedPrivacy"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox checked={field.value} onChange={field.onChange} />}
                  label="I agree to the data processing described in the privacy notice"
                />
              )}
            />
            {(errors.acceptedDisclaimer || errors.acceptedPrivacy) && (
              <Typography variant="caption" color="error">
                {errors.acceptedDisclaimer?.message ?? errors.acceptedPrivacy?.message}
              </Typography>
            )}
          </Stack>
        )}

        {user && (
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <UserAvatar
              name={user.name}
              photoURL={user.photoURL}
              sx={{ width: 56, height: 56, fontSize: '1.1rem' }}
            />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {user.name}
              </Typography>
              {user.email && (
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
              )}
            </Box>
          </Stack>
        )}

        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Full Name"
                  error={Boolean(errors.name)}
                  helperText={errors.name?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="age"
              control={control}
              render={({ field }) => (
                <TextField
                  {...bindNumberField(field)}
                  label="Age"
                  type="number"
                  error={Boolean(errors.age)}
                  helperText={errors.age?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Gender"
                  value={field.value ?? ''}
                  error={Boolean(errors.gender)}
                  helperText={errors.gender?.message}
                  slotProps={{ select: { displayEmpty: true } }}
                >
                  <MenuItem value="" disabled>
                    Select gender
                  </MenuItem>
                  {GENDERS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>

          {gender === 'other' && (
            <Grid size={{ xs: 12 }}>
              <Alert severity="info">
                Calorie estimates for &quot;Other&quot; use the average of male and female BMR
                formulas. For more accuracy, consult a registered dietitian.
              </Alert>
            </Grid>
          )}

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="height"
              control={control}
              render={({ field }) => (
                <TextField
                  {...bindNumberField(field)}
                  label="Height (cm)"
                  type="number"
                  error={Boolean(errors.height)}
                  helperText={errors.height?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="weight"
              control={control}
              render={({ field }) => (
                <TextField
                  {...bindNumberField(field)}
                  label="Weight (kg)"
                  type="number"
                  error={Boolean(errors.weight)}
                  helperText={errors.weight?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Controller
              name="activityLevel"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Activity Level"
                  value={field.value ?? ''}
                  error={Boolean(errors.activityLevel)}
                  helperText={errors.activityLevel?.message}
                  slotProps={{ select: { displayEmpty: true } }}
                >
                  <MenuItem value="" disabled>
                    Select activity level
                  </MenuItem>
                  {ACTIVITY_LEVELS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Controller
              name="goalType"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Goal"
                  value={field.value ?? ''}
                  error={Boolean(errors.goalType)}
                  helperText={errors.goalType?.message}
                  slotProps={{ select: { displayEmpty: true } }}
                >
                  <MenuItem value="" disabled>
                    Select goal
                  </MenuItem>
                  {GOAL_TYPES.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>

          {bmi > 0 && (
            <Grid size={{ xs: 12 }}>
              <Alert severity="info">
                Estimated BMI: {bmi} ({getBmiCategory(bmi)}) — informational only, not a medical
                diagnosis.
              </Alert>
            </Grid>
          )}
        </Grid>

        <Divider />

        <Typography variant="subtitle1">Daily Targets (auto-calculated)</Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Controller
              name="calorieGoal"
              control={control}
              render={({ field }) => (
                <TextField
                  {...bindNumberField(field)}
                  label="Calories (kcal)"
                  type="number"
                  error={Boolean(errors.calorieGoal)}
                  helperText={errors.calorieGoal?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Controller
              name="proteinGoal"
              control={control}
              render={({ field }) => (
                <TextField
                  {...bindNumberField(field)}
                  label="Protein (g)"
                  type="number"
                  error={Boolean(errors.proteinGoal)}
                  helperText={errors.proteinGoal?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Controller
              name="carbsGoal"
              control={control}
              render={({ field }) => (
                <TextField
                  {...bindNumberField(field)}
                  label="Carbs (g)"
                  type="number"
                  error={Boolean(errors.carbsGoal)}
                  helperText={errors.carbsGoal?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Controller
              name="fatGoal"
              control={control}
              render={({ field }) => (
                <TextField
                  {...bindNumberField(field)}
                  label="Fat (g)"
                  type="number"
                  error={Boolean(errors.fatGoal)}
                  helperText={errors.fatGoal?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Controller
              name="fiberGoal"
              control={control}
              render={({ field }) => (
                <TextField
                  {...bindNumberField(field)}
                  label="Fiber (g)"
                  type="number"
                  error={Boolean(errors.fiberGoal)}
                  helperText={errors.fiberGoal?.message}
                />
              )}
            />
          </Grid>
        </Grid>

        <Button type="submit" variant="contained" size="large" disabled={isLoading}>
          {isLoading
            ? isFirstSetup
              ? 'Saving profile...'
              : 'Saving profile...'
            : isFirstSetup
              ? 'Save & Continue'
              : isEmbedded
                ? 'Save changes'
                : 'Save & Continue'}
        </Button>
      </Stack>
    </Box>
  );
}
