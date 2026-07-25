import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'

interface PhotoPreviewProps {
  blob: Blob
  onRetake: () => void
  onUse: () => void
}

export function PhotoPreview({ blob, onRetake, onUse }: PhotoPreviewProps) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    const objectUrl = URL.createObjectURL(blob)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [blob])

  return (
    <div className="flex flex-col gap-4">
      {url && (
        <img src={url} alt="Captured progress" className="aspect-[3/4] w-full rounded-2xl object-cover" />
      )}
      <div className="flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={onRetake}>
          Retake
        </Button>
        <Button className="flex-1" onClick={onUse}>
          Use Photo
        </Button>
      </div>
    </div>
  )
}
