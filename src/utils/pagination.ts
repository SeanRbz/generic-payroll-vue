export type PageItem = number | 'ellipsis'

export interface Pagination {
  page: number
  pageSize: number
  total: number
}

export function getPageCount(total: number, pageSize: number): number {
  return Math.max(1, Math.ceil(total / pageSize))
}

/** 1-based inclusive record range shown on a page, e.g. page 1 of size 8 → { start: 1, end: 8 }. */
export function getPageRange(page: number, pageSize: number, total: number) {
  return {
    start: Math.min((page - 1) * pageSize + 1, total),
    end: Math.min(page * pageSize, total),
  }
}

/** Compact page list for the pager, e.g. [1, 2, 3, 'ellipsis', 19]. */
export function buildPageList(current: number, pageCount: number): PageItem[] {
  if (pageCount <= 5) return Array.from({ length: pageCount }, (_, index) => index + 1)
  if (current <= 3) return [1, 2, 3, 'ellipsis', pageCount]
  if (current >= pageCount - 2) return [1, 'ellipsis', pageCount - 2, pageCount - 1, pageCount]
  return [1, 'ellipsis', current - 1, current, current + 1, 'ellipsis', pageCount]
}
