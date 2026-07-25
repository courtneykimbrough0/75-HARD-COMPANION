import { Camera } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import {
  captureFrameToBlob,
  isCameraNotFoundError,
  isCameraPermissionError,
  startCameraStream,
  stopCameraStream,
} from '@/lib/camera'

interface CameraViewProps {
  onCapture: (blob: Blob) => void
}

export function CameraView({ onCapture }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    startCameraStream()
      .then((stream) => {
        if (cancelled) {
          stopCameraStream(stream)
          return
        }
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream
      })
      .catch((err) => {
        if (isCameraPermissionError(err)) {
          setError('Camera access was denied. Allow camera permission in your browser settings.')
        } else if (isCameraNotFoundError(err)) {
          setError('No camera was found on this device.')
        } else {
          setError('Unable to start the camera.')
        }
      })

    return () => {
      cancelled = true
      stopCameraStream(streamRef.current)
      streamRef.current = null
    }
  }, [])

  const handleCapture = async () => {
    if (!videoRef.current) return
    const blob = await captureFrameToBlob(videoRef.current)
    onCapture(blob)
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-gray-900 p-8 text-center">
        <Camera size={32} className="text-gray-600" />
        <p className="text-sm text-gray-400">{error}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="aspect-[3/4] w-full rounded-2xl bg-black object-cover"
      />
      <Button onClick={() => void handleCapture()} className="w-full">
        <Camera size={18} className="mr-2 inline" /> Capture Photo
      </Button>
    </div>
  )
}
