import { getFPUptimePercentByBTCBk } from './staking'
import dayjs from 'dayjs'

import Prisma from '@cosmoscan/core-db'
import { CONSTANT } from '@cosmoscan/shared/constants/common'
import { FinalityProvidersSortTypeEnum } from '@cosmoscan/shared/types'

export async function getFinalityProviders(
  db: typeof Prisma,
  {
    take = CONSTANT.tableDefaultPageSize,
    skip = 0,
    sort = FinalityProvidersSortTypeEnum.TOTAL_DELEGATIONS,
    desc = true,
    where = {},
    orderBy = [],
  }: {
    take: number
    skip?: number
    sort?: FinalityProvidersSortTypeEnum
    desc?: boolean
    where?: any
    orderBy?: any[]
  },
) {
  const items = await db.finality_providers.findMany({
    take: take + 1,
    skip,
    where,
    orderBy:
      orderBy.length > 0
        ? orderBy
        : [{ [sort]: desc ? 'desc' : 'asc' }, { id: 'asc' }],
    omit: {
      master_pub_rand: true,
      inserted_at: true,
      updated_at: true,
    },
  })

  let nextCursor: { take: number; skip: number } | undefined = undefined
  if (items.length > take) {
    items.pop()
    nextCursor = { take, skip: skip + take }
  }

  return { items, nextCursor }
}

export async function getFinalityProviderDetail(
  db: typeof Prisma,
  finalityProviderBTCPk: string,
) {
  const [data, uptime] = await Promise.all([
    db.finality_providers.findUnique({
      where: {
        btc_pk: finalityProviderBTCPk,
      },
      omit: {
        master_pub_rand: true,
        inserted_at: true,
        updated_at: true,
      },
    }),
    getFPUptimePercentByBTCBk(db, finalityProviderBTCPk),
  ])
  return { ...data, uptime }
}

export async function getTotalFinalityProvidersVotingPowerAndBonded(
  db: typeof Prisma,
) {
  const { _sum } = await db.finality_providers.aggregate({
    _sum: {
      voting_power: true,
      self_bonded: true,
    },
  })

  return {
    totalVotingPower: Number(_sum.voting_power ?? 0),
    totalBonded: Number(_sum.self_bonded ?? 0),
  }
}

export async function getStakingTransactionsIntervalDays(
  db: typeof Prisma,
  { intervalDays, address }: { intervalDays?: number; address?: string },
) {
  const { _min } = await db.staking_transactions.aggregate({
    _min: {
      timestamp: true,
    },
    where: !!address
      ? {
          finality_providers: address.toLowerCase(),
        }
      : undefined,
  })
  const maxIntervalDays = dayjs().diff(Number(_min.timestamp) * 1000, 'day') + 1

  return !!intervalDays
    ? intervalDays > maxIntervalDays
      ? maxIntervalDays
      : intervalDays
    : maxIntervalDays
}