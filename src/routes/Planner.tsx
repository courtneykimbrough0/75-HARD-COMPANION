import { useEffect, useMemo, useState } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import { DayAssignment } from '@/components/planner/DayAssignment'
import { EditScopeDialog, type EditPropagationScope } from '@/components/planner/EditScopeDialog'
import { LibraryList, type LibraryEntry } from '@/components/planner/LibraryList'
import { MealWizard } from '@/components/planner/MealWizard'
import { PlanTable, type ActivePlanDay } from '@/components/planner/PlanTable'
import { WeekSelector } from '@/components/planner/WeekSelector'
import { WorkoutWizard } from '@/components/planner/WorkoutWizard'
import { useAllMeals, useAllWorkoutTemplates, useAppMeta, useWeekPlan } from '@/db/hooks'
import {
  deleteMeal,
  deleteWorkoutTemplate,
  isMealAssignedAnywhere,
  isWorkoutTemplateAssignedAnywhere,
  propagateMealEdit,
  propagateWorkoutTemplateEdit,
  saveMeal,
  savePlannerWeek,
  saveWorkoutTemplate,
} from '@/db/repository'
import {
  addDays,
  daysBetween,
  getWeekEndDate,
  getWeekStartDate,
  isDateBefore,
  todayLocalDateString,
} from '@/lib/logic/dateUtils'
import { MEAL_SLOT_LABELS, WORKOUT_KIND_LABELS, emptyPlannedDays } from '@/lib/schemas/planner'
import type { Meal, PlannedDay, WorkoutTemplate } from '@/types'

const TAB_TRIGGER_CLASS =
  'flex-1 cursor-pointer rounded-lg py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none data-[state=active]:bg-purple-500 data-[state=active]:text-white text-gray-400 hover:text-gray-200'

