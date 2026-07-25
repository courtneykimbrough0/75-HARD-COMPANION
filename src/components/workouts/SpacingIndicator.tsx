import { validateOutdoorRequirement, validateWorkoutSpacing } from '@/lib/logic/workoutValidators'
import type { WorkoutRecord } from '@/types'

interface SpacingIndicatorProps {
  records: WorkoutRecord[]
}

export function SpacingIndicator({ records }: SpacingIndicatorProps) {
  const completed = records.filter((r) => r.endTime != null)
  if (completed.length < 2) return null

  const [first, second] = [...completed].sort((a, b) => a.startTime - b.startTime)
  const spacingOk = validateWorkoutSpacing(first, second)
  const outdoorOk = validateOutdoorRequirement(first, second)

  if (spacingOk && outdoorOk) {
    return (
      <div className="rounded-xl border border-green-800 bg-green-950/60 px-4 py-3 text-sm text-green-300">
        Both sessions meet the 3-hour spacing and outdoor requirement.
      </div>
    )
  }

  const issues: string[] = []
  if (!spacingOk) issues.push('Sessions must be at least 3 hours apart.')
  if (!outdoorOk) issues.push('At least one session must be outdoor.')

  return (
    <div className="rounded-xl border border-amber-800 bg-amber-950/60 px-4 py-3 text-sm text-amber-300">
      {issues.join(' ')}
    </div>
  )
}
