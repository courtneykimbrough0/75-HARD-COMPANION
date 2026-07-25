import { Pause, Play, Square } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { WORKOUT_MIN_MINUTES } from '@/lib/logic/constants'

export type TimerPhase = 'idle' | 'running' | 'paused' | 'stopped'

interface WorkoutTimerProps {
  phase: TimerPhase
  elapsedSeconds: number
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onStop: () => void
}

function formatClock(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export function WorkoutTimer({
  phase,
  elapsedSeconds,
  onStart,
  onPause,
  onResume,
  onStop,
}: WorkoutTimerProps) {
  const targetSeconds = WORKOUT_MIN_MINUTES * 60

  return (
    <div className="flex flex-col items-center gap-4">
      <span className="font-mono text-4xl font-bold text-white">
        {formatClock(elapsedSeconds)}
      </span>
      <div className="w-full">
        <ProgressBar
          value={elapsedSeconds}
          max={targetSeconds}
          colorClassName={elapsedSeconds >= targetSeconds ? 'bg-green-500' : 'bg-purple-500'}
        />
      </div>

      {phase === 'idle' && (
        <Button onClick={onStart} className="w-full">
          Start
        </Button>
      )}
      {phase === 'running' && (
        <div className="flex w-full gap-3">
          <Button variant="secondary" className="flex-1" onClick={onPause}>
            <Pause size={16} className="mr-1 inline" /> Pause
          </Button>
          <Button variant="danger" className="flex-1" onClick={onStop}>
            <Square size={16} className="mr-1 inline" /> Stop
          </Button>
        </div>
      )}
      {phase === 'paused' && (
        <div className="flex w-full gap-3">
          <Button variant="secondary" className="flex-1" onClick={onResume}>
            <Play size={16} className="mr-1 inline" /> Resume
          </Button>
          <Button variant="danger" className="flex-1" onClick={onStop}>
            <Square size={16} className="mr-1 inline" /> Stop
          </Button>
        </div>
      )}
    </div>
  )
}
