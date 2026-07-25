import type { DailyLog } from '@/types'

interface ComplianceCalendarProps {
  logs: DailyLog[]
}

const STATUS_CLASSES: Record<DailyLog['status'], string> = {
  pass: 'bg-green-500/80 text-white',
  fail: 'bg-red-500/80 text-white',
  pending: 'bg-gray-800 text-gray-500',
}

export function ComplianceCalendar({ logs }: ComplianceCalendarProps) {
  if (logs.length === 0) {
    return <p className="text-sm text-gray-500">No days logged yet.</p>
  }

  return (
    <div className="grid grid-cols-7 gap-2">
      {logs.map((log) => (
        <div
          key={log.date}
          title={`${log.date} — Day ${log.dayNumber} — ${log.status}`}
          className={`flex aspect-square flex-col items-center justify-center rounded-lg text-xs ${STATUS_CLASSES[log.status]}`}
        >
          <span className="font-semibold">{log.dayNumber}</span>
        </div>
      ))}
    </div>
  )
}
