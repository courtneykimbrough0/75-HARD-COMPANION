import type { WorkoutScheduleDay } from '@/types'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const INPUT_CLASS =
  'w-full rounded-lg bg-gray-800 px-2 py-1.5 text-xs text-gray-100 placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500'

interface WorkoutScheduleTableProps {
  days: WorkoutScheduleDay[]
  onChange: (days: WorkoutScheduleDay[]) => void
}

export function WorkoutScheduleTable({ days, onChange }: WorkoutScheduleTableProps) {
  const updateDay = (index: number, patch: Partial<WorkoutScheduleDay>) => {
    onChange(days.map((d, i) => (i === index ? { ...d, ...patch } : d)))
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-400">Scheduled Workouts</label>
      <div className="flex flex-col gap-3">
        {days.map((day, index) => (
          <div key={day.dayOfWeek} className="rounded-xl bg-gray-900 p-3">
            <p className="mb-2 text-xs font-semibold text-gray-500">{DAY_NAMES[day.dayOfWeek]}</p>
            <div className="grid grid-cols-2 gap-3">
              <WorkoutSlotInputs
                label="Workout 1"
                type={day.workout1Type}
                location={day.workout1Location}
                time={day.workout1TargetTime}
                onType={(v) => updateDay(index, { workout1Type: v })}
                onLocation={(v) => updateDay(index, { workout1Location: v })}
                onTime={(v) => updateDay(index, { workout1TargetTime: v })}
              />
              <WorkoutSlotInputs
                label="Workout 2"
                type={day.workout2Type}
                location={day.workout2Location}
                time={day.workout2TargetTime}
                onType={(v) => updateDay(index, { workout2Type: v })}
                onLocation={(v) => updateDay(index, { workout2Location: v })}
                onTime={(v) => updateDay(index, { workout2TargetTime: v })}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface WorkoutSlotInputsProps {
  label: string
  type: string
  location: string
  time: string
  onType: (v: string) => void
  onLocation: (v: string) => void
  onTime: (v: string) => void
}

function WorkoutSlotInputs({
  label,
  type,
  location,
  time,
  onType,
  onLocation,
  onTime,
}: WorkoutSlotInputsProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] font-medium text-gray-500">{label}</span>
      <input
        className={INPUT_CLASS}
        placeholder="Type"
        value={type}
        onChange={(e) => onType(e.target.value)}
      />
      <input
        className={INPUT_CLASS}
        placeholder="Location"
        value={location}
        onChange={(e) => onLocation(e.target.value)}
      />
      <input
        className={INPUT_CLASS}
        type="time"
        value={time}
        onChange={(e) => onTime(e.target.value)}
      />
    </div>
  )
}
