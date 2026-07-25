const MAX_LONG_EDGE_PX = 1080
const JPEG_QUALITY = 0.85

export async function startCameraStream(): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'user' },
    audio: false,
  })
}

export function stopCameraStream(stream: MediaStream | null): void {
  stream?.getTracks().forEach((track) => track.stop())
}

export function captureFrameToBlob(video: HTMLVideoElement): Promise<Blob> {
  const { videoWidth, videoHeight } = video
  const longEdge = Math.max(videoWidth, videoHeight)
  const scale = longEdge > MAX_LONG_EDGE_PX ? MAX_LONG_EDGE_PX / longEdge : 1

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(videoWidth * scale)
  canvas.height = Math.round(videoHeight * scale)

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context unavailable')
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Failed to capture photo'))),
      'image/jpeg',
      JPEG_QUALITY,
    )
  })
}

export function isCameraPermissionError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'NotAllowedError'
}

export function isCameraNotFoundError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'NotFoundError'
}
