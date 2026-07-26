import { SpacingIndicator } from '@/components/workouts/SpacingIndicator'
import { WorkoutSessionCard } from '@/components/workouts/WorkoutSessionCard'
import { useTodayPlan, useWorkoutsForDate } from '@/db/hooks'
import { todayLocalDateString } from '@/lib/logic/dateUtils'

const today = todayLocalDateString()

export default function Workouts() {
  const records = useWorkoutsForDate(today) ?? []
  const plan = useTodayPlan(today)

  const plannedFor = (sessionNumber: 1 | 2) =>
    sessionNumber === 1
      ? { planned: plan?.workout1, plannedTime: plan?.day.workout1TargetTime }
      : { planned: plan?.workout2, plannedTime: plan?.day.workout2TargetTime }

  return (
    <div className="animate-page-enter flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-white">Workouts</h1>
      {records.map((record) => (
        <WorkoutSessionCard
          key={record.id}
          date={today}
          label={`Session ${record.sessionNumber}`}
          record={record}
          {...plannedFor(record.sessionNumber)}
        />
      ))}
      {records.length < 2 && (
        <WorkoutSessionCard
          key={`next-${records.length}`}
          date={today}
          label={`Session ${records.length + 1}`}
          {...plannedFor((records.length + 1) as 1 | 2)}
        />
      )}
      <SpacingIndicator records={records} />
    </div>
  )
}
