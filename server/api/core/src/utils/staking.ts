import { z } from 'zod'

import Prisma, { PrismaType } from '@cosmoscan/core-db'
import { CONSTANT } from '@cosmoscan/shared/constants/common'
import {
    internalZodType,
    StakingTransactionStakingStatusEnum,
} from '@cosmoscan/shared/types'

export const FetchStakingDelegationsQueryZodType = z.object({
  take: internalZodType.pagination.take,
  cursor: z
    .object({
      staking_block_height_staking_output_idx: z.object({
        staking_block_height: z.bigint(),
        staking_output_idx: z.bigint(),
      }),
    })
    .optional(),
  filter: z
    .object({
      stakingStatus: z
        .array(z.nativeEnum(StakingTransactionStakingStatusEnum))
        .optional(),
    })
    .optional(),
  desc: z.boolean().optional().default(true),
})

export async function getStakingDelegations(
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
      staking_block_height_staking_output_idx: {
        staking_block_height: bigint
        staking_output_idx: bigint
      }
    }
    filter?: {
      stakingStatus?: StakingTransactionStakingStatusEnum[]
    }
    desc?: boolean
  },
) {
  const sort = desc ? 'desc' : 'asc'

  const data = await db.finality_providers_delegations.findMany({
    take: take + 1,
    where: {
      babylon_address: address,
      status_desc: {
        in: !!filter?.stakingStatus?.length ? filter?.stakingStatus : undefined,
      },
      ...(cursor
        ? {
            AND: [
              {
                OR: [
                  {
                    staking_block_height:
                      cursor.staking_block_height_staking_output_idx
                        .staking_block_height,
                    staking_output_idx: {
                      [desc ? 'lt' : 'gt']:
                        cursor.staking_block_height_staking_output_idx
                          .staking_output_idx,
                    },
                  },
                  {
                    staking_block_height: {
                      [desc ? 'lt' : 'gt']:
                        cursor.staking_block_height_staking_output_idx
                          .staking_block_height,
                    },
                  },
                ],
              },
            ],
          }
        : {}),
    },
    orderBy: [{ staking_block_height: sort }, { staking_output_idx: sort }],
    omit: {
      unbonding_covenant_sig: true,
      unbonding_slashing_covenant_sig: true,
      inserted_at: true,
      updated_at: true,
    },
  })

  let nextCursor: typeof cursor | undefined = undefined
  if (data.length > take) {
    const nextItem = data.pop()
    nextCursor = {
      staking_block_height_staking_output_idx: {
        staking_block_height: nextItem!.staking_block_height,
        staking_output_idx: nextItem!.staking_output_idx,
      },
    }
  }

  const items = await formatFPDelegations(db, data)

  return { items, nextCursor }
}

export async function formatFPDelegations(
  db: typeof Prisma,
  data: Partial<
    Awaited<
      ReturnType<typeof Prisma.finality_providers_delegations.findMany>
    >[number]
  >[],
) {
  const providersAddresses =
    data?.map(item => item.fp_btc_pk_list)?.flat() || []

  const providers = await db.finality_providers.findMany({
    where: {
      btc_pk: {
        in: providersAddresses as string[],
      },
    },
    select: {
      btc_pk: true,
      name: true,
      status: true,
    },
  })

  return data?.map(item => ({
    ...item,
    finality_providers: item.fp_btc_pk_list
      ?.map(finality_provider =>
        providers.find(provider => provider.btc_pk === finality_provider),
      )
      ?.filter(Boolean),
  }))
}

export async function getFPUptimePercentByBTCBk(
  db: typeof Prisma,
  btc_pk?: string,
) {
  const data = (
    await db.$queryRaw<
      [
        {
          btc_pk: string
          signed_block_count: number
          total_block_count: number
          uptime_percentage: number
        },
      ]
    >(PrismaType.sql`
        SELECT btc_pk, uptime_percentage
        FROM mv_finality_provider_uptime
        WHERE btc_pk = ${btc_pk}`)
  )?.[0]

  return {
    uptime: Number(data?.uptime_percentage ?? 0),
    missedBlocks:
      Number(data?.total_block_count ?? 0) -
      Number(data?.signed_block_count ?? 0),
  }
}

export async function getFPsUptimePercentByBTCBks(
  db: typeof Prisma,
  btc_pks?: string[],
) {
  if (!btc_pks || btc_pks.length === 0) {
    return []
  }

  return (
    await db.$queryRaw<
      [
        {
          btc_pk: string
          signed_block_count: number
          total_block_count: number
          uptime_percentage: number
        },
      ]
    >(
      PrismaType.sql`
        SELECT btc_pk, uptime_percentage
        FROM mv_finality_provider_uptime
        WHERE btc_pk IN (${PrismaType.join(btc_pks)})`,
    )
  )?.map(item => ({
    ...item,
    uptime: Number(item?.uptime_percentage ?? 0),
    missedBlocks:
      Number(item?.total_block_count ?? 0) -
      Number(item?.signed_block_count ?? 0),
  }))
}
