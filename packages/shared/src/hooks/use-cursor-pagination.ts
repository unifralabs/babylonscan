import { useCallback, useMemo, useRef, useState } from 'react'

export default function useCursorPagination<T = Record<string, unknown>>() {
  const [currentPage, setCurrentPage] = useState(1)
  const [cursor, setCursor] = useState<T>()
  const [nextCursor, setNextCursor] = useState<T>()
  const cursorsRef = useRef<(typeof cursor)[]>([undefined])

  const hasNextPage = useMemo(() => !!nextCursor, [nextCursor])
  const hasPreviousPage = useMemo(
    () => 2 === currentPage || !!cursorsRef.current?.[currentPage - 2],
    [currentPage],
  )

  const fetchFirstPage = useCallback(() => {
    setCursor(undefined)
    setCurrentPage(1)
    cursorsRef.current = [undefined]
  }, [])

  const fetchPreviousPage = useCallback(() => {
    if (2 === currentPage) {
      fetchFirstPage()
      return
    }
    setCursor(cursorsRef.current?.[currentPage - 2])
    setCurrentPage(pre => --pre)
  }, [currentPage, fetchFirstPage])

  const fetchNextPage = useCallback(() => {
    if (!!nextCursor) {
      setCursor(nextCursor)
      cursorsRef.current = [...cursorsRef.current, nextCursor]
      setCurrentPage(pre => ++pre)
    }
  }, [nextCursor])

  return {
    currentPage,
    setCurrentPage,
    cursor,
    setCursor,
    nextCursor,
    setNextCursor,
    hasNextPage,
    hasPreviousPage,
    cursorsRef,
    fetchFirstPage,
    fetchPreviousPage,
    fetchNextPage,
  }
}
