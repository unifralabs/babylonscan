'use client'

import { ReactNode } from 'react'

import { Button } from '../common/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { cn } from '@cosmoscan/shared/utils'

export interface CursorPaginationProps {
  classNames?: { root?: string; pagination?: string }
  content?: ReactNode
  currentPage: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  isLoading: boolean
  hideSinglePage?: boolean
  fetchFirstPage: () => void
  fetchPreviousPage: () => void
  fetchNextPage: () => void
}

const buttonClassName = 'h-7 px-2 py-1 md:h-10 md:px-4 md:py-2'
const iconButtonClassName = 'size-7 md:size-10'

export default function CursorPagination({
  classNames,
  content,
  currentPage,
  hasNextPage,
  hasPreviousPage,
  isLoading,
  hideSinglePage = false,
  fetchFirstPage,
  fetchPreviousPage,
  fetchNextPage,
}: CursorPaginationProps) {
  const t = useTranslations('Common')

  if (hideSinglePage && 1 === currentPage && !hasNextPage) {
    return null
  }

  return (
    <div
      className={cn(
        'flex w-full flex-col gap-4 md:flex-row md:items-center',
        !!content ? 'justify-between' : 'justify-end',
        classNames?.root,
      )}
    >
      {content}

      <div
        className={cn(
          'flex-items-c justify-end gap-2 md:gap-4',
          !content && 'w-full',
          classNames?.pagination,
        )}
      >
        <Button
          className={buttonClassName}
          variant="secondaryOutlineGhost"
          disabled={isLoading || 1 === currentPage}
          onClick={fetchFirstPage}
        >
          {t('first')}
        </Button>

        <Button
          className={iconButtonClassName}
          variant="secondaryOutlineGhost"
          size="icon"
          disabled={isLoading || !hasPreviousPage}
          onClick={fetchPreviousPage}
        >
          <ChevronLeft size={16} />
        </Button>

        <div
          className={cn(
            'border-foreground flex-c rounded-md border text-sm',
            buttonClassName,
          )}
        >
          {t('pageNum', { pageNum: currentPage + '' })}
        </div>

        <Button
          className={iconButtonClassName}
          variant="secondaryOutlineGhost"
          size="icon"
          disabled={isLoading || !hasNextPage}
          onClick={fetchNextPage}
        >
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  )
}
