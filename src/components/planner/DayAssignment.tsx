import { Check } from 'lucide-react'
import { Field, TextInput } from '@/components/ui/Field'
import { Select } from '@/components/ui/Select'
import { formatDisplayDate } from '@/lib/logic/dateUtils'
import { MEAL_SLOT_LABELS } from '@/lib/schemas/planner'
import type { Meal, PlannedDay, WorkoutTemplate } from '@/types'
import type { ActivePlanDay } from '@/components/planner/PlanTable'

const NONE = '__none__'

interface DayAssignmentProps {
  day: ActivePlanDay
  meals: Meal[]
  templates: WorkoutTemplate[]
  onChange: (index: number, patch: Partial<PlannedDay>) => void
}

/**
 * Assigns saved library entries to one day. Writes immediately — no save button.
 * Picking an item copies its current content into the day (see `plannedDaySchema`);
 * later edits to the library entry don't reach this day unless explicitly propagated.
 */
export function DayAssignment({ day, meals, templates, onChange }: DayAssignmentProps) {
  const { plan, index } = day

  /**
   * Build a slot's option list from the live library, but let the *currently
   * assigned* template win on label if it's already snapshotted — otherwise a
   * later library rename (or the item being deleted entirely) would make a
   * frozen past assignment display the wrong name here, which is exactly the
   * confusion snapshotting is meant to prevent.
   */
  const optionsFor = (current?: WorkoutTemplate) => {
    const options = templates.map((t) => ({ value: t.id, label: t.name }))
    if (current) {
      const idx = options.findIndex((o) => o.value === current.id)
      const frozen = { value: current.id, label: current.name }
      if (idx >= 0) options[idx] = frozen
      else options.push(frozen) // assigned, but since removed from the library
    }
    return [{ value: NONE, label: 'None' }, ...options]
  }

  const toggleMeal = (meal: Meal) => {
    const selected = plan.meals.some((m) => m.id === meal.id)
    const next = selected
      ? plan.meals.filter((m) => m.id !== meal.id)
      : [...plan.meals, meal]
    onChange(index, { meals: next })
  }

  const setWorkout = (slot: 'workout1' | 'workout2', templateId: string) => {
    const template = templateId === NONE ? undefined : templates.find((t) => t.id === templateId)
    onChange(index, { [slot]: template })
  }

  // Same principle as optionsFor: chips for already-assigned meals must show
  // what was actually snapshotted, not whatever the library currently says.
  const chipMeals = [
    ...plan.meals.filter((assigned) => !meals.some((m) => m.id === assigned.id)),
    ...meals.map((libraryMeal) => plan.meals.find((m) => m.id === libraryMeal.id) ?? libraryMeal),
  ]

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-4">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-bold text-gray-200">Day {day.dayNumber}</span>
        <span className="text-[11px] font-medium text-gray-500">{formatDisplayDate(day.date)}</span>
      </div>

      {templates.length === 0 && !plan.workout1 && !plan.workout2 ? (
        <p className="text-[11px] text-gray-500">
          Save a workout to your library first, then assign it here.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Workout 1">
            <Select
              label={`Day ${day.dayNumber} workout 1`}
              value={plan.workout1?.id ?? NONE}
              onChange={(v) => setWorkout('workout1', v)}
              options={optionsFor(plan.workout1)}
            />
            <TextInput
              type="time"
              value={plan.workout1TargetTime ?? ''}
              onChange={(e) => onChange(index, { workout1TargetTime: e.target.value })}
            />
          </Field>
          <Field label="Workout 2">
            <Select
              label={`Day ${day.dayNumber} workout 2`}
              value={plan.workout2?.id ?? NONE}
              onChange={(v) => setWorkout('workout2', v)}
              options={optionsFor(plan.workout2)}
            />
            <TextInput
              type="time"
              value={plan.workout2TargetTime ?? ''}
              onChange={(e) => onChange(index, { workout2TargetTime: e.target.value })}
            />
          </Field>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
          Meals
        </span>
        {chipMeals.length === 0 ? (
          <p className="text-[11px] text-gray-500">
            Save a meal to your library first, then assign it here.
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {chipMeals.map((meal) => {
              const selected = plan.meals.some((m) => m.id === meal.id)
              return (
                <button
                  key={meal.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleMeal(meal)}
                  className={`flex cursor-pointer items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-bold transition-all focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none active:scale-95 ${
                    selected
                      ? 'border-purple-400/40 bg-purple-500/25 text-purple-100'
                      : 'border-white/5 bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {selected && <Check size={11} />}
                  {meal.name}
                  <span className="font-medium opacity-60">{MEAL_SLOT_LABELS[meal.slot]}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
