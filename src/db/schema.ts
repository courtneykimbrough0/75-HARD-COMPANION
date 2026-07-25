import Dexie, { type EntityTable } from 'dexie'
import type {
  AppMetaRow,
  DailyLog,
  PhotoRecord,
  WaterLog,
  WeeklyPlan,
  WorkoutRecord,
} from '@/types'

export class SeventyFiveHardDB extends Dexie {
  dailyLogs!: EntityTable<DailyLog, 'date'>
  workoutRecords!: EntityTable<WorkoutRecord, 'id'>
  waterLogs!: EntityTable<WaterLog, 'date'>
  photos!: EntityTable<PhotoRecord, 'date'>
  weeklyPlans!: EntityTable<WeeklyPlan, 'weekStartDate'>
  appMeta!: EntityTable<AppMetaRow, 'key'>

  constructor() {
    super('75HardCompanion')
    this.version(1).stores({
      dailyLogs: 'date, dayNumber, status',
      workoutRecords: '++id, date, [date+sessionNumber]',
      waterLogs: 'date',
      photos: 'date',
      weeklyPlans: 'weekStartDate',
      appMeta: 'key',
    })
  }
}
