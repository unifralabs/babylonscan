'use client'

import { useEffect, useMemo, useState } from 'react'

import { clientApi } from '../../trpc/react'
import { ColumnDef } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'

import type { BlockListInput, BlockListItem } from '@cosmoscan/core-api'
import { BlocksAutoRefreshStatus } from "@cosmoscan/core/components/blocks-auto-refresh-status"
import ExternalLinkRenderer from '@cosmoscan/core/components/external-link-renderer'
import { TableAgeCell } from '@cosmoscan/core/components/table-cell-renderer'
import useCursorPagination from '@cosmoscan/shared/hooks/use-cursor-pagination'
import useIsMobile from '@cosmoscan/shared/hooks/use-is-mobile'
import { BlockStatusDict, BlockStatusEnum } from '@cosmoscan/shared/types'
import { Card } from '@cosmoscan/ui/card'
import DataTable from '@cosmoscan/ui/components/data-table'
import { EditIcon } from '@cosmoscan/ui/icons/edit'
import { UserIcon } from '@cosmoscan/ui/icons/user'
import { Tooltip } from '@cosmoscan/ui/tooltip'

export default function Blocks() {
  const t = useTranslations()
  const isMobile = useIsMobile()
  const [newBlocksCount, setNewBlocksCount] = useState(0)
  const [lastBlockHeight, setLastBlockHeight] = useState<bigint | null>(null)

  const {
    cursor,
    currentPage,
    setNextCursor,
    hasPreviousPage,
    hasNextPage,
    fetchFirstPage,
    fetchPreviousPage,
    fetchNextPage,
  } = useCursorPagination<BlockListInput['cursor']>()

  const { data, isFetching } =
    clientApi.internal.block.fetchInfiniteBlocks.useQuery({
      cursor,
    }, {
      refetchInterval: 10000, // Query for new data every 10 seconds
    })

  useEffect(() => {
    setNextCursor(data?.nextCursor)
  }, [data?.nextCursor, setNextCursor])

  // Auto-refresh logic
  useEffect(() => {
    if (data?.items?.[0]?.height) {
      if (lastBlockHeight && data.items[0].height > lastBlockHeight) {
        const newBlocks = Number(data.items[0].height - lastBlockHeight)
        setNewBlocksCount(newBlocks)
        
        // Only refresh if there are more than 20 new blocks
        if (newBlocks > 20) {
          const timer = setTimeout(() => {
            fetchFirstPage()
          }, 10000)
          return () => clearTimeout(timer)
        }
      }
      setLastBlockHeight(data.items[0].height)
    }
  }, [data?.items, lastBlockHeight, fetchFirstPage])

  const blocksColumns: ColumnDef<BlockListItem>[] = useMemo(
    () => [
      {
        accessorKey: 'status',
        header: t('Common.status'),
        cell: ({ getValue, row }) => (
          <div>
            <Tooltip content={t('Block.finalityProviderTip')}>
              <div>
                {t(
                  `Common.${BlockStatusDict[getValue<BlockStatusEnum>()].toLocaleLowerCase()}`,
                )}
              </div>
            </Tooltip>
            <Tooltip content={t('Block.validatorsTip')}>
              <div className="text-foreground-secondary flex-items-c mt-1 gap-2">
                <EditIcon className="h-2.5 w-2.5" />
                <div className="text-sm">
                  {row.original.signed_validators ?? 0} /{' '}
                  {row.original.total_validators ?? 0}
                </div>
              </div>
            </Tooltip>
          </div>
        ),
      },
      {
        accessorKey: 'height',
        header: t('Block.block'),
        cell: ({ getValue }) => (
          <ExternalLinkRenderer type="block" content={getValue<bigint>()} />
        ),
      },
      {
        accessorKey: 'timestamp',
        header: t('Common.age'),
        cell: ({ getValue }) => <TableAgeCell time={getValue<bigint>()} />,
      },
      {
        accessorKey: 'num_txs',
        header: t('Common.txn'),
        cell: ({ getValue, row }) =>
          (getValue<number>() ?? 0 > 0) ? (
            <ExternalLinkRenderer
              type="transactionsByBlock"
              content={getValue<number>()}
              query={{ block: row.original.height }}
            />
          ) : (
            (getValue<number>() ?? 0)
          ),
      },
      {
        accessorKey: 'proposer_address',
        header: t('Block.proposer'),
        cell: ({ getValue, row }) => (
          <div className="flex-items-c gap-2">
            <div className="bg-border/20 text-foreground/20 hidden h-8 w-8 shrink-0 items-end justify-center overflow-hidden rounded-full md:flex">
              <UserIcon className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              {row.original.proposer_name && (
                <div className="text-sm font-medium">
                  {row.original.proposer_name}
                </div>
              )}
              <ExternalLinkRenderer
                type="validator"
                content={getValue<string>()}
                short={true}
                isCopyable
              />
            </div>
          </div>
        ),
        size: 600,
      },
    ],
    [isMobile],
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-start">
        <BlocksAutoRefreshStatus
          isFetching={isFetching}
          newBlocksCount={newBlocksCount}
        />
      </div>
      <Card className="p-gap w-full">
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
          columns={blocksColumns}
          data={data?.items}
          isLoading={isFetching}
        />
      </Card>
    </div>
  )
}
