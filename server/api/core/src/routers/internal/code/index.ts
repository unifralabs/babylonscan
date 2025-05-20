import { publicProcedure } from '../../../procedure'
import { createTRPCRouter } from '../../../trpc'
import { getCodeDetail } from '../../../utils/code'
import { z } from 'zod'

import { internalZodType } from '@cosmoscan/shared/types'

export const codeRouter = createTRPCRouter({
  fetchCodeDetail: publicProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      return await getCodeDetail(ctx.db, input)
    }),
  fetchInfiniteCodeContracts: publicProcedure
    .input(
      z.object({
        code_id: z.number(),
        take: internalZodType.pagination.take,
        cursor: z
          .object({
            creation_timestamp: z.bigint(),
          })
          .optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { code_id, take, cursor } = input
      const items = await ctx.db.contracts.findMany({
        where: {
          code_id: code_id,
        },
        take: take + 1,
        cursor,
        orderBy: {
          creation_timestamp: 'desc',
        },
        omit: {
          inserted_at: true,
          updated_at: true,
        },
      })

      let nextCursor: typeof cursor | undefined = undefined
      if (items.length > take) {
        const nextItem = items.pop()
        nextCursor = { creation_timestamp: nextItem!.creation_timestamp! }
      }

      return {
        items,
        nextCursor,
      }
    }),
})
