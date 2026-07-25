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
      <svg
        width={SIZE}
        height={SIZE}
        className={`-rotate-90 transition-all duration-500 ${
          met
            ? 'drop-shadow-[0_0_16px_rgba(34,197,94,0.35)]'
            : 'drop-shadow-[0_0_16px_rgba(56,189,248,0.3)]'
        }`}
      >
        <defs>
          <linearGradient id="waterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <linearGradient id="waterMetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>
        </defs>
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.03)"
          strokeWidth={STROKE}
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={met ? 'url(#waterMetGrad)' : 'url(#waterGrad)'}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-extrabold text-white">{volumeOz}</span>
        <span className="text-xs uppercase tracking-wider text-gray-400 font-bold mt-1">of {WATER_TARGET_OZ} oz</span>
      </div>
    </div>
  )
}
