'use client'

import {
  PropsWithChildren,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react'

import { Button } from '../common/button'
import { Input } from '../common/input'
import { Popover, PopoverContent, PopoverTrigger } from '../common/popover'
import { ScrollArea } from '../common/scroll-area'
import { Column } from '@tanstack/react-table'
import { Check, ChevronDown, ChevronUp, Filter } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useMedia, useToggle } from 'react-use'

import useIsMobile from '@cosmoscan/shared/hooks/use-is-mobile'
import { cn } from '@cosmoscan/shared/utils'

const triggerWrapperClass =
  'flex-items-c hover:after:bg-accent relative cursor-pointer gap-2 after:absolute after:-left-3 after:-top-2 after:z-0 after:h-[calc(100%+1rem)] after:w-[calc(100%+1.5rem)] after:content-normal after:rounded-md after:transition-colors'

export type ReactTableSortHeaderProps<T> = PropsWithChildren<{
  column: Column<T>
}>

export function ReactTableSortHeader<T>({
  column,
  children,
}: ReactTableSortHeaderProps<T>) {
  const isMobile = useIsMobile()
  const sortedState = column.getIsSorted()
  const isSorted = !!sortedState
  const isDesc = isSorted && sortedState === 'desc'
  const isAsc = isSorted && sortedState === 'asc'

  if (isMobile) return children

  return (
    <div className="inline-block">
      <div
        className={cn(
          triggerWrapperClass,
          !column.getCanSort() && 'cursor-auto after:content-none',
        )}
        onClick={() =>
          column.getCanSort() && column.toggleSorting(isSorted ? !isDesc : true)
        }
      >
        <div className="relative z-10">{children}</div>
        <div className="flex-c relative z-10 flex-col">
          <ChevronUp
            className={cn('-mb-[5px]', isAsc && 'text-primary')}
            size={12}
          />
          <ChevronDown className={cn(isDesc && 'text-primary')} size={12} />
        </div>
      </div>
    </div>
  )
}

export type ReactTableFilterHeaderProps<T> = PropsWithChildren<{
  classNames?: {
    trigger?: string
    selectItem?: string
  }
  type?: 'select' | 'input'
  selectItems?: { label: ReactNode; value: any }[]
  inputProps?: {
    placeholder?: string
    validator?: (value: string) => boolean
  }
  column: Column<T>
  isMutiple?: boolean
}>

export function ReactTableFilterHeader<T>({
  classNames,
  type = 'select',
  selectItems,
  inputProps,
  column,
  children,
  isMutiple = false,
}: ReactTableFilterHeaderProps<T>) {
  const isMobile = useIsMobile()
  const t = useTranslations('Common')

  const [isPopoverOpen, toggleIsPopoverOpen] = useToggle(false)
  const isFiltered = column.getIsFiltered()
  const columnFilterValue = column.getFilterValue()

  const onSelect = useCallback(
    (value: any) => {
      column.setFilterValue((pre: any) => {
        if (isMutiple) {
          pre = pre || []
          pre?.includes(value)
            ? (pre = pre?.filter((item: any) => item !== value))
            : (pre = [...pre, value])
        } else {
          pre = pre === value ? undefined : value
        }
        if (!!!pre || !!!pre?.length) {
          return undefined
        }
        return pre
      })
      toggleIsPopoverOpen()
    },
    [column, isMutiple, toggleIsPopoverOpen],
  )

  const [inputValue, setInputValue] = useState('')

  useEffect(() => {
    !!columnFilterValue && setInputValue(columnFilterValue.toString())
  }, [isPopoverOpen, columnFilterValue])

  const onInputClear = () => {
    column.setFilterValue(undefined)
    setInputValue('')
    toggleIsPopoverOpen()
  }

  const onInputConfirm = useCallback(() => {
    column.setFilterValue(inputValue)
    toggleIsPopoverOpen()
  }, [column, toggleIsPopoverOpen, inputValue])

  if (isMobile) return children

  return (
    <Popover open={isPopoverOpen} onOpenChange={toggleIsPopoverOpen}>
      <PopoverTrigger
        className="w-fit"
        asChild
        onClick={e => {
          !column.getCanFilter() && e.preventDefault()
        }}
      >
        <div
          className={cn(
            triggerWrapperClass,
            !column.getCanFilter() && 'cursor-auto after:content-none',
          )}
        >
          <div className={cn('relative z-10', classNames?.trigger)}>
            {children}
          </div>
          <Filter
            className={cn('relative z-10', isFiltered && 'text-primary')}
            size={12}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="border-border-light w-fit min-w-[120px] border p-1"
        side="bottom"
        sideOffset={10}
      >
        <div className="flex max-h-[400px] w-full">
          <ScrollArea className="flex-1">
            {'select' === type && (
              <div className="flex flex-col gap-2">
                {selectItems?.map(({ label, value }, index) => {
                  const isSelected = isMutiple
                    ? (columnFilterValue as any[])?.includes(value)
                    : columnFilterValue === value

                  return (
                    <div
                      key={index}
                      className={cn(
                        'hover:bg-muted relative cursor-pointer whitespace-nowrap rounded-md px-3 py-2 pr-[26px] text-sm transition-colors',
                        isSelected && 'text-primary',
                        classNames?.selectItem,
                      )}
                      onClick={() => onSelect(value)}
                    >
                      {label}
                      {isSelected && (
                        <Check
                          className="absolute inset-y-0 right-2 my-auto"
                          size={11}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {'input' === type && (
              <div className="flex flex-col gap-2">
                <Input
                  className="bg-secondary border-none"
                  value={inputValue}
                  onChange={({ target }) => setInputValue(target.value)}
                  placeholder={inputProps?.placeholder}
                />
                <div className="flex-items-c justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={onInputClear}>
                    {t('clear')}
                  </Button>
                  <Button
                    size="sm"
                    onClick={onInputConfirm}
                    disabled={
                      !inputValue ||
                      (!!inputProps?.validator &&
                        !inputProps?.validator?.(inputValue))
                    }
                  >
                    {t('apply')}
                  </Button>
                </div>
              </div>
            )}
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  )
}
