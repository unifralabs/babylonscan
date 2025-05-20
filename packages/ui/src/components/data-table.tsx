'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'

import { Skeleton } from '../common/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../common/table'
import CursorPagination, { CursorPaginationProps } from './cursor-pagination'
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  OnChangeFn,
  Row,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { Search } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { CONSTANT } from '@cosmoscan/shared/constants/common'
import useIsMobile from '@cosmoscan/shared/hooks/use-is-mobile'
import { cn } from '@cosmoscan/shared/utils'

export interface DataTableProps<TData, TValue> {
  classNames?: {
    root?: string
    tableRoot?: string
    table?: string
  }
  paginationProps?: CursorPaginationProps
  filterComponent?: React.ReactNode
  columns: ColumnDef<TData, TValue>[]
  data?: TData[]
  sorting?: SortingState
  setSorting?: OnChangeFn<SortingState>
  columnFilters?: ColumnFiltersState
  setColumnFilters?: OnChangeFn<ColumnFiltersState>
  onRowClick?: (row: Row<TData>) => void
  emptyText?: string
  autoEmptyCellHeight?: boolean
  isLoading?: boolean
  pageSize?: number
  isRowHoverable?: boolean
  isRowBordered?: boolean
  maxHeight?: number | string
  onScrollBottom?: () => void
}

