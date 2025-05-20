import Prisma from '@cosmoscan/core-db'
import { CONSTANT } from '@cosmoscan/shared/constants/common'
import { TransactionTypeEnum } from '@cosmoscan/shared/types'

export async function getTransactions(
  db: typeof Prisma,
  {
    address,
    take = CONSTANT.tableDefaultPageSize,
    cursor,
    filter,
    desc = true,
  }: {
    address?: string
    take: number
    cursor?: {
      height_tx_index: {
        height: bigint
        tx_index: number
      }
    }
    filter?: {
      stakingType?: TransactionTypeEnum[]
      height?: number
    }
    desc?: boolean
  },
) {
  const sort = desc ? 'desc' : 'asc'
  let addressTxns: { height: bigint; tx_hash: string; tx_index: number }[] = []

  if (!!address) {
    addressTxns = await db.transaction_addresses.findMany({
      take: take + 1,
      where: {
        address,
        height: filter?.height,
        ...(!!filter?.stakingType?.length
          ? {
              message_types: {
                hasSome: filter?.stakingType,
              },
            }
          : {}),
        ...(cursor
          ? {
              AND: [
                {
                  OR: [
                    {
                      height: {
                        [desc ? 'lt' : 'gt']: cursor.height_tx_index.height,
                      },
                    },
                    {
                      AND: [
                        { height: cursor.height_tx_index.height },
                        {
                          tx_index: {
                            [desc ? 'lt' : 'gt']:
                              cursor.height_tx_index.tx_index,
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
            }
          : {}),
      },
      select: {
        height: true,
        tx_hash: true,
        tx_index: true,
      },
      orderBy: [{ height: sort }, { tx_index: sort }],
    })
  }

  const items = await db.transactions.findMany({
    take: !!address ? undefined : take + 1,
    cursor: !!address
      ? undefined
      : cursor
        ? {
            height_tx_index: {
              height: cursor.height_tx_index.height,
              tx_index: cursor.height_tx_index.tx_index,
            },
          }
        : undefined,
    where: !!address
      ? {
          hash: {
            in: addressTxns?.map(({ tx_hash }) => tx_hash),
          },
        }
      : {
          height: filter?.height,
          ...(!!filter?.stakingType?.length
            ? {
                message_types: {
                  hasSome: filter?.stakingType,
                },
              }
            : {}),
        },
    orderBy: [{ height: sort }, { tx_index: sort }],
    omit: {
      messages: true,
      signatures: true,
      event_logs: true,
      raw_json: true,
      inserted_at: true,
      updated_at: true,
    },
  })

  let nextCursor: typeof cursor | undefined = undefined
  if (items.length > take) {
    const nextItem = items.pop()
    nextCursor = {
      height_tx_index: {
        height: nextItem!.height,
        tx_index: nextItem!.tx_index ?? 0n,
      },
    }
  }

  return {
    items: items.map(item => ({
      ...item,
      tx_fee: (item?.tx_fee as any)?.[0]?.amount ?? 0,
    })),
    nextCursor,
  }
}

export async function getTransactionDetail(db: typeof Prisma, hash: string) {
  const data = await db.transactions.findUnique({
    where: {
      hash,
    },
    omit: {
      raw_json: true,
      inserted_at: true,
      updated_at: true,
    },
  })

  return !!data
    ? {
        ...data,
        tx_fee: (data?.tx_fee as any)?.[0]?.amount ?? 0,
        messages: (data.messages || []) as Record<string, string | object>[],
      }
    : null
}
