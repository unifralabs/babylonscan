import { publicProcedure } from '../../../procedure'
import { createTRPCRouter } from '../../../trpc'
import { z } from 'zod'

import { CONSTANT } from '@cosmoscan/shared/constants/common'
import { paginationZodType } from '@cosmoscan/shared/types'

export const utilRouter = createTRPCRouter({
  fetchInfiniteConsumerChains: publicProcedure
    .input(
      z.object({
        cursor: paginationZodType,
        desc: z.boolean().optional().default(true),
      }),
    )
    .query(async ({ ctx, input }) => {
      const {
        cursor = { take: CONSTANT.tableDefaultPageSize, skip: 0 },
        desc,
      } = input
      const { take, skip } = cursor

      const items = await ctx.db.zc_chains.findMany({
        take: take + 1,
        skip,
        orderBy: {
          id: desc ? 'desc' : 'asc',
        },
        omit: {
          inserted_at: true,
          updated_at: true,
        },
      })

      let nextCursor: typeof cursor | undefined = undefined
      if (items.length > take) {
        items.pop()
        nextCursor = { take, skip: skip + take }
      }

      return {
        items,
        nextCursor,
      }
    }),
})