export default function Planner() {
  const appMeta = useAppMeta()
  const [weekStartDate, setWeekStartDate] = useState('')

  const savedPlan = useWeekPlan(weekStartDate || '1970-01-01')
  const meals = useAllMeals() ?? []
  const templates = useAllWorkoutTemplates() ?? []

  const [mealWizardOpen, setMealWizardOpen] = useState(false)
  const [editingMeal, setEditingMeal] = useState<Meal | undefined>()
  const [workoutWizardOpen, setWorkoutWizardOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<WorkoutTemplate | undefined>()

  // Set only after saving an edit to a meal/template that's already assigned
  // somewhere — that's what triggers the scope dialog below.
  const [pendingMealScope, setPendingMealScope] = useState<Meal | undefined>()
  const [pendingTemplateScope, setPendingTemplateScope] = useState<WorkoutTemplate | undefined>()

  useEffect(() => {
    if (!appMeta || weekStartDate) return

    const cycleStart = appMeta.cycleStartDate
    const cycleEnd = addDays(cycleStart, 74)
    const firstSunday = getWeekStartDate(cycleStart)
    const lastSunday = getWeekStartDate(cycleEnd)
    const todaySunday = getWeekStartDate(todayLocalDateString())

    let initial = todaySunday
    if (isDateBefore(todaySunday, firstSunday)) initial = firstSunday
    else if (isDateBefore(lastSunday, todaySunday)) initial = lastSunday
    setWeekStartDate(initial)
  }, [appMeta, weekStartDate])

  const days: PlannedDay[] = savedPlan?.days ?? emptyPlannedDays()

  const activeDays: ActivePlanDay[] = useMemo(() => {
    if (!appMeta || !weekStartDate) return []
    const cycleStart = appMeta.cycleStartDate
    const cycleEnd = addDays(cycleStart, 74)
    const result: ActivePlanDay[] = []
    for (let i = 0; i < 7; i++) {
      const date = addDays(weekStartDate, i)
      if (isDateBefore(date, cycleStart) || isDateBefore(cycleEnd, date)) continue
      result.push({
        index: i,
        date,
        dayNumber: daysBetween(cycleStart, date) + 1,
        plan: days[i] ?? { dayOfWeek: i, meals: [] },
      })
    }
    return result
  }, [appMeta, weekStartDate, days])

  if (!appMeta || !weekStartDate) {
    return <p className="py-10 text-center font-medium text-gray-500">Loading…</p>
  }

  const cycleStart = appMeta.cycleStartDate
  const cycleEnd = addDays(cycleStart, 74)
  const calendarSaturday = getWeekEndDate(weekStartDate)
  const actualStartDate = isDateBefore(weekStartDate, cycleStart) ? cycleStart : weekStartDate
  const actualEndDate = isDateBefore(cycleEnd, calendarSaturday) ? cycleEnd : calendarSaturday

  const persist = async (nextDays: PlannedDay[]) => {
    await savePlannerWeek({
      weekStartDate,
      weekEndDate: calendarSaturday,
      days: nextDays,
      updatedAt: Date.now(),
    })
  }

  const handleDayChange = (index: number, patch: Partial<PlannedDay>) => {
    const next = days.map((day, i) => (i === index ? { ...day, ...patch } : day))
    void persist(next)
  }

  const mealEntries: LibraryEntry[] = meals.map((meal) => ({
    id: meal.id,
    title: meal.name,
    subtitle: `${MEAL_SLOT_LABELS[meal.slot]} · ${meal.dishes.length} ${
      meal.dishes.length === 1 ? 'dish' : 'dishes'
    }`,
  }))

  const templateEntries: LibraryEntry[] = templates.map((t) => ({
    id: t.id,
    title: t.name,
    subtitle: `${WORKOUT_KIND_LABELS[t.kind]} · ${t.targetMinutes} min${
      t.isOutdoor ? ' · outdoor' : ''
    }${t.exercises.length ? ` · ${t.exercises.length} exercises` : ''}`,
  }))

  return (
    <div className="animate-page-enter flex flex-col gap-5">
      <h1 className="text-xl font-semibold text-white">Weekly Planner</h1>

      <WeekSelector
        actualStartDate={actualStartDate}
        actualEndDate={actualEndDate}
        onPrev={() => setWeekStartDate((d) => addDays(d, -7))}
        onNext={() => setWeekStartDate((d) => addDays(d, 7))}
        prevDisabled={weekStartDate === getWeekStartDate(cycleStart)}
        nextDisabled={weekStartDate === getWeekStartDate(cycleEnd)}
      />

      <Tabs.Root defaultValue="week">
        <Tabs.List
          className="flex rounded-xl bg-gray-900 p-1"
          aria-label="Planner sections"
        >
          <Tabs.Trigger value="week" className={TAB_TRIGGER_CLASS}>
            This Week
          </Tabs.Trigger>
          <Tabs.Trigger value="workouts" className={TAB_TRIGGER_CLASS}>
            Workouts
          </Tabs.Trigger>
          <Tabs.Trigger value="meals" className={TAB_TRIGGER_CLASS}>
            Meals
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="week" className="mt-4 flex flex-col gap-4">
          {activeDays.length === 0 ? (
            <p className="text-center text-xs text-gray-500">
              No challenge days fall in this week.
            </p>
          ) : (
            <>
              <PlanTable days={activeDays} />
              {activeDays.map((day) => (
                <DayAssignment
                  key={day.index}
                  day={day}
                  meals={meals}
                  templates={templates}
                  onChange={handleDayChange}
                />
              ))}
            </>
          )}
        </Tabs.Content>

        <Tabs.Content value="workouts" className="mt-4">
          <LibraryList
            label="Saved workouts"
            entries={templateEntries}
            emptyHint="No saved workouts yet. Create one and reuse it across the whole challenge."
            onNew={() => {
              setEditingTemplate(undefined)
              setWorkoutWizardOpen(true)
            }}
            onEdit={(id) => {
              setEditingTemplate(templates.find((t) => t.id === id))
              setWorkoutWizardOpen(true)
            }}
            onDelete={(id) => void deleteWorkoutTemplate(id)}
          />
        </Tabs.Content>

        <Tabs.Content value="meals" className="mt-4">
          <LibraryList
            label="Saved meals"
            entries={mealEntries}
            emptyHint="No saved meals yet. Build one once and assign it to any day."
            onNew={() => {
              setEditingMeal(undefined)
              setMealWizardOpen(true)
            }}
            onEdit={(id) => {
              setEditingMeal(meals.find((m) => m.id === id))
              setMealWizardOpen(true)
            }}
            onDelete={(id) => void deleteMeal(id)}
          />
        </Tabs.Content>
      </Tabs.Root>

      <MealWizard
        open={mealWizardOpen}
        onOpenChange={setMealWizardOpen}
        meal={editingMeal}
        onSave={(meal) => {
          const wasEdit = !!editingMeal
          void (async () => {
            await saveMeal(meal)
            if (wasEdit && (await isMealAssignedAnywhere(meal.id))) {
              setPendingMealScope(meal)
            }
          })()
        }}
      />
      <WorkoutWizard
        open={workoutWizardOpen}
        onOpenChange={setWorkoutWizardOpen}
        template={editingTemplate}
        onSave={(template) => {
          const wasEdit = !!editingTemplate
          void (async () => {
            await saveWorkoutTemplate(template)
            if (wasEdit && (await isWorkoutTemplateAssignedAnywhere(template.id))) {
              setPendingTemplateScope(template)
            }
          })()
        }}
      />

      <EditScopeDialog
        open={!!pendingMealScope}
        itemLabel={pendingMealScope?.name ?? ''}
        onChoose={(scope: EditPropagationScope) => {
          if (pendingMealScope) void propagateMealEdit(pendingMealScope, scope)
          setPendingMealScope(undefined)
        }}
        onDismiss={() => setPendingMealScope(undefined)}
      />
      <EditScopeDialog
        open={!!pendingTemplateScope}
        itemLabel={pendingTemplateScope?.name ?? ''}
        onChoose={(scope: EditPropagationScope) => {
          if (pendingTemplateScope) void propagateWorkoutTemplateEdit(pendingTemplateScope, scope)
          setPendingTemplateScope(undefined)
        }}
        onDismiss={() => setPendingTemplateScope(undefined)}
      />
    </div>
  )
}
