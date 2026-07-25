import { useEffect, useState } from 'react'
import { MealPlanEditor } from '@/components/planner/MealPlanEditor'
import { WeekSelector } from '@/components/planner/WeekSelector'
import { WorkoutScheduleTable, type ActiveWorkoutScheduleDay } from '@/components/planner/WorkoutScheduleTable'
import { MealScheduleTable, type ActiveMealScheduleDay } from '@/components/planner/MealScheduleTable'
import { Button } from '@/components/ui/Button'
import { useAppMeta, useWeekPlan } from '@/db/hooks'
import { savePlannerWeek } from '@/db/repository'
import { addDays, daysBetween, getWeekEndDate, getWeekStartDate, isDateBefore, todayLocalDateString } from '@/lib/logic/dateUtils'
import type { WeeklyPlan, WorkoutScheduleDay, MealScheduleDay } from '@/types'

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

function emptyMeals(): MealScheduleDay[] {
  return Array.from({ length: 7 }, (_, dayOfWeek) => ({
    dayOfWeek,
    meal1: '',
    meal2: '',
    meal3: '',
    snacks: '',
  }))
}

export default function Planner() {
  const appMeta = useAppMeta()
  const [weekStartDate, setWeekStartDate] = useState('')
  const [activeTab, setActiveTab] = useState<'workouts' | 'meals'>('workouts')

  const savedPlan = useWeekPlan(weekStartDate || '1970-01-01')

  const [mealPlanText, setMealPlanText] = useState('')
  const [scheduledWorkouts, setScheduledWorkouts] = useState<WorkoutScheduleDay[]>(emptySchedule())
  const [scheduledMeals, setScheduledMeals] = useState<MealScheduleDay[]>(emptyMeals())
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!appMeta || weekStartDate) return

    const cycleStartDate = appMeta.cycleStartDate
    const cycleEndDate = addDays(cycleStartDate, 74)
    const firstCalendarSunday = getWeekStartDate(cycleStartDate)
    const lastCalendarSunday = getWeekStartDate(cycleEndDate)

    const todaySunday = getWeekStartDate(todayLocalDateString())

    let initialSunday = todaySunday
    if (isDateBefore(todaySunday, firstCalendarSunday)) {
      initialSunday = firstCalendarSunday
    } else if (isDateBefore(lastCalendarSunday, todaySunday)) {
      initialSunday = lastCalendarSunday
    }
    setWeekStartDate(initialSunday)
  }, [appMeta, weekStartDate])

  useEffect(() => {
    if (!weekStartDate) return
    setMealPlanText(savedPlan?.mealPlanText ?? '')
    setScheduledWorkouts(savedPlan?.scheduledWorkouts ?? emptySchedule())
    setScheduledMeals(savedPlan?.scheduledMeals ?? emptyMeals())
    setSaved(false)
  }, [weekStartDate, savedPlan])

  if (!appMeta || !weekStartDate) {
    return <p className="text-center text-gray-500 font-medium py-10">Loading…</p>
  }

  const cycleStartDate = appMeta.cycleStartDate
  const cycleEndDate = addDays(cycleStartDate, 74)

  const firstCalendarSunday = getWeekStartDate(cycleStartDate)
  const lastCalendarSunday = getWeekStartDate(cycleEndDate)

  const calendarSunday = weekStartDate
  const calendarSaturday = getWeekEndDate(calendarSunday)

  const actualStartDate = isDateBefore(calendarSunday, cycleStartDate) ? cycleStartDate : calendarSunday
  const actualEndDate = isDateBefore(cycleEndDate, calendarSaturday) ? cycleEndDate : calendarSaturday

  const prevDisabled = weekStartDate === firstCalendarSunday
  const nextDisabled = weekStartDate === lastCalendarSunday

  const activeDays: ActiveWorkoutScheduleDay[] = []
  for (let i = 0; i < 7; i++) {
    const currentDate = addDays(calendarSunday, i)
    if (!isDateBefore(currentDate, cycleStartDate) && !isDateBefore(cycleEndDate, currentDate)) {
      const dayNum = daysBetween(cycleStartDate, currentDate) + 1
      activeDays.push({
        ...(scheduledWorkouts[i] ?? {
          dayOfWeek: i,
          workout1Type: '',
          workout1Location: '',
          workout1TargetTime: '',
          workout2Type: '',
          workout2Location: '',
          workout2TargetTime: '',
        }),
        index: i,
        date: currentDate,
        dayNumber: dayNum,
      })
    }
  }

  const activeMeals: ActiveMealScheduleDay[] = []
  for (let i = 0; i < 7; i++) {
    const currentDate = addDays(calendarSunday, i)
    if (!isDateBefore(currentDate, cycleStartDate) && !isDateBefore(cycleEndDate, currentDate)) {
      const dayNum = daysBetween(cycleStartDate, currentDate) + 1
      activeMeals.push({
        ...(scheduledMeals[i] ?? {
          dayOfWeek: i,
          meal1: '',
          meal2: '',
          meal3: '',
          snacks: '',
        }),
        index: i,
        date: currentDate,
        dayNumber: dayNum,
      })
    }
  }

  const handleSave = async () => {
    const plan: WeeklyPlan = {
      weekStartDate,
      weekEndDate: calendarSaturday,
      mealPlanText,
      scheduledWorkouts,
      scheduledMeals,
      updatedAt: Date.now(),
    }
    await savePlannerWeek(plan)
    setSaved(true)
  }

  const handleWorkoutChange = (updatedActiveDay: ActiveWorkoutScheduleDay) => {
    const newScheduledWorkouts = [...scheduledWorkouts]
    newScheduledWorkouts[updatedActiveDay.index] = {
      dayOfWeek: updatedActiveDay.dayOfWeek,
      workout1Type: updatedActiveDay.workout1Type,
      workout1Location: updatedActiveDay.workout1Location,
      workout1TargetTime: updatedActiveDay.workout1TargetTime,
      workout2Type: updatedActiveDay.workout2Type,
      workout2Location: updatedActiveDay.workout2Location,
      workout2TargetTime: updatedActiveDay.workout2TargetTime,
    }
    setScheduledWorkouts(newScheduledWorkouts)
    setSaved(false)
  }

  const handleMealChange = (updatedActiveDay: ActiveMealScheduleDay) => {
    const newScheduledMeals = [...scheduledMeals]
    newScheduledMeals[updatedActiveDay.index] = {
      dayOfWeek: updatedActiveDay.dayOfWeek,
      meal1: updatedActiveDay.meal1,
      meal2: updatedActiveDay.meal2,
      meal3: updatedActiveDay.meal3,
      snacks: updatedActiveDay.snacks,
    }
    setScheduledMeals(newScheduledMeals)
    setSaved(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-white">Weekly Planner</h1>
      <WeekSelector
        actualStartDate={actualStartDate}
        actualEndDate={actualEndDate}
        onPrev={() => setWeekStartDate((d) => addDays(d, -7))}
        onNext={() => setWeekStartDate((d) => addDays(d, 7))}
        prevDisabled={prevDisabled}
        nextDisabled={nextDisabled}
      />

      <div className="flex rounded-xl bg-gray-900 p-1">
        <button
          type="button"
          onClick={() => setActiveTab('workouts')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
            activeTab === 'workouts'
              ? 'bg-purple-500 text-white'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          Workout Plan
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('meals')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
            activeTab === 'meals'
              ? 'bg-purple-500 text-white'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          Meal Plan
        </button>
      </div>

      {activeTab === 'workouts' && activeDays.length > 0 && (
        <WorkoutScheduleTable days={activeDays} onChange={handleWorkoutChange} />
      )}

      {activeTab === 'meals' && activeMeals.length > 0 && (
        <>
          <MealScheduleTable days={activeMeals} onChange={handleMealChange} />
          <MealPlanEditor value={mealPlanText} onChange={(v) => { setMealPlanText(v); setSaved(false); }} />
        </>
      )}

      <Button onClick={() => void handleSave()} className="w-full">
        {saved ? 'Saved ✓' : 'Save Week'}
      </Button>
    </div>
  )
}