export default function DataTable<TData, TValue>({
  classNames,
  paginationProps,
  filterComponent,
  data = [],
  sorting,
  setSorting,
  columnFilters,
  setColumnFilters,
  columns,
  onRowClick,
  emptyText,
  autoEmptyCellHeight = true,
  isLoading = false,
  pageSize = CONSTANT.tableDefaultPageSize,
  isRowHoverable = false,
  isRowBordered = false,
  maxHeight,
  onScrollBottom,
}: DataTableProps<TData, TValue>) {
  const t = useTranslations('Common')
  const isMobile = useIsMobile()
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualFiltering: true,
    state: { sorting, columnFilters },
    enableSorting: !isLoading,
    enableColumnFilters: !isLoading,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
  })

  const scrollRef = useRef<HTMLTableElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  const onScroll = useCallback(
    ({ target }: any) => {
      if (!onScrollBottom || isLoading) return

      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(function () {
        if (!target) return
        const { scrollTop, scrollHeight, clientHeight } = target
        const isReachBottom =
          Math.ceil(scrollTop + clientHeight) >= scrollHeight - 50
        isReachBottom && onScrollBottom()
      }, 200)
    },
    [isLoading, onScrollBottom],
  )

  useEffect(() => {
    if (!!maxHeight) {
      const scrollEl = scrollRef.current
      scrollEl?.addEventListener('scroll', onScroll)
      return () => scrollEl?.removeEventListener('scroll', onScroll)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxHeight])

  const renderMobileTable = useMemo(() => {
    const wrapperClassName = cn(
      'border-border-light grid w-full grid-cols-2 gap-x-2 gap-y-4 border-b px-2 py-6 last:border-b-0',
      1 === paginationProps?.currentPage &&
        !!!paginationProps?.hasNextPage &&
        'first:pt-2 last:pb-2',
      !!onRowClick && 'hover:bg-secondary transition-colors',
    )
    const labelClassName = 'text-foreground-secondary/80 mb-px'

    return isLoading ? (
      [...Array(pageSize)].map((_, index) => (
        <div key={index} className={wrapperClassName}>
          {[...Array(columns.length)].map((_, cIndex) => (
            <div
              key={`${index}-${cIndex}`}
              className={cn(
                columns[cIndex]?.meta?.isMobileFullRow && 'col-span-2',
              )}
            >
              <div className={labelClassName}>
                {flexRender(
                  columns[cIndex].header,
                  table
                    ?.getHeaderGroups?.()?.[0]
                    ?.headers?.[cIndex]?.getContext() as any,
                )}
              </div>
              <Skeleton className="h-6 w-4/5" />
            </div>
          ))}
        </div>
      ))
    ) : !!table.getRowModel().rows?.length ? (
      <div>
        {table.getRowModel().rows.map(row => (
          <div
            key={row.id}
            className={wrapperClassName}
            onClick={() => onRowClick?.(row)}
          >
            {row.getVisibleCells().map((cell, index) => {
              return (
                <div
                  key={cell.id}
                  className={cn(
                    cell.column.columnDef.meta?.isMobileFullRow && 'col-span-2',
                  )}
                >
                  <div className={labelClassName}>
                    {flexRender(
                      cell.column.columnDef.header,
                      table.getHeaderGroups()[0].headers[index].getContext(),
                    )}
                  </div>
                  {isLoading ? (
                    <Skeleton className="h-6 w-4/5" />
                  ) : (
                    <div>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    ) : (
      <div
        style={{
          height:
            autoEmptyCellHeight && !!paginationProps
              ? `calc(${pageSize / 2} * 4rem)`
              : 'auto',
        }}
        className="flex-c min-h-40 gap-3"
      >
        <Search size={14} />
        {emptyText || t('noData')}
      </div>
    )
  }, [
    t,
    isLoading,
    pageSize,
    table,
    autoEmptyCellHeight,
    paginationProps,
    emptyText,
    columns,
    onRowClick,
  ])

  return (
    <div
      className={cn(
        'flex w-full flex-col gap-0 md:gap-4 md:py-2',
        classNames?.root,
      )}
    >
      {(!!paginationProps || filterComponent) && (
        <div className="border-border-light flex flex-col gap-4 border-b pb-4 md:flex-row md:items-center md:justify-between md:border-0 md:pb-0">
          {filterComponent && (
            <div className="order-first">{filterComponent}</div>
          )}
          {!!paginationProps && (
            <div className={cn(!filterComponent && 'w-full', 'ml-auto')}>
              <CursorPagination
                {...paginationProps}
                hideSinglePage={
                  undefined === paginationProps?.hideSinglePage
                    ? isMobile
                    : paginationProps?.hideSinglePage
                }
                classNames={{
                  ...paginationProps.classNames,
                  root: cn(
                    'flex justify-end',
                    paginationProps.classNames?.root,
                  ),
                }}
              />
            </div>
          )}
        </div>
      )}

      {isMobile ? (
        renderMobileTable
      ) : (
        <Table
          ref={scrollRef}
          rootStyle={{
            maxHeight:
              typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
          }}
          rootClassName={cn(
            classNames?.tableRoot,
            isLoading ? 'overflow-hidden' : 'overflow-auto',
          )}
          className={classNames?.table}
        >
          <TableHeader
            className={cn(!!maxHeight && 'sticky top-0 z-10 backdrop-blur')}
          >
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id} isBordered={isRowBordered}>
                {headerGroup.headers.map(header => (
                  <TableHead
                    key={header.id}
                    style={{
                      width:
                        header.getSize() !== 150 ? header.getSize() : undefined,
                      textAlign: header.column.columnDef.meta?.textAlign,
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(pageSize)].map((_, index) => (
                <TableRow key={index} isBordered={isRowBordered}>
                  {[...Array(columns.length)].map((_, cIndex) => (
                    <TableCell
                      key={`${index}-${cIndex}`}
                      style={{
                        textAlign:
                          table.getHeaderGroups()?.[0]?.headers?.[cIndex]
                            ?.column.columnDef.meta?.textAlign,
                      }}
                    >
                      <Skeleton className="inline-block h-7 w-3/5 rounded-md" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : !!table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  className={cn(!!onRowClick && 'cursor-pointer')}
                  onClick={() => onRowClick?.(row)}
                  isHoverable={!!onRowClick ? true : isRowHoverable}
                  isBordered={isRowBordered}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell
                      key={cell.id}
                      style={{
                        textAlign: cell.column.columnDef.meta?.textAlign,
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow isBordered={isRowBordered}>
                <TableCell
                  style={{
                    height:
                      autoEmptyCellHeight && !!paginationProps
                        ? `calc(${pageSize / 2} * 4rem)`
                        : 'auto',
                  }}
                  colSpan={columns.length}
                >
                  <div className="flex-c min-h-40 gap-3">
                    <Search size={14} />
                    {emptyText || t('noData')}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      {!!paginationProps && !filterComponent && (
        <CursorPagination
          {...paginationProps}
          content={undefined}
          classNames={{
            root: cn(
              paginationProps?.classNames?.root,
              'border-border-light border-t pt-4 md:border-0',
            ),
            pagination: paginationProps?.classNames?.pagination,
          }}
          hideSinglePage={
            undefined === paginationProps?.hideSinglePage
              ? isMobile
              : paginationProps?.hideSinglePage
          }
        />
      )}
    </div>
  )
}
