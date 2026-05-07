export function omit(
  obj: Record<string, unknown>,
  keys: string[],
): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const key in obj) {
    if (!keys.includes(key)) {
      result[key] = obj[key]
    }
  }
  return result
}

export function clamp(
    val: number,
    bounds?: { min?: number, max?: number},
    allowFloats?: boolean ): number {
  let clamped = val
  if (!allowFloats) clamped = Math.floor(clamped)
  if (bounds?.min !== undefined) clamped = Math.max(bounds?.min, clamped)
  if (bounds?.max !== undefined) clamped = Math.min(bounds?.max, clamped)
  return clamped
}
