'use client'

import { useEffect, useMemo } from 'react'

import { clientApi } from '../../../trpc/react'
import ExternalLinkRenderer from '../../external-link-renderer'
import { ColumnDef } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'

import type {
  ValidatorDelegatorsListInput,
  ValidatorDelegatorsListItem,
} from '@cosmoscan/core-api'
import useCursorPagination from '@cosmoscan/shared/hooks/use-cursor-pagination'
import { AmountLabel } from '@cosmoscan/ui/components/amount-label'
import DataTable from '@cosmoscan/ui/components/data-table'

export interface ValidatorDelegatorsProps {
  address: string
}

export default function ValidatorDelegatorsTable({
  address,
}: ValidatorDelegatorsProps) {
  const t = useTranslations('Validator')

  const {
    cursor,
    currentPage,
    setNextCursor,
    hasPreviousPage,
    hasNextPage,
    fetchFirstPage,
    fetchPreviousPage,
    fetchNextPage,
  } = useCursorPagination<ValidatorDelegatorsListInput['cursor']>()

  const { data, isFetching } =
    clientApi.internal.validator.fetchValidatorDelegators.useQuery({
      cursor,
      address,
    })

  useEffect(() => {
    setNextCursor(data?.nextCursor)
  }, [data?.nextCursor, setNextCursor])

  const ValidatorDelegatorsTableColumns: ColumnDef<ValidatorDelegatorsListItem>[] =
    useMemo(
      () => [
        {
          accessorKey: 'delegator',
          header: t('delegator'),
          cell: ({ getValue }) => (
            <ExternalLinkRenderer
              type="address"
              content={getValue<string>()}
              short={false}
            />
          ),
        },
        {
          accessorKey: 'amount',
          header: t('amount'),
          cell: ({ getValue }) => (
            <AmountLabel
              amount={BigInt(Number(getValue<number>() ?? 0))}
              isChainNativeToken
            />
          ),
          meta: { textAlign: 'right' },
        },
      ],
      [t],
    )

  return (
    <DataTable
      paginationProps={{
        currentPage,
        hasPreviousPage,
        hasNextPage,
        fetchFirstPage,
        fetchPreviousPage,
        fetchNextPage,
        isLoading: isFetching,
        hideSinglePage: true,
      }}
      columns={ValidatorDelegatorsTableColumns}
      data={data?.items}
      isLoading={isFetching}
      autoEmptyCellHeight={false}
    />
  )
}
