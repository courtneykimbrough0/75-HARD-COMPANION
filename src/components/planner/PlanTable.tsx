import { formatDisplayDate } from '@/lib/logic/dateUtils'
import { MEAL_SLOT_LABELS } from '@/lib/schemas/planner'
import type { DateString, PlannedDay } from '@/types'

export interface ActivePlanDay {
  /** Index into WeeklyPlan.days (0=Sun..6=Sat). */
  index: number
  date: DateString
  dayNumber: number
  plan: PlannedDay
}

interface PlanTableProps {
  days: ActivePlanDay[]
}

/**
 * Read-only summary of the week. A plain semantic table in a horizontally
 * scrollable wrapper — 7 rows and 3 columns needs no table library. Reads
 * straight from each day's embedded snapshot, not a live library lookup —
 * what's shown here is exactly what's assigned, past or present.
 */
export function PlanTable({ days }: PlanTableProps) {
  const describeWorkout = (
    template: PlannedDay['workout1'],
    time?: string,
  ) => {
    if (!template) return null
    return `${template.name}${template.isOutdoor ? ' · outdoor' : ''}${time ? ` · ${time}` : ''}`
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/5">
      <table className="w-full min-w-[520px] border-collapse text-left">
        <caption className="sr-only">Planned workouts and meals for the selected week</caption>
        <thead>
          <tr className="bg-white/[0.04]">
            <th scope="col" className="px-3 py-2.5 text-[11px] font-bold text-gray-400 uppercase">
              Day
            </th>
            <th scope="col" className="px-3 py-2.5 text-[11px] font-bold text-gray-400 uppercase">
              Workout 1
            </th>
            <th scope="col" className="px-3 py-2.5 text-[11px] font-bold text-gray-400 uppercase">
              Workout 2
            </th>
            <th scope="col" className="px-3 py-2.5 text-[11px] font-bold text-gray-400 uppercase">
              Meals
            </th>
          </tr>
        </thead>
        <tbody>
          {days.map(({ index, date, dayNumber, plan }) => {
            const w1 = describeWorkout(plan.workout1, plan.workout1TargetTime)
            const w2 = describeWorkout(plan.workout2, plan.workout2TargetTime)

            return (
              <tr key={index} className="border-t border-white/5 align-top">
                <th scope="row" className="px-3 py-3 whitespace-nowrap">
                  <span className="block text-xs font-bold text-gray-200">Day {dayNumber}</span>
                  <span className="block text-[11px] font-medium text-gray-500">
                    {formatDisplayDate(date)}
                  </span>
                </th>
                <td className="px-3 py-3 text-xs text-gray-300">
                  {w1 ?? <span className="text-gray-600">—</span>}
                </td>
                <td className="px-3 py-3 text-xs text-gray-300">
                  {w2 ?? <span className="text-gray-600">—</span>}
                </td>
                <td className="px-3 py-3 text-xs text-gray-300">
                  {plan.meals.length === 0 ? (
                    <span className="text-gray-600">—</span>
                  ) : (
                    <ul className="flex flex-col gap-0.5">
                      {plan.meals.map((meal) => (
                        <li key={meal.id}>
                          <span className="font-semibold">{meal.name}</span>
                          <span className="text-gray-500">
                            {' '}
                            · {MEAL_SLOT_LABELS[meal.slot]} · {meal.dishes.length}{' '}
                            {meal.dishes.length === 1 ? 'dish' : 'dishes'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
