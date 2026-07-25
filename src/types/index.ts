export type DateString = string // YYYY-MM-DD, local calendar date
export type DayStatus = 'pending' | 'pass' | 'fail'

export interface DailyLog {
  date: DateString
  dayNumber: number
  workout1Complete: boolean
  workout2Complete: boolean
  waterTargetComplete: boolean
  readingTargetComplete: boolean
  dietCompliant: boolean
  photoCaptured: boolean
  status: DayStatus
  workoutsSpacingOverridden?: boolean
  createdAt: number
  updatedAt: number
}

export type ChecklistFlag =
  | 'workout1Complete'
  | 'workout2Complete'
  | 'waterTargetComplete'
  | 'readingTargetComplete'
  | 'dietCompliant'
  | 'photoCaptured'
  | 'workoutsSpacingOverridden'

export interface WorkoutRecord {
  id?: number
  date: DateString
  sessionNumber: 1 | 2
  startTime: number // epoch ms
  endTime: number | null // null while the timer is running
  isOutdoor: boolean
  durationSeconds: number
}

export interface WaterLog {
  date: DateString
  volumeOz: number
  lastUpdated: number
}

export interface PhotoRecord {
  date: DateString
  blob: Blob
  capturedAt: number
  mimeType: string
}

export interface WorkoutScheduleDay {
  dayOfWeek: number // 0 (Sun) - 6 (Sat)
  workout1Type: string
  workout1Location: string
  workout1TargetTime: string // "HH:MM"
  workout2Type: string
  workout2Location: string
  workout2TargetTime: string // "HH:MM"
}

export interface MealScheduleDay {
  dayOfWeek: number // 0 (Sun) - 6 (Sat)
  meal1: string
  meal2: string
  meal3: string
  snacks: string
}

export interface WeeklyPlan {
  weekStartDate: DateString
  weekEndDate: DateString
  mealPlanText: string
  scheduledWorkouts: WorkoutScheduleDay[]
  scheduledMeals?: MealScheduleDay[]
  updatedAt: number
}

export interface AppMeta {
  currentDayCounter: number
  cycleStartDate: DateString
  lastEvaluatedDate: DateString | null
  pendingResetReason: string | null
}

export interface AppMetaRow<K extends keyof AppMeta = keyof AppMeta> {
  key: K
  value: AppMeta[K]
}
