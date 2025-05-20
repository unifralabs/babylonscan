import { publicProcedure } from '../../../procedure'
import { createTRPCRouter } from '../../../trpc'
import {
  getTransactionDetail,
  getTransactions,
} from '../../../utils/transation'
import { z } from 'zod'

import {
  addressZodType,
  internalZodType,
  TransactionTypeEnum,
} from '@cosmoscan/shared/types'

export const transactionRouter = createTRPCRouter({
  fetchInfiniteTransactions: publicProcedure
    .input(
      z.object({
        address: addressZodType.optional(),
        take: internalZodType.pagination.take,
        cursor: z
          .object({
            height_tx_index: z.object({
              height: z.bigint(),
              tx_index: z.number(),
            }),
          })
          .optional(),
        filter: z.object({
          stakingType: z.array(z.nativeEnum(TransactionTypeEnum)).optional(),
          height: z.number().optional(),
        }),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { address, take, cursor, filter } = input

      return await getTransactions(ctx.db, { address, take, cursor, filter })
    }),
  fetchTransactionDetail: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return await getTransactionDetail(ctx.db, input)
    }),
})
