import { WATER_TARGET_OZ } from '@/lib/logic/constants'

export function isWaterTargetMet(volumeOz: number): boolean {
  return volumeOz >= WATER_TARGET_OZ
}

export function clampWaterVolume(volumeOz: number): number {
  return Math.max(0, volumeOz)
}
