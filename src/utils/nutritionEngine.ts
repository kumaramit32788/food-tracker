import { MEAL_TYPE_LABELS, MEAL_TYPES } from '@/constants/mealTypes.ts';
import { MASTER_UNIT_CONVERSIONS } from '@/constants/units.ts';
import type { DiaryEntry } from '@/types/diary.types.ts';
import type { Food } from '@/types/food.types.ts';
import type { NutritionPer100g } from '@/types/nutrition.types.ts';
import type {
  DailyIntakeInput,
  DailyIntakeResult,
  FoodCalculationInput,
  FoodCalculationResult,
  MacroNutrients,
  MacroProgress,
  MealCalculationInput,
  MealCalculationResult,
} from '@/types/nutritionEngine.types.ts';
import type { BaseUnit, QuantityInput, UnitType } from '@/types/unit.types.ts';
import { calculateNutrition } from '@/utils/calculateNutrition.ts';
import { convertToBaseUnit } from '@/utils/convertUnit.ts';

const DEFAULT_FIBER_GOAL = 25;

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function toMacros(nutrition: NutritionPer100g): MacroNutrients {
  return {
    calories: round1(nutrition.calories),
    protein: round1(nutrition.protein),
    carbs: round1(nutrition.carbs),
    fat: round1(nutrition.fat),
    fiber: round1(nutrition.fiber),
  };
}

const EMPTY_MACROS: MacroNutrients = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: 0,
};

