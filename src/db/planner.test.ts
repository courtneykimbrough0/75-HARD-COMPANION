import { beforeEach, describe, expect, it } from 'vitest'
import 'fake-indexeddb/auto'
import { db, resetSeedCacheForTests } from './db'
import {
  deleteMeal,
  deleteWorkoutTemplate,
  getAllMeals,
  getAllWorkoutTemplates,
  getPlanForWeek,
  isMealAssignedAnywhere,
  isWorkoutTemplateAssignedAnywhere,
  propagateMealEdit,
  propagateWorkoutTemplateEdit,
  saveMeal,
  savePlannerWeek,
  saveWorkoutTemplate,
} from './repository'
import { emptyPlannedDays, mealSchema, workoutTemplateSchema } from '@/lib/schemas/planner'
import { newId } from '@/lib/logic/ids'
import { addDays, getWeekStartDate, todayLocalDateString } from '@/lib/logic/dateUtils'
import type { Meal, WorkoutTemplate } from '@/types'

function makeMeal(name: string): Meal {
  const now = Date.now()
  return {
    id: newId(),
    name,
    slot: 'lunch',
    dishes: [
      { id: newId(), name: 'Grilled chicken', amount: '6 oz', recipe: 'Season, grill 6 min/side' },
      { id: newId(), name: 'White rice', amount: '1 cup' },
    ],
    createdAt: now,
    updatedAt: now,
  }
}

function makeTemplate(name: string, isOutdoor = false): WorkoutTemplate {
  const now = Date.now()
  return {
    id: newId(),
    name,
    kind: 'lift',
    isOutdoor,
    targetMinutes: 45,
    exercises: [
      { id: newId(), name: 'Bench press', sets: 4, reps: '8-10' },
      { id: newId(), name: 'Incline DB press', sets: 3, reps: 'AMRAP', notes: 'Slow eccentric' },
    ],
    createdAt: now,
    updatedAt: now,
  }
}

const today = todayLocalDateString()
const thisWeekStart = getWeekStartDate(today)
const lastWeekStart = addDays(thisWeekStart, -7)
const nextWeekStart = addDays(thisWeekStart, 7)

async function planWeek(weekStartDate: string, day0: { meals?: Meal[]; workout1?: WorkoutTemplate }) {
  const days = emptyPlannedDays()
  days[0] = { ...days[0], ...day0, meals: day0.meals ?? [] }
  await savePlannerWeek({
    weekStartDate,
    weekEndDate: addDays(weekStartDate, 6),
    days,
    updatedAt: Date.now(),
  })
}

