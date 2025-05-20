import { publicProcedure } from '../../../procedure'
import { createTRPCRouter } from '../../../trpc'
import { getBlockDetail, getBlockSignatures } from '../../../utils/block'
import { getLatestBlock } from '../../../utils/stat'
import { z } from 'zod'

import { internalZodType } from '@cosmoscan/shared/types'

export const blockRouter = createTRPCRouter({
  fetchLatestBlock: publicProcedure.query(async ({ ctx }) => {
    return await getLatestBlock(ctx.db)
  }),
  fetchInfiniteBlocks: publicProcedure
    .input(
      z.object({
        take: internalZodType.pagination.take,
        cursor: z
          .object({
            height: z.bigint(),
          })
          .optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { take, cursor } = input
      const items = await ctx.db.blocks.findMany({
        take: take + 1,
        cursor,
        orderBy: {
          height: 'desc',
        },
        omit: {
          block_events: true,
          raw_json: true,
          inserted_at: true,
          updated_at: true,
        },
      })

      let nextCursor: typeof cursor | undefined = undefined
      if (items.length > take) {
        const nextItem = items.pop()
        nextCursor = { height: nextItem!.height }
      }

      // Get all proposer addresses from blocks
      const proposerAddresses = items
        .map(block => block.proposer_address)
        .filter(Boolean) as string[]

      // If there are proposer addresses, query corresponding validator info
      let validatorMap: Record<string, { name: string | null }> = {}
      if (proposerAddresses.length > 0) {
        const validators = await ctx.db.validators.findMany({
          where: {
            operator_address: {
              in: proposerAddresses,
            },
          },
          select: {
            operator_address: true,
            name: true,
          },
        })

        // Create mapping from address to validator name
        validatorMap = validators.reduce(
          (acc, validator) => {
            acc[validator.operator_address] = {
              name: validator.name,
            }
            return acc
          },
          {} as Record<string, { name: string | null }>,
        )
      }

      // Add validator names to each block
      const itemsWithValidatorNames = items.map(block => {
        const proposerAddress = block.proposer_address
        return {
          ...block,
          proposer_name: proposerAddress
            ? validatorMap[proposerAddress]?.name || null
            : null,
        }
      })

      return {
        items: itemsWithValidatorNames,
        nextCursor,
      }
    }),
  fetchBlockDetail: publicProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      return await getBlockDetail(ctx.db, input)
    }),
  fetchBlockSignatures: publicProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      return await getBlockSignatures(ctx.db, input)
    }),
})
