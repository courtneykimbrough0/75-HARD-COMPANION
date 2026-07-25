import { WATER_TARGET_OZ } from '@/lib/logic/constants'

interface WaterProgressRingProps {
  volumeOz: number
}

const SIZE = 200
const STROKE = 16
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function WaterProgressRing({ volumeOz }: WaterProgressRingProps) {
  const pct = Math.min(1, volumeOz / WATER_TARGET_OZ)
  const offset = CIRCUMFERENCE * (1 - pct)
  const met = volumeOz >= WATER_TARGET_OZ

  return (
    <div className="relative mx-auto" style={{ width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} className="-rotate-90">
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="#1f2937"
          strokeWidth={STROKE}
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={met ? '#22c55e' : '#38bdf8'}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white">{volumeOz}</span>
        <span className="text-sm text-gray-500">of {WATER_TARGET_OZ} oz</span>
      </div>
    </div>
  )
}