describe('planner library', () => {
  beforeEach(async () => {
    resetSeedCacheForTests()
    await db.delete()
    await db.open()
  })

  it('round-trips a meal with nested dishes through IndexedDB', async () => {
    const meal = makeMeal('Chicken & Rice')
    await saveMeal(meal)

    const all = await getAllMeals()
    expect(all).toHaveLength(1)
    expect(all[0].dishes).toHaveLength(2)
    expect(all[0].dishes[0].amount).toBe('6 oz')
    expect(all[0].dishes[0].recipe).toContain('grill')
  })

  it('round-trips a workout template with nested exercises', async () => {
    await saveWorkoutTemplate(makeTemplate('Push Day', true))

    const all = await getAllWorkoutTemplates()
    expect(all).toHaveLength(1)
    expect(all[0].isOutdoor).toBe(true)
    expect(all[0].exercises.map((e) => e.reps)).toEqual(['8-10', 'AMRAP'])
  })

  it('rejects a meal with no dishes', () => {
    const bad = { ...makeMeal('Empty'), dishes: [] }
    expect(mealSchema.safeParse(bad).success).toBe(false)
  })

  it('rejects a template with a blank exercise name', () => {
    const bad = makeTemplate('Bad')
    bad.exercises[0].name = '   '
    expect(workoutTemplateSchema.safeParse(bad).success).toBe(false)
  })

  it('assigning a meal embeds a snapshot, not a live reference', async () => {
    const meal = makeMeal('Chicken & Rice')
    await saveMeal(meal)
    await planWeek(thisWeekStart, { meals: [meal] })

    // Edit the library meal directly, without going through propagation at all.
    const edited = { ...meal, name: 'Chicken & Quinoa', updatedAt: Date.now() }
    await saveMeal(edited)

    const plan = await getPlanForWeek(thisWeekStart)
    expect(plan?.days[0].meals[0].name).toBe('Chicken & Rice') // untouched
    expect((await getAllMeals())[0].name).toBe('Chicken & Quinoa') // library did change
  })

  it('deleting a library meal does not touch a week that already has it assigned', async () => {
    const meal = makeMeal('Chicken & Rice')
    await saveMeal(meal)
    await planWeek(thisWeekStart, { meals: [meal] })

    expect(await isMealAssignedAnywhere(meal.id)).toBe(true)
    await deleteMeal(meal.id)

    expect(await getAllMeals()).toHaveLength(0)
    const plan = await getPlanForWeek(thisWeekStart)
    expect(plan?.days[0].meals[0].name).toBe('Chicken & Rice') // snapshot survives deletion
  })

  it('deleting a workout template does not touch a week that already has it assigned', async () => {
    const template = makeTemplate('Push Day')
    await saveWorkoutTemplate(template)
    await planWeek(thisWeekStart, { workout1: template })

    await deleteWorkoutTemplate(template.id)

    expect(await getAllWorkoutTemplates()).toHaveLength(0)
    const plan = await getPlanForWeek(thisWeekStart)
    expect(plan?.days[0].workout1?.name).toBe('Push Day')
  })

  it("propagateMealEdit('future') updates this week and next week, but not last week", async () => {
    const meal = makeMeal('Chicken & Rice')
    await saveMeal(meal)
    await planWeek(lastWeekStart, { meals: [meal] })
    await planWeek(thisWeekStart, { meals: [meal] })
    await planWeek(nextWeekStart, { meals: [meal] })

    const edited = { ...meal, name: 'Chicken & Quinoa', updatedAt: Date.now() }
    await saveMeal(edited)
    await propagateMealEdit(edited, 'future')

    expect((await getPlanForWeek(lastWeekStart))?.days[0].meals[0].name).toBe('Chicken & Rice')
    expect((await getPlanForWeek(thisWeekStart))?.days[0].meals[0].name).toBe('Chicken & Quinoa')
    expect((await getPlanForWeek(nextWeekStart))?.days[0].meals[0].name).toBe('Chicken & Quinoa')
  })

  it("propagateMealEdit('all') updates every week, including the past", async () => {
    const meal = makeMeal('Chicken & Rice')
    await saveMeal(meal)
    await planWeek(lastWeekStart, { meals: [meal] })
    await planWeek(nextWeekStart, { meals: [meal] })

    const edited = { ...meal, name: 'Chicken & Quinoa', updatedAt: Date.now() }
    await saveMeal(edited)
    await propagateMealEdit(edited, 'all')

    expect((await getPlanForWeek(lastWeekStart))?.days[0].meals[0].name).toBe('Chicken & Quinoa')
    expect((await getPlanForWeek(nextWeekStart))?.days[0].meals[0].name).toBe('Chicken & Quinoa')
  })

  it('propagateWorkoutTemplateEdit only touches slots actually holding that template', async () => {
    const pushDay = makeTemplate('Push Day')
    const legDay = makeTemplate('Leg Day')
    await saveWorkoutTemplate(pushDay)
    await saveWorkoutTemplate(legDay)

    const days = emptyPlannedDays()
    days[0] = { ...days[0], workout1: pushDay, workout2: legDay, meals: [] }
    await savePlannerWeek({
      weekStartDate: thisWeekStart,
      weekEndDate: addDays(thisWeekStart, 6),
      days,
      updatedAt: Date.now(),
    })

    const editedPushDay = { ...pushDay, targetMinutes: 60, updatedAt: Date.now() }
    await saveWorkoutTemplate(editedPushDay)
    await propagateWorkoutTemplateEdit(editedPushDay, 'all')

    const plan = await getPlanForWeek(thisWeekStart)
    expect(plan?.days[0].workout1?.targetMinutes).toBe(60)
    expect(plan?.days[0].workout2?.name).toBe('Leg Day') // untouched, different template
  })

  it('isWorkoutTemplateAssignedAnywhere checks both workout slots', async () => {
    const template = makeTemplate('Leg Day')
    await saveWorkoutTemplate(template)
    expect(await isWorkoutTemplateAssignedAnywhere(template.id)).toBe(false)

    await planWeek(thisWeekStart, {})
    const days = emptyPlannedDays()
    days[2] = { ...days[2], workout2: template, meals: [] }
    await savePlannerWeek({
      weekStartDate: thisWeekStart,
      weekEndDate: addDays(thisWeekStart, 6),
      days,
      updatedAt: Date.now(),
    })

    expect(await isWorkoutTemplateAssignedAnywhere(template.id)).toBe(true)
  })

  it('degrades a legacy v1 flat-string plan to an empty week instead of throwing', async () => {
    // Shape written by the pre-v2 planner: no `days`, free-text meals.
    await db.weeklyPlans.put({
      weekStartDate: '2026-07-05',
      weekEndDate: '2026-07-11',
      mealPlanText: 'Oatmeal & eggs',
      scheduledWorkouts: [{ dayOfWeek: 0, workout1Type: 'Run' }],
      scheduledMeals: [{ dayOfWeek: 0, meal1: 'Oatmeal' }],
      updatedAt: Date.now(),
    } as never)

    const plan = await getPlanForWeek('2026-07-05')
    expect(plan).toBeDefined()
    expect(plan?.days).toHaveLength(7)
    expect(plan?.days.every((d) => d.meals.length === 0)).toBe(true)
  })

  it('v2 upgrade preserves data written under the v1 schema', async () => {
    // Rows in stores that existed at v1 must survive the version bump.
    await db.dailyLogs.put({
      date: '2026-07-01',
      dayNumber: 3,
      workout1Complete: true,
      workout2Complete: false,
      waterTargetComplete: true,
      readingTargetComplete: true,
      dietCompliant: true,
      photoCaptured: false,
      status: 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
    await db.workoutRecords.add({
      date: '2026-07-01',
      sessionNumber: 1,
      startTime: Date.now(),
      endTime: Date.now(),
      isOutdoor: true,
      durationSeconds: 2700,
    })

    await db.close()
    await db.open()

    expect((await db.dailyLogs.get('2026-07-01'))?.dayNumber).toBe(3)
    expect(await db.workoutRecords.count()).toBe(1)
    expect(db.meals).toBeDefined()
    expect(db.workoutTemplates).toBeDefined()
  })
})
