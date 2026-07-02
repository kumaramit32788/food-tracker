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
import { useEffect } from 'react';
import { Controller, useForm, useWatch, type Resolver } from 'react-hook-form';
import { MedicalDisclaimer, PrivacyNotice } from '@/components/legal';
import { ACTIVITY_LEVELS, GENDERS, GOAL_TYPES } from '@/constants/auth.ts';
import { useAuth } from '@/features/auth/hooks/useAuth.ts';
import {
  profileSchema,
  profileUpdateSchema,
  type ProfileFormInput,
  type ProfileFormValues,
} from '@/features/auth/validation/profileSchema.ts';
import { bindNumberField } from '@/utils/bindNumberField.ts';
import type { UserProfile } from '@/types/auth.types.ts';
import {
  calculateCalorieGoal,
  calculateFiberGoal,
  calculateMacroGoals,
} from '@/utils/calculateCalorieGoal.ts';
import { calculateBmi, getBmiCategory } from '@/utils/bodyMetrics.ts';

export function ProfileForm() {
  const {
    user,
    profile,
    hasDeviceAccount,
    createAccount,
    saveProfile,
    isLoading,
    error,
    dismissError,
  } = useAuth();

  const isDeviceSetup = !hasDeviceAccount;
  const hasConsent = Boolean(profile?.consentAcceptedAt);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormInput, unknown, ProfileFormValues>({
    resolver: zodResolver(
      isDeviceSetup ? profileSchema : profileUpdateSchema,
    ) as unknown as Resolver<ProfileFormInput, unknown, ProfileFormValues>,
    defaultValues: {
      name: profile?.name ?? user?.name ?? '',
      age: profile?.age ?? 25,
      gender: profile?.gender ?? 'male',
      height: profile?.height ?? 170,
      weight: profile?.weight ?? 70,
      activityLevel: profile?.activityLevel ?? 'moderate',
      goalType: profile?.goalType ?? 'maintain',
      calorieGoal: profile?.calorieGoal ?? 2000,
      proteinGoal: profile?.proteinGoal ?? 150,
      carbsGoal: profile?.carbsGoal ?? 225,
      fatGoal: profile?.fatGoal ?? 55,
      fiberGoal: profile?.fiberGoal ?? 25,
      acceptedDisclaimer: hasConsent,
      acceptedPrivacy: hasConsent,
    },
  });

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
      !gender ||
      !activityLevel ||
      !goalType
    ) {
      return;
    }

    const calorieGoal = calculateCalorieGoal(
      Number(weight),
      Number(height),
      Number(age),
      gender,
      activityLevel,
      goalType,
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
      gender: values.gender,
      height: values.height,
      weight: values.weight,
      activityLevel: values.activityLevel,
      goalType: values.goalType,
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

    if (isDeviceSetup) {
      await createAccount(profileData);
      return;
    }

    await saveProfile(profileData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h5" gutterBottom>
            {isDeviceSetup ? 'Set up this device' : 'Update your profile'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isDeviceSetup
              ? 'Create your profile to get started. Only one account per device.'
              : 'Update your details and daily nutrition targets'}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" onClose={dismissError}>
            {error}
          </Alert>
        )}

        {isDeviceSetup && (
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
                  label="I agree to the local data processing described in the privacy notice"
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
                  error={Boolean(errors.gender)}
                  helperText={errors.gender?.message}
                >
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
                  error={Boolean(errors.activityLevel)}
                  helperText={errors.activityLevel?.message}
                >
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
                  error={Boolean(errors.goalType)}
                  helperText={errors.goalType?.message}
                >
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
            ? isDeviceSetup
              ? 'Setting up device...'
              : 'Saving profile...'
            : isDeviceSetup
              ? 'Set Up Device'
              : 'Save & Continue'}
        </Button>
      </Stack>
    </Box>
  );
}
