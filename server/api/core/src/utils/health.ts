import { TRPCError } from '@trpc/server'

import Prisma from '@cosmoscan/core-db'
import { CURRENT_CHAIN } from '@cosmoscan/shared/constants/chain'

export async function checkHealth(db: typeof Prisma, lag: number) {
  try {
    const maxBlockHeightLag = lag

    // Fetch the latest block height from the blockchain node
    const response = await fetch(
      CURRENT_CHAIN.cosmosChainInfo.chain.apis?.rpc?.[0].address + '/status',
    )
    const data = await response.json()
    const latestBlockHeight = Number(
      parseInt(data?.result?.sync_info?.latest_block_height ?? '0', 10),
    )

    const dbHeight = await db.blocks.findFirst({
      orderBy: {
        height: 'desc',
      },
      select: {
        height: true,
      },
    })

    if (!!!dbHeight?.height)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Please try again later.',
      })

    const latestBlockHeightFromDB = Number(dbHeight.height)

    console.log('check health blockHeight', {
      latestBlockHeight,
      latestBlockHeightFromDB,
      maxBlockHeightLag,
    })

    // Check if the latest block height from blocks table is lagging behind
    const blockLagBehind = Number(latestBlockHeight - latestBlockHeightFromDB)
    if (blockLagBehind > maxBlockHeightLag) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Database lagging behind ${blockLagBehind} blocks in blocks table`,
        cause: {
          latestBlockHeight,
          latestBlockHeightFromDB,
        },
      })
    }

    return {
      latestBlockHeight: Number(latestBlockHeight ?? 0),
      latestBlockHeightFromDB: Number(latestBlockHeightFromDB ?? 0),
    }
  } catch (error: any) {
    console.error('check health', error)
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: error?.message || 'Internal server error',
    })
  }
}
