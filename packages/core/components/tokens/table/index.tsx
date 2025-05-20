'use client'

import { useCallback, useEffect, useState } from 'react'

import { clientApi } from '../../../trpc/react'
import { CellContext, ColumnDef, SortingState } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'

import type { TokenListInput, TokenListItem } from '@cosmoscan/core-api'
import { CONSTANT } from '@cosmoscan/shared/constants/common'
import useCursorPagination from '@cosmoscan/shared/hooks/use-cursor-pagination'
import useIsMobile from '@cosmoscan/shared/hooks/use-is-mobile'
import {
  TokenTrackerSortTypeEnum,
  TokenTrackerTypeDict,
  TokenTrackerTypeEnum,
} from '@cosmoscan/shared/types'
import { formatNumWithCommas } from '@cosmoscan/shared/utils'
import DataTable from '@cosmoscan/ui/components/data-table'
import IncreaseLabel from '@cosmoscan/ui/components/increase-label'
import PageLinkTabs from '@cosmoscan/ui/components/page-link-tabs'
import { ReactTableSortHeader } from '@cosmoscan/ui/components/react-table-components'
import Token from '@cosmoscan/ui/components/token'

export interface TokenTrackerProps {
  type?: TokenTrackerTypeEnum
  withTabs?: boolean
}

export default function TokenTrackerTable({
  type = TokenTrackerTypeEnum.TRENDING,
  withTabs = false,
}: TokenTrackerProps) {
  const t = useTranslations('Token')
  const isMobile = useIsMobile()
  const {
    cursor,
    currentPage,
    setNextCursor,
    hasPreviousPage,
    hasNextPage,
    fetchFirstPage,
    fetchPreviousPage,
    fetchNextPage,
  } = useCursorPagination<TokenListInput['cursor']>()
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: TokenTrackerSortTypeEnum.CIRCULATING_MARKET_CAP,
      desc: true,
    },
  ])

  const { data, isFetching } =
    clientApi.internal.token.fetchInfiniteTokens.useQuery({
      cursor,
      type,
      sort: sorting[0]?.id as TokenListInput['sort'],
      desc: sorting[0]?.desc,
    })

  useEffect(() => {
    setNextCursor(data?.nextCursor)
  }, [data?.nextCursor, setNextCursor])

  useEffect(() => {
    fetchFirstPage()
  }, [fetchFirstPage, type])

  const fetchTokenTrackerColumns = useCallback(
    (
      currentPage: number,
      pageSize: number = CONSTANT.tableDefaultPageSize,
    ): ColumnDef<TokenListItem>[] => [
      ...(isMobile
        ? []
        : [
            {
              accessorKey: 'id',
              header: '#',
              cell: ({ row }: CellContext<TokenListItem, unknown>) =>
                row.index + 1 + (currentPage - 1) * pageSize,
            },
          ]),
      {
        accessorKey: 'name',
        header: t('token'),
        cell: ({ row }) => (
          <Token
            name={`${row.original.name || row.original.symbol || row.original.denom || '-'}${!!row.original.name && !!row.original.symbol ? ` (${row.original.symbol})` : ''}`}
            logo={row.original.logo}
            denom={row.original.denom}
          />
        ),
        meta: { isMobileFullRow: true },
      },
      {
        accessorKey: 'price',
        header: ({ column }) => (
          <ReactTableSortHeader<TokenListItem> column={column}>
            {t('price')}
          </ReactTableSortHeader>
        ),
        cell: ({ getValue }) =>
          `$ ${formatNumWithCommas(getValue<number>() ?? 0)}`,
      },
      {
        accessorKey: 'price_change_percentage_24h',
        header: ({ column }) => (
          <ReactTableSortHeader<TokenListItem> column={column}>
            {t('change')}
          </ReactTableSortHeader>
        ),
        cell: ({ getValue }) => <IncreaseLabel value={getValue<number>()} />,
      },
      {
        accessorKey: 'volume_24h',
        header: ({ column }) => (
          <ReactTableSortHeader<TokenListItem> column={column}>
            {t('volume24H')}
          </ReactTableSortHeader>
        ),
        cell: ({ getValue }) => `$ ${formatNumWithCommas(getValue<number>())}`,
      },
      {
        accessorKey: 'circulating_market_cap',
        header: ({ column }) => (
          <ReactTableSortHeader<TokenListItem> column={column}>
            {t('circulatingMarketCap')}
          </ReactTableSortHeader>
        ),
        cell: ({ getValue }) => `$ ${formatNumWithCommas(getValue<number>())}`,
      },
      {
        accessorKey: 'holders',
        header: t('holders'),
        // header: ({ column }) => (
        //   <ReactTableSortHeader<TokenListItem> column={column}>
        //     Holders
        //   </ReactTableSortHeader>
        // ),
        cell: ({ getValue }) => formatNumWithCommas(getValue<number>()),
      },
    ],
    [t, isMobile],
  )

  return (
    <>
      {withTabs && (
        <PageLinkTabs
          queryKey="type"
          activeTab={type}
          tabs={Object.values(TokenTrackerTypeEnum).map(value => ({
            value,
            valueContent: t(TokenTrackerTypeDict[value]),
          }))}
        />
      )}

      <DataTable
        paginationProps={{
          currentPage,
          hasPreviousPage,
          hasNextPage,
          fetchFirstPage,
          fetchPreviousPage,
          fetchNextPage,
          isLoading: isFetching,
        }}
        columns={fetchTokenTrackerColumns(currentPage)}
        data={data?.items}
        sorting={sorting}
        setSorting={setSorting}
        isLoading={isFetching}
      />
    </>
  )
}
