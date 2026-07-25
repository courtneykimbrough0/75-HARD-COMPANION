import { ComplianceCalendar } from '@/components/history/ComplianceCalendar'
import { PhotoGallery } from '@/components/history/PhotoGallery'
import { useAllDailyLogs, useAllPhotos } from '@/db/hooks'

export default function History() {
  const logs = useAllDailyLogs() ?? []
  const photos = useAllPhotos() ?? []

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold text-white">History</h1>
        <p className="text-sm text-gray-500">Full lifetime log across every attempt.</p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-gray-400">Compliance Calendar</h2>
        <ComplianceCalendar logs={logs} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-gray-400">Progress Photos</h2>
        <PhotoGallery photos={photos} />
      </section>
    </div>
  )
}
