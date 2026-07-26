import { z } from 'zod'

/**
 * Schemas for the reusable planner entities. These are the single source of truth
 * for both the TypeScript types and runtime validation at the IndexedDB boundary —
 * Dexie stores whatever it's handed, so reads are validated defensively to survive
 * legacy rows written by earlier versions of the schema.
 */

export const MEAL_SLOTS = ['breakfast', 'lunch', 'dinner', 'snack'] as const
export const mealSlotSchema = z.enum(MEAL_SLOTS)

export const WORKOUT_KINDS = [
  'lift',
  'run',
  'walk',
  'cycle',
  'swim',
  'yoga',
  'sport',
  'other',
] as const
export const workoutKindSchema = z.enum(WORKOUT_KINDS)

export const dishSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, 'Dish name is required'),
  /** Free text so "6 oz", "1 cup", "2 scoops" all work without a unit system. */
  amount: z.string().trim().default(''),
  recipe: z.string().trim().optional(),
})

export const mealSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, 'Meal name is required'),
  slot: mealSlotSchema,
  dishes: z.array(dishSchema).min(1, 'Add at least one dish'),
  createdAt: z.number(),
  updatedAt: z.number(),
})

export const exerciseSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, 'Exercise name is required'),
  sets: z.number().int().positive().optional(),
  /** String, not number — has to hold "8-10", "AMRAP", "30 sec". */
  reps: z.string().trim().optional(),
  notes: z.string().trim().optional(),
})

export const workoutTemplateSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, 'Workout name is required'),
  kind: workoutKindSchema,
  /** Feeds the 75 Hard outdoor requirement when a planned workout is started. */
  isOutdoor: z.boolean(),
  targetMinutes: z.number().int().positive(),
  exercises: z.array(exerciseSchema).default([]),
  createdAt: z.number(),
  updatedAt: z.number(),
})

/**
 * Days embed a full COPY of the meal/workout template as it existed at the
 * moment it was assigned — not an id reference. This is deliberate: it's what
 * keeps a past week's plan isolated from later library edits, without any
 * version-resolution logic. Each snapshot keeps the library item's original
 * `id` so a later edit can still find and optionally propagate into it.
 */
export const plannedDaySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  workout1: workoutTemplateSchema.optional(),
  workout1TargetTime: z.string().optional(),
  workout2: workoutTemplateSchema.optional(),
  workout2TargetTime: z.string().optional(),
  meals: z.array(mealSchema).default([]),
})

/**
 * `days` is the current shape. The three legacy fields are v1 leftovers kept
 * readable but unused — old free-text plans are deliberately not parsed into
 * structured dishes, since that would be guesswork.
 */
export const weeklyPlanSchema = z.object({
  weekStartDate: z.string(),
  weekEndDate: z.string(),
  days: z.array(plannedDaySchema).default([]),
  updatedAt: z.number(),
  mealPlanText: z.string().optional(),
  scheduledWorkouts: z.array(z.unknown()).optional(),
  scheduledMeals: z.array(z.unknown()).optional(),
})

export type Dish = z.infer<typeof dishSchema>
export type Meal = z.infer<typeof mealSchema>
export type MealSlot = z.infer<typeof mealSlotSchema>
export type Exercise = z.infer<typeof exerciseSchema>
export type WorkoutTemplate = z.infer<typeof workoutTemplateSchema>
export type WorkoutKind = z.infer<typeof workoutKindSchema>
export type PlannedDay = z.infer<typeof plannedDaySchema>
export type WeeklyPlan = z.infer<typeof weeklyPlanSchema>

export const MEAL_SLOT_LABELS: Record<MealSlot, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack / Shake',
}

export const WORKOUT_KIND_LABELS: Record<WorkoutKind, string> = {
  lift: 'Lifting',
  run: 'Run',
  walk: 'Walk',
  cycle: 'Cycling',
  swim: 'Swim',
  yoga: 'Yoga / Mobility',
  sport: 'Sport',
  other: 'Other',
}

export function emptyPlannedDays(): PlannedDay[] {
  return Array.from({ length: 7 }, (_, dayOfWeek) => ({ dayOfWeek, meals: [] }))
}
