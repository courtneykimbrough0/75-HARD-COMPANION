import { useEffect, useState } from 'react'
import { MealPlanEditor } from '@/components/planner/MealPlanEditor'
import { WeekSelector } from '@/components/planner/WeekSelector'
import { WorkoutScheduleTable } from '@/components/planner/WorkoutScheduleTable'
import { Button } from '@/components/ui/Button'
import { useWeekPlan } from '@/db/hooks'
import { savePlannerWeek } from '@/db/repository'
import { addDays, getWeekEndDate, getWeekStartDate, todayLocalDateString } from '@/lib/logic/dateUtils'
import type { WeeklyPlan, WorkoutScheduleDay } from '@/types'

function emptySchedule(): WorkoutScheduleDay[] {
  return Array.from({ length: 7 }, (_, dayOfWeek) => ({
    dayOfWeek,
    workout1Type: '',
    workout1Location: '',
    workout1TargetTime: '',
    workout2Type: '',
    workout2Location: '',
    workout2TargetTime: '',
  }))
}

export default function Planner() {
  const [weekStartDate, setWeekStartDate] = useState(() =>
    getWeekStartDate(todayLocalDateString()),
  )
  const savedPlan = useWeekPlan(weekStartDate)

  const [mealPlanText, setMealPlanText] = useState('')
  const [scheduledWorkouts, setScheduledWorkouts] = useState<WorkoutScheduleDay[]>(emptySchedule())
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setMealPlanText(savedPlan?.mealPlanText ?? '')
    setScheduledWorkouts(savedPlan?.scheduledWorkouts ?? emptySchedule())
    setSaved(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStartDate, savedPlan])

  const handleSave = async () => {
    const plan: WeeklyPlan = {
      weekStartDate,
      weekEndDate: getWeekEndDate(weekStartDate),
      mealPlanText,
      scheduledWorkouts,
      updatedAt: Date.now(),
    }
    await savePlannerWeek(plan)
    setSaved(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-white">Weekly Planner</h1>
      <WeekSelector
        weekStartDate={weekStartDate}
        onPrev={() => setWeekStartDate((d) => addDays(d, -7))}
        onNext={() => setWeekStartDate((d) => addDays(d, 7))}
      />
      <MealPlanEditor value={mealPlanText} onChange={setMealPlanText} />
      <WorkoutScheduleTable days={scheduledWorkouts} onChange={setScheduledWorkouts} />
      <Button onClick={() => void handleSave()} className="w-full">
        {saved ? 'Saved ✓' : 'Save Week'}
      </Button>
    </div>
  )
}
