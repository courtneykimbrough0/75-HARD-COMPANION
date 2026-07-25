import { useEffect, useRef, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Toggle } from '@/components/ui/Toggle'
import { WorkoutTimer, type TimerPhase } from '@/components/workouts/WorkoutTimer'
import {
  startWorkoutSession,
  stopWorkoutSession,
  deleteWorkoutSession,
  quickCompleteWorkoutSession,
} from '@/db/repository'
import { WORKOUT_MIN_MINUTES } from '@/lib/logic/constants'
import type { DateString, WorkoutRecord } from '@/types'

interface WorkoutSessionCardProps {
  date: DateString
  label: string
  record?: WorkoutRecord
}

export function WorkoutSessionCard({ date, label, record }: WorkoutSessionCardProps) {
  const [isOutdoor, setIsOutdoor] = useState(false)
  const [phase, setPhase] = useState<TimerPhase>(
    record ? (record.endTime ? 'stopped' : 'running') : 'idle',
  )
  const [, forceTick] = useState(0)

  const activeIdRef = useRef<number | undefined>(record?.id)
  const startTimeRef = useRef<number>(record?.startTime ?? 0)
  const pausedMsRef = useRef(0)
  const pauseStartedAtRef = useRef<number | null>(null)

  useEffect(() => {
    if (record) {
      setPhase(record.endTime ? 'stopped' : 'running')
      activeIdRef.current = record.id
      startTimeRef.current = record.startTime
    } else {
      setPhase('idle')
      activeIdRef.current = undefined
      startTimeRef.current = 0
    }
  }, [record])

  useEffect(() => {
    if (phase !== 'running') return
    const id = setInterval(() => forceTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [phase])

  if (record?.endTime != null) {
    const met = record.durationSeconds >= WORKOUT_MIN_MINUTES * 60
    const handleDelete = async () => {
      if (record.id != null) {
        await deleteWorkoutSession(record.id)
      }
    }
    return (
      <div className="rounded-2xl bg-gray-900 p-5">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-200">{label}</span>
          <div className="flex items-center gap-3">
            <span className={`text-xs ${met ? 'text-green-400' : 'text-amber-400'}`}>
              {met ? 'Complete' : 'Under 45 min'}
            </span>
            <button
              onClick={() => void handleDelete()}
              className="text-gray-500 hover:text-red-400 p-1 rounded-lg transition-colors cursor-pointer"
              title="Delete session"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        <p className="mt-2 font-mono text-2xl text-white">
          {Math.floor(record.durationSeconds / 60)}:
          {String(record.durationSeconds % 60).padStart(2, '0')}
        </p>
        <p className="mt-1 text-xs text-gray-500">{record.isOutdoor ? 'Outdoor' : 'Indoor'}</p>
      </div>
    )
  }

  const elapsedSeconds =
    phase === 'paused' && pauseStartedAtRef.current != null
      ? Math.floor((pauseStartedAtRef.current - startTimeRef.current - pausedMsRef.current) / 1000)
      : phase === 'running'
        ? Math.floor((Date.now() - startTimeRef.current - pausedMsRef.current) / 1000)
        : 0

  const handleStart = async () => {
    const rec = await startWorkoutSession(date, isOutdoor)
    activeIdRef.current = rec.id
    startTimeRef.current = rec.startTime
    pausedMsRef.current = 0
    setPhase('running')
  }

  const handlePause = () => {
    pauseStartedAtRef.current = Date.now()
    setPhase('paused')
  }

  const handleResume = () => {
    if (pauseStartedAtRef.current != null) {
      pausedMsRef.current += Date.now() - pauseStartedAtRef.current
      pauseStartedAtRef.current = null
    }
    setPhase('running')
  }

  const handleStop = async () => {
    if (pauseStartedAtRef.current != null) {
      pausedMsRef.current += Date.now() - pauseStartedAtRef.current
      pauseStartedAtRef.current = null
    }
    const activeDurationSeconds = Math.floor(
      (Date.now() - startTimeRef.current - pausedMsRef.current) / 1000,
    )
    if (activeIdRef.current != null) {
      await stopWorkoutSession(activeIdRef.current, activeDurationSeconds)
    }
    setPhase('stopped')
  }

  const handleResetActiveSession = async () => {
    if (activeIdRef.current != null) {
      await deleteWorkoutSession(activeIdRef.current)
    }
    activeIdRef.current = undefined
    startTimeRef.current = 0
    pausedMsRef.current = 0
    pauseStartedAtRef.current = null
    setPhase('idle')
  }

  const handleQuickComplete = async () => {
    await quickCompleteWorkoutSession(date, isOutdoor)
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-gray-900 p-5">
      <div className="flex items-center justify-between">
        <span className="font-medium text-gray-200">{label}</span>
        {phase === 'idle' && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Outdoor</span>
            <Toggle checked={isOutdoor} onChange={setIsOutdoor} label="Outdoor workout" />
          </div>
        )}
        {(phase === 'running' || phase === 'paused') && (
          <button
            onClick={() => void handleResetActiveSession()}
            className="text-gray-500 hover:text-red-400 p-1 rounded-lg transition-colors text-xs flex items-center gap-1 cursor-pointer"
            title="Cancel session"
          >
            <Trash2 size={14} /> Cancel
          </button>
        )}
      </div>
      <WorkoutTimer
        phase={phase}
        elapsedSeconds={elapsedSeconds}
        onStart={() => void handleStart()}
        onPause={handlePause}
        onResume={handleResume}
        onStop={() => void handleStop()}
        onQuickComplete={() => void handleQuickComplete()}
      />
    </div>
  )
}
