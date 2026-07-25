import { formatDisplayDate } from '@/lib/logic/dateUtils'
import type { MealScheduleDay } from '@/types'

const INPUT_CLASS =
  'w-full rounded-lg bg-gray-800 px-2 py-1.5 text-xs text-gray-100 placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500'

export interface ActiveMealScheduleDay extends MealScheduleDay {
  index: number
  date: string
  dayNumber: number
}

interface MealScheduleTableProps {
  days: ActiveMealScheduleDay[]
  onChange: (day: ActiveMealScheduleDay) => void
}

export function MealScheduleTable({ days, onChange }: MealScheduleTableProps) {
  const updateDay = (index: number, patch: Partial<ActiveMealScheduleDay>) => {
    const targetDay = days.find((d) => d.index === index)
    if (targetDay) {
      onChange({ ...targetDay, ...patch })
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-400">Scheduled Meals</label>
      <div className="flex flex-col gap-3">
        {days.map((day) => (
          <div key={day.dayOfWeek} className="rounded-xl bg-gray-900 p-3">
            <p className="mb-2 text-xs font-semibold text-gray-400">
              Day {day.dayNumber} — {formatDisplayDate(day.date)}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-medium text-gray-500">Meal 1 (Breakfast)</span>
                <input
                  className={INPUT_CLASS}
                  placeholder="e.g. Oatmeal & Eggs"
                  value={day.meal1}
                  onChange={(e) => updateDay(day.index, { meal1: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-medium text-gray-500">Meal 2 (Lunch)</span>
                <input
                  className={INPUT_CLASS}
                  placeholder="e.g. Chicken salad"
                  value={day.meal2}
                  onChange={(e) => updateDay(day.index, { meal2: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-medium text-gray-500">Meal 3 (Dinner)</span>
                <input
                  className={INPUT_CLASS}
                  placeholder="e.g. Salmon & Rice"
                  value={day.meal3}
                  onChange={(e) => updateDay(day.index, { meal3: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-medium text-gray-500">Snacks / Shakes</span>
                <input
                  className={INPUT_CLASS}
                  placeholder="e.g. Protein shake, Almonds"
                  value={day.snacks}
                  onChange={(e) => updateDay(day.index, { snacks: e.target.value })}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