function sumMacros(items: MacroNutrients[]): MacroNutrients {
  const raw = items.reduce(
    (total, item) => ({
      calories: total.calories + item.calories,
      protein: total.protein + item.protein,
      carbs: total.carbs + item.carbs,
      fat: total.fat + item.fat,
      fiber: total.fiber + item.fiber,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  );

  return {
    calories: round1(raw.calories),
    protein: round1(raw.protein),
    carbs: round1(raw.carbs),
    fat: round1(raw.fat),
    fiber: round1(raw.fiber),
  };
}

function resolveBaseQuantity(input: FoodCalculationInput): {
  quantityInBase: number;
  baseUnit: BaseUnit;
} {
  const baseUnit = input.baseUnit ?? 'g';
  const foodLike = {
    baseUnit,
    availableUnits: input.availableUnits ?? [],
  };
  const quantityInBase = convertToBaseUnit(foodLike, input.quantity);
  return { quantityInBase, baseUnit };
}

/**
 * Formats a quantity for display, e.g. "250g", "2 egg", "1 katori".
 */
export function formatQuantityLabel(quantity: QuantityInput, _baseUnit: BaseUnit = 'g'): string {
  const { amount, unit } = quantity;

  if (unit === 'g' || unit === 'ml') {
    return `${amount}${unit}`;
  }

  if (unit === 'kg' || unit === 'L') {
    return `${amount}${unit}`;
  }

  const unitLabel = MASTER_UNIT_CONVERSIONS[unit]?.label?.toLowerCase() ?? unit;
  const plural =
    amount === 1
      ? unitLabel
      : unit === 'egg'
        ? 'eggs'
        : unit === 'banana'
          ? 'bananas'
          : unit === 'apple'
            ? 'apples'
            : `${unitLabel}s`;

  return `${amount} ${plural}`;
}

function buildPieceConversionNote(quantity: QuantityInput, quantityInBase: number, baseUnit: BaseUnit): string {
  const pieceUnits: UnitType[] = ['egg', 'banana', 'apple', 'piece', 'roti', 'chapati', 'slice'];
  if (!pieceUnits.includes(quantity.unit)) {
    return '';
  }

  const gramsPerUnit = MASTER_UNIT_CONVERSIONS[quantity.unit]?.toBase ?? 1;
  return `Piece conversion: ${quantity.amount} × ${gramsPerUnit}${baseUnit} = ${round1(quantityInBase)}${baseUnit}\n`;
}

function buildFoodExplanation(
  input: FoodCalculationInput,
  quantityInBase: number,
  baseUnit: BaseUnit,
  multiplier: number,
  result: MacroNutrients,
): string {
  const { nutritionPer100g } = input;
  const quantityLabel = formatQuantityLabel(input.quantity, baseUnit);
  const pieceNote = buildPieceConversionNote(input.quantity, quantityInBase, baseUnit);

  return [
    input.name,
    `Quantity: ${quantityLabel}`,
    pieceNote ? pieceNote.trimEnd() : null,
    '',
    `Per 100${baseUnit}`,
    `Calories: ${nutritionPer100g.calories}`,
    `Protein: ${nutritionPer100g.protein}`,
    `Carbs: ${nutritionPer100g.carbs}`,
    `Fat: ${nutritionPer100g.fat}`,
    `Fiber: ${nutritionPer100g.fiber}`,
    '',
    `Multiplier = ${round1(quantityInBase)} / 100 = ${round1(multiplier)}`,
    '',
    `Calories = ${nutritionPer100g.calories} × ${round1(multiplier)} = ${result.calories} kcal`,
    `Protein = ${nutritionPer100g.protein} × ${round1(multiplier)} = ${result.protein} g`,
    `Carbs = ${nutritionPer100g.carbs} × ${round1(multiplier)} = ${result.carbs} g`,
    `Fat = ${nutritionPer100g.fat} × ${round1(multiplier)} = ${result.fat} g`,
    `Fiber = ${nutritionPer100g.fiber} × ${round1(multiplier)} = ${result.fiber} g`,
  ]
    .filter((line) => line !== null)
    .join('\n');
}

/**
 * Calculates nutrition for a single food using per-100g values and household units.
 * Piece-based units (egg, banana, apple, etc.) are converted to edible weight first.
 */
export function calculateFoodNutritionDetailed(
  input: FoodCalculationInput,
): FoodCalculationResult {
  const { quantityInBase, baseUnit } = resolveBaseQuantity(input);
  const multiplier = quantityInBase / 100;
  const nutrition = calculateNutrition(input.nutritionPer100g, quantityInBase);
  const macros = toMacros(nutrition);

  return {
    food: input.name,
    quantity: formatQuantityLabel(input.quantity, baseUnit),
    quantityInBase: round1(quantityInBase),
    baseUnit,
    multiplier: round1(multiplier),
    ...macros,
    explanation: buildFoodExplanation(input, quantityInBase, baseUnit, multiplier, macros),
  };
}

export function foodToCalculationInput(food: Food, quantity: QuantityInput): FoodCalculationInput {
  return {
    name: food.name,
    nutritionPer100g: food.nutritionPer100g,
    quantity,
    baseUnit: food.baseUnit,
    availableUnits: food.availableUnits,
  };
}

export function calculateFoodNutritionFromFood(food: Food, quantity: QuantityInput): FoodCalculationResult {
  return calculateFoodNutritionDetailed(foodToCalculationInput(food, quantity));
}

/**
 * Calculates total nutrition for a meal by summing each food individually.
 */
export function calculateMealNutrition(input: MealCalculationInput): MealCalculationResult {
  const foods = input.foods.map((food) => calculateFoodNutritionDetailed(food));
  const totals = sumMacros(foods);
  const label = MEAL_TYPE_LABELS[input.mealType];

  const explanation = [
    `${label} total`,
    ...foods.map((food) => `- ${food.food} (${food.quantity}): ${food.calories} kcal`),
    '',
    `Calories: ${totals.calories} kcal`,
    `Protein: ${totals.protein} g`,
    `Carbs: ${totals.carbs} g`,
    `Fat: ${totals.fat} g`,
    `Fiber: ${totals.fiber} g`,
  ].join('\n');

  return {
    mealType: input.mealType,
    label,
    foods,
    ...totals,
    explanation,
  };
}

function emptyMealTotals(): DailyIntakeResult['meals'] {
  return MEAL_TYPES.reduce(
    (totals, mealType) => {
      totals[mealType] = { ...EMPTY_MACROS };
      return totals;
    },
    {} as DailyIntakeResult['meals'],
  );
}

function calcProgress(consumed: number, goal: number): number {
  if (goal <= 0) {
    return 0;
  }
  return round1((consumed / goal) * 100);
}

function buildDailyWarnings(
  dailyTotal: MacroNutrients,
  goals: DailyIntakeInput['goals'],
  options: { isPartialDay?: boolean } = {},
): string[] {
  const warnings: string[] = [];
  const fiberGoal = goals.fiber ?? DEFAULT_FIBER_GOAL;
  const hour = new Date().getHours();
  const isPartialDay = options.isPartialDay ?? hour < 20;
  const intakePrefix = isPartialDay ? 'So far today — ' : '';

  if (dailyTotal.calories > goals.calories) {
    warnings.push(
      `${intakePrefix}calories exceed goal by ${round1(dailyTotal.calories - goals.calories)} kcal (${dailyTotal.calories} / ${goals.calories} kcal).`,
    );
  }

  if (!isPartialDay && dailyTotal.protein < goals.protein) {
    warnings.push(
      `Protein is below target (${dailyTotal.protein} g / ${goals.protein} g goal).`,
    );
  } else if (isPartialDay && dailyTotal.protein < goals.protein * 0.5 && hour >= 14) {
    warnings.push(
      `${intakePrefix}protein is tracking low (${dailyTotal.protein} g / ${goals.protein} g goal).`,
    );
  }

  if (!isPartialDay && dailyTotal.fiber < fiberGoal) {
    warnings.push(`Fiber is below target (${dailyTotal.fiber} g / ${fiberGoal} g goal).`);
  } else if (isPartialDay && dailyTotal.fiber < fiberGoal * 0.4 && hour >= 16) {
    warnings.push(
      `${intakePrefix}fiber is tracking low (${dailyTotal.fiber} g / ${fiberGoal} g goal).`,
    );
  }

  return warnings;
}

function buildDailyExplanation(
  meals: DailyIntakeResult['meals'],
  dailyTotal: MacroNutrients,
  remainingCalories: number,
  progress: MacroProgress,
  warnings: string[],
): string {
  const formatMeal = (label: string, totals: MacroNutrients) =>
    `${label}: ${totals.calories} kcal | P ${totals.protein}g | C ${totals.carbs}g | F ${totals.fat}g | Fiber ${totals.fiber}g`;

  return [
    "Today's nutritional intake",
    '',
    ...MEAL_TYPES.map((mealType) =>
      formatMeal(MEAL_TYPE_LABELS[mealType], meals[mealType]),
    ),
    '',
    'Daily total',
    `Calories: ${dailyTotal.calories} kcal`,
    `Protein: ${dailyTotal.protein} g`,
    `Carbs: ${dailyTotal.carbs} g`,
    `Fat: ${dailyTotal.fat} g`,
    `Fiber: ${dailyTotal.fiber} g`,
    '',
    `Remaining calories: ${remainingCalories} kcal`,
    `Protein progress: ${progress.protein}%`,
    `Carb progress: ${progress.carbs}%`,
    `Fat progress: ${progress.fat}%`,
    `Fiber progress: ${progress.fiber}%`,
    '',
    warnings.length > 0 ? `Warnings:\n${warnings.map((w) => `- ${w}`).join('\n')}` : 'No warnings.',
  ].join('\n');
}

/**
 * Calculates today's full nutritional intake from meals consumed.
 */
export function calculateDailyIntake(input: DailyIntakeInput): DailyIntakeResult {
  const mealTotals = emptyMealTotals();
  const mealResults: MealCalculationResult[] = [];

  input.meals.forEach((meal) => {
    const result = calculateMealNutrition(meal);
    mealResults.push(result);
    mealTotals[meal.mealType] = {
      calories: result.calories,
      protein: result.protein,
      carbs: result.carbs,
      fat: result.fat,
      fiber: result.fiber,
    };
  });

  const dailyTotal = sumMacros(Object.values(mealTotals));
  const fiberGoal = input.goals.fiber ?? DEFAULT_FIBER_GOAL;
  const remainingCalories = round1(input.goals.calories - dailyTotal.calories);

  const progress: MacroProgress = {
    protein: calcProgress(dailyTotal.protein, input.goals.protein),
    carbs: calcProgress(dailyTotal.carbs, input.goals.carbs),
    fat: calcProgress(dailyTotal.fat, input.goals.fat),
    fiber: calcProgress(dailyTotal.fiber, fiberGoal),
  };

  const warnings = buildDailyWarnings(dailyTotal, input.goals, { isPartialDay: false });

  return {
    meals: mealTotals,
    dailyTotal,
    remainingCalories,
    progress,
    warnings,
    explanation: buildDailyExplanation(
      mealTotals,
      dailyTotal,
      remainingCalories,
      progress,
      warnings,
    ),
  };
}

/**
 * Builds daily intake from logged diary entries using stored nutrition snapshots.
 */
export function sumDiaryEntryMacros(entries: DiaryEntry[]): MacroNutrients {
  return sumMacros(
    entries.map((entry) => ({
      calories: round1(entry.nutrition.calories),
      protein: round1(entry.nutrition.protein),
      carbs: round1(entry.nutrition.carbs),
      fat: round1(entry.nutrition.fat),
      fiber: round1(entry.nutrition.fiber),
    })),
  );
}

export interface PeriodIntakeSummary {
  total: MacroNutrients;
  avgDaily: MacroNutrients;
  daysLogged: number;
}

export interface DailyMacroTotal {
  date: string;
  total: MacroNutrients;
}

/** Groups diary entries by date and sums macros for each day. */
export function calculateDailyTotalsByDate(
  entries: DiaryEntry[],
  dateKeys: string[],
): DailyMacroTotal[] {
  const byDate = new Map<string, DiaryEntry[]>();

  entries.forEach((entry) => {
    const list = byDate.get(entry.date) ?? [];
    list.push(entry);
    byDate.set(entry.date, list);
  });

  return dateKeys.map((date) => ({
    date,
    total: sumDiaryEntryMacros(byDate.get(date) ?? []),
  }));
}

export interface MacroCalorieSlice {
  name: string;
  value: number;
  grams: number;
}

/** Calorie contribution from each macro (4/4/9 kcal per gram). */
export function macroCalorieBreakdown(macros: MacroNutrients): MacroCalorieSlice[] {
  return [
    { name: 'Protein', value: round1(macros.protein * 4), grams: macros.protein },
    { name: 'Carbs', value: round1(macros.carbs * 4), grams: macros.carbs },
    { name: 'Fat', value: round1(macros.fat * 9), grams: macros.fat },
  ].filter((slice) => slice.value > 0);
}

/** Aggregates diary entries over a date range (week, month, etc.). */
export function calculatePeriodIntakeFromDiaryEntries(entries: DiaryEntry[]): PeriodIntakeSummary {
  const total = sumDiaryEntryMacros(entries);
  const daysLogged = new Set(entries.map((entry) => entry.date)).size;
  const divisor = Math.max(1, daysLogged);

  return {
    total,
    daysLogged,
    avgDaily: {
      calories: round1(total.calories / divisor),
      protein: round1(total.protein / divisor),
      carbs: round1(total.carbs / divisor),
      fat: round1(total.fat / divisor),
      fiber: round1(total.fiber / divisor),
    },
  };
}

export function calculateDailyIntakeFromDiaryEntries(
  goals: DailyIntakeInput['goals'],
  entries: DiaryEntry[],
): DailyIntakeResult {
  const mealTotals = emptyMealTotals();

  entries.forEach((entry) => {
    const macros: MacroNutrients = {
      calories: round1(entry.nutrition.calories),
      protein: round1(entry.nutrition.protein),
      carbs: round1(entry.nutrition.carbs),
      fat: round1(entry.nutrition.fat),
      fiber: round1(entry.nutrition.fiber),
    };
    mealTotals[entry.mealType] = sumMacros([mealTotals[entry.mealType], macros]);
  });

  const dailyTotal = sumMacros(Object.values(mealTotals));
  const fiberGoal = goals.fiber ?? DEFAULT_FIBER_GOAL;
  const remainingCalories = round1(goals.calories - dailyTotal.calories);

  const progress: MacroProgress = {
    protein: calcProgress(dailyTotal.protein, goals.protein),
    carbs: calcProgress(dailyTotal.carbs, goals.carbs),
    fat: calcProgress(dailyTotal.fat, goals.fat),
    fiber: calcProgress(dailyTotal.fiber, fiberGoal),
  };

  const warnings = buildDailyWarnings(dailyTotal, goals, { isPartialDay: true });

  return {
    meals: mealTotals,
    dailyTotal,
    remainingCalories,
    progress,
    warnings,
    explanation: buildDailyExplanation(
      mealTotals,
      dailyTotal,
      remainingCalories,
      progress,
      warnings,
    ),
  };
}

/** JSON output shape for a single food calculation */
export function toFoodCalculationJson(result: FoodCalculationResult) {
  return {
    food: result.food,
    quantity: result.quantity,
    calories: result.calories,
    protein: result.protein,
    carbs: result.carbs,
    fat: result.fat,
    fiber: result.fiber,
  };
}

/** JSON output shape for daily intake */
export function toDailyIntakeJson(result: DailyIntakeResult) {
  return {
    meals: result.meals,
    dailyTotal: result.dailyTotal,
    remainingCalories: result.remainingCalories,
    progress: result.progress,
    warnings: result.warnings,
  };
}
