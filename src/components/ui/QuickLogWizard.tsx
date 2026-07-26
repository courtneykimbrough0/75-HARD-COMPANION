import { useState } from 'react'
import { X, Droplet, Dumbbell, BookOpen, Utensils, Camera, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTodayLog, useTodayWater } from '@/db/hooks'
import { addWaterIncrement, quickCompleteWorkoutSession, setChecklistFlag } from '@/db/repository'
import { todayLocalDateString } from '@/lib/logic/dateUtils'
import { ProgressBar } from '@/components/ui/ProgressBar'

interface QuickLogWizardProps {
  isOpen: boolean
  onClose: () => void
}

export function QuickLogWizard({ isOpen, onClose }: QuickLogWizardProps) {
  const today = todayLocalDateString()
  const log = useTodayLog(today)
  const water = useTodayWater(today)

  const [waterMode, setWaterMode] = useState<'add' | 'sub'>('add')

  if (!isOpen || !log) return null

  const waterVolume = water?.volumeOz ?? 0
  const isWorkout1Done = log.workout1Complete
  const isWorkout2Done = log.workout2Complete

  return (
    <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-page-enter">
      <div className="relative w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-white/10 bg-gray-950/95 p-6 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.8)] max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
          <div>
            <h3 className="font-bold text-white text-base">Quick Log Action Sheet</h3>
            <p className="text-xs text-gray-400">Update today's entries with one tap</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-5">
          {/* Section 1: Water Intake */}
          <div className="flex flex-col gap-2.5 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <Droplet size={16} className="text-blue-400" />
                  <span className="text-xs font-bold text-gray-200">Water Intake</span>
                </div>
                <div className="flex rounded-lg bg-white/5 p-0.5 border border-white/5">
                  <button
                    onClick={() => setWaterMode('add')}
                    className={`px-2 py-0.5 text-[9px] font-bold rounded-md transition-all cursor-pointer ${
                      waterMode === 'add' ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setWaterMode('sub')}
                    className={`px-2 py-0.5 text-[9px] font-bold rounded-md transition-all cursor-pointer ${
                      waterMode === 'sub' ? 'bg-red-500/20 border border-red-500/20 text-red-300 shadow-sm' : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    Remove
                  </button>
                </div>
              </div>
              <span className="text-xs font-bold text-blue-400">{waterVolume} / 128 oz</span>
            </div>
            <ProgressBar
              value={waterVolume}
              max={128}
              colorClassName={waterVolume >= 128 ? 'bg-green-500' : 'bg-blue-500'}
            />
            <div className="grid grid-cols-4 gap-1.5 mt-1">
              {[8, 16, 24, 32].map((oz) => (
                <button
                  key={oz}
                  onClick={() => void addWaterIncrement(today, waterMode === 'add' ? oz : -oz)}
                  className={`py-1.5 text-[11px] font-bold rounded-xl border transition-all active:scale-95 cursor-pointer ${
                    waterMode === 'add'
                      ? 'bg-white/5 border-white/5 hover:bg-white/10 text-gray-300'
                      : 'bg-red-950/20 border-red-900/30 hover:bg-red-950/30 text-red-300 hover:text-red-200'
                  }`}
                >
                  {waterMode === 'add' ? `+${oz}` : `-${oz}`}oz
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Workouts */}
          <div className="flex flex-col gap-2.5 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 mb-1">
              <Dumbbell size={16} className="text-purple-400" />
              <span className="text-xs font-bold text-gray-200">Workout Sessions (45 min)</span>
            </div>

            {/* Session 1 */}
            <div className="flex items-center justify-between py-1 border-b border-white/5 pb-2">
              <span className="text-xs font-medium text-gray-300">Session 1</span>
              {isWorkout1Done ? (
                <span className="flex items-center gap-1 text-xs font-bold text-green-400">
                  <CheckCircle2 size={14} /> Logged
                </span>
              ) : (
                <div className="flex gap-1.5">
                  <button
                    onClick={() => void quickCompleteWorkoutSession(today, true)}
                    className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 text-purple-300 cursor-pointer transition-all active:scale-95"
                  >
                    Outdoor
                  </button>
                  <button
                    onClick={() => void quickCompleteWorkoutSession(today, false)}
                    className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-gray-300 cursor-pointer transition-all active:scale-95"
                  >
                    Indoor
                  </button>
                </div>
              )}
            </div>

            {/* Session 2 */}
            <div className="flex items-center justify-between py-1 pt-2">
              <span className="text-xs font-medium text-gray-300">Session 2</span>
              {isWorkout2Done ? (
                <span className="flex items-center gap-1 text-xs font-bold text-green-400">
                  <CheckCircle2 size={14} /> Logged
                </span>
              ) : (
                <div className="flex gap-1.5">
                  <button
                    onClick={() => void quickCompleteWorkoutSession(today, true)}
                    className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 text-purple-300 cursor-pointer transition-all active:scale-95"
                  >
                    Outdoor
                  </button>
                  <button
                    onClick={() => void quickCompleteWorkoutSession(today, false)}
                    className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-gray-300 cursor-pointer transition-all active:scale-95"
                  >
                    Indoor
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Habits */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => void setChecklistFlag(today, 'readingTargetComplete', !log.readingTargetComplete)}
              className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer active:scale-95 ${
                log.readingTargetComplete
                  ? 'border-green-500/20 bg-green-500/10 text-green-300'
                  : 'border-white/5 bg-white/[0.02] text-gray-300 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <BookOpen size={16} className={log.readingTargetComplete ? 'text-green-400' : 'text-gray-400'} />
                <span className="text-xs font-bold">10 Pages</span>
              </div>
              {log.readingTargetComplete && <CheckCircle2 size={16} className="text-green-400" />}
            </button>

            <button
              onClick={() => void setChecklistFlag(today, 'dietCompliant', !log.dietCompliant)}
              className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer active:scale-95 ${
                log.dietCompliant
                  ? 'border-green-500/20 bg-green-500/10 text-green-300'
                  : 'border-white/5 bg-white/[0.02] text-gray-300 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <Utensils size={16} className={log.dietCompliant ? 'text-green-400' : 'text-gray-400'} />
                <span className="text-xs font-bold">Strict Diet</span>
              </div>
              {log.dietCompliant && <CheckCircle2 size={16} className="text-green-400" />}
            </button>
          </div>

          {/* Section 4: Progress Photo Link */}
          <Link
            to="/photo"
            onClick={onClose}
            className="flex items-center justify-between p-3.5 rounded-2xl border border-purple-500/20 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 transition-all cursor-pointer active:scale-95"
          >
            <div className="flex items-center gap-2.5">
              <Camera size={18} className="text-purple-400" />
              <span className="text-xs font-bold">Take Progress Photo</span>
            </div>
            <span className="text-xs text-purple-400 font-bold">{log.photoCaptured ? 'Saved ✓' : 'Add Photo →'}</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
