import { SpacingIndicator } from '@/components/workouts/SpacingIndicator'
import { WorkoutSessionCard } from '@/components/workouts/WorkoutSessionCard'
import { useWorkoutsForDate } from '@/db/hooks'
import { todayLocalDateString } from '@/lib/logic/dateUtils'

const today = todayLocalDateString()

export default function Workouts() {
  const records = useWorkoutsForDate(today) ?? []

  return (
    <div className="flex flex-col gap-4 animate-page-enter">
      <h1 className="text-xl font-semibold text-white">Workouts</h1>
      {records.map((record, i) => (
        <WorkoutSessionCard
          key={record.id}
          date={today}
          label={`Session ${i + 1}`}
          record={record}
        />
      ))}
      {records.length < 2 && (
        <WorkoutSessionCard
          key={`next-${records.length}`}
          date={today}
          label={`Session ${records.length + 1}`}
        />
      )}
      <SpacingIndicator records={records} />
    </div>
  )
}
