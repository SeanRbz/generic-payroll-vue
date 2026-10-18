/** Length of a bar as a percentage of its axis maximum, clamped to 0-100 (0 when there is no scale). */
export function percentOf(value: number, max: number): number {
  if (!Number.isFinite(value) || !(max > 0)) return 0
  return Math.min(100, Math.max(0, (value / max) * 100))
}

/** How far `current` has fallen below `previous`, as a percentage of `previous` (negative when it grew). */
export function percentReduction(previous: number, current: number): number {
  if (!Number.isFinite(previous) || !Number.isFinite(current) || !(previous > 0)) return 0
  return ((previous - current) / previous) * 100
}
