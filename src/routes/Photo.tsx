import { Check } from 'lucide-react'
import { useState } from 'react'
import { CameraView } from '@/components/photo/CameraView'
import { PhotoPreview } from '@/components/photo/PhotoPreview'
import { useTodayPhoto } from '@/db/hooks'
import { savePhotoBlob } from '@/db/repository'
import { todayLocalDateString } from '@/lib/logic/dateUtils'

const today = todayLocalDateString()

export default function Photo() {
  const existingPhoto = useTodayPhoto(today)
  const [pendingBlob, setPendingBlob] = useState<Blob | null>(null)

  const handleUse = async () => {
    if (!pendingBlob) return
    await savePhotoBlob(today, pendingBlob)
    setPendingBlob(null)
  }

  return (
    <div className="flex flex-col gap-4 animate-page-enter">
      <h1 className="text-xl font-semibold text-white">Progress Photo</h1>

      {existingPhoto && !pendingBlob && (
        <div className="flex items-center gap-2 rounded-xl bg-green-950/60 border border-green-800 px-4 py-3 text-sm text-green-300">
          <Check size={16} /> Today's photo has been saved. Retake below to replace it.
        </div>
      )}

      {pendingBlob ? (
        <PhotoPreview
          blob={pendingBlob}
          onRetake={() => setPendingBlob(null)}
          onUse={() => void handleUse()}
        />
      ) : (
        <CameraView onCapture={setPendingBlob} />
      )}
    </div>
  )
}
