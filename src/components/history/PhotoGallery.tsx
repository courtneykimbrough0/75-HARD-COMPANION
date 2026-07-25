import { useEffect, useState } from 'react'
import { formatDisplayDate } from '@/lib/logic/dateUtils'
import type { PhotoRecord } from '@/types'

interface PhotoGalleryProps {
  photos: PhotoRecord[]
}

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [urls, setUrls] = useState<Record<string, string>>({})

  useEffect(() => {
    const nextUrls: Record<string, string> = {}
    for (const photo of photos) {
      nextUrls[photo.date] = URL.createObjectURL(photo.blob)
    }
    setUrls(nextUrls)
    return () => {
      Object.values(nextUrls).forEach((url) => URL.revokeObjectURL(url))
    }
  }, [photos])

  if (photos.length === 0) {
    return <p className="text-sm text-gray-500">No photos captured yet.</p>
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {photos.map((photo) => (
        <figure key={photo.date} className="flex flex-col gap-1">
          {urls[photo.date] && (
            <img
              src={urls[photo.date]}
              alt={`Progress photo ${photo.date}`}
              className="aspect-square w-full rounded-lg object-cover"
            />
          )}
          <figcaption className="text-center text-[10px] text-gray-500">
            {formatDisplayDate(photo.date)}
          </figcaption>
        </figure>
      ))}
    </div>
  )
}
